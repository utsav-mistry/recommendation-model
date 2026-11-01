
import duckdb
import numpy as np
from scipy.sparse import load_npz

# --------------------------------------------------
# CONFIGURATION
# --------------------------------------------------

DB_PATH = "../amazon_full.duckdb"

GRAPH_PATH = "electronics_train_item_neighbors.npz"
ITEM_IDS_PATH = "electronics_train_item_ids.npy"

# Two related MacBook products for a clearer demonstration
INPUT_PRODUCTS = [
    "B07H3V1YQ6",  # MacBook keyboard cover
    "B07TZQCCTS",  # MacBook protective case
]

TOP_N = 10

# --------------------------------------------------
# LOAD RECOMMENDATION GRAPH
# --------------------------------------------------

neighbors = load_npz(GRAPH_PATH).tocsr()
item_ids = np.load(ITEM_IDS_PATH, allow_pickle=True)

item_to_idx = {
    str(asin): idx
    for idx, asin in enumerate(item_ids)
}

input_set = set(INPUT_PRODUCTS)

for asin in INPUT_PRODUCTS:
    if asin not in item_to_idx:
        raise ValueError(f"Product not found in graph: {asin}")

# --------------------------------------------------
# COLLECT AND MERGE RECOMMENDATIONS
# --------------------------------------------------

contributions = {}

for source_asin in INPUT_PRODUCTS:

    row = neighbors.getrow(item_to_idx[source_asin])

    for candidate_idx, similarity in zip(row.indices, row.data):

        candidate = str(item_ids[candidate_idx])

        # Exclude products already supplied as input
        if candidate in input_set:
            continue

        contributions.setdefault(candidate, {})
        contributions[candidate][source_asin] = float(similarity)

# --------------------------------------------------
# RANK USING SUM
# --------------------------------------------------

rankings = []

for candidate, source_scores in contributions.items():

    combined_score = sum(source_scores.values())

    rankings.append((
        candidate,
        combined_score,
        source_scores
    ))

rankings.sort(key=lambda x: (-x[1], x[0]))

# --------------------------------------------------
# FETCH PRODUCT DETAILS
# --------------------------------------------------

all_ids = INPUT_PRODUCTS + list(contributions.keys())

placeholders = ",".join(["?"] * len(all_ids))

con = duckdb.connect(DB_PATH, read_only=True)

rows = con.execute(
    f"""
    SELECT parent_asin, title, main_category
    FROM products
    WHERE parent_asin IN ({placeholders})
    """,
    all_ids
).fetchall()

con.close()

metadata = {
    str(asin): {
        "title": title or "Unknown product",
        "category": category or "Unknown"
    }
    for asin, title, category in rows
}

def short_title(asin, limit=90):
    title = metadata.get(asin, {}).get("title", "Unknown product")
    return title if len(title) <= limit else title[:limit - 3] + "..."


# --------------------------------------------------
# DISPLAY E-COMMERCE STYLE RECOMMENDATIONS
# --------------------------------------------------

print("\n" + "=" * 55)
print("                 ADDED TO CART")
print("=" * 55)

for asin in INPUT_PRODUCTS:
    print(f"\n  {short_title(asin)}")

print("\n" + "=" * 55)
print("              YOU MAY ALSO LIKE")
print("=" * 55)

for rank, (asin, score, source_scores) in enumerate(
    rankings[:TOP_N], 1
):
    print(f"\n  {rank}. {short_title(asin, 100)}")

print("\n" + "=" * 55)
print("           RECOMMENDATIONS READY")
print("=" * 55)


# --------------------------------------------------
# FINAL SUMMARY
# --------------------------------------------------

print("\n" + "=" * 75)
print("RECOMMENDATION SUMMARY")
print("=" * 75)

print(f"Input products processed : {len(INPUT_PRODUCTS)}")
print(f"Unique candidates found  : {len(contributions)}")
print(f"Recommendations displayed: {min(TOP_N, len(rankings))}")
print("Duplicate recommendations: Merged")
print("Input products excluded  : Yes")

print("\nRecommendation generation completed successfully.")
print("=" * 75)
