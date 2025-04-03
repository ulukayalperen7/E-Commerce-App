
import { Component } from '@angular/core';

@Component({
  selector: 'app-navbar',
  standalone: false,
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent {
  isLoggedIn = false;

  navLinks = [
    { path: '/home', label: 'Home' },
    { path: '/products', label: 'Products' } 
  ];
  
  authLinks = [
    { path: '/login', label: 'Login' },
    { path: '/register', label: 'Register' } 
  ];

  userLinks = [
    { path: '/customer/profile', label: 'Profile' }, 
    { path: '/customer/order-history', label: 'Orders' },
    { path: '/logout', label: 'Logout' }
  ];
}