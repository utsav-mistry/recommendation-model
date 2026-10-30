# Spring Boot E-Commerce Backend (In-Memory / No Database)

A production-ready, modular Spring Boot RESTful API for an E-Commerce platform built completely with **in-memory thread-safe data structures** (`ConcurrentHashMap`, `AtomicLong`). No external or local database setup (MySQL, PostgreSQL, MongoDB, H2, or JPA) is required.

---

## 🚀 Key Features

- **No Database Connection Required**: Uses thread-safe Java collections (`ConcurrentHashMap`, `CopyOnWriteArrayList`, atomic sequences) ensuring zero installation or configuration overhead.
- **Pre-Seeded Catalog Data**: Includes 10 realistic products across 5 categories (Electronics, Audio, Fashion, Home & Kitchen, Books) with images, ratings, reviews, sample users, coupons, and orders.
- **Products & Search**: Full CRUD, text search across titles/descriptions/tags, category filtering, min/max price filtering, and sorting (`price_asc`, `price_desc`, `rating`, `newest`, `name`).
- **Interactive Shopping Cart**: Add, update quantity, remove items, auto-calculate subtotals/totals, and auto-clear upon successful checkout.
- **Order Management & Checkout**:
  - Validates stock quantities and atomically deducts inventory upon checkout.
  - Automatically calculates discounts via coupons and free shipping thresholds ($50+).
  - Generates unique order tracking numbers (`ORD-...`).
  - Allows order cancellation and automatically restores product stock.
- **Discounts & Coupons**: Validate coupon codes (`WELCOME10`, `SAVE20`, `SUPER50`) with minimum order requirements and maximum discount caps.
- **Customer Reviews & Ratings**: Submit reviews with 1–5 star ratings; product average ratings and review counts update automatically.
- **CORS Configured**: Pre-configured to allow requests from any frontend application (React, Angular, Vue, Next.js, mobile apps) running on `http://localhost:*`.
- **Standardized Error Handling**: `@RestControllerAdvice` with structured JSON error messages and validation reports.
- **Frontend API Contract & Types**:
  - 📖 [Complete Frontend API Contract](API_CONTRACT.md)
  - ⚡ [Ready-to-use TypeScript Definitions (`types.ts`)](types.ts)
  - 🌐 [OpenAPI 3.0 Specification (`openapi.yaml`)](openapi.yaml)

---

## 🛠️ Tech Stack & Requirements

- **Java**: 17+ (Tested with Java 24)
- **Spring Boot**: 4.x / 3.x with Spring Web & Jakarta Validation
- **Build Tool**: Maven Wrapper (`mvnw` / `mvnw.cmd`) included

---

## 🏃 Quick Start

### 1. Run the Application
Open a terminal in the `backend` folder and run:

```bash
# Windows
.\mvnw.cmd spring-boot:run

# Linux / macOS
./mvnw spring-boot:run
```

The server starts at `http://localhost:8080`.

### 2. Run Tests
```bash
# Windows
.\mvnw.cmd test

# Linux / macOS
./mvnw test
```

---

## 📚 API Reference

All responses follow a consistent format:
```json
{
  "success": true,
  "message": "Success",
  "data": { ... },
  "timestamp": "2026-10-30T14:00:00"
}
```

---

### 1. Products & Categories

#### `GET /api/products`
Fetch products with optional filters and sorting.
- **Query Parameters**:
  - `search` (optional): search term (e.g., `phone`, `sony`, `apple`)
  - `category` (optional): category name (e.g., `Electronics`)
  - `minPrice` (optional): minimum price filter
  - `maxPrice` (optional): maximum price filter
  - `sortBy` (optional): `price_asc`, `price_desc`, `rating`, `newest`, `name`

#### `GET /api/products/{id}`
Fetch single product details.

#### `POST /api/products`
Create a new product.
```json
{
  "name": "Wireless Noise Cancelling Earbuds",
  "description": "Ergonomic earbuds with high-res audio and 24h battery life",
  "price": 149.99,
  "category": "Audio & Accessories",
  "stockQuantity": 80,
  "imageUrl": "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=500",
  "tags": ["audio", "earbuds", "bluetooth"]
}
```

#### `PUT /api/products/{id}`
Update an existing product.

#### `DELETE /api/products/{id}`
Soft-delete / deactivate product.

#### `GET /api/categories`
Fetch all product categories.

---

### 2. Shopping Cart

#### `GET /api/cart/{userId}`
Get current cart for a user.

#### `POST /api/cart/{userId}/items`
Add an item to the cart.
```json
{
  "productId": 1,
  "quantity": 2
}
```

#### `PUT /api/cart/{userId}/items/{productId}`
Update item quantity in cart.
```json
{
  "quantity": 3
}
```

#### `DELETE /api/cart/{userId}/items/{productId}`
Remove an item from cart.

#### `DELETE /api/cart/{userId}`
Clear all items from cart.

---

### 3. Orders & Checkout

#### `POST /api/orders/checkout`
Place an order from items in user's cart.
```json
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
```

#### `GET /api/orders/{id}`
Get order by numeric ID.

#### `GET /api/orders/number/{orderNumber}`
Get order by tracking order number (e.g., `ORD-SAMPLE-1001`).

#### `GET /api/orders/user/{userId}`
Get all orders placed by a specific user.

#### `GET /api/orders`
Get all orders (Admin view).

#### `PATCH /api/orders/{id}/status`
Update status of an order.
```json
{
  "status": "SHIPPED",
  "paymentStatus": "PAID"
}
```

#### `POST /api/orders/{id}/cancel`
Cancel an order and automatically restore product stock levels.

---

### 4. Coupons

#### `GET /api/coupons`
List all active discount coupons.

#### `GET /api/coupons/validate/{code}?orderAmount=150.0`
Check if a coupon is valid for a given order total.

**Pre-seeded coupons:**
- `WELCOME10`: 10% off (min order $30, max discount $50)
- `SAVE20`: 20% off (min order $100, max discount $100)
- `SUPER50`: 50% off (min order $250, max discount $200)

---

### 5. Reviews

#### `GET /api/products/{productId}/reviews`
Fetch reviews for a product.

#### `POST /api/products/{productId}/reviews`
Submit a customer review (automatically updates product average rating).
```json
{
  "userId": "1",
  "userName": "Alice Johnson",
  "rating": 5,
  "comment": "Outstanding build quality and fast shipping!"
}
```

---

### 6. Users

#### `POST /api/users/register`
Register a user.
```json
{
  "name": "Bob Smith",
  "email": "bob@example.com",
  "phone": "+1-555-2233",
  "role": "CUSTOMER",
  "address": {
    "street": "456 Oak Avenue",
    "city": "Seattle",
    "state": "WA",
    "postalCode": "98101",
    "country": "USA"
  }
}
```

#### `GET /api/users/{id}`
Get user details.

---

## 📁 Project Structure

```
backend/
├── pom.xml
├── mvnw / mvnw.cmd
└── src/
    ├── main/
    │   ├── java/com/ecommerce/
    │   │   ├── EcommerceApplication.java
    │   │   ├── config/
    │   │   │   ├── CorsConfig.java
    │   │   │   └── DataInitializer.java
    │   │   ├── controller/
    │   │   │   ├── CartController.java
    │   │   │   ├── CategoryController.java
    │   │   │   ├── CouponController.java
    │   │   │   ├── OrderController.java
    │   │   │   ├── ProductController.java
    │   │   │   ├── ReviewController.java
    │   │   │   └── UserController.java
    │   │   ├── dto/
    │   │   │   ├── AddToCartRequest.java
    │   │   │   ├── ApiResponse.java
    │   │   │   ├── CheckoutRequest.java
    │   │   │   ├── CouponRequest.java
    │   │   │   ├── OrderStatusUpdateRequest.java
    │   │   │   ├── ProductRequest.java
    │   │   │   ├── ReviewRequest.java
    │   │   │   ├── UpdateCartItemRequest.java
    │   │   │   └── UserRegisterRequest.java
    │   │   ├── exception/
    │   │   │   ├── BadRequestException.java
    │   │   │   ├── GlobalExceptionHandler.java
    │   │   │   ├── InsufficientStockException.java
    │   │   │   └── ResourceNotFoundException.java
    │   │   ├── model/
    │   │   │   ├── Address.java
    │   │   │   ├── Cart.java
    │   │   │   ├── CartItem.java
    │   │   │   ├── Category.java
    │   │   │   ├── Coupon.java
    │   │   │   ├── Order.java
    │   │   │   ├── OrderItem.java
    │   │   │   ├── OrderStatus.java
    │   │   │   ├── PaymentStatus.java
    │   │   │   ├── Product.java
    │   │   │   ├── Review.java
    │   │   │   ├── Role.java
    │   │   │   └── User.java
    │   │   ├── repository/
    │   │   │   ├── CartRepository.java
    │   │   │   ├── CategoryRepository.java
    │   │   │   ├── CouponRepository.java
    │   │   │   ├── OrderRepository.java
    │   │   │   ├── ProductRepository.java
    │   │   │   ├── ReviewRepository.java
    │   │   │   └── UserRepository.java
    │   │   └── service/
    │   │       ├── CartService.java
    │   │       ├── CategoryService.java
    │   │       ├── CouponService.java
    │   │       ├── OrderService.java
    │   │       ├── ProductService.java
    │   │       ├── ReviewService.java
    │   │       └── UserService.java
    │   └── resources/
    │       └── application.properties
    └── test/
        └── java/com/ecommerce/
            ├── EcommerceApplicationTests.java
            └── EcommerceFlowTests.java
```
