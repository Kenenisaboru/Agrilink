const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  buyer: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User',
  },
  crop: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Crop',
  },
  quantity: {
    type: Number,
    required: [true, 'Please specify order quantity'],
  },
  totalPrice: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ['Pending', 'Paid', 'Completed', 'Cancelled'],
    default: 'Pending',
  },
  deliveryAddress: {
    type: String,
    required: [true, 'Please provide a delivery address'],
  }
}, {
  timestamps: true,
});

module.exports = mongoose.model('Order', orderSchema);
