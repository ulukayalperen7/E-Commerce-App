import { Component } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-home',
  standalone: false,
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent { 
  searchForm: FormGroup;   // we will update the image links with asssets
  products = [
    { id: 1, name: 'Product 1', price: 100, image: 'data:imaER9k=' }
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
