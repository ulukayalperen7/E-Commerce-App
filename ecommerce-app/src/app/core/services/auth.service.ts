import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { AuthResponse, LoginCredentials, RegisterPayload } from '../models/auth.model';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:8080/api/v1/auth';
  private tokenKey = 'authToken_ecommerceApp_v3';
  private userKey = 'authUser_ecommerceApp_v3';

  private currentUserSubject: BehaviorSubject<User | null>;
  public currentUser$: Observable<User | null>;

  constructor(private http: HttpClient, private router: Router) {
    const storedUserJson = localStorage.getItem(this.userKey);
    const storedToken = localStorage.getItem(this.tokenKey);
    let initialUser: User | null = null;

    if (storedUserJson && storedToken) {
        try {
            initialUser = JSON.parse(storedUserJson);
        } catch (e) {
            localStorage.removeItem(this.userKey);
            localStorage.removeItem(this.tokenKey);
        }
    } else {
        localStorage.removeItem(this.userKey);
        localStorage.removeItem(this.tokenKey);
    }

    this.currentUserSubject = new BehaviorSubject<User | null>(initialUser);
    this.currentUser$ = this.currentUserSubject.asObservable();
  }

  public get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  private handleAuthResponse(response: AuthResponse): void {
    if (response && response.accessToken && response.user) {
      localStorage.setItem(this.tokenKey, response.accessToken);
      localStorage.setItem(this.userKey, JSON.stringify(response.user));
      this.currentUserSubject.next(response.user);
    } else {
      this.logout();
      throw new Error('Invalid auth response from server.');
    }
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'An unknown error occurred during authentication.';
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Error: ${error.error.message}`;
    } else {
      if (error.error && typeof error.error.message === 'string') {
        errorMessage = error.error.message;
      } else if (typeof error.error === 'string' && error.error.length < 250) {
        errorMessage = error.error;
      } else if (error.message) {
        errorMessage = error.message;
      }
    }
    console.error('AuthService API Error:', errorMessage, error.status, error.error);
    return throwError(() => new Error(errorMessage));
  }

  login(credentials: LoginCredentials): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, credentials).pipe(
      tap(response => this.handleAuthResponse(response)),
      catchError(this.handleError)
    );
  }

  register(payload: RegisterPayload): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, payload).pipe(
      tap(response => {
        this.handleAuthResponse(response);
      }),
      catchError(this.handleError)
    );
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
    this.currentUserSubject.next(null);
    sessionStorage.removeItem('redirectUrl');
    this.router.navigate(['/home']);
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  isLoggedIn(): boolean {
    const token = this.getToken();
    const user = this.currentUserValue;
    console.log('AuthService isLoggedIn check: Token exists?', !!token, 'User value exists?', !!user); 
    return !!token && !!user;
  }
}