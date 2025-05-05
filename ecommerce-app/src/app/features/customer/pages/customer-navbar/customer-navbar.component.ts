import { Component, OnInit, HostListener } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { CategoryService } from '../../../../core/services/category.service';

@Component({
  selector: 'app-customer-navbar',
  standalone: false,
  templateUrl: './customer-navbar.component.html',
  styleUrls: ['./customer-navbar.component.scss']
})
export class CustomerNavbarComponent implements OnInit {
  searchForm!: FormGroup;
  categories: any[] = [];
  navbarHeight = 75;
  isNavbarHidden = false;
  lastScrollTop = 0;

  profileMenu = [
    { label: 'Profile', path: '/customer/profile' },
    { label: 'Order History', path: '/customer/order-history' }
  ];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private categoryService: CategoryService
  ) {}

  ngOnInit(): void {
    this.searchForm = this.fb.group({ query: [''] });
    this.categoryService.getAll().subscribe(data => this.categories = data);
    this.updateNavbarHeight();
  }

  @HostListener('window:scroll')
  onScroll(): void {
    const st = window.pageYOffset || document.documentElement.scrollTop;
    this.isNavbarHidden = st > this.lastScrollTop && st > 100;
    this.lastScrollTop = st <= 0 ? 0 : st;
  }

  onSearch(): void {
    const q = this.searchForm.value.query.trim();
    if (q) {
      this.router.navigate(['/customer/home'], { queryParams: { q } });
    }
  }

  onLogout(): void {
    this.router.navigate(['/home']);
  }

  private updateNavbarHeight(): void {
    setTimeout(() => {
      const nav = document.querySelector('.customer-navbar') as HTMLElement;
      this.navbarHeight = nav ? nav.offsetHeight : 0;
    });
  }
}