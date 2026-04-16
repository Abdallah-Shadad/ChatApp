namespace ChatAPI.Models
{
    public class Message
    {
        public int Id { get; set; } // Cursor for pagination
        public string Content { get; set; } = string.Empty;
        public int SenderId { get; set; }
        public int RoomId { get; set; }
        public DateTime SentAt { get; set; } = DateTime.UtcNow;

        // Navigation properties
        public User Sender { get; set; } = null!;
        public Room Room { get; set; } = null!;
        public ICollection<MessageStatus> Statuses { get; set; } = new List<MessageStatus>();
    }
}
