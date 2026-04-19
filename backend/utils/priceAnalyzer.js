/**
 * priceAnalyzer.js
 * AI Simulation: Analyzes a crop's price against Ethiopian Commodity Exchange (ECX) 
 * current market averages to generate a dynamic pricing badge.
 */

// Simulated current ECX averages (ETB per kg)
const ECX_MARKET_AVERAGES = {
  maize: 45,
  wheat: 60,
  teff: 120,
  chat: 300,
  coffee: 450,
  sorghum: 50,
  barley: 55,
  onion: 35,
  potato: 25,
  tomato: 40,
  default: 50,
};

const analyzePrice = (cropName, pricePerUnit) => {
  const name = cropName.toLowerCase();
  
  // Find matching market average or use default
  let marketAverage = ECX_MARKET_AVERAGES.default;
  for (const [key, value] of Object.entries(ECX_MARKET_AVERAGES)) {
    if (name.includes(key)) {
      marketAverage = value;
      break;
    }
  }

  // Determine the percentage difference
  const diffPercent = ((pricePerUnit - marketAverage) / marketAverage) * 100;

  let badge = { text: 'Fair Price', color: 'yellow', type: 'fair' };

  if (diffPercent <= -5) {
    badge = { text: 'Great Deal', color: 'green', type: 'deal' };
  } else if (diffPercent >= 10) {
    badge = { text: 'Premium', color: 'red', type: 'premium' };
  }

  return {
    badge,
    marketAverage,
    diffPercent: Math.round(diffPercent)
  };
};

module.exports = { analyzePrice };
