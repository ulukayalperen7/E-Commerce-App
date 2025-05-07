import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { Router }                        from '@angular/router';
import { BannerItem, BannerService } from '../../../core/services/banner.service';

@Component({
  selector: 'app-banner',
  standalone : false,
  templateUrl: './banner.component.html',
  styleUrls: ['./banner.component.scss']
})
export class BannerComponent implements OnInit, OnDestroy {
  @Input() routePrefix: string = '';
  items: BannerItem[] = [];
  currentIndex = 0;
  private intervalId!: any;
  private readonly delay = 3000;

  constructor(
    private bannerService: BannerService,
    private router: Router
  ) {}

  ngOnInit() {
    this.bannerService.getAll().subscribe(list => {
      this.items = list;
      this.play();
    });
  }

  ngOnDestroy() {
    this.pause();
  }

  play() {
    this.pause();
    this.intervalId = setInterval(() => this.next(), this.delay);
  }

  pause() {
    clearInterval(this.intervalId);
  }

  next() {
    this.currentIndex = (this.currentIndex + 1) % this.items.length;
  }

  prev() {
    this.currentIndex = (this.currentIndex - 1 + this.items.length) % this.items.length;
  }

  goToCategory(item: BannerItem) {
    if ( this.router.url.startsWith('/customer') ) {
      this.router.navigate(['/customer','category', item.categoryId]);
    } else {
      this.router.navigate(['/category', item.categoryId, item.name]);
    }
  }
}