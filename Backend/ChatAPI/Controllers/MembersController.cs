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
        [HttpGet]
        public async Task<IActionResult> GetMembers(int roomId)
        {
            var members = await memberService.GetRoomMembers(roomId, GetUserId());
            return Ok(members);
        }

        [HttpPost]
        public async Task<IActionResult> AddMember(int roomId, MemberRequest request)
        {
            await memberService.AddMember(roomId, GetUserId(), request.Username);
            return NoContent();
        }

        [HttpDelete("{targetUserId}")]
        public async Task<IActionResult> RemoveMember(int roomId, int targetUserId)
        {
            await memberService.RemoveMember(roomId, GetUserId(), targetUserId);
            return NoContent();
        }
    }
}
