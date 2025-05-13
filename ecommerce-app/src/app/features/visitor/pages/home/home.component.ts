import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { ProductSummary, Page } from '../../../../core/models/product.model';
import { ProductService } from '../../../../core/services/product.service';
import { AuthService } from '../../../../core/services/auth.service';
import { Subscription } from 'rxjs';

interface ProductView extends ProductSummary {
  isFavorite: boolean;
  description?: string;
  reviewCount?: number;
  originalPrice?: number;
  discount?: number;
}

@Component({
  selector: 'app-home',
  standalone: false,
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, OnDestroy {
  productsForView: ProductView[] = [];
  recommendedProducts: ProductView[] = [];
  flashDeals: ProductView[] = [];
  brandsMock: string[] = [];

  productsPage?: Page<ProductSummary>;
  currentPage: number = 0;
  pageSize: number = 24;
  
  currentSearchTerm?: string;
  loadingProducts: boolean = true;

  private queryParamsSub?: Subscription;

  constructor(
    private productService: ProductService,
    private authService: AuthService,
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.queryParamsSub = this.activatedRoute.queryParamMap.subscribe(params => {
      const query = params.get('q');
      if (query !== null && query !== this.currentSearchTerm) {
        this.currentSearchTerm = query;
      }
      this.loadProducts();
    });
    this.brandsMock = ['AzuL Brand', 'TechPro', 'Fashionista', 'HomeGoods', 'EcoLiving'];
  }

  ngOnDestroy(): void {
    this.queryParamsSub?.unsubscribe();
  }

  loadProducts(page: number = 0): void {
    this.loadingProducts = true;
    this.currentPage = page;
    this.productService.searchActiveProducts(
      this.currentSearchTerm,
      undefined, 
      undefined, 
      this.currentPage,
      this.pageSize,
      'name',
      'asc'
    ).subscribe({
      next: (pageData: Page<ProductSummary>) => {
        this.productsPage = pageData;
        this.productsForView = pageData.content.map(p_summary => ({
          ...p_summary,
          isFavorite: false,
          description: p_summary.name, 
          reviewCount: p_summary.averageRating ? Math.floor(p_summary.averageRating * 10) : undefined,
        }));

        this.recommendedProducts = this.productsForView.slice(0, 10);
        this.flashDeals = this.productsForView.slice(10, 14);

        this.loadingProducts = false;
      },
      error: (err) => {
        this.productsForView = [];
        this.recommendedProducts = [];
        this.flashDeals = [];
        this.productsPage = undefined;
        this.loadingProducts = false;
      }
    });
  }

  onViewDetails(product: ProductView): void {
    this.router.navigate(['/product', product.productId]);
  }

  onAddToCart(product: ProductView): void {
    this.router.navigate(['/login-required'], { queryParams: { returnUrl: this.router.url } });
  }

  onFavoriteClick(product: ProductView, event: Event): void {
    event.stopPropagation();
    this.router.navigate(['/login-required'], { queryParams: { returnUrl: this.router.url } });
  }

  onPageChange(newPage: number): void {
    if (newPage >= 0 && (!this.productsPage || newPage < this.productsPage.totalPages)) {
      this.loadProducts(newPage);
    }
  }
}