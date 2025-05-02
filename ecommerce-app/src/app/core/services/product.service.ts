import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Product } from '../models/product.model';

@Injectable({ providedIn: 'root' })
export class ProductService {
  private mockProducts: Product[] = [
    { id: 1,  name: 'Smartphone X12',           categoryId: 1, price: 299, description: 'Latest model with advanced camera',      imageUrl: 'assets/images/smartphone.jpg' },
    { id: 2,  name: 'Smart Watch Pro',          categoryId: 1, price: 150, description: 'Track fitness and notifications',        imageUrl: 'assets/images/smartwatch.jpg' },
    { id: 3,  name: 'Ultra Laptop 15"',         categoryId: 2, price: 999, description: 'Powerful performance for work and play', imageUrl: 'assets/images/laptop.jpg' },
    { id: 4,  name: 'Noise-Canceling Headphones',categoryId: 3, price: 89,  description: 'Premium sound quality',                  imageUrl: 'assets/images/headphones.jpg' },
    { id: 5,  name: 'Running Shoes Air',        categoryId: 4, price: 120, description: 'Lightweight and comfortable',            imageUrl: 'assets/images/shoes.jpg' },
    { id: 6,  name: 'Designer T-shirt',         categoryId: 5, price: 25,  description: '100% organic cotton',                    imageUrl: 'assets/images/tshirt.jpg' },
    { id: 7,  name: 'Wireless Earbuds',         categoryId: 3, price: 79,  description: 'Long battery life with charging case',   imageUrl: 'assets/images/earbuds.jpg' },
    { id: 8,  name: 'Gaming Mouse',             categoryId: 3, price: 45,  description: 'Adjustable DPI and RGB lighting',        imageUrl: 'assets/images/mouse.jpg' },
    { id: 9,  name: 'Fitness Tracker',          categoryId: 4, price: 65,  description: 'Heart rate and sleep monitoring',        imageUrl: 'assets/images/tracker.jpg' },
    { id: 10, name: 'Bluetooth Speaker',        categoryId: 3, price: 55,  description: 'Waterproof with 20h battery',            imageUrl: 'assets/images/speaker.jpg' },
    { id: 11, name: 'Digital Camera',           categoryId: 2, price: 445, description: 'High resolution with 4K video',          imageUrl: 'assets/images/camera.jpg' },
    { id: 12, name: 'Tablet Pro 10.5"',         categoryId: 2, price: 349, description: 'Full HD display with stylus support',    imageUrl: 'assets/images/tablet.jpg' }
  ];

  getProductsByCategory(categoryId: number): Observable<Product[]> {
    return of(this.mockProducts.filter(p => p.categoryId === categoryId));
  }

  getAllProducts(): Observable<Product[]> {
    return of(this.mockProducts);
  }
  getById(id: number): Observable<Product | undefined> {
    return of(this.mockProducts.find(p => p.id === id));
  }
}