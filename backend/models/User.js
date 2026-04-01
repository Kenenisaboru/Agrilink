const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a name'],
  },
  email: {
    type: String,
    required: [true, 'Please add an email'],
    unique: true,
  },
  password: {
    type: String,
    required: [true, 'Please add a password'],
  },
  role: {
    type: String,
    enum: ['Farmer', 'Student', 'Buyer', 'Admin'],
    required: [true, 'Please specify a user role'],
  },
  location: {
    type: String,
    // E.g., 'Harar', 'Haramaya', 'Dire Dawa', 'Jigjiga', 'Oda Bultum'
  },
  mpesaNumber: {
    type: String,
    // Expected format for M-Pesa or local payment system
  },
  university: {
    type: String, // E.g., 'Haramaya University' for students
  }
}, {
  timestamps: true,
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Match password
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
