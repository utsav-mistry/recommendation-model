package com.ecommerce.repository;

import com.ecommerce.model.Coupon;
import org.springframework.stereotype.Repository;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;

@Repository
public class CouponRepository {
    private final ConcurrentHashMap<String, Coupon> coupons = new ConcurrentHashMap<>();

    public Coupon save(Coupon coupon) {
        if (coupon.getCode() != null) {
            coupons.put(coupon.getCode().toUpperCase(), coupon);
        }
        return coupon;
    }

    public Optional<Coupon> findByCode(String code) {
        if (code == null) return Optional.empty();
        return Optional.ofNullable(coupons.get(code.toUpperCase()));
    }

    public List<Coupon> findAll() {
        return new ArrayList<>(coupons.values());
    }

    public boolean deleteByCode(String code) {
        if (code == null) return false;
        return coupons.remove(code.toUpperCase()) != null;
    }
}
