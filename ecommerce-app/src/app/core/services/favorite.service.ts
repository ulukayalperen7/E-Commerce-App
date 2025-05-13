import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Observable, BehaviorSubject, of, throwError } from 'rxjs';
import { tap, catchError, map } from 'rxjs/operators';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';
import { Favorite, FavoriteRequest } from '../models/favorite.model';
import { ProductSummary, Page } from '../models/product.model';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class FavoriteService {
  private apiUrl = 'http://localhost:8080/api/v1/favorites';
  
  private favoriteProductIdsState = new BehaviorSubject<number[]>([]);
  public favoriteProductIds$ = this.favoriteProductIdsState.asObservable();

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private router: Router
  ) {
    this.authService.currentUser$.subscribe((user: User | null) => {
      if (user && user.userId) {
        this.loadUserFavoriteProductIdsFromServer();
      } else {
        this.favoriteProductIdsState.next([]);
      }
    });
  }

  private loadUserFavoriteProductIdsFromServer(): void {
    if (!this.authService.isLoggedIn()) {
      this.favoriteProductIdsState.next([]);
      return;
    }
    const params = new HttpParams().set('page', '0').set('size', '1000');
    this.http.get<Page<ProductSummary>>(`${this.apiUrl}`, { params, withCredentials: true }).pipe(
      map(page => page.content.map(product => product.productId)),
      catchError(() => {
        this.favoriteProductIdsState.next([]);
        return of([]);
      })
    ).subscribe(productIds => {
      this.favoriteProductIdsState.next(productIds);
    });
  }

  getUserFavoritesPage(page: number = 0, size: number = 10, sort: string[] = ['createdAt,desc']): Observable<Page<ProductSummary>> {
    if (!this.authService.isLoggedIn()) {
      const emptyPage: Page<ProductSummary> = { content: [], pageable: { pageNumber:0, pageSize:0,offset:0,paged:true,unpaged:false,sort:{empty:true,sorted:false,unsorted:true}}, totalPages: 0, totalElements: 0, last: true, size:0, number:0,sort:{empty:true,sorted:false,unsorted:true}, numberOfElements:0, first:true, empty:true };
      return of(emptyPage);
    }
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sort', sort.join(','));
    return this.http.get<Page<ProductSummary>>(this.apiUrl, { params, withCredentials: true });
  }

  addFavorite(productId: number): Observable<Favorite> {
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/login-required'], { queryParams: { returnUrl: this.router.url }});
      return throwError(() => new Error('User not logged in'));
    }
    const payload: FavoriteRequest = { productId };
    return this.http.post<Favorite>(this.apiUrl, payload, { withCredentials: true }).pipe(
      tap((addedFavorite) => {
        if (addedFavorite && addedFavorite.product) {
            const currentFavIds = this.favoriteProductIdsState.value;
            if (!currentFavIds.includes(addedFavorite.product.productId)) {
              this.favoriteProductIdsState.next([...currentFavIds, addedFavorite.product.productId]);
            }
        }
      }),
      catchError(this.handleError)
    );
  }

  removeFavorite(productId: number): Observable<string> {
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/login-required'], { queryParams: { returnUrl: this.router.url }});
      return throwError(() => new Error('User not logged in'));
    }
    return this.http.delete(`${this.apiUrl}/${productId}`, { responseType: 'text', withCredentials: true }).pipe(
      tap(() => {
        const currentFavIds = this.favoriteProductIdsState.value;
        this.favoriteProductIdsState.next(currentFavIds.filter(id => id !== productId));
      }),
      catchError(this.handleError)
    );
  }

  isFavorite(productId: number): boolean {
    return this.favoriteProductIdsState.value.includes(productId);
  }

  toggleFavoriteAndUpdateState(productId: number): Observable<Favorite | string> {
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/login-required'], { queryParams: { returnUrl: this.router.url }});
      return throwError(() => new Error('User not logged in'));
    }
    if (this.isFavorite(productId)) {
      return this.removeFavorite(productId);
    } else {
      return this.addFavorite(productId);
    }
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'Operation failed.';
     if (error.error instanceof ErrorEvent) {
       errorMessage = `Client-side error: ${error.error.message}`;
     } else {
        if (error.error && typeof error.error === 'string' && error.error.length < 250 && error.status !== 0) {
         errorMessage = error.error;
       } else if (error.message) {
         errorMessage = error.message;
       }
     }
    console.error('FavoriteService API Error:', errorMessage, error.status, error.error);
    return throwError(() => new Error(errorMessage));
  }
}
