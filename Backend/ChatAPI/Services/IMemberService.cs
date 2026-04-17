using ChatAPI.DTOs;

namespace ChatAPI.Services
{
    public interface IMemberService
    {
        Task AddMember(int roomId, int requesterId, string targetUsername);
        Task RemoveMember(int roomId, int requesterId, int targetUserId);
        Task<IEnumerable<MemberResponse>> GetRoomMembers(int roomId, int requesterId);
    }
}
