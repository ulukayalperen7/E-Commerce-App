import { Component, HostListener, OnInit } from '@angular/core';
import { Category, CategoryService } from '../../../../core/services/category.service';

@Component({
  selector: 'app-visitor-navbar',
  standalone:false,
  templateUrl: './visitor-navbar.component.html',
  styleUrls: ['./visitor-navbar.component.scss']
})
export class VisitorNavbarComponent implements OnInit {
  categories: Category[] = [];
  categoriesOpen = false;
  isNavbarHidden = false;
  navbarHeight = 0;
  private lastScrollTop = 0;

  constructor(private categoryService: CategoryService) {}

  ngOnInit() {
    this.categoryService.getAll().subscribe(cats => this.categories = cats);
    this.updateNavbarHeight();
  }

  @HostListener('window:scroll', [])
  onWindowScroll() {
    const st = window.pageYOffset || document.documentElement.scrollTop;
    this.isNavbarHidden = st > this.lastScrollTop && st > this.navbarHeight;
    this.lastScrollTop = st <= 0 ? 0 : st;
  }

  @HostListener('window:resize', [])
  onResize() {
    this.updateNavbarHeight();
  }

  private updateNavbarHeight() {
    const nav = document.querySelector('.visitor-navbar') as HTMLElement;
    this.navbarHeight = nav ? nav.offsetHeight : 0;
  }

  toggleCategories() {
    this.categoriesOpen = !this.categoriesOpen;
  }
}