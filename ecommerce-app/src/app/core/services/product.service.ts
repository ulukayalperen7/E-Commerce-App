import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ProductDetail, ProductSummary, Page } from '../models/product.model';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private baseUrl = 'http://localhost:8080/api/v1/products';

  constructor(private http: HttpClient) { }

  getAllActiveProducts(
    page: number = 0,
    size: number = 10,
    sortField: string = 'productId',
    sortDirection: string = 'asc'
  ): Observable<Page<ProductSummary>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sort', `${sortField},${sortDirection}`);
    return this.http.get<Page<ProductSummary>>(this.baseUrl, { params });
  }

  getProductById(productId: number): Observable<ProductDetail> {
    const url = `${this.baseUrl}/${productId}`;
    return this.http.get<ProductDetail>(url);
  }

  getActiveProductsByCategory(
    categoryId: number,
    page: number = 0,
    size: number = 10,
    sortField: string = 'productId',
    sortDirection: string = 'asc'
  ): Observable<Page<ProductSummary>> {
    const url = `${this.baseUrl}/category/${categoryId}`;
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sort', `${sortField},${sortDirection}`);
    return this.http.get<Page<ProductSummary>>(url, { params });
  }

  getActiveProductsByBrand(
    brandId: number,
    page: number = 0,
    size: number = 10,
    sortField: string = 'productId',
    sortDirection: string = 'asc'
  ): Observable<Page<ProductSummary>> {
    const url = `${this.baseUrl}/brand/${brandId}`;
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sort', `${sortField},${sortDirection}`);
    return this.http.get<Page<ProductSummary>>(url, { params });
  }

  searchActiveProducts(
    searchTerm?: string,
    categoryId?: number,
    brandId?: number,
    page: number = 0,
    size: number = 10,
    sortField: string = 'name',
    sortDirection: string = 'asc'
  ): Observable<Page<ProductSummary>> {
    const url = `${this.baseUrl}/search`;
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sort', `${sortField},${sortDirection}`);

    if (searchTerm && searchTerm.trim() !== '') {
      params = params.append('searchTerm', searchTerm);
    }
    if (categoryId !== undefined && categoryId !== null) {
      params = params.append('categoryId', categoryId.toString());
    }
    if (brandId !== undefined && brandId !== null) {
      params = params.append('brandId', brandId.toString());
    }
    return this.http.get<Page<ProductSummary>>(url, { params });
  }
}