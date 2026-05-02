# 🌾 AgriLink FastAPI Recommendation Service

Standalone AI-powered product recommendation engine for the AgriLink platform.  
Runs independently on **port 8001**, separate from the main Flask AI engine (port 5001).

---

## 📁 Structure

```
fastapi_recommender/
├── main.py              ← FastAPI app + all endpoints
├── engine.py            ← Recommendation algorithms (CF + Content + Hybrid)
├── requirements.txt
└── data/
    ├── __init__.py
    └── products.py      ← Product catalog + synthetic interaction log
```

---

## 🚀 Setup & Run

### 1 — Create a virtual environment

```powershell
cd fastapi_recommender
python -m venv .venv
.\.venv\Scripts\Activate.ps1
```

### 2 — Install dependencies

```powershell
pip install -r requirements.txt
```

### 3 — Start the service

```powershell
python main.py
```

Or with uvicorn directly:

```powershell
uvicorn main:app --host 0.0.0.0 --port 8001 --reload
```

---

## 📖 API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `GET`  | `/health` | Service health check |
| `GET`  | `/products` | Full product catalog |
| `GET`  | `/products/{id}` | Single product |
| `POST` | `/recommend/hybrid` | **Default** – blended CF + content |
| `POST` | `/recommend/collaborative` | User-based collaborative filtering |
| `POST` | `/recommend/content` | Content-based (tag similarity) |
| `GET`  | `/recommend/popular/{category}` | Top-rated by category |
| `GET`  | `/recommend/cold-start` | Global top-rated (no user needed) |

### Interactive Swagger UI
Open **http://localhost:8001/docs** after starting the service.

---

## 💡 How to Use in the React Frontend

### Option A — Drop-in component
```jsx
import RecommendedProducts from '../components/common/RecommendedProducts';

// In BuyerDashboard or Home page
<RecommendedProducts
  userId={user?._id}
  category="coffee"
  topK={6}
  onAddToCart={(product) => addToCart(product)}
/>
```

### Option B — Raw hook
```jsx
import useRecommendations from '../hooks/useRecommendations';

const { recommendations, loading, error } = useRecommendations({
  mode: 'hybrid',
  userId: user?._id,
  category: 'grains',
  topK: 4,
});
```

---

## ⚙️ Environment Variables (frontend)

Add to `frontend/.env`:
```
VITE_RECOMMENDER_URL=http://localhost:8001
```

---

## 🧠 Algorithms

### Collaborative Filtering (User-Based)
- Builds a user × product interaction matrix (view=1, wishlist=2, cart=3, purchase=5)
- Computes cosine similarity between all user vectors
- Recommends products from the most similar users that the target user hasn't seen yet

### Content-Based Filtering
- Creates a TF-IDF-style tag matrix (rows=products, cols=all unique tags)
- L2-normalises each row so cosine similarity = dot product
- Given a seed product or category/tags, returns the most similar products

### Hybrid (Default)
- Normalises both CF and CB score vectors to [0,1]
- Returns `cf_weight × CF_scores + cb_weight × CB_scores`  
- Default: `cf=0.6, cb=0.4` (emphasise user history)
- Set `cf=0, cb=1` for pure cold-start content mode

---

## 🔗 Integration with Existing Flask AI Service

The Flask AI service (port 5001) has a `/api/recommend` endpoint that uses
Gemini for text-based recommendations. **This FastAPI service is complementary**:

| Service | Port | Focus |
|---------|------|-------|
| Flask AI | 5001 | Chatbot, price prediction, Gemini text recommendations |
| FastAPI Recommender | 8001 | Collaborative + content-based product recommendations |

Both can run simultaneously.
