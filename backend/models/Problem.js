const mongoose = require('mongoose');

const problemSchema = new mongoose.Schema({
  farmer: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User',
  },
  title: {
    type: String,
    required: [true, 'Please add a problem title (e.g., Disease, Pest Control, Irrigation)'],
  },
  description: {
    type: String,
    required: [true, 'Please describe the problem in detail'],
  },
  category: {
    type: String,
    enum: ['Disease', 'Pest Control', 'Irrigation', 'Market Issue', 'Other'],
    default: 'Other',
  },
  image: {
    type: String, // Optional: Farmer can upload an image of the diseased crop or problem
  },
  status: {
    type: String,
    enum: ['Open', 'In Progress', 'Resolved'],
    default: 'Open',
  }
}, {
  timestamps: true,
});

module.exports = mongoose.model('Problem', problemSchema);
