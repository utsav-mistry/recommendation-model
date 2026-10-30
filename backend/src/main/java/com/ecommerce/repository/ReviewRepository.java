package com.ecommerce.repository;

import com.ecommerce.model.Review;
import org.springframework.stereotype.Repository;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicLong;
import java.util.stream.Collectors;

@Repository
public class ReviewRepository {
    private final ConcurrentHashMap<Long, Review> reviews = new ConcurrentHashMap<>();
    private final AtomicLong idGenerator = new AtomicLong(100);

    public Review save(Review review) {
        if (review.getId() == null) {
            review.setId(idGenerator.incrementAndGet());
        }
        reviews.put(review.getId(), review);
        return review;
    }

    public List<Review> findByProductId(Long productId) {
        if (productId == null) return List.of();
        return reviews.values().stream()
                .filter(r -> productId.equals(r.getProductId()))
                .sorted((r1, r2) -> r2.getCreatedAt().compareTo(r1.getCreatedAt()))
                .collect(Collectors.toList());
    }

    public List<Review> findAll() {
        return new ArrayList<>(reviews.values());
    }
}
