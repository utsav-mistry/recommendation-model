package com.ecommerce.service;

import com.ecommerce.exception.BadRequestException;
import com.ecommerce.model.Cart;
import com.ecommerce.model.CartItem;
import com.ecommerce.model.Product;
import com.ecommerce.repository.CartRepository;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class CartService {
    private final CartRepository cartRepository;
    private final ProductService productService;

    public CartService(CartRepository cartRepository, ProductService productService) {
        this.cartRepository = cartRepository;
        this.productService = productService;
    }

    public Cart getCart(String userId) {
        return cartRepository.findByUserId(userId)
                .orElseGet(() -> {
                    Cart newCart = new Cart(userId);
                    return cartRepository.save(newCart);
                });
    }

    public Cart addToCart(String userId, Long productId, int quantity) {
        if (quantity <= 0) {
            throw new BadRequestException("Quantity must be greater than 0");
        }

        Product product = productService.getProductById(productId);
        if (!Boolean.TRUE.equals(product.getActive())) {
            throw new BadRequestException("Product is no longer available");
        }
        if (product.getStockQuantity() < quantity) {
            throw new BadRequestException("Cannot add " + quantity + " items. Only " + product.getStockQuantity() + " in stock.");
        }

        Cart cart = getCart(userId);
        Optional<CartItem> existingItemOpt = cart.getItems().stream()
                .filter(item -> item.getProductId().equals(productId))
                .findFirst();

        if (existingItemOpt.isPresent()) {
            CartItem existingItem = existingItemOpt.get();
            int newQuantity = existingItem.getQuantity() + quantity;
            if (product.getStockQuantity() < newQuantity) {
                throw new BadRequestException("Cannot add more. In-stock limit is " + product.getStockQuantity());
            }
            existingItem.setQuantity(newQuantity);
            existingItem.setUnitPrice(product.getPrice());
        } else {
            CartItem newItem = new CartItem(
                    product.getId(),
                    product.getName(),
                    product.getPrice(),
                    quantity,
                    product.getImageUrl()
            );
            cart.getItems().add(newItem);
        }

        cart.recalculateTotals();
        return cartRepository.save(cart);
    }

    public Cart updateItemQuantity(String userId, Long productId, int quantity) {
        if (quantity <= 0) {
            return removeFromCart(userId, productId);
        }

        Product product = productService.getProductById(productId);
        if (product.getStockQuantity() < quantity) {
            throw new BadRequestException("Requested quantity exceeds available stock of " + product.getStockQuantity());
        }

        Cart cart = getCart(userId);
        CartItem item = cart.getItems().stream()
                .filter(i -> i.getProductId().equals(productId))
                .findFirst()
                .orElseThrow(() -> new BadRequestException("Item not found in cart"));

        item.setQuantity(quantity);
        item.setUnitPrice(product.getPrice());
        cart.recalculateTotals();
        return cartRepository.save(cart);
    }

    public Cart removeFromCart(String userId, Long productId) {
        Cart cart = getCart(userId);
        cart.getItems().removeIf(item -> item.getProductId().equals(productId));
        cart.recalculateTotals();
        return cartRepository.save(cart);
    }

    public void clearCart(String userId) {
        Cart cart = getCart(userId);
        cart.getItems().clear();
        cart.recalculateTotals();
        cartRepository.save(cart);
    }
}
