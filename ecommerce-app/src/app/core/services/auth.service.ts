import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class AuthService {
  // Add a BehaviorSubject to track authentication state in real-time
  private readonly AUTH_USER_KEY = 'loggedInUser';
  private readonly AUTH_SESSION_KEY = 'authSession';

  constructor(private router: Router) {
    // Validate session on service initialization
    this.validateSession();
  }

  /**
   * Validates the current session to ensure both localStorage and sessionStorage are in sync
   * This prevents inconsistent auth states
   */
  private validateSession(): void {
    const hasUser = localStorage.getItem(this.AUTH_USER_KEY) !== null;
    const hasSession = sessionStorage.getItem(this.AUTH_SESSION_KEY) === 'true';
    
    // If there's a mismatch, clear everything to be safe
    if (hasUser !== hasSession) {
      this.clearAllAuthData();
    }
  }

  /**
   * Complete cleanup of all auth data
   */
  private clearAllAuthData(): void {
    localStorage.removeItem(this.AUTH_USER_KEY);
    sessionStorage.removeItem(this.AUTH_SESSION_KEY);
    // Also clear any other related auth data
    sessionStorage.removeItem('redirectUrl');
  }

  register(user: any): Observable<any> {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const exists = users.some((u: any) => u.email === user.email);
    if (exists) {
      return throwError(() => new Error('Email already registered'));
    }
    users.push(user);
    localStorage.setItem('users', JSON.stringify(users));
    return of(user);
  }

  login(credentials: any): Observable<any> {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const found = users.find(
      (u: any) =>
        u.email === credentials.email && u.password === credentials.password
    );
    if (found) {
      // Set both auth storage items
      localStorage.setItem(this.AUTH_USER_KEY, JSON.stringify(found));
      sessionStorage.setItem(this.AUTH_SESSION_KEY, 'true');
      return of(found);
    } else {
      return throwError(() => new Error('Invalid credentials'));
    }
  }

  logout(): void {
    // Remove user data from storage
    localStorage.removeItem('loggedInUser');
    sessionStorage.removeItem('authSession');
  
    // ALSO clear the shared favorites key
    localStorage.removeItem('favorites');
  
    // Redirect to login-required page
    this.router.navigate(['/home']);
  }

  /**
   * Checks if user is authenticated by verifying both localStorage and sessionStorage
   * This is the main method used by guards and components
   */
  isLoggedIn(): boolean {
    const hasUser = localStorage.getItem(this.AUTH_USER_KEY) !== null;
    const hasSession = sessionStorage.getItem(this.AUTH_SESSION_KEY) === 'true';
    
    return hasUser && hasSession;
  }

  getCurrentUser(): any {
    if (!this.isLoggedIn()) {
      return null;
    }
    const userData = localStorage.getItem(this.AUTH_USER_KEY);
    return userData ? JSON.parse(userData) : null;
  }
  
  /**
   * Force authentication check and redirect if not authenticated
   * This can be called from components to verify auth status
   */
  checkAuthAndRedirect(): boolean {
    if (!this.isLoggedIn()) {
      this.router.navigate(['/login-required']);
      return false;
    }
    return true;
  }
}