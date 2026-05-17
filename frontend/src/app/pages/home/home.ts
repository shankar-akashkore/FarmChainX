import { Component, ElementRef, AfterViewInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './home.html',
  styleUrls: ['./home.scss']
})
export class Home implements AfterViewInit, OnDestroy {
  private el = inject(ElementRef);
  private observer: IntersectionObserver | null = null;

  get isLoggedIn(): boolean { return !!localStorage.getItem('fcx_token'); }
  get isFarmer(): boolean   { return localStorage.getItem('fcx_role') === 'ROLE_FARMER'; }

  ngAfterViewInit() {
    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          this.observer?.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08 });

    this.el.nativeElement
      .querySelectorAll('.reveal')
      .forEach((el: Element) => this.observer?.observe(el));
  }

  ngOnDestroy() { this.observer?.disconnect(); }
}
