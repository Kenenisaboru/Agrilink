const Message = require('../models/Message');
const User = require('../models/User');

// @desc    Send a message
// @route   POST /api/messages
// @access  Private
const sendMessage = async (req, res) => {
  try {
    const { receiverId, content } = req.body;

    const receiver = await User.findById(receiverId);
    if (!receiver) {
      return res.status(404).json({ message: 'Receiver not found' });
    }

    const message = new Message({
      sender: req.user._id,
      receiver: receiverId,
      content
    });

    const savedMessage = await message.save();
    res.status(201).json(savedMessage);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get conversation between two users
// @route   GET /api/messages/:otherUserId
// @access  Private
const getConversation = async (req, res) => {
  try {
    const currentUserId = req.user._id;
    const { otherUserId } = req.params;

    const messages = await Message.find({
      $or: [
        { sender: currentUserId, receiver: otherUserId },
        { sender: otherUserId, receiver: currentUserId }
      ]
    }).sort('createdAt');

    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all unique users current user has chatted with
// @route   GET /api/messages/conversations/list
// @access  Private
const getConversations = async (req, res) => {
  try {
    const userId = req.user._id;

    // Find unique users from both sender and receiver fields
    const sentTo = await Message.find({ sender: userId }).distinct('receiver');
    const receivedFrom = await Message.find({ receiver: userId }).distinct('sender');

    const uniqueUserIds = [...new Set([...sentTo, ...receivedFrom])];

    const users = await User.find({ _id: { $in: uniqueUserIds } }).select('name role');

    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  sendMessage,
  getConversation,
  getConversations
};
