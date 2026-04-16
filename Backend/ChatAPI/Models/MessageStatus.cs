using ChatAPI.Enums;

namespace ChatAPI.Models
{
    public class MessageStatus
    {
        public int MessageId { get; set; }
        public int UserId { get; set; }
        public MessageStatusEnum Status { get; set; } = MessageStatusEnum.Sent;
        public DateTime? DeliveredAt { get; set; }
        public DateTime? ReadAt { get; set; }

        // Navigation properties
        public Message Message { get; set; } = null!;
        public User User { get; set; } = null!;
    }
}
