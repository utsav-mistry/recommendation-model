package com.ecommerce.repository;

import com.ecommerce.model.Product;
import org.springframework.stereotype.Repository;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicLong;
import java.util.stream.Collectors;

@Repository
public class ProductRepository {
    private final ConcurrentHashMap<Long, Product> products = new ConcurrentHashMap<>();
    private final AtomicLong idGenerator = new AtomicLong(100);

    public Product save(Product product) {
        if (product.getId() == null) {
            product.setId(idGenerator.incrementAndGet());
        }
        products.put(product.getId(), product);
        return product;
    }

    public Optional<Product> findById(Long id) {
        return Optional.ofNullable(products.get(id));
    }

    public List<Product> findAll() {
        return new ArrayList<>(products.values());
    }

    public boolean deleteById(Long id) {
        return products.remove(id) != null;
    }

    public boolean existsById(Long id) {
        return products.containsKey(id);
    }

    public List<Product> findByCategory(String category) {
        if (category == null || category.isBlank()) {
            return findAll();
        }
        return products.values().stream()
                .filter(p -> Boolean.TRUE.equals(p.getActive()))
                .filter(p -> p.getCategory() != null && p.getCategory().equalsIgnoreCase(category))
                .collect(Collectors.toList());
    }

    public List<Product> search(String query, String category, Double minPrice, Double maxPrice, String sortBy) {
        return products.values().stream()
                .filter(p -> Boolean.TRUE.equals(p.getActive()))
                .filter(p -> {
                    if (query == null || query.isBlank()) return true;
                    String q = query.toLowerCase();
                    boolean nameMatch = p.getName() != null && p.getName().toLowerCase().contains(q);
                    boolean descMatch = p.getDescription() != null && p.getDescription().toLowerCase().contains(q);
                    boolean tagMatch = p.getTags() != null && p.getTags().stream().anyMatch(t -> t.toLowerCase().contains(q));
                    return nameMatch || descMatch || tagMatch;
                })
                .filter(p -> {
                    if (category == null || category.isBlank() || category.equalsIgnoreCase("all")) return true;
                    return p.getCategory() != null && p.getCategory().equalsIgnoreCase(category);
                })
                .filter(p -> {
                    if (minPrice == null) return true;
                    return p.getPrice() != null && p.getPrice() >= minPrice;
                })
                .filter(p -> {
                    if (maxPrice == null) return true;
                    return p.getPrice() != null && p.getPrice() <= maxPrice;
                })
                .sorted((p1, p2) -> {
                    if (sortBy == null) return 0;
                    switch (sortBy.toLowerCase()) {
                        case "price_asc":
                            return Double.compare(p1.getPrice() != null ? p1.getPrice() : 0.0, p2.getPrice() != null ? p2.getPrice() : 0.0);
                        case "price_desc":
                            return Double.compare(p2.getPrice() != null ? p2.getPrice() : 0.0, p1.getPrice() != null ? p1.getPrice() : 0.0);
                        case "rating":
                            return Double.compare(p2.getRating() != null ? p2.getRating() : 0.0, p1.getRating() != null ? p1.getRating() : 0.0);
                        case "newest":
                            if (p1.getCreatedAt() == null || p2.getCreatedAt() == null) return 0;
                            return p2.getCreatedAt().compareTo(p1.getCreatedAt());
                        case "name":
                            return String.CASE_INSENSITIVE_ORDER.compare(p1.getName() != null ? p1.getName() : "", p2.getName() != null ? p2.getName() : "");
                        default:
                            return 0;
                    }
                })
                .collect(Collectors.toList());
    }
}
