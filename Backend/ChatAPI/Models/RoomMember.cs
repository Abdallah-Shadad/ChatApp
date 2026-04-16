using ChatAPI.Enums;

namespace ChatAPI.Models
{
    public class RoomMember
    {
        public int UserId { get; set; }
        public int RoomId { get; set; }
        public UserRole Role { get; set; } = UserRole.Member;
        public DateTime JoinedAt { get; set; } = DateTime.UtcNow;

        // Navigation properties
        public User User { get; set; } = null!;
        public Room Room { get; set; } = null!;
    }
}
