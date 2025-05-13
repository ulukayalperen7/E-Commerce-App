export interface CategoryInProduct {
  categoryId: number;
  name: string;
  slug?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface BrandInProduct {
  brandId: number;
  name: string;
  slug?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProductImage {
  productImageId: number;
  imageUrl: string;
  altText?: string;
  displayOrder?: number;
  createdAt?: string;
}

export interface SellerSummary {
  userId: number;
  firstName?: string;
  lastName?: string;
}

export interface ProductDetail {
  productId: number;
  name: string;
  description: string;
  price: number;
  category: CategoryInProduct;
  brand: BrandInProduct;
  stockQuantity?: number;
  imageUrl?: string;
  additionalImages?: ProductImage[];
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
  averageRating?: number;
  totalReviews?: number;
  seller?: SellerSummary;
}

export interface ProductSummary {
  productId: number;
  name: string;
  price: number;
  imageUrl?: string;
  categoryName?: string;
  brandName?: string;
  averageRating?: number;
}

export interface Page<T> {
  content: T[];
  pageable: {
    pageNumber: number;
    pageSize: number;
    sort: {
      sorted: boolean;
      unsorted: boolean;
      empty: boolean;
    };
    offset: number;
    paged: boolean;
    unpaged: boolean;
  };
  totalPages: number;
  totalElements: number;
  last: boolean;
  size: number;
  number: number;
  sort: {
    sorted: boolean;
    unsorted: boolean;
    empty: boolean;
  };
  numberOfElements: number;
  first: boolean;
  empty: boolean;
}

export interface AdminProductRequestPayload {
  productId?: number;
  name: string;
  description: string;
  price: number;
  categoryId: number;
  brandId: number;
  stockQuantity: number;
  isActive: boolean;
}
