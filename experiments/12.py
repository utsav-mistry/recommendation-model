
import duckdb
import numpy as np
import pandas as pd

from scipy.sparse import csr_matrix

# ==========================================
# CONFIGURATION
# ==========================================

DB_PATH = "../amazon_full.duckdb"
CATEGORY = "Electronics"

EVALUATION_USERS = 10000
TOP_K = 10
RANDOM_SEED = 42

# ==========================================
# 1. LOAD AND SPLIT DATA
# ==========================================

print("\n========== LOADING DATA ==========\n")

con = duckdb.connect(DB_PATH, read_only=True)

cutoff = con.execute("""
    SELECT quantile_cont(CAST(timestamp AS DOUBLE), 0.8)
    FROM ratings
    WHERE category = ?
      AND rating BETWEEN 1 AND 5
      AND timestamp IS NOT NULL
""", [CATEGORY]).fetchone()[0]

df = con.execute("""
    SELECT
        user_id,
        parent_asin,
        CAST(timestamp AS DOUBLE) AS timestamp
    FROM ratings
    WHERE category = ?
      AND rating BETWEEN 4 AND 5
      AND timestamp IS NOT NULL
""", [CATEGORY]).fetchdf()

con.close()

train = df[df.timestamp <= cutoff].copy()
test = df[df.timestamp > cutoff].copy()

del df

print("Cutoff:", cutoff)
print("Training positives:", len(train))
print("Test positives:", len(test))

# ==========================================
# 2. BUILD TRAINING USER-ITEM MATRIX
# ==========================================

print("\n========== BUILDING TRAINING MATRIX ==========\n")

user_codes, user_ids = pd.factorize(train.user_id)

item_ids = train.parent_asin.drop_duplicates().to_numpy()

user_mapping = {
    user: index
    for index, user in enumerate(user_ids)
}

item_mapping = {
    asin: index
    for index, asin in enumerate(item_ids)
}

item_codes = train.parent_asin.map(
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

# Positive rating count per product
popularity = np.bincount(
    item_codes,
    minlength=num_items
)

# Most popular products first
popularity_order = np.argsort(popularity)[::-1]

del train

print("Training users:", num_users)
print("Training products:", num_items)

# ==========================================
# 3. PREPARE TEST RELEVANCE
# ==========================================

print("\n========== PREPARING TEST DATA ==========\n")

train_users = set(user_ids)
train_items = set(item_ids)

unseen_user = ~test.user_id.isin(train_users)
unseen_item = ~test.parent_asin.isin(train_items)

print("Test interactions:", len(test))
print("Unseen-user interactions:", int(unseen_user.sum()))
print("Unseen-product interactions:", int(unseen_item.sum()))

print(
    "Both unseen:",
    int((unseen_user & unseen_item).sum())
)

print(
    "Excluded interactions (union):",
    int((unseen_user | unseen_item).sum())
)

test_known = test[
    ~unseen_user & ~unseen_item
].copy()

test_known["user_idx"] = test_known.user_id.map(
    user_mapping
)

test_known["item_idx"] = test_known.parent_asin.map(
    item_mapping
)

relevant = (
    test_known.groupby("user_idx")["item_idx"]
    .apply(lambda x: set(x.astype(int)))
    .to_dict()
)

del test
del test_known

eligible_users = np.array(
    list(relevant.keys()),
    dtype=np.int32
)

rng = np.random.default_rng(RANDOM_SEED)

sample_size = min(
    EVALUATION_USERS,
    len(eligible_users)
)

sample_users = rng.choice(
    eligible_users,
    size=sample_size,
    replace=False
)

print("Eligible users:", len(eligible_users))
print("Evaluation users:", sample_size)

# ==========================================
# 4. POPULARITY CONCENTRATION DIAGNOSTIC
# ==========================================

print("\n========== POPULARITY CONCENTRATION ==========\n")

print("Top 20 training products:")

for rank, idx in enumerate(popularity_order[:20], 1):

    print(
        rank,
        item_ids[idx],
        "positive ratings:",
        popularity[idx]
    )

top_15 = set(
    popularity_order[:15].tolist()
)

seen_top_counts = []

for user_idx in sample_users:

    start = user_item.indptr[user_idx]
    end = user_item.indptr[user_idx + 1]

    seen = set(
        user_item.indices[start:end].tolist()
    )

    seen_top_counts.append(
        len(seen.intersection(top_15))
    )

print("\nHow many of the top 15 products users have already rated:")

for count in range(16):

    users = sum(
        x == count
        for x in seen_top_counts
    )

    if users:
        print(f"{count} products seen: {users} users")

print(
    "\nAverage top-15 products already seen:",
    round(float(np.mean(seen_top_counts)), 2)
)

# ==========================================
# 5. GENERATE POPULARITY RECOMMENDATIONS
# ==========================================

print("\n========== GENERATING RECOMMENDATIONS ==========\n")

recommended_items = set()

precision_values = []
recall_values = []
ndcg_values = []

for user_idx in sample_users:

    start = user_item.indptr[user_idx]
    end = user_item.indptr[user_idx + 1]

    seen_items = set(
        user_item.indices[start:end].tolist()
    )

    recommendations = []

    # Select popular products not already rated
    for item_idx in popularity_order:

        if item_idx not in seen_items:
            recommendations.append(int(item_idx))

        if len(recommendations) == TOP_K:
            break

    actual = relevant[int(user_idx)]

    hits = [
        item in actual
        for item in recommendations
    ]

    hit_count = sum(hits)

    precision_values.append(
        hit_count / TOP_K
    )

    recall_values.append(
        hit_count / len(actual)
    )

    # Calculate NDCG
    dcg = sum(
        1.0 / np.log2(rank + 2)
        for rank, hit in enumerate(hits)
        if hit
    )

    ideal_hits = min(
        len(actual),
        TOP_K
    )

    idcg = sum(
        1.0 / np.log2(rank + 2)
        for rank in range(ideal_hits)
    )

    ndcg_values.append(
        dcg / idcg if idcg > 0 else 0.0
    )

    recommended_items.update(recommendations)

# ==========================================
# 6. EVALUATION RESULTS
# ==========================================

print("\n========== POPULARITY BASELINE RESULTS ==========\n")

print("Evaluation users:", sample_size)

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

print("\nPopularity baseline completed.")
