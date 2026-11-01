
import duckdb
import numpy as np
from scipy.sparse import load_npz

DB_PATH = "../amazon_full.duckdb"

GRAPH_PATH = "electronics_item_neighbors.npz"
IDS_PATH = "electronics_item_ids.npy"

con = duckdb.connect(DB_PATH, read_only=True)

neighbors = load_npz(GRAPH_PATH).tocsr()
item_ids = np.load(IDS_PATH, allow_pickle=True)

# Positive-rater count for each product
df = con.execute("""
    SELECT parent_asin, COUNT(*) AS positive_users
    FROM ratings
    WHERE category = 'Electronics'
      AND rating >= 4
      AND rating <= 5
    GROUP BY parent_asin
""").fetchdf()

con.close()

counts = dict(zip(df["parent_asin"], df["positive_users"]))

item_counts = np.array([
    counts.get(str(asin), 0) for asin in item_ids
])

# Examine each stored similarity link
shared_users = []
valid_links = []

for source in range(neighbors.shape[0]):
    row = neighbors.getrow(source)

    for target, similarity in zip(row.indices, row.data):
        overlap = (
            similarity
            * np.sqrt(item_counts[source] * item_counts[target])
        )

        shared_users.append(round(overlap))
        valid_links.append((source, target))

shared_users = np.array(shared_users)

print("\n========== SUPPORT THRESHOLD ANALYSIS ==========\n")
print("Total similarity links:", len(shared_users))

for threshold in [1, 3, 5, 10, 20]:
    retained = shared_users >= threshold

    print(f"\nMinimum shared users: {threshold}")
    print("Retained links:", int(retained.sum()))
    print("Removed links:", int((~retained).sum()))
    print("Retention:", f"{retained.mean() * 100:.2f}%")

print("\n========== PRODUCT COVERAGE ==========\n")

for threshold in [1, 3, 5, 10, 20]:
    covered = set()

    for (source, target), overlap in zip(valid_links, shared_users):
        if overlap >= threshold:
            covered.add(source)

    print(
        f"Threshold {threshold}: "
        f"{len(covered)}/{neighbors.shape[0]} products "
        f"have at least one retained neighbor"
    )
