import { Component, HostListener, OnInit, OnDestroy, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Category } from '../../../../core/models/category.model';
import { CategoryService } from '../../../../core/services/category.service';
import { Subscription, fromEvent } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

@Component({
  selector: 'app-visitor-navbar',
  standalone: false,
  templateUrl: './visitor-navbar.component.html',
  styleUrls: ['./visitor-navbar.component.scss']
})
export class VisitorNavbarComponent implements OnInit, OnDestroy {
  categories: Category[] = [];
  categoriesOpen = false;
  isNavbarHidden = false;
  navbarHeight = 70;
  private lastScrollPosition = 0;
  private scrollSubscription!: Subscription;

  visitorSearchForm: FormGroup;

  constructor(
    private categoryService: CategoryService,
    private router: Router,
    private elRef: ElementRef,
    private fb: FormBuilder
  ) {
    this.visitorSearchForm = this.fb.group({
      query: ['']
    });
  }

  ngOnInit() {
    this.loadCategories();
    this.updateNavbarHeight();
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

  loadCategories(): void {
    this.categoryService.getAllCategories().subscribe({
      next: (fetchedCategories: Category[]) => {
        this.categories = fetchedCategories;
      },
      error: (err) => {
        this.categories = [];
      }
    });
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

  @HostListener('window:resize', [])
  onResize() {
    this.updateNavbarHeight();
  }

  private updateNavbarHeight() {
    setTimeout(() => {
      const navEl = this.elRef.nativeElement.querySelector('.visitor-navbar') as HTMLElement;
      if (navEl) {
        this.navbarHeight = navEl.offsetHeight;
      }
    }, 0);
  }

  toggleCategories() {
    this.categoriesOpen = !this.categoriesOpen;
  }

  @HostListener('document:click', ['$event'])
  clickOutside(event: Event) {
    const categoriesWrapper = this.elRef.nativeElement.querySelector('.categories-wrapper');
    if (this.categoriesOpen && categoriesWrapper && !categoriesWrapper.contains(event.target as Node)) {
      this.categoriesOpen = false;
    }
  }

  onVisitorSearch(): void {
    const query = this.visitorSearchForm.value.query?.trim();
    if (query) {
      this.router.navigate(['/search'], { queryParams: { q: query } });
      this.visitorSearchForm.reset();
    }
  }
}