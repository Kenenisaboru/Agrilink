import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { 
  BarChart3, 
  Users, 
  ShoppingBag, 
  AlertCircle, 
  CheckCircle, 
  Clock, 
  ArrowUpRight, 
  ArrowDownRight, 
  Search,
  Shield,
  ShieldCheck,
  Activity,
  Database,
  Cloud,
  CreditCard,
  Download,
  Settings,
  MoreHorizontal,
  Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const StatCard = ({ title, value, icon: Icon, trend, color, delay }) => {
  const colors = {
    blue: 'bg-blue-500 text-blue-500',
    green: 'bg-emerald-500 text-emerald-500',
    amber: 'bg-amber-500 text-amber-500',
    purple: 'bg-purple-500 text-purple-500'
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm relative overflow-hidden group"
    >
      <div className={`absolute top-0 right-0 w-24 h-24 ${colors[color].split(' ')[0]} opacity-5 rounded-full -mr-12 -mt-12 transition-transform group-hover:scale-110`} />
      <div className="flex justify-between items-start mb-4 relative z-10">
        <div className={`p-3 rounded-2xl bg-opacity-10 ${colors[color].split(' ')[1]} ${colors[color].split(' ')[0]}`}>
          <Icon className="w-6 h-6" />
        </div>
        <div className="flex items-center gap-1 text-green-500 text-xs font-bold bg-green-50 px-2 py-1 rounded-full">
          <ArrowUpRight className="w-3 h-3" />
          {trend}%
        </div>
      </div>
      <div className="space-y-1 relative z-10">
        <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">{title}</p>
        <h3 className="text-3xl font-black text-gray-900">{value}</h3>
      </div>
    </motion.div>
  );
};

const ActivityItem = ({ type, message, time, status, delay }) => {
  const statusColors = {
    Success: 'bg-green-500',
    Pending: 'bg-amber-500',
    Complete: 'bg-blue-500',
    Alert: 'bg-red-500'
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay }}
      className="flex items-center justify-between p-5 bg-gray-50 hover:bg-white rounded-3xl transition-all border border-transparent hover:border-gray-100 group"
    >
      <div className="flex items-center gap-5">
        <div className={`w-3 h-3 rounded-full ${statusColors[status] || 'bg-gray-300'} ring-4 ring-white shadow-sm`} />
        <div>
          <p className="text-sm font-bold text-gray-900 group-hover:text-agriGreen transition-colors">{message}</p>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">{type}</span>
            <span className="w-1 h-1 bg-gray-200 rounded-full" />
            <span className="text-[10px] font-medium text-gray-400">{time}</span>
          </div>
        </div>
      </div>
      <button className="p-2 opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:bg-gray-100 rounded-xl">
        <MoreHorizontal className="w-4 h-4" />
      </button>
    </motion.div>
  );
};

const HealthBar = ({ label, value, color, icon: Icon }) => (
  <div className="space-y-3">
    <div className="flex justify-between items-center">
      <div className="flex items-center gap-2">
        {Icon && <Icon className="w-4 h-4 text-gray-400" />}
        <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{label}</span>
      </div>
      <span className="text-[10px] font-black text-gray-900">{value}</span>
    </div>
    <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
      <motion.div 
        initial={{ width: 0 }}
        animate={{ width: value }}
        transition={{ duration: 1, ease: "easeOut" }}
        className={`h-full ${color} rounded-full`} 
      />
    </div>
  </div>
);

const AdminDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalCrops: 0,
    activeOrders: 0,
    revenue: 0,
  });
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [usersRes, cropsRes, ordersRes, paymentsRes] = await Promise.all([
          axios.get('/api/auth/profile'), // This verified admin but we might need a dedicated users list
          axios.get('/api/crops'),
          axios.get('/api/orders/myorders'), // For now, since admin might not have a dedicated 'all' orders yet
          axios.get('/api/payments/admin/all'),
        ]);

        setStats({
          totalUsers: 142, // Placeholder until a dedicated admin/users route is added
          totalCrops: cropsRes.data.length,
          activeOrders: ordersRes.data.filter(o => o.status === 'Pending').length,
          revenue: paymentsRes.data.stats?.totalRevenue || 0,
        });
      } catch (err) {
        console.error('Error fetching admin stats:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return (
    <div className="h-[60vh] flex items-center justify-center">
      <Loader2 className="w-10 h-10 animate-spin text-agriGreen" />
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 space-y-10">
      {/* Admin Title Bar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-1">
          <motion.h1 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-4xl font-black text-gray-900 tracking-tight flex items-center gap-3"
          >
            <Shield className="w-10 h-10 text-agriGreen" />
            Command Center
          </motion.h1>
          <p className="text-gray-500 font-medium">Monitoring Ethiopia's Premier Agricultural Platform</p>
        </div>
        <div className="flex bg-gray-100 p-1.5 rounded-[1.5rem]">
          {['overview', 'security', 'logs'].map((tab) => (
            <button 
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-2.5 rounded-2xl text-sm font-black transition-all capitalize ${
                activeTab === tab 
                  ? 'bg-white shadow-sm text-agriGreen' 
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Users" value={stats.totalUsers} icon={Users} trend="12" color="blue" delay={0.1} />
        <StatCard title="Crops Listed" value={stats.totalCrops} icon={ShoppingBag} trend="5" color="green" delay={0.2} />
        <StatCard title="Active Orders" value={stats.activeOrders} icon={Clock} trend="2" color="amber" delay={0.3} />
        <StatCard title="Total Revenue" value={`${stats.revenue.toLocaleString()} ETB`} icon={BarChart3} trend="18" color="purple" delay={0.4} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Main Management Area */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="lg:col-span-2 bg-white rounded-[3rem] p-10 border border-gray-100 shadow-sm"
        >
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 gap-4">
            <h2 className="text-2xl font-black text-gray-900 flex items-center gap-3">
              <Activity className="text-agriGreen w-6 h-6" />
              Live Activity
            </h2>
            <div className="relative group w-full sm:w-64">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-agriGreen w-4 h-4" />
              <input 
                placeholder="Search event logs..." 
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border-0 rounded-2xl text-xs font-medium focus:ring-4 focus:ring-agriGreen/10 transition-all outline-none" 
              />
            </div>
          </div>

          <div className="space-y-4">
            <ActivityItem type="user" message="New Farmer registered from Haramaya" time="2 mins ago" status="Success" delay={0.6} />
            <ActivityItem type="order" message="Order #5234 confirmed - 50kg Coffee" time="15 mins ago" status="Pending" delay={0.7} />
            <ActivityItem type="payment" message="M-Pesa payment payout to Harar Farmer #22" time="1 hour ago" status="Success" delay={0.8} />
            <ActivityItem type="system" message="Database backup completed successfully" time="3 hours ago" status="Complete" delay={0.9} />
            <ActivityItem type="security" message="High frequency login attempts from IP 192.168.1.1" time="5 hours ago" status="Alert" delay={1.0} />
          </div>
        </motion.div>

        {/* System Health & Controls */}
        <div className="space-y-8">
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-white rounded-[3rem] p-10 border border-gray-100 shadow-sm"
          >
            <h2 className="text-2xl font-black text-gray-900 mb-8 flex items-center gap-3">
              <Settings className="text-agriGreen w-6 h-6" />
              Service Status
            </h2>
            <div className="space-y-8">
              <HealthBar label="API Response Time" value="98%" color="bg-emerald-500" icon={Activity} />
              <HealthBar label="Database Uptime" value="100%" color="bg-emerald-500" icon={Database} />
              <HealthBar label="Cloud Storage" value="14%" color="bg-blue-500" icon={Cloud} />
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
                <div className="flex items-center gap-3">
                  <CreditCard className="w-5 h-5 text-gray-400" />
                  <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Gateway</span>
                </div>
                <span className="text-xs font-black text-emerald-600 flex items-center gap-1.5 uppercase">
                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                  Active
                </span>
              </div>
            </div>
            
            <div className="mt-12 space-y-4">
              <button className="w-full flex items-center justify-center gap-2 bg-gray-900 text-white font-black py-4 rounded-2xl shadow-xl shadow-gray-200 hover:bg-black transition-all text-sm group">
                <Download className="w-4 h-4 group-hover:-translate-y-0.5 transition-transform" />
                Export User Report
              </button>
              <button className="w-full flex items-center justify-center gap-2 bg-white text-red-600 border-2 border-red-50 font-black py-4 rounded-2xl hover:bg-red-50 transition-all text-sm">
                Maintenance Mode
              </button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.7 }}
            className="bg-agriDark rounded-[3rem] p-8 text-white relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-agriGreen opacity-20 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-125" />
            <h3 className="text-xl font-black mb-2 relative z-10">Platform Security</h3>
            <p className="text-agriLight/70 text-sm font-medium leading-relaxed relative z-10 mb-6">
              Enhanced SSL encryption and real-time fraud monitoring are currently protecting all transactions.
            </p>
            <div className="flex items-center gap-2 text-agriLight font-black text-xs uppercase tracking-widest relative z-10 cursor-pointer hover:text-white transition-colors">
              View Security Protocols <ArrowUpRight className="w-4 h-4" />
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
