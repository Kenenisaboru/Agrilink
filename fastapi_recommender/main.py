"""
AgriLink FastAPI Recommendation Service
========================================
Base URL  : http://localhost:8001
Swagger UI: http://localhost:8001/docs

Endpoints
─────────
GET  /health                            → service status
GET  /products                          → list catalog
GET  /products/{product_id}             → single product

POST /recommend/collaborative           → user-based CF
POST /recommend/content                 → content-based
POST /recommend/hybrid                  → blended (default)
GET  /recommend/popular/{category}      → top-rated by category
GET  /recommend/cold-start              → no-context fallback
"""

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
import time, os

import engine
from data.products import PRODUCTS

# ─────────────────────────────────────────────────────────────────────────────
app = FastAPI(
    title="AgriLink Recommendation API",
    description=(
        "AI-powered product recommendation service for AgriLink – East Hararghe. "
        "Implements collaborative filtering, content-based filtering, and a hybrid "
        "blend using scikit-learn cosine similarity (TF-Recommenders compatible interface)."
    ),
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],          # tighten in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─────────────────────────────────────────────────────────────────────────────
# SCHEMAS
# ─────────────────────────────────────────────────────────────────────────────

class CollaborativeRequest(BaseModel):
    user_id: str = Field(..., example="B001", description="AgriLink buyer user ID")
    top_k: int = Field(6, ge=1, le=20)
    exclude_seen: bool = Field(True, description="Exclude already-purchased products")

class ContentRequest(BaseModel):
    product_id: Optional[str] = Field(None, example="P001",
        description="Seed product for similarity search")
    category: Optional[str] = Field(None, example="coffee",
        description="Filter by category: coffee|khat|grains|vegetables|fruits|livestock|spices")
    tags: Optional[List[str]] = Field(None, example=["organic", "export"],
        description="Additional tag filters")
    top_k: int = Field(6, ge=1, le=20)
    exclude_ids: Optional[List[str]] = Field(None,
        description="Product IDs to exclude from results")

class HybridRequest(BaseModel):
    user_id: Optional[str] = Field(None, example="B001")
    product_id: Optional[str] = Field(None, example="P001")
    category: Optional[str] = Field(None, example="coffee")
    tags: Optional[List[str]] = Field(None, example=["premium"])
    top_k: int = Field(6, ge=1, le=20)
    cf_weight: float = Field(0.6, ge=0.0, le=1.0,
        description="Weight for collaborative signal (0–1). cb_weight = 1 - cf_weight if not set.")
    cb_weight: float = Field(0.4, ge=0.0, le=1.0,
        description="Weight for content-based signal (0–1).")

class RecommendationResponse(BaseModel):
    recommendations: List[Dict[str, Any]]
    count: int
    method: str
    latency_ms: float

# ─────────────────────────────────────────────────────────────────────────────
# HEALTH
# ─────────────────────────────────────────────────────────────────────────────

@app.get("/health", tags=["System"])
def health():
    return {
        "status": "ok",
        "service": "AgriLink Recommendation API",
        "version": "1.0.0",
        "catalog_size": len(PRODUCTS),
        "algorithms": ["collaborative", "content-based", "hybrid"],
    }


# ─────────────────────────────────────────────────────────────────────────────
# PRODUCT CATALOG
# ─────────────────────────────────────────────────────────────────────────────

@app.get("/products", tags=["Catalog"])
def list_products(
    category: Optional[str] = Query(None,
        description="Filter: coffee|khat|grains|vegetables|fruits|livestock|spices")
):
    """Return the full product catalog, optionally filtered by category."""
    return {"products": engine.list_all_products(category), "count": len(PRODUCTS)}


@app.get("/products/{product_id}", tags=["Catalog"])
def get_product(product_id: str):
    """Return a single product by ID."""
    prod = next((p for p in PRODUCTS if p["id"] == product_id), None)
    if not prod:
        raise HTTPException(status_code=404, detail=f"Product '{product_id}' not found.")
    return prod


# ─────────────────────────────────────────────────────────────────────────────
# RECOMMENDATION ENDPOINTS
# ─────────────────────────────────────────────────────────────────────────────

@app.post("/recommend/collaborative", response_model=RecommendationResponse, tags=["Recommendations"])
def recommend_collaborative(req: CollaborativeRequest):
    """
    **User-based Collaborative Filtering**

    Finds users with similar purchase history and recommends what they bought.
    Best for returning buyers with at least one purchase.
    """
    t0 = time.perf_counter()
    recs = engine.collaborative_recommend(req.user_id, req.top_k, req.exclude_seen)
    ms = round((time.perf_counter() - t0) * 1000, 2)
    return RecommendationResponse(
        recommendations=recs, count=len(recs),
        method="collaborative", latency_ms=ms
    )


@app.post("/recommend/content", response_model=RecommendationResponse, tags=["Recommendations"])
def recommend_content(req: ContentRequest):
    """
    **Content-Based Filtering**

    Returns products similar to a given product_id, or matching a
    category/tag combination. Works for cold-start users.
    """
    if not req.product_id and not req.category and not req.tags:
        raise HTTPException(
            status_code=422,
            detail="Provide at least one of: product_id, category, or tags."
        )
    t0 = time.perf_counter()
    recs = engine.content_recommend(
        req.product_id, req.category, req.tags,
        req.top_k, req.exclude_ids
    )
    ms = round((time.perf_counter() - t0) * 1000, 2)
    return RecommendationResponse(
        recommendations=recs, count=len(recs),
        method="content", latency_ms=ms
    )


@app.post("/recommend/hybrid", response_model=RecommendationResponse, tags=["Recommendations"])
def recommend_hybrid(req: HybridRequest):
    """
    **Hybrid Recommendation (default)**

    Blends collaborative and content-based signals with configurable weights.
    Recommended for production use – best of both worlds.

    - `cf_weight=0.6, cb_weight=0.4` → emphasise user history  
    - `cf_weight=0.0, cb_weight=1.0` → pure content (cold-start)  
    - `cf_weight=1.0, cb_weight=0.0` → pure collaborative  
    """
    t0 = time.perf_counter()
    recs = engine.hybrid_recommend(
        req.user_id, req.product_id, req.category, req.tags,
        req.top_k, req.cf_weight, req.cb_weight
    )
    ms = round((time.perf_counter() - t0) * 1000, 2)
    return RecommendationResponse(
        recommendations=recs, count=len(recs),
        method="hybrid", latency_ms=ms
    )


@app.get("/recommend/popular/{category}", tags=["Recommendations"])
def recommend_popular(
    category: str,
    top_k: int = Query(4, ge=1, le=10)
):
    """
    **Top-Rated by Category**

    Returns the highest-rated products in a given category.
    Great for homepage carousels and new-user onboarding.
    """
    recs = engine.get_popular_by_category(category, top_k)
    if not recs:
        raise HTTPException(status_code=404, detail=f"No products in category '{category}'.")
    return {"category": category, "recommendations": recs, "count": len(recs)}


@app.get("/recommend/cold-start", tags=["Recommendations"])
def recommend_cold_start(top_k: int = Query(6, ge=1, le=20)):
    """
    **Cold-Start Fallback**

    Returns the globally top-rated products for anonymous / new users.
    """
    recs = engine._top_rated(top_k)
    return {"recommendations": recs, "count": len(recs), "method": "top_rated"}


# ─────────────────────────────────────────────────────────────────────────────
# ENTRY POINT
# ─────────────────────────────────────────────────────────────────────────────
if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8001))
    print(f"🌾 AgriLink Recommender starting on port {port} ...")
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
