using ChatAPI.DTOs;

namespace ChatAPI.Services
{
    public interface IRoomService
    {
        Task<RoomResponse> CreateRoom(int userId, RoomRequest dto);
        Task<List<RoomResponse>> GetUserRooms(int userId);
        Task DeleteRoom(int roomId, int userId);
    }
}
