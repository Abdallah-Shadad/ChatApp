using AutoMapper;
using ChatAPI.Data;
using ChatAPI.DTOs;
using ChatAPI.Enums;
using ChatAPI.Exceptions;
using ChatAPI.Models;
using Microsoft.EntityFrameworkCore;

namespace ChatAPI.Services
{
    public class RoomService : IRoomService
    {
        private readonly AppDbContext _context;
        private readonly IMapper _mapper;

        public RoomService(AppDbContext context, IMapper mapper)
        {
            _context = context;
            _mapper = mapper;
        }

        public async Task<RoomResponse> CreateRoom(int userId, RoomRequest dto)
        {
            var room = new Room
            {
                Name = dto.Name,
                CreatedByUserId = userId,
                CreatedAt = DateTime.UtcNow,
                IsDeleted = false
            };

            room.Members.Add(new RoomMember { UserId = userId, Role = UserRole.Owner });

            _context.Rooms.Add(room);
            await _context.SaveChangesAsync();

            var savedRoom = await _context.Rooms
                .Include(r => r.CreatedByUser)
                .FirstAsync(r => r.Id == room.Id);

            return _mapper.Map<RoomResponse>(savedRoom);
        }

        public async Task<List<RoomResponse>> GetUserRooms(int userId)
        {
            var rooms = await _context.RoomMembers
                .Where(rm => rm.UserId == userId && !rm.Room.IsDeleted)
                .Include(rm => rm.Room)
                    .ThenInclude(r => r.CreatedByUser)
                .Select(rm => rm.Room)
                .ToListAsync();

            return _mapper.Map<List<RoomResponse>>(rooms);
        }

        public async Task DeleteRoom(int roomId, int userId)
        {
            var room = await _context.Rooms.FirstOrDefaultAsync(r => r.Id == roomId);

            if (room == null)
                throw new NotFoundException("Room not found.");

            // Check ownership
            if (room.CreatedByUserId != userId)
                throw new ForbiddenException("Only the owner can delete this room.");

            room.IsDeleted = true;
            await _context.SaveChangesAsync();
        }
    }
}
