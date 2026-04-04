import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { GameSession, GameWord, SubmitAnswer, AnswerResult, LeaderboardEntry, GameStats } from '../models/game.models';

@Injectable({
  providedIn: 'root'
})
export class GameService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'https://localhost:7038/api/game';

  startNewSession(): Observable<GameSession> {
    return this.http.post<GameSession>(`${this.apiUrl}/start`, {});
  }

  getNextWord(sessionId: number): Observable<GameWord> {
    return this.http.get<GameWord>(`${this.apiUrl}/next-word/${sessionId}`);
  }

  submitAnswer(sessionId: number, answer: SubmitAnswer): Observable<AnswerResult> {
    return this.http.post<AnswerResult>(`${this.apiUrl}/submit-answer/${sessionId}`, answer);
  }

  endSession(sessionId: number): Observable<GameSession> {
    return this.http.post<GameSession>(`${this.apiUrl}/end-session/${sessionId}`, {});
  }

  getLeaderboard(top: number = 10): Observable<LeaderboardEntry[]> {
    return this.http.get<LeaderboardEntry[]>(`${this.apiUrl}/leaderboard?top=${top}`);
  }

  getUserStats(): Observable<GameStats> {
    return this.http.get<GameStats>(`${this.apiUrl}/stats`);
  }
}