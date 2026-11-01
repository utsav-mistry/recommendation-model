# Recommendation System --- Baseline Handoff for AI IDE Agents

**Purpose:** Source-of-truth handoff for continuing this project. Read
before modifying the model, building FastAPI, or integrating with the
MERN application.

**Status:** Offline baseline experiments are complete. Next milestone is
to package the working recommender as a FastAPI inference service. Do
not restart dataset construction or experimentation without a specific
reason.

## 1. Project goal

Build two recommendation capabilities for a MERN e-commerce application:

1.  **Global/category top products:** serve the precomputed Bayesian
    global and category-wise rankings.
2.  **Product-to-product recommendations:** when a customer adds one or
    more products to the cart, recommend related products using the
    precomputed item-item similarity graph.

Both capabilities are part of the current offline baseline and both must
be carried forward into the FastAPI service.

Current product-to-product flow: 1. Customer adds one or more products
to cart. 2. MERN backend sends product IDs to a Python recommendation
API. 3. API retrieves related products from a precomputed item-item
graph. 4. API merges, deduplicates, ranks candidates, and excludes
products already in the input list. 5. API returns recommended product
IDs. 6. MERN backend resolves those IDs against its own catalogue and
displays product details.

Customer-facing presentation should be simple:

``` text
ADDED TO CART
MacBook Pro Keyboard Cover

YOU MAY ALSO LIKE
1. MacBook Pro Protective Case
2. MacBook Palm Rest Cover
3. USB-C Multiport Hub
4. MacBook Laptop Sleeve
5. USB-C Charger
```

Do not expose ASINs, similarity scores, categories, training metadata,
or contribution breakdowns in the storefront.

Current capabilities:
- Global top products using Bayesian weighted-rating ranking.
- Category-wise top products using the same Bayesian ranking.
- Product-to-product recommendations using item-item collaborative filtering.

Roadmap:
- Current: expose all three current capabilities through FastAPI.
- Later: wishlist-based recommendations.
- Later: cart recommendations using multiple products.
- Last: personalised picks using customer history and popularity/trending signals.

Real cart and wishlist product IDs come from the live MERN application.
Do not create synthetic cart/wishlist tables in the Amazon research
database.

## 2. Architecture and data ownership

There are two separate environments.

### Offline research/training

-   DuckDB stores Amazon historical ratings and product metadata.
-   Python experiments build matrices, similarity graphs, rankings, and
    evaluation results.
-   The graph is precomputed offline and saved as files.
-   FastAPI should load the graph and ID mapping once at startup. Do not
    scan ratings or calculate cosine similarity on every request.

### Live application

-   MERN database stores actual store products, customers, carts,
    wishlists, and orders.
-   FastAPI receives product IDs and returns recommended IDs.
-   MERN backend resolves returned IDs against its own product
    catalogue.

The MERN database technology has not been confirmed here. Inspect the
actual application repository; do not assume MongoDB or PostgreSQL.

``` text
Customer -> MERN frontend -> MERN backend
                              |
                         product IDs
                              v
                           FastAPI
                              |
                     Precomputed item graph
                              |
                    Recommended product IDs
                              v
                         MERN backend
                              |
                  Resolve IDs in store catalogue
                              |
                      "You may also like"
```

## 3. Dataset and DuckDB

Source: Hugging Face `ChenglongMa/amazon-2023-all-category`, 20-Core.

Validated DuckDB build:

  Item                                  Value
  ------------------------------ ------------
  Ratings rows                     67,264,336
  Products                            949,779
  Categories                               25
  Users                             1,385,536
  Valid interactions               67,264,335
  Duplicate user-product pairs              0
  Unmatched rating product IDs              0
  Valid rating range                     1--5

One rating has value 0 and is excluded from valid-rating analyses.

Main tables: - `ratings`: `user_id`, `parent_asin`, `rating`,
`timestamp`, `category` - `products`: `parent_asin`, `title`,
`main_category`, `average_rating`, `rating_number`, `features`,
`description`, `price`, `images`, `videos`, `store`, `categories`,
`details`, `bought_together`, and other metadata. - Additional tables:
`categories`, `build_audit`, `source_manifest`.

Important limitations: - Ratings are available; actual shopping
cart/purchase events are not. - `bought_together` is NULL for all
products in the validated data. - Do not describe recommendations as
proven co-purchases or basket relationships. - The model discovers
products whose positive raters overlap. They may be substitutes,
accessories, or simply products with overlapping audiences. -
`main_category` can contain generic values such as `All Electronics`; do
not automatically treat this as data corruption. - The validated local
database was named `amazon_full.duckdb`. Scripts were previously run
from `experiments` using `../amazon_full.duckdb`. Verify paths in the
current repository.

## 4. Algorithms

### 4.1 Global/category ranking experiment

`global_rankings_clean.parquet` contains global and category-wise
Bayesian product rankings.

Cleaning: - Keep ratings between 1 and 5. - Exclude products with
missing/empty titles. - Clean products: 931,633. - Excluded products:
18,146.

Bayesian score:

\[ S = `\frac{v}{v+m}`{=tex}R + `\frac{m}{v+m}`{=tex}C \]

Where: - `R`: product average rating. - `v`: product rating count. -
`C`: global mean rating, approximately 4.371. - `m`: 44, selected as the
60th percentile of product rating counts in this experiment.

This is a historical rating/popularity ranking, **not real-time
trending**. A genuine recent-trending feature needs a recent time window
or time-decay logic and separate evaluation. This ranking is separate from the product-to-product algorithm, but it is still a completed and required feature of the project. Do not omit it when building FastAPI.

### 4.2 Main algorithm: item-item collaborative filtering

The current recommender is **memory-based item-item collaborative
filtering using cosine similarity over positive user interactions**.

Construction: 1. Positive interaction means rating \>= 4. 2. Build a
sparse user-item matrix. 3. Transpose it into an item-user matrix. 4.
L2-normalize item vectors. 5. Calculate cosine similarity between item
vectors. 6. Retain top-K neighbours for each product. 7. Save the sparse
graph and its item-ID mapping.

\[ `\operatorname{cosine}`{=tex}(i,j)=
`\frac{\mathbf{x}_i \cdot \mathbf{x}_j}`{=tex}
{\|`\mathbf{x}`{=tex}\_i\|\|`\mathbf{x}`{=tex}\_j\|} \]

Each product is represented by users who rated it positively. Products
are similar when their positive-rater vectors overlap.

This is **not** a neural network, matrix-factorization model,
content-based model, or supervised classifier.

### 4.3 Support/confidence diagnostic

Some high-ranked neighbours had only 1--4 shared positive raters. The
sample source product `B07H3V1YQ6` had 32 positive raters.

A hard minimum-support threshold of 10 or 20 substantially reduced graph
coverage, so the graph was not globally hard-filtered with such a
threshold.

A diagnostic also tested a heuristic adjusted score:

\[ S' = S `\cdot`{=tex}`\frac{n}{n+\lambda}`{=tex} \]

where `S` is cosine similarity, `n` is shared positive-rater support,
and `lambda` was tested at 5 and 10.

This is a heuristic, not a calibrated probability or a proven
improvement. The baseline ranking remains the original cosine similarity
unless a deliberate evaluated change is made.

## 5. Sparse matrices and model artifacts

Electronics interaction data:

  Item                                                 Value
  -------------------------------------- -------------------
  Electronics interactions                         6,550,679
  Users                                              648,314
  Products                                            74,520
  Positive interactions (rating \>= 4)             5,376,982
  Positive CSR shape                       `(648314, 74520)`
  Positive CSR memory                       approx. 43.50 MB

Sparse CSR representation is required; a dense matrix would be
impractical.

Artifacts used by experiments: - `global_rankings_clean.parquet` ---
Bayesian global/category rankings. - `electronics_item_neighbors.npz`
--- initial Electronics top-20 item-neighbour graph. -
`electronics_item_ids.npy` --- matching item ID mapping. -
`electronics_train_item_neighbors.npz` --- train-only top-100 graph used
in temporal evaluation and Experiment 14. -
`electronics_train_item_ids.npy` --- matching item ID mapping.

**Critical:** A `.npz` graph and its `.npy` item-ID mapping are a
matched pair. Always load the corresponding pair. Never mix mappings
between graphs.

The main item-item graph is **Electronics-only**, even though DuckDB
contains 25 categories. Do not claim that the current graph covers all
categories.

## 6. Evaluation results

### 6.1 Sample neighbour inspection

Source: - ASIN `B07H3V1YQ6` - MOSISO Silicone Keyboard Cover for MacBook
Pro 13-inch.

Initial neighbours included MacBook palm-rest covers, cases, another
keyboard cover, USB-C chargers, hubs and docks. Some results were less
relevant (for example, an iPad screen protector and generic earbuds).
Manual review found most of the first ten plausible, but not all. This
was accepted as a useful baseline, not a perfect recommender.

### 6.2 Temporal evaluation of item-item CF

One global cutoff at the 80th percentile was used:

-   Cutoff timestamp: `1609301389557`.
-   Train positive interactions: 4,328,951.
-   Test positive interactions: 1,048,031.
-   Training users: 614,261.
-   Training products: 65,798.
-   Train-only graph: up to 100 neighbours per item.
-   Test positives with known training user and product: 650,432.
-   Excluded because user or product was unseen in training: 397,599.
-   Eligible evaluation users: 276,571.
-   Sample: 10,000 users, seed 42.

  Metric                           Item-item CF
  ------------------------------ --------------
  Precision@10                          0.00144
  Recall@10                            0.006352
  NDCG@10                              0.003924
  User recommendation coverage             100%
  Catalog coverage                     41.5803%
  Unique recommended products            27,359

This is one temporal split and a 10,000-user sample, not definitive
generalization evidence. It predicts future positive ratings, not
purchases, clicks, cart additions, or satisfaction.

### 6.3 Popularity baseline

Popularity ranked products by count of positive training interactions,
using the same temporal split and user sample.

  Metric                          Item-item CF   Popularity
  ----------------------------- -------------- ------------
  Precision@10                         0.00144      0.00232
  Recall@10                           0.006352     0.011417
  NDCG@10                             0.003924     0.005949
  Catalog coverage                    41.5803%      0.0228%
  Unique recommended products           27,359           15

Popularity scored better on Precision@10, Recall@10, and NDCG@10, but
collapsed to only 15 unique products across the sample. Item-item CF had
much broader catalog coverage.

Do not claim CF beat popularity on those three ranking metrics.
Popularity is a useful fallback/baseline but has severe recommendation
concentration.

## 7. Experiment 14: multi-product recommendations

This experiment tests cart/wishlist-style inputs.

Logic: 1. Accept multiple product IDs. 2. Find each product's row in the
item-ID mapping. 3. Retrieve each input product's neighbour row from the
sparse graph. 4. Merge candidate products. 5. Exclude all input IDs. 6.
Deduplicate candidates. 7. Aggregate similarity contributions. 8. Rank
candidates. 9. Fetch product titles from DuckDB for offline display.

Compared aggregation strategies: - `sum`: sum all similarity
contributions for a candidate. - `max`: take the strongest
contribution. - `average_contributors`: average only over input products
that contributed a score.

Initial test inputs: - `B07H3V1YQ6` --- MOSISO MacBook keyboard cover. -
`B07FY4T24Z` --- iyesku wireless earbuds.

It produced 187 unique candidates and correctly excluded both inputs.
Since the input products were unrelated, the merged results included
unrelated products. This is a limitation of the collaborative-filtering
signal, not a reason to claim semantic understanding.

The `sum` strategy ranked Satechi USB-C Hub first because it had
contributions from both inputs. The output also showed that unrelated
source products can lead to noisy recommendations.

The later demonstration input was changed to two related MacBook
products: - `B07H3V1YQ6` --- MacBook keyboard cover. - `B07TZQCCTS` ---
MacBook protective case.

The final demonstration uses `sum` as the baseline aggregation. It is
not proven optimal; preserve it unless a concrete test supports changing
it.

### Final display requirement

The display was simplified to resemble an e-commerce cart
recommendation:

``` text
=======================================================
                 ADDED TO CART
=======================================================

  MOSISO Silicone Keyboard Cover ...

=======================================================
                YOU MAY ALSO LIKE
=======================================================

  1. F FORITO Palm Rest Cover Skin ...
  2. ...
  3. ...

=======================================================
            RECOMMENDATIONS READY
=======================================================
```

Do not show product IDs, categories, prices, similarity scores, or
per-input contributions in this presentation. The latest script was
adjusted to this format. The exact output from the latest
two-MacBook-input version still needs to be run and manually inspected;
do not invent or assume its top results.

## 8. What works now

Implemented and tested offline: - Dataset import and DuckDB
validation. - Data cleaning and Bayesian global/category ranking. -
Electronics sparse user-item matrix. - Positive interaction filtering
(rating \>= 4). - Item-item cosine similarity. - Top-K neighbour graph
construction. - Sparse graph persistence and matching item-ID mapping. -
Single-product neighbour lookup. - Multi-product neighbour lookup. -
Candidate merging and deduplication. - Exclusion of input products. -
Multiple aggregation strategies for comparison. - Product-title lookup
for offline output. - Simple e-commerce-style recommendation display. -
Temporal evaluation against a popularity baseline.

This is a working research baseline, not yet a production-ready service.

## 9. Known limitations

1.  Collaborative filtering is not semantic product understanding.
2.  Dataset interactions are ratings, not real cart or purchase events.
3.  Some item relationships have very low shared-rater support.
4.  Irrelevant products can appear, especially with unrelated input
    products.
5.  Products missing from the graph are cold-start products.
6.  The current graph covers Electronics, not all 25 dataset categories.
7.  Bayesian historical ranking is not live/recent trending.
8.  Popularity beat CF on the three reported ranking metrics, while CF
    had much higher catalog coverage.
9.  Top-K truncation means a product outside the retained neighbour list
    cannot be returned.
10. Graph and item-ID mapping must always match.
11. Amazon metadata may be noisy or generic. Collaborative filtering
    does not guarantee product compatibility.

## 10. Next milestone: FastAPI service for BOTH recommendation capabilities

Do not rebuild rankings or the similarity graph for each request.

The service must expose two distinct recommendation paths:

### A. Global and category-wise top products

The offline artifact is `global_rankings_clean.parquet`.

It contains the Bayesian global ranking and category-wise rankings.
FastAPI should load or query this precomputed artifact efficiently and
return the top N products.

Suggested endpoints (adapt names to the existing repository
conventions):

-   `GET /recommendations/global?limit=10`
-   `GET /recommendations/category/{category}?limit=10`

These endpoints should return product IDs in ranking order. The MERN
backend should resolve those IDs against its own catalogue before
showing product cards.

Example response shape:

``` json
{
  "recommendations": [
    {"product_id": "PRODUCT_ID_1"},
    {"product_id": "PRODUCT_ID_2"}
  ]
}
```

`PRODUCT_ID_1` and `PRODUCT_ID_2` are illustrative placeholders, not
actual product IDs.

Important: - This is a historical Bayesian rating/popularity ranking,
not real-time trending. - Preserve the existing global and category
ranking results as the baseline. - Do not recompute the Bayesian ranking
on every API request. - Do not expose Bayesian scores, rating counts,
categories, or ASINs in the customer-facing UI unless the product
explicitly requires them. - Confirm how the MERN catalogue maps Amazon
`parent_asin` values to its own product IDs. If there is no mapping, the
MERN application cannot directly resolve these Amazon products as its
own catalogue products. The global ranking may initially be useful for
offline demonstration or a separate Amazon-catalogue prototype until a
catalogue mapping/import exists.

### B. Product-to-product recommendations

Suggested endpoint:

`POST /recommendations`

Example request:

``` json
{
  "product_ids": ["B07H3V1YQ6"],
  "limit": 10
}
```

Example response:

``` json
{
  "recommendations": [
    {"product_id": "B0BRB3WGMK"},
    {"product_id": "B07ZQ1PCJJ"}
  ]
}
```

This is a proposed service contract, not an already implemented
endpoint. Confirm the live MERN catalogue's identifier format before
finalizing it.

Request:

``` json
{
  "product_ids": ["B07H3V1YQ6"],
  "limit": 10
}
```

Suggested response:

``` json
{
  "recommendations": [
    {"product_id": "B0BRB3WGMK"},
    {"product_id": "B07ZQ1PCJJ"}
  ]
}
```

This is a proposed contract, not an already implemented endpoint.
Confirm the MERN catalogue's identifier format before finalizing it.
Amazon ASINs may not be the same as the store's product IDs; create an
explicit mapping if necessary.

Implementation requirements:
- Load `electronics_train_item_neighbors.npz` and `electronics_train_item_ids.npy` once at startup for product-to-product inference.
- Load or efficiently access `global_rankings_clean.parquet` for global and category-wise top-product endpoints.
- Validate that graph and ID mapping are compatible.
- Build an in-memory product-ID-to-row-index mapping.
- Accept one or multiple product IDs.
- Merge candidates, deduplicate, exclude every input product, and rank using current `sum` aggregation.
- Support a configurable result limit.
- Return product IDs only (or a minimal stable schema); keep scores internal by default.
- Handle malformed requests, unknown/out-of-graph IDs, empty graph rows, and no-candidate results gracefully.
- Decide and document whether unknown IDs are skipped or produce a structured error.
- Do not query the full DuckDB ratings database for every live request. Preload/cache the global ranking artifact or use an appropriate lightweight precomputed store.
- Do not return Amazon metadata as if it were the MERN application's product catalogue.
- Add health/readiness endpoints, basic logging, and tests.
- Use configurable paths, not machine-specific absolute Windows paths.
- Test single input, multiple inputs, duplicate candidates, input exclusion, unknown IDs, empty rows, and limit handling.

MERN integration: - MERN backend sends product IDs from cart/wishlist
context. - FastAPI returns recommended IDs. - MERN backend resolves IDs
in its own catalogue. - MERN filters unavailable, unpublished, deleted,
or otherwise ineligible store products. - MERN owns customer-facing
product details and ordering. - Do not assume ASIN equals the store's
product ID.

Deployment: - Package the exact graph and matching ID mapping as
versioned model artifacts. - Ensure both files are available to the API
at startup. - DuckDB is not required for online inference if the API
only loads the precomputed graph and returns IDs.

## 11. Instructions for AI IDE agents

1.  Read this document before making changes.
2.  Inspect the actual repository, scripts, artifact paths, Python
    environment, and MERN structure.
3.  Preserve the validated baseline and existing artifacts.
4.  Do not rerun the 67-million-row dataset build without a concrete
    reason.
5.  Do not replace item-item cosine collaborative filtering with neural
    models, matrix factorization, embeddings, or a different algorithm
    without explicit approval and comparative evaluation.
6.  Do not invent purchase, cart, wishlist, or co-purchase data.
7.  Do not claim recommendations are perfect or guaranteed
    complementary.
8.  Do not expose internal scores, ASINs, categories, or diagnostics in
    storefront UI.
9.  Keep the recommendation engine independent of the MERN catalogue:
    API returns IDs; MERN resolves details.
10. Make small, testable changes and preserve reproducibility.
11. Compare ranking changes against the current `sum` baseline.
12. Record changes to graph generation, thresholds, aggregation,
    evaluation, and API contract.

## 12. Baseline in one sentence

The current engine is a **sparse item-item collaborative-filtering
recommender** using cosine similarity between products' positive-rater
vectors (ratings \>= 4), storing top-K neighbours offline, and combining
neighbours from one or more input products using summed similarity
scores while excluding the input products.

## Final status

-   **Offline baseline:** Implemented and tested, including Bayesian global/category rankings and item-item collaborative filtering.
-   **Global/category top products:** Offline ranking artifact generated and inspected for all 25 categories. FastAPI serving and MERN catalogue integration are not yet implemented.
-   **Multi-product flow:** Candidate merging, deduplication, input
    exclusion, and aggregation implemented and tested.
-   **Recommendation relevance:** Imperfect; depends on
    collaborative-filtering signal quality and support.
-   **Customer-facing display:** Simplified to `ADDED TO CART` /
    `YOU MAY ALSO LIKE`.
-   **Next milestone:** Build FastAPI with both global/category top-product endpoints (using `global_rankings_clean.parquet`) and product-to-product endpoints (using the precomputed train-only Electronics graph), then integrate with MERN.

**Default instruction: productize the baseline first. Do not restart
experimentation by default.**
