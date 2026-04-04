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
  DollarSign,
  ArrowRight,
  MessageSquare,
  AlertCircle,
  Lightbulb,
  CheckCircle2
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const StatCard = ({ icon: Icon, label, value, trend, color, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, delay }}
    className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-xl transition-all group relative overflow-hidden"
  >
    <div className={`absolute top-0 right-0 w-24 h-24 ${color} opacity-5 rounded-full -mr-12 -mt-12 transition-transform group-hover:scale-110`} />
    <div className="flex items-start justify-between mb-4 relative z-10">
      <div className={`p-3 rounded-2xl bg-opacity-10 ${color.replace('bg-', 'text-')} ${color}`}>
        <Icon className="w-6 h-6" />
      </div>
      {trend && (
        <div className="flex items-center gap-1 text-green-500 text-[10px] font-black bg-green-50 px-2 py-1 rounded-full uppercase tracking-wider">
          <ArrowUpRight className="w-3 h-3" />
          {trend}
        </div>
      )}
    </div>
    <div className="space-y-1 relative z-10">
      <h3 className="text-gray-400 text-xs font-bold uppercase tracking-widest">{label}</h3>
      <p className="text-3xl font-black text-gray-900">{value}</p>
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
      if (!user?.token) return;
      try {
        const config = {
          headers: { Authorization: `Bearer ${user.token}` }
        };
        const [cropsRes, ordersRes] = await Promise.all([
          axios.get('http://localhost:5000/api/crops/farmer', config),
          axios.get('http://localhost:5000/api/orders/myorders', config)
        ]);

        setStats({
          crops: cropsRes.data.length,
          orders: ordersRes.data.length,
          revenue: ordersRes.data.reduce((acc, order) => acc + (order.totalPrice || 0), 0)
        });
        setRecentCrops(cropsRes.data.slice(0, 5));
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, [user]);

  if (loading) return (
    <div className="h-[60vh] flex items-center justify-center">
      <Loader2 className="w-10 h-10 animate-spin text-agriGreen" />
    </div>
  );

  if (!user) return null;

  return (
    <div className="max-w-7xl mx-auto space-y-10 py-8 px-4">
      {/* Welcome Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <motion.h1 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-4xl font-black text-gray-900 tracking-tight"
          >
            Welcome back, <span className="text-agriGreen">{user.name}</span> 👋
          </motion.h1>
          <p className="text-gray-500 font-medium">Your farm at a glance. Let's grow together.</p>
        </div>
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex items-center gap-3"
        >
          <Link to="/dashboard/farmer/crops" className="btn-primary py-4 px-8 rounded-2xl shadow-xl shadow-green-200/50">
            <Plus className="w-5 h-5" />
            Add New Harvest
          </Link>
        </motion.div>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          icon={Leaf} 
          label="Active Listings" 
          value={stats.crops} 
          trend="12%" 
          color="bg-green-500"
          delay={0.1}
        />
        <StatCard 
          icon={Package} 
          label="Incoming Orders" 
          value={stats.orders} 
          trend="5%" 
          color="bg-blue-500"
          delay={0.2}
        />
        <StatCard 
          icon={DollarSign} 
          label="Total Earnings" 
          value={`${stats.revenue.toLocaleString()} ETB`} 
          trend="18%" 
          color="bg-amber-500"
          delay={0.3}
        />
        <StatCard 
          icon={TrendingUp} 
          label="Market Growth" 
          value="24.5%" 
          color="bg-purple-500"
          delay={0.4}
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-10">
        {/* Recent Crops List */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="lg:col-span-2 bg-white rounded-[3rem] border border-gray-100 p-10 shadow-sm overflow-hidden"
        >
          <div className="flex items-center justify-between mb-10">
            <h2 className="text-2xl font-black text-gray-900 flex items-center gap-3">
              <div className="w-2 h-8 bg-agriGreen rounded-full" />
              Latest Harvests
            </h2>
            <Link to="/dashboard/farmer/crops" className="bg-gray-50 text-gray-900 font-black text-xs uppercase tracking-widest px-4 py-2 rounded-xl hover:bg-gray-100 transition-colors flex items-center gap-2">
              Management <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="space-y-4">
            <AnimatePresence>
              {recentCrops.length > 0 ? recentCrops.map((crop, i) => (
                <motion.div 
                  key={crop._id} 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 + i * 0.1 }}
                  className="flex items-center justify-between p-6 rounded-3xl bg-gray-50/50 border border-transparent hover:border-agriGreen/20 hover:bg-white hover:shadow-xl hover:shadow-green-100/20 transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-6">
                    <div className="w-16 h-16 rounded-2xl bg-white border border-gray-100 flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                      {crop.image ? (
                        <img src={crop.image} alt={crop.name} className="w-full h-full object-cover rounded-2xl" />
                      ) : (
                        <Leaf className="text-agriGreen w-8 h-8" />
                      )}
                    </div>
                    <div>
                      <h4 className="font-black text-xl text-gray-900 group-hover:text-agriGreen transition-colors">{crop.name}</h4>
                      <p className="text-xs font-bold text-gray-400 flex items-center gap-2 mt-1 uppercase tracking-wider">
                        <Calendar className="w-3.5 h-3.5" />
                        {new Date(crop.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-black text-2xl text-gray-900">{crop.price} <span className="text-xs text-gray-400">ETB</span></div>
                    <div className="text-[10px] font-black text-agriGreen bg-green-50 px-3 py-1 rounded-full uppercase tracking-widest mt-1">
                      {crop.quantity} {crop.unit || 'kg'} STOCK
                    </div>
                  </div>
                </motion.div>
              )) : (
                <div className="text-center py-20 bg-gray-50 rounded-[2.5rem] border-2 border-dashed border-gray-100">
                  <div className="bg-white p-4 rounded-3xl shadow-sm inline-block mb-4">
                    <Package className="w-8 h-8 text-gray-300" />
                  </div>
                  <p className="text-gray-400 font-bold">Your barn is empty. Start by listing a crop!</p>
                </div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Action Center */}
        <div className="space-y-8">
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-agriGreen rounded-[3rem] p-10 text-white relative overflow-hidden group shadow-2xl shadow-green-200"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-16 -mt-16 blur-2xl transition-transform group-hover:scale-150" />
            <div className="flex items-center gap-3 mb-8 relative z-10">
              <div className="bg-white/20 p-2 rounded-xl">
                <Lightbulb className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-2xl font-black tracking-tight">Farm Intelligence</h2>
            </div>
            <div className="space-y-6 relative z-10">
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/10">
                <div className="flex items-center gap-2 mb-2 text-agriLight">
                  <AlertCircle className="w-4 h-4" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Harvest Alert</span>
                </div>
                <p className="text-sm font-medium leading-relaxed opacity-90">
                  Optimal harvest window for coffee in Harar starts in 3 days. Prepare your listings.
                </p>
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/10">
                <div className="flex items-center gap-2 mb-2 text-agriLight">
                  <TrendingUp className="w-4 h-4" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Market Trend</span>
                </div>
                <p className="text-sm font-medium leading-relaxed opacity-90">
                  Direct buyers from Addis are looking for <span className="font-black underline">high-grade beans</span>.
                </p>
              </div>
              <Link to="/chat" className="flex items-center justify-between w-full bg-white text-agriGreen p-5 rounded-2xl font-black hover:shadow-xl transition-all group/btn">
                <div className="flex items-center gap-3">
                  <MessageSquare className="w-5 h-5" />
                  Consult Expert
                </div>
                <ChevronRight className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />
              </Link>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.7 }}
            className="bg-gray-900 rounded-[3rem] p-10 text-white relative overflow-hidden group shadow-2xl shadow-gray-200"
          >
             <div className="flex justify-between items-start mb-6">
                <div>
                   <h3 className="text-xl font-black">Platform Status</h3>
                   <p className="text-gray-400 text-xs font-medium mt-1">Verified Seller Profile</p>
                </div>
                <div className="bg-emerald-500/10 text-emerald-500 p-2 rounded-xl">
                   <CheckCircle2 className="w-6 h-6" />
                </div>
             </div>
             <div className="space-y-4">
                <div className="flex justify-between items-center text-sm font-bold">
                   <span className="text-gray-400">Profile Rating</span>
                   <span className="text-agriLight">4.9/5.0</span>
                </div>
                <div className="h-1.5 w-full bg-gray-800 rounded-full overflow-hidden">
                   <div className="h-full bg-agriGreen w-[98%] rounded-full" />
                </div>
             </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default FarmerDashboard;
