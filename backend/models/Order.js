const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  buyer: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User',
  },
  orderItems: [
    {
      name: { type: String, required: true },
      quantity: { type: Number, required: true },
      image: { type: String },
      price: { type: Number, required: true },
      crop: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Crop',
      },
    },
  ],
  totalPrice: {
    type: Number,
    required: true,
    default: 0.0,
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
