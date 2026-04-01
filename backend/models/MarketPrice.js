const mongoose = require('mongoose');

const marketPriceSchema = new mongoose.Schema({
  cropName: {
    type: String,
    required: true, // e.g., 'Maize', 'Chat', 'Coffee'
  },
  region: {
    type: String,
    required: true, // e.g., 'Harar', 'Haramaya', 'Dire Dawa', 'Jigjiga'
  },
  currentPrice: {
    type: Number,
    required: true, // price per standard local unit (like quintal)
  },
  previousPrice: {
    type: Number, // for showing trends
  },
  unit: {
    type: String,
    default: 'Quintal', // default metric for East Hararghe region usually
  }
}, {
  timestamps: true,
});

module.exports = mongoose.model('MarketPrice', marketPriceSchema);
