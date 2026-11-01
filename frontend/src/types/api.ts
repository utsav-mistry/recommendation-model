/**
 * E-Commerce & Recommendation API Contract Types
 * Cleaned to focus on Products, Categories, Cart, and Reviews
 */

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
}

export type ProductSortBy =
  | 'price_asc'
  | 'price_desc'
  | 'rating'
  | 'newest'
  | 'name';

export interface BackendCategory {
  id: number;
  name: string;
  slug: string;
  description: string;
  imageUrl?: string;
}

export interface BackendProduct {
  id: number;
  parentAsin?: string;
  name: string;
  description: string;
  price: number;
  category: string;
  stockQuantity: number;
  imageUrl: string;
  rating: number;
  reviewsCount: number;
  tags?: string[];
  createdAt?: string;
  active?: boolean;
}

export interface FastApiProduct {
  parent_asin: string;
  title: string;
  category: string;
  price: number | null;
  rating: number;
  review_count: number;
  images: string[];
  features: string[];
  description: string[];
  brand?: string | null;
  store?: string | null;
  recommendation_score?: number;
  rating_distribution?: Record<string, number>;
}

export interface ProductPage {
  items: FastApiProduct[];
  page: number;
  page_size: number;
  total: number;
}

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  age: number;
  created_at: string;
  updated_at: string;
}

export interface AuthResponse {
  token: string;
  user: AuthUser;
}

export interface BackendCartItem {
  productId: number;
  productName: string;
  unitPrice: number;
  quantity: number;
  subtotal: number;
  imageUrl?: string;
}

export interface BackendCart {
  userId: string;
  items: BackendCartItem[];
  totalAmount: number;
  totalQuantity: number;
  updatedAt: string;
}

export interface BackendReview {
  id: number;
  productId: number;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface ProductFilterParams {
  search?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  store?: string;
  sort?: 'relevance' | 'price_asc' | 'price_desc' | 'rating_desc' | 'popularity';
  sortBy?: ProductSortBy;
}

export interface AddToCartRequest {
  productId: number;
  quantity: number;
}

export interface UpdateCartItemRequest {
  quantity: number;
}

export interface UserProductItem {
  id: number;
  parent_asin: string;
  quantity?: number;
  product: FastApiProduct;
  created_at: string;
  updated_at?: string;
}

export interface UserProductList {
  items: UserProductItem[];
  unavailable_parent_asins: string[];
}

export interface OrderSummary {
  id: number;
  order_status: string;
  total_amount: number;
  created_at: string;
}

export interface OrderItem {
  parent_asin: string;
  quantity: number;
  unit_price: number;
  product: FastApiProduct | null;
}

export interface Order extends OrderSummary {
  items: OrderItem[];
}

export interface ReviewRequest {
  userId: string;
  userName: string;
  rating: number;
  comment: string;
}
