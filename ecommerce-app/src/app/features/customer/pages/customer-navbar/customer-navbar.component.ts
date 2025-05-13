import { Component, OnInit, OnDestroy, HostListener, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Category } from '../../../../core/models/category.model';
import { CategoryService } from '../../../../core/services/category.service';
import { AuthService } from '../../../../core/services/auth.service';
import { Subscription, fromEvent } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

@Component({
  selector: 'app-customer-navbar',
  standalone: false,
  templateUrl: './customer-navbar.component.html',
  styleUrls: ['./customer-navbar.component.scss']
})
export class CustomerNavbarComponent implements OnInit, OnDestroy {
  searchForm: FormGroup;
  categories: Category[] = [];
  categoriesOpen = false;
  profileMenuOpen = false;

  navbarHeight = 70;
  isNavbarHidden = false;
  private lastScrollPosition = 0;
  private scrollSubscription!: Subscription;

  profileMenu = [
    { label: 'My Profile', path: '/customer/profile' },
    { label: 'Order History', path: '/customer/order-history' },
  ];

  constructor(
    private fb: FormBuilder,
    private categoryService: CategoryService,
    private authService: AuthService,
    private router: Router,
    private elRef: ElementRef
  ) {
    this.searchForm = this.fb.group({
      query: ['']
    });
  }

  ngOnInit(): void {
    this.loadCategories();
    if (typeof window !== "undefined") {
      this.scrollSubscription = fromEvent(window, 'scroll')
        .pipe(debounceTime(50))
        .subscribe(() => this.handleScroll());
    }
  }

  ngOnDestroy() {
    if (this.scrollSubscription) {
      this.scrollSubscription.unsubscribe();
    }
  }

  handleScroll() {
    const currentScrollPosition = window.pageYOffset || document.documentElement.scrollTop;
    if (currentScrollPosition < 0) return;
    if (currentScrollPosition > this.navbarHeight && currentScrollPosition > this.lastScrollPosition) {
      this.isNavbarHidden = true;
    } else {
      this.isNavbarHidden = false;
    }
    this.lastScrollPosition = currentScrollPosition;
  }

  loadCategories(): void {
    this.categoryService.getAllCategories().subscribe(data => {
      this.categories = data;
    });
  }

  toggleCategories(): void {
    this.categoriesOpen = !this.categoriesOpen;
    this.profileMenuOpen = false;
  }

  toggleProfileMenu(): void {
    this.profileMenuOpen = !this.profileMenuOpen;
    this.categoriesOpen = false;
  }

  onSearch(): void {
    const query = this.searchForm.value.query?.trim();
    if (query) {
      this.router.navigate(['/customer/search'], { queryParams: { q: query } });
      this.searchForm.reset();
    }
  }

  onLogout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  @HostListener('document:click', ['$event'])
  clickOutside(event: Event) {
    const categoriesWrapper = this.elRef.nativeElement.querySelector('.categories-wrapper');
    if (this.categoriesOpen && categoriesWrapper && !categoriesWrapper.contains(event.target as Node)) {
      this.categoriesOpen = false;
    }

    const profileDropdown = this.elRef.nativeElement.querySelector('.profile-dropdown');
    if (this.profileMenuOpen && profileDropdown && !profileDropdown.contains(event.target as Node)) {
      this.profileMenuOpen = false;
    }
  }
}