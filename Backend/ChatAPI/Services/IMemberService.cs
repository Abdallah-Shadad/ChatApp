namespace ChatAPI.Services
{
    public interface IMemberService
    {
        Task AddMember(int roomId, int requesterId, int targetUserId);
        Task RemoveMember(int roomId, int requesterId, int targetUserId);
    }
}
