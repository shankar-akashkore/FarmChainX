import { Component, OnInit, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

interface OverviewData {
  totalUsers: number;
  totalProducts: number;
  totalLogs: number;
  totalFeedbacks: number;
}

@Component({
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './admin-overview.html',
  styleUrl: './admin-overview.scss'
})
export class AdminOverview implements OnInit {
  private http = inject(HttpClient);

  data?: OverviewData;
  loading = true;

  readonly stats = [
    {
      key: 'totalUsers' as keyof OverviewData,
      label: 'Total Users',
      sub: 'Registered accounts',
      icon: 'ph-fill ph-users-three',
      color: '#546B41',
      // color: '#A87C3A',
      bg: '#eef3e8',
      shadow: 'rgba(84,107,65,0.18)'
    },
    {
      key: 'totalProducts' as keyof OverviewData,
      label: 'Total Products',
      sub: 'In supply chain',
      icon: 'ph-fill ph-package',
      color: '#546B41',
      bg: '#fdf3e0',
      shadow: 'rgba(168,124,58,0.18)'
    },
    {
      key: 'totalLogs' as keyof OverviewData,
      label: 'Supply Logs',
      sub: 'Blockchain entries',
      icon: 'ph-fill ph-link-simple',
      color: '#546B41',
      bg: '#eff6ff',
      shadow: 'rgba(37,99,235,0.14)'
    },
    {
      key: 'totalFeedbacks' as keyof OverviewData,
      label: 'Feedbacks',
      sub: 'Consumer reviews',
      icon: 'ph-fill ph-star',
      color: '#546B41',
      bg: '#f5f3ff',
      shadow: 'rgba(124,58,237,0.14)'
    },
  ];

  readonly activity = [
    { icon: 'ph-fill ph-user-plus', text: 'New user registered', time: '2 min ago', color: '#A87C3A' },
    { icon: 'ph-fill ph-package', text: 'Harvest uploaded to blockchain', time: '14 min ago', color: '#A87C3A' },
    { icon: 'ph-fill ph-shield-check', text: 'Product verified via QR', time: '31 min ago', color: '#2563eb' },
    { icon: 'ph-fill ph-bell-ringing', text: 'Admin access requested', time: '1 hr ago', color: '#dc2626' },
    { icon: 'ph-fill ph-star', text: 'Consumer feedback submitted', time: '2 hr ago', color: '#7c3aed' },
    { icon: 'ph-fill ph-link-simple', text: 'Tracking log added', time: '3 hr ago', color: '#546B41' },
  ];

  ngOnInit(): void {
    this.http.get<OverviewData>('/api/admin/overview').subscribe({
      next: (res) => { this.data = res; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  getValue(key: keyof OverviewData): number {
    return this.data?.[key] ?? 0;
  }
}
