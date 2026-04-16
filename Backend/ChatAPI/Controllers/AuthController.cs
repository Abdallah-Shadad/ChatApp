using ChatAPI.DTOs;
using ChatAPI.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace ChatAPI.Controllers
{
    [Route("api/auth")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;
        public AuthController(IAuthService authService)
        {
            _authService = authService;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register(RegisterDto dto)
        {
            try
            {
                var result = await _authService.Register(dto);
                return StatusCode(201, result);
            }
            catch (InvalidOperationException ex)
            {
                // 409 Conflict is perfect for "User already exists"
                return Conflict(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                // 500 for unexpected server/DB issues
                return StatusCode(500, new { message = "An error occurred during registration.", details = ex.Message });
            }
        }
        [HttpPost("login")]
        public async Task<IActionResult> Login(LoginDto dto)
        {
            try
            {
                var result = await _authService.Login(dto);
                return StatusCode(200, result);
            }
            catch (UnauthorizedAccessException ex)
            {
                // 401 Unauthorized for bad credentials
                return Unauthorized(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                // 400 Bad Request for other login-related issues
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}
