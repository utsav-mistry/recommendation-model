package com.ecommerce.model;

public class Coupon {
    private String code;
    private Double discountPercentage;
    private Double maxDiscountAmount;
    private Double minOrderAmount;
    private Boolean active = true;

    public Coupon() {
    }

    public Coupon(String code, Double discountPercentage, Double maxDiscountAmount, Double minOrderAmount, Boolean active) {
        this.code = code != null ? code.toUpperCase() : null;
        this.discountPercentage = discountPercentage;
        this.maxDiscountAmount = maxDiscountAmount;
        this.minOrderAmount = minOrderAmount;
        this.active = active != null ? active : true;
    }

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code != null ? code.toUpperCase() : null;
    }

    public Double getDiscountPercentage() {
        return discountPercentage;
    }

    public void setDiscountPercentage(Double discountPercentage) {
        this.discountPercentage = discountPercentage;
    }

    public Double getMaxDiscountAmount() {
        return maxDiscountAmount;
    }

    public void setMaxDiscountAmount(Double maxDiscountAmount) {
        this.maxDiscountAmount = maxDiscountAmount;
    }

    public Double getMinOrderAmount() {
        return minOrderAmount;
    }

    public void setMinOrderAmount(Double minOrderAmount) {
        this.minOrderAmount = minOrderAmount;
    }

    public Boolean getActive() {
        return active;
    }

    public void setActive(Boolean active) {
        this.active = active;
    }
}
