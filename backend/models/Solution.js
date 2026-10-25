const mongoose = require('mongoose');

const solutionSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User',
  },
  problem: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Problem',
  },
  description: {
    type: String,
    required: [true, 'Please provide a detailed solution'],
    maxlength: 10000,
  },
  projectProposalUrl: {
    type: String,
    // Links to documentation or prototype if the student built something
  },
  isApproved: {
    type: Boolean,
    default: false, // The farmer or admin can approve the best solution
  }
}, {
  timestamps: true,
});

solutionSchema.index({ problem: 1, createdAt: -1 });

module.exports = mongoose.model('Solution', solutionSchema);
