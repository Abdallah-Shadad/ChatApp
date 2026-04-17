using AutoMapper;
using ChatAPI.DTOs;
using ChatAPI.Models;

namespace ChatAPI.Mappings
{
    public class MappingProfile : Profile
    {
        public MappingProfile()
        {
            // Map from RegisterDto -> User (For creating a new user)
            CreateMap<RegisterDto, User>()
                // ignore PasswordHash because i will hash it manually in the service
                .ForMember(dest => dest.PasswordHash, opt => opt.Ignore());

            // Map from User -> AuthResponseDto (For returning data to the client)
            CreateMap<User, AuthResponseDto>()
                // Ignore Token so i can manually attach it after mapping
                .ForMember(dest => dest.Token, opt => opt.Ignore());

            // map from message to messageDto 
            CreateMap<Message, MessageDto>()
                .ForMember(d => d.SenderName, o => o.MapFrom(s => s.Sender.Username));
        }
    }
}