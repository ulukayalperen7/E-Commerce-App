import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-product-management',
  standalone: false,
  templateUrl: './product-management.component.html',
  styleUrls: ['./product-management.component.scss']
})
export class ProductManagementComponent implements OnInit {
  products = [
    { id: 1, name: 'Laptop', price: 1200, stock: 10 },
    { id: 2, name: 'Smartphone', price: 800, stock: 5 },
    { id: 3, name: 'Headphones', price: 200, stock: 20 }
  ];

  constructor() {}

  ngOnInit(): void {}

  deleteProduct(id: number): void {
    this.products = this.products.filter(p => p.id !== id);
  }
}
