package com.ecommerce.repository;

import com.ecommerce.model.Cart;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;

@Repository
public class CartRepository {
    private final ConcurrentHashMap<String, Cart> carts = new ConcurrentHashMap<>();

    public Optional<Cart> findByUserId(String userId) {
        return Optional.ofNullable(carts.get(userId));
    }

    public Cart save(Cart cart) {
        carts.put(cart.getUserId(), cart);
        return cart;
    }

    public void deleteByUserId(String userId) {
        carts.remove(userId);
    }
}
