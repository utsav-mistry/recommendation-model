package com.ecommerce.repository;

import com.ecommerce.model.Category;
import org.springframework.stereotype.Repository;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicLong;

@Repository
public class CategoryRepository {
    private final ConcurrentHashMap<Long, Category> categories = new ConcurrentHashMap<>();
    private final AtomicLong idGenerator = new AtomicLong(10);

    public Category save(Category category) {
        if (category.getId() == null) {
            category.setId(idGenerator.incrementAndGet());
        }
        categories.put(category.getId(), category);
        return category;
    }

    public Optional<Category> findById(Long id) {
        return Optional.ofNullable(categories.get(id));
    }

    public Optional<Category> findBySlug(String slug) {
        if (slug == null) return Optional.empty();
        return categories.values().stream()
                .filter(c -> slug.equalsIgnoreCase(c.getSlug()))
                .findFirst();
    }

    public List<Category> findAll() {
        return new ArrayList<>(categories.values());
    }

    public boolean deleteById(Long id) {
        return categories.remove(id) != null;
    }
}
