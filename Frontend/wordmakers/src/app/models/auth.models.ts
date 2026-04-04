export interface User {
  id: number;
  username: string;
  email: string;
  currentLevel: number;
  totalScore: number;
  highestStreak: number;
  createdAt: Date;
  lastPlayedAt?: Date;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  username: string;
  userId: number;
  currentLevel: number;
  totalScore: number;
}