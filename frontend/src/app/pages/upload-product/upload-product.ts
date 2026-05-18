import { Component, inject, AfterViewInit, OnDestroy, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-upload-product',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './upload-product.html',
  styleUrl: './upload-product.scss'
})
export class UploadProduct implements AfterViewInit, OnDestroy {
  private http   = inject(HttpClient);
  private router = inject(Router);
  private el     = inject(ElementRef);
  private observer: IntersectionObserver | null = null;

  cropName    = '';
  soilType    = '';
  pesticides  = '';
  harvestDate = '';
  gpsLocation = '';
  imageFile: File | null = null;
  previewUrl: string | ArrayBuffer | null = null;

  loading    = false;
  gpsLoading = false;
  today      = this.getTodayString();

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

  private getTodayString(): string {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }

  onFileSelected(event: any) {
    const file = event.target.files?.[0];
    if (!file) return;
    this.imageFile = file;
    const reader = new FileReader();
    reader.onload = () => this.previewUrl = reader.result;
    reader.readAsDataURL(file);
  }

  clearImage() {
    this.imageFile = null;
    this.previewUrl = null;
  }

  detectGPS() {
    if (!navigator.geolocation) { alert('GPS not supported'); return; }
    this.gpsLoading = true;
    navigator.geolocation.getCurrentPosition(
      pos => {
        this.gpsLocation = `${pos.coords.latitude.toFixed(6)},${pos.coords.longitude.toFixed(6)}`;
        this.gpsLoading = false;
      },
      err => {
        console.warn('GPS error', err);
        alert('Unable to detect GPS location');
        this.gpsLoading = false;
      }
    );
  }

  uploadProduct() {
    if (!this.imageFile) { alert('Please select a product image'); return; }
    if (this.harvestDate && this.harvestDate > this.today) {
      alert('Harvest date cannot be in the future.');
      return;
    }

    this.loading = true;
    const formData = new FormData();
    formData.append('cropName',    this.cropName.trim());
    formData.append('soilType',    this.soilType.trim());
    formData.append('pesticides',  this.pesticides.trim());
    formData.append('harvestDate', this.harvestDate);
    formData.append('gpsLocation', this.gpsLocation.trim());
    formData.append('image',       this.imageFile);

    this.http.post<any>('/api/products/upload', formData).subscribe({
      next: (res) => {
        this.loading = false;
        alert(`Product uploaded! ID = ${res.id}`);
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.loading = false;
        const msg = err?.error?.message || err?.error?.error || err?.statusText || 'Upload failed';
        alert(`Upload failed: ${msg}`);
      }
    });
  }
}
