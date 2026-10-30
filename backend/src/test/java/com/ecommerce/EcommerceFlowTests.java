package com.ecommerce;

import com.ecommerce.dto.AddToCartRequest;
import com.ecommerce.dto.CheckoutRequest;
import com.ecommerce.dto.ReviewRequest;
import com.ecommerce.model.*;
import com.ecommerce.service.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
class EcommerceFlowTests {

    @Autowired
    private ProductService productService;

    @Autowired
    private CartService cartService;

    @Autowired
    private OrderService orderService;

    @Autowired
    private ReviewService reviewService;

    @Autowired
    private CouponService couponService;

    private final String testUserId = "test-user-99";

    @BeforeEach
    void setup() {
        cartService.clearCart(testUserId);
    }

    @Test
    void testProductListingAndFiltering() {
        List<Product> products = productService.getProducts(null, "Electronics", null, null, null);
        assertFalse(products.isEmpty(), "Should find electronics products");
        for (Product p : products) {
            assertEquals("Electronics", p.getCategory());
        }

        List<Product> searchResults = productService.getProducts("iPhone", null, null, null, null);
        assertEquals(1, searchResults.size());
        assertEquals("iPhone 15 Pro", searchResults.get(0).getName());
    }

    @Test
    void testCartAndCheckoutFlow() {
        Product phone = productService.getProductById(1L);
        int initialStock = phone.getStockQuantity();

        // 1. Add to cart
        cartService.addToCart(testUserId, 1L, 2);
        Cart cart = cartService.getCart(testUserId);
        assertEquals(1, cart.getItems().size());
        assertEquals(2, cart.getItems().get(0).getQuantity());
        assertEquals(phone.getPrice() * 2, cart.getTotalAmount());

        // 2. Checkout with coupon
        CheckoutRequest checkoutReq = new CheckoutRequest();
        checkoutReq.setUserId(testUserId);
        checkoutReq.setCustomerName("Test Customer");
        checkoutReq.setCustomerEmail("customer@test.com");
        checkoutReq.setCustomerPhone("+1-555-1234");
        checkoutReq.setShippingAddress(new Address("1 Test Way", "Austin", "TX", "78701", "USA"));
        checkoutReq.setPaymentMethod("CREDIT_CARD");
        checkoutReq.setCouponCode("WELCOME10");

        Order order = orderService.checkout(checkoutReq);

        assertNotNull(order.getId());
        assertNotNull(order.getOrderNumber());
        assertEquals(OrderStatus.CONFIRMED, order.getStatus());
        assertEquals(PaymentStatus.PAID, order.getPaymentStatus());
        assertTrue(order.getDiscount() > 0, "Discount should be applied");

        // Verify stock was reduced
        Product updatedPhone = productService.getProductById(1L);
        assertEquals(initialStock - 2, updatedPhone.getStockQuantity());

        // Verify cart is now empty
        Cart clearedCart = cartService.getCart(testUserId);
        assertTrue(clearedCart.getItems().isEmpty());

        // 3. Cancel order and verify stock restored
        orderService.cancelOrder(order.getId());
        Order cancelledOrder = orderService.getOrderById(order.getId());
        assertEquals(OrderStatus.CANCELLED, cancelledOrder.getStatus());
        assertEquals(PaymentStatus.REFUNDED, cancelledOrder.getPaymentStatus());

        Product restoredPhone = productService.getProductById(1L);
        assertEquals(initialStock, restoredPhone.getStockQuantity(), "Stock should be restored after cancellation");
    }

    @Test
    void testCouponDiscountCalculation() {
        double discount = couponService.calculateDiscount("WELCOME10", 100.0);
        assertEquals(10.0, discount);

        double cappedDiscount = couponService.calculateDiscount("WELCOME10", 1000.0);
        assertEquals(50.0, cappedDiscount, "Max discount cap of $50 should be enforced");
    }

    @Test
    void testReviewsAndRatingUpdate() {
        ReviewRequest reviewRequest = new ReviewRequest(testUserId, "Test Reviewer", 5, "Fantastic mechanical switches!");
        Review review = reviewService.addReview(10L, reviewRequest);

        assertNotNull(review.getId());
        Product updatedKeyboard = productService.getProductById(10L);
        assertEquals(1, updatedKeyboard.getReviewsCount());
        assertEquals(5.0, updatedKeyboard.getRating());
    }
}
