const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User',
  },
  order: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Order', // Link to the order placed
  },
  amount: {
    type: Number,
    required: true,
  },
  mpesaReceiptNumber: {
    type: String,
    // E.g., The transaction ID returned from simulated M-Pesa API
  },
  status: {
    type: String,
    enum: ['Pending', 'Success', 'Failed'],
    default: 'Pending',
  }
}, {
  timestamps: true,
});

module.exports = mongoose.model('Payment', paymentSchema);
