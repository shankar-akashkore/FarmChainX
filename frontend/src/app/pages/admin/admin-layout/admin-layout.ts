import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AdminSidebar } from '../components/admin-sidebar/admin-sidebar';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [RouterOutlet, AdminSidebar],
  templateUrl: './admin-layout.html',
  styleUrl: './admin-layout.scss'
})
export class AdminLayout {
  private authService = inject(AuthService);
  sidebarOpen = false;

  currentAdminName(): string {
    const name = this.authService.getName();
    return name ? name.split(' ')[0].split('@')[0] : 'Admin';
  }
}
