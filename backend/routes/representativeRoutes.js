const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const { getDashboard } = require('../controllers/representativeController');

router.get('/dashboard', protect, authorize('Representative', 'Admin'), getDashboard);

module.exports = router;
