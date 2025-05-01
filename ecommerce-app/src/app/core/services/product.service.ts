import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Product } from '../models/product.model';

@Injectable({ providedIn: 'root' })
export class ProductService {
  private mockProducts: Product[] = [
    { id: 1, name: 'Smartphone', categoryId: 1, price: 299, description: '...', imageUrl: '...' },
    // Diğer ürünler...
  ];

  getProductsByCategory(categoryId: number): Observable<Product[]> {
    return of(this.mockProducts.filter(p => p.categoryId === categoryId));
  }

  getAllProducts(): Observable<Product[]> {
    return of(this.mockProducts);
  }
}