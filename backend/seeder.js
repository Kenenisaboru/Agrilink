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

const importData = async () => {
  try {
    await MarketPrice.deleteMany(); // Clear existing
    
    // Add East Hararghe Market Prices
    await MarketPrice.insertMany(marketPriceData);

    console.log('East Hararghe Market Data Imported Successfully!');
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
