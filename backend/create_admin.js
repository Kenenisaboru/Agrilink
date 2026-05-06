const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/agrilink')
  .then(async () => {
    const existingAdmin = await User.findOne({ email: 'admin@agrilink.com' });
    if (existingAdmin) {
      existingAdmin.password = 'password123';
      await existingAdmin.save();
      console.log('Admin account already existed. Password has been reset to: password123');
    } else {
      const admin = new User({
        name: 'Admin User',
        email: 'admin@agrilink.com',
        password: 'password123',
        role: 'Admin',
        location: 'Harar',
        phone: '+251911000000'
      });
      await admin.save();
      console.log('Admin account created successfully: admin@agrilink.com / password123');
    }
    process.exit(0);
  })
  .catch(err => {
    console.error('Error creating admin:', err);
    process.exit(1);
  });
