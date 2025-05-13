import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(private authService: AuthService) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    const authToken = this.authService.getToken();
    const isApiUrl = request.url.startsWith('http://localhost:8080/api/');

    if (authToken && isApiUrl) {
      const authReq = request.clone({
        setHeaders: {
          Authorization: `Bearer ${authToken}`
        }
      });
      console.log('AuthInterceptor: Token added to request for URL:', request.url);
      console.log('AuthInterceptor: Authorization Header:', authReq.headers.get('Authorization'));
      return next.handle(authReq);
    }

    console.log('AuthInterceptor: No token added for URL:', request.url);
    return next.handle(request);
  }
}