# 🌾 AgriLink - East Hararghe Farmer-Student Innovation Platform

[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Socket.io](https://img.shields.io/badge/Socket.io-black?style=for-the-badge&logo=socket.io&badgeColor=010101)](https://socket.io/)

A **production-ready** MERN stack platform designed to empower farmers in **Eastern Ethiopia** (Harar, Haramaya, Dire Dawa, Jigjiga, Oda Bultum). **AgriLink** bridges the gap between traditional farming and modern innovation by connecting Farmers with University Students for problem-solving, direct Buyers for crop sales, and Representatives for regional coordination.

---

## 🔥 Key Features

-   **👤 Multi-Role Ecosystem**: Tailored dashboards for **Farmers**, **University Students**, **Buyers**, **Representatives**, and **Admins**.
-   **💬 Real-Time Chat**: Socket.io powered messaging system between all user types with typing indicators and conversation history.
-   **🛒 Crop Marketplace**: Transparent listing and purchasing system for regional crops (Maize, Chat, Coffee, etc.) with image uploads.
-   **💡 Innovation Hub**: A collaboration space where Farmers post agricultural challenges and Haramaya University students propose technical solutions.
-   **� Analytics Dashboard**: Role-based analytics for tracking sales, orders, and platform activity.
-   **☁️ Cloud Storage**: Cloudinary integration for secure image uploads and optimization.
-   **� Security**: JWT authentication, role-based access control, password hashing, and CORS protection.

---

## 🛠 Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend** | React 18, Vite, Tailwind CSS, Framer Motion, Lucide Icons, Axios |
| **Backend** | Node.js, Express.js, JWT Authentication, Socket.io |
| **Database** | MongoDB (Atlas) with Mongoose ODM |
| **Storage** | Cloudinary (Image uploads) |
| **Real-time** | Socket.io (Chat system) |
| **Styling** | Custom Tailwind Design System with glass-morphism |

---

## � Project Structure

```
agrilink/
├── backend/
│   ├── config/          # Database, Cloudinary & JWT config
│   ├── controllers/     # Business logic controllers
│   ├── middleware/      # Auth, error handling & validation
│   ├── models/          # Mongoose schemas (User, Crop, Order, Message)
│   ├── routes/          # API route definitions
│   ├── sockets/         # Socket.io chat handlers
│   ├── utils/           # Utility functions & error responses
│   ├── server.js        # Application entry point
│   └── .env.example     # Environment variables template
├── frontend/
│   ├── src/
│   │   ├── components/  # Reusable UI components (Sidebar, Navbar)
│   │   ├── layout/      # Role-based layouts (Farmer, Buyer, etc.)
│   │   ├── pages/       # Page components (Dashboards, Chat)
│   │   ├── context/     # React Context (Auth)
│   │   ├── main.jsx     # Application entry
│   │   └── index.css    # Global styles & Tailwind config
│   ├── .env.example     # Environment variables template
│   └── package.json
├── DEPLOYMENT.md        # Detailed deployment guide
└── README.md            # This file
```

---

## �🚀 Getting Started

### Prerequisites

-   [Node.js](https://nodejs.org/) (v18+)
-   [MongoDB](https://www.mongodb.com/try/download/community) (Local or Atlas)
-   [Cloudinary](https://cloudinary.com) account (for image uploads)

### 1️⃣ Backend Setup

```bash
cd backend
npm install

# Copy environment template and configure
cp .env.example .env
# Edit .env with your credentials (MongoDB URI, JWT Secret, Cloudinary)

# Seed initial data (optional)
node seeder.js

# Start development server
npm run dev
```

### 2️⃣ Frontend Setup

```bash
cd frontend
npm install

# Copy environment template and configure
cp .env.example .env
# Edit .env with your API URL

# Start development server
npm run dev
```

Visit `http://localhost:5173` to view the application!

---

## 🔐 Environment Variables

### Backend (.env)
```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/agrilink
JWT_SECRET=your_super_secret_jwt_key_min_32_chars

# Cloudinary (Required for image uploads)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# CORS (comma-separated)
CORS_ORIGIN=http://localhost:5173,http://localhost:5174
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:5000
VITE_SOCKET_URL=http://localhost:5000
```

---

## 🌐 Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for comprehensive deployment instructions.

**Quick Deploy:**
| Service | Provider | Purpose |
|---------|----------|---------|
| Frontend | Vercel/Netlify | React app hosting |
| Backend | Render/Railway | Node.js API |
| Database | MongoDB Atlas | Data persistence |
| Storage | Cloudinary | Image uploads |

### Backend (Render)
-   **Root Directory**: `backend`
-   **Build Command**: `npm install`
-   **Start Command**: `npm start`
-   **Env Vars**: `MONGO_URI`, `JWT_SECRET`, `CLOUDINARY_*`

### Frontend (Vercel)
-   **Framework Preset**: `Vite`
-   **Root Directory**: `frontend`
-   **Build Command**: `npm run build`
-   **Output Directory**: `dist`
-   **Env Vars**: `VITE_API_URL`

---

## 👥 User Roles

| Role | Capabilities |
|------|-------------|
| **Farmer** | List crops, upload images, track sales, view orders, chat with buyers |
| **Buyer** | Browse marketplace, filter/search, purchase crops, track orders, chat |
| **Student** | View farmer problems, submit solutions, innovation hub access |
| **Representative** | Manage regional farmers/buyers, monitor activity, support queue |
| **Admin** | User management, system logs, analytics, full platform control |

---

## � API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get profile (Protected)

### Crops
- `GET /api/crops` - List all available crops
- `POST /api/crops` - Create new crop listing (Farmer only, with image upload)
- `GET /api/crops/:id` - Get single crop details
- `PUT /api/crops/:id` - Update crop listing
- `DELETE /api/crops/:id` - Delete crop

### Messages (Chat)
- `GET /api/messages/conversations/list` - Get conversation list
- `GET /api/messages/:userId` - Get chat history with user
- `POST /api/messages` - Send message

### Orders
- `GET /api/orders` - Get orders
- `POST /api/orders` - Create order
- `PUT /api/orders/:id` - Update order status

---

## 🔒 Security Features

- **JWT Authentication**: Stateless auth with secure tokens
- **Role-Based Access**: Granular permissions per user type
- **Password Hashing**: bcrypt with salt rounds
- **Input Validation**: Server-side validation on all inputs
- **CORS Protection**: Configured for specific origins
- **Secure Uploads**: Cloudinary with file type & size validation

---

## 🎯 Performance Optimizations

- Lazy loading of dashboard components
- API response caching where applicable
- Image optimization via Cloudinary
- Database indexing on frequently queried fields
- Code splitting with Vite

---

## �🛡️ License

Distributed under the MIT License. See `LICENSE` for more information.

---

### 📞 Contact & Support
- Project Link: [https://github.com/Kenenisaboru/Agrilink](https://github.com/Kenenisaboru/Agrilink)
- Issues: [GitHub Issues](https://github.com/Kenenisaboru/Agrilink/issues)

---

**Made with 💚 for the Ethiopian agricultural community**
