import { Component, ElementRef, AfterViewInit, OnDestroy, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './footer.html',
  styleUrls: ['./footer.scss']
})
export class Footer implements AfterViewInit, OnDestroy {
  private el       = inject(ElementRef);
  private observer: IntersectionObserver | null = null;

  readonly year = new Date().getFullYear();

  ngAfterViewInit() {
    this.observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          this.el.nativeElement.classList.add('in-view');
          this.observer?.disconnect(); // fire once, then stop watching
        }
      },
      { threshold: 0.08 }
    );
    this.observer.observe(this.el.nativeElement);
  }

  ngOnDestroy() {
    this.observer?.disconnect();
  }
}
