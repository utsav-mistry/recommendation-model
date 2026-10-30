# Global Product Recommendation System
## System Architecture, Components and End-to-End Workflow

### 1. Project Overview

The objective is to develop a cross-category product recommendation system using the Amazon 2023 All-Category 20-Core dataset and integrate it into a MERN-based e-commerce application.

The first release will provide **global recommendations**. All users will receive recommendations based on aggregate product ratings, popularity and other globally available product information.

The system will initially operate independently of individual user preferences.

### 2. Project Scope

**Included in Version 1**
- Global product recommendations across multiple categories.
- Product popularity analysis.
- Rating-based product ranking.
- Product metadata processing.
- Recommendation model development and evaluation.
- Python-based recommendation API.
- MERN integration.
- Periodic model updates.

**Deferred to future versions**
- Cart-based recommendations.
- Wishlist-based recommendations.
- Individual browsing-history recommendations.
- User-specific collaborative filtering.
- Age-based recommendations.
- Context-aware recommendations.

These features will be introduced incrementally after the global recommendation system is working reliably.

### 3. Dataset

The initial training and analysis source is:

`ChenglongMa/amazon-2023-all-category-k-core`

The downloaded 20-core dataset contains the following validated database records:

| Component | Records |
|---|---:|
| Ratings | 67,264,336 |
| Products | 949,779 |
| Categories | 25 |

The existing DuckDB database is named `amazon_full.duckdb`.

Its tables include:

- `ratings`: User identifiers, product identifiers, ratings, timestamps and categories.
- `products`: Product titles, average ratings, rating counts, descriptions, prices, images and other metadata.
- `categories`: Category information.
- `build_audit`: Database construction and validation information.
- `source_manifest`: Source file information.

The original dataset will be retained as the source of truth. Preprocessing and training will operate on derived datasets rather than modifying the original data.

### 4. High-Level Architecture

The system will have four major layers.

#### A. Data and ML Layer

Technology: Python, DuckDB, Pandas or Polars, NumPy and appropriate ML libraries.

Responsibilities:
- Read the Amazon dataset.
- Analyze product and rating distributions.
- Clean and transform data.
- Calculate global product ranking features.
- Train and evaluate recommendation algorithms.
- Export model artifacts and ranked product IDs.

#### B. Recommendation Service

Technology: Python and FastAPI.

Responsibilities:
- Load the trained recommendation artifacts.
- Expose recommendation endpoints.
- Return ranked product identifiers and scores.
- Support category filters and configurable result limits.
- Provide health and model-version endpoints.

#### C. E-commerce Backend

Technology: Node.js, Express and MongoDB.

Responsibilities:
- Manage users and products.
- Communicate with the recommendation service.
- Retrieve product details using returned product identifiers.
- Handle application authentication.
- Later collect user interactions such as clicks, cart additions and purchases.

#### D. Frontend

Technology: React.

Responsibilities:
- Display recommended products.
- Render product cards using the e-commerce product catalog.
- Display global recommendations on the homepage.
- Later support personalized recommendation sections.

### 5. End-to-End Request Flow

1. The recommendation model is trained offline using the Amazon dataset.
2. The training process generates a ranked list of recommended product identifiers and associated scores.
3. The Python recommendation service loads the generated artifacts.
4. A visitor opens the e-commerce website.
5. React requests global recommendations from the Express backend.
6. Express calls the Python recommendation API.
7. The Python service returns ranked product identifiers.
8. Express retrieves corresponding product details from MongoDB.
9. React displays the recommended products.

The recommendation service will not need to query or process the entire Amazon dataset for every website request.

### 6. Important Product Catalog Consideration

The Amazon dataset and the MERN website's product catalog may contain different products.

The recommendation system must therefore establish a product mapping between the trained recommendation catalog and the products available on the website.

If the website uses Amazon-derived products, the mapping can use a consistent product identifier.

If the website uses an independent catalog, a separate catalog adaptation or training process will be needed.

A recommendation must never return a product that the website cannot resolve or display.

### 7. Proposed API Endpoints

| Endpoint | Purpose |
|---|---|
| `GET /recommendations/global` | Return globally recommended products |
| `GET /recommendations/global?limit=20` | Return a specified number of products |
| `GET /recommendations/categories/:category` | Return recommendations for a category |
| `GET /health` | Check service health |
| `GET /model/info` | Return model version and training information |

The Express application will expose corresponding frontend-facing endpoints.

### 8. Deployment Architecture

The initial development environment can run the MERN application and Python recommendation service separately.

For example:

- React: frontend application.
- Express: application backend.
- MongoDB: e-commerce database.
- FastAPI: recommendation service.
- DuckDB: offline analytical data source.
- Model artifacts: serialized ranking data and model parameters.

The training environment does not need to remain online while users access the e-commerce website.

### 9. Future Architecture Extensions

The architecture should support future recommendation modules without requiring a complete rewrite.

| Version | Recommendation type |
|---|---|
| V1 | Global recommendations |
| V2 | Cart-based recommendations |
| V3 | Wishlist-based recommendations |
| V4 | Browsing and interaction-based personalization |
| V5 | Age-aware recommendations, subject to appropriate consent and privacy safeguards |
| V6 | Hybrid recommendation system |

The global recommendation engine will remain an independent baseline and fallback for new users.

### 10. Expected Outcome

At the completion of Version 1, the e-commerce website should be able to display globally ranked products using an independently developed recommendation service.

The recommendation system should be:
- Reproducible.
- Evaluated using defined metrics.
- Independent of the MERN backend's internal implementation.
- Capable of serving recommendations through an API.
- Extensible for future personalization features.