const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    console.error('👉 Fix: Go to MongoDB Atlas → Network Access → Add IP "0.0.0.0/0"');
    process.exit(1);
  }
};

module.exports = connectDB;
