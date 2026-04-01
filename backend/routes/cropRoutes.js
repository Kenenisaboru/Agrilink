const express = require('express');
const router = express.Router();
const { getCrops, getCropById, createCrop, updateCrop, deleteCrop } = require('../controllers/cropController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
  .get(getCrops)
  .post(protect, createCrop);

router.route('/:id')
  .get(getCropById)
  .put(protect, updateCrop)
  .delete(protect, deleteCrop);

module.exports = router;
