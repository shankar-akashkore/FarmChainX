import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router, RouterModule } from '@angular/router';

@Component({
  standalone: true,
  selector: 'app-register',
  templateUrl: './register.html',
  styleUrls: ['./register.scss'],
  imports: [CommonModule, FormsModule, RouterModule]
})
export class RegisterPage {
  name = '';
  email = '';
  password = '';
  role = '';
  showPassword = false;
  loading = false;
  errorMessage = '';

  roles = [
    {
      value: 'FARMER',
      title: 'Farmer',
      description: 'Upload harvests and generate trusted QR records.'
    },
    {
      value: 'DISTRIBUTOR',
      title: 'Distributor',
      description: 'Receive products and update supply movement.'
    },
    {
      value: 'RETAILER',
      title: 'Retailer',
      description: 'Confirm receipt and complete product custody.'
    },
    {
      value: 'CONSUMER',
      title: 'Consumer',
      description: 'Scan products, verify origin, and leave feedback.'
    }
  ];

  constructor(private http: HttpClient, private router: Router) {}

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  selectRole(role: string) {
    this.role = role;
    this.errorMessage = '';
  }

  submit() {
    if (this.loading) return;

    if (!this.role) {
      this.errorMessage = 'Please select your role to continue.';
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    this.http.post('/api/auth/register', {
      name: this.name.trim(),
      email: this.email.trim(),
      password: this.password,
      role: this.role
    }).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate(['/login']);
      },
      error: (err) => {
        this.loading = false;
        const error = err?.error;
        this.errorMessage =
          error?.error ||
          error?.message ||
          (typeof error === 'string' ? error : 'Registration failed. Please try again.');
      }
    });
  }
}
