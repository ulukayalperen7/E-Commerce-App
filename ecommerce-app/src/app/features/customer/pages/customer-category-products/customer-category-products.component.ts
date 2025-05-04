import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { Product } from '../../../../core/models/product.model';
import { ProductService } from '../../../../core/services/product.service';
import { CartService } from '../../../../core/services/cart.service';

@Component({
  selector: 'app-customer-category-products',
  standalone: false,
  templateUrl: './customer-category-products.component.html',
  styleUrls: ['./customer-category-products.component.scss']
})
export class CustomerCategoryProductsComponent implements OnInit, OnDestroy {
  categoryId = 0;
  categoryName = '';
  products: Product[] = [];
  loading = true;
  private routeSub: Subscription | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productService: ProductService,
    private cartService: CartService
  ) {}

  ngOnInit(): void {
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
    this.routeSub?.unsubscribe();
  }

  loadCategoryData(): void {
    this.loading = true;
    this.productService.getProductsByCategory(this.categoryId).subscribe({
      next: list => {
        this.products = list;
        this.loading = false;
      },
      error: err => {
        console.error(err);
        this.loading = false;
      }
    });
  }

  viewDetails(p: Product) {
    this.router.navigate(['/product', p.id]);
  }

  addToCart(product: Product) {
    this.cartService.add(product);
  }
}
