
import duckdb

DB_PATH = "../amazon_full.duckdb"

con = duckdb.connect(DB_PATH, read_only=True)

# 1. Global average rating
C = con.execute("""
    SELECT AVG(rating)
    FROM ratings
    WHERE rating BETWEEN 1 AND 5
""").fetchone()[0]

# 2. Minimum rating threshold
m = con.execute("""
    SELECT QUANTILE_CONT(rating_count, 0.60)
    FROM (
        SELECT parent_asin, COUNT(*) AS rating_count
        FROM ratings
        WHERE rating BETWEEN 1 AND 5
        GROUP BY parent_asin
    )
""").fetchone()[0]

# 3. Aggregate valid product ratings
products = con.execute("""
    SELECT
        p.parent_asin,
        p.title,
        p.source_category AS category,
        COUNT(*) AS rating_count,
        AVG(r.rating) AS average_rating
    FROM products p
    JOIN ratings r
        ON p.parent_asin = r.parent_asin
    WHERE r.rating BETWEEN 1 AND 5
    GROUP BY
        p.parent_asin,
        p.title,
        p.source_category
""").df()

# 4. Remove missing or empty titles
before = len(products)

products = products[
    products["title"].notna()
    & products["title"].str.strip().ne("")
].copy()

excluded = before - len(products)

# 5. Calculate Bayesian weighted rating
v = products["rating_count"]
R = products["average_rating"]

products["bayesian_score"] = (
    (v / (v + m)) * R
    + (m / (v + m)) * C
)

# 6. Print dataset summary
print(f"Global average: {C:.3f}")
print(f"Minimum threshold: {m:.0f}")
print(f"Products before cleaning: {before:,}")
print(f"Products excluded: {excluded:,}")
print(f"Products remaining: {len(products):,}")

# 7. Category-wise top 10
for category, group in products.groupby("category"):

    top = group.nlargest(10, "bayesian_score")

    print(f"\n========== {category} ==========")

    print(
        top[
            [
                "parent_asin",
                "title",
                "rating_count",
                "average_rating",
                "bayesian_score"
            ]
        ].to_string(index=False)
    )

# 8. Save results
products.to_parquet(
    "global_rankings_clean.parquet",
    index=False
)

print("\nSaved global_rankings_clean.parquet")

con.close()
