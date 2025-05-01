export interface FeaturedItem {
    id: number;
    type: 'category' | 'brand' | 'promo';
    label: string;
    imageUrl: string;
    slogan: string;
    link: string;
  }
  