const express = require('express');
const http = require('http');
const socketio = require('socket.io');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');

dotenv.config();
connectDB();

const app = express();
const server = http.createServer(app);
const io = socketio(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/crops', require('./routes/cropRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/problems', require('./routes/problemRoutes'));
app.use('/api/solutions', require('./routes/solutionRoutes'));
app.use('/api/payments', require('./routes/paymentRoutes'));
app.use('/api/messages', require('./routes/messageRoutes'));

// Socket.io Integration
io.on('connection', (socket) => {
  console.log('New WebSocket Connection...');

  socket.on('join', ({ userId }) => {
    socket.join(userId);
    console.log(`User ${userId} joined their private room.`);
  });

  socket.on('sendMessage', ({ senderId, receiverId, content }) => {
    // Emit to the receiver's private room
    io.to(receiverId).emit('message', {
      sender: senderId,
      content,
      createdAt: new Date()
    });
  });

  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
