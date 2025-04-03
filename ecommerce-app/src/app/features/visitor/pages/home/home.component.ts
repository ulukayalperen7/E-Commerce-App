import { Component } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-home',
  standalone: false,
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent { 
  searchForm: FormGroup;
  products = [
    { id: 1, name: 'Product 1', price: 100, image: 'assets/product1.jpg' },
    { id: 2, name: 'Product 2', price: 200, image: 'assets/product2.jpg' },
    { id: 3, name: 'Product 3', price: 300, image: 'assets/product3.jpg' }
  ];
  filteredProducts = [...this.products];

  constructor(private fb: FormBuilder) { 
    this.searchForm = this.fb.group({
      search: ['']
    });
  }

  onSubmit() {
    const searchTerm = this.searchForm.value.search.toLowerCase();
    this.filteredProducts = this.products.filter(product =>
      product.name.toLowerCase().includes(searchTerm)
    );
  }
}
