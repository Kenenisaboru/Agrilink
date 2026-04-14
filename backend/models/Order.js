const mongoose = require('mongoose');

/**
 * Order Schema - Represents a complete marketplace transaction
 * 
 * Flow: Buyer selects crops → Pays via Chapa → Order created → Farmer notified
 * 
 * The `farmer` field links to the crop seller so they can view incoming orders.
 * The `transactionId` links back to the Chapa payment reference.
 */
const orderSchema = new mongoose.Schema({
  // The buyer who placed this order
  buyer: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User',
  },
  // The farmer (seller) whose crops were purchased
  farmer: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User',
  },
  // List of items in this order
  orderItems: [
    {
      name: { type: String, required: true },
      quantity: { type: Number, required: true },
      image: { type: String },
      price: { type: Number, required: true },
      unit: { type: String, default: 'kg' },
      crop: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Crop',
      },
    },
  ],
  // Total price in ETB (Ethiopian Birr)
  totalPrice: {
    type: Number,
    required: true,
    default: 0.0,
  },
  // Order lifecycle status
  status: {
    type: String,
    enum: ['Pending', 'Paid', 'Processing', 'Shipped', 'Delivered', 'Completed', 'Cancelled'],
    default: 'Pending',
  },
  // Payment tracking
  paymentStatus: {
    type: String,
    enum: ['Unpaid', 'Paid', 'Refunded'],
    default: 'Unpaid',
  },
  paymentMethod: {
    type: String,
    default: 'Telebirr',
  },
  // Chapa transaction reference (links to Payment model)
  transactionId: {
    type: String,
  },
  // Where to deliver the crops
  deliveryAddress: {
    type: String,
    required: [true, 'Please provide a delivery address'],
  },
  // Buyer contact info snapshot (so farmer can reach them)
  buyerPhone: {
    type: String,
  },
  buyerEmail: {
    type: String,
  },
}, {
  timestamps: true,
});

// Index for faster farmer queries
orderSchema.index({ farmer: 1, createdAt: -1 });
// Index for faster buyer queries
orderSchema.index({ buyer: 1, createdAt: -1 });

module.exports = mongoose.model('Order', orderSchema);
