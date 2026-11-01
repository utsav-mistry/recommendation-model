
import duckdb

DB_PATH = "../amazon_full.duckdb"

con = duckdb.connect(DB_PATH, read_only=True)

print("\n========== TABLE COUNTS ==========")

for table in ["ratings", "products", "categories"]:
    count = con.execute(
        f"SELECT COUNT(*) FROM {table}"
    ).fetchone()[0]

    print(f"{table}: {count:,}")

print("\n========== UNIQUE USERS AND PRODUCTS ==========")

print(con.execute("""
    SELECT
        COUNT(DISTINCT user_id) AS unique_users,
        COUNT(DISTINCT parent_asin) AS unique_products,
        COUNT(*) AS total_ratings
    FROM ratings
""").df())

print("\n========== RATING DISTRIBUTION ==========")

print(con.execute("""
    SELECT rating, COUNT(*) AS total
    FROM ratings
    GROUP BY rating
    ORDER BY rating
""").df())

print("\n========== CATEGORY DISTRIBUTION ==========")

print(con.execute("""
    SELECT category, COUNT(*) AS total_ratings
    FROM ratings
    GROUP BY category
    ORDER BY total_ratings DESC
""").df())

print("\n========== INTERACTIONS PER USER ==========")

print(con.execute("""
    SELECT
        COUNT(*) AS total_users,
        AVG(interactions) AS avg_interactions,
        MEDIAN(interactions) AS median_interactions
    FROM (
        SELECT user_id, COUNT(*) AS interactions
        FROM ratings
        GROUP BY user_id
    )
""").df())

print("\n========== PRODUCTS PER CATEGORY ==========")

print(con.execute("""
    SELECT
        source_category,
        COUNT(*) AS products
    FROM products
    GROUP BY source_category
    ORDER BY products DESC
""").df())

con.close()
