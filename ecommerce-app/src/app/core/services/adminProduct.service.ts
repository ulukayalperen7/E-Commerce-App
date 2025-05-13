import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

import {
  ProductDetail,
  ProductSummary,
  Page,
  AdminProductRequestPayload
} from '../models/product.model';

@Injectable({
  providedIn: 'root'
})
export class AdminProductService {
  private readonly API_BASE_URL = 'http://localhost:8080/api';
  private adminApiUrl = `${this.API_BASE_URL}/admin/products`;

  constructor(private http: HttpClient) {}

  getProducts(params?: HttpParams): Observable<Page<ProductSummary>> {
    return this.http.get<Page<ProductSummary>>(this.adminApiUrl, { params }).pipe(
      catchError(this.handleError)
    );
  }

  getProductById(productId: any): Observable<ProductDetail> {
    return this.http.get<ProductDetail>(`${this.adminApiUrl}/${productId}`).pipe(
      catchError(this.handleError)
    );
  }

  createProduct(formData: FormData): Observable<ProductDetail> {
    return this.http.post<ProductDetail>(this.adminApiUrl, formData).pipe(
      catchError(this.handleError)
    );
  }

  updateProduct(productId: any, formData: FormData): Observable<ProductDetail> {
    return this.http.put<ProductDetail>(`${this.adminApiUrl}/${productId}`, formData).pipe(
      catchError(this.handleError)
    );
  }

  deleteProduct(productId: any): Observable<void> {
    return this.http.delete<void>(`${this.adminApiUrl}/${productId}`).pipe(
      catchError(this.handleError)
    );
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'An unknown error occurred. Please try again.';
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Network error: ${error.error.message}`;
    } else {
      errorMessage = `Server error (Code: ${error.status}): ${error.error?.message || error.message || 'Unknown server error'}`;
      if (typeof error.error === 'object' && error.error !== null) {
        console.error('Backend error details:', error.error);
      }
    }
    console.error('API Request Error:', errorMessage);
    return throwError(() => new Error('Product operation failed. Please check the console for more details and try again.'));
  }
}
