import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Product } from '../../../../core/models/product.model';
import { ProductService } from '../../../../core/services/product.service';
import { AuthService } from '../../../../core/services/auth.service';
import { Subscription } from 'rxjs';

interface ProductView extends Product {
  isFavorite: boolean;
  rating: number;
  brand: string;
  originalPrice?: number;
  discount?: number;
  reviewCount?: number;
}

@Component({
  selector: 'app-category-products',
  standalone: false,
  templateUrl: './category-products.component.html',
  styleUrls: ['./category-products.component.scss']
})
export class CategoryProductsComponent implements OnInit, OnDestroy {
  categoryId = 0;
  categoryName = '';
  products: ProductView[] = [];
  loading = true;
  brands = [
    'Zara', 'Nike', 'New Balance', 'Ray-Ban', 'Fossil', 'Apple',
    'Puma', 'MSI', "L'Oréal", 'Xiaomi', 'Samsung', 'Adidas',
    "Levi's", 'Sony', 'Gucci'
  ];
  private routeSub: Subscription | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productService: ProductService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.routeSub = this.route.paramMap.subscribe(params => {
      const idParam = params.get('id');
      const nameParam = params.get('name');

      if (!idParam) {
        this.router.navigate(['/home']);
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
    this.routeSub?.unsubscribe();
  }

  loadCategoryData(): void {
    this.loading = true;
    this.productService.getProductsByCategory(this.categoryId).subscribe({
      next: list => {
        this.products = list.map(p => ({
          ...p,
          isFavorite: false,
          rating: this.getInitialRating(p),
          brand: this.getRandomBrand(),
          reviewCount: this.getRandomReviewCount()
        }));
        this.loading = false;
      },
      error: err => {
        console.error(err);
        this.loading = false;
      }
    });
  }

  private getInitialRating(p: Product): number {
    const anyP = p as any;
    if (typeof anyP.rating === 'number') {
      return anyP.rating;
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

  viewDetails(p: ProductView): void {
    this.router.navigate(['/product', p.id]);
  }

  onFavoriteClick(p: ProductView, event: Event): void {
    event.stopPropagation();
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/login']);
      return;
    }
    p.isFavorite = !p.isFavorite;
  }
}