import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router }        from '@angular/router';
import { Product }                       from '../../../../core/models/product.model';
import { ProductService }                from '../../../../core/services/product.service';
import { Subscription }                  from 'rxjs';

@Component({
  selector: 'app-category-products',
  standalone: false,
  templateUrl: './category-products.component.html',
  styleUrls: ['./category-products.component.scss']
})
export class CategoryProductsComponent implements OnInit, OnDestroy {
  categoryId   = 0;
  categoryName = '';
  products: Product[] = [];
  loading = true;
  private routeSub: Subscription | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productService: ProductService
  ) {}

  ngOnInit(): void {
    this.routeSub = this.route.paramMap.subscribe(params => {
      const idParam   = params.get('id');
      const nameParam = params.get('name');

      if (!idParam) {
        this.router.navigate(['/home']);
        return;
      }

      const newId = +idParam;
      if (this.categoryId !== newId) {
        this.categoryId   = newId;
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
        this.loading  = false;
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
}
