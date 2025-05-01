import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Product } from '../../../../core/models/product.model';
import { ProductService } from '../../../../core/services/product.service';
import { CartService } from '../../../../core/services/cart.service';

@Component({
  selector: 'app-customer-category-products',
  standalone: false,
  templateUrl: './customer-category-products.component.html',
  styleUrls: ['./customer-category-products.component.scss']
})
export class CustomerCategoryProductsComponent implements OnInit {
  categoryId = 0;
  categoryName = '';
  products: Product[] = [];
  loading = true;

  constructor(
    private route: ActivatedRoute,
    private productService: ProductService,
    private cartService: CartService
  ) {}

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    const nameParam = this.route.snapshot.paramMap.get('name');

    if (!idParam) throw new Error('Category ID eksik');

    this.categoryId = +idParam;
    this.categoryName = nameParam ?? 'Category';

    this.productService.getProductsByCategory(this.categoryId)
      .subscribe((list: Product[]) => {
        this.products = list;
        this.loading = false;
      });
  }

  addToCart(product: Product): void {
    this.cartService.add(product);
  }
}
