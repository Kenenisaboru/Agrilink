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
  CheckCircle2,
  Smartphone,
  Bell,
  X,
  ShoppingBag,
  User,
  MapPin,
  Clock,
  Eye
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { getCropImage } from '../utils/cropUtils';

/**
 * StatCard Component - Reusable dashboard stat display
 */
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


/**
 * FarmerDashboard - Main page for farmers
 * 
 * Includes:
 * - Stats overview (crops, orders, earnings)
 * - Recent crops list
 * - 🔔 Notification bell with dropdown
 * - Recent incoming orders preview
 * - Farm intelligence cards
 */
const FarmerDashboard = () => {
  const [stats, setStats] = useState({ crops: 0, orders: 0, revenue: 0 });
  const [recentCrops, setRecentCrops] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user?.token) return;
      try {
        const config = {
          headers: { Authorization: `Bearer ${user.token}` }
        };
        
        // Fetch crops, orders, and notifications in parallel
        const [cropsRes, ordersRes, notifRes] = await Promise.all([
          axios.get('/api/crops/farmer/mycrops', config),
          axios.get('/api/orders/farmer/orders', config),
          axios.get('/api/notifications', config).catch(() => ({ data: { notifications: [], unreadCount: 0 } })),
        ]);

        setStats({
          crops: cropsRes.data.length,
          orders: ordersRes.data.length,
          revenue: ordersRes.data
            .filter(o => o.paymentStatus === 'Paid')
            .reduce((acc, order) => acc + (order.totalPrice || 0), 0)
        });
        setRecentCrops(cropsRes.data.slice(0, 5));
        setRecentOrders(ordersRes.data.slice(0, 3));
        setNotifications(notifRes.data.notifications || []);
        setUnreadCount(notifRes.data.unreadCount || 0);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, [user]);

  // Mark a notification as read
  const markNotificationRead = async (notifId) => {
    try {
      await axios.put(`/api/notifications/${notifId}/read`);
      setNotifications(prev => prev.map(n => n._id === notifId ? { ...n, isRead: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  // Mark all as read
  const markAllRead = async () => {
    try {
      await axios.put('/api/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
    }
  };

  if (loading) return (
    <div className="h-[60vh] flex items-center justify-center">
      <Loader2 className="w-10 h-10 animate-spin text-agriGreen" />
    </div>
  );

  if (!user) return null;

  return (
    <div className="max-w-7xl mx-auto space-y-10 py-8 px-4">
      {/* Welcome Header with Notification Bell */}
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
          className="flex flex-wrap items-center gap-3 w-full md:w-auto"
        >
          {/* 🔔 Notification Bell */}
          <div className="relative">
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-3 bg-white border border-gray-100 rounded-2xl hover:bg-gray-50 transition-colors shadow-sm"
            >
              <Bell className="w-6 h-6 text-gray-700" />
              {unreadCount > 0 && (
                <motion.span 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center ring-2 ring-white"
                >
                  {unreadCount > 9 ? '9+' : unreadCount}
                </motion.span>
              )}
            </button>

            {/* Notification Dropdown */}
            <AnimatePresence>
              {showNotifications && (
                <>
                  {/* Overlay */}
                  <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setShowNotifications(false)} 
                  />
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 top-16 w-[calc(100vw-2rem)] md:w-96 bg-white rounded-3xl shadow-2xl border border-gray-100 z-50 overflow-hidden"
                  >
                    {/* Dropdown Header */}
                    <div className="p-5 border-b border-gray-50 flex items-center justify-between">
                      <h3 className="font-black text-gray-900 text-lg">Notifications</h3>
                      <div className="flex items-center gap-2">
                        {unreadCount > 0 && (
                          <button 
                            onClick={markAllRead}
                            className="text-xs font-bold text-agriGreen hover:underline"
                          >
                            Mark all read
                          </button>
                        )}
                        <button onClick={() => setShowNotifications(false)} className="p-1 hover:bg-gray-100 rounded-lg">
                          <X className="w-4 h-4 text-gray-400" />
                        </button>
                      </div>
                    </div>

                    {/* Notification List */}
                    <div className="max-h-96 overflow-y-auto custom-scrollbar">
                      {notifications.length > 0 ? (
                        notifications.slice(0, 10).map((notif) => (
                          <div
                            key={notif._id}
                            onClick={() => markNotificationRead(notif._id)}
                            className={`p-4 border-b border-gray-50 hover:bg-gray-50 transition-colors cursor-pointer ${
                              !notif.isRead ? 'bg-green-50/30' : ''
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              <div className={`p-2 rounded-xl shrink-0 ${
                                notif.type === 'NEW_ORDER' ? 'bg-green-100 text-green-600' :
                                notif.type === 'PAYMENT_SUCCESS' ? 'bg-blue-100 text-blue-600' :
                                'bg-gray-100 text-gray-500'
                              }`}>
                                {notif.type === 'NEW_ORDER' ? <ShoppingBag className="w-4 h-4" /> :
                                 notif.type === 'PAYMENT_SUCCESS' ? <CheckCircle2 className="w-4 h-4" /> :
                                 <Bell className="w-4 h-4" />}
                              </div>
                              <div className="flex-grow min-w-0">
                                <div className="flex items-center gap-2">
                                  <p className="text-sm font-black text-gray-900 truncate">{notif.title}</p>
                                  {!notif.isRead && (
                                    <span className="w-2 h-2 bg-agriGreen rounded-full shrink-0" />
                                  )}
                                </div>
                                <p className="text-xs text-gray-500 mt-1 line-clamp-2">{notif.message}</p>
                                <p className="text-[10px] text-gray-400 font-bold mt-2 uppercase tracking-wider flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {new Date(notif.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="p-10 text-center">
                          <Bell className="w-10 h-10 text-gray-200 mx-auto mb-3" />
                          <p className="text-gray-400 font-bold text-sm">No notifications yet</p>
                          <p className="text-gray-300 text-xs mt-1">You'll be notified when buyers order your crops</p>
                        </div>
                      )}
                    </div>

                    {/* View All Link */}
                    <Link 
                      to="/dashboard/farmer/orders"
                      onClick={() => setShowNotifications(false)}
                      className="block p-4 text-center text-sm font-black text-agriGreen hover:bg-gray-50 transition-colors border-t border-gray-50"
                    >
                      View All Orders →
                    </Link>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>

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
          trend={stats.orders > 0 ? `${stats.orders} new` : undefined} 
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
        {/* Left Column: Recent Crops + Recent Orders */}
        <div className="lg:col-span-2 space-y-10">
          {/* Recent Orders (NEW!) */}
          {recentOrders.length > 0 && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45 }}
              className="bg-white rounded-[3rem] border border-gray-100 p-10 shadow-sm"
            >
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-black text-gray-900 flex items-center gap-3">
                  <div className="w-2 h-8 bg-blue-500 rounded-full" />
                  Recent Orders
                </h2>
                <Link to="/dashboard/farmer/orders" className="bg-gray-50 text-gray-900 font-black text-xs uppercase tracking-widest px-4 py-2 rounded-xl hover:bg-gray-100 transition-colors flex items-center gap-2">
                  View All <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              <div className="space-y-4">
                {recentOrders.map((order, i) => (
                  <motion.div 
                    key={order._id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + i * 0.1 }}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-5 rounded-2xl bg-gray-50/50 border border-transparent hover:border-blue-100 hover:bg-white hover:shadow-md transition-all gap-4"
                  >
                    <div className="flex flex-wrap sm:flex-nowrap items-center gap-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                        order.paymentStatus === 'Paid' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
                      }`}>
                        {order.paymentStatus === 'Paid' ? <CheckCircle2 className="w-6 h-6" /> : <Clock className="w-6 h-6" />}
                      </div>
                      <div>
                        <p className="font-black text-gray-900">
                          {order.orderItems?.[0]?.name || 'Order'} 
                          {order.orderItems?.length > 1 ? ` +${order.orderItems.length - 1} more` : ''}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <User className="w-3 h-3 text-gray-400" />
                          <span className="text-xs text-gray-400 font-bold">{order.buyer?.name || 'Buyer'}</span>
                          <span className="text-gray-300">•</span>
                          <Calendar className="w-3 h-3 text-gray-400" />
                          <span className="text-xs text-gray-400 font-bold">
                            {new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-left sm:text-right">
                      <p className="font-black text-agriGreen text-lg">{order.totalPrice?.toLocaleString()} <span className="text-xs text-gray-400">ETB</span></p>
                      <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
                        order.paymentStatus === 'Paid' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                      }`}>
                        {order.paymentStatus || order.status}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Recent Crops List */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white rounded-[3rem] border border-gray-100 p-10 shadow-sm overflow-hidden"
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
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-6 rounded-3xl bg-gray-50/50 border border-transparent hover:border-agriGreen/20 hover:bg-white hover:shadow-xl hover:shadow-green-100/20 transition-all cursor-pointer group gap-4"
                  >
                    <div className="flex items-center gap-4 md:gap-6">
                      <div className="w-16 h-16 rounded-2xl bg-white border border-gray-100 flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform overflow-hidden">
                        <img src={getCropImage(crop)} alt={crop.name} className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <h4 className="font-black text-xl text-gray-900 group-hover:text-agriGreen transition-colors">{crop.name}</h4>
                        <p className="text-xs font-bold text-gray-400 flex items-center gap-2 mt-1 uppercase tracking-wider">
                          <Calendar className="w-3.5 h-3.5" />
                          {new Date(crop.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                        </p>
                      </div>
                    </div>
                    <div className="text-left sm:text-right">
                      <div className="font-black text-2xl text-gray-900">{crop.pricePerUnit} <span className="text-xs text-gray-400">ETB</span></div>
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
        </div>

        {/* Right Column: Action Center */}
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

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.8 }}
            className="bg-white rounded-[3rem] p-10 border border-gray-100 shadow-sm"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-amber-100 p-2 rounded-xl text-amber-600">
                <Smartphone className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-black text-gray-900">Payment Status</h2>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600 text-[10px] font-black">TB</div>
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">Telebirr</p>
                    <p className="text-sm font-bold text-gray-900 mt-1">{user.telebirrNumber || 'Not Linked'}</p>
                  </div>
                </div>
                {user.telebirrNumber && <CheckCircle2 className="w-4 h-4 text-agriGreen" />}
              </div>
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center text-purple-600 text-[10px] font-black">CBE</div>
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">CBE Account</p>
                    <p className="text-sm font-bold text-gray-900 mt-1">{user.cbeAccountNumber || 'Not Linked'}</p>
                  </div>
                </div>
                {user.cbeAccountNumber && <CheckCircle2 className="w-4 h-4 text-agriGreen" />}
              </div>
              <button className="w-full py-4 bg-gray-50 text-gray-500 font-bold rounded-2xl text-xs uppercase tracking-widest hover:bg-gray-100 transition-colors mt-2">
                Manage Methods
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default FarmerDashboard;
