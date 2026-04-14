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

// Verify Chapa Payment (can be public or private, but usually public for webhook, private for redirect if checking user context)
// For simplicity, we'll make it unprotected so the webhook/frontend can call it without complex auth headers during redirection,
// though ideally the frontend passes auth headers.
router.get('/verify/:tx_ref', verifyPayment);

// Private (authenticated users)
router.post('/request', protect, requestPayment);
router.get('/history', protect, getPaymentHistory);
router.get('/:id', protect, getPaymentById);

// Admin only
router.get('/admin/all', protect, admin, getAllPayments);

module.exports = router;
