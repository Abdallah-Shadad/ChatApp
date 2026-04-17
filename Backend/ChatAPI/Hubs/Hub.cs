using AutoMapper;
using ChatAPI.Data;
using ChatAPI.DTOs;
using ChatAPI.Enums;
using ChatAPI.Models;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace ChatAPI.Hubs
{
    public class ChatHub : Hub
    {
        private readonly AppDbContext _context;
        private readonly IMapper _mapper;

        public ChatHub(AppDbContext context, IMapper mapper)
        {
            _context = context;
            _mapper = mapper;
        }

        public override async Task OnConnectedAsync()
        {
            // Extract User ID
            if (!int.TryParse(Context.UserIdentifier, out int userId)) return;

            // Re-Join User In All Their Active Rooms
            var roomIds = await _context.RoomMembers
                .Where(rm => rm.UserId == userId)
                .Select(rm => rm.RoomId)
                .ToListAsync();

            foreach (var roomId in roomIds)
            {
                await Groups.AddToGroupAsync(Context.ConnectionId, roomId.ToString());
            }

            // Fetch and send all Undelivered Messages
            var pendingStatuses = await _context.MessageStatuses
                .Include(ms => ms.Message)
                    .ThenInclude(m => m.Sender)
                .Where(ms => ms.UserId == userId && ms.Status == MessageStatusEnum.Sent)
                .ToListAsync();

            if (pendingStatuses.Any())
            {
                var messagesToPush = pendingStatuses.Select(ms => _mapper.Map<MessageDto>(ms.Message)).ToList();

                await Clients.Caller.SendAsync("ReceiveUndeliveredMessages", messagesToPush);

                // Update Message Status to Delivered
                foreach (var status in pendingStatuses)
                {
                    status.Status = MessageStatusEnum.Delivered;
                }

                await _context.SaveChangesAsync();
            }
        }

        public async Task SendMessage(int roomId, string content)
        {
            // Get userId from token
            if (!int.TryParse(Context.UserIdentifier, out int userId)) return;

            // Check if user is actually a member of the room
            var isMember = await _context.RoomMembers
                .AnyAsync(rm => rm.RoomId == roomId && rm.UserId == userId);

            if (!isMember) return; // Prevent unauthorized broadcasting

            // Save message to DB
            var newMessage = new Message
            {
                Content = content,
                RoomId = roomId,
                SenderId = userId,
                SentAt = DateTime.UtcNow
            };

            _context.Messages.Add(newMessage);

            // Create delivery statuses for all members in the room
            var roomMemberIds = await _context.RoomMembers
                .Where(rm => rm.RoomId == roomId)
                .Select(rm => rm.UserId)
                .ToListAsync();

            var statuses = roomMemberIds.Select(memberId => new MessageStatus
            {
                Message = newMessage,
                UserId = memberId,
                Status = (memberId == userId) ? MessageStatusEnum.Delivered : MessageStatusEnum.Sent
            }).ToList();

            _context.MessageStatuses.AddRange(statuses);
            await _context.SaveChangesAsync();

            // FIx : Extract username from JWT claims instead of querying the DB
            var username = Context.User?.Claims.FirstOrDefault(c => c.Type == ClaimTypes.Name)?.Value ?? "Unknown";

            var messageDto = new MessageDto
            {
                Id = newMessage.Id,
                Content = newMessage.Content,
                SentAt = newMessage.SentAt,
                RoomId = newMessage.RoomId,
                SenderId = userId,
                SenderName = username
            };

            // Broadcast to the group
            await Clients.Group(roomId.ToString()).SendAsync("ReceiveMessage", messageDto);
        }

        // Notify others in the group that a user has started typing
        public async Task StartTyping(int roomId, bool isTyping)
        {
            // FIx : Extract from JWT token, zero DB queries needed
            var username = Context.User?.Claims.FirstOrDefault(c => c.Type == ClaimTypes.Name)?.Value;
            if (string.IsNullOrEmpty(username)) return;

            // Send to all except the sender
            await Clients.OthersInGroup(roomId.ToString())
                .SendAsync("UserTyping", new { roomId, username, isTyping });
        }

        // Notify others in the group that a user has stopped typing
        public async Task StopTyping(int roomId)
        {
            // Fix: Extract from JWT token, zero DB queries needed
            var username = Context.User?.Claims.FirstOrDefault(c => c.Type == ClaimTypes.Name)?.Value;
            if (string.IsNullOrEmpty(username)) return;

            await Clients.OthersInGroup(roomId.ToString())
                .SendAsync("UserTyping", new { roomId, username, isTyping = false });
        }

        // Mark message as read by the user
        public async Task MarkAsRead(int roomId)
        {
            if (!int.TryParse(Context.UserIdentifier, out int userId)) return;

            // single query to fetch all unread message statuses for this user in the specified room
            var unreadQuery = _context.MessageStatuses
                 .Where(ms => ms.UserId == userId && ms.Message.RoomId == roomId && ms.Status != MessageStatusEnum.Read);

            // Get the IDs
            var messageIds = await unreadQuery.Select(ms => ms.MessageId).ToListAsync();

            if (messageIds.Any())
            {
                // (Single SQL Query optimization)
                await unreadQuery.ExecuteUpdateAsync(s => s
                    .SetProperty(ms => ms.Status, MessageStatusEnum.Read)
                    .SetProperty(ms => ms.ReadAt, DateTime.UtcNow)
                );

                await Clients.Group(roomId.ToString()).SendAsync("MessagesRead", new { roomId, messageIds, userId });
            }
        }

        // Handle user disconnection
        public override async Task OnDisconnectedAsync(Exception? exception)
        {
            // *** SignalR automatically removes the ConnectionId from all groups upon disconnect ***
            await base.OnDisconnectedAsync(exception);
        }
    }
}