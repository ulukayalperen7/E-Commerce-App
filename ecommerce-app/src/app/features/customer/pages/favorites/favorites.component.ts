import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { CartService } from '../../../../core/services/cart.service';
import { ProductService } from '../../../../core/services/product.service';
import { FavoriteService } from '../../../../core/services/favorite.service';
import { Product } from '../../../../core/models/product.model';

type ProductView = Product & {
  isFavorite: boolean;
  rating: number;
  brand: string;
  originalPrice?: number;
  discount?: number;
  reviewCount?: number;
};


@Component({
  selector: 'app-favorites',
  standalone: false,
  templateUrl: './favorites.component.html',
  styleUrls: ['./favorites.component.scss']
})
export class FavoritesComponent implements OnInit {
  favorites: ProductView[] = [];

  private brands = [
    'Zara', 'Nike', 'New Balance', 'Ray-Ban', 'Fossil', 'Apple',
    'Puma', 'MSI', "L'Oréal", 'Xiaomi', 'Samsung', 'Adidas',
    "Levi's", 'Sony', 'Gucci'
  ];

  constructor(
    private productService: ProductService,
    private favoriteService: FavoriteService,
    private authService: AuthService,
    private cartService: CartService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadFavorites();
  }

  loadFavorites(): void {
    const favIds = this.favoriteService.getFavorites();
    this.productService.getAllProducts().subscribe(list => {
      this.favorites = list
        .filter(p => favIds.includes(p.id))
        .map(p => {
          const originalPrice = this.shouldApplyDiscount() ? this.calculateOriginalPrice(p.price) : undefined;
          return {
            ...p,
            isFavorite: true,
            rating: this.getInitialRating(p),
            brand: this.getRandomBrand(),
            originalPrice,
            reviewCount: this.getRandomReviewCount()
          };
        });
    });
  }

  onViewDetails(p: ProductView): void {
    this.router.navigate(['/customer/product', p.id]);
  }

  onAddToCart(p: ProductView): void {
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/login']);
    } else {
      this.cartService.add(p);
      this.router.navigate(['/customer/cart']);
    }
  }

  onRemoveFavorite(p: ProductView): void {
    this.favoriteService.removeFavorite(p.id);
    this.favorites = this.favorites.filter(x => x.id !== p.id);
  }

  private getInitialRating(p: Product): number {
    const anyP = p as any;
    if (typeof anyP.rating === 'number' && anyP.rating > 0) {
      return parseFloat(anyP.rating.toFixed(1));
    }
    return +(Math.random() * 2 + 3).toFixed(1);
  }

  private getRandomReviewCount(): number {
    return Math.floor(Math.random() * 500) + 50;
  }

  private getRandomBrand(): string {
    const idx = Math.floor(Math.random() * this.brands.length);
    return this.brands[idx];
  }

  private shouldApplyDiscount(): boolean {
    return Math.random() > 0.6;
  }

  private calculateOriginalPrice(currentPrice: number): number {
    const increasePercentage = Math.floor(Math.random() * 30) + 10;
    return +(currentPrice * (1 + increasePercentage / 100)).toFixed(2);
  }
}