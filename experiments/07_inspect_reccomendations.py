
import duckdb
import numpy as np
from scipy.sparse import load_npz

DB_PATH = "../amazon_full.duckdb"

GRAPH_PATH = "electronics_item_neighbors.npz"
IDS_PATH = "electronics_item_ids.npy"

# 1. Load saved similarity graph
neighbors = load_npz(GRAPH_PATH).tocsr()
item_ids = np.load(IDS_PATH, allow_pickle=True)

# 2. Select the sample product
sample_asin = "B07H3V1YQ6"

matches = np.where(item_ids == sample_asin)[0]

if len(matches) == 0:
    raise ValueError("Sample product not found in item IDs.")

sample_index = int(matches[0])

# 3. Get its neighbors
row = neighbors.getrow(sample_index)

order = np.argsort(row.data)[::-1][:10]

recommended = [
    (str(item_ids[row.indices[i]]), float(row.data[i]))
    for i in order
]

asins = [sample_asin] + [asin for asin, _ in recommended]

# 4. Retrieve product metadata
con = duckdb.connect(DB_PATH, read_only=True)

placeholders = ",".join(["?"] * len(asins))

products = con.execute(f"""
    SELECT
        parent_asin,
        title,
        main_category,
        average_rating,
        rating_number,
        price
    FROM products
    WHERE parent_asin IN ({placeholders})
""", asins).fetchdf()

con.close()

product_map = {
    row["parent_asin"]: row
    for _, row in products.iterrows()
}

# 5. Display source product
print("\n========== SOURCE PRODUCT ==========\n")

source = product_map.get(sample_asin)

if source is not None:
    print("ASIN:", sample_asin)
    print("Title:", source["title"])
    print("Category:", source["main_category"])
    print("Average rating:", source["average_rating"])
else:
    print("Source product metadata not found.")

# 6. Display recommendations
print("\n========== TOP 10 SIMILAR PRODUCTS ==========\n")

for rank, (asin, score) in enumerate(recommended, start=1):

    product = product_map.get(asin)

    print(f"\nRank: {rank}")
    print("ASIN:", asin)
    print("Similarity:", round(score, 4))

    if product is None:
        print("Product metadata not found.")
        continue

    print("Title:", product["title"])
    print("Category:", product["main_category"])
    print("Average rating:", product["average_rating"])
    print("Rating count:", product["rating_number"])
    print("Price:", product["price"])
