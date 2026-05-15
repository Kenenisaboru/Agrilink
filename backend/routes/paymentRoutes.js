const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/authMiddleware');
const {
  getPaymentMethods,
  requestPayment,
  getPaymentHistory,
  getAllPayments,
  getPaymentById,
  verifyPayment
} = require('../controllers/paymentController');

// Public
router.get('/methods', getPaymentMethods);

// Verify payment — buyer must be authenticated and own the transaction
router.get('/verify/:tx_ref', protect, verifyPayment);

// Private (authenticated users)
router.post('/request', protect, requestPayment);
router.get('/history', protect, getPaymentHistory);
router.get('/:id', protect, getPaymentById);

// Admin only
router.get('/admin/all', protect, admin, getAllPayments);

module.exports = router;
