import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { 
  BarChart3, Users, ShoppingBag, 
  AlertCircle, CheckCircle, Clock, 
  ArrowUpRight, ArrowDownRight, Search 
} from 'lucide-react';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalCrops: 0,
    activeOrders: 0,
    revenue: 0,
  });
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    // In a real app, these would fetch from an admin-only endpoint
    setStats({
      totalUsers: 142,
      totalCrops: 86,
      activeOrders: 12,
      revenue: 45200,
    });
  }, []);

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Admin Title Bar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-800">System Command Center</h1>
          <p className="text-slate-500 font-medium">Hello, Administrator {user?.name}. Monitoring East Hararghe Platform.</p>
        </div>
        <div className="flex bg-slate-100 p-1 rounded-xl">
           <button 
             onClick={() => setActiveTab('overview')}
             className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'overview' ? 'bg-white shadow text-agriGreen' : 'text-slate-500'}`}
           >
             Overview
           </button>
           <button 
             onClick={() => setActiveTab('security')}
             className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'security' ? 'bg-white shadow text-agriGreen' : 'text-slate-500'}`}
           >
             Security
           </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Users" value={stats.totalUsers} icon={<Users />} trend="+12" color="blue" />
        <StatCard title="Crops Listed" value={stats.totalCrops} icon={<ShoppingBag />} trend="+5" color="green" />
        <StatCard title="Active Orders" value={stats.activeOrders} icon={<Clock />} trend="+2" color="amber" />
        <StatCard title="Platform Revenue" value={`${stats.revenue} ETB`} icon={<BarChart3 />} trend="+8k" color="purple" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Platform Activity */}
        <div className="lg:col-span-2 glass rounded-3xl p-8 border border-white shadow-2xl shadow-slate-200/50">
          <div className="flex justify-between items-center mb-8">
             <h2 className="text-xl font-black text-slate-800">Management Console</h2>
             <div className="relative">
                <Search size={16} className="absolute left-3 top-2.5 text-slate-400" />
                <input placeholder="Search logs..." className="pl-9 pr-4 py-2 bg-slate-50 border-0 rounded-lg text-sm focus:ring-2 focus:ring-agriGreen/20" />
             </div>
          </div>

          <div className="space-y-4">
             <ActivityItem 
               type="user" 
               message="New Farmer registered from Haramaya" 
               time="2 mins ago" 
               status="Success" 
             />
             <ActivityItem 
               type="order" 
               message="Order #5234 confirmed - 50kg Coffee" 
               time="15 mins ago" 
               status="Pending" 
             />
             <ActivityItem 
               type="payment" 
               message="M-Pesa payment payout to Harar Farmer #22" 
               time="1 hour ago" 
               status="Success" 
             />
             <ActivityItem 
               type="system" 
               message="Database backup completed successfully" 
               time="3 hours ago" 
               status="Complete" 
             />
          </div>
        </div>

        {/* System Health */}
        <div className="glass rounded-3xl p-8 border border-white shadow-2xl shadow-slate-200/50">
           <h2 className="text-xl font-black text-slate-800 mb-8 flex items-center gap-2">
             <AlertCircle size={20} className="text-agriGreen" /> Service Health
           </h2>
           <div className="space-y-6">
              <HealthBar label="API Response Time" value="98%" color="bg-green-500" />
              <HealthBar label="Database Uptime" value="100%" color="bg-green-500" />
              <HealthBar label="Storage (Cloudinary)" value="14%" color="bg-blue-500" />
              <HealthBar label="Payment Gateway" value="Active" color="bg-green-500" textOnly />
           </div>
           
           <div className="mt-12 p-5 bg-agriBg rounded-2xl border border-agriLight/30">
              <p className="text-xs font-black text-agriDark uppercase tracking-widest mb-2 text-center">Admin Controls</p>
              <button className="w-full bg-white text-agriDark font-bold py-3 rounded-xl shadow-sm hover:shadow-md transition-all mb-3 text-sm">Download User CSV</button>
              <button className="w-full bg-agriDark text-white font-bold py-3 rounded-xl shadow-lg hover:shadow-xl transition-all text-sm">System Maintenance Mode</button>
           </div>
        </div>
      </div>
    </div>
  );
};

/* Helper Components */
const StatCard = ({ title, value, icon, trend, color }) => {
  const colors = {
    blue: 'text-blue-600 bg-blue-50 border-blue-100',
    green: 'text-agriGreen bg-agriBg border-agriLight/20',
    amber: 'text-amber-600 bg-amber-50 border-amber-100',
    purple: 'text-purple-600 bg-purple-50 border-purple-100'
  };
  return (
    <div className={`glass p-6 rounded-3xl border ${colors[color]} hover:scale-105 transition-all duration-300`}>
      <div className="flex justify-between items-center mb-4">
        <div className="p-3 rounded-2xl bg-white shadow-sm">{icon}</div>
        <div className="flex items-center text-xs font-bold text-green-500 gap-1 bg-white px-2 py-1 rounded-full shadow-sm">
          <ArrowUpRight size={14} /> {trend}%
        </div>
      </div>
      <p className="text-slate-500 text-sm font-bold uppercase tracking-widest">{title}</p>
      <h3 className="text-2xl font-black text-slate-800 mt-1">{value}</h3>
    </div>
  );
}

const ActivityItem = ({ type, message, time, status }) => (
  <div className="flex items-center justify-between p-4 bg-white/50 hover:bg-white rounded-2xl transition-all border border-transparent hover:border-slate-100">
    <div className="flex items-center gap-4">
       <div className={`w-2 h-2 rounded-full ${status === 'Success' || status === 'Complete' ? 'bg-green-500' : 'bg-amber-400'}`}></div>
       <div>
         <p className="text-sm font-bold text-slate-800">{message}</p>
         <p className="text-xs text-slate-400 mt-0.5">{time}</p>
       </div>
    </div>
    <div className="text-[10px] font-black uppercase text-slate-400 tracking-tighter">{type}</div>
  </div>
);

const HealthBar = ({ label, value, color, textOnly }) => (
  <div>
    <div className="flex justify-between text-xs font-black text-slate-600 mb-2 uppercase tracking-wide">
      <span>{label}</span>
      <span className={textOnly ? 'text-agriGreen' : ''}>{value}</span>
    </div>
    {!textOnly && (
      <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
        <div className={`h-full ${color}`} style={{ width: value }}></div>
      </div>
    )}
  </div>
);

export default AdminDashboard;
