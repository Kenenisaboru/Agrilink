const Payment = require('../models/Payment');
const Order = require('../models/Order');
const User = require('../models/User');
const Notification = require('../models/Notification');
const Crop = require('../models/Crop');
const mongoose = require('mongoose');
const { canVerifyPayment, canRequestPayment, paymentMatchesOrder } = require('../utils/paymentGuards');
const { parsePagination, setPaginationHeaders } = require('../utils/pagination');

/**
 * ===========================================================
 *  PAYMENT CONTROLLER - Chapa Integration (Live + Demo Mode)
 * ===========================================================
 * 
 *  Complete payment flow:
 *  1. Buyer creates order → POST /api/orders
 *  2. Buyer requests payment → POST /api/payments/request
 *  3. Buyer is redirected to Chapa (or mock page in demo)
 *  4. After payment, verify → GET /api/payments/verify/:tx_ref
 *  5. On success: Order marked as Paid → Farmer notified
 * 
 *  DEMO MODE: Set PAYMENT_MODE=DEMO in .env (default)
 *  LIVE MODE: Set PAYMENT_MODE=LIVE and add CHAPA_SECRET_KEY
 * ===========================================================
 */

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
 * NOTIFICATION HELPER: Create in-app + console notification for the farmer
 * 
 * In a real production system, this would also:
 *  - Send an SMS via Africa's Talking or Twilio
 *  - Send a push notification via Firebase Cloud Messaging
 *  - Send an email notification
 * 
 * For now, we store it in MongoDB and log to console.
 */
const notifyFarmer = async (order) => {
  try {
    // Populate the order with buyer and crop details
    const populatedOrder = await Order.findById(order._id)
      .populate('buyer', 'name email phone')
      .populate('farmer', 'name phone')
      .populate('orderItems.crop', 'name');

    if (!populatedOrder) return;

    const buyerName = populatedOrder.buyer?.name || 'A buyer';
    const itemNames = populatedOrder.orderItems.map(i => i.name).join(', ');
    const total = populatedOrder.totalPrice;

    // 1. Store notification in MongoDB (in-app notification)
    await Notification.create({
      recipient: populatedOrder.farmer._id,
      type: 'NEW_ORDER',
      title: '🛒 New Order Received!',
      message: `${buyerName} ordered ${itemNames} for ${total.toLocaleString()} ETB. Check your dashboard to process this order.`,
      order: order._id,
    });

    // 2. Console log simulation (simulates SMS/Push)
    console.log('');
    console.log('╔═══════════════════════════════════════════════╗');
    console.log('║   📱 FARMER NOTIFICATION (Simulated SMS)      ║');
    console.log('╠═══════════════════════════════════════════════╣');
    console.log(`║  To:      ${populatedOrder.farmer?.name || 'Farmer'}`);
    console.log(`║  Phone:   ${populatedOrder.farmer?.phone || 'N/A'}`);
    console.log(`║  From:    ${buyerName}`);
    console.log(`║  Items:   ${itemNames}`);
    console.log(`║  Total:   ${total} ETB`);
    console.log(`║  Address: ${populatedOrder.deliveryAddress}`);
    console.log(`║  Status:  PAID ✅`);
    console.log('╚═══════════════════════════════════════════════╝');
    console.log('');

    // 3. Also create a "payment success" notification for the buyer
    await Notification.create({
      recipient: populatedOrder.buyer._id,
      type: 'PAYMENT_SUCCESS',
      title: '✅ Payment Successful!',
      message: `Your payment of ${total.toLocaleString()} ETB for ${itemNames} has been confirmed. The farmer has been notified and will prepare your order.`,
      order: order._id,
    });

  } catch (err) {
    // Don't let notification errors break the payment flow
    console.error('[NOTIFICATION ERROR]', err.message);
  }
};


// @desc    Process a payment request (Real or Demo)
// @route   POST /api/payments/request
// @access  Private
const requestPayment = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { orderId, paymentMethod, phoneNumber, accountNumber } = req.body;
    const mode = process.env.PAYMENT_MODE || 'DEMO'; // Toggle: 'LIVE' or 'DEMO'

    // --- 1. Validation ---
    if (!orderId) return res.status(400).json({ message: 'Order ID is required' });
    if (!PAYMENT_METHODS[paymentMethod]) {
      return res.status(400).json({ message: 'Unsupported payment method' });
    }
    if (mode === 'DEMO' && process.env.NODE_ENV === 'production') {
      return res.status(503).json({ message: 'Demo payments are disabled in production' });
    }

    // --- 2. Database Checks ---
    const order = await Order.findById(orderId).populate('farmer').session(session);
    if (!order) {
      await session.abortTransaction();
      return res.status(404).json({ message: 'Order not found' });
    }
    if (!canRequestPayment(order, req.user._id, req.user.role)) {
      await session.abortTransaction();
      return res.status(403).json({ message: 'Not authorized to pay for this order' });
    }
    if (!Number.isFinite(order.totalPrice) || order.totalPrice <= 0) {
      await session.abortTransaction();
      return res.status(400).json({ message: 'Order has an invalid total' });
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
      amount: order.totalPrice,
      paymentMethod,
      phoneNumber: phoneNumber || null,
      accountNumber: accountNumber || null,
      transactionReference: tx_ref,
      status: 'Pending',
      metadata: { mode }
    });
    await payment.save({ session });
    await session.commitTransaction();

    // --- 4. Handle DEMO vs LIVE & Calculate Split ---
    
    // FinTech Split Mathematics 🧮
    const farmer = order.farmer;
    const commissionRate = farmer.commissionRate || 0.05; // 5% default
    const agrilinkCut = order.totalPrice * commissionRate;
    const farmerCut = order.totalPrice - agrilinkCut;

    if (mode === 'DEMO') {
      // Simulate Chapa Initialization for Development
      console.log('');
      console.log('╔═══════════════════════════════════════════════╗');
      console.log(`║ 🏦 [DEMO MODE] CHAPA SPLIT PAYMENT ROUTING    ║`);
      console.log('╠═══════════════════════════════════════════════╣');
      console.log(`║ Total Transaction  : ${order.totalPrice} ETB`);
      if (farmer.chapaSubaccountId) {
        console.log(`║ └─➜ Farmer Payout  : ${farmerCut} ETB sent to [${farmer.chapaSubaccountId}]`);
        console.log(`║ └─➜ Agrilink Cut   : ${agrilinkCut} ETB (${commissionRate * 100}% Commission rate)`);
      } else {
        console.log(`║ └─➜ NO SUBACCOUNT  : Agrilink holding ${order.totalPrice} ETB manually.`);
      }
      console.log('╚═══════════════════════════════════════════════╝\n');
      
      const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
      return res.status(200).json({
        message: 'DEMO Payment Initialized',
        checkoutUrl: `${FRONTEND_URL}/payment/verify/${tx_ref}?demo=true`,
        paymentId: payment._id,
        tx_ref: tx_ref,
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
      amount: order.totalPrice.toString(),
      currency: "ETB",
      email: buyer.email,
      first_name: buyer.name.split(' ')[0] || 'Buyer',
      last_name: buyer.name.split(' ')[1] || 'Agrilink',
      tx_ref: tx_ref,
      return_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/payment/verify/${tx_ref}`,
      customization: { title: "Agrilink Payment", description: `Order ${orderId}` }
    };

    // Dynamically inject Chapa Subaccount Split Routing if registered
    if (farmer && farmer.chapaSubaccountId) {
      payload["subaccounts[id]"] = farmer.chapaSubaccountId;
      payload["subaccounts[split_type]"] = "flat";
      payload["subaccounts[split_value]"] = farmerCut.toString();
    }

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
        tx_ref: tx_ref,
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


// @desc    Verify payment (Real or Demo) — Called after Chapa redirect
// @route   GET /api/payments/verify/:tx_ref
// @access  Private (buyer who owns the payment)
const verifyPayment = async (req, res) => {
  try {
    const { tx_ref } = req.params;
    
    const payment = await Payment.findOne({ transactionReference: tx_ref });
    if (!payment) return res.status(404).json({ message: 'Transaction record not found' });

    if (!canVerifyPayment(payment.user, req.user._id, req.user.role)) {
      return res.status(403).json({ message: 'Not authorized to verify this payment' });
    }
    if (!payment.order) {
      return res.status(404).json({ message: 'Order not found for this payment' });
    }

    const orderRecord = await Order.findById(payment.order);
    if (!orderRecord) return res.status(404).json({ message: 'Order not found for this payment' });
    if (!paymentMatchesOrder(payment, orderRecord)) {
      return res.status(409).json({ message: 'Payment does not match its order' });
    }

    // Don't re-verify if already successful
    if (payment.status === 'Success') {
      const order = await Order.findById(payment.order)
        .populate('buyer', 'name email')
        .populate('farmer', 'name')
        .populate('orderItems.crop', 'name');

      return res.status(200).json({
        success: true,
        message: 'Payment already verified',
        payment,
        order,
      });
    }

    // === DEMO MODE VERIFICATION ===
    if (payment.metadata?.mode === 'DEMO') {
      if (process.env.NODE_ENV === 'production') {
        return res.status(503).json({ message: 'Demo payments are disabled in production' });
      }
      console.log(`[DEMO MODE] Verifying fake payment: ${tx_ref}`);
      
      // Simulate processing delay (1.5 seconds)
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Mark payment as successful
      payment.status = 'Success';
      payment.metadata = { ...payment.metadata, verifiedAt: new Date(), gateway: 'MOCK_CHAPA' };
      await payment.save();

      // Update Order Status to "Paid"
      const order = await Order.findById(payment.order);
      if (order) {
        order.status = 'Paid';
        order.paymentStatus = 'Paid';
        order.transactionId = tx_ref;
        await order.save();

        // 🔔 NOTIFY THE FARMER — This is the key step!
        await notifyFarmer(order);
      }

      // Fetch the fully populated order for the response
      const populatedOrder = await Order.findById(payment.order)
        .populate('buyer', 'name email phone')
        .populate('farmer', 'name phone location')
        .populate('orderItems.crop', 'name image');

      return res.status(200).json({
        success: true,
        message: 'DEMO Payment Verified Successfully!',
        payment,
        order: populatedOrder,
      });
    }

    // === LIVE MODE: Real Chapa Verification ===
    const CHAPA_KEY = process.env.CHAPA_SECRET_KEY;
    if (!CHAPA_KEY) {
      return res.status(503).json({ message: 'Payment provider is not configured' });
    }
    const response = await fetch(`https://api.chapa.co/v1/transaction/verify/${encodeURIComponent(tx_ref)}`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${CHAPA_KEY}` }
    });

    const data = await response.json();

    const paidAmount = Number(data.data?.amount);
    const amountMatches = Number.isFinite(paidAmount) &&
      Math.abs(paidAmount - orderRecord.totalPrice) < 0.01 &&
      (!data.data?.currency || data.data.currency === 'ETB');

    if (data.status === 'success' && data.data?.status === 'success' && amountMatches) {
      payment.status = 'Success';
      payment.metadata = data.data;
      await payment.save();

      const order = await Order.findById(payment.order);
      if (order && order.paymentStatus !== 'Paid') {
        order.status = 'Paid';
        order.paymentStatus = 'Paid';
        order.transactionId = tx_ref;
        await order.save();

        // 🔔 NOTIFY THE FARMER
        await notifyFarmer(order);
      }

      const populatedOrder = await Order.findById(payment.order)
        .populate('buyer', 'name email phone')
        .populate('farmer', 'name phone location')
        .populate('orderItems.crop', 'name image');
      
      return res.status(200).json({
        success: true,
        message: 'Payment verified successfully',
        payment,
        order: populatedOrder,
      });
    } else {
      payment.status = 'Failed';
      await payment.save();
      return res.status(400).json({
        success: false,
        message: amountMatches ? 'Verification failed' : 'Verified payment amount does not match the order',
      });
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
    const { page, limit, skip } = parsePagination(req.query);
    const filter = { user: req.user._id };
    const [payments, total] = await Promise.all([
      Payment.find(filter)
        .populate('order', 'totalPrice status orderItems deliveryAddress')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Payment.countDocuments(filter),
    ]);
    setPaginationHeaders(res, { page, limit }, total);

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
    const { status, method, startDate, endDate } = req.query;
    const { page, limit, skip } = parsePagination(req.query, 20);

    const filter = {};
    if (status) filter.status = status;
    if (method) filter.paymentMethod = method;
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    const [payments, total] = await Promise.all([
      Payment.find(filter)
        .populate('user', 'name email phone')
        .populate('order', 'totalPrice status')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
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
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
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
