import { Component, OnInit, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

type PrimaryRole = 'ADMIN' | 'FARMER' | 'DISTRIBUTOR' | 'RETAILER' | 'CONSUMER' | 'USER';

interface User {
  id: number;
  name: string;
  email: string;
  roles: string[];
  isAdmin: boolean;
  primaryRole: PrimaryRole;
}

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-users.html',
  styleUrl: './admin-users.scss'
})
export class AdminUsers implements OnInit {
  private http = inject(HttpClient);

  users: User[] = [];
  loading = true;
  searchQuery = '';
  selectedRole: string = 'ALL';
  promotingId: number | null = null;

  readonly roleFilters: { label: string; value: string }[] = [
    { label: 'All', value: 'ALL' },
    { label: 'Admin', value: 'ADMIN' },
    { label: 'Farmer', value: 'FARMER' },
    { label: 'Distributor', value: 'DISTRIBUTOR' },
    { label: 'Retailer', value: 'RETAILER' },
    { label: 'Consumer', value: 'CONSUMER' },
  ];

  ngOnInit(): void {
    this.loadUsers();
  }

  private normalizeRole(r: any): string {
    const val = (r?.name ?? r ?? '').toString().toUpperCase();
    return val.startsWith('ROLE_') ? val : `ROLE_${val}`;
  }

  private derivePrimaryRole(roles: string[]): PrimaryRole {
    const set = new Set(roles.map(r => this.normalizeRole(r)));
    if (set.has('ROLE_ADMIN'))       return 'ADMIN';
    if (set.has('ROLE_FARMER'))      return 'FARMER';
    if (set.has('ROLE_DISTRIBUTOR')) return 'DISTRIBUTOR';
    if (set.has('ROLE_RETAILER'))    return 'RETAILER';
    if (set.has('ROLE_CONSUMER'))    return 'CONSUMER';
    return 'USER';
  }

  loadUsers(): void {
    this.loading = true;
    this.http.get<any[]>('/api/admin/users').subscribe({
      next: data => {
        this.users = data.map(u => {
          const roles = (u.roles ?? []).map((r: any) => this.normalizeRole(r));
          return {
            id: u.id,
            name: u.name,
            email: u.email,
            roles,
            isAdmin: roles.includes('ROLE_ADMIN'),
            primaryRole: this.derivePrimaryRole(roles)
          };
        });
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  get filteredUsers(): User[] {
    const q = this.searchQuery.trim().toLowerCase();
    return this.users.filter(u => {
      const matchesSearch = !q || u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
      const matchesRole = this.selectedRole === 'ALL' || u.primaryRole === this.selectedRole;
      return matchesSearch && matchesRole;
    });
  }

  get totalCount(): number { return this.users.length; }
  get adminCount(): number { return this.users.filter(u => u.isAdmin).length; }
  get farmerCount(): number { return this.users.filter(u => u.primaryRole === 'FARMER').length; }
  get consumerCount(): number { return this.users.filter(u => u.primaryRole === 'CONSUMER').length; }

  getInitials(name: string): string {
    return name.split(' ').slice(0, 2).map(w => w[0]?.toUpperCase() ?? '').join('');
  }

  getAvatarGradient(role: PrimaryRole): string {
    switch (role) {
      case 'ADMIN':       return 'linear-gradient(135deg,#2f3e24,#546B41)';
      case 'FARMER':      return 'linear-gradient(135deg,#3a5a28,#6a8752)';
      case 'DISTRIBUTOR': return 'linear-gradient(135deg,#1e4060,#2e7ab0)';
      case 'RETAILER':    return 'linear-gradient(135deg,#6b3a10,#A87C3A)';
      case 'CONSUMER':    return 'linear-gradient(135deg,#4a3060,#7c5cbf)';
      default:            return 'linear-gradient(135deg,#374151,#6b7280)';
    }
  }

  promote(userId: number): void {
    if (!confirm('Promote this user to Admin?')) return;
    this.promotingId = userId;
    this.http.post(`/api/admin/promote/${userId}`, {}).subscribe({
      next: () => {
        this.promotingId = null;
        this.loadUsers();
      },
      error: (err) => {
        this.promotingId = null;
        alert(err.error?.message || 'Promotion failed');
      }
    });
  }
}
