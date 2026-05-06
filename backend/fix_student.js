const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

const fixStudent = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('📡 Connected to MongoDB...');

    const email = 'student@test.com';
    const password = 'password123';

    let user = await User.findOne({ email });

    if (user) {
      user.password = password;
      user.role = 'Student';
      user.isActive = true;
      await user.save();
      console.log(`✅ Updated existing student: ${email}`);
    } else {
      await User.create({
        name: 'Test Student',
        email: email,
        password: password,
        role: 'Student',
        isActive: true
      });
      console.log(`✅ Created new test student: ${email}`);
    }

    console.log('-----------------------------------');
    console.log(`Email: ${email}`);
    console.log(`Password: ${password}`);
    console.log('-----------------------------------');
    console.log('🚀 Use these credentials to login now.');
    
    process.exit();
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

fixStudent();
