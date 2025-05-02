import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Category }   from './category.service';

export interface BannerItem {
  categoryId: number;
  name:       string;
  image:      string;
  title:      string;
  buttonText: string;
}

@Injectable({ providedIn: 'root' })
export class BannerService {
  private items: BannerItem[] = [
    {
      categoryId: 1,
      name:       'Skin Care',
      image:      'assets/images/banner2.jpg',
      title:      'Radiant Skin Care',
      buttonText: 'Explore Skincare'
    },
    {
      categoryId: 2,
      name:       'Stylish Shoes',
      image:      'assets/images/banner4.jpg',
      title:      'New Trendy Footwear',
      buttonText: 'View Shoes'
    },
    {
      categoryId: 1,       
      name:       'Computers',
      image:      'assets/images/banner3.jpg',
      title:      'Latest Computer Deals',
      buttonText: 'Dive into Tech'
    },
    {
      categoryId: 4,
      name:       'Fitness Gear',
      image:      'assets/images/banner1.jpg',
      title:      'Get Fit & Strong',
      buttonText: 'Shop Fitness'
    }
  ];

  getAll(): Observable<BannerItem[]> {
    return of(this.items);
  }
}