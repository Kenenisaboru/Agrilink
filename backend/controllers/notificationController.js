const Notification = require('../models/Notification');

/**
 * ===========================================================
 *  NOTIFICATION CONTROLLER
 * ===========================================================
 * 
 *  Manages the in-app notification system.
 *  Farmers see notifications when buyers purchase their crops.
 *  Buyers see notifications when farmers ship their orders.
 * 
 *  For beginners: Think of this like the notification bell 🔔
 *  you see on Instagram or YouTube — it shows you new activity.
 * ===========================================================
 */


// @desc    Get all notifications for the logged-in user
// @route   GET /api/notifications
// @access  Private
exports.getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ recipient: req.user._id })
      .populate('order', 'totalPrice status orderItems')
      .sort('-createdAt')
      .limit(50);

    // Also return the count of unread notifications
    const unreadCount = await Notification.countDocuments({
      recipient: req.user._id,
      isRead: false,
    });

    res.json({ notifications, unreadCount });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// @desc    Get ONLY unread notification count (lightweight check)
// @route   GET /api/notifications/unread-count
// @access  Private
exports.getUnreadCount = async (req, res) => {
  try {
    const count = await Notification.countDocuments({
      recipient: req.user._id,
      isRead: false,
    });

    res.json({ unreadCount: count });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// @desc    Mark a single notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
exports.markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    // Only the recipient can mark their notifications as read
    if (notification.recipient.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    notification.isRead = true;
    await notification.save();

    res.json({ message: 'Notification marked as read', notification });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// @desc    Mark ALL notifications as read for the logged-in user
// @route   PUT /api/notifications/read-all
// @access  Private
exports.markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { recipient: req.user._id, isRead: false },
      { $set: { isRead: true } }
    );

    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
