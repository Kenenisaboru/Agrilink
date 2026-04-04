const express = require('express');
const router = express.Router();
const { getCrops, getCropById, createCrop, updateCrop, deleteCrop } = require('../controllers/cropController');
const { protect } = require('../middleware/authMiddleware');
const { upload } = require('../config/cloudinary');

router.route('/')
  .get(getCrops)
  .post(protect, upload.single('image'), createCrop);

router.route('/:id')
  .get(getCropById)
  .put(protect, upload.single('image'), updateCrop)
  .delete(protect, deleteCrop);

module.exports = router;
