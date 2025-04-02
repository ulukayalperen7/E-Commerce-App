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
    { id: 1, name: 'Product 1', price: 100 },
    { id: 2, name: 'Product 2', price: 200 },
    { id: 3, name: 'Product 3', price: 300 }
  ];

  constructor(private fb: FormBuilder) { 
    this.searchForm = this.fb.group({
      search: ['']
    });
  }

  onSubmit() {
    const searchTerm = this.searchForm.value.search;
    console.log('Searching for:', searchTerm);
  }
}
