export interface Review {
  id: string;
  userId: string;
  userName: string;
  rating: number;
  title: string;
  text: string;
  timestamp: string;
  helpfulVotes: number;
  verifiedPurchase: boolean;
  sentiment: 'positive' | 'neutral' | 'negative';
  sentimentScore: number;
}

export interface Product {
  id: string;
  asin: string;
  title: string;
  brand: string;
  category: string;
  price: number;
  originalPrice?: number;
  rating: number;
  reviewCount: number;
  ratingDistribution?: Record<string, number>;
  image: string;
  additionalImages?: string[];
  description: string[];
  features: string[];
  inStock: boolean;
  isPrime: boolean;
  bestSeller?: boolean;
  amazonChoice?: boolean;
  kCoreInteractionCount: number; // 20-core density
  coPurchasedAsins: string[];
  similarAsins: string[];
  reviews: Review[];
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedColor?: string;
}

export interface UserProfile {
  id: string;
  name: string;
  avatar: string;
  persona: string;
  purchaseHistoryCount: number;
  recentCategories: string[];
  favoriteBrands: string[];
  recommendedCategory: string;
  activeBio: string;
}

export type RecEngineMode = 'two-tower' | 'collaborative-filtering' | 'hybrid-graph' | 'popular-baseline';
