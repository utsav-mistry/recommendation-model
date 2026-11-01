from __future__ import annotations

from contextlib import asynccontextmanager
from typing import Annotated

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from .config import DB_PATH, GRAPH_PATH, ITEM_IDS_PATH, RANKINGS_PATH
from .auth import AuthService, DuplicateEmailError
from .service import RecommendationService


service: RecommendationService | None = None
auth_service: AuthService | None = None


@asynccontextmanager
async def lifespan(_: FastAPI):
    global service, auth_service
    auth_service = AuthService(str(DB_PATH))
    service = RecommendationService(
        str(DB_PATH), str(RANKINGS_PATH), str(GRAPH_PATH), str(ITEM_IDS_PATH)
    )
    yield
    service = None
    auth_service = None


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


def get_service() -> RecommendationService:
    if service is None:
        raise HTTPException(status_code=503, detail="Recommendation service is not ready")
    return service


def get_auth_service() -> AuthService:
    if auth_service is None:
        raise HTTPException(status_code=503, detail="Authentication service is not ready")
    return auth_service


class SimilarRequest(BaseModel):
    product_ids: list[str] = Field(min_length=1, max_length=50)
    limit: int = Field(default=10, ge=1, le=100)


class SignupRequest(BaseModel):
    email: str = Field(min_length=3, max_length=254)
    password: str = Field(min_length=8, max_length=128)
    display_name: str = Field(min_length=1, max_length=100)


class LoginRequest(BaseModel):
    email: str = Field(min_length=3, max_length=254)
    password: str = Field(min_length=1, max_length=128)


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.get("/readiness")
def readiness() -> dict[str, str]:
    get_service()
    return {"status": "ready"}


@app.post("/api/auth/signup", status_code=201)
def signup(request: SignupRequest) -> dict:
    try:
        return get_auth_service().signup(request.email, request.password, request.display_name)
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
def current_user(token: str = Query(min_length=1)) -> dict:
    try:
        return {"user": get_auth_service().verify_token(token)}
    except ValueError as error:
        raise HTTPException(status_code=401, detail=str(error)) from error


@app.get("/api/products")
def products(
    page: Annotated[int, Query(ge=1)] = 1,
    page_size: Annotated[int, Query(ge=1, le=100)] = 24,
    search: str | None = None,
    category: str | None = None,
) -> dict:
    result = get_service().products(page, page_size, search, category)
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
