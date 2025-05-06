import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { Product } from '../../../../core/models/product.model';
import { ProductService } from '../../../../core/services/product.service';
import { CartService } from '../../../../core/services/cart.service';
import { FavoriteService } from '../../../../core/services/favorite.service';

/**
 * Interface to extend Product model with additional display properties
 */
interface ProductView extends Product {
  isFavorite: boolean;
  rating: number;
  brand: string;
  originalPrice?: number;
  discount?: number;
  reviewCount?: number;
}

@Component({
  selector: 'app-customer-category-products',
  standalone: false,
  templateUrl: './customer-category-products.component.html',
  styleUrls: ['./customer-category-products.component.scss']
})
export class CustomerCategoryProductsComponent implements OnInit, OnDestroy {
  categoryId = 0;
  categoryName = '';
  products: ProductView[] = [];
  loading = true;
  
  // Brands list for randomly assigning to products
  private brands = [
    'Zara', 'Nike', 'New Balance', 'Ray-Ban', 'Fossil', 'Apple',
    'Puma', 'MSI', "L'Oréal", 'Xiaomi', 'Samsung', 'Adidas',
    "Levi's", 'Sony', 'Gucci'
  ];
  
  private routeSub: Subscription | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productService: ProductService,
    private cartService: CartService,
    private favoriteService: FavoriteService
  ) {}

  ngOnInit(): void {
    // Subscribe to route parameters to get category ID and name
    this.routeSub = this.route.paramMap.subscribe(params => {
      const idParam = params.get('id');
      const nameParam = params.get('name');
      
      if (!idParam) {
        this.router.navigate(['/customer/home']);
        return;
      }
      
      const newId = +idParam;
      if (this.categoryId !== newId) {
        this.categoryId = newId;
        this.categoryName = nameParam ?? '';
        this.loadCategoryData();
      }
    });
  }

  ngOnDestroy(): void {
    // Clean up subscriptions to prevent memory leaks
    this.routeSub?.unsubscribe();
  }

  /**
   * Load products for the selected category
   */
  loadCategoryData(): void {
    this.loading = true;
    this.productService.getProductsByCategory(this.categoryId).subscribe({
      next: list => {
        // Transform product data to include display properties
        this.products = list.map(p => {
          const originalPrice = this.shouldApplyDiscount() ? this.calculateOriginalPrice(p.price) : undefined;
          
          return {
            ...p,
            isFavorite: this.favoriteService.isFavorite(p.id),
            rating: this.getInitialRating(p),
            brand: this.getRandomBrand(),
            originalPrice,
            reviewCount: this.getRandomReviewCount()
          };
        });
        this.loading = false;
      },
      error: err => {
        console.error('Error loading category products:', err);
        this.loading = false;
      }
    });
  }

  /**
   * Navigate to product details page
   */
  viewDetails(p: ProductView): void {
    this.router.navigate(['/customer/product', p.id]);
  }

  /**
   * Add product to cart
   */
  addToCart(product: ProductView): void {
    this.cartService.add(product);
  }

  /**
   * Toggle product favorite status
   */
  onFavoriteClick(p: ProductView, event: Event): void {
    event.stopPropagation();
    this.favoriteService.toggleFavorite(p.id);
    p.isFavorite = this.favoriteService.isFavorite(p.id);
  }

  /**
   * Generate a random rating if not provided
   */
  private getInitialRating(p: Product): number {
    const anyP = p as any;
    if (typeof anyP.rating === 'number') {
      return anyP.rating;
    }
    return +(Math.random() * 2 + 3).toFixed(1); // Random rating between 3.0 and 5.0
  }

  /**
   * Generate random review count
   */
  private getRandomReviewCount(): number {
    return Math.floor(Math.random() * 500) + 50; // Between 50 and 549 reviews
  }

  /**
   * Select a random brand from the brands array
   */
  private getRandomBrand(): string {
    const idx = Math.floor(Math.random() * this.brands.length);
    return this.brands[idx];
  }

  /**
   * Decide if we should show a discount for visual variety
   */
  private shouldApplyDiscount(): boolean {
    return Math.random() > 0.6; // 40% chance of having a discount
  }

  /**
   * Calculate the "original" price to show discount
   */
  private calculateOriginalPrice(currentPrice: number): number {
    const increasePercentage = Math.floor(Math.random() * 30) + 10; // 10-40% increase
    return +(currentPrice * (1 + increasePercentage / 100)).toFixed(2);
  }
}