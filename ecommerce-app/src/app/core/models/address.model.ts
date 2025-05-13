export interface AddressRequest {
    addressLine: string;
    city: string;
    district: string;
    postalCode: string;
    country: string;
  }
  
  export interface AddressResponse {
    addressId: number;
    addressLine: string;
    city: string;
    district: string;
    postalCode: string;
    country: string;
    createdAt?: string; 
    updatedAt?: string; 
  }