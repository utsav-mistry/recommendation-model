/**
 * E-Commerce Frontend API Contract - TypeScript Definitions
 * Auto-compatible with Spring Boot backend (http://localhost:8080)
 */

// -------------------------------------------------------------
// Global Response Envelope
// -------------------------------------------------------------

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string; // ISO 8601 string, e.g. "2026-10-30T14:00:00"
}

// -------------------------------------------------------------
// Enums & Literals
// -------------------------------------------------------------

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

// -------------------------------------------------------------
// Domain Models
// -------------------------------------------------------------

export interface Address {
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description: string;
  imageUrl?: string;
}

export interface Product {
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
  tags: string[];
  createdAt: string;
  active: boolean;
}

export interface CartItem {
  productId: number;
  productName: string;
  unitPrice: number;
  quantity: number;
  subtotal: number;
  imageUrl?: string;
}

export interface Cart {
  userId: string;
  items: CartItem[];
  totalAmount: number;
  totalQuantity: number;
  updatedAt: string;
}

export interface OrderItem {
  productId: number;
  productName: string;
  unitPrice: number;
  quantity: number;
  subtotal: number;
  imageUrl?: string;
}

export interface Order {
  id: number;
  orderNumber: string;
  userId: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  shippingAddress: Address;
  items: OrderItem[];
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

export interface Review {
  id: number;
  productId: number;
  userId: string;
  userName: string;
  rating: number; // 1 to 5
  comment: string;
  createdAt: string;
}

export interface Coupon {
  code: string;
  discountPercentage: number;
  maxDiscountAmount?: number;
  minOrderAmount?: number;
  active: boolean;
}

export interface User {
  id: number;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  addresses: Address[];
  createdAt: string;
}

// -------------------------------------------------------------
// Request Payloads (DTOs)
// -------------------------------------------------------------

export interface ProductFilterParams {
  search?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: ProductSortBy;
}

export interface ProductRequest {
  name: string;
  description?: string;
  price: number;
  category: string;
  stockQuantity: number;
  imageUrl?: string;
  tags?: string[];
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
  shippingAddress: Address;
  paymentMethod?: string; // default: "CREDIT_CARD"
  couponCode?: string;
}

export interface OrderStatusUpdateRequest {
  status: OrderStatus;
  paymentStatus?: PaymentStatus;
}

export interface ReviewRequest {
  userId: string;
  userName: string;
  rating: number; // 1 to 5
  comment: string;
}

export interface UserRegisterRequest {
  name: string;
  email: string;
  phone?: string;
  role?: UserRole;
  address?: Address;
}

export interface CouponRequest {
  code: string;
  discountPercentage: number;
  maxDiscountAmount?: number;
  minOrderAmount?: number;
}

export interface CouponValidationResult {
  couponCode: string;
  orderAmount: number;
  discountAmount: number;
  finalAmount: number;
  valid: boolean;
}
