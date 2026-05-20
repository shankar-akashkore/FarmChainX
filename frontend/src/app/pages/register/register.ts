import { Component, inject } from '@angular/core';
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

  private http   = inject(HttpClient);
  private router = inject(Router);

  readonly roles = [
    {
      value: 'FARMER',
      title: 'Farmer',
      icon: 'ph-plant',
      description: 'Upload harvests & generate QR records.'
    },
    {
      value: 'DISTRIBUTOR',
      title: 'Distributor',
      icon: 'ph-truck',
      description: 'Receive products & update movement.'
    },
    {
      value: 'RETAILER',
      title: 'Retailer',
      icon: 'ph-storefront',
      description: 'Confirm receipt & complete custody.'
    },
    {
      value: 'CONSUMER',
      title: 'Consumer',
      icon: 'ph-user-circle',
      description: 'Scan products, verify & give feedback.'
    }
  ];

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
