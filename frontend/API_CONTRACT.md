📡 E-Commerce REST API Contract for Frontend
This contract defines all endpoints, request/response formats, query parameters, and TypeScript types for integrating frontend clients (React, Next.js, Vue, Angular, Mobile) with the Spring Boot backend.

Base URL: http://localhost:8080/api
Content-Type: application/json
CORS: Enabled for all origins (*) with credentials support.
TypeScript Types: Available directly in types.ts.
📑 Table of Contents
Standard Response Envelope
Products API
Categories API
Cart API
Orders & Checkout API
Reviews API
Coupons API
Users API
Pre-Seeded Mock Data
Frontend Client Integration Example
Standard Response Envelope
Every endpoint wraps its response in a uniform ApiResponse<T> JSON envelope:

Success Response (200 OK / 201 Created)
{
  "success": true,
  "message": "Products retrieved successfully",
  "data": { ... },
  "timestamp": "2026-10-30T14:15:00"
}
Error Response (400 Bad Request / 404 Not Found / 500 Error)
{
  "success": false,
  "message": "Insufficient stock for product 'iPhone 15 Pro'. Available: 2, Requested: 5",
  "data": null,
  "timestamp": "2026-10-30T14:15:00"
}
Validation Error Response (400 Bad Request)
When input validation fails:

{
  "success": false,
  "message": "Validation failed",
  "data": {
    "price": "Price must be positive",
    "name": "Product name is required"
  },
  "timestamp": "2026-10-30T14:15:00"
}
1. Products API
GET /api/products
Retrieves products with optional search, filtering, and sorting.

Query Parameters:

Param	Type	Required	Description	Allowed Values / Examples
search	string	No	Search query across name, description, tags	phone, sony, keyboard
category	string	No	Filter by category name	Electronics, Fashion, Books
minPrice	number	No	Minimum price filter	50.0
maxPrice	number	No	Maximum price filter	500.0
sortBy	string	No	Sorting criterion	price_asc, price_desc, rating, newest, name
Response (200 OK):

{
  "success": true,
  "message": "Products retrieved successfully",
  "data": [
    {
      "id": 1,
      "name": "iPhone 15 Pro",
      "description": "Titanium design, A17 Pro chip, 48MP camera, and USB-C",
      "price": 999.99,
      "category": "Electronics",
      "stockQuantity": 35,
      "imageUrl": "https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=500",
      "rating": 4.8,
      "reviewsCount": 124,
      "tags": ["apple", "smartphone", "ios", "flagship"],
      "createdAt": "2026-10-30T14:10:00",
      "active": true
    }
  ],
  "timestamp": "2026-10-30T14:15:00"
}
GET /api/products/{id}
Retrieves a single product by ID.

Path Parameter: id (number, e.g. 1)
Response (200 OK):
{
  "success": true,
  "message": "Success",
  "data": {
    "id": 1,
    "name": "iPhone 15 Pro",
    "description": "Titanium design, A17 Pro chip, 48MP camera, and USB-C",
    "price": 999.99,
    "category": "Electronics",
    "stockQuantity": 35,
    "imageUrl": "https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=500",
    "rating": 4.8,
    "reviewsCount": 124,
    "tags": ["apple", "smartphone", "ios", "flagship"],
    "createdAt": "2026-10-30T14:10:00",
    "active": true
  },
  "timestamp": "2026-10-30T14:15:00"
}
POST /api/products
Creates a new product (Admin).

Request Body:
{
  "name": "Noise-Cancelling Over-Ear Headphones",
  "description": "Wireless headphones with 40-hour playback",
  "price": 299.99,
  "category": "Audio & Accessories",
  "stockQuantity": 50,
  "imageUrl": "https://example.com/headphones.jpg",
  "tags": ["headphones", "wireless", "audio"]
}
Response (201 Created):
{
  "success": true,
  "message": "Product created successfully",
  "data": {
    "id": 101,
    "name": "Noise-Cancelling Over-Ear Headphones",
    "price": 299.99,
    "stockQuantity": 50,
    "active": true
  },
  "timestamp": "2026-10-30T14:15:00"
}
PUT /api/products/{id}
Updates an existing product.

Path Parameter: id (number)
Request Body: Same fields as POST /api/products.
Response (200 OK): Updated product object.
DELETE /api/products/{id}
Soft-deletes a product by setting active: false.

Response (200 OK):
{
  "success": true,
  "message": "Product deleted successfully",
  "data": null,
  "timestamp": "2026-10-30T14:15:00"
}
2. Categories API
GET /api/categories
Returns all categories.

Response (200 OK):
{
  "success": true,
  "message": "Success",
  "data": [
    {
      "id": 1,
      "name": "Electronics",
      "slug": "electronics",
      "description": "Smartphones, laptops, and gadgets",
      "imageUrl": "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=500"
    }
  ],
  "timestamp": "2026-10-30T14:15:00"
}
3. Cart API
GET /api/cart/{userId}
Fetches the active cart for a specific user ID or guest session ID.

Path Parameter: userId (string, e.g. "1" or "guest-session-123")
Response (200 OK):
{
  "success": true,
  "message": "Success",
  "data": {
    "userId": "1",
    "items": [
      {
        "productId": 1,
        "productName": "iPhone 15 Pro",
        "unitPrice": 999.99,
        "quantity": 2,
        "subtotal": 1999.98,
        "imageUrl": "https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=500"
      }
    ],
    "totalAmount": 1999.98,
    "totalQuantity": 2,
    "updatedAt": "2026-10-30T14:15:00"
  },
  "timestamp": "2026-10-30T14:15:00"
}
POST /api/cart/{userId}/items
Adds an item to the cart or increments its quantity.

Request Body:
{
  "productId": 1,
  "quantity": 1
}
Response (200 OK): Updated cart object.
PUT /api/cart/{userId}/items/{productId}
Sets an exact quantity for a product in the cart (setting quantity to 0 removes the item).

Request Body:
{
  "quantity": 3
}
Response (200 OK): Updated cart object.
DELETE /api/cart/{userId}/items/{productId}
Removes a specific product from the cart.

Response (200 OK): Updated cart object.
DELETE /api/cart/{userId}
Empties all items from the cart.

Response (200 OK):
{
  "success": true,
  "message": "Cart cleared successfully",
  "data": null,
  "timestamp": "2026-10-30T14:15:00"
}
4. Orders & Checkout API
POST /api/orders/checkout
Checks out the items currently in the user's cart, verifies and deducts stock, calculates discounts (if coupon provided), computes shipping ($0 if subtotal ≥ $50, else $9.99), generates order, and clears the cart.

Request Body:
{
  "userId": "1",
  "customerName": "Alice Johnson",
  "customerEmail": "alice@example.com",
  "customerPhone": "+1-555-0101",
  "shippingAddress": {
    "street": "123 Market St",
    "city": "San Francisco",
    "state": "CA",
    "postalCode": "94105",
    "country": "USA"
  },
  "paymentMethod": "CREDIT_CARD",
  "couponCode": "WELCOME10"
}
Response (201 Created):
{
  "success": true,
  "message": "Order placed successfully",
  "data": {
    "id": 1002,
    "orderNumber": "ORD-1793350000000-8F2A",
    "userId": "1",
    "customerName": "Alice Johnson",
    "customerEmail": "alice@example.com",
    "customerPhone": "+1-555-0101",
    "shippingAddress": {
      "street": "123 Market St",
      "city": "San Francisco",
      "state": "CA",
      "postalCode": "94105",
      "country": "USA"
    },
    "items": [
      {
        "productId": 1,
        "productName": "iPhone 15 Pro",
        "unitPrice": 999.99,
        "quantity": 1,
        "subtotal": 999.99,
        "imageUrl": "https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=500"
      }
    ],
    "subtotal": 999.99,
    "discount": 50.0,
    "shippingFee": 0.0,
    "totalAmount": 949.99,
    "status": "CONFIRMED",
    "paymentStatus": "PAID",
    "paymentMethod": "CREDIT_CARD",
    "couponCode": "WELCOME10",
    "createdAt": "2026-10-30T14:20:00",
    "updatedAt": "2026-10-30T14:20:00"
  },
  "timestamp": "2026-10-30T14:20:00"
}
GET /api/orders/{id}
Fetch order by numerical ID.

GET /api/orders/number/{orderNumber}
Fetch order by tracking string (e.g. ORD-SAMPLE-1001).

GET /api/orders/user/{userId}
List all past orders for a specific user.

PATCH /api/orders/{id}/status
Update order lifecycle status (Admin).

Request Body:
{
  "status": "SHIPPED",
  "paymentStatus": "PAID"
}
POST /api/orders/{id}/cancel
Cancels an order and automatically restores item stock back into inventory.

Response (200 OK):
{
  "success": true,
  "message": "Order cancelled successfully",
  "data": {
    "id": 1002,
    "status": "CANCELLED",
    "paymentStatus": "REFUNDED"
  },
  "timestamp": "2026-10-30T14:20:00"
}
5. Reviews API
GET /api/products/{productId}/reviews
Fetch customer reviews for a given product.

Response (200 OK):
{
  "success": true,
  "message": "Success",
  "data": [
    {
      "id": 1,
      "productId": 1,
      "userId": "1",
      "userName": "Alice Johnson",
      "rating": 5,
      "comment": "Incredible camera and battery life. Highly recommend!",
      "createdAt": "2026-10-30T14:00:00"
    }
  ],
  "timestamp": "2026-10-30T14:20:00"
}
POST /api/products/{productId}/reviews
Add a new review. Automatically updates product rating and reviewsCount.

Request Body:
{
  "userId": "1",
  "userName": "Alice Johnson",
  "rating": 5,
  "comment": "Super fast delivery and pristine packaging!"
}
Response (201 Created): Created review object.
6. Coupons API
GET /api/coupons
List active discount coupons.

GET /api/coupons/validate/{code}?orderAmount={amount}
Validates a coupon code against a prospective order total.

Example: GET /api/coupons/validate/WELCOME10?orderAmount=120.00
Response (200 OK):
{
  "success": true,
  "message": "Coupon is valid",
  "data": {
    "couponCode": "WELCOME10",
    "orderAmount": 120.0,
    "discountAmount": 12.0,
    "finalAmount": 108.0,
    "valid": true
  },
  "timestamp": "2026-10-30T14:20:00"
}
7. Users API
POST /api/users/register
Register a user profile.

Request Body:
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "phone": "+1-555-4321",
  "role": "CUSTOMER",
  "address": {
    "street": "789 Pine Rd",
    "city": "Seattle",
    "state": "WA",
    "postalCode": "98101",
    "country": "USA"
  }
}
GET /api/users/{id}
Fetch user by ID.

GET /api/users/email/{email}
Fetch user by email.

8. Pre-Seeded Mock Data for Testing
The application launches with ready-to-test data:

Seed Coupons
Code	Discount	Minimum Order	Max Discount Cap
WELCOME10	10%	$30.00	$50.00
SAVE20	20%	$100.00	$100.00
SUPER50	50%	$250.00	$200.00
Seed Users
User ID 1: Alice Johnson (alice@example.com, Role: CUSTOMER)
User ID 2: Admin User (admin@ecommerce.com, Role: ADMIN)
Seed Products
ID 1: iPhone 15 Pro ($999.99, Category: Electronics, Stock: 35)
ID 2: MacBook Pro 16" ($2499.00, Category: Electronics, Stock: 15)
ID 3: Sony WH-1000XM5 ($398.00, Category: Audio & Accessories, Stock: 50)
ID 4: Samsung Galaxy S24 Ultra ($1199.99, Category: Electronics, Stock: 28)
ID 5: Logitech MX Master 3S ($99.99, Category: Audio & Accessories, Stock: 75)
ID 6: Nike Air Zoom Pegasus 40 ($130.00, Category: Fashion, Stock: 40)
ID 7: Levi's Classic Denim Jacket ($89.50, Category: Fashion, Stock: 60)
ID 8: Ninja Air Fryer Max XL ($129.99, Category: Home & Kitchen, Stock: 20)
ID 9: Kindle Paperwhite (16 GB) ($149.99, Category: Books, Stock: 45)
ID 10: Custom Mechanical Keyboard ($119.00, Category: Audio & Accessories, Stock: 30)
9. Frontend Client Integration Example
Using modern fetch in React / Next.js / TypeScript:

import { ApiResponse, Product, Cart, CheckoutRequest, Order } from './types';

const BASE_URL = 'http://localhost:8080/api';

// 1. Fetch filtered products
export async function getProducts(search?: string, category?: string): Promise<Product[]> {
  const params = new URLSearchParams();
  if (search) params.append('search', search);
  if (category) params.append('category', category);

  const res = await fetch(`${BASE_URL}/products?${params.toString()}`);
  const json: ApiResponse<Product[]> = await res.json();
  if (!json.success) throw new Error(json.message);
  return json.data;
}

// 2. Add item to cart
export async function addToCart(userId: string, productId: number, quantity: number = 1): Promise<Cart> {
  const res = await fetch(`${BASE_URL}/cart/${userId}/items`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ productId, quantity }),
  });
  const json: ApiResponse<Cart> = await res.json();
  if (!json.success) throw new Error(json.message);
  return json.data;
}

// 3. Checkout
export async function checkout(payload: CheckoutRequest): Promise<Order> {
  const res = await fetch(`${BASE_URL}/orders/checkout`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const json: ApiResponse<Order> = await res.json();
  if (!json.success) throw new Error(json.message);
  return json.data;
}