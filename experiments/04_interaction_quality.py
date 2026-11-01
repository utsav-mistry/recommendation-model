
import duckdb

DB_PATH = "../amazon_full.duckdb"

con = duckdb.connect(DB_PATH, read_only=True)

print("\n========== INTERACTION QUALITY ==========\n")

# 1. Overall valid interaction statistics
stats = con.execute("""
    SELECT
        COUNT(*) AS total_interactions,
        COUNT(DISTINCT user_id) AS unique_users,
        COUNT(DISTINCT parent_asin) AS unique_products,
        COUNT(DISTINCT category) AS categories
    FROM ratings
    WHERE rating BETWEEN 1 AND 5
""").fetchdf()

print("1. Overall statistics")
print(stats.to_string(index=False))


# 2. Duplicate user-product interactions
duplicates = con.execute("""
    SELECT
        COUNT(*) AS duplicate_user_product_pairs,
        SUM(interaction_count - 1) AS extra_interaction_rows
    FROM (
        SELECT
            user_id,
            parent_asin,
            COUNT(*) AS interaction_count
        FROM ratings
        WHERE rating BETWEEN 1 AND 5
        GROUP BY user_id, parent_asin
        HAVING COUNT(*) > 1
    )
""").fetchdf()

print("\n2. Duplicate interactions")
print(duplicates.to_string(index=False))


# 3. How many repeated pairs have different ratings?
rating_variations = con.execute("""
    SELECT
        COUNT(*) AS pairs_with_different_ratings
    FROM (
        SELECT
            user_id,
            parent_asin
        FROM ratings
        WHERE rating BETWEEN 1 AND 5
        GROUP BY user_id, parent_asin
        HAVING COUNT(DISTINCT rating) > 1
    )
""").fetchdf()

print("\n3. Repeated pairs with different ratings")
print(rating_variations.to_string(index=False))


# 4. Inspect a sample of duplicate interactions
samples = con.execute("""
    SELECT
        user_id,
        parent_asin,
        COUNT(*) AS interaction_count,
        COUNT(DISTINCT rating) AS distinct_ratings,
        MIN(timestamp) AS first_timestamp,
        MAX(timestamp) AS latest_timestamp
    FROM ratings
    WHERE rating BETWEEN 1 AND 5
    GROUP BY user_id, parent_asin
    HAVING COUNT(*) > 1
    ORDER BY interaction_count DESC
    LIMIT 10
""").fetchdf()

print("\n4. Sample duplicate pairs")
print(samples.to_string(index=False))


# 5. Rating distribution after excluding invalid values
distribution = con.execute("""
    SELECT
        rating,
        COUNT(*) AS interaction_count
    FROM ratings
    WHERE rating BETWEEN 1 AND 5
    GROUP BY rating
    ORDER BY rating
""").fetchdf()

print("\n5. Valid rating distribution")
print(distribution.to_string(index=False))

con.close()
