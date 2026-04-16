namespace ChatAPI.Models
{
    public class Room
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public int CreatedByUserId { get; set; }
        public bool IsDeleted { get; set; } = false;

        // Navigation properties
        public User CreatedByUser { get; set; } = null!;
        public ICollection<RoomMember> Members { get; set; } = new List<RoomMember>();
        public ICollection<Message> Messages { get; set; } = new List<Message>();
    }
}
