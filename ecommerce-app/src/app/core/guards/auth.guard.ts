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

  private checkAuth(url?: string): boolean | UrlTree {
    const isAuthenticated = this.auth.isLoggedIn();

    if (isAuthenticated) {
      return true;
    }

    if (url) {
      sessionStorage.setItem('redirectUrl', url);
    }

    const navigationExtras: NavigationExtras = {
      queryParams: { returnUrl: url || '/' }
    };

    return this.router.createUrlTree(['/login-required'], navigationExtras);
  }

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean | UrlTree | Observable<boolean | UrlTree> | Promise<boolean | UrlTree> {
    return this.checkAuth(state.url);
  }

  canLoad(
    route: Route, 
    segments: UrlSegment[]
  ): boolean | UrlTree | Observable<boolean | UrlTree> | Promise<boolean | UrlTree> {
    const url = '/' + segments.map(segment => segment.path).join('/');
    return this.checkAuth(url);
  }

  canActivateChild(
    childRoute: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean | UrlTree | Observable<boolean | UrlTree> | Promise<boolean | UrlTree> {
    return this.checkAuth(state.url);
  }
}