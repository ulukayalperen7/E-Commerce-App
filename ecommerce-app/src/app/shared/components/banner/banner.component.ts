import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { Router } from '@angular/router';
import { BannerService } from '../../../core/services/banner.service';
import { Banner } from '../../../core/models/banner.model';

@Component({
  selector: 'app-banner',
  standalone: false,
  templateUrl: './banner.component.html',
  styleUrls: ['./banner.component.scss']
})
export class BannerComponent implements OnInit, OnDestroy {
  @Input() routePrefix: string = '';

  banners: Banner[] = [];
  currentIndex = 0;
  private intervalId: any;
  private readonly delay = 5000;
  loading: boolean = true;

  constructor(
    private bannerService: BannerService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadBanners();
  }

  loadBanners(): void {
    this.loading = true;
    this.bannerService.getActiveBanners().subscribe({
      next: (data: Banner[]) => {
        this.banners = data;
        this.loading = false;
        if (this.banners && this.banners.length > 0) {
          this.currentIndex = 0;
          this.play();
        }
        console.log('BannerComponent - Banners fetched successfully:', this.banners);
      },
      error: (err) => {
        console.error('BannerComponent - Error fetching banners:', err);
        this.loading = false;
        this.banners = [];
      }
    });
  }

  ngOnDestroy() {
    this.pause();
  }

  play() {
    this.pause();
    if (this.banners && this.banners.length > 1) {
      this.intervalId = setInterval(() => this.next(), this.delay);
    }
  }

  pause() {
    clearInterval(this.intervalId);
  }

  next() {
    if (this.banners && this.banners.length > 0) {
      this.currentIndex = (this.currentIndex + 1) % this.banners.length;
    }
  }

  prev() {
    if (this.banners && this.banners.length > 0) {
      this.currentIndex = (this.currentIndex - 1 + this.banners.length) % this.banners.length;
    }
  }

  goToLink(banner: Banner) {
    if (banner.linkUrl) {
      if (banner.linkUrl.startsWith('http')) {
        window.open(banner.linkUrl, '_blank');
      } else {
        let finalPath = banner.linkUrl;
        const prefix = this.routePrefix.trim();

        if (prefix) {
          if (banner.linkUrl.startsWith('/category/')) {
            finalPath = `/${prefix}${banner.linkUrl}`;
          } else if (banner.linkUrl.startsWith('category/')) {
             finalPath = `/${prefix}/${banner.linkUrl}`;
          } else {
             finalPath = `/${prefix}/category/${banner.linkUrl}`; 
          }
        }
        
        finalPath = finalPath.replace(/\/\//g, '/');
        if (!finalPath.startsWith('/')) {
          finalPath = '/' + finalPath;
        }
        this.router.navigateByUrl(finalPath);
      }
    }
  }
  get totalSlides(): number {
    return this.banners ? this.banners.length : 0;
  }

  goToSlide(index: number): void {
    this.currentIndex = index;
    this.play();
  }

  getButtonText(bannerTitle: string): string {
    const titleLower = bannerTitle.toLowerCase();
    if (titleLower.includes('upgrade your home') || titleLower.includes('electronics')) {
      return 'Shop Electronics';
    } else if (titleLower.includes('smartwatch')) {
      return 'Explore Watches';
    } else if (titleLower.includes('game on') || titleLower.includes('consoles')) {
      return 'View Consoles';
    } else if (titleLower.includes('discover the latest models') || titleLower.includes('phone')) { 
      return 'See Phones';
    }
    return 'Explore More';
  }
}