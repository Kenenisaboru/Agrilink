import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { 
  Leaf, 
  Package, 
  TrendingUp, 
  Plus, 
  ChevronRight, 
  ArrowUpRight,
  Loader2,
  Calendar,
  DollarSign
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const StatCard = ({ icon: Icon, label, value, trend, color, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, delay }}
    className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group"
  >
    <div className={`absolute top-0 right-0 w-24 h-24 ${color} opacity-5 rounded-full -mr-12 -mt-12 transition-transform group-hover:scale-110`} />
    <div className="flex items-start justify-between mb-4">
      <div className={`p-3 rounded-2xl bg-opacity-10 ${color.replace('bg-', 'text-')} ${color}`}>
        <Icon className="w-6 h-6" />
      </div>
      {trend && (
        <div className="flex items-center gap-1 text-green-500 text-xs font-bold bg-green-50 px-2 py-1 rounded-full">
          <ArrowUpRight className="w-3 h-3" />
          {trend}
        </div>
      )}
    </div>
    <div className="space-y-1">
      <h3 className="text-gray-500 text-sm font-medium">{label}</h3>
      <p className="text-2xl font-black text-gray-900">{value}</p>
    </div>
  </motion.div>
);

const FarmerDashboard = () => {
  const [stats, setStats] = useState({ crops: 0, orders: 0, revenue: 0 });
  const [recentCrops, setRecentCrops] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [cropsRes, ordersRes] = await Promise.all([
          axios.get('http://localhost:5000/api/crops/farmer', {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
          }),
          axios.get('http://localhost:5000/api/orders/farmer', {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
          })
        ]);

        setStats({
          crops: cropsRes.data.length,
          orders: ordersRes.data.length,
          revenue: ordersRes.data.reduce((acc, order) => acc + (order.totalPrice || 0), 0)
        });
        setRecentCrops(cropsRes.data.slice(0, 3));
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  if (loading) return (
    <div className="h-[60vh] flex items-center justify-center">
      <Loader2 className="w-10 h-10 animate-spin text-agriGreen" />
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto space-y-10 py-6">
      {/* Welcome Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <motion.h1 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-4xl font-black text-gray-900 tracking-tight"
          >
            Hello, <span className="text-agriGreen">{user.name}</span> 👋
          </motion.h1>
          <p className="text-gray-500 font-medium mt-1">Here's what's happening on your farm today.</p>
        </div>
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-3"
        >
          <Link to="/dashboard/farmer/crops" className="btn-primary py-3 rounded-2xl shadow-green-200/50">
            <Plus className="w-5 h-5" />
            Add New Crop
          </Link>
        </motion.div>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          icon={Leaf} 
          label="Active Crops" 
          value={stats.crops} 
          trend="+12%" 
          color="bg-green-500"
          delay={0.1}
        />
        <StatCard 
          icon={Package} 
          label="Total Orders" 
          value={stats.orders} 
          trend="+5%" 
          color="bg-blue-500"
          delay={0.2}
        />
        <StatCard 
          icon={DollarSign} 
          label="Total Revenue" 
          value={`$${stats.revenue.toLocaleString()}`} 
          trend="+18%" 
          color="bg-amber-500"
          delay={0.3}
        />
        <StatCard 
          icon={TrendingUp} 
          label="Growth Rate" 
          value="24.5%" 
          color="bg-purple-500"
          delay={0.4}
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Recent Crops List */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="lg:col-span-2 bg-white rounded-[2.5rem] border border-gray-100 p-8 shadow-sm"
        >
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-black text-gray-900">Recent Crops</h2>
            <Link to="/dashboard/farmer/crops" className="text-agriGreen font-bold flex items-center gap-1 hover:underline">
              View All <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="space-y-4">
            {recentCrops.length > 0 ? recentCrops.map((crop, i) => (
              <div key={crop._id} className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 border border-gray-100 group hover:border-agriGreen/30 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center shadow-sm">
                    <Leaf className="text-agriGreen w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">{crop.name}</h4>
                    <p className="text-sm text-gray-500 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      Listed on {new Date(crop.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-black text-gray-900">${crop.price}</div>
                  <div className="text-xs font-bold text-agriGreen bg-green-100 px-2 py-0.5 rounded-full inline-block">
                    {crop.quantity} {crop.unit || 'kg'}
                  </div>
                </div>
              </div>
            )) : (
              <div className="text-center py-12">
                <p className="text-gray-400 font-medium">No crops listed yet.</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Quick Actions / Tips */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-agriGreen rounded-[2.5rem] p-8 text-white relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl" />
          <h2 className="text-2xl font-black mb-6 relative z-10">Farming Tips</h2>
          <div className="space-y-6 relative z-10">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10">
              <p className="text-sm font-medium leading-relaxed">
                Soil moisture levels are optimal this week. Consider starting your harvest for early crops.
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10">
              <p className="text-sm font-medium leading-relaxed">
                Market demand for <span className="font-black underline">Onions</span> is up by 15% in East Hararghe.
              </p>
            </div>
            <Link to="/chat" className="flex items-center justify-between w-full bg-white text-agriGreen p-4 rounded-2xl font-black hover:bg-gray-50 transition-colors">
              Consult a Student
              <ChevronRight className="w-5 h-5" />
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default FarmerDashboard;
