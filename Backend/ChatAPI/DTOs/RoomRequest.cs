using System.ComponentModel.DataAnnotations;

namespace ChatAPI.DTOs
{
    public class RoomRequest
    {
        [Required(ErrorMessage = "Room name is required.")]
        [MaxLength(150, ErrorMessage = "Room name cannot exceed 150 characters.")]
        public string Name { get; set; } = string.Empty;
    }
}