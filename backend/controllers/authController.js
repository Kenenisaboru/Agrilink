const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const { isCloudinaryConfigured } = require('../middleware/uploadMiddleware');

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
  try {
    const { name, email, password, role, location, phone, mpesaNumber, telebirrNumber, university } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: 'Please provide name, email, password and role' });
    }

    const userExists = await User.findOne({ email: email.toLowerCase() });
    if (userExists) {
      return res.status(400).json({ message: 'An account with this email already exists' });
    }

    // Handle profile picture upload
    let profilePicture = '';
    if (req.file) {
      if (isCloudinaryConfigured()) {
        // Cloudinary returns the URL in req.file.path
        profilePicture = req.file.path;
      } else {
        // Local storage: build the URL
        profilePicture = `/uploads/${req.file.filename}`;
      }
    }

    const user = await User.create({
      name,
      email,
      password,
      role,
      location,
      phone: phone || mpesaNumber,
      mpesaNumber,
      telebirrNumber: telebirrNumber || phone || mpesaNumber,
      university,
      profilePicture,
      balance: 0,
    });

    if (user) {
      const token = generateToken(user._id);
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        location: user.location,
        phone: user.phone,
        telebirrNumber: user.telebirrNumber,
        cbeAccountNumber: user.cbeAccountNumber,
        profilePicture: user.profilePicture,
        balance: user.balance,
        token,
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    if (!user.isActive) {
      return res.status(403).json({ message: 'Your account has been deactivated. Please contact support.' });
    }

    const token = generateToken(user._id);
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      location: user.location,
      phone: user.phone || user.mpesaNumber,
      telebirrNumber: user.telebirrNumber,
      cbeAccountNumber: user.cbeAccountNumber,
      profilePicture: user.profilePicture,
      balance: user.balance || 0,
      token,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (user) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        location: user.location,
        phone: user.phone || user.mpesaNumber,
        telebirrNumber: user.telebirrNumber,
        cbeAccountNumber: user.cbeAccountNumber,
        profilePicture: user.profilePicture,
        balance: user.balance || 0,
        university: user.university,
        createdAt: user.createdAt,
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const { name, location, phone, telebirrNumber, cbeAccountNumber, university } = req.body;

    user.name = name || user.name;
    user.location = location || user.location;
    user.phone = phone || user.phone;
    user.telebirrNumber = telebirrNumber || user.telebirrNumber;
    user.cbeAccountNumber = cbeAccountNumber || user.cbeAccountNumber;
    user.university = university || user.university;

    if (req.body.password) {
      user.password = req.body.password;
    }

    const updatedUser = await user.save();
    const token = generateToken(updatedUser._id);

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      location: updatedUser.location,
      phone: updatedUser.phone,
      profilePicture: updatedUser.profilePicture,
      balance: updatedUser.balance || 0,
      token,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
};
