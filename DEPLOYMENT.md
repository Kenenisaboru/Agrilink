# AgriLink Deployment Guide

This guide will walk you through deploying AgriLink to production-ready cloud services.

## Quick Overview

| Service | Recommended Provider | Purpose |
|---------|---------------------|---------|
| Frontend | Vercel/Netlify | React app hosting |
| Backend | Render/Railway | Node.js API server |
| Database | MongoDB Atlas | Data persistence |
| Storage | Cloudinary | Image uploads |
| Real-time | Socket.io (included) | Chat system |

## Prerequisites

- GitHub account
- Accounts on chosen deployment platforms
- Domain name (optional, for custom branding)

---

## Step 1: Database Setup (MongoDB Atlas)

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster (M0 Sandbox is free)
3. Under **Database Access**, create a database user
4. Under **Network Access**, add IP address `0.0.0.0/0` (or your specific IPs)
5. Click **Connect** → **Connect your application**
6. Copy the connection string
7. Replace `<password>` with your database user password

Example:
```
mongodb+srv://admin:password123@cluster0.xxxxx.mongodb.net/agrilink?retryWrites=true&w=majority
```

---

## Step 2: Cloudinary Setup (Image Storage)

1. Go to [Cloudinary](https://cloudinary.com)
2. Sign up for a free account
3. From the dashboard, get your:
   - Cloud Name
   - API Key
   - API Secret

---

## Step 3: Backend Deployment (Render)

### 3.1 Prepare Your Code

Ensure your `backend/.env` file is ready (don't commit it, use `.env.example` as template):

```env
PORT=5000
NODE_ENV=production
MONGO_URI=mongodb+srv://... (from Step 1)
JWT_SECRET=your_super_secret_key_min_32_chars_long
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
CORS_ORIGIN=https://your-frontend-domain.vercel.app
```

### 3.2 Deploy to Render

1. Go to [Render](https://render.com)
2. Click **New +** → **Web Service**
3. Connect your GitHub repo
4. Configure:
   - **Name**: `agrilink-api`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Free
5. Add Environment Variables (copy from your .env)
6. Click **Create Web Service**
7. Wait for deployment to complete
8. Copy the deployed URL (e.g., `https://agrilink-api.onrender.com`)

---

## Step 4: Frontend Deployment (Vercel)

### 4.1 Update API Configuration

In `frontend/src/main.jsx`, ensure the base URL uses environment variables:

```javascript
axios.defaults.baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
```

### 4.2 Create vercel.json (if needed)

```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/" }
  ]
}
```

### 4.3 Deploy to Vercel

1. Go to [Vercel](https://vercel.com)
2. Click **Add New Project**
3. Import your GitHub repository
4. Configure:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Add Environment Variables:
   - `VITE_API_URL`: `https://your-render-url.onrender.com`
6. Click **Deploy**

---

## Step 5: Configure CORS

After deployment, update your backend CORS_ORIGIN environment variable to match your frontend domain:

```env
CORS_ORIGIN=https://agrilink.vercel.app
```

Restart the backend service on Render.

---

## Post-Deployment Checklist

- [ ] Frontend loads without errors
- [ ] Login/Register works
- [ ] Image uploads work
- [ ] Real-time chat works
- [ ] All dashboard features functional
- [ ] Mobile responsive design works

---

## Troubleshooting

### CORS Errors
Update `backend/server.js` to include your frontend domain:
```javascript
cors: {
  origin: ["http://localhost:5173", "https://your-frontend.vercel.app"],
  methods: ["GET", "POST"]
}
```

### Socket.io Not Connecting
Ensure Socket.io client uses the correct URL:
```javascript
const socket = io(import.meta.env.VITE_SOCKET_URL);
```

### Images Not Uploading
Verify Cloudinary credentials and folder name in `backend/config/cloudinary.js`

---

## Performance Optimization Tips

1. **Enable Gzip compression** on Render
2. **Use CDN** for static assets (Vercel handles this automatically)
3. **Database indexing** - ensure queries are indexed in MongoDB Atlas
4. **Image optimization** - Cloudinary handles this automatically
5. **Lazy loading** - implemented in frontend components

---

## Monitoring & Maintenance

- Use **Render Dashboard** for backend logs
- Use **Vercel Analytics** for frontend performance
- Use **MongoDB Atlas** for database monitoring
- Set up **UptimeRobot** for free monitoring (optional)

---

## Security Notes

1. Never commit `.env` files
2. Use strong JWT_SECRET (min 32 characters)
3. Enable MongoDB Atlas IP whitelisting in production
4. Rotate Cloudinary API keys periodically
5. Use HTTPS only in production

---

## Support

For issues or questions:
1. Check the logs in respective dashboards
2. Review this deployment guide
3. Open an issue in the GitHub repository
