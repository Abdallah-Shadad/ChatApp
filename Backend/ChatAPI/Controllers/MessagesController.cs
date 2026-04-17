using AutoMapper;
using ChatAPI.Data;
using ChatAPI.DTOs;
using ChatAPI.Exceptions;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace ChatAPI.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/messages")]
    public class MessagesController(AppDbContext context, IMapper mapper) : BaseController
    {
        [HttpGet("{roomId}")]
        public async Task<ActionResult<List<MessageDto>>> GetMessages(int roomId, int? cursor, int limit = 20)
        {
            var isMember = await context.RoomMembers.AnyAsync(rm => rm.RoomId == roomId && rm.UserId == UserId);
            if (!isMember) throw new ForbiddenException("You are not a member of this room.");

            var query = context.Messages.Where(m => m.RoomId == roomId);

            if (cursor.HasValue)
                query = query.Where(m => m.Id < cursor.Value);

            var messages = await query
                .OrderByDescending(m => m.Id)
                .Take(limit)
                .Include(m => m.Sender)
                .ToListAsync();

            return Ok(mapper.Map<List<MessageDto>>(messages));
        }
    }
}
