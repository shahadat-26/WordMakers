import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { GameService } from '../../services/game.service';
import { AuthService } from '../../services/auth.service';
import { LeaderboardEntry } from '../../models/game.models';

@Component({
  selector: 'app-leaderboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="leaderboard-container">
      <div class="leaderboard-card">
        <h1>Leaderboard</h1>

        @if (isLoading()) {
        } @else if (leaderboard().length === 0) {
          <div class="no-data">No players yet. Be the first!</div>
        } @else {
          <div class="leaderboard-table">
            <div class="table-header">
              <div class="rank">Rank</div>
              <div class="player">Player</div>
              <div class="score">Score</div>
              <div class="level">Level</div>
              <div class="streak">Best Streak</div>
            </div>

            @for (entry of leaderboard(); track entry.rank) {
              <div class="table-row" [class.top-three]="entry.rank <= 3">
                <div class="rank">
                  @if (entry.rank === 1) {
                    <span class="medal gold">🥇</span>
                  } @else if (entry.rank === 2) {
                    <span class="medal silver">🥈</span>
                  } @else if (entry.rank === 3) {
                    <span class="medal bronze">🥉</span>
                  } @else {
                    <span>{{ entry.rank }}</span>
                  }
                </div>
                <div class="player">{{ entry.username }}</div>
                <div class="score">{{ entry.totalScore }}</div>
                <div class="level">{{ entry.currentLevel }}</div>
                <div class="streak">{{ entry.highestStreak }}</div>
              </div>
            }
          </div>
        }

        <div class="actions">
          @if (isAuthenticated()) {
            <button (click)="goToGame()" class="btn-play">Play Game</button>
          } @else {
            <a routerLink="/register" class="btn-play">Start Playing</a>
          }
        </div>
      </div>
    </div>
  `,
  styles: [`
    .leaderboard-container {
      min-height: 100vh;
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 2rem;
    }

    .leaderboard-card {
      background: white;
      padding: 2rem;
      border-radius: 12px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      width: 100%;
      max-width: 800px;
    }

    h1 {
      text-align: center;
      color: #001f3f;
      font-size: 2.5rem;
      margin-bottom: 2rem;
    }

    .loading, .no-data {
      text-align: center;
      padding: 3rem;
      color: #666;
      font-size: 1.1rem;
    }

    .leaderboard-table {
      width: 100%;
      margin-bottom: 2rem;
    }

    .table-header, .table-row {
      display: grid;
      grid-template-columns: 80px 1fr 120px 100px 120px;
      padding: 1rem;
      align-items: center;
    }

    .table-header {
      background-color: #001f3f;
      color: white;
      font-weight: 600;
      border-radius: 8px 8px 0 0;
    }

    .table-row {
      border-bottom: 1px solid #e0e0e0;
      transition: background-color 0.3s;
    }

    .table-row:hover {
      background-color: #f8f9fa;
    }

    .table-row.top-three {
      background-color: #fff9e6;
      font-weight: 600;
    }

    .table-row.top-three:hover {
      background-color: #fff3cc;
    }

    .rank {
      text-align: center;
    }

    .medal {
      font-size: 1.5rem;
    }

    .player {
      font-weight: 500;
      color: #001f3f;
    }

    .score {
      text-align: center;
      color: #28a745;
      font-weight: 600;
    }

    .level, .streak {
      text-align: center;
    }

    .actions {
      display: flex;
      justify-content: center;
      margin-top: 2rem;
    }

    .btn-play {
      padding: 1rem 3rem;
      text-decoration: none;
      border-radius: 8px;
      font-weight: 600;
      font-size: 1.1rem;
      transition: all 0.3s;
      display: inline-block;
      background-color: #002952;
      color: white;
    }

    .btn-play:hover {
      background-color: #001a3d;
      transform: translateY(-2px);
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
    }

    @media (max-width: 768px) {
      .table-header, .table-row {
        grid-template-columns: 60px 1fr 80px 60px 80px;
        padding: 0.75rem 0.5rem;
        font-size: 0.9rem;
      }

      h1 {
        font-size: 2rem;
      }

      .medal {
        font-size: 1.2rem;
      }
    }
  `]
})
export class LeaderboardComponent implements OnInit {
  private gameService = inject(GameService);
  private authService = inject(AuthService);
  private router = inject(Router);

  leaderboard = signal<LeaderboardEntry[]>([]);
  isLoading = signal(true);

  ngOnInit(): void {
    this.loadLeaderboard();
  }

  loadLeaderboard(): void {
    this.gameService.getLeaderboard(10).subscribe({
      next: (data) => {
        this.leaderboard.set(data);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      }
    });
  }

  isAuthenticated(): boolean {
    return this.authService.isAuthenticated();
  }

  goToGame(): void {
    this.router.navigate(['/game']);
  }
}