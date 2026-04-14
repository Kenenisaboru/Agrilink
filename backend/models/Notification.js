const mongoose = require('mongoose');

/**
 * Notification Schema - In-app notification system
 * 
 * Used to alert farmers when a new order comes in, and buyers
 * when their order status changes.
 * 
 * Types:
 *   - NEW_ORDER:       Farmer receives this when a buyer pays for their crops
 *   - ORDER_SHIPPED:   Buyer receives this when farmer ships
 *   - ORDER_DELIVERED:  Buyer receives this on delivery
 *   - PAYMENT_SUCCESS: Buyer receives this after successful payment
 */
const notificationSchema = new mongoose.Schema({
  // Who receives this notification
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User',
  },
  // What type of notification
  type: {
    type: String,
    enum: ['NEW_ORDER', 'ORDER_SHIPPED', 'ORDER_DELIVERED', 'PAYMENT_SUCCESS', 'GENERAL'],
    required: true,
  },
  // Human-readable notification title
  title: {
    type: String,
    required: true,
  },
  // Detailed message
  message: {
    type: String,
    required: true,
  },
  // Link to the related order (optional)
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
  },
  // Has the user seen this notification?
  isRead: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
});

// Index for quick lookups: "give me all unread notifications for this user"
notificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
