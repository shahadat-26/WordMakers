using Microsoft.EntityFrameworkCore;
using WordMakersBackend.Data;
using WordMakersBackend.DTOs;
using WordMakersBackend.Models;

namespace WordMakersBackend.Services
{
    public interface IGameService
    {
        Task<GameSessionDto> StartNewSessionAsync(int userId);
        Task<GameWordDto?> GetNextWordAsync(int userId, int sessionId);
        Task<AnswerResultDto> SubmitAnswerAsync(int userId, int sessionId, SubmitAnswerDto answerDto);
        Task<GameSessionDto?> EndSessionAsync(int userId, int sessionId);
        Task<List<LeaderboardEntryDto>> GetLeaderboardAsync(int top = 10);
        Task<GameStatsDto?> GetUserStatsAsync(int userId);
    }

    public class GameService : IGameService
    {
        private readonly WordMakersContext _context;
        private readonly IWordValidationService _wordValidation;
        private readonly Random _random = new Random();

        public GameService(WordMakersContext context, IWordValidationService wordValidation)
        {
            _context = context;
            _wordValidation = wordValidation;
        }

        public async Task<GameSessionDto> StartNewSessionAsync(int userId)
        {
            var user = await _context.Users.FindAsync(userId);
            if (user == null)
                throw new InvalidOperationException("User not found");

            var session = new GameSession
            {
                UserId = userId,
                StartedAt = DateTime.UtcNow,
                LevelAtStart = user.CurrentLevel,
                LevelAtEnd = user.CurrentLevel
            };

            _context.GameSessions.Add(session);
            await _context.SaveChangesAsync();

            return new GameSessionDto
            {
                SessionId = session.Id,
                StartedAt = session.StartedAt,
                SessionScore = 0,
                CorrectAnswers = 0,
                TotalQuestions = 0,
                CurrentStreak = 0,
                CurrentLevel = user.CurrentLevel
            };
        }

        public async Task<GameWordDto?> GetNextWordAsync(int userId, int sessionId)
        {
            var session = await _context.GameSessions
                .Include(s => s.User)
                .FirstOrDefaultAsync(s => s.Id == sessionId && s.UserId == userId);

            if (session == null || session.EndedAt != null)
                return null;

            var userLevel = session.User.CurrentLevel;
            var difficulty = Math.Min(5, Math.Max(1, (userLevel - 1) / 2 + 1));

            var playedWordIds = await _context.GameRounds
                .Where(r => r.GameSessionId == sessionId)
                .Select(r => r.WordId)
                .ToListAsync();

            var availableWords = await _context.Words
                .Where(w => w.IsActive &&
                           w.Difficulty <= difficulty &&
                           w.Difficulty >= Math.Max(1, difficulty - 1) &&
                           !playedWordIds.Contains(w.Id))
                .ToListAsync();

            if (!availableWords.Any())
            {
                availableWords = await _context.Words
                    .Where(w => w.IsActive && !playedWordIds.Contains(w.Id))
                    .ToListAsync();
            }

            if (!availableWords.Any())
            {
                availableWords = await _context.Words.Where(w => w.IsActive).ToListAsync();
            }

            var word = availableWords[_random.Next(availableWords.Count)];
            var shuffled = ShuffleString(word.Text);

            var baseTime = 30;
            var timeAllowed = Math.Max(10, baseTime - (userLevel - 1) * 2);

            return new GameWordDto
            {
                WordId = word.Id,
                ShuffledLetters = shuffled,
                TimeAllowed = timeAllowed,
                Difficulty = word.Difficulty,
                BasePoints = word.BasePoints,
                Hint = session.TotalQuestions > 0 && session.CurrentStreak == 0 ? word.Hint : null
            };
        }

        public async Task<AnswerResultDto> SubmitAnswerAsync(int userId, int sessionId, SubmitAnswerDto answerDto)
        {
            var session = await _context.GameSessions
                .Include(s => s.User)
                .FirstOrDefaultAsync(s => s.Id == sessionId && s.UserId == userId);

            if (session == null || session.EndedAt != null)
                throw new InvalidOperationException("Invalid session");

            var word = await _context.Words.FindAsync(answerDto.WordId);
            if (word == null)
                throw new InvalidOperationException("Invalid word");

            // Use the word validation service to check if the answer is valid
            var isCorrect = _wordValidation.IsValidAnswer(answerDto.Answer.Trim(), word.Text);
            var pointsEarned = 0;

            if (isCorrect)
            {
                var timeBonus = Math.Max(0, 30 - answerDto.TimeTaken) / 2;
                var streakBonus = session.CurrentStreak * 5;
                pointsEarned = word.BasePoints + timeBonus + streakBonus;

                session.CorrectAnswers++;
                session.CurrentStreak++;
                session.SessionScore += pointsEarned;

                session.User.TotalScore += pointsEarned;

                if (session.CurrentStreak > session.User.HighestStreak)
                {
                    session.User.HighestStreak = session.CurrentStreak;
                }
            }
            else
            {
                session.CurrentStreak = 0;
            }

            session.TotalQuestions++;
            session.User.LastPlayedAt = DateTime.UtcNow;

            var leveledUp = false;
            var requiredPointsForNextLevel = session.User.CurrentLevel * 100;
            if (session.User.TotalScore >= requiredPointsForNextLevel)
            {
                session.User.CurrentLevel++;
                session.LevelAtEnd = session.User.CurrentLevel;
                leveledUp = true;
            }

            var round = new GameRound
            {
                GameSessionId = sessionId,
                WordId = word.Id,
                ShuffledLetters = ShuffleString(word.Text),
                UserAnswer = answerDto.Answer,
                IsCorrect = isCorrect,
                PointsEarned = pointsEarned,
                TimeAllowed = 30,
                TimeTaken = answerDto.TimeTaken,
                PlayedAt = DateTime.UtcNow
            };

            _context.GameRounds.Add(round);
            await _context.SaveChangesAsync();

            return new AnswerResultDto
            {
                IsCorrect = isCorrect,
                PointsEarned = pointsEarned,
                CurrentScore = session.SessionScore,
                CurrentStreak = session.CurrentStreak,
                CurrentLevel = session.User.CurrentLevel,
                LeveledUp = leveledUp,
                CorrectWord = word.Text
            };
        }

        public async Task<GameSessionDto?> EndSessionAsync(int userId, int sessionId)
        {
            var session = await _context.GameSessions
                .FirstOrDefaultAsync(s => s.Id == sessionId && s.UserId == userId);

            if (session == null)
                return null;

            session.EndedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            return new GameSessionDto
            {
                SessionId = session.Id,
                StartedAt = session.StartedAt,
                SessionScore = session.SessionScore,
                CorrectAnswers = session.CorrectAnswers,
                TotalQuestions = session.TotalQuestions,
                CurrentStreak = session.CurrentStreak,
                CurrentLevel = session.LevelAtEnd
            };
        }

        public async Task<List<LeaderboardEntryDto>> GetLeaderboardAsync(int top = 10)
        {
            var leaderboard = await _context.Users
                .OrderByDescending(u => u.TotalScore)
                .Take(top)
                .Select((u, index) => new LeaderboardEntryDto
                {
                    Username = u.Username,
                    TotalScore = u.TotalScore,
                    CurrentLevel = u.CurrentLevel,
                    HighestStreak = u.HighestStreak,
                    Rank = 0
                })
                .ToListAsync();

            for (int i = 0; i < leaderboard.Count; i++)
            {
                leaderboard[i].Rank = i + 1;
            }

            return leaderboard;
        }

        public async Task<GameStatsDto?> GetUserStatsAsync(int userId)
        {
            var user = await _context.Users.FindAsync(userId);
            if (user == null)
                return null;

            var sessions = await _context.GameSessions
                .Where(s => s.UserId == userId)
                .ToListAsync();

            var totalGamesPlayed = sessions.Count;
            var totalCorrectAnswers = sessions.Sum(s => s.CorrectAnswers);
            var totalQuestions = sessions.Sum(s => s.TotalQuestions);

            return new GameStatsDto
            {
                TotalGamesPlayed = totalGamesPlayed,
                TotalCorrectAnswers = totalCorrectAnswers,
                TotalQuestions = totalQuestions,
                AccuracyPercentage = totalQuestions > 0 ? (double)totalCorrectAnswers / totalQuestions * 100 : 0,
                HighestStreak = user.HighestStreak,
                TotalScore = user.TotalScore,
                CurrentLevel = user.CurrentLevel,
                LastPlayedAt = user.LastPlayedAt
            };
        }

        private string ShuffleString(string input)
        {
            var array = input.ToCharArray();
            var n = array.Length;

            for (int i = n - 1; i > 0; i--)
            {
                int j = _random.Next(i + 1);
                var temp = array[i];
                array[i] = array[j];
                array[j] = temp;
            }

            var result = new string(array);
            if (result == input && input.Length > 1)
            {
                return ShuffleString(input);
            }

            return result;
        }
    }
}