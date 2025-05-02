import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Product } from '../../../../core/models/product.model';
import { ProductService } from '../../../../core/services/product.service';
import { CategoryService, Category } from '../../../../core/services/category.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-category-products',
  standalone: false,
  templateUrl: './category-products.component.html',
  styleUrls: ['./category-products.component.scss']
})
export class CategoryProductsComponent implements OnInit, OnDestroy {
  categoryId = 0;
  categoryName = '';
  products: Product[] = [];
  loading = true;
  private routeSubscription: Subscription | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productService: ProductService,
    private categoryService: CategoryService
  ) {}

  ngOnInit(): void {
    this.routeSubscription = this.route.paramMap.subscribe(params => {
      const idParam = params.get('id');
      if (!idParam) {
        this.router.navigate(['/home']);
        return;
      }
      const newCategoryId = +idParam;
      if (this.categoryId !== newCategoryId) {
        this.categoryId = newCategoryId;
        this.loadCategoryData();
      }
    });
  }

  ngOnDestroy(): void {
    this.routeSubscription?.unsubscribe();
  }

  loadCategoryData(): void {
    this.loading = true;

    this.categoryService.getAll().subscribe({
      next: (cats: Category[]) => {
        const found = cats.find(c => c.id === this.categoryId);
        this.categoryName = found ? found.name : 'Category';
      },
      error: (err) => console.error(err)
    });

    this.productService.getProductsByCategory(this.categoryId).subscribe({
      next: (list) => {
        this.products = list;
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.loading = false;
      }
    });
  }

  viewDetails(p: Product) {
    this.router.navigate(['/product', p.id]);
  }
}
