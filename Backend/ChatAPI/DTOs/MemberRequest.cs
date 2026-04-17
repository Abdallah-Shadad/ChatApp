using System.ComponentModel.DataAnnotations;

namespace ChatAPI.DTOs
{
    public class MemberRequest
    {
        [Required(ErrorMessage = "Username is required.")]
        public string Username { get; set; } = string.Empty;
    }
}
