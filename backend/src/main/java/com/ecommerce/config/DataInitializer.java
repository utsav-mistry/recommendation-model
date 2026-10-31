package com.ecommerce.config;

import com.ecommerce.model.*;
import com.ecommerce.repository.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class DataInitializer implements CommandLineRunner {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final ReviewRepository reviewRepository;

    public DataInitializer(ProductRepository productRepository,
                           CategoryRepository categoryRepository,
                           ReviewRepository reviewRepository) {
        this.productRepository = productRepository;
        this.categoryRepository = categoryRepository;
        this.reviewRepository = reviewRepository;
    }

    @Override
    public void run(String... args) {
        // 1. Categories
        Category electronics = new Category(1L, "Electronics", "electronics", "Smartphones, laptops, and gadgets", "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=500");
        Category audio = new Category(2L, "Audio & Accessories", "audio-accessories", "Premium headphones, earbuds, and audio gear", "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500");
        Category fashion = new Category(3L, "Fashion", "fashion", "Trendy clothing, footwear, and apparel", "https://images.unsplash.com/photo-1445205170230-053b83016050?w=500");
        Category home = new Category(4L, "Home & Kitchen", "home-kitchen", "Modern appliances, cookware, and essentials", "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=500");
        Category books = new Category(5L, "Books", "books", "Bestsellers, fiction, non-fiction, and tech books", "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=500");

        categoryRepository.save(electronics);
        categoryRepository.save(audio);
        categoryRepository.save(fashion);
        categoryRepository.save(home);
        categoryRepository.save(books);

        // 2. Products
        Product p1 = new Product(1L, "iPhone 15 Pro", "Titanium design, A17 Pro chip, 48MP camera, and USB-C", 999.99, "Electronics", 35, "https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=500", 4.8, 124, List.of("apple", "smartphone", "ios", "flagship"));
        Product p2 = new Product(2L, "MacBook Pro 16\"", "Apple M3 Pro chip, 18GB unified memory, 512GB SSD, Liquid Retina XDR", 2499.00, "Electronics", 15, "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500", 4.9, 88, List.of("apple", "laptop", "macos", "workstation"));
        Product p3 = new Product(3L, "Sony WH-1000XM5", "Industry-leading noise cancellation, 30-hour battery life, crystal clear hands-free calling", 398.00, "Audio & Accessories", 50, "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500", 4.7, 210, List.of("sony", "headphones", "bluetooth", "anc"));
        Product p4 = new Product(4L, "Samsung Galaxy S24 Ultra", "Galaxy AI, 200MP camera, built-in S Pen, Snapdragon 8 Gen 3", 1199.99, "Electronics", 28, "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=500", 4.6, 95, List.of("samsung", "android", "smartphone", "galaxy"));
        Product p5 = new Product(5L, "Logitech MX Master 3S", "Performance wireless mouse with 8K DPI sensor and quiet clicks", 99.99, "Audio & Accessories", 75, "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=500", 4.9, 340, List.of("logitech", "mouse", "ergonomic", "productivity"));
        Product p6 = new Product(6L, "Nike Air Zoom Pegasus 40", "Responsive road running shoes with breathable engineered mesh", 130.00, "Fashion", 40, "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500", 4.5, 76, List.of("nike", "running", "shoes", "sneakers"));
        Product p7 = new Product(7L, "Levi's Classic Denim Jacket", "Timeless trucker jacket crafted with 100% durable cotton denim", 89.50, "Fashion", 60, "https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=500", 4.4, 42, List.of("levis", "jacket", "denim", "clothing"));
        Product p8 = new Product(8L, "Ninja Air Fryer Max XL", "5.5-quart capacity with Max Crisp technology up to 450 degrees", 129.99, "Home & Kitchen", 20, "https://images.unsplash.com/photo-1585515320310-259814833e62?w=500", 4.8, 180, List.of("kitchen", "airfryer", "cooking", "appliances"));
        Product p9 = new Product(9L, "Kindle Paperwhite (16 GB)", "6.8\" display with adjustable warm light and up to 10 weeks battery life", 149.99, "Books", 45, "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=500", 4.7, 115, List.of("amazon", "kindle", "ereader", "books"));
        Product p10 = new Product(10L, "Custom Mechanical Keyboard", "Hot-swappable switches, PBT keycaps, RGB backlight, aluminium frame", 119.00, "Audio & Accessories", 30, "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=500", 4.6, 64, List.of("keyboard", "mechanical", "gaming", "rgb"));

        productRepository.save(p1);
        productRepository.save(p2);
        productRepository.save(p3);
        productRepository.save(p4);
        productRepository.save(p5);
        productRepository.save(p6);
        productRepository.save(p7);
        productRepository.save(p8);
        productRepository.save(p9);
        productRepository.save(p10);

        // 3. Sample Reviews
        reviewRepository.save(new Review(1L, 1L, "1", "Alice Johnson", 5, "Incredible camera and battery life. Highly recommend!"));
        reviewRepository.save(new Review(2L, 3L, "1", "Alice Johnson", 5, "Best noise cancellation I have ever experienced. Great comfort."));
        reviewRepository.save(new Review(3L, 5L, "2", "Admin User", 5, "The scroll wheel and ergonomic shape are unmatched."));
    }
}
