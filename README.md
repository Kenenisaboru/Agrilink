# 🌾 AgriLink - East Hararghe Farmer-Student Innovation Platform

[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)

A comprehensive MERN stack platform designed to empower farmers in **Eastern Ethiopia** (Harar, Haramaya, Dire Dawa, Jigjiga, Oda Bultum). **AgriLink** bridges the gap between traditional farming and modern innovation by connecting Farmers with University Students for problem-solving and direct Buyers for crop sales with simulated mobile payments.

---

## 🔥 Key Features

-   **👤 Multi-Role Ecosystem**: Tailored dashboards for **Farmers**, **University Students**, and **Buyers**.
-   **🛒 Crop Marketplace**: Transparent listing and purchasing system for regional crops (Maize, Chat, Coffee, etc.).
-   **💡 Innovation Hub**: A collaboration space where Farmers post agricultural challenges and Haramaya University students propose technical solutions.
-   **💸 Secure Payments**: Integrated simulation of **M-Pesa** payment workflows.
-   **📊 Market Insights**: Real-time regional agricultural price injection system.

---

## 🛠 Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend** | React 18, Vite, Tailwind CSS, Lucide Icons, Axios |
| **Backend** | Node.js, Express.js, JWT Authentication |
| **Database** | MongoDB (Atlas) with Mongoose ODM |
| **Styling** | Custom Tailwind Design System |

---

## 🚀 Getting Started

### Prerequisites

-   [Node.js](https://nodejs.org/) (v16+)
-   [MongoDB](https://www.mongodb.com/try/download/community) (Local or Atlas Atlas)

### 1️⃣ Backend Setup

```bash
cd backend
npm install
# Configure your .env file
node seeder.js  # Inject initial market data
npm run dev
```

### 2️⃣ Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Visit `http://localhost:5173` to view the application!

---

## 🌐 Deployment Logic

### Backend (Render)
-   **Root Directory**: `backend`
-   **Build Command**: `npm install`
-   **Start Command**: `npm start`
-   **Env Vars**: `MONGO_URI`, `JWT_SECRET`, `PORT`

### Frontend (Vercel)
-   **Framework Preset**: `Vite`
-   **Root Directory**: `frontend`
-   **Build Command**: `npm run build`
-   **Output Directory**: `dist`

---

## 🛡️ License

Distributed under the MIT License. See `LICENSE` for more information.

---

### 📞 Contact
Project Link: [https://github.com/your-username/agrilink](https://github.com/your-username/agrilink)
