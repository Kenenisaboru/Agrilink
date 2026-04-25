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
  Loader2,
  Package,
  DollarSign,
  TrendingUp,
  Filter,
  RefreshCw,
  Ban,
  CheckCircle2,
  X,
  Eye,
  Edit,
  Trash2,
  Zap,
  Globe,
  Server,
  HardDrive,
  Wifi,
  Bell,
  MessageSquare,
  Star,
  Calendar,
  MapPin,
  Phone,
  Mail,
  UserPlus,
  UserMinus
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
    pendingApprovals: 0,
    systemHealth: 98,
    serverLoad: 45,
    databaseSize: '2.4 GB'
  });
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [systemLogs, setSystemLogs] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [usersRes, cropsRes, ordersRes, paymentsRes] = await Promise.all([
          axios.get('/api/auth/profile'),
          axios.get('/api/crops'),
          axios.get('/api/orders/myorders'),
          axios.get('/api/payments/admin/all'),
        ]);

        setStats({
          totalUsers: 142,
          totalCrops: cropsRes.data.length,
          activeOrders: ordersRes.data.filter(o => o.status === 'Pending').length,
          revenue: paymentsRes.data.stats?.totalRevenue || 0,
          pendingApprovals: cropsRes.data.filter(c => !c.approved).length,
          systemHealth: 98,
          serverLoad: 45,
          databaseSize: '2.4 GB'
        });

        // Sample data for demonstration
        setUsers([
          { id: 1, name: 'Abebe Kebede', email: 'abebe@email.com', role: 'Farmer', status: 'Active', joined: '2026-01-15' },
          { id: 2, name: 'Fatuma Ahmed', email: 'fatuma@email.com', role: 'Buyer', status: 'Active', joined: '2026-02-20' },
          { id: 3, name: 'Kedir Jemal', email: 'kedir@email.com', role: 'Farmer', status: 'Pending', joined: '2026-03-10' },
          { id: 4, name: 'Chaltu Tadesse', email: 'chaltu@email.com', role: 'Student', status: 'Active', joined: '2026-03-25' },
        ]);

        setProducts([
          { id: 1, name: 'Premium Coffee', farmer: 'Abebe Kebede', price: 4500, status: 'Approved', views: 1250 },
          { id: 2, name: 'Organic Teff', farmer: 'Fatuma Ahmed', price: 3200, status: 'Pending', views: 890 },
          { id: 3, name: 'Fresh Khat', farmer: 'Kedir Jemal', price: 2800, status: 'Approved', views: 2100 },
        ]);

        setOrders([
          { id: 1, buyer: 'Fatuma Ahmed', total: 8500, status: 'Processing', date: '2026-04-20' },
          { id: 2, buyer: 'Chaltu Tadesse', total: 4200, status: 'Pending', date: '2026-04-21' },
          { id: 3, buyer: 'Mohammed Ali', total: 12000, status: 'Delivered', date: '2026-04-19' },
        ]);

        setSystemLogs([
          { id: 1, type: 'Info', message: 'User registration: new farmer account', time: '2 min ago' },
          { id: 2, type: 'Success', message: 'Payment processed: ETB 8,500', time: '5 min ago' },
          { id: 3, type: 'Warning', message: 'High server load detected', time: '10 min ago' },
          { id: 4, type: 'Info', message: 'Product approved: Premium Coffee', time: '15 min ago' },
        ]);
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
          {['overview', 'users', 'products', 'orders', 'system'].map((tab) => (
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

      {/* Enhanced Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
        <StatCard title="Total Users" value={stats.totalUsers} icon={Users} trend="12" color="blue" delay={0.1} />
        <StatCard title="Crops Listed" value={stats.totalCrops} icon={Package} trend="5" color="green" delay={0.2} />
        <StatCard title="Active Orders" value={stats.activeOrders} icon={Clock} trend="2" color="amber" delay={0.3} />
        <StatCard title="Total Revenue" value={`${stats.revenue.toLocaleString()} ETB`} icon={DollarSign} trend="18" color="purple" delay={0.4} />
        <StatCard title="Pending Approvals" value={stats.pendingApprovals} icon={ShieldCheck} trend="3" color="blue" delay={0.5} />
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
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
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border-0 rounded-2xl text-xs font-medium focus:ring-4 focus:ring-agriGreen/10 transition-all outline-none" 
                />
              </div>
            </div>

            <div className="space-y-4">
              {systemLogs.map((log, index) => (
                <ActivityItem 
                  key={log.id}
                  type={log.type} 
                  message={log.message} 
                  time={log.time} 
                  status={log.type === 'Success' ? 'Success' : log.type === 'Warning' ? 'Alert' : 'Complete'} 
                  delay={0.6 + index * 0.1} 
                />
              ))}
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
                <HealthBar label="System Health" value={`${stats.systemHealth}%`} color="bg-emerald-500" icon={Activity} />
                <HealthBar label="Server Load" value={`${stats.serverLoad}%`} color="bg-blue-500" icon={Server} />
                <HealthBar label="Database Size" value={stats.databaseSize} color="bg-purple-500" icon={Database} />
                <HealthBar label="API Response" value="98%" color="bg-emerald-500" icon={Globe} />
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7 }}
              className="bg-gradient-to-br from-agriGreen to-green-600 rounded-[3rem] p-10 text-white shadow-xl shadow-green-200"
            >
              <div className="flex items-center gap-3 mb-6">
                <Zap className="w-6 h-6" />
                <h2 className="text-xl font-black">Quick Actions</h2>
              </div>
              <div className="space-y-3">
                <button className="w-full bg-white/20 hover:bg-white/30 backdrop-blur-md p-4 rounded-2xl font-bold text-sm flex items-center justify-between transition-all">
                  <span>Backup Database</span>
                  <Download className="w-4 h-4" />
                </button>
                <button className="w-full bg-white/20 hover:bg-white/30 backdrop-blur-md p-4 rounded-2xl font-bold text-sm flex items-center justify-between transition-all">
                  <span>Clear Cache</span>
                  <RefreshCw className="w-4 h-4" />
                </button>
                <button className="w-full bg-white/20 hover:bg-white/30 backdrop-blur-md p-4 rounded-2xl font-bold text-sm flex items-center justify-between transition-all">
                  <span>Send Notifications</span>
                  <Bell className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      )}

      {activeTab === 'users' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-[3rem] p-10 border border-gray-100 shadow-sm"
        >
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
            <h2 className="text-2xl font-black text-gray-900 flex items-center gap-3">
              <Users className="text-agriGreen w-6 h-6" />
              User Management
            </h2>
            <div className="flex gap-3">
              <button className="btn-primary px-6 py-3 rounded-2xl font-bold flex items-center gap-2">
                <UserPlus className="w-5 h-5" />
                Add User
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-4 px-4 text-xs font-black text-gray-400 uppercase tracking-widest">User</th>
                  <th className="text-left py-4 px-4 text-xs font-black text-gray-400 uppercase tracking-widest">Role</th>
                  <th className="text-left py-4 px-4 text-xs font-black text-gray-400 uppercase tracking-widest">Status</th>
                  <th className="text-left py-4 px-4 text-xs font-black text-gray-400 uppercase tracking-widest">Joined</th>
                  <th className="text-right py-4 px-4 text-xs font-black text-gray-400 uppercase tracking-widest">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-agriGreen/10 rounded-full flex items-center justify-center">
                          <User className="w-5 h-5 text-agriGreen" />
                        </div>
                        <div>
                          <p className="font-bold text-gray-900">{user.name}</p>
                          <p className="text-xs text-gray-500">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-sm font-bold text-gray-700">{user.role}</span>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                        user.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                      }`}>
                        {user.status}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-sm text-gray-500">{user.joined}</span>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                          <Eye className="w-4 h-4 text-gray-400" />
                        </button>
                        <button className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                          <Edit className="w-4 h-4 text-gray-400" />
                        </button>
                        <button className="p-2 hover:bg-red-50 rounded-xl transition-colors">
                          <Ban className="w-4 h-4 text-red-400" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {activeTab === 'products' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-[3rem] p-10 border border-gray-100 shadow-sm"
        >
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
            <h2 className="text-2xl font-black text-gray-900 flex items-center gap-3">
              <Package className="text-agriGreen w-6 h-6" />
              Product Moderation
            </h2>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <select className="bg-gray-50 border-0 rounded-xl px-4 py-2 text-sm font-bold outline-none">
                <option>All Status</option>
                <option>Pending</option>
                <option>Approved</option>
                <option>Rejected</option>
              </select>
            </div>
          </div>

          <div className="space-y-4">
            {products.map((product) => (
              <div key={product.id} className="flex items-center justify-between p-6 bg-gray-50 rounded-2xl border border-gray-100">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-white rounded-xl flex items-center justify-center">
                    <Package className="w-8 h-8 text-gray-300" />
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">{product.name}</p>
                    <p className="text-sm text-gray-500">by {product.farmer}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Eye className="w-3 h-3 text-gray-400" />
                      <span className="text-xs text-gray-400">{product.views} views</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="font-black text-agriGreen">ETB {product.price.toLocaleString()}</p>
                    <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                      product.status === 'Approved' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                    }`}>
                      {product.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {product.status === 'Pending' && (
                      <>
                        <button className="p-2 bg-green-100 hover:bg-green-200 rounded-xl transition-colors">
                          <CheckCircle2 className="w-4 h-4 text-green-600" />
                        </button>
                        <button className="p-2 bg-red-100 hover:bg-red-200 rounded-xl transition-colors">
                          <X className="w-4 h-4 text-red-600" />
                        </button>
                      </>
                    )}
                    <button className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                      <Eye className="w-4 h-4 text-gray-400" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {activeTab === 'orders' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-[3rem] p-10 border border-gray-100 shadow-sm"
        >
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
            <h2 className="text-2xl font-black text-gray-900 flex items-center gap-3">
              <ShoppingBag className="text-agriGreen w-6 h-6" />
              Order Management
            </h2>
          </div>

          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order.id} className="flex items-center justify-between p-6 bg-gray-50 rounded-2xl border border-gray-100">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center">
                    <ShoppingBag className="w-6 h-6 text-gray-300" />
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">Order #{order.id}</p>
                    <p className="text-sm text-gray-500">by {order.buyer}</p>
                    <p className="text-xs text-gray-400 mt-1">{order.date}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="font-black text-agriGreen">ETB {order.total.toLocaleString()}</p>
                    <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                      order.status === 'Delivered' ? 'bg-green-100 text-green-700' :
                      order.status === 'Processing' ? 'bg-blue-100 text-blue-700' :
                      'bg-amber-100 text-amber-700'
                    }`}>
                      {order.status}
                    </span>
                  </div>
                  <button className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                    <Eye className="w-4 h-4 text-gray-400" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {activeTab === 'system' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-8"
        >
          <div className="bg-white rounded-[3rem] p-10 border border-gray-100 shadow-sm">
            <h2 className="text-2xl font-black text-gray-900 mb-8 flex items-center gap-3">
              <Server className="text-agriGreen w-6 h-6" />
              Server Metrics
            </h2>
            <div className="space-y-6">
              <HealthBar label="CPU Usage" value="45%" color="bg-blue-500" icon={Activity} />
              <HealthBar label="Memory Usage" value="62%" color="bg-purple-500" icon={HardDrive} />
              <HealthBar label="Disk Space" value="38%" color="bg-green-500" icon={Database} />
              <HealthBar label="Network I/O" value="28%" color="bg-amber-500" icon={Wifi} />
            </div>
          </div>

          <div className="bg-white rounded-[3rem] p-10 border border-gray-100 shadow-sm">
            <h2 className="text-2xl font-black text-gray-900 mb-8 flex items-center gap-3">
              <Shield className="text-agriGreen w-6 h-6" />
              Security Overview
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-green-50 rounded-2xl">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                  <span className="font-bold text-gray-900">SSL Certificate</span>
                </div>
                <span className="text-sm font-bold text-green-600">Valid</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-green-50 rounded-2xl">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                  <span className="font-bold text-gray-900">Firewall</span>
                </div>
                <span className="text-sm font-bold text-green-600">Active</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-amber-50 rounded-2xl">
                <div className="flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-600" />
                  <span className="font-bold text-gray-900">Failed Logins (24h)</span>
                </div>
                <span className="text-sm font-bold text-amber-600">3</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-green-50 rounded-2xl">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                  <span className="font-bold text-gray-900">Database Backups</span>
                </div>
                <span className="text-sm font-bold text-green-600">Automated</span>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default AdminDashboard;
