import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Product } from '../../../../core/models/product.model';
import { CartService } from '../../../../core/services/cart.service';
import { AuthService } from '../../../../core/services/auth.service';
import { FavoriteService } from '../../../../core/services/favorite.service';

interface ProductDetails extends Product {
  brand: string;
  rating: number;
  reviewCount: number;
  originalPrice?: number;
  discount?: number;
  isFavorite: boolean;
  images: string[];
}

@Component({
  selector: 'app-customer-product-detail',
  standalone: false,
  templateUrl: './customer-product-detail.component.html',
  styleUrls: ['./customer-product-detail.component.scss']
})
export class CustomerProductDetailComponent implements OnInit {
  product: ProductDetails = this.generateMockProduct();

  constructor(
    private route: ActivatedRoute,
    private cartService: CartService,
    private authService: AuthService,
    private favoriteService: FavoriteService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const productId = params.get('id');
      if (productId) {
        this.product = this.generateMockProduct(+productId);
        // Check if the product is in favorites
        this.product.isFavorite = this.favoriteService.isFavorite(+productId);
      }
    });
  }

  private generateMockProduct(id: number = 1): ProductDetails {
    const price = Math.floor(Math.random() * 500) + 50;
    const discount = Math.random() > 0.5 ? Math.floor(Math.random() * 30) + 10 : undefined;
    const brands = ['Nike', 'Adidas', 'Apple', 'Sony', 'Samsung', 'Zara', "Levi's"];
    
    return {
      id: id,
      name: `Premium Product ${id}`,
      description: `High-quality product description for item ${id}.`,
      price: discount ? price * (1 - discount/100) : price,
      imageUrl: `https://picsum.photos/600/600?random=${id}`,
      categoryId: 1,
      
      brand: brands[id % brands.length],
      rating: +(Math.random() * 2 + 3).toFixed(1),
      reviewCount: Math.floor(Math.random() * 500) + 50,
      originalPrice: discount ? price : undefined,
      discount: discount,
      isFavorite: false,
      images: Array.from({length: 4}, (_, i) => 
        `https://picsum.photos/600/600?random=${id + i + 1}`)
    };
  }

  changeMainImage(img: string): void {
    this.product.imageUrl = img;
  }

  addToCart(): void {
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/login'], {
        queryParams: {
          returnTo: this.router.url,
          productId: this.product.id
        }
      });
      return;
    }
    this.cartService.add(this.product);
  }
  
  toggleFavorite(): void {
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/login'], {
        queryParams: {
          returnTo: this.router.url,
          productId: this.product.id
        }
      });
      return;
    }
    this.favoriteService.toggleFavorite(this.product.id);
    this.product.isFavorite = this.favoriteService.isFavorite(this.product.id);
  }
}