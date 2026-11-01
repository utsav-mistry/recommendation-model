
import duckdb
import numpy as np
from scipy.sparse import csr_matrix

DB_PATH = "../amazon_full.duckdb"
CATEGORY = "Electronics"

con = duckdb.connect(DB_PATH, read_only=True)

# Load only Electronics interactions
df = con.execute("""
    SELECT user_id, parent_asin, rating
    FROM ratings
    WHERE category = ?
      AND rating BETWEEN 1 AND 5
""", [CATEGORY]).fetchdf()

con.close()

print("\n========== ELECTRONICS DATA ==========\n")
print("Interactions:", len(df))
print("Unique users:", df["user_id"].nunique())
print("Unique products:", df["parent_asin"].nunique())

# Create integer mappings
user_codes, users = df["user_id"].factorize()
item_codes, items = df["parent_asin"].factorize()

num_users = len(users)
num_items = len(items)

# Matrix 1: Rating-weighted
rating_matrix = csr_matrix(
    (
        df["rating"].to_numpy(dtype=np.float32),
        (user_codes, item_codes)
    ),
    shape=(num_users, num_items)
)

# Matrix 2: Implicit positive (rating >= 4)
positive = df["rating"].to_numpy() >= 4

positive_matrix = csr_matrix(
    (
        np.ones(positive.sum(), dtype=np.float32),
        (user_codes[positive], item_codes[positive])
    ),
    shape=(num_users, num_items)
)

# Report matrix characteristics
def report_matrix(name, matrix):
    total_cells = matrix.shape[0] * matrix.shape[1]
    sparsity = 1 - (matrix.nnz / total_cells)

    print(f"\n{name}")
    print("Shape:", matrix.shape)
    print("Non-zero values:", matrix.nnz)
    print("Sparsity:", f"{sparsity:.6%}")
    print("Stored data memory:", f"{matrix.data.nbytes / 1024**2:.2f} MB")
    print("Total CSR memory:",
          f"{(matrix.data.nbytes + matrix.indices.nbytes + matrix.indptr.nbytes) / 1024**2:.2f} MB")

print("\n========== SPARSE MATRIX REPORT ==========")

report_matrix("1. Rating-weighted matrix", rating_matrix)
report_matrix("2. Implicit-positive matrix", positive_matrix)

# Verify both matrices
print("\n========== VALIDATION ==========")
print("Rating matrix interactions:", rating_matrix.nnz)
print("Positive interactions:", positive_matrix.nnz)
print("Expected positive interactions:", int(positive.sum()))

assert rating_matrix.nnz == len(df)
assert positive_matrix.nnz == int(positive.sum())

print("\nBoth sparse matrices created successfully.")