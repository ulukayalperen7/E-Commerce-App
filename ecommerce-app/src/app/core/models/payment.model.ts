export interface PaymentIntentResponse {
    clientSecret: string;
    paymentIntentId: string;
    orderStatus: string;
  }
  
  
  export interface PaymentDetails {
    paymentId: number;
    stripePaymentIntentId: string;
    amount: number;      
    currency: string;
    status: string;
    createdAt?: string;  
    updatedAt?: string;
  }