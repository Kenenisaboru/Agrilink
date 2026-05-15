const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { chat, predictPrice, getSmartRecommendations } = require('../controllers/aiController');

// All endpoints prefixed with /api/ai (JWT required — prevents unauthenticated Gemini proxy abuse)
router.post('/chat', protect, chat);
router.post('/predict', protect, predictPrice);
router.post('/recommend', protect, getSmartRecommendations);

module.exports = router;
