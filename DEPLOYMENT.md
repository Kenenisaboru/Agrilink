# AgriLink Deployment Guide (Full AI & PWA Edition)

This guide will walk you through deploying the complete AgriLink ecosystem—including the Node.js backend, Flask AI engine, and the React PWA frontend—to production-ready cloud services.

## 🚀 Quick Overview

| Service | Recommended Provider | Purpose |
|---------|---------------------|---------|
| **Frontend** | Vercel | React PWA (UI & Multilingual) |
| **Backend** | Render/Railway | Node.js Core API |
| **AI Service** | Render | Flask AI Microservice |
| **Database** | MongoDB Atlas | Global Data Persistence |
| **Storage** | Cloudinary | Secure Farmer Crop Images |

---

## Step 1: Database Setup (MongoDB Atlas)

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster (M0 Sandbox is free)
3. Under **Database Access**, create a user.
4. Under **Network Access**, add IP address `0.0.0.0/0` (Allowing cloud connections).
5. Copy the connection string (format: `mongodb+srv://...`) and keep it for Step 3.

---

## Step 2: Flask AI Deployment (Render)

The AI engine provides the search, diagnosis, and multilingual chatbot features.

1. Create a **New + Web Service** on [Render](https://render.com).
2. Connect your repository.
3. Configure:
   - **Environment**: `Python 3`
   - **Root Directory**: `flask_ai`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `gunicorn app:app` (or `python app.py`)
4. Copy the URL (e.g., `https://agrilink-ai.onrender.com`).

---

## Step 3: Backend Deployment (Render)

1. Create a **New + Web Service** on Render.
2. **Root Directory**: `backend`
3. **Build Command**: `npm install`
4. **Start Command**: `npm start`
5. **Add Environment Variables**:
   - `PORT`: `5000`
   - `MONGO_URI`: (Your Atlas String)
   - `JWT_SECRET`: (Gnerate a random long string)
   - `CHAPA_SECRET_KEY`: (Your Chapa Live/Demo Key)
   - `PAYMENT_MODE`: `LIVE` or `DEMO`
   - `ALLOWED_ORIGINS`: (Your Vercel URL - Added after Step 4)

---

## Step 4: Frontend PWA Deployment (Vercel)

1. Connect your Github to [Vercel](https://vercel.com).
2. New Project → Import Repo.
3. **Root Directory**: `frontend`
4. **Framework Preset**: `Vite`
5. **Environment Variables**:
   - `VITE_API_URL`: (Your Backend Render URL)
   - `VITE_FLASK_API_URL`: (Your AI Render URL + `/api`)
6. **Deploy**.

---

## 🛠️ Post-Deployment Checklist

- [ ] **PWA Audit**: Open the site on mobile. Does "Add to Home Screen" appear?
- [ ] **AI Test**: Ask the chatbot a question in Amharic.
- [ ] **Payment Test**: Run a Demo checkout to verify the 5% split payout logic.
- [ ] **Logo Check**: Verify the Ethiopian Farmer logo renders in the mobile status bar.

---

**Built with 💚 by Antigravity for the Ethiopian Agricultural Renaissance**
