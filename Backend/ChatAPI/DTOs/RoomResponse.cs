namespace ChatAPI.DTOs
{
    public class RoomResponse
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public string CreatedByUsername { get; set; } = string.Empty;
    }
}
