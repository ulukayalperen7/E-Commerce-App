import { Injectable } from '@angular/core';
import {
  CanActivate,
  CanLoad,
  CanActivateChild,
  Route,
  UrlSegment,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  Router,
  UrlTree,
  NavigationExtras
} from '@angular/router';
import { AuthService } from '../services/auth.service';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate, CanLoad, CanActivateChild {
  constructor(private auth: AuthService, private router: Router) {}

  /**
   * Enhanced authentication check with better handling of redirects
   */
  private checkAuth(url?: string): boolean | UrlTree {
    // Check authentication status
    const isAuthenticated = this.auth.isLoggedIn();
    
    if (isAuthenticated) {
      return true;
    }
    
    // If not authenticated, save the attempted URL for redirection after login
    if (url) {
      sessionStorage.setItem('redirectUrl', url);
    }
    
    // Create navigation extras to pass information about the redirect
    const navigationExtras: NavigationExtras = {
      queryParams: { returnUrl: url || '/' }
    };
    
    // Redirect to login-required page with return URL info
    return this.router.createUrlTree(['/login-required'], navigationExtras);
  }

  // Protects direct route navigations
  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean | UrlTree | Observable<boolean | UrlTree> | Promise<boolean | UrlTree> {
    return this.checkAuth(state.url);
  }

  // Prevents lazy-loaded module from loading if not authenticated
  canLoad(
    route: Route, 
    segments: UrlSegment[]
  ): boolean | UrlTree | Observable<boolean | UrlTree> | Promise<boolean | UrlTree> {
    // Build the complete URL from segments
    const url = '/' + segments.map(segment => segment.path).join('/');
    return this.checkAuth(url);
  }

  // Protects all child routes within a guarded module
  canActivateChild(
    childRoute: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean | UrlTree | Observable<boolean | UrlTree> | Promise<boolean | UrlTree> {
    return this.checkAuth(state.url);
  }
}