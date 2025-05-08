import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormControl, FormGroup } from '@angular/forms';

interface Product {
  id: number;
  name: string;
  price: number;
  stock: number;
}

@Component({
  selector: 'app-product-management',
  standalone: false,
  templateUrl: './product-management.component.html',
  styleUrls: ['./product-management.component.scss']
})
export class ProductManagementComponent implements OnInit {
  products: Product[] = [];
  filteredProducts: Product[] = [];

  filterForm = new FormGroup({
    filterText: new FormControl('')
  });

  constructor(private router: Router) {}

  ngOnInit(): void {
    // Dummy data
    this.products = [
      { id: 1, name: 'Laptop', price: 1200, stock: 10 },
      { id: 2, name: 'Smartphone', price: 800, stock: 5 },
      { id: 3, name: 'Headphones', price: 200, stock: 20 }
    ];
    this.filteredProducts = [...this.products];

    // Null-check ekleyerek subscribe et
    const ctrl = this.filterForm.get('filterText');
    if (ctrl) {
      ctrl.valueChanges.subscribe(txt => {
        const term = (txt || '').toLowerCase();
        this.filteredProducts = this.products.filter(p =>
          p.name.toLowerCase().includes(term)
        );
      });
    }
  }

  addProduct(): void {
    this.router.navigate(['/admin/product-management/add']);
  }

  editProduct(id: number): void {
    this.router.navigate([`/admin/product-management/edit`, id]);
  }

  deleteProduct(id: number): void {
    this.products = this.products.filter(p => p.id !== id);
    // filtre değerini tekrar uygula
    const ctrl = this.filterForm.get('filterText');
    const term = ctrl?.value?.toLowerCase() || '';
    this.filteredProducts = this.products.filter(p =>
      p.name.toLowerCase().includes(term)
    );
  }
}