import { Component, OnDestroy, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { GameService } from '../../services/game.service';
import { AuthService } from '../../services/auth.service';
import { GameSession, GameWord, AnswerResult } from '../../models/game.models';

@Component({
  selector: 'app-game',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="game-container">
      <header class="game-header">
        <div class="header-content">
          <div class="user-info">
            <span class="username">{{ currentUser()?.username }}</span>
            <span class="level">Level {{ currentLevel() }}</span>
          </div>
          <div class="game-stats">
            <div class="stat">
              <span class="stat-label">Score</span>
              <span class="stat-value">{{ sessionScore() }}</span>
            </div>
            <div class="stat">
              <span class="stat-label">Streak</span>
              <span class="stat-value">{{ currentStreak() }}</span>
            </div>
          </div>
          <button class="btn-logout" (click)="logout()">Logout</button>
        </div>
      </header>

      <main class="game-main">
        @if (!gameStarted()) {
          <div class="game-start">
            <h1>WordMakers</h1>
            <p>Unscramble the letters to form words!</p>
            <button class="btn-start" (click)="startGame()">Start Game</button>
            <button class="btn-stats" (click)="showStats = !showStats">View Stats</button>
          </div>
        } @else if (gameOver()) {
          <div class="game-over">
            <h2>Game Over!</h2>
            <div class="final-stats">
              <p>Final Score: <strong>{{ sessionScore() }}</strong></p>
              <p>Correct Answers: <strong>{{ correctAnswers() }} / {{ totalQuestions() }}</strong></p>
              <p>Accuracy: <strong>{{ accuracy() }}%</strong></p>
              @if (leveledUp()) {
                <p class="level-up">🎉 You leveled up to Level {{ currentLevel() }}!</p>
              }
            </div>
            <button class="btn-start" (click)="startGame()">Play Again</button>
            <button class="btn-secondary" (click)="backToMenu()">Back to Menu</button>
          </div>
        } @else if (currentWord()) {
          <div class="game-play">
            <div class="timer-bar">
              <div class="timer-fill" [style.width.%]="timerPercentage()"></div>
              <span class="timer-text">{{ timeRemaining() }}s</span>
            </div>

            <div class="word-display">
              <h2 class="shuffled-letters">{{ currentWord()?.shuffledLetters }}</h2>
              @if (showHint() && currentWord()?.hint) {
                <p class="hint">Hint: {{ currentWord()?.hint }}</p>
              }
            </div>

            <form (ngSubmit)="submitAnswer()" class="answer-form">
              <input
                type="text"
                [(ngModel)]="userAnswer"
                name="answer"
                placeholder="Type your answer..."
                class="answer-input"
                [disabled]="isSubmitting()"
                autofocus
              />
              <button type="submit" class="btn-submit" [disabled]="!userAnswer || isSubmitting()">
                Submit
              </button>
            </form>

            @if (lastResult()) {
              <div class="result-message" [class.correct]="lastResult()?.isCorrect" [class.incorrect]="!lastResult()?.isCorrect">
                @if (lastResult()?.isCorrect) {
                  <p>✓ Correct! +{{ lastResult()?.pointsEarned }} points</p>
                } @else {
                  <p>✗ Wrong! The word was: {{ lastResult()?.correctWord }}</p>
                }
                @if (lastResult()?.leveledUp) {
                  <p class="level-up">Level Up! You're now Level {{ lastResult()?.currentLevel }}</p>
                }
              </div>
            }

            <div class="game-controls">
              <button class="btn-secondary" (click)="skipWord()">Skip Word</button>
              <button class="btn-secondary" (click)="endGame()">End Game</button>
            </div>
          </div>
        } @else {
          <div class="loading">
            <p>Loading next word...</p>
          </div>
        }

        @if (showStats) {
          <div class="stats-overlay" (click)="showStats = false">
            <div class="stats-modal" (click)="$event.stopPropagation()">
              <h3>Your Statistics</h3>
              <div class="stats-grid">
                <div class="stat-item">
                  <span>Total Score</span>
                  <strong>{{ userStats()?.totalScore || 0 }}</strong>
                </div>
                <div class="stat-item">
                  <span>Games Played</span>
                  <strong>{{ userStats()?.totalGamesPlayed || 0 }}</strong>
                </div>
                <div class="stat-item">
                  <span>Accuracy</span>
                  <strong>{{ userStats()?.accuracyPercentage?.toFixed(1) || 0 }}%</strong>
                </div>
                <div class="stat-item">
                  <span>Highest Streak</span>
                  <strong>{{ userStats()?.highestStreak || 0 }}</strong>
                </div>
              </div>
              <button class="btn-close" (click)="showStats = false">Close</button>
            </div>
          </div>
        }
      </main>
    </div>
  `,
  styles: [`
    .game-container {
      min-height: 100vh;
      background: linear-gradient(135deg, #ffffff 0%, #e6f2ff 100%);
    }

    .game-header {
      background-color: #002952;
      color: white;
      padding: 1rem 2rem;
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
    }

    .header-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
      max-width: 1200px;
      margin: 0 auto;
    }

    .user-info {
      display: flex;
      flex-direction: column;
    }

    .username {
      font-size: 1.2rem;
      font-weight: 600;
    }

    .level {
      font-size: 0.9rem;
      opacity: 0.9;
    }

    .game-stats {
      display: flex;
      gap: 2rem;
    }

    .stat {
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    .stat-label {
      font-size: 0.9rem;
      opacity: 0.8;
    }

    .stat-value {
      font-size: 1.5rem;
      font-weight: bold;
    }

    .btn-logout {
      padding: 0.5rem 1.5rem;
      background-color: transparent;
      color: white;
      border: 2px solid white;
      border-radius: 6px;
      cursor: pointer;
      transition: all 0.3s;
    }

    .btn-logout:hover {
      background-color: white;
      color: #001f3f;
    }

    .game-main {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: calc(100vh - 80px);
      padding: 2rem;
    }

    .game-start, .game-over, .game-play {
      background: white;
      padding: 3rem;
      border-radius: 12px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      text-align: center;
      max-width: 600px;
      width: 100%;
    }

    h1 {
      color: #001f3f;
      font-size: 3rem;
      margin-bottom: 1rem;
    }

    h2 {
      color: #001f3f;
      font-size: 2rem;
      margin-bottom: 1.5rem;
    }

    .btn-start, .btn-submit {
      padding: 1rem 3rem;
      background-color: #001f3f;
      color: white;
      border: none;
      border-radius: 8px;
      font-size: 1.2rem;
      font-weight: 600;
      cursor: pointer;
      transition: background-color 0.3s;
      margin: 0.5rem;
    }

    .btn-start:hover, .btn-submit:hover:not(:disabled) {
      background-color: #00132a;
    }

    .btn-secondary {
      padding: 0.75rem 2rem;
      background-color: white;
      color: #001f3f;
      border: 2px solid #001f3f;
      border-radius: 8px;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s;
      margin: 0.5rem;
    }

    .btn-secondary:hover {
      background-color: #001f3f;
      color: white;
    }

    .btn-stats {
      padding: 1rem 3rem;
      background-color: white;
      color: #001f3f;
      border: 2px solid #001f3f;
      border-radius: 8px;
      font-size: 1.2rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s;
      margin: 0.5rem;
    }

    .btn-stats:hover {
      background-color: #001f3f;
      color: white;
    }

    .timer-bar {
      position: relative;
      height: 40px;
      background-color: #f0f0f0;
      border-radius: 20px;
      margin-bottom: 2rem;
      overflow: hidden;
      border: 2px solid #d0d0d0;
    }

    .timer-fill {
      position: absolute;
      left: 0;
      top: 0;
      height: 100%;
      background: linear-gradient(90deg, #002952, #004080);
      transition: width 0.1s linear;
      border-radius: 18px;
    }

    .timer-text {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      font-weight: 900;
      background: white;
      color: #002952;
      font-size: 1.1rem;
      z-index: 10;
      padding: 0.3rem 0.8rem;
      border-radius: 10px;
      border: 2px solid #002952;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
    }

    .word-display {
      margin: 2rem 0;
    }

    .shuffled-letters {
      font-size: 3.5rem;
      letter-spacing: 0.8rem;
      color: #002952;
      margin-bottom: 1rem;
      font-weight: 700;
      text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
    }

    .hint {
      color: #666;
      font-style: italic;
      margin-top: 1rem;
    }

    .answer-form {
      display: flex;
      gap: 1rem;
      margin: 2rem 0;
    }

    .answer-input {
      flex: 1;
      padding: 1rem;
      font-size: 1.2rem;
      border: 2px solid #001f3f;
      border-radius: 8px;
      text-align: center;
      text-transform: uppercase;
    }

    .answer-input:focus {
      outline: none;
      border-color: #0056b3;
    }

    .result-message {
      padding: 1rem;
      border-radius: 8px;
      margin: 1rem 0;
      font-weight: 600;
    }

    .result-message.correct {
      background-color: #d4edda;
      color: #155724;
    }

    .result-message.incorrect {
      background-color: #f8d7da;
      color: #721c24;
    }

    .level-up {
      color: #28a745;
      font-weight: bold;
      margin-top: 0.5rem;
    }

    .final-stats p {
      margin: 1rem 0;
      font-size: 1.1rem;
    }

    .final-stats strong {
      color: #001f3f;
      font-size: 1.3rem;
    }

    .game-controls {
      margin-top: 2rem;
      display: flex;
      justify-content: center;
      gap: 1rem;
    }

    .loading {
      text-align: center;
      padding: 3rem;
    }

    .stats-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: rgba(0, 0, 0, 0.5);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 1000;
    }

    .stats-modal {
      background: white;
      padding: 2rem;
      border-radius: 12px;
      max-width: 500px;
      width: 90%;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 1.5rem;
      margin: 2rem 0;
    }

    .stat-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 1rem;
      background-color: #f8f9fa;
      border-radius: 8px;
    }

    .stat-item span {
      color: #666;
      font-size: 0.9rem;
      margin-bottom: 0.5rem;
    }

    .stat-item strong {
      color: #001f3f;
      font-size: 1.5rem;
    }

    .btn-close {
      padding: 0.75rem 2rem;
      background-color: #001f3f;
      color: white;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      width: 100%;
      font-weight: 600;
    }

    .btn-close:hover {
      background-color: #00132a;
    }

    @media (max-width: 768px) {
      .header-content {
        flex-direction: column;
        gap: 1rem;
      }

      .game-stats {
        flex-direction: row;
      }

      .shuffled-letters {
        font-size: 2rem;
        letter-spacing: 0.3rem;
      }

      .stats-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class GameComponent implements OnDestroy {
  private gameService = inject(GameService);
  private authService = inject(AuthService);
  private router = inject(Router);

  currentUser = signal(this.authService.getCurrentUser());
  gameStarted = signal(false);
  gameOver = signal(false);
  currentSession = signal<GameSession | null>(null);
  currentWord = signal<GameWord | null>(null);
  lastResult = signal<AnswerResult | null>(null);
  userStats = signal<any>(null);

  sessionScore = signal(0);
  correctAnswers = signal(0);
  totalQuestions = signal(0);
  currentStreak = signal(0);
  currentLevel = signal(this.currentUser()?.currentLevel || 1);
  leveledUp = signal(false);

  userAnswer = '';
  isSubmitting = signal(false);
  showHint = signal(false);
  showStats = false;

  timeRemaining = signal(0);
  timerInterval: any;
  timerPercentage = computed(() => {
    const word = this.currentWord();
    if (!word) return 0;
    return (this.timeRemaining() / word.timeAllowed) * 100;
  });

  accuracy = computed(() => {
    const total = this.totalQuestions();
    if (total === 0) return 0;
    return Math.round((this.correctAnswers() / total) * 100);
  });

  ngOnDestroy(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
  }

  startGame(): void {
    this.gameStarted.set(true);
    this.gameOver.set(false);
    this.sessionScore.set(0);
    this.correctAnswers.set(0);
    this.totalQuestions.set(0);
    this.currentStreak.set(0);
    this.leveledUp.set(false);
    this.lastResult.set(null);

    this.gameService.startNewSession().subscribe({
      next: (session) => {
        this.currentSession.set(session);
        this.loadNextWord();
      },
      error: () => {
        this.gameStarted.set(false);
      }
    });

    this.loadUserStats();
  }

  loadNextWord(): void {
    const sessionId = this.currentSession()?.sessionId;
    if (!sessionId) return;

    this.userAnswer = '';
    this.lastResult.set(null);
    this.showHint.set(false);

    this.gameService.getNextWord(sessionId).subscribe({
      next: (word) => {
        this.currentWord.set(word);
        this.startTimer(word.timeAllowed);
      },
      error: () => {
        this.endGame();
      }
    });
  }

  startTimer(seconds: number): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }

    this.timeRemaining.set(seconds);

    this.timerInterval = setInterval(() => {
      const remaining = this.timeRemaining() - 1;
      this.timeRemaining.set(remaining);

      if (remaining <= 0) {
        clearInterval(this.timerInterval);
        this.submitAnswer();
      }

      if (remaining <= 10 && remaining > 0) {
        this.showHint.set(true);
      }
    }, 1000);
  }

  submitAnswer(): void {
    const sessionId = this.currentSession()?.sessionId;
    const word = this.currentWord();
    if (!sessionId || !word || this.isSubmitting()) return;

    clearInterval(this.timerInterval);
    this.isSubmitting.set(true);

    const timeTaken = word.timeAllowed - this.timeRemaining();

    this.gameService.submitAnswer(sessionId, {
      wordId: word.wordId,
      answer: this.userAnswer || '',
      timeTaken: timeTaken
    }).subscribe({
      next: (result) => {
        this.lastResult.set(result);
        this.sessionScore.set(result.currentScore);
        this.currentStreak.set(result.currentStreak);
        this.currentLevel.set(result.currentLevel);
        this.totalQuestions.update(t => t + 1);

        if (result.isCorrect) {
          this.correctAnswers.update(c => c + 1);
        }

        if (result.leveledUp) {
          this.leveledUp.set(true);
        }

        setTimeout(() => {
          this.isSubmitting.set(false);
          this.loadNextWord();
        }, 2000);
      },
      error: () => {
        this.isSubmitting.set(false);
        this.endGame();
      }
    });
  }

  skipWord(): void {
    this.submitAnswer();
  }

  endGame(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }

    const sessionId = this.currentSession()?.sessionId;
    if (sessionId) {
      this.gameService.endSession(sessionId).subscribe({
        next: () => {
          this.gameOver.set(true);
        },
        error: () => {
          this.gameOver.set(true);
        }
      });
    } else {
      this.gameOver.set(true);
    }
  }

  backToMenu(): void {
    this.gameStarted.set(false);
    this.gameOver.set(false);
    this.currentWord.set(null);
    this.lastResult.set(null);
  }

  loadUserStats(): void {
    this.gameService.getUserStats().subscribe({
      next: (stats) => {
        this.userStats.set(stats);
      }
    });
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}