using ChatAPI.DTOs;
using ChatAPI.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace ChatAPI.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/rooms/{roomId}/members")]
    public class MembersController(IMemberService memberService) : BaseController
    {
        [HttpPost]
        public async Task<IActionResult> AddMember(int roomId, MemberRequest dto)
        {
            await memberService.AddMember(roomId, UserId, dto.UserId);
            return Ok(new { message = "Member added successfully" });
        }

        [HttpDelete("{targetUserId}")]
        public async Task<IActionResult> RemoveMember(int roomId, int targetUserId)
        {
            await memberService.RemoveMember(roomId, UserId, targetUserId);
            return Ok(new { message = "Member removed successfully" });
        }
    }
}
