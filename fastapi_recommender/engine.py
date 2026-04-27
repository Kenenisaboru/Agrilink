"""
AgriLink Recommendation Engine
================================
Two complementary algorithms:

1. **Collaborative Filtering (User-Based)**
2. **Content-Based Filtering**

Design decision: Fully pure Python!
We avoid numpy and scikit-learn completely to bypass all MSYS2/cmake SSL 
build errors on Windows. Since the catalog is small, pure Python math 
completes the matrix multiplications in less than 1 millisecond.
"""

import math
from collections import defaultdict
from typing import List, Dict, Any, Optional

from data.products import PRODUCTS, INTERACTIONS

# ─────────────────────────────────────────────────────────────────────────────
# PURE PYTHON MATH (No Numpy, No C-extensions)
# ─────────────────────────────────────────────────────────────────────────────

def dot_product(v1, v2):
    return sum(a * b for a, b in zip(v1, v2))

def vector_norm(v):
    return math.sqrt(sum(x * x for x in v))

def normalize(matrix):
    """L2 normalizes each row in a 2D matrix."""
    normalized = []
    for row in matrix:
        norm = vector_norm(row)
        if norm > 0:
            normalized.append([x / norm for x in row])
        else:
            normalized.append([0.0 for _ in row])
    return normalized

def cosine_similarity(matrix1, matrix2=None):
    """Computes pure Python cosine similarity between two matrices."""
    if matrix2 is None:
        matrix2 = matrix1
    norm1 = normalize(matrix1)
    norm2 = normalize(matrix2)
    
    result = []
    for row1 in norm1:
        res_row = []
        for row2 in norm2:
            res_row.append(dot_product(row1, row2))
        result.append(res_row)
    return result

def argsort_desc(seq, top_k):
    """Returns the indices of the top K largest values."""
    return sorted(range(len(seq)), key=lambda k: seq[k], reverse=True)[:top_k]

# ─────────────────────────────────────────────────────────────────────────────
# BUILD MATRICES
# ─────────────────────────────────────────────────────────────────────────────

def _build_interaction_matrix():
    user_ids = sorted(set(u for u, _, _ in INTERACTIONS))
    product_ids = sorted(set(p["id"] for p in PRODUCTS))

    u_idx = {u: i for i, u in enumerate(user_ids)}
    p_idx = {p: i for i, p in enumerate(product_ids)}

    matrix = [[0.0] * len(product_ids) for _ in range(len(user_ids))]
    for user, prod, weight in INTERACTIONS:
        if user in u_idx and prod in p_idx:
            matrix[u_idx[user]][p_idx[prod]] = float(weight)

    return u_idx, p_idx, matrix, user_ids, product_ids


def _build_content_matrix(product_ids):
    all_tags = sorted(set(tag for p in PRODUCTS for tag in p["tags"]))
    tag_idx = {t: i for i, t in enumerate(all_tags)}

    prod_map = {p["id"]: p for p in PRODUCTS}
    matrix = [[0.0] * len(all_tags) for _ in range(len(product_ids))]

    for i, pid in enumerate(product_ids):
        prod = prod_map.get(pid)
        if prod:
            for tag in prod["tags"]:
                matrix[i][tag_idx[tag]] = 1.0

    return normalize(matrix), all_tags, tag_idx


# Pre-compute at import time
_u_idx, _p_idx, _matrix, _user_ids, _product_ids = _build_interaction_matrix()
_content_matrix, _all_tags, _tag_idx = _build_content_matrix(_product_ids)
_prod_map: Dict[str, Dict] = {p["id"]: p for p in PRODUCTS}

# User similarity matrix (user × user)
_norm_matrix = normalize(_matrix)
_user_sim = cosine_similarity(_norm_matrix)

# Product similarity matrix (product × product)
_product_sim = cosine_similarity(_content_matrix)


# ─────────────────────────────────────────────────────────────────────────────
# PUBLIC API
# ─────────────────────────────────────────────────────────────────────────────

def collaborative_recommend(
    user_id: str,
    top_k: int = 6,
    exclude_seen: bool = True,
) -> List[Dict[str, Any]]:
    if user_id not in _u_idx:
        return _top_rated(top_k)

    u = _u_idx[user_id]
    sim_scores = _user_sim[u]
    seen = {i for i, val in enumerate(_matrix[u]) if val > 0}

    score_vector = [0.0] * len(_product_ids)
    for other_u, sim in enumerate(sim_scores):
        if other_u == u or sim <= 0:
            continue
        for p, val in enumerate(_matrix[other_u]):
            score_vector[p] += sim * val

    if exclude_seen:
        for p in seen:
            score_vector[p] = 0.0

    top_indices = argsort_desc(score_vector, top_k)
    return _format(top_indices, score_vector, method="collaborative")


def content_recommend(
    product_id: Optional[str] = None,
    category: Optional[str] = None,
    tags: Optional[List[str]] = None,
    top_k: int = 6,
    exclude_ids: Optional[List[str]] = None,
) -> List[Dict[str, Any]]:
    exclude_set = set(exclude_ids or [])

    if product_id and product_id in _p_idx:
        p = _p_idx[product_id]
        sim_scores = list(_product_sim[p])
        sim_scores[p] = 0.0
        for pid in exclude_set:
            if pid in _p_idx:
                sim_scores[_p_idx[pid]] = 0.0
        top_indices = argsort_desc(sim_scores, top_k)
        return _format(top_indices, sim_scores, method="content")

    query = [0.0] * len(_all_tags)
    if category and category.lower() in _tag_idx:
        query[_tag_idx[category.lower()]] = 2.0
    if tags:
        for tag in tags:
            if tag.lower() in _tag_idx:
                query[_tag_idx[tag.lower()]] += 1.0

    if sum(query) == 0:
        return _top_rated(top_k)

    query = normalize([query])[0]
    sim_scores = [dot_product(row, query) for row in _content_matrix]

    for pid in exclude_set:
        if pid in _p_idx:
            sim_scores[_p_idx[pid]] = 0.0

    top_indices = argsort_desc(sim_scores, top_k)
    return _format(top_indices, sim_scores, method="content")


def hybrid_recommend(
    user_id: Optional[str] = None,
    product_id: Optional[str] = None,
    category: Optional[str] = None,
    tags: Optional[List[str]] = None,
    top_k: int = 6,
    cf_weight: float = 0.6,
    cb_weight: float = 0.4,
) -> List[Dict[str, Any]]:
    cf_scores = [0.0] * len(_product_ids)
    cb_scores = [0.0] * len(_product_ids)

    if user_id and user_id in _u_idx:
        u = _u_idx[user_id]
        seen = {i for i, val in enumerate(_matrix[u]) if val > 0}
        for other_u, sim in enumerate(_user_sim[u]):
            if other_u == u or sim <= 0:
                continue
            for p, val in enumerate(_matrix[other_u]):
                cf_scores[p] += sim * val
        for p in seen:
            cf_scores[p] = 0.0

    if product_id and product_id in _p_idx:
        p = _p_idx[product_id]
        cb_scores = list(_product_sim[p])
        cb_scores[p] = 0.0
    elif category or tags:
        query = [0.0] * len(_all_tags)
        if category and category.lower() in _tag_idx:
            query[_tag_idx[category.lower()]] = 2.0
        if tags:
            for tag in tags:
                if tag.lower() in _tag_idx:
                    query[_tag_idx[tag.lower()]] += 1.0
        if sum(query) > 0:
            query = normalize([query])[0]
            cb_scores = [dot_product(row, query) for row in _content_matrix]

    def _norm(v):
        mx = max(v) if v else 0
        return [x / mx for x in v] if mx > 0 else v

    cf_norm = _norm(cf_scores)
    cb_norm = _norm(cb_scores)
    hybrid = [cf_weight * a + cb_weight * b for a, b in zip(cf_norm, cb_norm)]

    top_indices = argsort_desc(hybrid, top_k)
    return _format(top_indices, hybrid, method="hybrid")


# ─────────────────────────────────────────────────────────────────────────────
# HELPERS
# ─────────────────────────────────────────────────────────────────────────────

def _top_rated(top_k: int) -> List[Dict[str, Any]]:
    rated = sorted(PRODUCTS, key=lambda p: p["rating"], reverse=True)[:top_k]
    return [
        {**p, "score": round(float(p["rating"] / 5.0), 4), "method": "top_rated"}
        for p in rated
    ]

def _format(indices, scores, method: str) -> List[Dict[str, Any]]:
    results = []
    for idx in indices:
        pid = _product_ids[idx]
        prod = _prod_map.get(pid)
        if prod and scores[idx] > 0:
            results.append({
                **prod,
                "score": round(float(scores[idx]), 4),
                "method": method,
            })
    return results

def get_popular_by_category(category: str, top_k: int = 4) -> List[Dict]:
    filtered = [p for p in PRODUCTS if p["category"].lower() == category.lower()]
    return sorted(filtered, key=lambda p: p["rating"], reverse=True)[:top_k]

def list_all_products(category: Optional[str] = None) -> List[Dict]:
    if category:
        return [p for p in PRODUCTS if p["category"].lower() == category.lower()]
    return list(PRODUCTS)
