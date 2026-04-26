import React from 'react';
import { motion } from 'framer-motion';
import {
  MapPin,
  Navigation,
  Truck,
  Package,
  Clock,
  CheckCircle,
  Route,
  Satellite,
  Shield,
  ArrowRight
} from 'lucide-react';

const GPSTracker = () => {
  const trackingData = {
    order_id: 'ORD-2026-0426-001',
    destination: 'Harar, East Hararghe',
    current_location: 'Dire Dawa',
    progress: 65,
    estimated_arrival: '2 hours 30 minutes',
    driver: {
      name: 'Mohammed Ahmed',
      phone: '+251 911 234 567',
      rating: 4.8
    },
    checkpoints: [
      { location: 'Addis Ababa', time: '8:00 AM', status: 'completed' },
      { location: 'Adama', time: '10:30 AM', status: 'completed' },
      { location: 'Dire Dawa', time: '1:00 PM', status: 'current' },
      { location: 'Harar', time: '3:30 PM', status: 'pending' }
    ],
    coordinates: {
      lat: 9.59,
      lng: 41.86
    },
    status: 'in_transit'
  };

  const isTracking = true;

  return (
    <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 text-white py-8 md:py-12 relative overflow-hidden">
      {/* Animated Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          backgroundSize: '60px 60px'
        }} />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-6 md:mb-8"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="bg-green-500 p-2 md:p-3 rounded-full animate-pulse">
              <Satellite className="w-5 h-5 md:w-6 md:h-6" />
            </div>
            <h2 className="text-2xl md:text-3xl font-black">Live GPS Tracking</h2>
          </div>
          <p className="text-blue-200 text-base md:text-lg">Track your agricultural products in real-time</p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-4 md:gap-6">
          {/* Main Tracking Card */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="lg:col-span-2 bg-white/10 backdrop-blur-lg rounded-2xl md:rounded-3xl p-4 md:p-6 border border-white/20"
          >
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 md:mb-6 gap-3">
              <div className="flex items-center gap-3">
                <div className="bg-green-500 p-2 rounded-xl">
                  <Truck className="w-4 h-4 md:w-5 md:h-5" />
                </div>
                <div>
                  <p className="text-xs md:text-sm text-blue-200">Order ID</p>
                  <p className="font-bold text-sm md:text-base">{trackingData.order_id}</p>
                </div>
              </div>
              <div className={`flex items-center gap-2 px-3 md:px-4 py-2 rounded-full ${isTracking ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                <div className={`w-2 h-2 rounded-full ${isTracking ? 'bg-green-400 animate-pulse' : 'bg-yellow-400'}`} />
                <span className="text-xs md:text-sm font-bold">{isTracking ? 'Live' : 'Paused'}</span>
              </div>
            </div>

            {/* Map Image Showcase */}
            <div className="relative mb-4 md:mb-6 rounded-xl md:rounded-2xl overflow-hidden bg-white/5 border border-white/10">
              <img
                src="https://images.unsplash.com/photo-1524661135-423995f22d0b?w=800&q=80"
                alt="GPS Tracking Map"
                className="w-full h-32 md:h-48 object-cover opacity-80"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-blue-900/80 to-transparent" />
              <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-xs md:text-sm font-bold">Live Map View</span>
                </div>
                <button className="bg-white/20 hover:bg-white/30 backdrop-blur-md px-3 py-1 md:px-4 md:py-2 rounded-lg text-xs md:text-sm font-bold transition-colors">
                  Full Map
                </button>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-4 md:mb-6">
              <div className="flex justify-between text-xs md:text-sm mb-2">
                <span className="text-blue-200">Delivery Progress</span>
                <span className="font-bold">{trackingData.progress}%</span>
              </div>
              <div className="h-2 md:h-3 bg-white/20 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  whileInView={{ width: `${trackingData.progress}%` }}
                  viewport={{ once: true }}
                  transition={{ duration: 1, delay: 0.3 }}
                  className="h-full bg-gradient-to-r from-green-400 to-emerald-500 rounded-full"
                />
              </div>
            </div>

            {/* Route Visualization - Mobile Optimized */}
            <div className="relative mb-4 md:mb-6">
              <div className="flex items-start sm:items-center justify-between gap-2 sm:gap-0">
                {trackingData.checkpoints.map((checkpoint, index) => (
                  <div key={index} className="flex flex-col items-center relative flex-1">
                    <div className={`w-8 h-8 md:w-12 md:h-12 rounded-full flex items-center justify-center ${
                      checkpoint.status === 'completed' ? 'bg-green-500' :
                      checkpoint.status === 'current' ? 'bg-blue-500 animate-pulse' :
                      'bg-white/20'
                    }`}>
                      {checkpoint.status === 'completed' ? (
                        <CheckCircle className="w-4 h-4 md:w-6 md:h-6" />
                      ) : checkpoint.status === 'current' ? (
                        <Navigation className="w-4 h-4 md:w-6 md:h-6" />
                      ) : (
                        <MapPin className="w-4 h-4 md:w-6 md:h-6" />
                      )}
                    </div>
                    <p className="text-[10px] md:text-xs mt-1 md:mt-2 font-bold text-center truncate w-full">{checkpoint.location}</p>
                    <p className="text-[8px] md:text-[10px] text-blue-200">{checkpoint.time}</p>
                  </div>
                ))}
              </div>
              {/* Connecting Line */}
              <div className="absolute top-4 md:top-6 left-8 md:left-12 right-8 md:right-12 h-1 bg-white/20 -z-10">
                <motion.div
                  initial={{ width: 0 }}
                  whileInView={{ width: `${trackingData.progress}%` }}
                  viewport={{ once: true }}
                  transition={{ duration: 1, delay: 0.3 }}
                  className="h-full bg-gradient-to-r from-green-400 to-blue-500"
                />
              </div>
            </div>

            {/* Current Location Info */}
            <div className="grid grid-cols-2 gap-3 md:gap-4">
              <div className="bg-white/10 rounded-xl md:rounded-2xl p-3 md:p-4">
                <div className="flex items-center gap-2 mb-2">
                  <MapPin className="w-3 h-3 md:w-4 md:h-4 text-blue-400" />
                  <span className="text-xs md:text-sm text-blue-200">Current</span>
                </div>
                <p className="font-bold text-xs md:text-sm">{trackingData.current_location}</p>
              </div>
              <div className="bg-white/10 rounded-xl md:rounded-2xl p-3 md:p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-3 h-3 md:w-4 md:h-4 text-blue-400" />
                  <span className="text-xs md:text-sm text-blue-200">ETA</span>
                </div>
                <p className="font-bold text-xs md:text-sm">{trackingData.estimated_arrival}</p>
              </div>
            </div>
          </motion.div>

          {/* Driver Info Card - Mobile Stacked */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="space-y-4 md:space-y-6"
          >
            {/* Driver Profile */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl md:rounded-3xl p-4 md:p-6 border border-white/20">
              <h3 className="font-bold mb-3 md:mb-4 flex items-center gap-2 text-sm md:text-base">
                <Shield className="w-4 h-4 md:w-5 md:h-5 text-green-400" />
                Driver
              </h3>
              <div className="flex items-center gap-3 md:gap-4 mb-3 md:mb-4">
                <div className="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center text-lg md:text-2xl font-black">
                  {trackingData.driver.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <p className="font-bold text-sm md:text-base">{trackingData.driver.name}</p>
                  <div className="flex items-center gap-1 text-xs md:text-sm text-yellow-400">
                    <span>★</span>
                    <span>{trackingData.driver.rating}</span>
                  </div>
                </div>
              </div>
              <a
                href={`tel:${trackingData.driver.phone}`}
                className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-2 md:py-3 rounded-xl md:rounded-2xl flex items-center justify-center gap-2 transition-colors text-sm md:text-base"
              >
                <Truck className="w-4 h-4 md:w-5 md:h-5" />
                Call Driver
              </a>
            </div>

            {/* Package Info */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl md:rounded-3xl p-4 md:p-6 border border-white/20">
              <h3 className="font-bold mb-3 md:mb-4 flex items-center gap-2 text-sm md:text-base">
                <Package className="w-4 h-4 md:w-5 md:h-5 text-blue-400" />
                Package
              </h3>
              <div className="space-y-2 md:space-y-3">
                <div className="flex justify-between">
                  <span className="text-blue-200 text-xs md:text-sm">Destination</span>
                  <span className="font-bold text-xs md:text-sm text-right">{trackingData.destination}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-200 text-xs md:text-sm">Status</span>
                  <span className="text-green-400 font-bold text-xs md:text-sm capitalize">{trackingData.status.replace('_', ' ')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-200 text-xs md:text-sm">GPS</span>
                  <span className="font-bold text-xs md:text-sm">{trackingData.coordinates.lat.toFixed(2)}, {trackingData.coordinates.lng.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Track Another Order */}
            <button className="w-full bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold py-3 md:py-4 rounded-xl md:rounded-2xl flex items-center justify-center gap-2 transition-all text-sm md:text-base">
              <Route className="w-4 h-4 md:w-5 md:h-5" />
              Track Another
              <ArrowRight className="w-4 h-4 md:w-5 md:h-5" />
            </button>
          </motion.div>
        </div>

        {/* Trust Badges - Mobile Responsive */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-6 md:mt-8 flex flex-wrap justify-center gap-3 md:gap-6"
        >
          {[
            { icon: Shield, text: 'Secure' },
            { icon: Satellite, text: 'Real-time GPS' },
            { icon: CheckCircle, text: 'Verified' },
            { icon: Package, text: 'Insured' }
          ].map((badge, index) => (
            <div key={index} className="flex items-center gap-1 md:gap-2 text-xs md:text-sm text-blue-200">
              <badge.icon className="w-3 h-3 md:w-4 md:h-4 text-green-400" />
              <span>{badge.text}</span>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default GPSTracker;
