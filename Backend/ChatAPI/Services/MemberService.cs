using ChatAPI.Data;
using ChatAPI.DTOs;
using ChatAPI.Enums;
using ChatAPI.Exceptions;
using ChatAPI.Models;
using Microsoft.EntityFrameworkCore;

namespace ChatAPI.Services
{
    public class MemberService : IMemberService
    {
        private readonly AppDbContext _context;
        public MemberService(AppDbContext context)
        {
            _context = context;
        }

        public async Task AddMember(int roomId, int requesterId, string targetUsername)
        {
            var room = await _context.Rooms.FirstOrDefaultAsync(r => r.Id == roomId);
            if (room == null) throw new NotFoundException("Room not found.");

            // Only the owner can add members
            if (room.CreatedByUserId != requesterId)
                throw new ForbiddenException("Only the room owner can add members.");

            // Look up the target user by Username
            var targetUser = await _context.Users.FirstOrDefaultAsync(u => u.Username == targetUsername);
            if (targetUser == null) throw new NotFoundException("User not found.");

            var isAlreadyMember = await _context.RoomMembers
                .AnyAsync(rm => rm.RoomId == roomId && rm.UserId == targetUser.Id);

            if (isAlreadyMember)
                throw new ConflictException("User is already a member of this room.");

            var membership = new RoomMember
            {
                RoomId = roomId,
                UserId = targetUser.Id,
                Role = UserRole.Member,
                JoinedAt = DateTime.UtcNow
            };

            _context.RoomMembers.Add(membership);
            await _context.SaveChangesAsync();
        }

        public async Task RemoveMember(int roomId, int requesterId, int targetUserId)
        {
            var room = await _context.Rooms.FirstOrDefaultAsync(r => r.Id == roomId);
            if (room == null) throw new NotFoundException("Room not found.");

            // FIX: Prevent the owner from leaving the room. 
            // If the owner wants to leave, they must delete the entire room.
            if (room.CreatedByUserId == targetUserId && requesterId == targetUserId)
                throw new BadRequestException("The owner cannot leave the room. You must delete the room instead.");

            // Permissions: The Owner can remove anyone; a Member can remove themselves.
            bool canRemove = (room.CreatedByUserId == requesterId) || (requesterId == targetUserId);

            if (!canRemove)
                throw new ForbiddenException("You don't have permission to remove this member.");

            var membership = await _context.RoomMembers
                .FirstOrDefaultAsync(rm => rm.RoomId == roomId && rm.UserId == targetUserId);

            if (membership == null)
                throw new NotFoundException("Target user is not a member of this room.");

            _context.RoomMembers.Remove(membership);
            await _context.SaveChangesAsync();
        }
        public async Task<IEnumerable<MemberResponse>> GetRoomMembers(int roomId, int requesterId)
        {
            var isMember = await _context.RoomMembers
                .AnyAsync(rm => rm.RoomId == roomId && rm.UserId == requesterId);

            if (!isMember) throw new ForbiddenException("You are not a member of this room.");

            var members = await _context.RoomMembers
                .Include(rm => rm.User)
                .Where(rm => rm.RoomId == roomId)
                .Select(rm => new MemberResponse
                {
                    UserId = rm.UserId,
                    Username = rm.User.Username,
                    Role = rm.Role.ToString()
                })
                .ToListAsync();

            return members;
        }
    }
}
