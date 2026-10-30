package com.ecommerce.service;

import com.ecommerce.dto.CouponRequest;
import com.ecommerce.exception.BadRequestException;
import com.ecommerce.exception.ResourceNotFoundException;
import com.ecommerce.model.Coupon;
import com.ecommerce.repository.CouponRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CouponService {
    private final CouponRepository couponRepository;

    public CouponService(CouponRepository couponRepository) {
        this.couponRepository = couponRepository;
    }

    public List<Coupon> getAllCoupons() {
        return couponRepository.findAll();
    }

    public Coupon getCoupon(String code) {
        return couponRepository.findByCode(code)
                .orElseThrow(() -> new ResourceNotFoundException("Coupon not found: " + code));
    }

    public Coupon createCoupon(CouponRequest request) {
        if (couponRepository.findByCode(request.getCode()).isPresent()) {
            throw new BadRequestException("Coupon code already exists: " + request.getCode());
        }
        Coupon coupon = new Coupon(
                request.getCode(),
                request.getDiscountPercentage(),
                request.getMaxDiscountAmount(),
                request.getMinOrderAmount(),
                true
        );
        return couponRepository.save(coupon);
    }

    public double calculateDiscount(String code, double orderAmount) {
        if (code == null || code.isBlank()) {
            return 0.0;
        }

        Coupon coupon = couponRepository.findByCode(code)
                .orElseThrow(() -> new BadRequestException("Invalid coupon code: " + code));

        if (!Boolean.TRUE.equals(coupon.getActive())) {
            throw new BadRequestException("Coupon is no longer active: " + code);
        }

        if (coupon.getMinOrderAmount() != null && orderAmount < coupon.getMinOrderAmount()) {
            throw new BadRequestException("Order amount of $" + orderAmount +
                    " does not meet minimum order required for coupon: $" + coupon.getMinOrderAmount());
        }

        double rawDiscount = orderAmount * (coupon.getDiscountPercentage() / 100.0);
        if (coupon.getMaxDiscountAmount() != null && rawDiscount > coupon.getMaxDiscountAmount()) {
            rawDiscount = coupon.getMaxDiscountAmount();
        }

        return Math.round(rawDiscount * 100.0) / 100.0;
    }
}
