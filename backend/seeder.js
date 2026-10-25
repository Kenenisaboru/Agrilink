const mongoose = require('mongoose');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const MarketPrice = require('./models/MarketPrice');
const User = require('./models/User');
const Crop = require('./models/Crop');

dotenv.config();

const marketPriceData = [
  { cropName: 'Maize (Bokolo)', region: 'Harar', currentPrice: 4500, previousPrice: 4200, unit: 'Quintal' },
  { cropName: 'Sorghum (Mishinga)', region: 'Haramaya', currentPrice: 5000, previousPrice: 4800, unit: 'Quintal' },
  { cropName: 'Chat (Qaraati)', region: 'Oda Bultum', currentPrice: 200, previousPrice: 150, unit: 'Kg' },
  { cropName: 'Coffee (Buna)', region: 'Dire Dawa', currentPrice: 15000, previousPrice: 14500, unit: 'Quintal' },
  { cropName: 'Wheat (Qamadi)', region: 'Jigjiga', currentPrice: 5500, previousPrice: 5600, unit: 'Quintal' },
  { cropName: 'Onion (Qullubbii)', region: 'Haramaya', currentPrice: 4000, previousPrice: 3800, unit: 'Quintal' },
];

const demoUsers = [
  { name: 'Admin User', email: 'admin@agrilink.com', role: 'Admin', location: 'Harar' },
  { name: 'Demo Farmer', email: 'farmer@agrilink.com', role: 'Farmer', location: 'Haramaya' },
  { name: 'Demo Buyer', email: 'buyer@agrilink.com', role: 'Buyer', location: 'Dire Dawa' },
  { name: 'Demo Student', email: 'student@agrilink.com', role: 'Student', location: 'Haramaya University', university: 'Haramaya University' },
];

const seed = async () => {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('Demo seeding is disabled in production');
  }
  if (!process.env.SEED_PASSWORD || process.env.SEED_PASSWORD.length < 8) {
    throw new Error('Set SEED_PASSWORD to a unique development password of at least 8 characters');
  }

  await connectDB();

  for (const record of marketPriceData) {
    await MarketPrice.updateOne(
      { cropName: record.cropName, region: record.region },
      { $set: record },
      { upsert: true }
    );
  }

  const users = [];
  for (const record of demoUsers) {
    let user = await User.findOne({ email: record.email });
    if (!user) {
      user = await User.create({ ...record, password: process.env.SEED_PASSWORD });
    }
    users.push(user);
  }

  const farmer = users.find(user => user.role === 'Farmer');
  const demoCrops = [
    { name: 'Premium Coffee (Buna)', category: 'Cash Crop', quantity: 10, unit: 'Quintal', pricePerUnit: 15000, location: 'Dire Dawa', description: 'High quality export-grade coffee.', image: '/images/coffee.jpg' },
    { name: 'Fresh Maize (Bokolo)', category: 'Grain', quantity: 50, unit: 'Quintal', pricePerUnit: 4500, location: 'Haramaya', description: 'Freshly harvested maize.', image: '/images/maize.jpg' },
  ];
  for (const record of demoCrops) {
    await Crop.updateOne(
      { farmer: farmer._id, name: record.name },
      { $setOnInsert: { ...record, farmer: farmer._id } },
      { upsert: true }
    );
  }

  console.log('Development demo data seeded without deleting existing records.');
};

seed()
  .catch(error => {
    console.error('Seed failed:', error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
