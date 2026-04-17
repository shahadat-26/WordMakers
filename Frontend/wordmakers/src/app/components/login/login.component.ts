import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { LoginRequest } from '../../models/auth.models';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="auth-container">
      <div class="auth-card">
        <h2>WordMakers</h2>

        <form (ngSubmit)="login()">
          <input
            type="text"
            [(ngModel)]="username"
            name="username"
            placeholder="Username"
            required
          />

          <input
            type="password"
            [(ngModel)]="password"
            name="password"
            placeholder="Password"
            required
          />

          <button type="submit">Login</button>
        </form>

        <a routerLink="/register">New User? Register</a>
      </div>
    </div>
  `,
  styles: [`
    .auth-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
    }

    .auth-card {
      background: white;
      padding: 2rem;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      width: 300px;
    }

    h2 {
      color: #001f3f;
      text-align: center;
      margin-bottom: 1.5rem;
    }

    form {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    input {
      padding: 0.75rem;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 1rem;
    }

    input:focus {
      outline: none;
      border-color: #001f3f;
    }

    button {
      padding: 0.75rem;
      background: #001f3f;
      color: white;
      border: none;
      border-radius: 4px;
      font-size: 1rem;
      cursor: pointer;
    }

    button:hover {
      background: #00132a;
    }

    a {
      display: block;
      text-align: center;
      margin-top: 1rem;
      color: #001f3f;
    }
  `]
})
export class LoginComponent implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);

  username = '';
  password = '';

  ngOnInit(): void {
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/game']);
    }
  }

  login(): void {
    if (this.username && this.password) {
      const loginData: LoginRequest = {
        username: this.username,
        password: this.password
      };

      this.authService.login(loginData).subscribe({
        next: (response) => {
          this.router.navigate(['/game']);
        },
        error: (error) => {
          alert(`Login failed: ${error.error?.message || error.message || 'Please try again'}`);
        }
      });
    }
  }
}