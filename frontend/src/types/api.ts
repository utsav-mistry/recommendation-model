/**
 * E-Commerce API Contract Types
 * Directly matched with API_CONTRACT.md and Spring Boot backend
 */

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
}

export type OrderStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'PROCESSING'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'CANCELLED';

export type PaymentStatus =
  | 'PENDING'
  | 'PAID'
  | 'FAILED'
  | 'REFUNDED';

export type UserRole = 'CUSTOMER' | 'ADMIN';

export type ProductSortBy =
  | 'price_asc'
  | 'price_desc'
  | 'rating'
  | 'newest'
  | 'name';

export interface BackendAddress {
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface BackendCategory {
  id: number;
  name: string;
  slug: string;
  description: string;
  imageUrl?: string;
}

export interface BackendProduct {
  id: number;
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

export interface BackendOrderItem {
  productId: number;
  productName: string;
  unitPrice: number;
  quantity: number;
  subtotal: number;
  imageUrl?: string;
}

export interface BackendOrder {
  id: number;
  orderNumber: string;
  userId: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  shippingAddress: BackendAddress;
  items: BackendOrderItem[];
  subtotal: number;
  discount: number;
  shippingFee: number;
  totalAmount: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: string;
  couponCode?: string;
  createdAt: string;
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

export interface BackendCoupon {
  code: string;
  discountPercentage: number;
  maxDiscountAmount?: number;
  minOrderAmount?: number;
  active: boolean;
}

export interface CouponValidationResult {
  couponCode: string;
  orderAmount: number;
  discountAmount: number;
  finalAmount: number;
  valid: boolean;
}

export interface BackendUser {
  id: number;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  addresses: BackendAddress[];
  createdAt: string;
}

export interface ProductFilterParams {
  search?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: ProductSortBy;
}

export interface AddToCartRequest {
  productId: number;
  quantity: number;
}

export interface UpdateCartItemRequest {
  quantity: number;
}

export interface CheckoutRequest {
  userId: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  shippingAddress: BackendAddress;
  paymentMethod?: string;
  couponCode?: string;
}

export interface ReviewRequest {
  userId: string;
  userName: string;
  rating: number;
  comment: string;
}

export interface UserRegisterRequest {
  name: string;
  email: string;
  phone?: string;
  role?: UserRole;
  address?: BackendAddress;
}
