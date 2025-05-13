import { AddressResponse } from './address.model';
import { ProductSummary } from './product.model';
import { UserSummary } from './user.model';
import { PaymentDetails } from './payment.model';

export interface OrderRequest {
  shippingAddressId: number;
}

export interface OrderItem {
  orderItemId: number;
  product: ProductSummary;
  quantity: number;
  priceAtPurchase: number;
  subtotalAmount: number;
}

export interface Order {
  orderId: number;
  user?: UserSummary;
  orderDate: string;
  status: string;
  totalAmount: number;
  shippingAddress: AddressResponse;
  orderItems: OrderItem[];
  paymentDetails?: PaymentDetails;
  createdAt?: string;
  updatedAt?: string;
}

export interface OrderSummary {
  orderId: number;
  orderDate: string;
  status: string;
  totalAmount: number;
  totalItems?: number;
}
