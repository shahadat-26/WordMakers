namespace WordMakersBackend.DTOs
{
    public class GameWordDto
    {
        public int WordId { get; set; }
        public string ShuffledLetters { get; set; } = string.Empty;
        public int TimeAllowed { get; set; }
        public int Difficulty { get; set; }
        public int BasePoints { get; set; }
        public string? Hint { get; set; }
    }

    public class SubmitAnswerDto
    {
        public int WordId { get; set; }
        public string Answer { get; set; } = string.Empty;
        public int TimeTaken { get; set; }
    }

    public class AnswerResultDto
    {
        public bool IsCorrect { get; set; }
        public int PointsEarned { get; set; }
        public int CurrentScore { get; set; }
        public int CurrentStreak { get; set; }
        public int CurrentLevel { get; set; }
        public bool LeveledUp { get; set; }
        public string CorrectWord { get; set; } = string.Empty;
    }

    public class GameSessionDto
    {
        public int SessionId { get; set; }
        public DateTime StartedAt { get; set; }
        public int SessionScore { get; set; }
        public int CorrectAnswers { get; set; }
        public int TotalQuestions { get; set; }
        public int CurrentStreak { get; set; }
        public int CurrentLevel { get; set; }
    }

    public class LeaderboardEntryDto
    {
        public string Username { get; set; } = string.Empty;
        public int TotalScore { get; set; }
        public int CurrentLevel { get; set; }
        public int HighestStreak { get; set; }
        public int Rank { get; set; }
    }

    public class GameStatsDto
    {
        public int TotalGamesPlayed { get; set; }
        public int TotalCorrectAnswers { get; set; }
        public int TotalQuestions { get; set; }
        public double AccuracyPercentage { get; set; }
        public int HighestStreak { get; set; }
        public int TotalScore { get; set; }
        public int CurrentLevel { get; set; }
        public DateTime? LastPlayedAt { get; set; }
    }
}