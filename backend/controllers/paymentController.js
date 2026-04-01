const Payment = require('../models/Payment');
const Order = require('../models/Order');

// @desc    Simulate M-Pesa Payment Request
// @route   POST /api/payments/request
// @access  Private
const requestPayment = async (req, res) => {
  try {
    const { orderId, amount, phone } = req.body;

    // Verify order exists
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Simulate an API call to M-Pesa endpoint here...
    // In a real hackathon, you'd use axios.post('mpesa_endpoint', ...)
    
    // Simulate Success Processing
    const simulatedReceiptNumber = 'MPESA' + Math.floor(Math.random() * 1000000000);

    const payment = new Payment({
      user: req.user._id,
      order: orderId,
      amount,
      mpesaReceiptNumber: simulatedReceiptNumber,
      status: 'Success'
    });

    const savedPayment = await payment.save();

    // Update Order Status
    order.status = 'Paid';
    await order.save();

    res.status(200).json({
      message: 'Payment simulation successful',
      payment: savedPayment
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  requestPayment
};
