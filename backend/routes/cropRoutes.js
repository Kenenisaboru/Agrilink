const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { getCrops, getCropById, createCrop, updateCrop, deleteCrop, getFarmerCrops } = require('../controllers/cropController');
const { upload } = require('../config/cloudinary');

// Public routes
router.get('/', getCrops);
router.get('/:id', getCropById);

// Private routes
// IMPORTANT: /farmer must come before /:id to avoid conflicts
router.get('/farmer/mycrops', protect, getFarmerCrops);
router.post('/', protect, upload.single('image'), createCrop);
router.put('/:id', protect, upload.single('image'), updateCrop);
router.delete('/:id', protect, deleteCrop);

module.exports = router;
