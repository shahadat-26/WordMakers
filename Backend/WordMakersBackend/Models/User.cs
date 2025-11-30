using System.ComponentModel.DataAnnotations;

namespace WordMakersBackend.Models
{
    public class User
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [MaxLength(50)]
        public string Username { get; set; } = string.Empty;

        [Required]
        [EmailAddress]
        [MaxLength(100)]
        public string Email { get; set; } = string.Empty;

        [Required]
        public string PasswordHash { get; set; } = string.Empty;

        public int CurrentLevel { get; set; } = 1;

        public int TotalScore { get; set; } = 0;

        public int HighestStreak { get; set; } = 0;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime? LastPlayedAt { get; set; }

        public ICollection<GameSession> GameSessions { get; set; } = new List<GameSession>();
    }
}