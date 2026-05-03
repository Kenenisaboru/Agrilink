const Message = require('../models/Message');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const socketHandler = (io) => {
  // Authenticate WebSocket connections with JWT
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token || socket.handshake.query.token;
      if (!token) {
        return next(new Error('Authentication required'));
      }
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('-password');
      if (!user) {
        return next(new Error('User not found'));
      }
      socket.userId = user._id.toString();
      socket.userName = user.name;
      next();
    } catch (err) {
      console.error('Socket auth error:', err.message);
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`WebSocket Connected: ${socket.userName} (${socket.userId})`);

    // Auto-join user's private room on connection
    socket.join(socket.userId);

    socket.on('join', (userId) => {
      // Only allow users to join their own room
      if (userId === socket.userId) {
        socket.join(userId);
      }
    });

    socket.on('sendMessage', async ({ senderId, receiverId, content }) => {
      try {
        // Save message to database
        const newMessage = await Message.create({
          sender: senderId,
          receiver: receiverId,
          content,
        });

        const populatedMessage = await newMessage.populate('sender', 'name role');

        // Emit to the receiver's private room
        io.to(receiverId).emit('message', populatedMessage);
        
        // Also emit back to sender for confirmation/sync if needed
        socket.emit('messageSent', populatedMessage);
      } catch (error) {
        console.error('Socket sendMessage error:', error);
      }
    });

    socket.on('typing', ({ senderId, receiverId }) => {
      io.to(receiverId).emit('userTyping', { senderId });
    });

    // ── LIVE GPS TRACKING ──────────────────────────────────────────────
    // Farmer/Driver sends their location to the specific order tracking room
    socket.on('joinTrackingRoom', (orderId) => {
      socket.join(`tracking_${orderId}`);
      console.log(`User joined tracking room: tracking_${orderId}`);
    });

    socket.on('shareLocation', ({ orderId, lat, lng }) => {
      // Broadcast the coordinates to anyone watching this order
      io.to(`tracking_${orderId}`).emit('locationUpdate', { lat, lng });
    });

    // ── VOICE COMMUNICATION (WebRTC) ───────────────────────────────────
    socket.on('initiate-call', (data) => {
      const { targetUserId, callType, offer, callerId } = data;
      console.log(`Call initiated: ${callerId} -> ${targetUserId} (${callType})`);
      io.to(targetUserId).emit('incoming-call', {
        callerId,
        callType,
        offer,
        callId: `call_${Date.now()}`
      });
    });

    socket.on('accept-call', (data) => {
      const { targetUserId, answer, callId } = data;
      console.log(`Call accepted by ${socket.id}, notifying ${targetUserId}`);
      io.to(targetUserId).emit('call-accepted', { answer, callId });
    });

    socket.on('reject-call', (data) => {
      const { targetUserId, reason, callId } = data;
      io.to(targetUserId).emit('call-rejected', { reason, callId });
    });

    socket.on('ice-candidate', (data) => {
      const { targetUserId, candidate } = data;
      io.to(targetUserId).emit('ice-candidate', { candidate });
    });

    socket.on('offer', (data) => {
      const { targetUserId, offer } = data;
      io.to(targetUserId).emit('offer', { offer });
    });

    socket.on('answer', (data) => {
      const { targetUserId, answer } = data;
      io.to(targetUserId).emit('answer', { answer });
    });

    socket.on('end-call', (data) => {
      const { targetUserId, reason, callId } = data;
      io.to(targetUserId).emit('call-ended', { reason, callId });
    });

    socket.on('voice-activity', (data) => {
      const { targetUserId, isActive } = data;
      io.to(targetUserId).emit('voice-activity', { isActive });
    });

    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
    });
  });
};

module.exports = socketHandler;
