export interface Banner {
    bannerId: number;
    title: string;
    imageUrl: string;
    linkUrl?: string;   
    isActive?: boolean; 
    displayOrder?: number;
    createdAt?: string; // LocalDateTime -> string
    updatedAt?: string; // LocalDateTime -> string
  }