# Global Product Recommendation Model
## Dataset Processing, Algorithm Development, Training and Evaluation

### 1. Objective

The objective is to develop a global product recommendation model using the Amazon 2023 All-Category 20-Core dataset.

The initial model will rank products for all website visitors using information aggregated across the dataset.

It will not initially depend on:
- Individual user IDs.
- Personal browsing history.
- Shopping cart contents.
- Wishlist contents.
- Age or demographic information.

The primary objective is to identify products that are globally relevant and worth recommending.

### 2. Available Data

The current DuckDB database contains:

**Ratings table**

| Column | Description |
|---|---|
| `user_id` | User identifier |
| `parent_asin` | Product identifier |
| `rating` | User rating |
| `timestamp` | Rating timestamp |
| `category` | Product category |

**Products table**

| Column | Description |
|---|---|
| `parent_asin` | Product identifier |
| `title` | Product title |
| `average_rating` | Average product rating |
| `rating_number` | Number of ratings |
| `main_category` | Main product category |
| `price` | Product price |
| `description` | Product description |
| `features` | Product features |
| `categories` | Category hierarchy |
| `images` | Product images |
| `details` | Additional product information |

The ratings table provides interaction and feedback data. The products table provides product-level information.

### 3. Data Exploration

Before training, perform exploratory data analysis.

The following analyses are required:

1. Total number of unique users.
2. Total number of unique products.
3. Number of ratings per product.
4. Rating distribution.
5. Number of products per category.
6. Average rating per category.
7. Distribution of products with very few or very many ratings.
8. Rating activity over time.
9. Missing product metadata.
10. Distribution of product prices.

The purpose is to understand the dataset before choosing the final recommendation algorithm.

### 4. Data Preparation

The original dataset should remain unchanged.

Create derived datasets for model development.

Recommended preparation steps:

- Validate product identifiers.
- Check rating ranges.
- Remove or handle invalid records.
- Check duplicate interactions.
- Handle missing ratings and product metadata.
- Normalize category labels where required.
- Calculate aggregate product statistics.
- Prepare a reproducible training dataset.

Avoid unnecessary removal of products with limited information. Missing metadata can be handled separately from rating-based ranking.

### 5. Initial Model: Global Popularity Ranking

The first model will establish a baseline.

A simple popularity model ranks products using their overall rating count.

However, rating count alone is not sufficient. A product with thousands of mediocre ratings should not automatically outrank a product with consistently excellent ratings.

Therefore, the initial global ranking should combine rating quality and rating volume.

A suitable approach is Bayesian weighted rating:

\[
WR = \frac{v}{v+m}R+\frac{m}{v+m}C
\]

Where:

- \(WR\): Weighted product rating.
- \(R\): Product's average rating.
- \(v\): Number of ratings received by the product.
- \(m\): Minimum rating count threshold.
- \(C\): Overall mean rating across the dataset.

This approach reduces the influence of products with very few ratings.

The value of \(m\) should be selected using the dataset's rating-count distribution, rather than guessed.

### 6. Additional Ranking Features

The global model can use several features:

| Feature | Purpose |
|---|---|
| Average rating | Measures rating quality |
| Rating count | Measures popularity and confidence |
| Weighted rating | Balances rating quality and volume |
| Rating recency | Identifies products with recent activity |
| Category | Enables category-aware ranking |
| Price | Enables future price-aware filtering |

Initially, weighted rating and popularity should be the main ranking signals.

Recency can be tested as an additional feature, but should not be included without evaluating whether it improves recommendation quality.

### 7. Model Development Strategy

Develop and compare multiple approaches.

**Model A — Popularity-Based Recommendation**

Ranks products using rating count.

Purpose: Establish a basic benchmark.

**Model B — Rating-Based Recommendation**

Ranks products by average rating.

Purpose: Understand the impact of rating quality without popularity weighting.

**Model C — Bayesian Weighted Ranking**

Combines average rating, rating count and the overall mean rating.

Purpose: Produce a more reliable global ranking.

**Model D — Recency-Aware Ranking**

Adds time-based signals to the global ranking.

Purpose: Test whether recent activity improves recommendation relevance.

**Model E — Hybrid Global Ranking**

Combines the best-performing global ranking signals.

Purpose: Select the final Version 1 recommendation algorithm.

The final model should be chosen using evaluation results, not complexity.

### 8. Training and Validation Strategy

The dataset should be divided into training, validation and test periods.

A temporal split is preferable because recommendation systems are expected to recommend products using information available before the recommendation time.

For example:

- Training: Earlier interactions.
- Validation: A later time period.
- Testing: The most recent held-out time period.

The exact dates and split proportions should be selected after inspecting the timestamp distribution.

Avoid random splitting as the only evaluation method because it can allow future interactions to influence training.

### 9. Evaluation Metrics

The model must be evaluated quantitatively.

Recommended metrics:

| Metric | Purpose |
|---|---|
| Precision@K | Measures how many recommended products are relevant |
| Recall@K | Measures how many relevant products are retrieved |
| NDCG@K | Measures ranking quality |
| Coverage | Measures how much of the product catalog is recommended |
| Popularity distribution | Measures whether recommendations are excessively concentrated on a few products |

Evaluate at multiple recommendation sizes, such as K = 5, 10 and 20.

Because the first version is global, the evaluation should use a clearly defined global relevance criterion.

For example, a held-out product interaction can be considered relevant when it meets a specified rating threshold.

This criterion must be defined before comparing algorithms.

### 10. Category Handling

The project is cross-category, so global ranking must not accidentally become dominated by only the largest or most active categories.

Evaluate:

- Overall recommendation quality.
- Recommendation distribution across categories.
- Per-category performance.
- Category coverage.

The system can support two types of recommendations:

1. Overall global recommendations.
2. Global recommendations restricted to a selected category.

The category-specific version should still use aggregate data, not individual user preferences.

### 11. Model Artifacts

After training and evaluation, save the outputs needed for production inference.

Suggested artifacts:

```text
artifacts/
├── global_recommendations.parquet
├── product_scores.parquet
├── category_recommendations.parquet
├── model_config.json
├── evaluation_results.json
└── training_metadata.json
```

The artifacts should include:

- Product identifiers.
- Ranking scores.
- Ranking positions.
- Category information.
- Model version.
- Training timestamp.
- Evaluation results.
- Configuration parameters.

For a global ranking model, the ranked product list may be precomputed. The API can then retrieve the required top K products without loading the full training dataset.

### 12. Recommendation API Integration

The trained model will be served through FastAPI.

The API will load the generated artifacts and provide:

- Global top-K recommendations.
- Category-specific top-K recommendations.
- Product score lookup.
- Model information.

The API should return product identifiers and scores, not duplicate the entire e-commerce product catalog.

The MERN backend will resolve those identifiers against its own product database.

### 13. Model Update Strategy

The first version can use offline retraining.

A possible pipeline:

1. Obtain updated source data.
2. Validate the data.
3. Run preprocessing.
4. Recalculate product statistics.
5. Train or regenerate ranking artifacts.
6. Evaluate against the existing model.
7. Publish the new model version if it meets quality requirements.

The production API should not be interrupted while model artifacts are being prepared.

### 14. Future Model Extensions

The global model will provide the foundation for more advanced recommendation methods.

**Cart-based recommendations**

Use items in the current cart to identify complementary or related products.

**Wishlist-based recommendations**

Use saved products to identify related products and purchasing opportunities.

**Personalized recommendations**

Use individual interaction history and collaborative filtering.

**Age-aware recommendations**

Introduce age-aware ranking only after establishing appropriate data collection, consent, access controls and privacy safeguards.

**Hybrid recommendations**

Combine global popularity, product similarity, collaborative signals and user-specific preferences.

These extensions should be evaluated independently and compared against the global baseline.

### 15. Final Deliverables

The model development phase is complete when the following are available:

1. Dataset exploration report.
2. Reproducible preprocessing pipeline.
3. Global popularity baseline.
4. Bayesian weighted ranking model.
5. Comparative evaluation results.
6. Final global recommendation artifacts.
7. FastAPI inference service.
8. Integration with the MERN application.
9. Model versioning and retraining procedure.

### 16. Success Criteria

The final system should:

- Recommend products across all supported categories.
- Produce stable and reproducible rankings.
- Avoid over-promoting products with very few ratings.
- Demonstrate measurable ranking quality.
- Support category-specific global recommendations.
- Return valid product identifiers for the e-commerce catalog.
- Serve recommendations without performing full model training during user requests.

The first release prioritizes reliability, measurable quality and production integration over unnecessary algorithmic complexity.