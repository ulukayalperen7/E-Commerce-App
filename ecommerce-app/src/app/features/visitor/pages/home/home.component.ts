import { Component, OnInit }      from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router }                 from '@angular/router';
import { Product }                from '../../../../core/models/product.model';
import { ProductService }         from '../../../../core/services/product.service';
import { AuthService }            from '../../../../core/services/auth.service';
import { CartService }            from '../../../../core/services/cart.service';

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
  products: ProductView[] = [];
  recommendedProducts: ProductView[] = [];
  flashDeals: ProductView[] = [];
  brands = ['Zara','Nike','New Balance','Ray-Ban','Fossil','Apple','Puma','MSI',"L'Oréal",'Xiaomi','Samsung','Adidas',"Levi's",'Sony','Gucci'];

  constructor(
    private fb: FormBuilder,
    private productService: ProductService,
    private authService: AuthService,
    private cartService: CartService,
    private router: Router
  ) {
    this.searchForm = this.fb.group({ search: [''] });
  }

  ngOnInit(): void {
    this.productService.getAllProducts().subscribe(list => {
      this.products = list.map(p => ({ ...p, isFavorite: false }));
      this.recommendedProducts = this.products.slice(0, 10);
      this.flashDeals = [
        { ...this.products[2], originalPrice: 1299, price: 999, discount: 23 },
        { ...this.products[4], originalPrice: 180, price: 120, discount: 33 },
        { ...this.products[7], originalPrice: 60, price: 45, discount: 25 },
        { ...this.products[9], originalPrice: 85, price: 55, discount: 35 }
      ];
    });
  }

  onViewDetails(p: ProductView): void {
    this.router.navigate(['/product', p.id]);
  }

  onAddToCart(p: ProductView): void {
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/login']);
    } else {
      this.cartService.add(p);
      this.router.navigate(['/cart']);
    }
  }

  onFavoriteClick(p: ProductView, event: Event): void {
    event.stopPropagation();
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/login']);
      return;
    }
    p.isFavorite = !p.isFavorite;
  }
}