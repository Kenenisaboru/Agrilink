const express = require('express');
const router = express.Router();
const { chat, predictPrice, getSmartRecommendations } = require('../controllers/aiController');

// All endpoints prefixed with /api/ai
router.post('/chat', chat);
router.post('/predict', predictPrice);
router.post('/recommend', getSmartRecommendations);

module.exports = router;
