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

    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
    });
  });
};

module.exports = socketHandler;
