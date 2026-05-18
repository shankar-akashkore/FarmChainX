import { Component, inject, AfterViewInit, OnDestroy, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { RouterLink } from '@angular/router';
import { catchError, delay, retryWhen, scan, throwError } from 'rxjs';

@Component({
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './my-products.html',
  styleUrls: ['./my-products.scss']
})
export class MyProducts implements AfterViewInit, OnDestroy {
  private http    = inject(HttpClient);
  private el      = inject(ElementRef);
  private observer: IntersectionObserver | null = null;

  products: any[] = [];
  loading      = true;
  retryMessage = '';
  page         = 0;
  size         = 9;
  totalPages   = 0;

  constructor() { this.load(); }

  ngAfterViewInit(): void {
    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          this.observer?.unobserve(entry.target);
        }
      });
    }, { threshold: 0.06 });

    this.el.nativeElement
      .querySelectorAll('.reveal, .reveal-item')
      .forEach((el: Element) => this.observer?.observe(el));
  }

  ngOnDestroy() { this.observer?.disconnect(); }

  load(page = 0) {
    this.loading = true;
    this.retryMessage = '';

    this.http
      .get<any>(`/api/products/my?page=${page}&size=${this.size}&sort=id,desc`)
      .pipe(
        retryWhen(errors =>
          errors.pipe(
            scan((retryCount) => {
              retryCount++;
              if (retryCount > 3) throw errors;
              this.retryMessage = `Reconnecting… (Attempt ${retryCount} of 3)`;
              return retryCount;
            }, 0),
            delay(1000)
          )
        ),
        catchError(err => {
          this.retryMessage = '';
          this.loading = false;
          alert('Failed to load products after multiple attempts.');
          return throwError(() => err);
        })
      )
      .subscribe({
        next: (res) => {
          this.products   = res?.content || [];
          this.page       = res?.number  || 0;
          this.totalPages = res?.totalPages || 1;
          this.loading    = false;
          this.retryMessage = '';

          // Re-observe new cards after data loads
          setTimeout(() => {
            this.el.nativeElement
              .querySelectorAll('.reveal-item:not(.in-view)')
              .forEach((el: Element) => this.observer?.observe(el));
          }, 50);
        }
      });
  }

  nextPage() { if (this.page < this.totalPages - 1) this.load(this.page + 1); }
  prevPage() { if (this.page > 0) this.load(this.page - 1); }

  generateQr(id: number) {
    this.http.post<any>(`/api/products/${id}/qrcode`, {}).subscribe({
      next: (res) => {
        const product  = this.products.find(p => p.id === id)!;
        const url      = res.qrPath.startsWith('http') ? res.qrPath : `http://localhost:8080${res.qrPath}`;
        const filename = this.generateFilename(product);
        this.triggerDownload(url, filename);
        alert(`QR Generated & Downloaded: ${filename}`);
        this.load(this.page);
      },
      error: (err) => alert(err.error?.message || 'Failed to generate QR')
    });
  }

  downloadQr(id: number) {
    const product = this.products.find(p => p.id === id);
    if (!product?.qrCodePath) return;
    this.triggerDownload(this.getQrUrl(product.qrCodePath), this.generateFilename(product));
  }

  private triggerDownload(url: string, filename: string) {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  private generateFilename(product: any): string {
    const clean = (product.cropName || 'Product')
      .replace(/[^a-zA-Z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
    return `QR_${clean}_${product.id}.png`;
  }

  getImageUrl(path: string): string { return path?.startsWith('http') ? path : `http://localhost:8080${path}`; }
  getQrUrl(path: string):    string { return path?.startsWith('http') ? path : `http://localhost:8080${path}`; }

  formatDate(date: string | null): string {
    if (!date) return 'Unknown Date';
    return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  getCropEmoji(name: string): string {
    const n = (name || '').toLowerCase();
    const map: Record<string, string> = {
      onion: '🧅', tomato: '🍅', mango: '🥭', potato: '🥔', rice: '🌾',
      banana: '🍌', apple: '🍎', orange: '🍊', grape: '🍇', wheat: '🌿',
      corn: '🌽', carrot: '🥕', cucumber: '🥒', strawberry: '🍓', watermelon: '🍉'
    };
    const key = Object.keys(map).find(k => n.includes(k));
    return key ? map[key] : '🌱';
  }
}
