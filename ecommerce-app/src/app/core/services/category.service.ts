import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http'; // Import HttpClient
import { Observable } from 'rxjs';

// This interface should ideally match your backend's CategoryResponseDto
// You might need to adjust it based on the actual fields returned by your API
// (e.g., slug, description, imageUrl etc.)
export interface Category {
  id: number;
  name: string;
  slug?: string; // Optional, if your backend sends it
  description?: string; // Optional
  imageUrl?: string; // Optional
  // Add other fields if they exist in your CategoryResponseDto
}

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  // The base URL of your backend API for categories
  // It's a good practice to move this to environment files (environment.ts, environment.prod.ts) later.
  private apiUrl = 'http://localhost:8080/api/v1/categories';

  // Inject HttpClient in the constructor
  constructor(private http: HttpClient) { }

  /**
   * Fetches all categories from the backend API.
   * @returns An Observable of an array of Category objects.
   */
  getAllCategories(): Observable<Category[]> {
    // Make an HTTP GET request to the apiUrl
    return this.http.get<Category[]>(this.apiUrl);
  }

  /**
   * Fetches a single category by its ID from the backend API.
   * (Uncomment and use if needed)
   * @param categoryId The ID of the category to fetch.
   * @returns An Observable of a Category object.
   */
  // getCategoryById(categoryId: number): Observable<Category> {
  //   const url = `${this.apiUrl}/${categoryId}`;
  //   return this.http.get<Category>(url);
  // }

  /**
   * Fetches a single category by its slug from the backend API.
   * (Uncomment and use if needed, ensure your backend supports this endpoint)
   * @param slug The slug of the category to fetch.
   * @returns An Observable of a Category object.
   */
  // getCategoryBySlug(slug: string): Observable<Category> {
  //   const url = `${this.apiUrl}/slug/${slug}`; // Matches your backend controller
  //   return this.http.get<Category>(url);
  // }

  // You can add other methods here later for creating, updating, or deleting categories
  // For example:
  // createCategory(categoryData: Omit<Category, 'id'>): Observable<Category> {
  //   return this.http.post<Category>(this.apiUrl, categoryData);
  // }
}