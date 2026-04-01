const Order = require('../models/Order');
const Crop = require('../models/Crop');

// @desc    Create new order
// @route   POST /api/orders
// @access  Private (Buyer)
exports.createOrder = async (req, res) => {
  const { cropId, quantity, deliveryAddress } = req.body;

  try {
    const crop = await Crop.findById(cropId);
    if (!crop) {
      return res.status(404).json({ message: 'Crop not found' });
    }

    if (crop.quantity < quantity) {
      return res.status(400).json({ message: 'Not enough quantity in stock' });
    }

    const totalPrice = crop.pricePerUnit * quantity;

    const order = await Order.create({
      buyer: req.user._id,
      crop: cropId,
      quantity,
      totalPrice,
      deliveryAddress
    });

    // Reduce crop quantity
    crop.quantity -= quantity;
    await crop.save();

    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
// @access  Private
exports.getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ buyer: req.user._id }).populate('crop');
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
    const order = await Order.findById(req.params.id).populate('buyer', 'name email').populate('crop');
    if (order) {
      res.json(order);
    } else {
      res.status(404).json({ message: 'Order not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
