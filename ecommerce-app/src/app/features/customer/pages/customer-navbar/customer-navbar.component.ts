import { Component, OnInit, HostListener } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { Category, CategoryService } from '../../../../core/services/category.service';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-customer-navbar',
  standalone: false,
  templateUrl: './customer-navbar.component.html',
  styleUrls: ['./customer-navbar.component.scss']
})
export class CustomerNavbarComponent implements OnInit {
  searchForm!: FormGroup;
  categories: Category[] = [];

  categoriesOpen = false;

  navbarHeight = 0;

  isNavbarHidden = false;
  private lastScrollTop = 0;

  profileMenu = [
    { label: 'Profile', path: '/customer/profile' },
    { label: 'Order History', path: '/customer/order-history' }
  ];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private categoryService: CategoryService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.searchForm = this.fb.group({ query: [''] });
    this.categoryService.getAllCategories().subscribe({
      next: (fetchedCategories: Category[]) => {
        this.categories = fetchedCategories;
        console.log('CustomerNavbarComponent - Categories fetched successfully:', this.categories);
      },
      error: (err) => {
        console.error('CustomerNavbarComponent - Error fetching categories:', err);
      }
    });

    this.updateNavbarHeight();
  }

  toggleCategories(): void {
    this.categoriesOpen = !this.categoriesOpen;
  }

  @HostListener('window:scroll')
  onWindowScroll(): void {
    const st = window.pageYOffset || document.documentElement.scrollTop;
    this.isNavbarHidden = st > this.lastScrollTop && st > this.navbarHeight;
    this.lastScrollTop = st <= 0 ? 0 : st;
  }
  @HostListener('window:resize')
  onResize(): void {
    this.updateNavbarHeight();
  }

  onSearch(): void {
    const q = this.searchForm.value.query.trim();
    if (q) {
      this.router.navigate(['/customer/home'], { queryParams: { q } });
    }
  }

  onLogout(): void {
    this.authService.logout();
  }

  private updateNavbarHeight(): void {
    setTimeout(() => {
      const nav = document.querySelector('.customer-navbar') as HTMLElement;
      this.navbarHeight = nav ? nav.offsetHeight : 0;
    });
  }
}