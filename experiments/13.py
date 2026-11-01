
from pathlib import Path

import duckdb
import numpy as np
import pandas as pd
from scipy.sparse import load_npz

# --------------------------------------------------
# CONFIGURATION
# --------------------------------------------------

DB_PATH = "../amazon_full.duckdb"

GRAPH_PATH = "electronics_train_item_neighbors.npz"
ITEM_IDS_PATH = "electronics_train_item_ids.npy"

GLOBAL_RANKINGS_PATH = "global_rankings_clean.parquet"

SOURCE_ASIN = "B07H3V1YQ6"
RECOMMENDATION_LIMIT = 10
GLOBAL_LIMIT = 20
CATEGORY_LIMIT = 5


# --------------------------------------------------
# LOAD FILES
# --------------------------------------------------

neighbors = load_npz(GRAPH_PATH).tocsr()
item_ids = np.load(ITEM_IDS_PATH, allow_pickle=True).astype(str)

assert neighbors.shape == (len(item_ids), len(item_ids))

item_to_index = {
    asin: index
    for index, asin in enumerate(item_ids)
}

con = duckdb.connect(DB_PATH, read_only=True)


# --------------------------------------------------
# PRODUCT METADATA
# --------------------------------------------------

def get_products(asins):

    asins = list(dict.fromkeys(asins))

    if not asins:
        return pd.DataFrame(
            columns=["parent_asin", "title", "main_category"]
        )

    placeholders = ",".join(["?"] * len(asins))

    query = f"""
        SELECT parent_asin, title, main_category
        FROM products
        WHERE parent_asin IN ({placeholders})
    """

    return con.execute(query, asins).df()


# --------------------------------------------------
# PRODUCT-TO-PRODUCT RECOMMENDATIONS
# --------------------------------------------------

def recommend(product_asin, limit=10):

    if product_asin not in item_to_index:
        print(f"Product not found in similarity graph: {product_asin}")
        return

    source_index = item_to_index[product_asin]

    row = neighbors.getrow(source_index)

    candidates = [
        (item_ids[index], float(score))
        for index, score in zip(row.indices, row.data)
        if item_ids[index] != product_asin
    ]

    candidates.sort(key=lambda x: x[1], reverse=True)
    candidates = candidates[:limit]

    metadata = get_products(
        [asin for asin, score in candidates]
    )

    metadata = metadata.set_index("parent_asin")

    source = get_products([product_asin])

    print("\n" + "=" * 90)
    print("PRODUCT-TO-PRODUCT RECOMMENDATIONS")
    print("=" * 90)

    if not source.empty:
        print("\nSOURCE PRODUCT:")
        print(source.iloc[0]["title"])

    print("\nRECOMMENDED PRODUCTS:\n")

    for rank, (asin, score) in enumerate(candidates, 1):

        if asin in metadata.index:
            product = metadata.loc[asin]
            title = product["title"]
            category = product["main_category"]
        else:
            title = "Title unavailable"
            category = "Unknown"

        print(f"{rank}. {title}")
        print(f"   ASIN: {asin}")
        print(f"   Category: {category}")
        print(f"   Similarity: {score:.6f}\n")


# --------------------------------------------------
# GLOBAL AND CATEGORY-WISE TOP PRODUCTS
# --------------------------------------------------

def show_global_tops():

    description = con.execute(
        """
        DESCRIBE
        SELECT * FROM read_parquet(?)
        """,
        [GLOBAL_RANKINGS_PATH]
    ).df()

    columns = description["column_name"].tolist()

    def find_column(possible_names):

        for name in possible_names:
            if name in columns:
                return name

        raise ValueError(
            f"Required column missing. Available columns: {columns}"
        )

    asin_col = find_column(["parent_asin", "asin"])
    title_col = find_column(["title"])
    category_col = find_column(["main_category", "category"])
    score_col = find_column(["bayesian_score"])

    query = f"""
        SELECT
            "{asin_col}" AS asin,
            "{title_col}" AS title,
            "{category_col}" AS category,
            "{score_col}" AS score
        FROM read_parquet(?)
    """

    print("\n" + "=" * 90)
    print("GLOBAL TOP PRODUCTS")
    print("=" * 90)

    global_top = con.execute(
        query + """
        ORDER BY score DESC
        LIMIT ?
        """,
        [GLOBAL_RANKINGS_PATH, GLOBAL_LIMIT]
    ).df()

    print(global_top.to_string(index=False))

    print("\n" + "=" * 90)
    print(f"TOP {CATEGORY_LIMIT} PRODUCTS PER CATEGORY")
    print("=" * 90)

    category_top = con.execute(
        query + """
        QUALIFY ROW_NUMBER() OVER (
            PARTITION BY category
            ORDER BY score DESC
        ) <= ?
        ORDER BY category, score DESC
        """,
        [GLOBAL_RANKINGS_PATH, CATEGORY_LIMIT]
    ).df()

    for category, group in category_top.groupby("category"):

        print(f"\n{category}")
        print(
            group[
                ["asin", "title", "score"]
            ].to_string(index=False)
        )


# --------------------------------------------------
# RUN EXPERIMENTS
# --------------------------------------------------

recommend(
    SOURCE_ASIN,
    RECOMMENDATION_LIMIT
)

show_global_tops()

con.close()
