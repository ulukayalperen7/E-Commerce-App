import { Component, OnInit, OnDestroy } from '@angular/core';

@Component({
  selector: 'app-banner',
  standalone :false,
  templateUrl: './banner.component.html',
  styleUrls: ['./banner.component.scss']
})
export class BannerComponent implements OnInit, OnDestroy {
  items = [
    {
      image: 'assets/images/banner2.jpg',
      altText: 'Skin Care',
      title: 'Radiant Skin Care',
      buttonText: 'Explore Skincare'
    },
    {
      image: 'assets/images/banner4.jpg',
      altText: 'Stylish Shoes',
      title: 'New Trendy Footwear',
      buttonText: 'View Shoes'
    },
    {
      image: 'assets/images/banner3.jpg',
      altText: 'Computers',
      title: 'Latest Computer Deals',
      buttonText: 'Dive into Tech'
    },
    {
      image: 'assets/images/banner1.jpg',
      altText: 'Fitness Gear',
      title: 'Get Fit & Strong',
      buttonText: 'Shop Fitness'
    }
  ];
  currentIndex = 0;
  private intervalId!: any;
  private readonly delay = 3000;

  ngOnInit() {
    this.play();
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
    this.currentIndex =
      (this.currentIndex - 1 + this.items.length) % this.items.length;
  }
}
