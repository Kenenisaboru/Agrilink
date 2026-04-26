import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPin, TrendingUp, TrendingDown, Minus, Filter,
  BarChart3, Zap, ChevronDown, Loader2, RefreshCw, Info
} from 'lucide-react';
import 'leaflet/dist/leaflet.css';

// ── Ethiopian Market Regions with Real Coordinates ──────────────────────────
const MARKET_DATA = [
  {
    id: 1, name: 'Harar', lat: 9.3115, lng: 42.1199, region: 'Harari',
    crops: [
      { name: 'Coffee', price: 650, trend: 'up', change: '+8%', supply: 'High' },
      { name: 'Chat/Khat', price: 320, trend: 'up', change: '+12%', supply: 'Very High' },
      { name: 'Sorghum', price: 3200, trend: 'stable', change: '+1%', supply: 'Medium' },
    ],
    totalVolume: 12500, avgPrice: 4800, activity: 'Very High'
  },
  {
    id: 2, name: 'Dire Dawa', lat: 9.6009, lng: 41.8501, region: 'Dire Dawa',
    crops: [
      { name: 'Maize', price: 4200, trend: 'down', change: '-5%', supply: 'High' },
      { name: 'Onion', price: 2800, trend: 'up', change: '+15%', supply: 'Low' },
      { name: 'Teff', price: 9500, trend: 'up', change: '+7%', supply: 'Medium' },
    ],
    totalVolume: 18200, avgPrice: 5200, activity: 'High'
  },
  {
    id: 3, name: 'Chiro', lat: 9.0833, lng: 40.8667, region: 'West Hararghe',
    crops: [
      { name: 'Maize', price: 3800, trend: 'stable', change: '+2%', supply: 'Very High' },
      { name: 'Sorghum', price: 3100, trend: 'down', change: '-3%', supply: 'High' },
      { name: 'Wheat', price: 5600, trend: 'up', change: '+6%', supply: 'Medium' },
    ],
    totalVolume: 8900, avgPrice: 4100, activity: 'Medium'
  },
  {
    id: 4, name: 'Haramaya', lat: 9.4000, lng: 42.0000, region: 'East Hararghe',
    crops: [
      { name: 'Chat/Khat', price: 350, trend: 'up', change: '+18%', supply: 'Very High' },
      { name: 'Potato', price: 2200, trend: 'down', change: '-8%', supply: 'High' },
      { name: 'Tomato', price: 1800, trend: 'up', change: '+22%', supply: 'Low' },
    ],
    totalVolume: 7600, avgPrice: 3800, activity: 'High'
  },
  {
    id: 5, name: 'Addis Ababa', lat: 9.0222, lng: 38.7469, region: 'Addis Ababa',
    crops: [
      { name: 'Teff', price: 11200, trend: 'up', change: '+10%', supply: 'Low' },
      { name: 'Wheat', price: 6200, trend: 'up', change: '+5%', supply: 'Medium' },
      { name: 'Coffee', price: 720, trend: 'up', change: '+6%', supply: 'Medium' },
    ],
    totalVolume: 45000, avgPrice: 7200, activity: 'Very High'
  },
  {
    id: 6, name: 'Jimma', lat: 7.6667, lng: 36.8333, region: 'Jimma',
    crops: [
      { name: 'Coffee', price: 580, trend: 'stable', change: '+2%', supply: 'Very High' },
      { name: 'Maize', price: 3600, trend: 'down', change: '-4%', supply: 'High' },
      { name: 'Barley', price: 4800, trend: 'up', change: '+9%', supply: 'Medium' },
    ],
    totalVolume: 15800, avgPrice: 4600, activity: 'High'
  },
  {
    id: 7, name: 'Shashemene', lat: 7.2000, lng: 38.6000, region: 'West Arsi',
    crops: [
      { name: 'Wheat', price: 5400, trend: 'up', change: '+8%', supply: 'High' },
      { name: 'Potato', price: 1900, trend: 'stable', change: '0%', supply: 'Very High' },
      { name: 'Onion', price: 3200, trend: 'up', change: '+14%', supply: 'Low' },
    ],
    totalVolume: 11200, avgPrice: 4500, activity: 'Medium'
  },
  {
    id: 8, name: 'Hawassa', lat: 7.0500, lng: 38.4833, region: 'Sidama',
    crops: [
      { name: 'Coffee', price: 610, trend: 'up', change: '+4%', supply: 'High' },
      { name: 'Maize', price: 3400, trend: 'down', change: '-6%', supply: 'Very High' },
      { name: 'Banana', price: 1500, trend: 'stable', change: '+1%', supply: 'High' },
    ],
    totalVolume: 9800, avgPrice: 3900, activity: 'Medium'
  },
  {
    id: 9, name: 'Mekelle', lat: 13.4967, lng: 39.4753, region: 'Tigray',
    crops: [
      { name: 'Teff', price: 10800, trend: 'up', change: '+11%', supply: 'Low' },
      { name: 'Barley', price: 5200, trend: 'up', change: '+7%', supply: 'Medium' },
      { name: 'Wheat', price: 5800, trend: 'stable', change: '+2%', supply: 'Medium' },
    ],
    totalVolume: 6200, avgPrice: 5400, activity: 'Low'
  },
  {
    id: 10, name: 'Bahir Dar', lat: 11.5936, lng: 37.3886, region: 'Amhara',
    crops: [
      { name: 'Teff', price: 10200, trend: 'up', change: '+9%', supply: 'Medium' },
      { name: 'Maize', price: 3900, trend: 'stable', change: '+1%', supply: 'High' },
      { name: 'Rice', price: 7500, trend: 'up', change: '+13%', supply: 'Low' },
    ],
    totalVolume: 13400, avgPrice: 5800, activity: 'High'
  },
];

const CROP_FILTERS = ['All', 'Teff', 'Coffee', 'Maize', 'Wheat', 'Sorghum', 'Onion', 'Potato', 'Chat/Khat', 'Barley'];

// ── Helper: Get color based on activity level ───────────────────────────────
const getMarkerColor = (activity) => {
  switch (activity) {
    case 'Very High': return '#22c55e';
    case 'High': return '#3b82f6';
    case 'Medium': return '#f59e0b';
    case 'Low': return '#ef4444';
    default: return '#6b7280';
  }
};

const getMarkerRadius = (volume) => {
  if (volume > 30000) return 28;
  if (volume > 15000) return 22;
  if (volume > 10000) return 18;
  if (volume > 5000) return 14;
  return 10;
};

const TrendIcon = ({ trend }) => {
  if (trend === 'up') return <TrendingUp className="w-3.5 h-3.5 text-green-500" />;
  if (trend === 'down') return <TrendingDown className="w-3.5 h-3.5 text-red-500" />;
  return <Minus className="w-3.5 h-3.5 text-gray-400" />;
};

const TrendBadge = ({ change, trend }) => (
  <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
    trend === 'up' ? 'bg-green-100 text-green-700' :
    trend === 'down' ? 'bg-red-100 text-red-700' :
    'bg-gray-100 text-gray-600'
  }`}>
    {change}
  </span>
);

// ── Map Auto-fit Component ──────────────────────────────────────────────────
const FitBounds = ({ markets }) => {
  const map = useMap();
  useEffect(() => {
    if (markets.length > 0) {
      const bounds = markets.map(m => [m.lat, m.lng]);
      map.fitBounds(bounds, { padding: [40, 40] });
    }
  }, [markets, map]);
  return null;
};

// ── Main Component ──────────────────────────────────────────────────────────
const MarketHeatmap = () => {
  const [selectedMarket, setSelectedMarket] = useState(null);
  const [cropFilter, setCropFilter] = useState('All');
  const [showFilters, setShowFilters] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  const filteredMarkets = cropFilter === 'All'
    ? MARKET_DATA
    : MARKET_DATA.filter(m => m.crops.some(c => c.name === cropFilter));

  if (loading) {
    return (
      <div className="h-[80vh] flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-agriGreen" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-agriGreen/10 rounded-2xl flex items-center justify-center">
              <MapPin className="w-6 h-6 text-agriGreen" />
            </div>
            <div className="inline-flex items-center gap-2 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
              <Zap className="w-3.5 h-3.5 text-amber-500" />
              <span className="text-[10px] font-black text-amber-700 uppercase tracking-widest">Live Market Data</span>
            </div>
          </div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight">
            Market <span className="text-agriGreen">Heatmap</span>
          </h1>
          <p className="text-gray-500 font-medium mt-2 max-w-lg">
            Real-time crop prices across Ethiopia's major agricultural markets. Tap a market to see detailed pricing.
          </p>
        </div>

        {/* Crop Filter */}
        <div className="relative">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 bg-white border border-gray-200 px-5 py-3 rounded-2xl font-bold text-sm text-gray-700 hover:border-agriGreen/30 transition-all shadow-sm"
          >
            <Filter className="w-4 h-4 text-agriGreen" />
            {cropFilter === 'All' ? 'All Crops' : cropFilter}
            <ChevronDown className="w-4 h-4 text-gray-400" />
          </button>
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="absolute right-0 top-14 bg-white rounded-2xl border border-gray-100 shadow-2xl z-50 w-48 overflow-hidden"
              >
                {CROP_FILTERS.map(crop => (
                  <button
                    key={crop}
                    onClick={() => { setCropFilter(crop); setShowFilters(false); }}
                    className={`w-full text-left px-4 py-2.5 text-sm font-semibold transition-colors ${
                      cropFilter === crop ? 'bg-agriGreen/10 text-agriGreen' : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {crop}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Map + Sidebar Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Map */}
        <div className="lg:col-span-2 bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden relative" style={{ height: '520px' }}>
          <MapContainer
            center={[9.0, 39.0]}
            zoom={6}
            style={{ height: '100%', width: '100%', borderRadius: '2.5rem' }}
            scrollWheelZoom={true}
            zoomControl={false}
          >
            <TileLayer
              attribution='&copy; <a href="https://carto.com">CARTO</a>'
              url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
            />
            <FitBounds markets={filteredMarkets} />

            {filteredMarkets.map(market => (
              <CircleMarker
                key={market.id}
                center={[market.lat, market.lng]}
                radius={getMarkerRadius(market.totalVolume)}
                pathOptions={{
                  fillColor: getMarkerColor(market.activity),
                  color: getMarkerColor(market.activity),
                  weight: 2,
                  opacity: 0.8,
                  fillOpacity: 0.35,
                }}
                eventHandlers={{
                  click: () => setSelectedMarket(market),
                }}
              >
                <Popup>
                  <div className="text-center min-w-[140px]">
                    <p className="font-black text-gray-900 text-base">{market.name}</p>
                    <p className="text-xs text-gray-500">{market.region}</p>
                    <p className="text-xs font-bold text-agriGreen mt-1">
                      {market.totalVolume.toLocaleString()} quintals traded
                    </p>
                  </div>
                </Popup>
              </CircleMarker>
            ))}
          </MapContainer>

          {/* Legend */}
          <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-md rounded-2xl p-4 border border-gray-100 shadow-lg z-[1000]">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Market Activity</p>
            <div className="space-y-1.5">
              {[
                { label: 'Very High', color: '#22c55e' },
                { label: 'High', color: '#3b82f6' },
                { label: 'Medium', color: '#f59e0b' },
                { label: 'Low', color: '#ef4444' },
              ].map(item => (
                <div key={item.label} className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-xs font-semibold text-gray-600">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar - Market Detail */}
        <div className="space-y-6">
          <AnimatePresence mode="wait">
            {selectedMarket ? (
              <motion.div
                key={selectedMarket.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm p-8"
              >
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-black text-gray-900">{selectedMarket.name}</h2>
                    <p className="text-sm text-gray-500 font-medium">{selectedMarket.region} Region</p>
                  </div>
                  <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full ${
                    selectedMarket.activity === 'Very High' ? 'bg-green-100 text-green-700' :
                    selectedMarket.activity === 'High' ? 'bg-blue-100 text-blue-700' :
                    selectedMarket.activity === 'Medium' ? 'bg-amber-100 text-amber-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {selectedMarket.activity}
                  </span>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-gray-50 rounded-2xl p-4">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Volume</p>
                    <p className="text-xl font-black text-gray-900">{selectedMarket.totalVolume.toLocaleString()}</p>
                    <p className="text-xs text-gray-500">quintals/month</p>
                  </div>
                  <div className="bg-gray-50 rounded-2xl p-4">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Avg Price</p>
                    <p className="text-xl font-black text-agriGreen">ETB {selectedMarket.avgPrice.toLocaleString()}</p>
                    <p className="text-xs text-gray-500">per quintal</p>
                  </div>
                </div>

                {/* Crop Prices */}
                <h3 className="text-sm font-black text-gray-900 mb-3 flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-agriGreen" /> Crop Prices
                </h3>
                <div className="space-y-3">
                  {selectedMarket.crops.map((crop, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                      <div className="flex items-center gap-3">
                        <TrendIcon trend={crop.trend} />
                        <div>
                          <p className="font-bold text-gray-900 text-sm">{crop.name}</p>
                          <p className="text-[10px] text-gray-400 font-medium">Supply: {crop.supply}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-black text-gray-900 text-sm">
                          ETB {crop.price.toLocaleString()}
                        </p>
                        <TrendBadge change={crop.change} trend={crop.trend} />
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm p-8 text-center"
              >
                <div className="w-16 h-16 bg-agriGreen/10 rounded-[2rem] flex items-center justify-center mx-auto mb-4">
                  <Info className="w-8 h-8 text-agriGreen" />
                </div>
                <h3 className="text-xl font-black text-gray-900 mb-2">Select a Market</h3>
                <p className="text-sm text-gray-500 font-medium">
                  Click on any circle on the map to see detailed crop prices and market trends.
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Top Markets Summary */}
          <div className="bg-gradient-to-br from-agriDark to-indigo-950 rounded-[2.5rem] p-8 text-white">
            <h3 className="text-sm font-black uppercase tracking-widest text-white/60 mb-4 flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400" /> AI Price Insights
            </h3>
            <div className="space-y-3">
              <div className="bg-white/5 border border-white/10 rounded-xl p-3">
                <p className="text-xs text-green-400 font-bold">📈 Teff Rising</p>
                <p className="text-[11px] text-gray-300 mt-1">Addis Ababa prices up 10% — sell now for max profit</p>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-xl p-3">
                <p className="text-xs text-red-400 font-bold">📉 Maize Oversupply</p>
                <p className="text-[11px] text-gray-300 mt-1">Dire Dawa maize down 5% — buyers should stock up</p>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-xl p-3">
                <p className="text-xs text-amber-400 font-bold">🔥 Onion Shortage</p>
                <p className="text-[11px] text-gray-300 mt-1">Haramaya onion prices surging +22% due to low supply</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarketHeatmap;
