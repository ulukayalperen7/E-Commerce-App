import { Component, OnInit }        from '@angular/core';
import { ActivatedRoute, Router }   from '@angular/router';
import { Product }                  from '../../../../core/models/product.model';
import { ProductService }           from '../../../../core/services/product.service';
import { AuthService }              from '../../../../core/services/auth.service';
import { CartService }              from '../../../../core/services/cart.service';

type ProductView = Product & {
  isFavorite?: boolean;
};

@Component({
  selector: 'app-product-detail',
  standalone: false,
  templateUrl: './product-detail.component.html',
  styleUrls: ['./product-detail.component.scss']
})
export class ProductDetailComponent implements OnInit {
  product: ProductView | null = null;
  relatedProducts: ProductView[] = [];
  loading = true;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productService: ProductService,
    private authService: AuthService,
    private cartService: CartService
  ) {}

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (!idParam) {
      this.router.navigate(['/home']);
      return;
    }
    const id = +idParam;

    this.productService.getAllProducts().subscribe(list => {
      const all = list.map(p => ({ ...p, isFavorite: false }));
      this.relatedProducts = all.filter(p => p.id !== id).slice(0, 4);

      const found = all.find(p => p.id === id) || null;
      this.product = found;
      this.loading = false;
    });
  }

  toggleFavorite(p: ProductView, event: Event): void {
    event.stopPropagation();
    p.isFavorite = !p.isFavorite;
  }

  onViewDetails(p: ProductView): void {
    this.router.navigate(['/product', p.id]);
  }

  addToCart(): void {
    if (!this.product) return;
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/login']);
    } else {
      this.cartService.add(this.product);
      this.router.navigate(['/cart']);
    }
  }
}