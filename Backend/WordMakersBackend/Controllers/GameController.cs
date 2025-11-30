using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using WordMakersBackend.DTOs;
using WordMakersBackend.Services;

namespace WordMakersBackend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class GameController : ControllerBase
    {
        private readonly IGameService _gameService;

        public GameController(IGameService gameService)
        {
            _gameService = gameService;
        }

        [HttpPost("start")]
        public async Task<IActionResult> StartNewSession()
        {
            var userId = GetUserId();
            var session = await _gameService.StartNewSessionAsync(userId);
            return Ok(session);
        }

        [HttpGet("next-word/{sessionId}")]
        public async Task<IActionResult> GetNextWord(int sessionId)
        {
            var userId = GetUserId();
            var word = await _gameService.GetNextWordAsync(userId, sessionId);

            if (word == null)
                return NotFound(new { message = "No more words available or session ended" });

            return Ok(word);
        }

        [HttpPost("submit-answer/{sessionId}")]
        public async Task<IActionResult> SubmitAnswer(int sessionId, [FromBody] SubmitAnswerDto answerDto)
        {
            var userId = GetUserId();

            try
            {
                var result = await _gameService.SubmitAnswerAsync(userId, sessionId, answerDto);
                return Ok(result);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("end-session/{sessionId}")]
        public async Task<IActionResult> EndSession(int sessionId)
        {
            var userId = GetUserId();
            var result = await _gameService.EndSessionAsync(userId, sessionId);

            if (result == null)
                return NotFound(new { message = "Session not found" });

            return Ok(result);
        }

        [HttpGet("leaderboard")]
        [AllowAnonymous]
        public async Task<IActionResult> GetLeaderboard([FromQuery] int top = 10)
        {
            var leaderboard = await _gameService.GetLeaderboardAsync(top);
            return Ok(leaderboard);
        }

        [HttpGet("stats")]
        public async Task<IActionResult> GetUserStats()
        {
            var userId = GetUserId();
            var stats = await _gameService.GetUserStatsAsync(userId);

            if (stats == null)
                return NotFound();

            return Ok(stats);
        }

        private int GetUserId()
        {
            return int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
        }
    }
}