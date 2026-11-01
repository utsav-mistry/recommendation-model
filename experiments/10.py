
import duckdb
import numpy as np
import pandas as pd

from scipy.sparse import csr_matrix, load_npz, save_npz

# Configuration
DB_PATH = "../amazon_full.duckdb"
GRAPH_PATH = "electronics_item_neighbors.npz"
IDS_PATH = "electronics_item_ids.npy"

OUTPUT_PATH = "electronics_confidence_neighbors.npz"

SOURCE_ASIN = "B07H3V1YQ6"
TOP_K = 20

# Test two confidence strengths
LAMBDAS = [5, 10]

print("\n========== LOADING DATA ==========\n")

# Load existing similarity graph
similarity_graph = load_npz(GRAPH_PATH).tocsr()
item_ids = np.load(IDS_PATH, allow_pickle=True)

num_items = len(item_ids)

# Load positive interactions
con = duckdb.connect(DB_PATH, read_only=True)

df = con.execute("""
    SELECT user_id, parent_asin
    FROM ratings
    WHERE category = 'Electronics'
      AND rating >= 4
      AND rating <= 5
""").fetchdf()

con.close()

print("Positive interactions:", len(df))
print("Products:", num_items)

# Create mappings in the same order as the original graph
user_codes, users = df["user_id"].factorize()

item_mapping = {
    str(asin): index
    for index, asin in enumerate(item_ids)
}

item_codes = df["parent_asin"].map(
    item_mapping
).to_numpy(dtype=np.int32)

# Build item-user matrix
item_user = csr_matrix(
    (
        np.ones(len(df), dtype=np.int32),
        (item_codes, user_codes)
    ),
    shape=(num_items, len(users)),
    dtype=np.int32
)

# Number of positive users per product
item_counts = np.asarray(
    item_user.sum(axis=1)
).ravel()

print("\nItem-user matrix:", item_user.shape)

# Prepare output graphs
adjusted_graphs = {
    lam: {
        "rows": [],
        "cols": [],
        "scores": []
    }
    for lam in LAMBDAS
}

# Source product index
matches = np.where(item_ids == SOURCE_ASIN)[0]

if len(matches) == 0:
    raise ValueError("Source product not found.")

source_index = int(matches[0])

source_results = []

print("\n========== EXACT OVERLAP CALCULATION ==========\n")

# Process existing similarity links
for source in range(num_items):

    row = similarity_graph.getrow(source)

    if row.nnz == 0:
        continue

    targets = row.indices

    # Exact intersection of positive-rater sets
    overlaps = np.asarray(
        item_user[targets].multiply(
            item_user[source]
        ).sum(axis=1)
    ).ravel()

    similarities = row.data

    # Calculate adjusted scores
    for lam in LAMBDAS:

        adjusted = (
            similarities * overlaps / (overlaps + lam)
        )

        output = adjusted_graphs[lam]

        output["rows"].extend([source] * len(targets))
        output["cols"].extend(targets.tolist())
        output["scores"].extend(adjusted.tolist())

    # Keep source product details for comparison
    if source == source_index:

        for target, similarity, overlap in zip(
            targets, similarities, overlaps
        ):
            source_results.append({
                "asin": str(item_ids[target]),
                "cosine": float(similarity),
                "shared_users": int(overlap),
                "target_users": int(item_counts[target])
            })

# Save adjusted graphs
for lam in LAMBDAS:

    data = adjusted_graphs[lam]

    graph = csr_matrix(
        (
            np.asarray(data["scores"], dtype=np.float32),
            (data["rows"], data["cols"])
        ),
        shape=(num_items, num_items)
    )

    save_npz(
        f"electronics_confidence_lambda_{lam}.npz",
        graph
    )

    print(
        f"Saved lambda={lam}: "
        f"{graph.nnz} links"
    )

# Compare original and adjusted recommendations
results = pd.DataFrame(source_results)

results["adjusted_5"] = (
    results["cosine"]
    * results["shared_users"]
    / (results["shared_users"] + 5)
)

results["adjusted_10"] = (
    results["cosine"]
    * results["shared_users"]
    / (results["shared_users"] + 10)
)

# Retrieve product titles
all_asins = [SOURCE_ASIN] + results["asin"].tolist()

con = duckdb.connect(DB_PATH, read_only=True)

placeholders = ",".join(["?"] * len(all_asins))

products = con.execute(f"""
    SELECT parent_asin, title
    FROM products
    WHERE parent_asin IN ({placeholders})
""", all_asins).fetchdf()

con.close()

title_map = dict(
    zip(products["parent_asin"], products["title"])
)

results["title"] = results["asin"].map(title_map)

print("\n========== SOURCE PRODUCT ==========\n")
print(title_map.get(SOURCE_ASIN))

columns = [
    "asin",
    "title",
    "cosine",
    "shared_users",
    "target_users",
    "adjusted_5",
    "adjusted_10"
]

print("\n========== ORIGINAL COSINE RANKING ==========\n")

print(
    results.sort_values("cosine", ascending=False)
    [columns]
    .head(10)
    .to_string(index=False)
)

for lam in LAMBDAS:

    column = f"adjusted_{lam}"

    print(
        f"\n========== CONFIDENCE RANKING "
        f"(LAMBDA={lam}) ==========\n"
    )

    print(
        results.sort_values(column, ascending=False)
        [columns]
        .head(10)
        .to_string(index=False)
    )

print("\nExperiment completed successfully.")
