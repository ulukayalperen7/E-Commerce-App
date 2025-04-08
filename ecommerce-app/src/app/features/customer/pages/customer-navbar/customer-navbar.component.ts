import { Component } from '@angular/core';

@Component({
  selector: 'app-customer-navbar',
  standalone :false,
  templateUrl: './customer-navbar.component.html',
  styleUrls: ['./customer-navbar.component.scss']
})
export class CustomerNavbarComponent {
  isLoggedIn = true;  

  navLinks = [
    { path: '/home', label: 'Home' },
    { path: '/products', label: 'Products' }
  ];

  userLinks = [
    { path: '/customer/favorites', label: '❤️Favorites' },
    { path: '/customer/cart', label: '🛒 Cart' },
    { path: '/customer/profile', label: '👤 Profile' }
  ];

  profileMenu = [
    { path: '/customer/order-history', label: 'Orders' },
    { path: '/customer/personal-info', label: 'Personal Information' },
    { path: '/logout', label: 'Logout' }
  ];

  showProfileMenu = false;

  toggleProfileMenu() {
    this.showProfileMenu = !this.showProfileMenu;
  }
}
