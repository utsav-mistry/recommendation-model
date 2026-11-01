
import duckdb
import numpy as np
from scipy.sparse import load_npz

DB_PATH = "../amazon_full.duckdb"

GRAPH_PATH = "electronics_item_neighbors.npz"
IDS_PATH = "electronics_item_ids.npy"

SOURCE_ASIN = "B07H3V1YQ6"

# Load similarity graph and item mapping
neighbors = load_npz(GRAPH_PATH).tocsr()
item_ids = np.load(IDS_PATH, allow_pickle=True)

source_index = np.where(item_ids == SOURCE_ASIN)[0][0]

# Get top 10 recommendations
row = neighbors.getrow(source_index)
order = np.argsort(row.data)[::-1][:10]

recommended = [
    (int(row.indices[i]), float(row.data[i]))
    for i in order
]

# Connect to database
con = duckdb.connect(DB_PATH, read_only=True)

# Get positive interaction counts
df = con.execute("""
    SELECT
        parent_asin,
        COUNT(*) AS positive_users
    FROM ratings
    WHERE category = 'Electronics'
      AND rating >= 4
      AND rating <= 5
    GROUP BY parent_asin
""").fetchdf()

positive_counts = dict(
    zip(df["parent_asin"], df["positive_users"])
)

# Retrieve product titles
asins = [SOURCE_ASIN] + [
    str(item_ids[index]) for index, _ in recommended
]

placeholders = ",".join(["?"] * len(asins))

products = con.execute(f"""
    SELECT parent_asin, title
    FROM products
    WHERE parent_asin IN ({placeholders})
""", asins).fetchdf()

con.close()

titles = dict(zip(products["parent_asin"], products["title"]))

source_users = positive_counts.get(SOURCE_ASIN, 0)

print("\n========== SIMILARITY DIAGNOSTICS ==========")

print("\nSource:", SOURCE_ASIN)
print("Title:", titles.get(SOURCE_ASIN))
print("Positive users:", source_users)

for rank, (index, similarity) in enumerate(recommended, start=1):

    asin = str(item_ids[index])
    target_users = positive_counts.get(asin, 0)

    # Cosine similarity = intersection / sqrt(A_count * B_count)
    estimated_overlap = (
        similarity * np.sqrt(source_users * target_users)
    )

    print(f"\nRank: {rank}")
    print("ASIN:", asin)
    print("Title:", titles.get(asin))
    print("Cosine similarity:", round(similarity, 4))
    print("Source positive users:", source_users)
    print("Target positive users:", target_users)
    print("Estimated shared users:", round(estimated_overlap))
