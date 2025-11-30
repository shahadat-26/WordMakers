using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace WordMakersBackend.Models
{
    public class GameRound
    {
        [Key]
        public int Id { get; set; }

        [ForeignKey("GameSession")]
        public int GameSessionId { get; set; }

        public GameSession GameSession { get; set; } = null!;

        [ForeignKey("Word")]
        public int WordId { get; set; }

        public Word Word { get; set; } = null!;

        [MaxLength(100)]
        public string ShuffledLetters { get; set; } = string.Empty;

        [MaxLength(50)]
        public string? UserAnswer { get; set; }

        public bool IsCorrect { get; set; }

        public int PointsEarned { get; set; }

        public int TimeAllowed { get; set; }

        public int? TimeTaken { get; set; }

        public DateTime PlayedAt { get; set; } = DateTime.UtcNow;
    }
}