
import duckdb
import numpy as np

from scipy.sparse import csr_matrix, save_npz
from sklearn.preprocessing import normalize

DB_PATH = "../amazon_full.duckdb"
CATEGORY = "Electronics"

TOP_K = 20
CHUNK_SIZE = 256

# 1. Load positive interactions
con = duckdb.connect(DB_PATH, read_only=True)

df = con.execute("""
    SELECT user_id, parent_asin, rating
    FROM ratings
    WHERE category = ?
      AND rating >= 4
      AND rating <= 5
""", [CATEGORY]).fetchdf()

con.close()

print("Positive interactions:", len(df))

# 2. Create mappings
user_codes, users = df["user_id"].factorize()
item_codes, items = df["parent_asin"].factorize()

num_users = len(users)
num_items = len(items)

# 3. Build user-item matrix
user_item = csr_matrix(
    (
        np.ones(len(df), dtype=np.float32),
        (user_codes, item_codes)
    ),
    shape=(num_users, num_items)
)

# 4. Transpose: each row now represents a product
item_user = user_item.T.tocsr()

# 5. Normalize each product vector
item_user = normalize(item_user, norm="l2", axis=1)

print("Item-user matrix:", item_user.shape)
print("Starting chunked similarity calculation...")

# 6. Calculate top-K neighbors without storing a dense matrix
neighbor_rows = []
neighbor_cols = []
neighbor_values = []

for start in range(0, num_items, CHUNK_SIZE):
    end = min(start + CHUNK_SIZE, num_items)

    block = item_user[start:end] @ item_user.T

    for local_row in range(end - start):
        item_index = start + local_row

        row = block.getrow(local_row)

        indices = row.indices
        scores = row.data

        # Exclude the product itself and zero similarities
        valid = (indices != item_index) & (scores > 0)

        indices = indices[valid]
        scores = scores[valid]

        if len(scores) == 0:
            continue

        # Keep only the strongest TOP_K neighbors
        k = min(TOP_K, len(scores))

        if len(scores) > k:
            selected = np.argpartition(scores, -k)[-k:]
            indices = indices[selected]
            scores = scores[selected]

        # Sort strongest first
        order = np.argsort(scores)[::-1]

        indices = indices[order]
        scores = scores[order]

        neighbor_rows.extend([item_index] * len(indices))
        neighbor_cols.extend(indices.tolist())
        neighbor_values.extend(scores.tolist())

    if (start // CHUNK_SIZE + 1) % 20 == 0:
        print(f"Processed {end}/{num_items} products")

# 7. Save compact similarity graph
neighbors = csr_matrix(
    (
        np.array(neighbor_values, dtype=np.float32),
        (
            np.array(neighbor_rows, dtype=np.int32),
            np.array(neighbor_cols, dtype=np.int32)
        )
    ),
    shape=(num_items, num_items)
)

save_npz("electronics_item_neighbors.npz", neighbors)
np.save("electronics_item_ids.npy", np.array(items))

print("\n========== RESULTS ==========")
print("Products:", num_items)
print("Similarity links:", neighbors.nnz)
print("Maximum links per product:", TOP_K)
print("Saved: electronics_item_neighbors.npz")
print("Saved: electronics_item_ids.npy")

# 8. Display neighbors for one sample product
sample_index = 0
sample_row = neighbors.getrow(sample_index)

order = np.argsort(sample_row.data)[::-1]

print("\nSample product:", items[sample_index])
print("Its most similar products:")

for position in order[:10]:
    neighbor_index = sample_row.indices[position]
    similarity = sample_row.data[position]

    print(
        items[neighbor_index],
        "Similarity:",
        round(float(similarity), 4)
    )
