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
    ref: 'Order',
  },
  amount: {
    type: Number,
    required: true,
  },
  currency: {
    type: String,
    default: 'ETB',
  },
  paymentMethod: {
    type: String,
    enum: [
      'Telebirr',
      'MPesa',
      'CBE',
      'NigdBank',
      'AwashBank',
      'DashenBank',
      'AbyssiniaBank',
      'CooperativeBank',
      'WegagenBank',
      'HibretBank',
      'ZemenBank',
      'Cash'
    ],
    required: true,
    default: 'Telebirr',
  },
  phoneNumber: {
    type: String,
  },
  accountNumber: {
    type: String,
  },
  // Receipt / confirmation reference from the payment provider
  transactionReference: {
    type: String,
  },
  // Unique receipt number for this transaction
  receiptNumber: {
    type: String,
    unique: true,
    sparse: true,
  },
  status: {
    type: String,
    enum: ['Pending', 'Processing', 'Success', 'Failed', 'Refunded'],
    default: 'Pending',
  },
  failureReason: {
    type: String,
  },
  // Balance snapshot before and after transaction
  balanceBefore: {
    type: Number,
  },
  balanceAfter: {
    type: Number,
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
  }
}, {
  timestamps: true,
});

// Generate unique receipt number before saving
paymentSchema.pre('save', function(next) {
  if (!this.receiptNumber) {
    const methodCode = {
      Telebirr: 'TLB',
      MPesa: 'MPE',
      CBE: 'CBE',
      NigdBank: 'NGD',
      AwashBank: 'AWB',
      DashenBank: 'DSH',
      AbyssiniaBank: 'ABY',
      CooperativeBank: 'COP',
      WegagenBank: 'WGG',
      HibretBank: 'HBT',
      ZemenBank: 'ZMN',
      Cash: 'CSH',
    };
    const prefix = methodCode[this.paymentMethod] || 'AGR';
    this.receiptNumber = `${prefix}${Date.now()}${Math.floor(Math.random() * 1000)}`;
  }
  next();
});

module.exports = mongoose.model('Payment', paymentSchema);
