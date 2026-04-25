const express = require('express');
const http = require('http');
const socketio = require('socket.io');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/db');
const socketHandler = require('./sockets/chatSocket');

dotenv.config();
connectDB();

const app = express();
const server = http.createServer(app);

// CORS configuration
const allowedOrigins = process.env.ALLOWED_ORIGINS 
  ? process.env.ALLOWED_ORIGINS.split(',')    : [
      'http://localhost:5173',
      'http://localhost:5174',
      'http://localhost:3000',
    ];

// Helper to check if origin is allowed
const isOriginAllowed = (origin) => {
  if (!origin) return true; 
  if (allowedOrigins.includes(origin)) return true;
  if (origin.endsWith('.vercel.app')) return true;
  
  // Allow local network IPs in development
  if (process.env.NODE_ENV !== 'production') {
    if (origin.startsWith('http://192.168.') || origin.startsWith('http://10.') || origin.startsWith('http://172.')) {
      return true;
    }
  }
  return false;
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

// 1. Set security HTTP headers
app.use(helmet({
  crossOriginResourcePolicy: false, // Allow images to be served cross-origin
}));

// 2. Limit requests from same API to prevent brute-force attacks
const limiter = rateLimit({
  max: 200, // Limit each IP to 200 requests per 15 minutes
  windowMs: 15 * 60 * 1000, 
  message: 'Too many requests from this IP, please try again in 15 minutes!'
});
app.use('/api', limiter);

// 3. Data sanitization against NoSQL query injection
app.use(mongoSanitize());

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
const path = require('path');
const fs = require('fs');
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log('📁 Created uploads directory');
}
app.use('/uploads', express.static(uploadsDir));
app.use('/uploads', express.static('uploads')); // Fallback for root level uploads folder
// Health check
app.get('/health', (req, res) => res.json({ status: 'OK', timestamp: new Date() }));

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

// Socket.io Integration
socketHandler(io);

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ message: err.message || 'Internal server error' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: `Route ${req.originalUrl} not found` });
});

const PORT = process.env.PORT || 5000;

const startServer = (port) => {
  server.listen(port, () => {
    console.log(`🚀 Server running in ${process.env.NODE_ENV || 'development'} mode on port ${port}`);
  }).on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.log(`⚠️ Port ${port} is busy, trying port ${port + 1}...`);
      startServer(port + 1);
    } else {
      console.error('Server error:', err);
    }
  });
};

startServer(Number(PORT));
