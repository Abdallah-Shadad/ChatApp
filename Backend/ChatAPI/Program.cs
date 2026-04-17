using ChatAPI.Data;
using ChatAPI.Hubs;
using ChatAPI.Middleware;
using ChatAPI.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.IdentityModel.Tokens;
using System.Text;

namespace ChatAPI;

public class Program
{
    public static void Main(string[] args)
    {
        var builder = WebApplication.CreateBuilder(args);

        builder.Services.AddControllers();
        builder.Services.AddEndpointsApiExplorer();
        builder.Services.AddSwaggerGen();

        // DbContext
        builder.Services.AddDbContext<AppDbContext>(options =>
            options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

        // SignalR
        builder.Services.AddSignalR();

        // CORS
        builder.Services.AddCors(options =>
        {
            options.AddPolicy("SignalRPolicy", policy =>
            {
                policy.WithOrigins("http://localhost:3000", "http://localhost:5173")
                      .AllowAnyHeader()
                      .AllowAnyMethod()
                      .AllowCredentials();
            });
        });

        // JWT Auth
        builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
            .AddJwtBearer(options =>
            {
                options.TokenValidationParameters = new TokenValidationParameters
                {
                    ValidateIssuer = true,
                    ValidateAudience = true,
                    ValidateLifetime = true,
                    ValidateIssuerSigningKey = true,
                    ValidIssuer = builder.Configuration["Jwt:Issuer"],
                    ValidAudience = builder.Configuration["Jwt:Audience"],
                    IssuerSigningKey = new SymmetricSecurityKey(
                        Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"]!))
                };

                options.Events = new JwtBearerEvents
                {
                    OnMessageReceived = context =>
                    {
                        var accessToken = context.Request.Query["access_token"];
                        var path = context.HttpContext.Request.Path;

                        if (!string.IsNullOrEmpty(accessToken) && path.StartsWithSegments("/chatHub"))
                        {
                            context.Token = accessToken;
                        }
                        return Task.CompletedTask;
                    }
                };
            });

        // Authorization
        builder.Services.AddAuthorization();

        // Auto Mapper 
        builder.Services.AddAutoMapper(cfg => { }, typeof(Program));

        // Sign Services For DI
        builder.Services.AddScoped<IAuthService, AuthService>();

        builder.Services.AddExceptionHandler<GlobalExceptionHandler>();
        builder.Services.AddProblemDetails();

        // BUILD THE APP 
        var app = builder.Build();

        // MIDDLEWARE PIPELINE 

        app.UseExceptionHandler();

        if (app.Environment.IsDevelopment())
        {
            app.UseSwagger();
            app.UseSwaggerUI();
        }

        app.UseHttpsRedirection();

        app.UseRouting();

        // Apply the specific CORS policy
        app.UseCors("SignalRPolicy");

        app.UseAuthentication();
        app.UseAuthorization();

        // Endpoints
        app.MapControllers();
        app.MapHub<ChatHub>("/chatHub");

        app.Run();
    }
}