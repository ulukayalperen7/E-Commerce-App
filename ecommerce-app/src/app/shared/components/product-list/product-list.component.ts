import { Component } from '@angular/core';

@Component({
  selector: 'app-product-list',
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.scss'],
  standalone : false
})
export class ProductListComponent {
  products = [
    { name: 'Telefon', price: 10000 },
    { name: 'Laptop', price: 25000 },
    { name: 'Tablet', price: 8000 }
  ];
}
