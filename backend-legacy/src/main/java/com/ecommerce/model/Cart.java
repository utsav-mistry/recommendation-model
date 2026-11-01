package com.ecommerce.model;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

public class Cart {
    private String userId;
    private List<CartItem> items = new ArrayList<>();
    private Double totalAmount = 0.0;
    private Integer totalQuantity = 0;
    private LocalDateTime updatedAt;

    public Cart() {
        this.updatedAt = LocalDateTime.now();
    }

    public Cart(String userId) {
        this.userId = userId;
        this.updatedAt = LocalDateTime.now();
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public List<CartItem> getItems() {
        return items;
    }

    public void setItems(List<CartItem> items) {
        this.items = items != null ? items : new ArrayList<>();
        recalculateTotals();
    }

    public Double getTotalAmount() {
        return totalAmount;
    }

    public void setTotalAmount(Double totalAmount) {
        this.totalAmount = totalAmount;
    }

    public Integer getTotalQuantity() {
        return totalQuantity;
    }

    public void setTotalQuantity(Integer totalQuantity) {
        this.totalQuantity = totalQuantity;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    public void recalculateTotals() {
        double sum = 0.0;
        int count = 0;
        for (CartItem item : items) {
            if (item.getSubtotal() != null) {
                sum += item.getSubtotal();
            }
            if (item.getQuantity() != null) {
                count += item.getQuantity();
            }
        }
        this.totalAmount = Math.round(sum * 100.0) / 100.0;
        this.totalQuantity = count;
        this.updatedAt = LocalDateTime.now();
    }
}
