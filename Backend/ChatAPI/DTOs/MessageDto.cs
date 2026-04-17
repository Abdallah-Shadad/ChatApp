namespace ChatAPI.DTOs
{
    public class MessageDto
    {
        public int Id { get; set; }
        public string Content { get; set; } = string.Empty;
        public DateTime SentAt { get; set; }

        // Sender Data
        public int SenderId { get; set; }
        public string SenderName { get; set; } = string.Empty;

        // Room Number
        public int RoomId { get; set; }
    }
}
