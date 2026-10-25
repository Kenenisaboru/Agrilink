const mongoose = require('mongoose');

const connectDB = async () => {
  if (!process.env.MONGO_URI) {
    throw new Error('MONGO_URI is required');
  }

  const conn = await mongoose.connect(process.env.MONGO_URI, {
    autoIndex: process.env.NODE_ENV !== 'production',
  });
  console.log(`MongoDB connected: ${conn.connection.name}`);
  return conn;
};

module.exports = connectDB;
