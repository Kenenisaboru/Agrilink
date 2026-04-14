const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  createOrder,
  getMyOrders,
  getFarmerOrders,
  getOrderById,
  updateOrderStatus
} = require('../controllers/orderController');

/**
 * Order Routes
 * 
 * POST   /api/orders              → Create a new order (Buyer)
 * GET    /api/orders/myorders     → Get buyer's own purchase history
 * GET    /api/orders/farmer/orders → Get incoming orders for a farmer
 * GET    /api/orders/:id          → Get a single order by ID
 * PUT    /api/orders/:id/status   → Update order status (Farmer/Admin)
 */

// Create order (after payment)
router.post('/', protect, createOrder);

// Buyer: "What have I purchased?"
router.get('/myorders', protect, getMyOrders);

// Farmer: "What orders have come in for my crops?"
router.get('/farmer/orders', protect, getFarmerOrders);

// Get single order details
router.get('/:id', protect, getOrderById);

// Farmer updates order status (e.g., "Shipped", "Delivered")
router.put('/:id/status', protect, updateOrderStatus);

module.exports = router;
