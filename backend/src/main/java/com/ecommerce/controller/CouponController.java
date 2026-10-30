package com.ecommerce.controller;

import com.ecommerce.dto.ApiResponse;
import com.ecommerce.dto.CouponRequest;
import com.ecommerce.model.Coupon;
import com.ecommerce.service.CouponService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/coupons")
public class CouponController {
    private final CouponService couponService;

    public CouponController(CouponService couponService) {
        this.couponService = couponService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<Coupon>>> getAllCoupons() {
        return ResponseEntity.ok(ApiResponse.ok(couponService.getAllCoupons()));
    }

    @GetMapping("/{code}")
    public ResponseEntity<ApiResponse<Coupon>> getCoupon(@PathVariable String code) {
        return ResponseEntity.ok(ApiResponse.ok(couponService.getCoupon(code)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Coupon>> createCoupon(@Valid @RequestBody CouponRequest request) {
        Coupon created = couponService.createCoupon(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Coupon created successfully", created));
    }

    @GetMapping("/validate/{code}")
    public ResponseEntity<ApiResponse<Map<String, Object>>> validateCoupon(
            @PathVariable String code,
            @RequestParam double orderAmount
    ) {
        double discount = couponService.calculateDiscount(code, orderAmount);
        double finalAmount = Math.max(0.0, Math.round((orderAmount - discount) * 100.0) / 100.0);
        Map<String, Object> result = Map.of(
                "couponCode", code.toUpperCase(),
                "orderAmount", orderAmount,
                "discountAmount", discount,
                "finalAmount", finalAmount,
                "valid", true
        );
        return ResponseEntity.ok(ApiResponse.ok("Coupon is valid", result));
    }
}
