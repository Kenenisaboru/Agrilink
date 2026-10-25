const express = require('express');
const http = require('http');
const socketio = require('socket.io');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const rateLimit = require('express-rate-limit');
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const socketHandler = require('./sockets/chatSocket');
const errorHandler = require('./middleware/errorMiddleware');

dotenv.config();

const app = express();
const server = http.createServer(app);

const allowedOrigins = (process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',')
  : [
      'http://localhost:5173',
      'http://localhost:5174',
      'http://localhost:3000',
    ]).map(origin => origin.trim()).filter(Boolean);

const isOriginAllowed = (origin) => {
  return !origin || allowedOrigins.includes(origin);
};

const io = socketio(server, {
  cors: {
    origin: (origin, callback) => {
      if (isOriginAllowed(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: ['GET', 'POST'],
    credentials: true,
  }
});

const corsOptions = {
  origin: (origin, callback) => {
    if (isOriginAllowed(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
};
app.use(cors(corsOptions));
app.use((req, res, next) => {
  if (!['GET', 'HEAD', 'OPTIONS'].includes(req.method) &&
      req.headers.origin && !isOriginAllowed(req.headers.origin)) {
    return res.status(403).json({ success: false, error: 'Origin not allowed' });
  }
  next();
});

// 1. Set security HTTP headers
app.use(helmet({
  crossOriginResourcePolicy: false, // Allow images to be served cross-origin
}));

// 2. Limit requests from same API to prevent brute-force attacks
const limiter = rateLimit({
  max: 200, // Limit each IP to 200 requests per 15 minutes
  windowMs: 15 * 60 * 1000, 
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  handler: (req, res) => res.status(429).json({
    success: false,
    error: 'Too many requests. Please try again later.',
  }),
});
app.use('/api', limiter);
app.use('/api/auth', rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  handler: (req, res) => res.status(429).json({
    success: false,
    error: 'Too many authentication attempts. Please try again later.',
  }),
}));

// 3. Data sanitization against NoSQL query injection
app.use(mongoSanitize());

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
const path = require('path');
const fs = require('fs');
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use('/uploads', express.static(uploadsDir));
app.get('/health', (req, res) => {
  const ready = mongoose.connection.readyState === 1;
  res.status(ready ? 200 : 503).json({
    status: ready ? 'ok' : 'unavailable',
    database: ready ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString(),
  });
});

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/crops', require('./routes/cropRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/problems', require('./routes/problemRoutes'));
app.use('/api/solutions', require('./routes/solutionRoutes'));
app.use('/api/payments', require('./routes/paymentRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/messages', require('./routes/messageRoutes'));
app.use('/api/ai', require('./routes/aiRoutes'));
app.use('/api/representative', require('./routes/representativeRoutes'));

// Socket.io Integration
socketHandler(io);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, error: 'Route not found' });
});
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const startServer = async (port) => {
  if (process.env.NODE_ENV === 'production') {
    if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
      throw new Error('A JWT_SECRET of at least 32 characters is required in production');
    }
    if (process.env.PAYMENT_MODE !== 'LIVE') {
      throw new Error('PAYMENT_MODE must be LIVE in production');
    }
    if (!process.env.CHAPA_SECRET_KEY) {
      throw new Error('CHAPA_SECRET_KEY is required for live production payments');
    }
    if (!process.env.FRONTEND_URL || !allowedOrigins.includes(process.env.FRONTEND_URL)) {
      throw new Error('FRONTEND_URL must also be included in ALLOWED_ORIGINS in production');
    }
    if (!process.env.CLOUDINARY_CLOUD_NAME ||
        !process.env.CLOUDINARY_API_KEY ||
        !process.env.CLOUDINARY_API_SECRET) {
      throw new Error('Cloudinary credentials are required for persistent production uploads');
    }
  }

  await connectDB();
  return new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(port, () => {
      server.removeListener('error', reject);
      console.log(`Server listening on port ${port} (${process.env.NODE_ENV || 'development'})`);
      resolve(server);
    });
  });
};

if (require.main === module) {
  startServer(Number(PORT)).catch(error => {
    console.error('Server startup failed:', error.message);
    process.exitCode = 1;
  });
}

module.exports = { app, server, startServer, isOriginAllowed };
