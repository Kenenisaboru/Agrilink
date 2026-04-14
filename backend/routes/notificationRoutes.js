const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead
} = require('../controllers/notificationController');

/**
 * Notification Routes
 * 
 * GET    /api/notifications               → Get all notifications for logged-in user
 * GET    /api/notifications/unread-count   → Get unread count only (lightweight)
 * PUT    /api/notifications/read-all       → Mark all notifications as read
 * PUT    /api/notifications/:id/read       → Mark a single notification as read
 */

router.get('/', protect, getNotifications);
router.get('/unread-count', protect, getUnreadCount);
router.put('/read-all', protect, markAllAsRead);
router.put('/:id/read', protect, markAsRead);

module.exports = router;
