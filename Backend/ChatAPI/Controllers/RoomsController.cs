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
    [Route("api/rooms")]
    public class RoomsController(IRoomService roomService) : BaseController
    {
        [HttpPost]
        public async Task<ActionResult<RoomResponse>> CreateRoom(RoomRequest dto)
        {
            var room = await roomService.CreateRoom(UserId, dto);
            return CreatedAtAction(nameof(GetMyRooms), new { id = room.Id }, room);
        }

        [HttpGet]
        public async Task<ActionResult<List<RoomResponse>>> GetMyRooms()
        {
            var rooms = await roomService.GetUserRooms(UserId);
            return Ok(rooms);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteRoom(int id)
        {
            await roomService.DeleteRoom(id, UserId);
            return NoContent();
        }
    }
}
