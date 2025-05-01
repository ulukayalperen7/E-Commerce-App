import { Component, OnInit } from '@angular/core';
import { ActivatedRoute }      from '@angular/router';
import { ProductService } from '../../../../core/services/product.service';
import { Product } from '../../../../core/models/product.model';

@Component({
  selector: 'app-category-products',
  standalone:false,
  templateUrl: './category-products.component.html',
  styleUrls: ['./category-products.component.scss']
})
export class CategoryProductsComponent implements OnInit {
  categoryId = 0;
  products: Product[] = [];
  loading = true;

  constructor(
    private route: ActivatedRoute,
    private productService: ProductService
  ) {}

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam === null) {
      throw new Error('Category ID parametresi eksik');
    }
    this.categoryId = +idParam;

    this.productService.getProductsByCategory(this.categoryId)
      .subscribe((list: Product[]) => {
        this.products = list;
        this.loading = false;
      });
  }
}
