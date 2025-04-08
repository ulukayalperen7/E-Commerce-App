import { Component } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-customer-home',
  standalone : false,
  templateUrl: './customer-home.component.html',
  styleUrls: ['./customer-home.component.scss']
})
export class CustomerHomeComponent {
  searchForm: FormGroup;
  products = [
    { id: 1, name: 'Product 1', price: 100, image: 'path_to_image_1.jpg' },
    { id: 2, name: 'Product 2', price: 150, image: 'path_to_image_2.jpg' },
    // more products
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
