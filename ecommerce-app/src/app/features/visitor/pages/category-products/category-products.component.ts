import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Product } from '../../../../core/models/product.model';
import { ProductService } from '../../../../core/services/product.service';

@Component({
  selector: 'app-category-products',
  standalone: false,
  templateUrl: './category-products.component.html',
  styleUrls: ['./category-products.component.scss']
})
export class CategoryProductsComponent implements OnInit {
  categoryId = 0;
  categoryName = '';
  products: Product[] = [];
  loading = true;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productService: ProductService
  ) {}

  ngOnInit(): void {
    const idParam  = this.route.snapshot.paramMap.get('id');
    const nameParam = this.route.snapshot.paramMap.get('name');

    if (!idParam) {
      this.router.navigate(['/home']);
      return;
    }

    this.categoryId   = +idParam;
    this.categoryName = nameParam ?? 'Category';

    this.productService.getProductsByCategory(this.categoryId)
      .subscribe(list => {
        this.products = list;
        this.loading  = false;
      });
  }

  viewDetails(p: Product) {
    this.router.navigate(['/product', p.id]);
  }
}
