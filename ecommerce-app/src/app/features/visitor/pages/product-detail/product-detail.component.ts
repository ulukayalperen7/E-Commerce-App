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
    this.route.paramMap.subscribe(params => {
      const idParam = params.get('id');
      if (!idParam) {
        this.router.navigate(['/home']);
        return;
      }
      const id = +idParam;
      this.loading = true;

      this.productService.getAllProducts().subscribe(list => {
        const all = list.map(p => ({ ...p, isFavorite: false }));
        this.relatedProducts = all.filter(p => p.id !== id).slice(0, 4);
        this.product = all.find(p => p.id === id) || null;
        this.loading = false;
      });
    });
  }

  toggleFavorite(p: ProductView, event: Event): void {
    event.stopPropagation();
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/login']);
      return;
    }
    p.isFavorite = !p.isFavorite;
  }

  onViewDetails(p: ProductView): void {
    this.router.navigate(['/product', p.id]);
  }

  addToCart(event?: Event): void {
    event?.stopPropagation();
    if (!this.product || !this.authService.isLoggedIn()) {
      this.router.navigate(['/login']);
      return;
    }
    this.cartService.add(this.product);
    this.router.navigate(['/cart']);
  }
}