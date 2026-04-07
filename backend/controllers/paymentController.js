const Payment = require('../models/Payment');
const Order = require('../models/Order');
const User = require('../models/User');
const mongoose = require('mongoose');

// Ethiopian payment method configurations
const PAYMENT_METHODS = {
  Telebirr: { name: 'Telebirr (Ethio Telecom)', prefix: 'TLB', requiresPhone: true },
  MPesa: { name: 'M-Pesa Ethiopia (Safaricom)', prefix: 'MPE', requiresPhone: true },
  CBE: { name: 'Commercial Bank of Ethiopia', prefix: 'CBE', requiresAccount: true },
  NigdBank: { name: 'Nigd Bank', prefix: 'NGD', requiresAccount: true },
  AwashBank: { name: 'Awash Bank', prefix: 'AWB', requiresAccount: true },
  DashenBank: { name: 'Dashen Bank', prefix: 'DSH', requiresAccount: true },
  AbyssiniaBank: { name: 'Bank of Abyssinia', prefix: 'ABY', requiresAccount: true },
  CooperativeBank: { name: 'Cooperative Bank of Oromia', prefix: 'COP', requiresAccount: true },
  WegagenBank: { name: 'Wegagen Bank', prefix: 'WGG', requiresAccount: true },
  HibretBank: { name: 'Hibret Bank (United Bank)', prefix: 'HBT', requiresAccount: true },
  ZemenBank: { name: 'Zemen Bank', prefix: 'ZMN', requiresAccount: true },
  Cash: { name: 'Cash on Delivery', prefix: 'CSH', requiresPhone: false },
};

// @desc    Get available payment methods
// @route   GET /api/payments/methods
// @access  Public
const getPaymentMethods = async (req, res) => {
  res.json(PAYMENT_METHODS);
};

// @desc    Process a payment request
// @route   POST /api/payments/request
// @access  Private
const requestPayment = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { orderId, amount, paymentMethod, phoneNumber, accountNumber } = req.body;

    // --- Validation ---
    if (!orderId) return res.status(400).json({ message: 'Order ID is required' });
    if (!amount || amount <= 0) return res.status(400).json({ message: 'Invalid payment amount' });
    if (!paymentMethod || !PAYMENT_METHODS[paymentMethod]) {
      return res.status(400).json({ message: 'Invalid or unsupported payment method' });
    }

    const methodConfig = PAYMENT_METHODS[paymentMethod];
    if (methodConfig.requiresPhone && !phoneNumber) {
      return res.status(400).json({ message: `Phone number is required for ${methodConfig.name}` });
    }
    if (methodConfig.requiresAccount && !accountNumber && !phoneNumber) {
      return res.status(400).json({ message: `Account number is required for ${methodConfig.name}` });
    }

    // --- Find Order ---
    const order = await Order.findById(orderId).session(session);
    if (!order) {
      await session.abortTransaction();
      return res.status(404).json({ message: 'Order not found' });
    }
    if (order.status === 'Paid') {
      await session.abortTransaction();
      return res.status(400).json({ message: 'This order has already been paid' });
    }
    if (Math.abs(order.totalPrice - amount) > 0.01) {
      await session.abortTransaction();
      return res.status(400).json({ message: `Payment amount (${amount} ETB) does not match order total (${order.totalPrice} ETB)` });
    }

    // --- Find Buyer ---
    const buyer = await User.findById(req.user._id).session(session);
    if (!buyer) {
      await session.abortTransaction();
      return res.status(404).json({ message: 'User account not found' });
    }

    const balanceBefore = buyer.balance || 0;

    // --- Simulate Payment Gateway ---
    // In production, this would call Telebirr/CBE/MPesa APIs
    // For now we simulate a successful transaction
    const simulationResult = await simulatePaymentGateway(paymentMethod, phoneNumber || accountNumber, amount);

    if (!simulationResult.success) {
      // Create failed payment record
      const failedPayment = new Payment({
        user: req.user._id,
        order: orderId,
        amount,
        paymentMethod,
        phoneNumber,
        accountNumber,
        status: 'Failed',
        failureReason: simulationResult.reason,
        balanceBefore,
        balanceAfter: balanceBefore,
        metadata: simulationResult.metadata,
      });
      await failedPayment.save({ session });
      await session.commitTransaction();
      return res.status(402).json({
        message: simulationResult.reason,
        payment: failedPayment,
      });
    }

    // --- Deduct Balance (if using wallet) ---
    // Note: for external payments (Telebirr etc.), balance deduction is tracked as a log
    // The actual deduction happens on the payment provider's end
    // We record balanceBefore/After for audit trail

    // --- Update Order Status ---
    order.status = 'Paid';
    await order.save({ session });

    // --- Create Payment Record ---
    const payment = new Payment({
      user: req.user._id,
      order: orderId,
      amount,
      paymentMethod,
      phoneNumber: phoneNumber || null,
      accountNumber: accountNumber || null,
      transactionReference: simulationResult.transactionReference,
      status: 'Success',
      balanceBefore,
      balanceAfter: balanceBefore, // External payment: balance unchanged in our system
      metadata: simulationResult.metadata,
    });
    await payment.save({ session });

    await session.commitTransaction();

    res.status(200).json({
      message: `Payment of ${amount} ETB via ${methodConfig.name} was successful!`,
      payment: {
        _id: payment._id,
        receiptNumber: payment.receiptNumber,
        amount: payment.amount,
        paymentMethod: payment.paymentMethod,
        status: payment.status,
        transactionReference: payment.transactionReference,
        createdAt: payment.createdAt,
      },
      order: {
        _id: order._id,
        status: order.status,
        totalPrice: order.totalPrice,
      }
    });

  } catch (error) {
    await session.abortTransaction();
    console.error('Payment error:', error);
    res.status(500).json({ message: 'Payment processing failed: ' + error.message });
  } finally {
    session.endSession();
  }
};

// @desc    Get payment history for current user
// @route   GET /api/payments/history
// @access  Private
const getPaymentHistory = async (req, res) => {
  try {
    const payments = await Payment.find({ user: req.user._id })
      .populate('order', 'totalPrice status orderItems deliveryAddress')
      .sort({ createdAt: -1 })
      .limit(50);

    res.json(payments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all payments (Admin)
// @route   GET /api/payments/admin/all
// @access  Private/Admin
const getAllPayments = async (req, res) => {
  try {
    const { status, method, startDate, endDate, page = 1, limit = 20 } = req.query;

    const filter = {};
    if (status) filter.status = status;
    if (method) filter.paymentMethod = method;
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    const skip = (page - 1) * limit;
    const [payments, total] = await Promise.all([
      Payment.find(filter)
        .populate('user', 'name email phone')
        .populate('order', 'totalPrice status')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Payment.countDocuments(filter),
    ]);

    // Aggregate stats
    const stats = await Payment.aggregate([
      { $match: { status: 'Success' } },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$amount' },
          totalTransactions: { $count: {} },
        }
      }
    ]);

    const methodStats = await Payment.aggregate([
      { $match: { status: 'Success' } },
      {
        $group: {
          _id: '$paymentMethod',
          count: { $sum: 1 },
          total: { $sum: '$amount' },
        }
      },
      { $sort: { total: -1 } }
    ]);

    res.json({
      payments,
      pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / limit) },
      stats: stats[0] || { totalRevenue: 0, totalTransactions: 0 },
      methodStats,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get a single payment by ID
// @route   GET /api/payments/:id
// @access  Private
const getPaymentById = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id)
      .populate('user', 'name email phone')
      .populate('order');

    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    // Users can only see their own payments; admins can see all
    if (payment.user._id.toString() !== req.user._id.toString() && req.user.role !== 'Admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    res.json(payment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// =============================================================
// INTERNAL HELPER: Simulate Ethiopian Payment Gateway
// In production, replace this with real API calls:
// - Telebirr: https://developer.ethiotelecom.et
// - CBE Birr: CBE API integration 
// - Dashen Amole: Amole API
// =============================================================
const simulatePaymentGateway = async (method, identifier, amount) => {
  // Simulate network delay (200-800ms)
  await new Promise(resolve => setTimeout(resolve, Math.random() * 600 + 200));

  // Simulate 95% success rate for demo
  const isSuccess = Math.random() > 0.05;

  if (!isSuccess) {
    return {
      success: false,
      reason: 'Transaction declined by payment provider. Please check your account balance or try again.',
      metadata: { gateway: method, timestamp: new Date() }
    };
  }

  const methodCode = {
    Telebirr: 'TLB', MPesa: 'MPE', CBE: 'CBE', NigdBank: 'NGD',
    AwashBank: 'AWB', DashenBank: 'DSH', AbyssiniaBank: 'ABY',
    CooperativeBank: 'COP', WegagenBank: 'WGG', HibretBank: 'HBT',
    ZemenBank: 'ZMN', Cash: 'CSH',
  };

  return {
    success: true,
    transactionReference: `${methodCode[method] || 'AGR'}-${Date.now()}-${Math.floor(Math.random() * 99999)}`,
    metadata: {
      gateway: method,
      identifier,
      amount,
      currency: 'ETB',
      timestamp: new Date(),
      gatewayMessage: 'Transaction approved',
    }
  };
};

module.exports = {
  getPaymentMethods,
  requestPayment,
  getPaymentHistory,
  getAllPayments,
  getPaymentById,
};
