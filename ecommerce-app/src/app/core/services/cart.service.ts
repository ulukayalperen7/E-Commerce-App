import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, BehaviorSubject, of, throwError } from 'rxjs';
import { tap, catchError, map } from 'rxjs/operators';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';
import { Cart, CartItemRequest } from '../models/cart.model';
import { ProductSummary } from '../models/product.model';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private apiUrl = 'http://localhost:8080/api/v1/cart';
  
  private cartState = new BehaviorSubject<Cart | null>(null);
  public cart$ = this.cartState.asObservable();

  private guestSessionIdKey = 'guestCartSessionId_ecommerceApp_v1';

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private router: Router
  ) {
    this.authService.currentUser$.subscribe((user: User | null) => {
      if (user) {
        const guestSessionId = this.getGuestSessionId();
        if (guestSessionId) {
          this.mergeGuestCartAndLoadUserCart(guestSessionId);
        } else {
          this.loadUserCart();
        }
      } else {
        this.loadGuestCartOrCreateNew();
      }
    });
  }

  private updateCartState(cart: Cart | null): void {
    this.cartState.next(cart);
  }

  private getGuestSessionId(): string | null {
    return localStorage.getItem(this.guestSessionIdKey);
  }

  private setGuestSessionId(sessionId: string): void {
    localStorage.setItem(this.guestSessionIdKey, sessionId);
  }

  private removeGuestSessionId(): void {
    localStorage.removeItem(this.guestSessionIdKey);
  }

  private loadUserCart(): void {
    this.http.get<Cart>(this.apiUrl, { withCredentials: true }).pipe(
      catchError((err) => {
        this.updateCartState(null);
        return of(null);
      })
    ).subscribe(cart => {
      this.updateCartState(cart);
    });
  }

  private loadGuestCartOrCreateNew(): void {
    this.http.get<Cart>(this.apiUrl, { withCredentials: true }).pipe(
      catchError((err) => {
        this.updateCartState(null);
        this.removeGuestSessionId();
        return of(null);
      })
    ).subscribe(cart => {
      if (cart && cart.sessionId) {
          this.setGuestSessionId(cart.sessionId);
      } else {
          this.removeGuestSessionId();
      }
      this.updateCartState(cart);
    });
  }
  
  private mergeGuestCartAndLoadUserCart(guestSessionId: string): void {
    this.http.post<Cart>(`${this.apiUrl}/merge?guestSessionId=${guestSessionId}`, {}, { withCredentials: true })
      .pipe(
        tap(mergedCart => {
          this.updateCartState(mergedCart);
          this.removeGuestSessionId();
        }),
        catchError(err => {
          this.loadUserCart();
          this.removeGuestSessionId();
          return of(null);
        })
      ).subscribe();
  }

  public getCart(): Observable<Cart | null> {
    if (!this.cartState.value) {
        if(this.authService.isLoggedIn()){
            this.loadUserCart();
        } else {
            this.loadGuestCartOrCreateNew();
        }
    }
    return this.cart$;
  }

  addItem(productId: number, quantity: number = 1): Observable<Cart> {
    const payload: CartItemRequest = { productId, quantity };
    return this.http.post<Cart>(`${this.apiUrl}/items`, payload, { withCredentials: true }).pipe(
      tap(updatedCart => {
        this.updateCartState(updatedCart);
        if (!this.authService.isLoggedIn() && updatedCart && updatedCart.sessionId && !this.getGuestSessionId()) {
            this.setGuestSessionId(updatedCart.sessionId);
        }
      }),
      catchError(this.handleError)
    );
  }

  updateItemQuantity(productId: number, quantity: number): Observable<Cart> {
    return this.http.put<Cart>(`${this.apiUrl}/items/${productId}?quantity=${quantity}`, {}, { withCredentials: true }).pipe(
      tap(updatedCart => this.updateCartState(updatedCart)),
      catchError(this.handleError)
    );
  }

  removeItem(productId: number): Observable<Cart> {
    return this.http.delete<Cart>(`${this.apiUrl}/items/${productId}`, { withCredentials: true }).pipe(
      tap(updatedCart => this.updateCartState(updatedCart)),
      catchError(this.handleError)
    );
  }

  clearCart(): Observable<string> {
    return this.http.delete(`${this.apiUrl}`, { responseType: 'text' })
      .pipe(
        tap((message: string) => {
          this.cartState.next(null);
        }),
        catchError(this.handleError)
      );
  }

  add(product: ProductSummary, quantity: number = 1): void {
    this.addItem(product.productId, quantity).subscribe({
        next: (cart) => console.log(`Product ${product.productId} request processed by backend. Current cart:`, cart),
        error: err => console.error(`Error adding product ${product.productId} to cart:`, err)
    });
  }

  remove(productIdToRemove: number): void {
     this.removeItem(productIdToRemove).subscribe({
        next: (cart) => console.log(`Product ${productIdToRemove} removed from cart.`, cart),
        error: err => console.error(`Error removing product ${productIdToRemove} from cart:`, err)
    });
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'Cart operation failed.';
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Client-side error: ${error.error.message}`;
    } else {
      if (error.error && typeof error.error.message === 'string') {
        errorMessage = error.error.message;
      } else if (typeof error.error === 'string' && error.error.length < 250) {
        errorMessage = error.error;
      } else if (error.message) {
        errorMessage = error.message;
      }
    }
    console.error('CartService API Error:', errorMessage, error.status, error.error);
    return throwError(() => new Error(errorMessage));
  }
}
