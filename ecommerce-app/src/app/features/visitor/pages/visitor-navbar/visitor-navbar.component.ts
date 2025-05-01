import { Component, HostListener, OnInit } from '@angular/core';
import { Category, CategoryService } from '../../../../core/services/category.service';

@Component({
  selector: 'app-visitor-navbar',
  standalone: false,
  templateUrl: './visitor-navbar.component.html',
  styleUrls: ['./visitor-navbar.component.scss']
})
export class VisitorNavbarComponent implements OnInit {
  categories: Category[] = [];
  isNavbarHidden = false;
  navbarHeight = 0;

  constructor(private categoryService: CategoryService) {}

  ngOnInit() {
    this.categoryService.getAll().subscribe(cats => this.categories = cats);

    this.updateNavbarHeight();
  }

  @HostListener('window:scroll', [])
  onWindowScroll() {
    const scrollY = window.scrollY || document.documentElement.scrollTop;
    this.isNavbarHidden = scrollY > 100;
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
    const menu = document.querySelector('.categories-menu');
    menu?.classList.toggle('open');
  }
}
