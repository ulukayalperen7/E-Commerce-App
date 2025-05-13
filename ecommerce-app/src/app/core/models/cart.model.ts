import { ProductSummary } from './product.model';

export interface CartItemRequest {
  productId: number;
  quantity: number;
}

export interface CartItem {
  cartItemId: number;
  product: ProductSummary;
  quantity: number;
  subtotal: number;
  addedAt?: string;
}

export interface Cart {
  cartId: number;
  userId?: number;
  sessionId?: string;
  cartItems: CartItem[];
  totalAmount: number;
  totalItems: number;
  createdAt?: string;
  updatedAt?: string;
}