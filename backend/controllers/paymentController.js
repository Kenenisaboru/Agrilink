const Payment = require('../models/Payment');
const Order = require('../models/Order');
const User = require('../models/User');
const mongoose = require('mongoose');

// Ethiopian payment method configurations
const PAYMENT_METHODS = {
  Telebirr: { name: 'Telebirr (Ethio Telecom)', prefix: 'TLB', requiresPhone: true },
  MPesa: { name: 'M-Pesa Ethiopia (Safaricom)', prefix: 'MPE', requiresPhone: true },
  CBE: { name: 'Commercial Bank of Ethiopia', prefix: 'CBE', requiresAccount: true },
  Cash: { name: 'Cash on Delivery', prefix: 'CSH', requiresPhone: false },
};

// @desc    Get available payment methods
// @route   GET /api/payments/methods
// @access  Public
const getPaymentMethods = async (req, res) => {
  res.json(PAYMENT_METHODS);
};

/**
 * SIMULATION HELPER: Send notification to farmer
 * In a real system, this would use FCM, Socket.io, or Email/SMS API.
 */
const simulateFarmerNotification = async (orderId) => {
  try {
    const order = await Order.findById(orderId).populate('orderItems.crop');
    if (!order) return;

    // In a real app, you'd find the owner of each crop
    console.log(`[NOTIFICATION SIMULATION] order ${orderId} marked as PAID.`);
    console.log(`[SMS SIMULATION] Sending SMS to Rural Farmers in East Hararghe: "Someone bought your crops! Check Agrilink."`);
  } catch (err) {
    console.error('Notification simulation failed', err);
  }
};

// @desc    Process a payment request (Real or Demo)
// @route   POST /api/payments/request
// @access  Private
const requestPayment = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { orderId, amount, paymentMethod, phoneNumber, accountNumber } = req.body;
    const mode = process.env.PAYMENT_MODE || 'DEMO'; // Toggle: 'LIVE' or 'DEMO'

    // --- 1. Validation ---
    if (!orderId) return res.status(400).json({ message: 'Order ID is required' });
    if (!amount || amount <= 0) return res.status(400).json({ message: 'Invalid payment amount' });

    // --- 2. Database Checks ---
    const order = await Order.findById(orderId).session(session);
    if (!order) {
      await session.abortTransaction();
      return res.status(404).json({ message: 'Order not found' });
    }
    
    const buyer = await User.findById(req.user._id).session(session);
    if (!buyer) {
      await session.abortTransaction();
      return res.status(404).json({ message: 'User account not found' });
    }

    // --- 3. Create Transaction Reference ---
    const tx_ref = `AGR-${mode}-${Date.now()}-${Math.floor(Math.random() * 1000000)}`;

    // Create a pending payment record in our DB
    const payment = new Payment({
      user: req.user._id,
      order: orderId,
      amount,
      paymentMethod,
      phoneNumber: phoneNumber || null,
      accountNumber: accountNumber || null,
      transactionReference: tx_ref,
      status: 'Pending',
      metadata: { mode }
    });
    await payment.save({ session });
    await session.commitTransaction();

    // --- 4. Handle DEMO vs LIVE ---

    if (mode === 'DEMO') {
      // Simulate Chapa Initialization for Development
      console.log(`[DEMO MODE] Initializing fake payment for ref: ${tx_ref}`);
      
      return res.status(200).json({
        message: 'DEMO Payment Initialized',
        checkoutUrl: `http://localhost:5173/payment/verify/${tx_ref}?demo=true`,
        paymentId: payment._id,
        mode: 'DEMO'
      });
    }

    // --- LIVE MODE: Call Real Chapa API ---
    const CHAPA_URL = 'https://api.chapa.co/v1/transaction/initialize';
    const CHAPA_KEY = process.env.CHAPA_SECRET_KEY;

    if (!CHAPA_KEY) {
      return res.status(500).json({ message: 'Server Config Error: Chapa Key missing' });
    }

    const payload = {
      amount: amount.toString(),
      currency: "ETB",
      email: buyer.email,
      first_name: buyer.name.split(' ')[0] || 'Buyer',
      last_name: buyer.name.split(' ')[1] || 'Agrilink',
      tx_ref: tx_ref,
      return_url: `http://localhost:5173/payment/verify/${tx_ref}`,
      customization: { title: "Agrilink Payment", description: `Order ${orderId}` }
    };

    const response = await fetch(CHAPA_URL, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${CHAPA_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    if (data.status === 'success') {
      res.status(200).json({
        message: 'Payment initialized',
        checkoutUrl: data.data.checkout_url,
        paymentId: payment._id,
        mode: 'LIVE'
      });
    } else {
      payment.status = 'Failed';
      await payment.save();
      res.status(400).json({ message: data.message || 'Chapa init failed' });
    }

  } catch (error) {
    if (session.inTransaction()) await session.abortTransaction();
    console.error('Payment request error:', error);
    res.status(500).json({ message: 'Server error: ' + error.message });
  } finally {
    session.endSession();
  }
};

// @desc    Verify payment (Real or Demo)
// @route   GET /api/payments/verify/:tx_ref
// @access  Private
const verifyPayment = async (req, res) => {
  try {
    const { tx_ref } = req.params;
    const isDemoQuery = req.query.demo === 'true';
    
    const payment = await Payment.findOne({ transactionReference: tx_ref });
    if (!payment) return res.status(404).json({ message: 'Transaction record not found' });

    // Handle Demo Verification
    if (isDemoQuery || tx_ref.includes('-DEMO-')) {
      console.log(`[DEMO MODE] Verifying fake payment: ${tx_ref}`);
      
      // Simulate delay (beginner-friendly learning: use setTimeout or delay promise)
      await new Promise(resolve => setTimeout(resolve, 1500));

      payment.status = 'Success';
      payment.metadata = { ...payment.metadata, verifiedAt: new Date(), gateway: 'MOCK_CHAPA' };
      await payment.save();

      // Update Order Status
      const order = await Order.findById(payment.order);
      if (order) {
        order.status = 'Paid';
        await order.save();
      }

      // Simulate Farmer Notification
      await simulateFarmerNotification(payment.order);

      return res.status(200).json({ success: true, message: 'DEMO Payment Verified', payment });
    }

    // --- LIVE MODE: Real Chapa Verification ---
    const CHAPA_KEY = process.env.CHAPA_SECRET_KEY;
    const response = await fetch(`https://api.chapa.co/v1/transaction/verify/${tx_ref}`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${CHAPA_KEY}` }
    });

    const data = await response.json();

    if (data.status === 'success' && data.data.status === 'success') {
      payment.status = 'Success';
      payment.metadata = data.data;
      await payment.save();

      const order = await Order.findById(payment.order);
      if (order && order.status !== 'Paid') {
        order.status = 'Paid';
        await order.save();
        await simulateFarmerNotification(payment.order);
      }
      
      return res.status(200).json({ success: true, message: 'Payment verified', payment });
    } else {
      payment.status = 'Failed';
      await payment.save();
      return res.status(400).json({ success: false, message: 'Verification failed' });
    }
  } catch (error) {
    console.error('Verification error:', error);
    res.status(500).json({ success: false, message: error.message });
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

module.exports = {
  getPaymentMethods,
  requestPayment,
  verifyPayment,
  getPaymentHistory,
  getAllPayments,
  getPaymentById,
};
