import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class FavoriteService {
  private storageKey = 'favorites';

  getFavorites(): number[] {
    const data = localStorage.getItem(this.storageKey);
    return data ? JSON.parse(data) : [];
  }

  addFavorite(id: number): void {
    const favs = new Set(this.getFavorites());
    favs.add(id);
    localStorage.setItem(this.storageKey, JSON.stringify(Array.from(favs)));
  }

  removeFavorite(id: number): void {
    const favs = new Set(this.getFavorites());
    favs.delete(id);
    localStorage.setItem(this.storageKey, JSON.stringify(Array.from(favs)));
  }

  isFavorite(id: number): boolean {
    return this.getFavorites().includes(id);
  }
}
