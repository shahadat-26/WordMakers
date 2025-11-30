using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace WordMakersBackend.Models
{
    public class GameSession
    {
        [Key]
        public int Id { get; set; }

        [ForeignKey("User")]
        public int UserId { get; set; }

        public User User { get; set; } = null!;

        public DateTime StartedAt { get; set; } = DateTime.UtcNow;

        public DateTime? EndedAt { get; set; }

        public int SessionScore { get; set; } = 0;

        public int CorrectAnswers { get; set; } = 0;

        public int TotalQuestions { get; set; } = 0;

        public int CurrentStreak { get; set; } = 0;

        public int LevelAtStart { get; set; }

        public int LevelAtEnd { get; set; }

        public ICollection<GameRound> GameRounds { get; set; } = new List<GameRound>();
    }
}