using ChatAPI.Data;
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

        public async Task AddMember(int roomId, int requesterId, int targetUserId)
        {
            var room = await _context.Rooms.FirstOrDefaultAsync(r => r.Id == roomId);
            if (room == null) throw new NotFoundException("Room not found.");

            // Only owner can add members
            if (room.CreatedByUserId != requesterId)
                throw new ForbiddenException("Only the owner can add members to this room.");

            var isAlreadyMember = await _context.RoomMembers
                .AnyAsync(rm => rm.RoomId == roomId && rm.UserId == targetUserId);

            if (isAlreadyMember) return;

            _context.RoomMembers.Add(new RoomMember { RoomId = roomId, UserId = targetUserId, Role = UserRole.Member });
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
    }
}
