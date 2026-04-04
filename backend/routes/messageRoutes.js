const express = require('express');
const router = express.Router();
const { sendMessage, getConversation, getConversations } = require('../controllers/messageController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, sendMessage);
router.get('/conversations/list', protect, getConversations);
router.get('/:otherUserId', protect, getConversation);

module.exports = router;
