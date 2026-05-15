const Message = require('../models/Message');
const Order = require('../models/Order');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const {
  assertSenderMatchesSocket,
  canJoinTrackingRoom,
  canShareLocation,
} = require('../utils/socketGuards');

const socketHandler = (io) => {
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
      socket.userRole = user.role;
      next();
    } catch (err) {
      console.error('Socket auth error:', err.message);
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`WebSocket Connected: ${socket.userName} (${socket.userId})`);

    socket.join(socket.userId);

    socket.on('join', (userId) => {
      if (userId === socket.userId) {
        socket.join(userId);
      }
    });

    socket.on('sendMessage', async ({ senderId, receiverId, content }) => {
      try {
        const senderCheck = assertSenderMatchesSocket(socket.userId, senderId);
        if (!senderCheck.ok) {
          socket.emit('error', { message: 'Unauthorized: invalid sender' });
          return;
        }

        if (!receiverId || !content?.trim()) {
          socket.emit('error', { message: 'Receiver and message content are required' });
          return;
        }

        const receiver = await User.findById(receiverId).select('_id');
        if (!receiver) {
          socket.emit('error', { message: 'Receiver not found' });
          return;
        }

        const newMessage = await Message.create({
          sender: socket.userId,
          receiver: receiverId,
          content: content.trim(),
        });

        const populatedMessage = await newMessage.populate('sender', 'name role');

        io.to(receiverId).emit('message', populatedMessage);
        socket.emit('messageSent', populatedMessage);
      } catch (error) {
        console.error('Socket sendMessage error:', error);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    socket.on('typing', ({ senderId, receiverId }) => {
      const senderCheck = assertSenderMatchesSocket(socket.userId, senderId);
      if (!senderCheck.ok || !receiverId) return;
      io.to(receiverId).emit('userTyping', { senderId: socket.userId });
    });

    socket.on('joinTrackingRoom', async (orderId) => {
      try {
        if (!orderId) return;

        const order = await Order.findById(orderId).select('buyer farmer');
        if (!canJoinTrackingRoom(order, socket.userId, socket.userRole)) {
          socket.emit('error', { message: 'Not authorized for this tracking room' });
          return;
        }

        socket.join(`tracking_${orderId}`);
        console.log(`User ${socket.userId} joined tracking room: tracking_${orderId}`);
      } catch (error) {
        console.error('joinTrackingRoom error:', error);
        socket.emit('error', { message: 'Failed to join tracking room' });
      }
    });

    socket.on('shareLocation', async ({ orderId, lat, lng }) => {
      try {
        if (!orderId || lat == null || lng == null) return;

        const order = await Order.findById(orderId).select('farmer');
        if (!canShareLocation(order, socket.userId, socket.userRole)) {
          socket.emit('error', { message: 'Only the farmer can share location for this order' });
          return;
        }

        io.to(`tracking_${orderId}`).emit('locationUpdate', { lat, lng });
      } catch (error) {
        console.error('shareLocation error:', error);
      }
    });

    socket.on('initiate-call', (data) => {
      const { targetUserId, callType, offer, callerId } = data;
      if (callerId !== socket.userId) return;
      console.log(`Call initiated: ${callerId} -> ${targetUserId} (${callType})`);
      io.to(targetUserId).emit('incoming-call', {
        callerId: socket.userId,
        callType,
        offer,
        callId: `call_${Date.now()}`,
      });
    });

    socket.on('accept-call', (data) => {
      const { targetUserId, answer, callId } = data;
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
