using ChatAPI.Models;
using Microsoft.EntityFrameworkCore;

namespace ChatAPI.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        // DbSets for each entity
        public DbSet<User> Users { get; set; }
        public DbSet<Room> Rooms { get; set; }
        public DbSet<RoomMember> RoomMembers { get; set; }
        public DbSet<Message> Messages { get; set; }
        public DbSet<MessageStatus> MessageStatuses { get; set; }

        // Fluent API configurations
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Index UNIQUE constraints
            modelBuilder.Entity<User>().HasIndex(u => u.Username).IsUnique();
            modelBuilder.Entity<User>().HasIndex(u => u.Email).IsUnique();

            // Indexes for performance optimization
            modelBuilder.Entity<Message>().HasIndex(m => m.RoomId);
            modelBuilder.Entity<MessageStatus>().HasIndex(ms => ms.UserId);

            // PROD OPTIMIZATIONS: Strings & Enums
            modelBuilder.Entity<User>().Property(u => u.Name).HasMaxLength(150);
            modelBuilder.Entity<Room>().Property(r => r.Name).HasMaxLength(150);
            modelBuilder.Entity<Message>().Property(m => m.Content).HasMaxLength(4096);

            modelBuilder.Entity<RoomMember>().Property(rm => rm.Role).HasConversion<string>();
            modelBuilder.Entity<MessageStatus>().Property(ms => ms.Status).HasConversion<string>();


            // COMPOSITE KEYS
            modelBuilder.Entity<RoomMember>().HasKey(rm => new { rm.UserId, rm.RoomId });
            modelBuilder.Entity<MessageStatus>().HasKey(ms => new { ms.MessageId, ms.UserId });

            // GLOBAL QUERY FILTERS (Fixed Cascading Warnings)
            modelBuilder.Entity<Room>().HasQueryFilter(r => !r.IsDeleted);
            modelBuilder.Entity<Message>().HasQueryFilter(m => !m.Room.IsDeleted);
            modelBuilder.Entity<RoomMember>().HasQueryFilter(rm => !rm.Room.IsDeleted);
            modelBuilder.Entity<MessageStatus>().HasQueryFilter(ms => !ms.Message.Room.IsDeleted);

            // RELATIONSHIP CONFIGURATIONS (*** = Preventing Cascade Delete Cycles = ***)
            modelBuilder.Entity<Message>()
                .HasOne(m => m.Sender)
                .WithMany(u => u.SentMessages)
                .HasForeignKey(m => m.SenderId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Room>()
                .HasOne(r => r.CreatedByUser)
                .WithMany()
                .HasForeignKey(r => r.CreatedByUserId)
                .OnDelete(DeleteBehavior.Restrict);

            //Soft delete will prevent actual deletion

            // Room - Messages: Cascade delete messages when a room is deleted 
            modelBuilder.Entity<Room>()
                .HasMany(r => r.Messages)
                .WithOne(m => m.Room)
                .OnDelete(DeleteBehavior.Cascade);

            // Room - RoomMembers: Cascade delete room members when a room is deleted 
            modelBuilder.Entity<MessageStatus>()
                .HasOne(ms => ms.Message)
                .WithMany(m => m.Statuses)
                .HasForeignKey(ms => ms.MessageId)
                .OnDelete(DeleteBehavior.Cascade);
            // Room - RoomMembers: Cascade delete room members when a room is deleted
            modelBuilder.Entity<Room>()
                .HasMany(r => r.Members)
                .WithOne(rm => rm.Room)
                .HasForeignKey(rm => rm.RoomId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
