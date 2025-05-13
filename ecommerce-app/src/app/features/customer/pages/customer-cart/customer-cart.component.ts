import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { CartService } from '../../../../core/services/cart.service';
import { Cart, CartItem } from '../../../../core/models/cart.model';
import { ProductSummary } from '../../../../core/models/product.model';

@Component({
  selector: 'app-customer-cart',
  standalone: false,
  templateUrl: './customer-cart.component.html',
  styleUrls: ['./customer-cart.component.scss']
})
export class CustomerCartComponent implements OnInit, OnDestroy {
  cart: Cart | null = null;
  loading: boolean = true;
  checkoutError: string | null = null;

  private cartSubscription?: Subscription;

  constructor(
    private cartService: CartService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loading = true;
    this.cartSubscription = this.cartService.cart$.subscribe(currentCart => {
      this.cart = currentCart;
      this.loading = !currentCart;
      if (!currentCart && !this.checkoutError) {
        this.checkoutError = null;
      } else if (currentCart) {
        this.checkoutError = null;
      }
    });

    this.cartService.getCart().subscribe({
        next: (fetchedCart) => {
            if (this.cart && this.cart.cartItems.length > 0) this.checkoutError = null;
            if (!fetchedCart && !this.cart) {
                this.loading = false;
            }
        },
        error: (err) => {
            this.checkoutError = 'Sepet yüklenirken bir hata oluştu.';
            this.loading = false;
        }
    });
  }

  ngOnDestroy(): void {
    this.cartSubscription?.unsubscribe();
  }

  navigateToProductDetails(productId: number): void {
    this.router.navigate(['/customer/product', productId]);
  }

  proceedToCheckout(): void {
    this.checkoutError = null;
    if (!this.cart || !this.cart.cartItems || this.cart.cartItems.length === 0) {
      this.checkoutError = 'Your cart is empty. Cannot proceed to checkout.';
      return;
    }
    this.router.navigate(['/customer/checkout'], {
      state: { cartFromNav: this.cart }
    });
  }

  removeFromCart(product: ProductSummary): void {
    if (product && product.productId) {
      this.cartService.removeItem(product.productId).subscribe({
        error: (err) => {
          this.checkoutError = 'An error occurred while removing the item from the cart.';
        }
      });
    }
  }

  updateQuantity(item: CartItem, newQuantity: number): void {
    if (newQuantity < 1) {
      this.removeFromCart(item.product);
      return;
    }
    this.cartService.updateItemQuantity(item.product.productId, newQuantity).subscribe({
      error: (err) => {
        this.checkoutError = 'An error occurred while updating the quantity.';
      }
    });
  }

  clearEntireCart(): void {
    this.cartService.clearCart().subscribe({
        next: () => {
        },
        error: (err) => {
            this.checkoutError = 'An error occurred while clearing the cart.';
        }
    });
  }
}
