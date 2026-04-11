using Microsoft.EntityFrameworkCore;
using WordMakersBackend.Models;

namespace WordMakersBackend.Data
{
    public class WordMakersContext : DbContext
    {
        public WordMakersContext(DbContextOptions<WordMakersContext> options)
            : base(options)
        {
        }

        public DbSet<User> Users { get; set; }
        public DbSet<Word> Words { get; set; }
        public DbSet<GameSession> GameSessions { get; set; }
        public DbSet<GameRound> GameRounds { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.HasDefaultSchema("wordmakers");

            modelBuilder.Entity<User>(entity =>
            {
                entity.HasIndex(e => e.Username).IsUnique();
                entity.HasIndex(e => e.Email).IsUnique();
            });

            modelBuilder.Entity<Word>(entity =>
            {
                entity.HasIndex(e => e.Text).IsUnique();
                entity.HasIndex(e => e.Difficulty);
            });

            modelBuilder.Entity<GameSession>(entity =>
            {
                entity.HasOne(d => d.User)
                    .WithMany(p => p.GameSessions)
                    .HasForeignKey(d => d.UserId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            modelBuilder.Entity<GameRound>(entity =>
            {
                entity.HasOne(d => d.GameSession)
                    .WithMany(p => p.GameRounds)
                    .HasForeignKey(d => d.GameSessionId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(d => d.Word)
                    .WithMany(p => p.GameRounds)
                    .HasForeignKey(d => d.WordId)
                    .OnDelete(DeleteBehavior.Restrict);
            });

            SeedData(modelBuilder);
        }

        private void SeedData(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Word>().HasData(
                new Word { Id = 1, Text = "CAT", Difficulty = 1, BasePoints = 10, Hint = "A common pet" },
                new Word { Id = 2, Text = "DOG", Difficulty = 1, BasePoints = 10, Hint = "Man's best friend" },
                new Word { Id = 3, Text = "BIRD", Difficulty = 1, BasePoints = 15, Hint = "Can fly" },
                new Word { Id = 4, Text = "FISH", Difficulty = 1, BasePoints = 15, Hint = "Lives in water" },
                new Word { Id = 5, Text = "TREE", Difficulty = 1, BasePoints = 15, Hint = "Has leaves" },

                new Word { Id = 6, Text = "HOUSE", Difficulty = 2, BasePoints = 20, Hint = "Place to live" },
                new Word { Id = 7, Text = "WATER", Difficulty = 2, BasePoints = 20, Hint = "Essential liquid" },
                new Word { Id = 8, Text = "BREAD", Difficulty = 2, BasePoints = 20, Hint = "Baked food" },
                new Word { Id = 9, Text = "PHONE", Difficulty = 2, BasePoints = 20, Hint = "Communication device" },
                new Word { Id = 10, Text = "MUSIC", Difficulty = 2, BasePoints = 20, Hint = "Art of sound" },

                new Word { Id = 11, Text = "COMPUTER", Difficulty = 3, BasePoints = 30, Hint = "Electronic device" },
                new Word { Id = 12, Text = "RAINBOW", Difficulty = 3, BasePoints = 30, Hint = "Colorful arc" },
                new Word { Id = 13, Text = "LIBRARY", Difficulty = 3, BasePoints = 30, Hint = "Book repository" },
                new Word { Id = 14, Text = "GARDEN", Difficulty = 3, BasePoints = 30, Hint = "Place with plants" },
                new Word { Id = 15, Text = "KITCHEN", Difficulty = 3, BasePoints = 30, Hint = "Cooking area" },

                new Word { Id = 16, Text = "ELEPHANT", Difficulty = 4, BasePoints = 40, Hint = "Large animal with trunk" },
                new Word { Id = 17, Text = "MOUNTAIN", Difficulty = 4, BasePoints = 40, Hint = "High landform" },
                new Word { Id = 18, Text = "BUTTERFLY", Difficulty = 4, BasePoints = 45, Hint = "Colorful insect" },
                new Word { Id = 19, Text = "CHOCOLATE", Difficulty = 4, BasePoints = 45, Hint = "Sweet treat" },
                new Word { Id = 20, Text = "ADVENTURE", Difficulty = 4, BasePoints = 45, Hint = "Exciting journey" },

                new Word { Id = 21, Text = "KNOWLEDGE", Difficulty = 5, BasePoints = 50, Hint = "Understanding gained" },
                new Word { Id = 22, Text = "UNIVERSITY", Difficulty = 5, BasePoints = 55, Hint = "Higher education" },
                new Word { Id = 23, Text = "TECHNOLOGY", Difficulty = 5, BasePoints = 55, Hint = "Applied science" },
                new Word { Id = 24, Text = "FRIENDSHIP", Difficulty = 5, BasePoints = 55, Hint = "Close relationship" },
                new Word { Id = 25, Text = "CELEBRATION", Difficulty = 5, BasePoints = 60, Hint = "Joyful event" }
            );
        }
    }
}