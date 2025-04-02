import { Component, OnInit, OnDestroy } from '@angular/core';

@Component({
  selector: 'app-banner',
  standalone : false,
  templateUrl: './banner.component.html',
  styleUrls: ['./banner.component.scss']
})
export class BannerComponent implements OnInit, OnDestroy {
  items = [
    { image: 'path/to/image1.jpg', altText: 'Image 1' },
    { image: 'path/to/image2.jpg', altText: 'Image 2' },
    { image: 'path/to/image3.jpg', altText: 'Image 3' }
  ];

  currentIndex = 0;
  interval: any;

  ngOnInit() { 
    this.startAutoSlide();
  }

  ngOnDestroy() {
    if (this.interval) {
      clearInterval(this.interval);
    }
  }

  startAutoSlide() {
    this.interval = setInterval(() => {
      this.currentIndex = (this.currentIndex + 1) % this.items.length;
    }, 3000);
  }
}
