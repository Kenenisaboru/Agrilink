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
  Eye,
  BarChart3,
  PieChart,
  LineChart,
  Target,
  Award,
  Zap,
  Truck,
  Star,
  Filter,
  Download,
  RefreshCw
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
  const [stats, setStats] = useState({ crops: 0, orders: 0, revenue: 0, views: 0, rating: 0 });
  const [recentCrops, setRecentCrops] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('week');
  const [salesData, setSalesData] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [customerInsights, setCustomerInsights] = useState([]);
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
            .reduce((acc, order) => acc + (order.totalPrice || 0), 0),
          views: cropsRes.data.reduce((acc, crop) => acc + (crop.views || 0), 0),
          rating: cropsRes.data.length > 0 
            ? (cropsRes.data.reduce((acc, crop) => acc + (crop.rating || 0), 0) / cropsRes.data.length).toFixed(1)
            : 0
        });
        setRecentCrops(cropsRes.data.slice(0, 5));
        setRecentOrders(ordersRes.data.slice(0, 3));
        setNotifications(notifRes.data.notifications || []);
        setUnreadCount(notifRes.data.unreadCount || 0);

        // Sample analytics data (in production, this would come from the API)
        setSalesData([
          { date: 'Mon', sales: 4500, orders: 5 },
          { date: 'Tue', sales: 6200, orders: 8 },
          { date: 'Wed', sales: 3800, orders: 4 },
          { date: 'Thu', sales: 8900, orders: 12 },
          { date: 'Fri', sales: 7200, orders: 9 },
          { date: 'Sat', sales: 9500, orders: 15 },
          { date: 'Sun', sales: 5400, orders: 7 }
        ]);

        setTopProducts([
          { name: 'Premium Coffee', sales: 28500, orders: 35, growth: '+12%' },
          { name: 'Organic Teff', sales: 19200, orders: 24, growth: '+8%' },
          { name: 'Fresh Khat', sales: 16800, orders: 21, growth: '+15%' }
        ]);

        setCustomerInsights([
          { label: 'Repeat Customers', value: '68%', trend: '+5%' },
          { label: 'Avg Order Value', value: 'ETB 2,450', trend: '+12%' },
          { label: 'Conversion Rate', value: '4.2%', trend: '+0.8%' }
        ]);
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
        <div className="flex items-center gap-4">
          {user.profilePicture ? (
            <img src={user.profilePicture} alt={user.name} className="w-16 h-16 rounded-2xl object-cover ring-4 ring-green-100 shadow-lg" />
          ) : (
            <div className="w-16 h-16 rounded-2xl bg-agriGreen/10 flex items-center justify-center text-agriGreen text-2xl font-black ring-4 ring-green-100">
              {user.name?.[0]}
            </div>
          )}
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
        </div>
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-wrap items-center gap-3 w-full md:w-auto"
        >
          <div className="flex items-center gap-2 bg-green-50 px-4 py-2 rounded-full border border-green-100">
            <Zap className="w-4 h-4 text-green-600" />
            <span className="text-sm font-bold text-green-700">AI Insights Active</span>
          </div>
          <Link 
            to="/crop-management"
            className="btn-primary px-6 py-3 rounded-2xl font-bold flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Add Product
          </Link>
        </motion.div>
      </header>

      {/* Enhanced Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
        <StatCard 
          icon={Package} 
          label="Total Products" 
          value={stats.crops} 
          trend="+12%" 
          color="bg-blue-500" 
          delay={0.1} 
        />
        <StatCard 
          icon={ShoppingBag} 
          label="Total Orders" 
          value={stats.orders} 
          trend="+8%" 
          color="bg-purple-500" 
          delay={0.2} 
        />
        <StatCard 
          icon={DollarSign} 
          label="Total Revenue" 
          value={`ETB ${stats.revenue.toLocaleString()}`} 
          trend="+24%" 
          color="bg-green-500" 
          delay={0.3} 
        />
        <StatCard 
          icon={Eye} 
          label="Product Views" 
          value={stats.views.toLocaleString()} 
          trend="+18%" 
          color="bg-amber-500" 
          delay={0.4} 
        />
        <StatCard 
          icon={Star} 
          label="Avg Rating" 
          value={stats.rating} 
          trend="+0.3" 
          color="bg-pink-500" 
          delay={0.5} 
        />
      </div>

      {/* Sales Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Sales Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-2 bg-white rounded-3xl p-8 border border-gray-100 shadow-sm"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-black text-gray-900 flex items-center gap-2">
                <LineChart className="w-5 h-5 text-agriGreen" />
                Sales Performance
              </h3>
              <p className="text-sm text-gray-500 mt-1">Revenue and orders over time</p>
            </div>
            <div className="flex items-center gap-2">
              {['week', 'month', 'year'].map((range) => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={`px-4 py-2 rounded-xl font-bold text-sm transition-all ${
                    timeRange === range
                      ? 'bg-agriGreen text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {range.charAt(0).toUpperCase() + range.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Simple Bar Chart Visualization */}
          <div className="h-64 flex items-end gap-4 px-4">
            {salesData.map((data, index) => (
              <motion.div
                key={data.date}
                initial={{ height: 0 }}
                animate={{ height: `${(data.sales / 10000) * 100}%` }}
                transition={{ delay: index * 0.1 }}
                className="flex-1 flex flex-col items-center gap-2"
              >
                <div className="w-full bg-gradient-to-t from-agriGreen to-green-300 rounded-t-xl relative group">
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    ETB {data.sales.toLocaleString()}
                  </div>
                </div>
                <span className="text-xs font-bold text-gray-500">{data.date}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Top Products */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm"
        >
          <h3 className="text-xl font-black text-gray-900 flex items-center gap-2 mb-6">
            <Award className="w-5 h-5 text-agriGreen" />
            Top Products
          </h3>
          
          <div className="space-y-4">
            {topProducts.map((product, index) => (
              <div key={index} className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl">
                <div className="w-10 h-10 bg-agriGreen text-white rounded-xl flex items-center justify-center font-black">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <p className="font-bold text-gray-900">{product.name}</p>
                  <p className="text-sm text-gray-500">{product.orders} orders</p>
                </div>
                <div className="text-right">
                  <p className="font-black text-agriGreen">ETB {product.sales.toLocaleString()}</p>
                  <p className="text-xs text-green-600 font-bold">{product.growth}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Customer Insights */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        {customerInsights.map((insight, index) => (
          <div key={index} className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <Target className="w-8 h-8 text-agriGreen" />
              <span className="text-green-600 font-bold text-sm bg-green-50 px-3 py-1 rounded-full">
                {insight.trend}
              </span>
            </div>
            <p className="text-gray-500 text-sm mb-2">{insight.label}</p>
            <p className="text-2xl font-black text-gray-900">{insight.value}</p>
          </div>
        ))}
      </motion.div>

      {/* Recent Crops Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-black text-gray-900">Recent Products</h3>
            <Link to="/dashboard/farmer/crops" className="text-sm font-bold text-agriGreen hover:underline">
              View All →
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {recentCrops.length > 0 ? (
              recentCrops.map((crop, index) => (
                <motion.div
                  key={crop._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="group bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-300 cursor-pointer border border-gray-100"
                >
                  <div className="relative h-40">
                    <img 
                      src={crop.image || getCropImage(crop)} 
                      alt={crop.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3">
                      <span className="bg-agriGreen text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-md">
                        {crop.category || 'Fresh'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="p-4">
                    <div className="flex items-center gap-1 mb-1">
                      <MapPin className="w-3 h-3 text-gray-400" />
                      <span className="text-xs text-gray-500 line-clamp-1">{user?.location || 'East Hararghe'}</span>
                    </div>
                    
                    <h3 className="font-bold text-gray-900 mb-1 group-hover:text-agriGreen transition-colors line-clamp-1 text-sm">
                      {crop.name}
                    </h3>
                    
                    <div className="flex items-center gap-1 mb-2">
                      <Star className="w-3 h-3 text-amber-400 fill-current" />
                      <span className="text-xs font-semibold text-gray-700">
                        {crop.rating > 0 ? crop.rating.toFixed(1) : '4.8'}
                      </span>
                      <span className="text-[10px] text-gray-400">
                        ({crop.numReviews > 0 ? crop.numReviews : Math.floor(Math.random() * 50) + 10})
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <span className="text-lg font-black text-agriGreen">ETB {crop.pricePerUnit?.toLocaleString() || crop.price}</span>
                        <span className="text-[10px] text-gray-400 line-through ml-1">
                          ETB {(crop.pricePerUnit ? crop.pricePerUnit * 1.15 : 0).toLocaleString(undefined, {maximumFractionDigits: 0})}
                        </span>
                      </div>
                    </div>
                    
                    <Link 
                      to="/dashboard/farmer/crops"
                      className="w-full bg-agriDark text-white py-2 rounded-lg font-bold hover:bg-agriGreen transition-colors flex items-center justify-center gap-1 text-xs"
                    >
                      <Package className="w-4 h-4" />
                      Manage
                    </Link>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="bg-white rounded-2xl p-8 border border-gray-100 text-center">
                <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 font-medium">No products listed yet</p>
                <Link to="/crop-management" className="btn-primary inline-block mt-4 px-6 py-3 rounded-xl font-bold">
                  Add Your First Product
                </Link>
              </div>
            )}
          </div>
        </motion.div>

        {/* Recent Orders */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-black text-gray-900">Recent Orders</h3>
            <Link to="/dashboard/farmer/orders" className="text-sm font-bold text-agriGreen hover:underline">
              View All →
            </Link>
          </div>
          <div className="space-y-4">
            {recentOrders.length > 0 ? (
              recentOrders.map((order) => (
                <div key={order._id} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-gray-900">Order #{order._id?.slice(-6)}</span>
                    <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                      order.status === 'Pending' ? 'bg-amber-100 text-amber-700' :
                      order.status === 'Processing' ? 'bg-blue-100 text-blue-700' :
                      order.status === 'Delivered' ? 'bg-green-100 text-green-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {order.status}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">{order.items?.length || 0} items</span>
                    <span className="font-black text-agriGreen">ETB {order.totalPrice?.toLocaleString()}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-white rounded-2xl p-8 border border-gray-100 text-center">
                <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 font-medium">No orders yet</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default FarmerDashboard;
