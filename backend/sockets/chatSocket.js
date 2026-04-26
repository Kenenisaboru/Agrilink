const Message = require('../models/Message');

const socketHandler = (io) => {
  io.on('connection', (socket) => {
    console.log('New WebSocket Connection:', socket.id);

    socket.on('join', (userId) => {
      socket.join(userId);
      console.log(`User ${userId} joined their private room.`);
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

    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
    });
  });
};

module.exports = socketHandler;
