import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  standalone: true,
  selector: 'app-login',
  templateUrl: './login.html',
  styleUrls: ['./login.scss'],
  imports: [CommonModule, FormsModule, RouterModule]
})
export class Login {
  email = '';
  password = '';
  showPassword = false;
  loading = false;
  errorMessage = '';

  constructor(
    private http: HttpClient,
    private router: Router,
    private auth: AuthService
  ) {}

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  useDemo(email: string, password = '1234') {
    this.email = email;
    this.password = password;
    this.errorMessage = '';
  }

  login() {
    if (this.loading) return;

    this.loading = true;
    this.errorMessage = '';

    this.http.post<any>('/api/auth/login', {
      email: this.email.trim(),
      password: this.password
    }).subscribe({
      next: (res) => {
        this.auth.setAuthFromResponse(res);
        this.loading = false;
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.loading = false;
        const msg = err?.error?.error || 'Invalid email or password';
        this.errorMessage = msg;
      }
    });
  }
}
