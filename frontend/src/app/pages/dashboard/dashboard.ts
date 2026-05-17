import { Component, inject, AfterViewInit, OnDestroy, ElementRef } from '@angular/core';
import { CommonModule, UpperCasePipe } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { AdminService } from '../../services/admin.service';

@Component({
  standalone: true,
  imports: [CommonModule, RouterLink, UpperCasePipe],
  selector: 'app-dashboard',
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss'
})
export class Dashboard implements AfterViewInit, OnDestroy {
  private authService = inject(AuthService);
  private adminService = inject(AdminService);
  private router     = inject(Router);
  private el         = inject(ElementRef);
  private observer: IntersectionObserver | null = null;

  name     = this.authService.getName() || 'User';
  role     = (this.authService.getRole() || 'USER').replace('ROLE_', '');
  isAdmin  = this.authService.isAdmin();
  isFarmer = this.authService.hasRole('ROLE_FARMER');

  get initial(): string {
    return (this.name[0] || 'U').toUpperCase();
  }

  ngAfterViewInit(): void {
    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          this.observer?.unobserve(entry.target);
        }
      });
    }, { threshold: 0.07 });

    this.el.nativeElement
      .querySelectorAll('.reveal')
      .forEach((el: Element) => this.observer?.observe(el));
  }

  ngOnDestroy() { this.observer?.disconnect(); }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  requestAdminAccess() {
    this.adminService.requestAdminAccess().subscribe({
      next:  () => alert('Admin access requested!'),
      error: () => alert('Already requested or you are admin'),
    });
  }
}
