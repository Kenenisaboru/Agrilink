const mongoose = require('mongoose');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

// Models
const MarketPrice = require('./models/MarketPrice');
const User = require('./models/User');

dotenv.config();
connectDB();

const marketPriceData = [
  { cropName: 'Maize (Bokolo)', region: 'Harar', currentPrice: 4500, previousPrice: 4200, unit: 'Quintal' },
  { cropName: 'Sorghum (Mishinga)', region: 'Haramaya', currentPrice: 5000, previousPrice: 4800, unit: 'Quintal' },
  { cropName: 'Chat (Qaraati)', region: 'Oda Bultum', currentPrice: 200, previousPrice: 150, unit: 'Kg' },
  { cropName: 'Coffee (Buna)', region: 'Dire Dawa', currentPrice: 15000, previousPrice: 14500, unit: 'Quintal' },
  { cropName: 'Wheat (Qamadi)', region: 'Jigjiga', currentPrice: 5500, previousPrice: 5600, unit: 'Quintal' },
  { cropName: 'Onion (Qullubbii)', region: 'Haramaya', currentPrice: 4000, previousPrice: 3800, unit: 'Quintal' }
];

const Crop = require('./models/Crop');

const usersData = [
  { name: 'Admin User', email: 'admin@agrilink.com', password: 'password123', role: 'Admin', location: 'Harar', phone: '+251911000000' },
  { name: 'Demo Farmer', email: 'farmer@agrilink.com', password: 'password123', role: 'Farmer', location: 'Haramaya', phone: '+251922000000', balance: 5000 },
  { name: 'Demo Buyer', email: 'buyer@agrilink.com', password: 'password123', role: 'Buyer', location: 'Dire Dawa', phone: '+251933000000' },
  { name: 'Demo Student', email: 'student@agrilink.com', password: 'password123', role: 'Student', location: 'Haramaya University', university: 'Haramaya University', phone: '+251944000000' }
];

const importData = async () => {
  try {
    await MarketPrice.deleteMany(); // Clear existing prices
    await User.deleteMany(); // Clear existing users
    await Crop.deleteMany(); // Clear existing crops
    
    // Add East Hararghe Market Prices
    await MarketPrice.insertMany(marketPriceData);

    // Add Users using a manual loop to absolutely guarantee the pre('save') hook runs!
    const createdUsers = [];
    for (const userData of usersData) {
      const user = new User(userData);
      await user.save();
      createdUsers.push(user);
    }
    
    const demoFarmer = createdUsers.find(user => user.role === 'Farmer');

    // Add Dummy Crops
    const cropsData = [
      { farmer: demoFarmer._id, name: 'Premium Coffee (Buna)', category: 'Cash Crop', quantity: 10, unit: 'Quintal', pricePerUnit: 15000, location: 'Dire Dawa', description: 'High quality export-grade coffee.', image: '/images/coffee.jpg' },
      { farmer: demoFarmer._id, name: 'Fresh Maize (Bokolo)', category: 'Grain', quantity: 50, unit: 'Quintal', pricePerUnit: 4500, location: 'Haramaya', description: 'Freshly harvested maize.', image: '/images/maize.jpg' }
    ];
    await Crop.insertMany(cropsData);

    console.log('Database Seeded Successfully with Market Data, Users, and Crops!');
    process.exit();
  } catch (error) {
    console.error(`Error with data import: ${error}`);
    process.exit(1);
  }
};

const destroyData = async () => {
  try {
    await MarketPrice.deleteMany();
    console.log('Data Destroyed!');
    process.exit();
  } catch (error) {
    console.error(`Error: ${error}`);
    process.exit(1);
  }
};

if (process.argv[2] === '-d') {
  destroyData();
} else {
  importData();
}
