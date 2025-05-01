import { Component, OnInit } from '@angular/core';
import { Category, CategoryService } from '../../../core/services/category.service';

@Component({
  selector: 'app-category-nav',
  standalone: false,
  templateUrl: './category-nav.component.html',
  styleUrls: ['./category-nav.component.scss']
})
export class CategoryNavComponent implements OnInit {
  categories: Category[] = [];

  constructor(private categoryService: CategoryService) {}

  ngOnInit() {
    this.categoryService.getAll().subscribe(data => {
      this.categories = data;
    });
  }
}
