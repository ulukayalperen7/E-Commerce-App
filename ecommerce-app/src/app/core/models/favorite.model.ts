import { ProductSummary } from './product.model'; 
import { UserSummary } from './user.model';

export interface Favorite {
  favoriteId: number;
  user?: UserSummary; 
  product: ProductSummary;
  createdAt?: string;
}

export interface FavoriteRequest {
  productId: number; 
}