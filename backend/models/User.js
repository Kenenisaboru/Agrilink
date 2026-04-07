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
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: [true, 'Please add a password'],
    minlength: 6,
  },
  role: {
    type: String,
    enum: ['Farmer', 'Student', 'Buyer', 'Admin', 'Representative'],
    required: [true, 'Please specify a user role'],
  },
  managedUsers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  location: {
    type: String,
    // E.g., 'Harar', 'Haramaya', 'Dire Dawa', 'Jigjiga', 'Oda Bultum'
  },
  phone: {
    type: String,
    // Primary phone number for payments (Telebirr, M-Pesa, etc.)
  },
  mpesaNumber: {
    type: String,
    // Legacy field - kept for backwards compatibility
  },
  telebirrNumber: {
    type: String,
  },
  cbeAccountNumber: {
    type: String,
  },
  // Virtual wallet balance in ETB
  balance: {
    type: Number,
    default: 0,
    min: 0,
  },
  university: {
    type: String, // E.g., 'Haramaya University' for students
  },
  isActive: {
    type: Boolean,
    default: true,
  }
}, {
  timestamps: true,
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Match password
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
