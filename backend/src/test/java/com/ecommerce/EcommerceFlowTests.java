package com.ecommerce;

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
    private ReviewService reviewService;

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
    void testCartOperations() {
        Product phone = productService.getProductById(1L);

        // 1. Add to cart
        cartService.addToCart(testUserId, 1L, 2);
        Cart cart = cartService.getCart(testUserId);
        assertEquals(1, cart.getItems().size());
        assertEquals(2, cart.getItems().get(0).getQuantity());
        assertEquals(phone.getPrice() * 2, cart.getTotalAmount(), 0.01);

        // 2. Update quantity
        cartService.updateItemQuantity(testUserId, 1L, 3);
        Cart updatedCart = cartService.getCart(testUserId);
        assertEquals(3, updatedCart.getItems().get(0).getQuantity());
        assertEquals(phone.getPrice() * 3, updatedCart.getTotalAmount(), 0.01);

        // 3. Clear cart
        cartService.clearCart(testUserId);
        Cart clearedCart = cartService.getCart(testUserId);
        assertTrue(clearedCart.getItems().isEmpty());
        assertEquals(0.0, clearedCart.getTotalAmount(), 0.01);
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
