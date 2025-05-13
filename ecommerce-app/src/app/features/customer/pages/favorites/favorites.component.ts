import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { CartService } from '../../../../core/services/cart.service';
import { FavoriteService } from '../../../../core/services/favorite.service';
import { ProductSummary, Page } from '../../../../core/models/product.model';

interface ProductView extends ProductSummary {
  isFavorite: true;
  description?: string;
  reviewCount?: number;
  originalPrice?: number;
  discount?: number;
}

@Component({
  selector: 'app-favorites',
  standalone: false,
  templateUrl: './favorites.component.html',
  styleUrls: ['./favorites.component.scss']
})
export class FavoritesComponent implements OnInit {
  favoritesForView: ProductView[] = [];
  favoritesPage?: Page<ProductSummary>;
  currentPage: number = 0;
  pageSize: number = 8;
  loading: boolean = true;

  constructor(
    private favoriteService: FavoriteService,
    private authService: AuthService,
    private cartService: CartService,
    private router: Router
  ) { }

  ngOnInit(): void {
    if (this.authService.isLoggedIn()) {
      this.loadFavoritesPage();
    } else {
      this.loading = false;
      this.favoritesForView = [];
      this.router.navigate(['/login-required'], { queryParams: { returnUrl: this.router.url }});
    }
  }

  loadFavoritesPage(page: number = 0): void {
    this.loading = true;
    this.currentPage = page;
    this.favoriteService.getUserFavoritesPage(this.currentPage, this.pageSize).subscribe({
      next: (pageData: Page<ProductSummary>) => {
        this.favoritesPage = pageData;
        this.favoritesForView = pageData.content.map(p_summary => ({
          ...p_summary,
          isFavorite: true,
          description: p_summary.name,
          reviewCount: p_summary.averageRating ? Math.floor(p_summary.averageRating * 15) : undefined,
        }));
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        this.favoritesForView = [];
        this.favoritesPage = undefined;
      }
    });
  }

  onViewDetails(product: ProductView): void {
    this.router.navigate(['/customer/product', product.productId]);
  }

  onAddToCart(product: ProductView): void {
    this.cartService.add(product);
    this.router.navigate(['/customer/cart']);
  }

  onRemoveFavorite(product: ProductView): void {
    this.loading = true;
    this.favoriteService.removeFavorite(product.productId).subscribe({
      next: () => {
        this.loadFavoritesPage(this.currentPage); 
      },
      error: (err) => {
        this.loading = false;
        alert(err.message || 'Failed to remove favorite.');
      }
    });
  }

  onPageChange(newPage: number): void {
    this.loadFavoritesPage(newPage);
  }
}