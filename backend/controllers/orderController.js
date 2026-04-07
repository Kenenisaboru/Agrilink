const Order = require('../models/Order');
const Crop = require('../models/Crop');

// @desc    Create new order
// @route   POST /api/orders
// @access  Private (Buyer)
exports.createOrder = async (req, res) => {
  const { orderItems, deliveryAddress, totalPrice } = req.body;

  if (orderItems && orderItems.length === 0) {
    res.status(400).json({ message: 'No order items' });
    return;
  } else {
    try {
      const order = new Order({
        buyer: req.user._id,
        orderItems,
        totalPrice,
        deliveryAddress
      });

      const createdOrder = await order.save();

      // For a production app, you might want to subtract from stock here
      // But for a hackathon, this is a good start.
      res.status(201).json(createdOrder);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
};

// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
// @access  Private
exports.getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ buyer: req.user._id }).sort('-createdAt');
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('buyer', 'name email');
    if (order) {
      res.json(order);
    } else {
      res.status(404).json({ message: 'Order not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
