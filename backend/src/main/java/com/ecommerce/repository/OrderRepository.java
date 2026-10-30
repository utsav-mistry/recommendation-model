package com.ecommerce.repository;

import com.ecommerce.model.Order;
import org.springframework.stereotype.Repository;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicLong;
import java.util.stream.Collectors;

@Repository
public class OrderRepository {
    private final ConcurrentHashMap<Long, Order> orders = new ConcurrentHashMap<>();
    private final AtomicLong idGenerator = new AtomicLong(1000);

    public Order save(Order order) {
        if (order.getId() == null) {
            order.setId(idGenerator.incrementAndGet());
        }
        orders.put(order.getId(), order);
        return order;
    }

    public Optional<Order> findById(Long id) {
        return Optional.ofNullable(orders.get(id));
    }

    public Optional<Order> findByOrderNumber(String orderNumber) {
        if (orderNumber == null) return Optional.empty();
        return orders.values().stream()
                .filter(o -> orderNumber.equalsIgnoreCase(o.getOrderNumber()))
                .findFirst();
    }

    public List<Order> findByUserId(String userId) {
        if (userId == null) return List.of();
        return orders.values().stream()
                .filter(o -> userId.equalsIgnoreCase(o.getUserId()))
                .sorted((o1, o2) -> o2.getCreatedAt().compareTo(o1.getCreatedAt()))
                .collect(Collectors.toList());
    }

    public List<Order> findAll() {
        return orders.values().stream()
                .sorted((o1, o2) -> o2.getCreatedAt().compareTo(o1.getCreatedAt()))
                .collect(Collectors.toList());
    }
}
