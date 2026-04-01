const express = require('express');
const router = express.Router();
const { requestPayment } = require('../controllers/paymentController');
const { protect } = require('../middleware/authMiddleware');

router.post('/request', protect, requestPayment);

module.exports = router;
