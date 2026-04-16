using AutoMapper;
using ChatAPI.Data;
using ChatAPI.DTOs;
using ChatAPI.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace ChatAPI.Services
{
    public class AuthService : IAuthService
    {
        private readonly AppDbContext _context;
        private readonly IConfiguration _configuration;
        private readonly IMapper _mapper;

        public AuthService(AppDbContext context, IConfiguration configuration, IMapper mapper)
        {
            _context = context;
            _configuration = configuration;
            _mapper = mapper;
        }

        public async Task<AuthResponseDto> Register(RegisterDto dto)
        {
            if (dto == null) throw new ArgumentNullException(nameof(dto));

            if (await _context.Users.AnyAsync(u => u.Email == dto.Email))
                throw new InvalidOperationException("Email already taken");

            if (await _context.Users.AnyAsync(u => u.Username == dto.Username))
                throw new InvalidOperationException("Username already taken");

            // AutoMap DTO to User model
            var user = _mapper.Map<User>(dto);

            // Hash Password manually
            user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password);

            await _context.Users.AddAsync(user);
            await _context.SaveChangesAsync();

            // AutoMap back to Response DTO
            var responseDto = _mapper.Map<AuthResponseDto>(user);

            // Attach Token using your private method
            responseDto.Token = GenerateJwtToken(user);

            return responseDto;
        }

        public async Task<AuthResponseDto> Login(LoginDto dto)
        {
            if (dto == null) throw new ArgumentNullException(nameof(dto));

            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == dto.Email);

            if (user == null || !BCrypt.Net.BCrypt.Verify(dto.Password, user.PasswordHash))
                throw new UnauthorizedAccessException("Invalid credentials");

            // AutoMap to Response DTO
            var responseDto = _mapper.Map<AuthResponseDto>(user);

            // Attach Token
            responseDto.Token = GenerateJwtToken(user);

            return responseDto;
        }

        private string GenerateJwtToken(User user)
        {
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["Jwt:Key"]!));
            var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var claims = new[]
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Email, user.Email),
                new Claim(ClaimTypes.Name, user.Username)
            };

            var token = new JwtSecurityToken(
                issuer: _configuration["Jwt:Issuer"],
                audience: _configuration["Jwt:Audience"],
                claims: claims,
                expires: DateTime.UtcNow.AddHours(24),
                signingCredentials: credentials
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}