import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Product } from '../models/product.model';

@Injectable({ providedIn: 'root' })
export class CartService {
  private items: Product[] = [];
  private itemsSubject = new BehaviorSubject<Product[]>([]);
  items$: Observable<Product[]> = this.itemsSubject.asObservable();

  add(product: Product): void {
    const itemExists = this.items.some(p => p.id === product.id);
    if (itemExists) {
      return;
    }
    this.items.push(product);
    this.itemsSubject.next([...this.items]);
  }

  remove(productId: number): void {
    const index = this.items.findIndex(p => p.id === productId);
    if (index > -1) {
      this.items.splice(index, 1);
      this.itemsSubject.next([...this.items]);
    }
  }

  clear(): void {
    this.items = [];
    this.itemsSubject.next([]);
  }

  getCount(): number {
    return this.items.length;
  }

  getItemsSnapshot(): Product[] {
    return [...this.items];
  }
}
