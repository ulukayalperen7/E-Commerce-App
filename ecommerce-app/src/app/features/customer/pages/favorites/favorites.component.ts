import { Component, OnInit } from '@angular/core';
import { Router }            from '@angular/router';
import { AuthService }       from '../../../../core/services/auth.service';
import { CartService }       from '../../../../core/services/cart.service';
import { ProductService }    from '../../../../core/services/product.service';
import { FavoriteService }   from '../../../../core/services/favorite.service';
import { Product }           from '../../../../core/models/product.model';

type ProductView = Product & { isFavorite: boolean };

@Component({
  selector: 'app-favorites',
  standalone: false,
  templateUrl: './favorites.component.html',
  styleUrls: ['./favorites.component.scss']
})
export class FavoritesComponent implements OnInit {
  favorites: ProductView[] = [];

  constructor(
    private productService: ProductService,
    private favoriteService: FavoriteService,
    private authService: AuthService,
    private cartService: CartService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const favIds = this.favoriteService.getFavorites();
    this.productService.getAllProducts().subscribe(list => {
      this.favorites = list
        .filter(p => favIds.includes(p.id))
        .map(p => ({ ...p, isFavorite: true }));
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

  onRemoveFavorite(p: ProductView): void {
    this.favoriteService.removeFavorite(p.id);
    this.favorites = this.favorites.filter(x => x.id !== p.id);
  }
}
