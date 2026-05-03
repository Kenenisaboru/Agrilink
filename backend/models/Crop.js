const mongoose = require('mongoose');

const cropSchema = new mongoose.Schema({
  farmer: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User',
  },
  name: {
    type: String,
    required: [true, 'Please add a crop name (e.g., Maize, Wheat, Chat, Coffee)'],
  },
  category: {
    type: String,
    required: [true, 'Please specify crop category'],
    enum: ['Vegetable', 'Fruit', 'Grain', 'Cereal', 'Legume', 'Oilseed', 'Cash Crop', 'Coffee', 'Khat', 'Spices', 'Livestock', 'Stimulant', 'Other'],
  },
  quantity: {
    type: Number,
    required: [true, 'Please specify available quantity'],
  },
  unit: {
    type: String,
    required: [true, 'Please specify unit (e.g., kg, quintal, ton)'],
  },
  pricePerUnit: {
    type: Number,
    required: [true, 'Please specify price per unit'],
  },
  location: {
    type: String,
    required: [true, 'Please specify exact location (e.g., East Hararghe zone format)'],
  },
  image: {
    type: String,
    // Image URL stored in Cloudinary or local storage
  },
  description: {
    type: String,
  },
  isAvailable: {
    type: Boolean,
    default: true,
  },
  rating: {
    type: Number,
    default: 0,
  },
  numReviews: {
    type: Number,
    default: 0,
  }
}, {
  timestamps: true,
});

module.exports = mongoose.model('Crop', cropSchema);
