using AutoMapper;
using ChatAPI.Data;
using ChatAPI.DTOs;
using ChatAPI.Enums;
using ChatAPI.Models;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using System.Runtime.Intrinsics.Arm;
using System.Security.Claims;
using static Microsoft.EntityFrameworkCore.DbLoggerCategory;

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

            // Re-Join User In All His Rooms

            var roomIds = await _context.RoomMembers
                .Where(rm => rm.UserId == userId)
                .Select(rm => rm.RoomId)
                .ToListAsync();

            foreach (var roomId in roomIds)
            {
                await Groups.AddToGroupAsync(Context.ConnectionId, roomId.ToString());
            }


            // Send all Undelevired Messages

            var pendingStatuses = await _context.MessageStatuses
                .Include(ms => ms.Message)
                    .ThenInclude(m => m.Sender)
                .Where(ms => ms.UserId == userId && ms.Status == MessageStatusEnum.Sent)
                .ToListAsync();

            if (pendingStatuses.Any())
            {
                var messagesToPush = pendingStatuses.Select(ms => _mapper.Map<MessageDto>(ms.Message)).ToList();

                await Clients.Caller.SendAsync("ReceiveUndeliveredMessages", messagesToPush);

                // Updat Message Status to Delivered
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

            // Check if user is a member of the room
            var isMember = await _context.RoomMembers
                .AnyAsync(rm => rm.RoomId == roomId && rm.UserId == userId);

            if (!isMember) return;

            //Save message to memory and DB
            var newMessage = new Message
            {
                Content = content,
                RoomId = roomId,
                SenderId = userId,
                SentAt = DateTime.UtcNow
            };


            //Broadcast to group
            var roomMembers = await _context.RoomMembers
                .Where(rm => rm.RoomId == roomId)
                .ToListAsync();

            var statuses = roomMembers.Select(rm => new MessageStatus
            {
                Message = newMessage,
                UserId = rm.UserId,
                Status = (rm.UserId == userId) ? MessageStatusEnum.Delivered : MessageStatusEnum.Sent
            }).ToList();

            _context.Messages.Add(newMessage);
            _context.MessageStatuses.AddRange(statuses);
            await _context.SaveChangesAsync();

            var messageWithSender = await _context.Messages
                .Include(m => m.Sender)
                .FirstOrDefaultAsync(m => m.Id == newMessage.Id);

            var messageDto = _mapper.Map<MessageDto>(messageWithSender);

            await Clients.Group(roomId.ToString()).SendAsync("ReceiveMessage", messageDto);
        }


        // Notify others in the group that a user has started typing
        public async Task StartTyping(int roomId, bool isTyping)
        {
            var username = Context.User?.Claims.FirstOrDefault(c => c.Type == ClaimTypes.Name)?.Value;
            if (string.IsNullOrEmpty(username)) return;

            await Clients.OthersInGroup(roomId.ToString())
                .SendAsync("UserTyping", new { roomId, username, isTyping });
        }
        // Notify others in the group that a user has stopped typing
        public async Task StopTyping(int roomId)
        {
            var username = Context.User?.Claims.FirstOrDefault(c => c.Type == ClaimTypes.Name)?.Value;
            if (string.IsNullOrEmpty(username)) return;

            await Clients.OthersInGroup(roomId.ToString())
                .SendAsync("UserTyping", new { roomId, username, isTyping = false });
        }

        // Mark message as read by the user
        public async Task MarkAsRead(int roomId)
        {

            if (!int.TryParse(Context.UserIdentifier, out int userId)) return;
            var isMember = await _context.RoomMembers
                .AnyAsync(rm => rm.RoomId == roomId && rm.UserId == userId);

            var unreadQuery = _context.MessageStatuses
                 .Where(
                    ms => ms.UserId == userId && ms.Message.RoomId == roomId
                    && ms.Status != MessageStatusEnum.Read
                 );

            // GEt the  IDs
            var messageIds = await unreadQuery.Select(ms => ms.MessageId).ToListAsync();

            if (messageIds.Any())
            {
                //foreach (var status in unreadStatuses)
                //{
                //    status.Status = MessageStatusEnum.Read;
                //    status.ReadAt = DateTime.UtcNow;
                //}
                //await _context.SaveChangesAsync();

                // (Single SQL Query)
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
            // SignalR automatically removes ConnectionId from groups ** all of entered groups **
            await base.OnDisconnectedAsync(exception);
        }

    }
}
