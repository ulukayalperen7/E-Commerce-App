import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { ProductSummary, Page } from '../../../../core/models/product.model';
import { ProductService } from '../../../../core/services/product.service';
import { CartService } from '../../../../core/services/cart.service';
import { FavoriteService } from '../../../../core/services/favorite.service';
import { AuthService } from '../../../../core/services/auth.service';
import { CategoryService } from '../../../../core/services/category.service';
import { Category } from '../../../../core/models/category.model';

interface ProductView extends ProductSummary {
  isFavorite: boolean;
  reviewCount?: number;
  originalPrice?: number;
}

@Component({
  selector: 'app-customer-category-products',
  standalone: false,
  templateUrl: './customer-category-products.component.html',
  styleUrls: ['./customer-category-products.component.scss']
})
export class CustomerCategoryProductsComponent implements OnInit, OnDestroy {
  categoryId: number = 0;
  categoryName: string = 'Category';
  productsForView: ProductView[] = [];
  productsPage?: Page<ProductSummary>;
  currentPage: number = 0;
  pageSize: number = 8;
  loading: boolean = true;

  private routeSub?: Subscription;
  private favoritesSub?: Subscription;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productService: ProductService,
    private cartService: CartService,
    private favoriteService: FavoriteService,
    private authService: AuthService,
    private categoryService: CategoryService
  ) {}

  ngOnInit(): void {
    this.routeSub = this.route.paramMap.subscribe(params => {
      const idParam = params.get('id');
      if (!idParam || isNaN(+idParam)) {
        this.router.navigate(['/customer/home']);
        return;
      }

      const newId = +idParam;
      if (this.categoryId !== newId) {
        this.categoryId = newId;
        this.currentPage = 0;
        this.loadCategoryDetailsAndProducts();
      }
    });

    this.favoritesSub = this.favoriteService.favoriteProductIds$.subscribe(favIds => {
      this.productsForView = this.productsForView.map(p => ({
        ...p,
        isFavorite: favIds.includes(p.productId)
      }));
    });
  }

  ngOnDestroy(): void {
    this.routeSub?.unsubscribe();
    this.favoritesSub?.unsubscribe();
  }

  loadCategoryDetailsAndProducts(): void {
    this.loading = true;
    
    this.categoryService.getCategoryById(this.categoryId).subscribe({
      next: (category: Category) => {
        this.categoryName = category.name;
        this.loadProducts();
      },
      error: (error) => {
        console.error('Error loading category:', error);
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
          isFavorite: this.favoriteService.isFavorite(p.productId),
          reviewCount: p.averageRating ? Math.floor(p.averageRating * 20) : 0
        }));
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading products:', error);
        this.productsForView = [];
        this.productsPage = undefined;
        this.loading = false;
      }
    });
  }

  onPageChange(newPage: number): void {
    if (newPage < 0 || newPage >= (this.productsPage?.totalPages || 0)) return;
    
    this.currentPage = newPage;
    this.loadProducts();
  }

  viewDetails(product: ProductView): void {
    this.router.navigate(['/customer/product', product.productId]);
  }

  addToCart(product: ProductView): void {
    this.cartService.add(product);
  }

  onFavoriteClick(product: ProductView, event: Event): void {
    event.stopPropagation();
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/login-required'], { queryParams: { returnUrl: this.router.url } });
      return;
    }

    this.favoriteService.toggleFavoriteAndUpdateState(product.productId).subscribe({
      error: (error) => {
        alert(error.message || 'Failed to update favorite status.');
      }
    });
  }
}
