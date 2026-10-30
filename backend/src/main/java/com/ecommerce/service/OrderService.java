package com.ecommerce.service;

import com.ecommerce.dto.CheckoutRequest;
import com.ecommerce.exception.BadRequestException;
import com.ecommerce.exception.ResourceNotFoundException;
import com.ecommerce.model.*;
import com.ecommerce.repository.OrderRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
public class OrderService {
    private final OrderRepository orderRepository;
    private final CartService cartService;
    private final ProductService productService;
    private final CouponService couponService;

    public OrderService(OrderRepository orderRepository,
                        CartService cartService,
                        ProductService productService,
                        CouponService couponService) {
        this.orderRepository = orderRepository;
        this.cartService = cartService;
        this.productService = productService;
        this.couponService = couponService;
    }

    public synchronized Order checkout(CheckoutRequest request) {
        Cart cart = cartService.getCart(request.getUserId());
        if (cart.getItems() == null || cart.getItems().isEmpty()) {
            throw new BadRequestException("Cannot checkout with an empty cart");
        }

        // Verify and decrease stock
        List<OrderItem> orderItems = new ArrayList<>();
        for (CartItem cartItem : cart.getItems()) {
            productService.decreaseStock(cartItem.getProductId(), cartItem.getQuantity());
            orderItems.add(new OrderItem(
                    cartItem.getProductId(),
                    cartItem.getProductName(),
                    cartItem.getUnitPrice(),
                    cartItem.getQuantity(),
                    cartItem.getSubtotal(),
                    cartItem.getImageUrl()
            ));
        }

        double subtotal = cart.getTotalAmount();
        double discount = 0.0;
        if (request.getCouponCode() != null && !request.getCouponCode().isBlank()) {
            discount = couponService.calculateDiscount(request.getCouponCode(), subtotal);
        }

        double shippingFee = subtotal >= 50.0 ? 0.0 : 9.99;
        double totalAmount = Math.max(0.0, Math.round((subtotal - discount + shippingFee) * 100.0) / 100.0);

        String orderNumber = "ORD-" + System.currentTimeMillis() + "-" + UUID.randomUUID().toString().substring(0, 4).toUpperCase();

        Order order = new Order();
        order.setOrderNumber(orderNumber);
        order.setUserId(request.getUserId());
        order.setCustomerName(request.getCustomerName());
        order.setCustomerEmail(request.getCustomerEmail());
        order.setCustomerPhone(request.getCustomerPhone());
        order.setShippingAddress(request.getShippingAddress());
        order.setItems(orderItems);
        order.setSubtotal(subtotal);
        order.setDiscount(discount);
        order.setShippingFee(shippingFee);
        order.setTotalAmount(totalAmount);
        order.setStatus(OrderStatus.CONFIRMED);
        order.setPaymentStatus(PaymentStatus.PAID);
        order.setPaymentMethod(request.getPaymentMethod() != null ? request.getPaymentMethod() : "CREDIT_CARD");
        order.setCouponCode(request.getCouponCode());
        order.setCreatedAt(LocalDateTime.now());
        order.setUpdatedAt(LocalDateTime.now());

        Order saved = orderRepository.save(order);

        // Clear cart after checkout
        cartService.clearCart(request.getUserId());

        return saved;
    }

    public Order getOrderById(Long id) {
        return orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + id));
    }

    public Order getOrderByNumber(String orderNumber) {
        return orderRepository.findByOrderNumber(orderNumber)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with number: " + orderNumber));
    }

    public List<Order> getOrdersByUserId(String userId) {
        return orderRepository.findByUserId(userId);
    }

    public List<Order> getAllOrders() {
        return orderRepository.findAll();
    }

    public Order updateOrderStatus(Long id, OrderStatus status, PaymentStatus paymentStatus) {
        Order order = getOrderById(id);
        if (status != null) {
            order.setStatus(status);
        }
        if (paymentStatus != null) {
            order.setPaymentStatus(paymentStatus);
        }
        order.setUpdatedAt(LocalDateTime.now());
        return orderRepository.save(order);
    }

    public synchronized Order cancelOrder(Long id) {
        Order order = getOrderById(id);
        if (order.getStatus() == OrderStatus.CANCELLED) {
            throw new BadRequestException("Order is already cancelled");
        }
        if (order.getStatus() == OrderStatus.DELIVERED || order.getStatus() == OrderStatus.SHIPPED) {
            throw new BadRequestException("Cannot cancel an order that has already been " + order.getStatus().name().toLowerCase());
        }

        // Restore inventory stock
        for (OrderItem item : order.getItems()) {
            productService.increaseStock(item.getProductId(), item.getQuantity());
        }

        order.setStatus(OrderStatus.CANCELLED);
        if (order.getPaymentStatus() == PaymentStatus.PAID) {
            order.setPaymentStatus(PaymentStatus.REFUNDED);
        }
        order.setUpdatedAt(LocalDateTime.now());

        return orderRepository.save(order);
    }
}
