# Amazon Recommendation System

React is the frontend. FastAPI is the only runtime backend required by the
current application flow.

## FastAPI service

The service uses two separate databases:

- DuckDB: read-only Amazon catalogue and recommendation data.
- SQLite: writable application data such as user accounts.

From the repository root, create a Python environment and install the pinned
requirements:

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
```

Start FastAPI from the repository root:

```powershell
Set-Location "D:\Codebase\Recommendation Model"
python -m backend
```

The service listens on `http://localhost:8000`.
If using Uvicorn directly, run this from the repository root:

```powershell
Set-Location "D:\Codebase\Recommendation Model"
uvicorn backend.main:app --host 0.0.0.0 --port 8000
```

## Configuration

The defaults resolve relative to the repository root:

```text
RECOMMENDATION_DB_PATH=amazon_full.duckdb
APPLICATION_SQLITE_PATH=application.sqlite3
RECOMMENDATION_RANKINGS_PATH=experiments/global_rankings_clean.parquet
RECOMMENDATION_GRAPH_PATH=experiments/electronics_train_item_neighbors.npz
RECOMMENDATION_ITEM_IDS_PATH=experiments/electronics_train_item_ids.npy
AUTH_TOKEN_SECRET=change-this-in-production
```

Set these variables when the files are stored elsewhere. Relative paths are
resolved from the repository root. `amazon_full.duckdb` is opened read-only;
`application.sqlite3` is created and updated by FastAPI.

Health checks:

- `GET /health` reports the status of both database dependencies.
- `GET /readiness` returns `ready` only when both SQLite and DuckDB are
  accessible.

The FastAPI application boundary is `backend/`. The
`recommendation_service/` package contains only catalogue and recommendation
engine logic consumed by that application. The React frontend uses
`VITE_FASTAPI_API_URL`, defaulting to
`http://localhost:8000`. Spring Boot source remains in the repository for
future integration but is not required to run the current application.

Authenticated application endpoints include `/api/wishlist`, `/api/cart`,
`/api/events`, `/api/orders`, and `/api/orders/checkout`. Checkout is a
simulated transaction: it calculates totals from DuckDB prices, stores order
records in SQLite, and clears the cart only after a successful order.
