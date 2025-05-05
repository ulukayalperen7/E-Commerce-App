import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class FavoriteService {
  private storageKey = 'favorites';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  /**
   * Retrieve the list of favorite product IDs.
   * If the user is not logged in, returns an empty array.
   */
  getFavorites(): number[] {
    if (!this.authService.isLoggedIn()) {
      return [];
    }
    const data = localStorage.getItem(this.storageKey);
    return data ? JSON.parse(data) : [];
  }

  /**
   * Add a product ID to favorites.
   * If the user is not logged in, redirects to the login-required page.
   */
  addFavorite(id: number): void {
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/login-required']);
      return;
    }

    const favSet = new Set(this.getFavorites());
    favSet.add(id);
    localStorage.setItem(this.storageKey, JSON.stringify(Array.from(favSet)));
  }

  /**
   * Remove a product ID from favorites.
   * If the user is not logged in, redirects to the login-required page.
   */
  removeFavorite(id: number): void {
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/login-required']);
      return;
    }

    const favSet = new Set(this.getFavorites());
    favSet.delete(id);
    localStorage.setItem(this.storageKey, JSON.stringify(Array.from(favSet)));
  }

  /**
   * Check whether a product ID is in favorites.
   * Always returns false for guests.
   */
  isFavorite(id: number): boolean {
    if (!this.authService.isLoggedIn()) {
      return false;
    }
    return this.getFavorites().includes(id);
  }
}