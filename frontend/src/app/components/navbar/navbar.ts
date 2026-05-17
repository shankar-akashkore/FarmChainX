import { Component, inject, HostListener } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './navbar.html',
  styleUrls: ['./navbar.scss']
})
export class Navbar {
  private router = inject(Router);
  private auth   = inject(AuthService);

  isMenuOpen    = false;
  isScrolled    = false;
  isDropdownOpen = false;

  @HostListener('window:scroll')
  onScroll() {
    this.isScrolled = window.scrollY > 20;
  }

  // Close dropdown when clicking outside the user-menu
  @HostListener('document:click')
  onDocumentClick() {
    this.isDropdownOpen = false;
  }

  get isLoggedIn()  { return this.auth.isLoggedIn(); }
  get userRole()    { return this.auth.getRole(); }
  get userName()    { return this.auth.getName(); }
  get isFarmer()    { return this.auth.hasRole('ROLE_FARMER'); }
  get isAdmin()     { return this.auth.isAdmin(); }

  // Show only the first segment of the name (username / first name)
  get displayName() {
    const raw = this.userName || 'User';
    return raw.split(' ')[0].split('@')[0];
  }

  get roleLabel() {
    return (this.userRole || 'Guest').replace('ROLE_', '').toLowerCase();
  }

  toggleMenu()    { this.isMenuOpen = !this.isMenuOpen; }
  closeMenu()     { this.isMenuOpen = false; }

  toggleDropdown(e: Event) {
    e.stopPropagation();
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  logout() {
    this.isDropdownOpen = false;
    this.closeMenu();
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
