namespace ChatAPI.Models
{
    public class User
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Username { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string PasswordHash { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Navigation properties
        public ICollection<RoomMember> RoomMemberships { get; set; } = new List<RoomMember>();
        public ICollection<Message> SentMessages { get; set; } = new List<Message>();
    }
}
