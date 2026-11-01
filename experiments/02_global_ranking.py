
import duckdb
import pandas as pd

DB_PATH = "../amazon_full.duckdb"

con = duckdb.connect(DB_PATH, read_only=True)

# Calculate the overall average rating
C = con.execute("""
    SELECT AVG(rating)
    FROM ratings
""").fetchone()[0]

# Use the 60th percentile as the minimum rating threshold
m = con.execute("""
    SELECT QUANTILE_CONT(rating_count, 0.60)
    FROM (
        SELECT parent_asin, COUNT(*) AS rating_count
        FROM ratings
        GROUP BY parent_asin
    )
""").fetchone()[0]

print(f"Overall average rating: {C:.3f}")
print(f"Minimum rating threshold: {m:.0f}")

# Aggregate product ratings
products = con.execute("""
    SELECT
        p.parent_asin,
        p.title,
        p.source_category AS category,
        COUNT(r.rating) AS rating_count,
        AVG(r.rating) AS average_rating
    FROM products p
    JOIN ratings r
        ON p.parent_asin = r.parent_asin
    GROUP BY
        p.parent_asin,
        p.title,
        p.source_category
""").df()

# Three ranking approaches
products["popularity_score"] = products["rating_count"]

products["average_rating_score"] = products["average_rating"]

v = products["rating_count"]
R = products["average_rating"]

products["bayesian_score"] = (
    (v / (v + m)) * R
    + (m / (v + m)) * C
)

# Compare global rankings
for method in [
    "popularity_score",
    "average_rating_score",
    "bayesian_score"
]:
    print(f"\n========== TOP 10: {method} ==========")

    print(
        products.sort_values(
            method, ascending=False
        )[["title", "category", "rating_count",
           "average_rating", method]].head(10).to_string(index=False)
    )

# Category-wise recommendations
print("\n========== CATEGORY-WISE TOP PICKS ==========")

for category in products["category"].dropna().unique():

    subset = products[products["category"] == category]

    top = subset.sort_values(
        "bayesian_score",
        ascending=False
    ).head(5)

    print(f"\n{category}")
    print(top[["title", "average_rating",
               "rating_count", "bayesian_score"]].to_string(index=False))

# Save results
products.sort_values(
    "bayesian_score", ascending=False
).to_parquet("global_rankings.parquet", index=False)

print("\nSaved: global_rankings.parquet")

con.close()
