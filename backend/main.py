from __future__ import annotations

from contextlib import asynccontextmanager
from typing import Annotated

from fastapi import Depends, FastAPI, Header, HTTPException, Query, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field

from .config import DB_PATH, GRAPH_PATH, ITEM_IDS_PATH, RANKINGS_PATH, SQLITE_PATH
from .auth import AuthService, DuplicateEmailError
from .database import SQLiteDatabase
from .user_data import UserDataService
from .activity import ActivityService
from .orders import OrderService
from recommendation_service.service import RecommendationService


service: RecommendationService | None = None
auth_service: AuthService | None = None
sqlite_database: SQLiteDatabase | None = None
user_data_service: UserDataService | None = None
activity_service: ActivityService | None = None
order_service: OrderService | None = None


@asynccontextmanager
async def lifespan(_: FastAPI):
    global service, auth_service, sqlite_database, user_data_service, activity_service, order_service
    sqlite_database = SQLiteDatabase(SQLITE_PATH)
    auth_service = AuthService(sqlite_database)
    service = RecommendationService(
        str(DB_PATH), str(RANKINGS_PATH), str(GRAPH_PATH), str(ITEM_IDS_PATH)
    )
    user_data_service = UserDataService(sqlite_database, service)
    activity_service = ActivityService(sqlite_database)
    order_service = OrderService(sqlite_database, service)
    yield
    service = None
    auth_service = None
    sqlite_database = None
    user_data_service = None
    activity_service = None
    order_service = None


app = FastAPI(title="Amazon Recommendation Catalogue API", lifespan=lifespan)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:3001",
        "http://localhost:5173",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:3001",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(HTTPException)
async def http_exception_handler(_: Request, error: HTTPException) -> JSONResponse:
    message = error.detail if isinstance(error.detail, str) else "Request failed"
    return JSONResponse(
        status_code=error.status_code,
        content={"error": {"code": f"http_{error.status_code}", "message": message}},
    )


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(_: Request, error: RequestValidationError) -> JSONResponse:
    return JSONResponse(
        status_code=422,
        content={
            "error": {
                "code": "validation_error",
                "message": "Request validation failed",
                "fields": error.errors(),
            }
        },
    )


def get_service() -> RecommendationService:
    if service is None:
        raise HTTPException(status_code=503, detail="Recommendation service is not ready")
    return service


def get_auth_service() -> AuthService:
    if auth_service is None:
        raise HTTPException(status_code=503, detail="Authentication service is not ready")
    return auth_service


def get_user_data_service() -> UserDataService:
    if user_data_service is None:
        raise HTTPException(status_code=503, detail="User data service is not ready")
    return user_data_service


def get_activity_service() -> ActivityService:
    if activity_service is None:
        raise HTTPException(status_code=503, detail="Activity service is not ready")
    return activity_service


def get_order_service() -> OrderService:
    if order_service is None:
        raise HTTPException(status_code=503, detail="Order service is not ready")
    return order_service


class SimilarRequest(BaseModel):
    product_ids: list[str] = Field(min_length=1, max_length=50)
    limit: int = Field(default=10, ge=1, le=100)


class SignupRequest(BaseModel):
    email: str = Field(min_length=3, max_length=254)
    password: str = Field(min_length=8, max_length=128)
    name: str | None = Field(default=None, min_length=1, max_length=100)
    display_name: str | None = Field(default=None, min_length=1, max_length=100)
    age: int = Field(gt=0, le=120)


class LoginRequest(BaseModel):
    email: str = Field(min_length=3, max_length=254)
    password: str = Field(min_length=1, max_length=128)


class TokenRequest(BaseModel):
    token: str = Field(min_length=1)


class CartQuantityRequest(BaseModel):
    quantity: int = Field(gt=0)


class EventRequest(BaseModel):
    event_type: str = Field(min_length=1, max_length=40)
    parent_asin: str | None = Field(default=None, min_length=1, max_length=32)
    search_query: str | None = Field(default=None, max_length=500)
    category: str | None = Field(default=None, max_length=200)
    metadata: dict[str, str | int | float | bool] | None = None


def extract_token(
    authorization: str | None = Header(default=None),
    token: str | None = Query(default=None, min_length=1),
) -> str:
    if authorization:
        scheme, _, value = authorization.partition(" ")
        if scheme.lower() == "bearer" and value:
            return value
    if token:
        return token
    raise HTTPException(status_code=401, detail="Authentication token is required")


def current_authenticated_user(token: str) -> dict:
    try:
        return get_auth_service().verify_token(token)
    except ValueError as error:
        raise HTTPException(status_code=401, detail=str(error)) from error


def authenticated_user(token: str = Depends(extract_token)) -> dict:
    return current_authenticated_user(token)


def user_id(user: dict) -> int:
    return int(user["id"])


def user_data_error(error: ValueError) -> HTTPException:
    if str(error) == "Product not found":
        return HTTPException(status_code=404, detail=str(error))
    return HTTPException(status_code=400, detail=str(error))


@app.get("/health")
def health() -> dict:
    dependencies = {"sqlite": "ok", "duckdb": "ok"}
    try:
        if sqlite_database is None:
            raise RuntimeError("SQLite is not initialised")
        sqlite_database.check()
    except Exception:
        dependencies["sqlite"] = "error"
    try:
        get_service().connection_check()
    except Exception:
        dependencies["duckdb"] = "error"
    healthy = all(status == "ok" for status in dependencies.values())
    return {"status": "ok" if healthy else "degraded", "dependencies": dependencies}


@app.get("/readiness")
def readiness() -> dict[str, str]:
    if sqlite_database is None:
        raise HTTPException(status_code=503, detail="SQLite is not ready")
    try:
        sqlite_database.check()
        get_service().connection_check()
    except Exception as error:
        raise HTTPException(status_code=503, detail=f"Database dependency is not ready: {error}") from error
    return {"status": "ready", "sqlite": "ready", "duckdb": "ready"}


@app.post("/api/auth/signup", status_code=201)
def signup(request: SignupRequest) -> dict:
    try:
        name = request.name or request.display_name
        if not name:
            raise ValueError("Name is required")
        return get_auth_service().signup(request.email, request.password, name, request.age)
    except DuplicateEmailError as error:
        raise HTTPException(status_code=409, detail=str(error)) from error
    except ValueError as error:
        raise HTTPException(status_code=400, detail=str(error)) from error


@app.post("/api/auth/login")
def login(request: LoginRequest) -> dict:
    try:
        return get_auth_service().login(request.email, request.password)
    except ValueError as error:
        raise HTTPException(status_code=401, detail=str(error)) from error


@app.get("/api/auth/me")
def current_user(token: str = Depends(extract_token)) -> dict:
    return {"user": current_authenticated_user(token)}


@app.post("/api/auth/logout")
def logout(request: TokenRequest | None = None, authorization: str | None = Header(default=None)) -> dict[str, str]:
    token = request.token if request else None
    if not token and authorization:
        scheme, _, value = authorization.partition(" ")
        if scheme.lower() == "bearer":
            token = value
    if not token:
        raise HTTPException(status_code=401, detail="Authentication token is required")
    current_authenticated_user(token)
    get_auth_service().logout(token)
    return {"message": "Logged out successfully"}


@app.get("/api/wishlist")
def get_wishlist(user: dict = Depends(authenticated_user)) -> dict:
    return get_user_data_service().wishlist(user_id(user))


@app.post("/api/wishlist/{parent_asin}")
def add_wishlist(parent_asin: str, user: dict = Depends(authenticated_user)) -> dict:
    try:
        return get_user_data_service().add_wishlist(user_id(user), parent_asin)
    except ValueError as error:
        raise user_data_error(error) from error


@app.delete("/api/wishlist/{parent_asin}")
def remove_wishlist(parent_asin: str, user: dict = Depends(authenticated_user)) -> dict:
    return get_user_data_service().remove_wishlist(user_id(user), parent_asin)


@app.get("/api/cart")
def get_cart(user: dict = Depends(authenticated_user)) -> dict:
    return get_user_data_service().cart(user_id(user))


@app.post("/api/cart/{parent_asin}")
def add_cart(
    parent_asin: str,
    request: CartQuantityRequest,
    user: dict = Depends(authenticated_user),
) -> dict:
    try:
        return get_user_data_service().add_cart(user_id(user), parent_asin, request.quantity)
    except ValueError as error:
        raise user_data_error(error) from error


@app.put("/api/cart/{parent_asin}")
def update_cart(
    parent_asin: str,
    request: CartQuantityRequest,
    user: dict = Depends(authenticated_user),
) -> dict:
    try:
        return get_user_data_service().update_cart(user_id(user), parent_asin, request.quantity)
    except ValueError as error:
        raise user_data_error(error) from error


@app.delete("/api/cart/{parent_asin}")
def remove_cart(parent_asin: str, user: dict = Depends(authenticated_user)) -> dict:
    return get_user_data_service().remove_cart(user_id(user), parent_asin)


@app.post("/api/events")
def record_event(request: EventRequest, user: dict = Depends(authenticated_user)) -> dict:
    try:
        return get_activity_service().record(
            user_id(user),
            request.event_type,
            request.parent_asin,
            request.search_query,
            request.category,
            request.metadata,
        )
    except ValueError as error:
        raise HTTPException(status_code=400, detail=str(error)) from error


@app.get("/api/events")
def get_events(
    limit: Annotated[int, Query(ge=1, le=500)] = 100,
    user: dict = Depends(authenticated_user),
) -> dict:
    return {"items": get_activity_service().list(user_id(user), limit)}


@app.post("/api/orders/checkout", status_code=201)
def checkout(user: dict = Depends(authenticated_user)) -> dict:
    try:
        return get_order_service().checkout(user_id(user))
    except ValueError as error:
        raise user_data_error(error) from error


@app.get("/api/orders")
def get_orders(user: dict = Depends(authenticated_user)) -> dict:
    return {"items": get_order_service().orders(user_id(user))}


@app.get("/api/orders/{order_id}")
def get_order(order_id: int, user: dict = Depends(authenticated_user)) -> dict:
    try:
        return get_order_service().get_order(user_id(user), order_id)
    except ValueError as error:
        raise HTTPException(status_code=404, detail=str(error)) from error


@app.get("/api/products")
def products(
    page: Annotated[int, Query(ge=1)] = 1,
    page_size: Annotated[int, Query(ge=1, le=100)] = 24,
    search: str | None = None,
    category: str | None = None,
    min_price: Annotated[float | None, Query(ge=0)] = None,
    max_price: Annotated[float | None, Query(ge=0)] = None,
    min_rating: Annotated[float | None, Query(ge=0, le=5)] = None,
    store: str | None = None,
    sort: str = "relevance",
) -> dict:
    if min_price is not None and max_price is not None and min_price > max_price:
        raise HTTPException(status_code=422, detail="min_price cannot exceed max_price")
    result = get_service().products(
        page,
        page_size,
        search,
        category,
        min_price,
        max_price,
        min_rating,
        store,
        sort,
    )
    return {"items": result.items, "page": result.page, "page_size": result.page_size, "total": result.total}


@app.get("/api/products/{parent_asin}")
def product(parent_asin: str) -> dict:
    result = get_service().product(parent_asin)
    if result is None:
        raise HTTPException(status_code=404, detail="Product not found")
    return result


@app.get("/api/categories")
def categories() -> list[dict]:
    return get_service().categories()


@app.get("/api/recommendations/global")
def global_recommendations(limit: Annotated[int, Query(ge=1, le=100)] = 10) -> dict:
    return {"items": get_service().ranked(None, limit)}


@app.get("/api/recommendations/category/{category}")
def category_recommendations(
    category: str, limit: Annotated[int, Query(ge=1, le=100)] = 10
) -> dict:
    return {"items": get_service().ranked(category, limit)}


@app.post("/api/recommendations/similar")
def similar_recommendations(request: SimilarRequest) -> dict:
    return {"items": get_service().similar(request.product_ids, request.limit)}
