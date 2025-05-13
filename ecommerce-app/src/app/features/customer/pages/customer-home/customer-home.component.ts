import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { ProductSummary, Page } from '../../../../core/models/product.model';
import { ProductService } from '../../../../core/services/product.service';
import { AuthService } from '../../../../core/services/auth.service';
import { CartService } from '../../../../core/services/cart.service';
import { FavoriteService } from '../../../../core/services/favorite.service';
import { Banner } from '../../../../core/models/banner.model';
import { BannerService } from '../../../../core/services/banner.service';
import { Subscription } from 'rxjs';

interface ProductView extends ProductSummary {
  isFavorite: boolean;
  description?: string;
  reviewCount?: number;
  originalPrice?: number;
  discount?: number;
}

@Component({
  selector: 'app-customer-home',
  standalone: false,
  templateUrl: './customer-home.component.html',
  styleUrls: ['./customer-home.component.scss']
})
export class CustomerHomeComponent implements OnInit, OnDestroy {
  searchForm: FormGroup;
  productsForView: ProductView[] = [];
  recommendedProducts: ProductView[] = [];
  flashDeals: ProductView[] = [];
  brandsMock: string[] = [];

  productsPage?: Page<ProductSummary>;
  currentPage: number = 0;
  pageSize: number = 24;
  
  currentSearchTerm?: string;
  selectedCategoryId?: number;
  selectedBrandId?: number;

  banners: Banner[] = [];
  loadingProducts: boolean = true;
  loadingBanners: boolean = true;

  private queryParamsSub?: Subscription;
  private favoritesSub?: Subscription;

  constructor(
    private fb: FormBuilder,
    private productService: ProductService,
    private authService: AuthService,
    private cartService: CartService,
    private router: Router,
    private favoriteService: FavoriteService,
    private bannerService: BannerService,
    private activatedRoute: ActivatedRoute
  ) {
    this.searchForm = this.fb.group({ search: [''] });
  }

  ngOnInit(): void {
    this.queryParamsSub = this.activatedRoute.queryParamMap.subscribe(params => {
      const query = params.get('q');
      if (query !== null && query !== this.currentSearchTerm) {
        this.currentSearchTerm = query;
        this.searchForm.get('search')?.setValue(query);
      }
      this.loadProducts();
    });
    this.loadBanners();

    this.favoritesSub = this.favoriteService.favoriteProductIds$.subscribe(favIds => {
      this.productsForView = this.productsForView.map(p => ({
        ...p,
        isFavorite: favIds.includes(p.productId)
      }));
      this.recommendedProducts = this.recommendedProducts.map(p => ({
        ...p,
        isFavorite: favIds.includes(p.productId)
      }));
      this.flashDeals = this.flashDeals.map(p => ({
        ...p,
        isFavorite: favIds.includes(p.productId)
      }));
    });
  }

  ngOnDestroy(): void {
    this.queryParamsSub?.unsubscribe();
    this.favoritesSub?.unsubscribe();
  }

  loadBanners(): void {
    this.loadingBanners = true;
    this.bannerService.getActiveBanners().subscribe({
      next: (data: Banner[]) => {
        this.banners = data;
        this.loadingBanners = false;
      },
      error: (err) => {
        console.error('CustomerHome - Error fetching banners:', err);
        this.loadingBanners = false;
      }
    });
  }

  loadProducts(page: number = 0): void {
    this.loadingProducts = true;
    this.currentPage = page;
    this.productService.searchActiveProducts(
      this.currentSearchTerm,
      this.selectedCategoryId,
      this.selectedBrandId,
      this.currentPage,
      this.pageSize,
      'name',
      'asc'
    ).subscribe({
      next: (pageData: Page<ProductSummary>) => {
        this.productsPage = pageData;
        this.productsForView = pageData.content.map(p_summary => ({
          ...p_summary,
          isFavorite: this.favoriteService.isFavorite(p_summary.productId),
          description: p_summary.name,
          reviewCount: p_summary.averageRating ? Math.floor(p_summary.averageRating * 10) : undefined,
        }));

        this.recommendedProducts = this.productsForView.slice(0, 10);
        this.flashDeals = this.productsForView.slice(10, 14);
        this.loadingProducts = false;
      },
      error: (err) => {
        console.error('CustomerHome - Error fetching products:', err);
        this.productsForView = [];
        this.recommendedProducts = [];
        this.flashDeals = [];
        this.productsPage = undefined;
        this.loadingProducts = false;
      }
    });
  }

  onSearchSubmit(): void {
    this.currentSearchTerm = this.searchForm.value.search?.trim();
    this.selectedCategoryId = undefined;
    this.selectedBrandId = undefined;
    this.loadProducts(0);
  }

  filterByCategory(categoryId: number): void {
    this.selectedCategoryId = categoryId;
    this.currentSearchTerm = undefined;
    this.selectedBrandId = undefined;
    this.loadProducts(0);
  }

  filterByBrand(brandId: number): void {
    this.selectedBrandId = brandId;
    this.currentSearchTerm = undefined;
    this.selectedCategoryId = undefined;
    this.loadProducts(0);
  }

  clearFilters(): void {
    this.selectedCategoryId = undefined;
    this.selectedBrandId = undefined;
    this.currentSearchTerm = undefined;
    this.searchForm.reset();
    this.loadProducts(0);
  }

  onViewDetails(product: ProductView): void {
    this.router.navigate(['/customer/product', product.productId]);
  }

  onAddToCart(product: ProductView): void {
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/login-required'], { queryParams: { returnUrl: this.router.url } });
      return;
    }
    this.cartService.add(product);
  }

  onFavoriteClick(product: ProductView, event: Event): void {
    event.stopPropagation();
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/login-required'], { queryParams: { returnUrl: this.router.url } });
      return;
    }

    const oldIsFavorite = product.isFavorite;

    this.favoriteService.toggleFavoriteAndUpdateState(product.productId).subscribe({
      next: () => {
        console.log(`Favorite status for product ${product.productId} toggled successfully on backend.`);
      },
      error: (err) => {
        console.error(`Error toggling favorite for product ${product.productId}:`, err);
        alert(err.message || 'Failed to update favorite status.');
      }
    });
  }

  onPageChange(newPage: number): void {
    this.loadProducts(newPage);
  }
}
