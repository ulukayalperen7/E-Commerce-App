import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  register(user: any): Observable<any> {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
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
      localStorage.setItem('loggedInUser', JSON.stringify(found));
      return of(found);
    } else {
      return throwError(() => new Error('Invalid credentials'));
    }
  }

  logout() {
    localStorage.removeItem('loggedInUser');
  }

  isLoggedIn(): boolean {
    return localStorage.getItem('loggedInUser') !== null;
  }
}
