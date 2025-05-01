import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Product } from '../models/product.model';

@Injectable({ providedIn: 'root' })
export class CartService {
  private items: Product[] = [];
  private itemsSubject = new BehaviorSubject<Product[]>([]);
  items$: Observable<Product[]> = this.itemsSubject.asObservable();

  add(product: Product): void {
    this.items = [...this.items, product];
    this.itemsSubject.next(this.items);
  }

  remove(productId: number): void {
    this.items = this.items.filter(p => p.id !== productId);
    this.itemsSubject.next(this.items);
  }

  clear(): void {
    this.items = [];
    this.itemsSubject.next(this.items);
  }

  getCount(): number {
    return this.items.length;
  }

  getItemsSnapshot(): Product[] {
    return [...this.items];
  }
}
