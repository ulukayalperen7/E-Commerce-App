import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductService } from '../../../../core/services/product.service';
import { ProductDetail as ProductDetailModel, ProductImage as ProductImageModel } from '../../../../core/models/product.model';
import { CartService } from '../../../../core/services/cart.service';
import { AuthService } from '../../../../core/services/auth.service';

interface ProductViewForVisitorDetail extends ProductDetailModel {
  selectedImageUrl?: string;
  isFavorite: boolean; // Ziyaretçi için bu her zaman false olacak veya gösterilmeyecek
}

@Component({
  selector: 'app-product-detail',
  standalone: false,
  templateUrl: './product-detail.component.html',
  styleUrls: ['./product-detail.component.scss']
})
export class ProductDetailComponent implements OnInit {
  product?: ProductViewForVisitorDetail;
  loading: boolean = true;
  productId: number = 0;

  constructor(
    private route: ActivatedRoute,
    private productService: ProductService,
    private cartService: CartService,
    private authService: AuthService,
    private router: Router
  ) {}
  

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const idParam = params.get('id');
      if (idParam) {
        this.productId = +idParam;
        this.loadProductDetails();
      } else {
        this.loading = false;
        this.router.navigate(['/home']);
      }
    });
  }

  loadProductDetails(): void {
    this.loading = true;
    this.productService.getProductById(this.productId).subscribe({
      next: (data: ProductDetailModel) => {
        this.product = {
          ...data,
          isFavorite: false, 
          selectedImageUrl: "http://localhost:8080/product-images/"+ this.productId+ ".jpg"
        };
        this.loading = false;
        console.log('VisitorProductDetail - Product details fetched:', this.product);
      },
      error: (err) => {
        console.error('VisitorProductDetail - Error fetching product details:', err);
        this.loading = false;
        this.router.navigate(['/home']);
      }
    });
  }

  changeMainImage(newImageUrl: string): void {
    if (this.product) {
      this.product.selectedImageUrl = newImageUrl;
    }
  }

  addToCart(): void {
    if (this.product) {
        this.router.navigate(['/login-required'], { queryParams: { returnUrl: this.router.url, productId: this.product.productId } });
    }
  }
  
  toggleFavorite(): void {
    if (this.product) {
        this.router.navigate(['/login-required'], { queryParams: { returnUrl: this.router.url, productId: this.product.productId } });
    }
  }
}