using System.ComponentModel.DataAnnotations;

namespace WordMakersBackend.Models
{
    public class Word
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [MaxLength(50)]
        public string Text { get; set; } = string.Empty;

        [Required]
        public int Difficulty { get; set; }

        [MaxLength(200)]
        public string? Hint { get; set; }

        public int BasePoints { get; set; }

        public bool IsActive { get; set; } = true;

        public ICollection<GameRound> GameRounds { get; set; } = new List<GameRound>();
    }
}