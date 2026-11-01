package com.ecommerce.service;

import com.ecommerce.dto.ReviewRequest;
import com.ecommerce.model.Review;
import com.ecommerce.repository.ReviewRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ReviewService {
    private final ReviewRepository reviewRepository;
    private final ProductService productService;

    public ReviewService(ReviewRepository reviewRepository, ProductService productService) {
        this.reviewRepository = reviewRepository;
        this.productService = productService;
    }

    public Review addReview(Long productId, ReviewRequest request) {
        // Ensure product exists
        productService.getProductById(productId);

        Review review = new Review();
        review.setProductId(productId);
        review.setUserId(request.getUserId());
        review.setUserName(request.getUserName());
        review.setRating(request.getRating());
        review.setComment(request.getComment());

        Review saved = reviewRepository.save(review);

        // Recalculate average rating
        List<Review> productReviews = reviewRepository.findByProductId(productId);
        double avg = productReviews.stream()
                .mapToInt(Review::getRating)
                .average()
                .orElse(0.0);

        productService.recalculateRating(productId, avg, productReviews.size());

        return saved;
    }

    public List<Review> getReviewsForProduct(Long productId) {
        // Ensure product exists
        productService.getProductById(productId);
        return reviewRepository.findByProductId(productId);
    }
}
