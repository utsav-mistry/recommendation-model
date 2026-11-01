
import duckdb
import numpy as np
import pandas as pd

from scipy.sparse import csr_matrix, save_npz
from sklearn.preprocessing import normalize

# ==========================================
# CONFIGURATION
# ==========================================

DB_PATH = "../amazon_full.duckdb"
CATEGORY = "Electronics"

TOP_K_NEIGHBORS = 100
TOP_K_RECOMMENDATIONS = 10
EVALUATION_USERS = 10000
CHUNK_SIZE = 256
RANDOM_SEED = 42

GRAPH_PATH = "electronics_train_item_neighbors.npz"
IDS_PATH = "electronics_train_item_ids.npy"

# ==========================================
# 1. CHRONOLOGICAL SPLIT
# ==========================================

print("\n========== TEMPORAL DATA SPLIT ==========\n")

con = duckdb.connect(DB_PATH, read_only=True)

cutoff = con.execute("""
    SELECT quantile_cont(CAST(timestamp AS DOUBLE), 0.8)
    FROM ratings
    WHERE category = ?
      AND rating BETWEEN 1 AND 5
      AND timestamp IS NOT NULL
""", [CATEGORY]).fetchone()[0]

print("80th percentile timestamp:", cutoff)

# Load positive interactions only
df = con.execute("""
    SELECT
        user_id,
        parent_asin,
        CAST(timestamp AS DOUBLE) AS timestamp
    FROM ratings
    WHERE category = ?
      AND rating >= 4
      AND rating <= 5
      AND timestamp IS NOT NULL
""", [CATEGORY]).fetchdf()

con.close()

train = df[df["timestamp"] <= cutoff].copy()
test = df[df["timestamp"] > cutoff].copy()

del df

print("Training positive interactions:", len(train))
print("Testing positive interactions:", len(test))

# ==========================================
# 2. BUILD TRAINING MAPPINGS
# ==========================================

print("\n========== BUILDING TRAINING MATRIX ==========\n")

user_codes, user_ids = pd.factorize(train["user_id"])

item_ids = train["parent_asin"].drop_duplicates().to_numpy()

item_mapping = {
    str(asin): index
    for index, asin in enumerate(item_ids)
}

item_codes = train["parent_asin"].map(
    item_mapping
).to_numpy(dtype=np.int32)

num_users = len(user_ids)
num_items = len(item_ids)

user_item = csr_matrix(
    (
        np.ones(len(train), dtype=np.float32),
        (user_codes, item_codes)
    ),
    shape=(num_users, num_items)
)

del train

print("Training users:", num_users)
print("Training products:", num_items)
print("Training matrix:", user_item.shape)
print("Training non-zero values:", user_item.nnz)

# Each row now represents a product
item_user = user_item.T.tocsr()

# Normalize product vectors for cosine similarity
item_user = normalize(item_user, norm="l2", axis=1)

# ==========================================
# 3. BUILD TRAINING-ONLY SIMILARITY GRAPH
# ==========================================

print("\n========== BUILDING SIMILARITY GRAPH ==========\n")

# Preallocate arrays to avoid large Python lists
capacity = num_items * TOP_K_NEIGHBORS

neighbor_rows = np.empty(capacity, dtype=np.int32)
neighbor_cols = np.empty(capacity, dtype=np.int32)
neighbor_values = np.empty(capacity, dtype=np.float32)

cursor = 0

for start in range(0, num_items, CHUNK_SIZE):

    end = min(start + CHUNK_SIZE, num_items)

    block = item_user[start:end] @ item_user.T

    for local_row in range(end - start):

        source = start + local_row

        row = block.getrow(local_row)

        indices = row.indices
        scores = row.data

        # Exclude self-similarity and zero scores
        valid = (indices != source) & (scores > 0)

        indices = indices[valid]
        scores = scores[valid]

        if len(scores) == 0:
            continue

        k = min(TOP_K_NEIGHBORS, len(scores))

        if len(scores) > k:
            selected = np.argpartition(scores, -k)[-k:]
            indices = indices[selected]
            scores = scores[selected]

        order = np.argsort(scores)[::-1]

        indices = indices[order]
        scores = scores[order]

        count = len(scores)

        neighbor_rows[cursor:cursor + count] = source
        neighbor_cols[cursor:cursor + count] = indices
        neighbor_values[cursor:cursor + count] = scores

        cursor += count

    if (start // CHUNK_SIZE + 1) % 20 == 0:
        print(f"Processed {end}/{num_items} products")

neighbors = csr_matrix(
    (
        neighbor_values[:cursor],
        (
            neighbor_rows[:cursor],
            neighbor_cols[:cursor]
        )
    ),
    shape=(num_items, num_items)
)

save_npz(GRAPH_PATH, neighbors)
np.save(IDS_PATH, item_ids)

print("Similarity links:", neighbors.nnz)
print("Saved training-only similarity graph.")

# ==========================================
# 4. PREPARE TEST INTERACTIONS
# ==========================================

print("\n========== PREPARING TEST DATA ==========\n")

user_mapping = {
    user: index
    for index, user in enumerate(user_ids)
}

# Keep only users and products known to training
test_known = test[
    test["user_id"].isin(user_mapping)
    & test["parent_asin"].isin(item_mapping)
].copy()

known_test_count = len(test_known)
cold_start_count = len(test) - known_test_count

test_known["user_idx"] = test_known["user_id"].map(
    user_mapping
)

test_known["item_idx"] = test_known["parent_asin"].map(
    item_mapping
)

# Relevant future products for each user
relevant = (
    test_known.groupby("user_idx")["item_idx"]
    .apply(lambda x: set(x.astype(int)))
    .to_dict()
)

del test
del test_known

eligible_users = np.array(list(relevant.keys()), dtype=np.int32)

print("Test positives known to training:", known_test_count)
print("Test positives excluded as cold-start:", cold_start_count)
print("Eligible evaluation users:", len(eligible_users))

if len(eligible_users) == 0:
    raise RuntimeError("No eligible evaluation users found.")

# Reproducible user sample
rng = np.random.default_rng(RANDOM_SEED)

sample_size = min(EVALUATION_USERS, len(eligible_users))

sample_users = rng.choice(
    eligible_users,
    size=sample_size,
    replace=False
)

print("Users selected for evaluation:", sample_size)

# ==========================================
# 5. GENERATE RECOMMENDATIONS
# ==========================================

print("\n========== GENERATING RECOMMENDATIONS ==========\n")

# User-item history multiplied by item-item neighbors
scores = user_item[sample_users] @ neighbors
scores = scores.tocsr()

recommended_items = set()

precision_values = []
recall_values = []
ndcg_values = []

users_with_recommendations = 0

for row_idx, user_idx in enumerate(sample_users):

    start = scores.indptr[row_idx]
    end = scores.indptr[row_idx + 1]

    candidate_indices = scores.indices[start:end]
    candidate_scores = scores.data[start:end]

    # Remove products already seen by the user
    history_start = user_item.indptr[user_idx]
    history_end = user_item.indptr[user_idx + 1]

    seen_items = user_item.indices[history_start:history_end]

    unseen = ~np.isin(candidate_indices, seen_items)

    candidate_indices = candidate_indices[unseen]
    candidate_scores = candidate_scores[unseen]

    if len(candidate_scores) == 0:
        precision_values.append(0.0)
        recall_values.append(0.0)
        ndcg_values.append(0.0)
        continue

    # Get top 10 candidates
    order = np.argsort(candidate_scores)[::-1]

    top_indices = candidate_indices[order][
        :TOP_K_RECOMMENDATIONS
    ]

    users_with_recommendations += 1

    recommended_items.update(top_indices.tolist())

    actual = relevant[int(user_idx)]

    hits = [
        int(item) in actual
        for item in top_indices
    ]

    hit_count = sum(hits)

    precision = hit_count / TOP_K_RECOMMENDATIONS
    recall = hit_count / len(actual)

    # Binary NDCG
    dcg = sum(
        1.0 / np.log2(rank + 2)
        for rank, hit in enumerate(hits)
        if hit
    )

    ideal_hits = min(
        len(actual),
        TOP_K_RECOMMENDATIONS
    )

    idcg = sum(
        1.0 / np.log2(rank + 2)
        for rank in range(ideal_hits)
    )

    ndcg = dcg / idcg if idcg > 0 else 0.0

    precision_values.append(precision)
    recall_values.append(recall)
    ndcg_values.append(ndcg)

# ==========================================
# 6. EVALUATION RESULTS
# ==========================================

print("\n========== EVALUATION RESULTS ==========\n")

print("Evaluation users:", sample_size)

print(
    "Users receiving recommendations:",
    users_with_recommendations
)

print(
    "User recommendation coverage:",
    f"{users_with_recommendations / sample_size:.4%}"
)

print(
    "Precision@10:",
    round(float(np.mean(precision_values)), 6)
)

print(
    "Recall@10:",
    round(float(np.mean(recall_values)), 6)
)

print(
    "NDCG@10:",
    round(float(np.mean(ndcg_values)), 6)
)

print(
    "Catalog coverage:",
    f"{len(recommended_items) / num_items:.4%}"
)

print(
    "Unique recommended products:",
    len(recommended_items)
)

print("\nTemporal evaluation completed.")
