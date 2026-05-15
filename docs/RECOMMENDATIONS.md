# AgriLink Recommendation Architecture

AgriLink uses **two separate recommendation systems** for different purposes. Do not merge them—they serve different domains.

## Product recommendations (marketplace)

| Item | Value |
|------|--------|
| **Service** | FastAPI (`fastapi_recommender/`) |
| **Port (local)** | `8001` |
| **Env** | `VITE_RECOMMENDER_URL` |
| **Frontend** | `useRecommendations` hook, `RecommendedProducts` component |
| **Algorithms** | Collaborative filtering, content-based, hybrid |

Use this for “Recommended for you” product cards on the marketplace.

## Crop / farming advisory (AI)

| Item | Value |
|------|--------|
| **Service** | Flask AI (`flask_ai/`) |
| **Port (local)** | `5001` |
| **Env** | `VITE_FLASK_API_URL` |
| **Frontend** | `aiApi.js` → `getRecommendations()` |
| **Used on** | Price Prediction page, AI assistant context |

Use this for crop-specific farming advice (user type, crop, region)—not marketplace SKUs.

## Express `/api/ai/recommend` (optional proxy)

The Node backend exposes `/api/ai/recommend` as a **JWT-protected** proxy to the same Flask advisory logic. Prefer calling Flask directly from the frontend via `VITE_FLASK_API_URL` for lower latency.

**Canonical rule:** Marketplace products → **FastAPI**. Farming/crop advice → **Flask**.
