import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

export interface Category {
  id: number;
  name: string;
}

@Injectable({ providedIn: 'root' })
export class CategoryService {
  private categories: Category[] = [
    { id: 1, name: 'Electronics' },
    { id: 2, name: 'Fashion' },
    { id: 3, name: 'Home' },
    { id: 4, name: 'Books' }
  ];

  getAll(): Observable<Category[]> {
    return of(this.categories);
  }
}
