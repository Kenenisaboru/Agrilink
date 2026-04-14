const Order = require('../models/Order');
const Crop = require('../models/Crop');
const Notification = require('../models/Notification');
const User = require('../models/User');

/**
 * ===========================================================
 *  ORDER CONTROLLER - Complete Marketplace Order Flow
 * ===========================================================
 * 
 *  Flow: Buyer pays → Order created → Farmer notified → Farmer ships
 * 
 *  Key concept for beginners:
 *  - "buyer" = the person who is purchasing crops
 *  - "farmer" = the person who listed the crops for sale
 *  - Each order connects a buyer to a farmer through the crops
 * ===========================================================
 */


// @desc    Create a new order after successful payment
// @route   POST /api/orders
// @access  Private (Buyer)
exports.createOrder = async (req, res) => {
  try {
    const {
      orderItems,
      deliveryAddress,
      totalPrice,
      paymentMethod,
      transactionId
    } = req.body;

    // --- Validation ---
    if (!orderItems || orderItems.length === 0) {
      return res.status(400).json({ message: 'No order items provided' });
    }

    if (!deliveryAddress) {
      return res.status(400).json({ message: 'Delivery address is required' });
    }

    // --- Find the farmer who owns these crops ---
    // In a real multi-vendor marketplace, one order could have items from multiple farmers.
    // For simplicity (and since most orders in East Hararghe will be from one farmer),
    // we pick the farmer from the first crop item.
    let farmerId = null;

    // Try to look up the crop to find its farmer
    if (orderItems[0]?.crop) {
      const firstCrop = await Crop.findById(orderItems[0].crop);
      if (firstCrop) {
        farmerId = firstCrop.farmer;
      }
    }

    // If we couldn't find the farmer from the crop, try the request body
    if (!farmerId && req.body.farmerId) {
      farmerId = req.body.farmerId;
    }

    // Last resort: use a placeholder (in demo mode)
    if (!farmerId) {
      // In demo mode, we still create the order but log a warning
      console.warn('[ORDER] Could not determine farmer for this order. Using buyer as placeholder.');
      farmerId = req.user._id;
    }

    // --- Create the Order ---
    const order = new Order({
      buyer: req.user._id,
      farmer: farmerId,
      orderItems,
      totalPrice,
      deliveryAddress,
      paymentMethod: paymentMethod || 'Telebirr',
      transactionId: transactionId || null,
      paymentStatus: transactionId ? 'Paid' : 'Unpaid',
      status: transactionId ? 'Paid' : 'Pending',
      buyerPhone: req.user.phone || req.user.telebirrNumber || '',
      buyerEmail: req.user.email || '',
    });

    const createdOrder = await order.save();

    // --- Reduce crop stock (optional but realistic) ---
    for (const item of orderItems) {
      if (item.crop) {
        await Crop.findByIdAndUpdate(item.crop, {
          $inc: { quantity: -item.quantity }
        });
      }
    }

    // --- Send notification to the farmer ---
    if (farmerId && farmerId.toString() !== req.user._id.toString()) {
      await createFarmerNotification(createdOrder, req.user);
    }

    // Log for demo purposes
    console.log(`✅ [ORDER CREATED] Order #${createdOrder._id} | Buyer: ${req.user.name} | Total: ${totalPrice} ETB`);

    res.status(201).json(createdOrder);

  } catch (error) {
    console.error('[ORDER ERROR]', error);
    res.status(500).json({ message: 'Failed to create order: ' + error.message });
  }
};


// @desc    Create order specifically after payment verification (called from paymentController)
// @route   Internal function (not a route)
// @access  Internal
exports.createOrderAfterPayment = async ({ buyerId, orderItems, totalPrice, deliveryAddress, paymentMethod, transactionId }) => {
  try {
    const buyer = await User.findById(buyerId);
    if (!buyer) throw new Error('Buyer not found');

    // Find farmer from first crop
    let farmerId = null;
    if (orderItems[0]?.crop) {
      const firstCrop = await Crop.findById(orderItems[0].crop);
      if (firstCrop) farmerId = firstCrop.farmer;
    }

    if (!farmerId) farmerId = buyerId; // Fallback for demo

    const order = new Order({
      buyer: buyerId,
      farmer: farmerId,
      orderItems,
      totalPrice,
      deliveryAddress,
      paymentMethod,
      transactionId,
      paymentStatus: 'Paid',
      status: 'Paid',
      buyerPhone: buyer.phone || buyer.telebirrNumber || '',
      buyerEmail: buyer.email || '',
    });

    const createdOrder = await order.save();

    // Notify farmer
    if (farmerId.toString() !== buyerId.toString()) {
      await createFarmerNotification(createdOrder, buyer);
    }

    console.log(`✅ [POST-PAYMENT ORDER] Order #${createdOrder._id} created after payment verification`);
    return createdOrder;

  } catch (error) {
    console.error('[POST-PAYMENT ORDER ERROR]', error);
    throw error;
  }
};


// @desc    Get buyer's own orders (purchase history)
// @route   GET /api/orders/myorders
// @access  Private (Buyer)
exports.getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ buyer: req.user._id })
      .populate('farmer', 'name email phone location')
      .populate('orderItems.crop', 'name image category')
      .sort('-createdAt');

    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// @desc    Get incoming orders for a farmer (orders where their crops were bought)
// @route   GET /api/orders/farmer/orders
// @access  Private (Farmer)
exports.getFarmerOrders = async (req, res) => {
  try {
    const orders = await Order.find({ farmer: req.user._id })
      .populate('buyer', 'name email phone location')
      .populate('orderItems.crop', 'name image category')
      .sort('-createdAt');

    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// @desc    Get a single order by ID
// @route   GET /api/orders/:id
// @access  Private
exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('buyer', 'name email phone location')
      .populate('farmer', 'name email phone location')
      .populate('orderItems.crop', 'name image category');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Ensure user can only see their own orders (buyer or farmer)
    const userId = req.user._id.toString();
    const isBuyer = order.buyer._id.toString() === userId;
    const isFarmer = order.farmer._id.toString() === userId;
    const isAdmin = req.user.role === 'Admin';

    if (!isBuyer && !isFarmer && !isAdmin) {
      return res.status(403).json({ message: 'Not authorized to view this order' });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// @desc    Update order status (e.g., farmer marks as "Shipped")
// @route   PUT /api/orders/:id/status
// @access  Private (Farmer/Admin)
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Only the farmer of this order or admin can update status
    const userId = req.user._id.toString();
    const isFarmer = order.farmer.toString() === userId;
    const isAdmin = req.user.role === 'Admin';

    if (!isFarmer && !isAdmin) {
      return res.status(403).json({ message: 'Only the seller can update order status' });
    }

    order.status = status;
    const updatedOrder = await order.save();

    // Notify the buyer about status change
    if (status === 'Shipped') {
      await Notification.create({
        recipient: order.buyer,
        type: 'ORDER_SHIPPED',
        title: '📦 Your Order Has Been Shipped!',
        message: `Your order #${order._id.toString().slice(-6)} is on its way. The farmer has dispatched your fresh produce!`,
        order: order._id,
      });
      console.log(`📦 [SHIPPED] Order #${order._id} marked as shipped`);
    }

    if (status === 'Delivered') {
      await Notification.create({
        recipient: order.buyer,
        type: 'ORDER_DELIVERED',
        title: '✅ Order Delivered!',
        message: `Your order #${order._id.toString().slice(-6)} has been marked as delivered. Enjoy your fresh produce!`,
        order: order._id,
      });
      console.log(`✅ [DELIVERED] Order #${order._id} marked as delivered`);
    }

    res.json(updatedOrder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


/**
 * HELPER: Create a notification for the farmer when a new order arrives
 * 
 * This is the core of the "Farmer Notification System" —
 * every time a buyer pays, the farmer gets an in-app notification.
 */
async function createFarmerNotification(order, buyer) {
  try {
    const itemNames = order.orderItems.map(i => i.name).join(', ');
    
    const notification = await Notification.create({
      recipient: order.farmer,
      type: 'NEW_ORDER',
      title: '🛒 New Order Received!',
      message: `${buyer.name} ordered ${itemNames} for ${order.totalPrice.toLocaleString()} ETB. Check your orders dashboard to process this delivery.`,
      order: order._id,
    });

    // Console log for demo purposes (simulates SMS/push notification)
    console.log('');
    console.log('═══════════════════════════════════════════');
    console.log('📱 FARMER NOTIFICATION (Simulated SMS/Push)');
    console.log('═══════════════════════════════════════════');
    console.log(`  To Farmer ID: ${order.farmer}`);
    console.log(`  From Buyer:   ${buyer.name}`);
    console.log(`  Items:        ${itemNames}`);
    console.log(`  Total:        ${order.totalPrice} ETB`);
    console.log(`  Delivery To:  ${order.deliveryAddress}`);
    console.log(`  Order ID:     ${order._id}`);
    console.log('═══════════════════════════════════════════');
    console.log('');

    return notification;
  } catch (error) {
    // Don't let notification failure block the order
    console.error('[NOTIFICATION ERROR] Failed to notify farmer:', error.message);
  }
}
