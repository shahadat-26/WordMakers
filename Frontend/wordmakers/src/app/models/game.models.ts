export interface GameSession {
  sessionId: number;
  startedAt: Date;
  sessionScore: number;
  correctAnswers: number;
  totalQuestions: number;
  currentStreak: number;
  currentLevel: number;
}

export interface GameWord {
  wordId: number;
  shuffledLetters: string;
  timeAllowed: number;
  difficulty: number;
  basePoints: number;
  hint?: string;
}

export interface SubmitAnswer {
  wordId: number;
  answer: string;
  timeTaken: number;
}

export interface AnswerResult {
  isCorrect: boolean;
  pointsEarned: number;
  currentScore: number;
  currentStreak: number;
  currentLevel: number;
  leveledUp: boolean;
  correctWord: string;
}

export interface LeaderboardEntry {
  username: string;
  totalScore: number;
  currentLevel: number;
  highestStreak: number;
  rank: number;
}

export interface GameStats {
  totalGamesPlayed: number;
  totalCorrectAnswers: number;
  totalQuestions: number;
  accuracyPercentage: number;
  highestStreak: number;
  totalScore: number;
  currentLevel: number;
  lastPlayedAt?: Date;
}