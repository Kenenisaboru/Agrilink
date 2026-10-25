const Order = require('../models/Order');
const Crop = require('../models/Crop');
const Notification = require('../models/Notification');
const { sendSMS } = require('../utils/smsService');
const User = require('../models/User');
const mongoose = require('mongoose');
const { canViewOrder, canUpdateOrderStatus } = require('../utils/orderGuards');

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
  const reservedStock = [];
  try {
    if (req.user.role !== 'Buyer') {
      return res.status(403).json({ message: 'Only buyers can place orders' });
    }

    const { orderItems, deliveryAddress, paymentMethod } = req.body;
    if (!Array.isArray(orderItems) || orderItems.length === 0 || orderItems.length > 50) {
      return res.status(400).json({ message: 'Provide between 1 and 50 order items' });
    }
    if (typeof deliveryAddress !== 'string' || !deliveryAddress.trim() || deliveryAddress.length > 500) {
      return res.status(400).json({ message: 'A valid delivery address is required' });
    }

    const requestedItems = new Map();
    for (const item of orderItems) {
      const cropId = item?.crop;
      const quantity = Number(item?.quantity);
      if (!mongoose.Types.ObjectId.isValid(cropId) || !Number.isFinite(quantity) || quantity <= 0) {
        return res.status(400).json({ message: 'Each item must have a valid crop ID and positive quantity' });
      }
      requestedItems.set(cropId.toString(), (requestedItems.get(cropId.toString()) || 0) + quantity);
    }

    const crops = await Crop.find({
      _id: { $in: [...requestedItems.keys()] },
      isAvailable: true,
    });
    if (crops.length !== requestedItems.size) {
      return res.status(400).json({ message: 'One or more crops are unavailable' });
    }

    const farmerId = crops[0].farmer;
    if (crops.some(crop => crop.farmer.toString() !== farmerId.toString())) {
      return res.status(400).json({ message: 'An order can contain crops from only one farmer' });
    }

    const authoritativeItems = crops.map(crop => {
      const quantity = requestedItems.get(crop._id.toString());
      if (quantity > crop.quantity) {
        throw Object.assign(new Error(`${crop.name} does not have enough stock`), { statusCode: 409 });
      }
      return {
        crop: crop._id,
        name: crop.name,
        quantity,
        image: crop.image,
        price: crop.pricePerUnit,
        unit: crop.unit,
      };
    });
    const totalPrice = authoritativeItems.reduce((total, item) => total + item.quantity * item.price, 0);
    if (!Number.isFinite(totalPrice) || totalPrice <= 0) {
      return res.status(400).json({ message: 'Order total must be greater than zero' });
    }

    const order = new Order({
      buyer: req.user._id,
      farmer: farmerId,
      orderItems: authoritativeItems,
      totalPrice,
      deliveryAddress: deliveryAddress.trim(),
      paymentMethod: paymentMethod || 'Telebirr',
      paymentStatus: 'Unpaid',
      status: 'Pending',
      buyerPhone: req.user.phone || req.user.telebirrNumber || '',
      buyerEmail: req.user.email || '',
    });

    for (const item of authoritativeItems) {
      const result = await Crop.updateOne(
        { _id: item.crop, isAvailable: true, quantity: { $gte: item.quantity } },
        { $inc: { quantity: -item.quantity } }
      );
      if (result.modifiedCount !== 1) {
        for (const reserved of reservedStock) {
          await Crop.updateOne({ _id: reserved.crop }, { $inc: { quantity: reserved.quantity } });
        }
        return res.status(409).json({ message: 'One or more crops no longer have enough stock' });
      }
      reservedStock.push({ crop: item.crop, quantity: item.quantity });
    }

    const createdOrder = await order.save();
    res.status(201).json(createdOrder);

  } catch (error) {
    for (const reserved of reservedStock) {
      await Crop.updateOne({ _id: reserved.crop }, { $inc: { quantity: reserved.quantity } });
    }
    if (error.statusCode === 409) {
      return res.status(409).json({ message: error.message });
    }
    console.error('[ORDER ERROR]', error);
    res.status(500).json({ message: 'Failed to create order' });
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

    if (!canViewOrder(order, req.user._id, req.user.role)) {
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

    if (!canUpdateOrderStatus(order, req.user._id, req.user.role)) {
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
      // Send SMS to Buyer
      if (order.buyer.phone || order.buyerPhone) {
        await sendSMS(
          order.buyer.phone || order.buyerPhone,
          `AgriLink: Your order #${order._id.toString().slice(-6)} is on its way! The farmer has shipped your items.`
        );
      }
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
      // Send SMS to Buyer
      if (order.buyer.phone || order.buyerPhone) {
        await sendSMS(
          order.buyer.phone || order.buyerPhone,
          `AgriLink: Order #${order._id.toString().slice(-6)} delivered successfully. Thank you for using AgriLink!`
        );
      }
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
    console.log('');

    return notification;
  } catch (error) {
    // Don't let notification failure block the order
    console.error('[NOTIFICATION ERROR] Failed to notify farmer:', error.message);
  }
}
