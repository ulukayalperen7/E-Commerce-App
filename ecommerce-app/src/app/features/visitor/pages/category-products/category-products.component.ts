import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { ProductSummary, Page } from '../../../../core/models/product.model';
import { ProductService } from '../../../../core/services/product.service';
import { AuthService } from '../../../../core/services/auth.service';
import { CategoryService } from '../../../../core/services/category.service';
import { Category } from '../../../../core/models/category.model';

interface ProductView extends ProductSummary {
  isFavorite: boolean;
  reviewCount?: number;
  originalPrice?: number;
}

@Component({
  selector: 'app-category-products',
  standalone: false,
  templateUrl: './category-products.component.html',
  styleUrls: ['./category-products.component.scss']
})
export class CategoryProductsComponent implements OnInit, OnDestroy {
  categoryId: number = 0;
  categoryName: string = 'Category';
  productsForView: ProductView[] = [];
  productsPage?: Page<ProductSummary>;
  currentPage: number = 0;
  pageSize: number = 8;
  loading: boolean = true;

  private routeSub?: Subscription;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productService: ProductService,
    private authService: AuthService,
    private categoryService: CategoryService
  ) {}

  ngOnInit(): void {
    this.routeSub = this.route.paramMap.subscribe(params => {
      const idParam = params.get('id');
      if (!idParam || isNaN(+idParam)) {
        this.router.navigate(['/home']);
        return;
      }

      const newId = +idParam;
      if (this.categoryId !== newId) {
        this.categoryId = newId;
        this.currentPage = 0;
        this.loadCategoryDetailsAndProducts();
      }
    });
  }

  ngOnDestroy(): void {
    this.routeSub?.unsubscribe();
  }

  loadCategoryDetailsAndProducts(): void {
    this.loading = true;

    this.categoryService.getCategoryById(this.categoryId).subscribe({
      next: (category: Category) => {
        this.categoryName = category.name;
        this.loadProducts();
      },
      error: (error) => {
        this.categoryName = 'Unknown Category';
        this.loadProducts();
      }
    });
  }

  loadProducts(): void {
    this.productService.getActiveProductsByCategory(
      this.categoryId,
      this.currentPage,
      this.pageSize,
      'name',
      'asc'
    ).subscribe({
      next: (pageData: Page<ProductSummary>) => {
        this.productsPage = pageData;
        this.productsForView = pageData.content.map(p => ({
          ...p,
          isFavorite: false,
          reviewCount: p.averageRating ? Math.floor(p.averageRating * 20) : 0
        }));
        this.loading = false;
      },
      error: (error) => {
        this.productsForView = [];
        this.productsPage = undefined;
        this.loading = false;
      }
    });
  }

  onPageChange(newPage: number): void {
    if (newPage < 0 || (this.productsPage && newPage >= this.productsPage.totalPages)) {
      return;
    }
    this.currentPage = newPage;
    this.loadProducts();
  }

  viewDetails(product: ProductView): void {
    this.router.navigate(['/product', product.productId]);
  }

  addToCart(product: ProductView): void {
    this.router.navigate(['/login-required'], { queryParams: { returnUrl: this.router.url } });
  }

  onFavoriteClick(product: ProductView, event: Event): void {
    event.stopPropagation();
    this.router.navigate(['/login-required'], { queryParams: { returnUrl: this.router.url } });
  }
}