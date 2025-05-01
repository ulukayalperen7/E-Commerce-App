import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Product } from '../../../../core/models/product.model';

type ProductView = Product & {
  originalPrice?: number;
  discount?: number;
  isFavorite?: boolean;
};

@Component({
  selector: 'app-home',
  standalone: false,
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  searchForm: FormGroup;

  products: ProductView[] = [
    { id: 1, name: 'Smartphone X12', categoryId: 1, price: 299, imageUrl: 'assets/images/smartphone.jpg', description: 'Latest model with advanced camera', isFavorite: false },
    { id: 2, name: 'Smart Watch Pro', categoryId: 1, price: 150, imageUrl: 'assets/images/smartwatch.jpg', description: 'Track fitness and notifications', isFavorite: false },
    { id: 3, name: 'Ultra Laptop 15"', categoryId: 2, price: 999, imageUrl: 'assets/images/laptop.jpg', description: 'Powerful performance for work and play', isFavorite: false },
    { id: 4, name: 'Noise-Canceling Headphones', categoryId: 3, price: 89, imageUrl: 'assets/images/headphones.jpg', description: 'Premium sound quality', isFavorite: false },
    { id: 5, name: 'Running Shoes Air', categoryId: 4, price: 120, imageUrl: 'assets/images/shoes.jpg', description: 'Lightweight and comfortable', isFavorite: false },
    { id: 6, name: 'Designer T-shirt', categoryId: 5, price: 25, imageUrl: 'assets/images/tshirt.jpg', description: '100% organic cotton', isFavorite: false },
    { id: 7, name: 'Wireless Earbuds', categoryId: 3, price: 79, imageUrl: 'assets/images/earbuds.jpg', description: 'Long battery life with charging case', isFavorite: false },
    { id: 8, name: 'Gaming Mouse', categoryId: 3, price: 45, imageUrl: 'assets/images/mouse.jpg', description: 'Adjustable DPI and RGB lighting', isFavorite: false },
    { id: 9, name: 'Fitness Tracker', categoryId: 4, price: 65, imageUrl: 'assets/images/tracker.jpg', description: 'Heart rate and sleep monitoring', isFavorite: false },
    { id: 10, name: 'Bluetooth Speaker', categoryId: 3, price: 55, imageUrl: 'assets/images/speaker.jpg', description: 'Waterproof with 20h battery', isFavorite: false },
    { id: 11, name: 'Digital Camera', categoryId: 2, price: 445, imageUrl: 'assets/images/camera.jpg', description: 'High resolution with 4K video', isFavorite: false },
    { id: 12, name: 'Tablet Pro 10.5"', categoryId: 2, price: 349, imageUrl: 'assets/images/tablet.jpg', description: 'Full HD display with stylus support', isFavorite: false }
  ];

  recommendedProducts: ProductView[] = [];
  flashDeals: ProductView[] = [];

  brands: string[] = [
    'Zara', 'Nike', 'New Balance', 'Ray-Ban', 'Fossil',
    'Apple', 'Puma', 'MSI', "L'Oréal", 'Xiaomi',
    'Samsung', 'Adidas', "Levi's", 'Sony', 'Gucci'
  ];

  constructor(private fb: FormBuilder) {
    this.searchForm = this.fb.group({
      search: ['']
    });
  }

  ngOnInit(): void {
    // Recommended (first 10)
    this.recommendedProducts = this.products.slice(0, 10).map(p => ({
      ...p,
      isFavorite: false
    }));

    // Flash deals (with discount info)
    this.flashDeals = [
      {
        ...this.products[2],
        originalPrice: 1299,
        price: 999,
        discount: 23,
        isFavorite: false
      },
      {
        ...this.products[4],
        originalPrice: 180,
        price: 120,
        discount: 33,
        isFavorite: false
      },
      {
        ...this.products[7],
        originalPrice: 60,
        price: 45,
        discount: 25,
        isFavorite: false
      },
      {
        ...this.products[9],
        originalPrice: 85,
        price: 55,
        discount: 35,
        isFavorite: false
      }
    ];
  }

  onSubmit(): void {
    const searchTerm = this.searchForm.value.search?.toLowerCase() || '';
    this.filterProducts(searchTerm);
  }

  filterProducts(searchTerm: string): void {
    if (!searchTerm) {
      this.recommendedProducts = this.products.slice(0, 10);
      return;
    }

    const filtered = this.products.filter(product =>
      product.name.toLowerCase().includes(searchTerm) ||
      product.description.toLowerCase().includes(searchTerm)
    );

    this.recommendedProducts = filtered.slice(0, 10);
  }

  toggleFavorite(product: ProductView): void {
    product.isFavorite = !product.isFavorite;
  }
}
