import { Component, OnInit } from '@angular/core';
import { ActivatedRoute }      from '@angular/router';
import { Product }             from '../../../../core/models/product.model';
import { ProductService }      from '../../../../core/services/product.service';
import { CartService } from '../../../../core/services/cart.service';

@Component({
  selector: 'app-customer-category-products',
  standalone:false,
  templateUrl: './customer-category-products.component.html',
  styleUrls: ['./customer-category-products.component.scss']
})
export class CustomerCategoryProductsComponent implements OnInit {
  categoryId = 0;
  products: Product[] = [];
  loading = true;

  constructor(
    private route: ActivatedRoute,
    private productService: ProductService,
    private cartService: CartService
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

  addToCart(product: Product) {
    this.cartService.add(product);
  }
}
