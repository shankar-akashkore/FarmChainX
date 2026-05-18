import { Component } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { Navbar } from './components/navbar/navbar';
import { Footer } from './components/footer/footer';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, Navbar, Footer, CommonModule],
  templateUrl: './app.html',
  styleUrls: ['./app.scss']
})
export class App {
  constructor(public router: Router) {}

  private get hiddenRoutes(): boolean {
    return ['/login', '/register'].includes(this.router.url);
  }

  get showNavbar(): boolean { return !this.hiddenRoutes; }
  get showFooter(): boolean {
    return !this.hiddenRoutes && !this.router.url.startsWith('/admin');
  }
}
