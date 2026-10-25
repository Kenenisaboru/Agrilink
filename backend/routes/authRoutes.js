const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getUserProfile, updateUserProfile, logoutUser } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const { uploadProfile } = require('../middleware/uploadMiddleware');
const rateLimit = require('express-rate-limit');

const authenticationAttemptLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { success: false, error: 'Too many authentication attempts. Please try again later.' },
});
router.post('/register', uploadProfile.single('profilePicture'), registerUser);
router.post('/login', authenticationAttemptLimiter, loginUser);
router.get('/profile', protect, getUserProfile);
router.put('/profile', protect, uploadProfile.single('profilePicture'), updateUserProfile);
router.post('/logout', protect, logoutUser);

module.exports = router;
