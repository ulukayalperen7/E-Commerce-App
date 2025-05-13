import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductService } from '../../../../core/services/product.service';
import { ProductDetail, ProductImage as ProductImageModel } from '../../../../core/models/product.model';
import { CartService } from '../../../../core/services/cart.service';
import { AuthService } from '../../../../core/services/auth.service';
import { FavoriteService } from '../../../../core/services/favorite.service';

interface ProductViewForDetail extends ProductDetail {
  isFavorite: boolean;
  selectedImageUrl?: string;
}

@Component({
  selector: 'app-customer-product-detail',
  standalone: false,
  templateUrl: './customer-product-detail.component.html',
  styleUrls: ['./customer-product-detail.component.scss']
})
export class CustomerProductDetailComponent implements OnInit {
  product?: ProductViewForDetail;
  loading: boolean = true;
  productId: number = 0;

  constructor(
    private route: ActivatedRoute,
    private productService: ProductService,
    private cartService: CartService,
    private authService: AuthService,
    private favoriteService: FavoriteService,
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
        this.router.navigate(['/customer/home']);
      }
    });
  }

  loadProductDetails(): void {
    this.loading = true;
    this.productService.getProductById(this.productId).subscribe({
      next: (data: ProductDetail) => {
        this.product = {
          ...data,
          isFavorite: this.favoriteService.isFavorite(data.productId),
          selectedImageUrl: data.imageUrl || (data.additionalImages && data.additionalImages.length > 0 ? data.additionalImages[0].imageUrl : 'assets/images/default-product.png')
        };
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        this.router.navigate(['/customer/home']);
      }
    });
  }

  changeMainImage(newImageUrl: string): void {
    if (this.product) {
      this.product.selectedImageUrl = "http://localhost:8080/product-images/"+ this.productId+ ".jpg";
    }
  }

  addToCart(): void {
    if (!this.product) {
      return;
    }
    
    this.cartService.add(this.product); 
  }
  
  toggleFavorite(): void {
    if (!this.product) return;

    const currentProduct = this.product;
    const oldIsFavorite = currentProduct.isFavorite;
    currentProduct.isFavorite = !currentProduct.isFavorite;

    this.favoriteService.toggleFavoriteAndUpdateState(currentProduct.productId).subscribe({
      next: () => {
        if (this.product) {
             this.product.isFavorite = this.favoriteService.isFavorite(this.product.productId);
        }
      },
      error: (err) => {
        if (this.product) {
            currentProduct.isFavorite = oldIsFavorite;
        }
      }
    });
  }
}