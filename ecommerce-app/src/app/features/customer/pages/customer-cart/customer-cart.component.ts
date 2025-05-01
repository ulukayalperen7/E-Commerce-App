import { Component, OnInit } from '@angular/core';
import { CartService } from '../../../../core/services/cart.service';
import { Product } from '../../../../core/models/product.model';

@Component({
  selector: 'app-customer-cart',
  standalone: false,
  templateUrl: './customer-cart.component.html',
  styleUrls: ['./customer-cart.component.scss']
})
export class CustomerCartComponent implements OnInit {
  products: Product[] = [];
  loading: boolean = true;
  totalPrice: number = 0;

  constructor(private cartService: CartService) {}

  ngOnInit(): void {
    this.cartService.items$.subscribe(products => {
      this.products = products;
      this.calculateTotal();
      this.loading = false;
    });
  }

  removeFromCart(product: Product): void {
    this.cartService.remove(product.id);
  }

  checkout(): void {// we can return this later
    console.log('Checkout process');
  }

  private calculateTotal(): void {
    this.totalPrice = this.products.reduce((sum, product) => sum + product.price, 0);
  }
}
