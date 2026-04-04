import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { 
  Users, 
  UserCheck, 
  MessageSquare, 
  TrendingUp, 
  Search, 
  Filter, 
  MoreVertical,
  Loader2,
  ArrowUpRight,
  ShieldCheck,
  Activity,
  UserPlus
} from 'lucide-react';
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

const RepresentativeDashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [managedUsers, setManagedUsers] = useState([]);
  const [stats, setStats] = useState({
    totalFarmers: 0,
    totalBuyers: 0,
    activeTasks: 0,
    performance: '94%'
  });

  useEffect(() => {
    const fetchRepData = async () => {
      try {
        const config = {
          headers: { Authorization: `Bearer ${user.token}` }
        };
        // Simulated endpoint for now
        // const { data } = await axios.get('/api/representative/managed-users', config);
        
        // Mock data for initial UI implementation
        setTimeout(() => {
          setManagedUsers([
            { _id: '1', name: 'Abebe Bikila', role: 'Farmer', location: 'Haramaya', status: 'Active' },
            { _id: '2', name: 'Sara Mohammed', role: 'Buyer', location: 'Harar', status: 'Active' },
            { _id: '3', name: 'Kassa Tessema', role: 'Farmer', location: 'Dire Dawa', status: 'Pending' },
          ]);
          setStats({
            totalFarmers: 12,
            totalBuyers: 8,
            activeTasks: 5,
            performance: '96%'
          });
          setLoading(false);
        }, 1000);
      } catch (err) {
        console.error('Error fetching rep data:', err);
        setLoading(false);
      }
    };
    fetchRepData();
  }, [user]);

  if (loading) return (
    <div className="h-[60vh] flex items-center justify-center">
      <Loader2 className="w-10 h-10 animate-spin text-agriGreen" />
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto space-y-10 py-8 px-4">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <motion.h1 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-4xl font-black text-gray-900 tracking-tight"
          >
            Representative <span className="text-agriGreen">Portal</span> 🏛️
          </motion.h1>
          <p className="text-gray-500 font-medium">Managing East Hararghe's digital agriculture network.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="btn-primary py-4 px-8 rounded-2xl shadow-xl shadow-green-200/50 flex items-center gap-2">
            <UserPlus className="w-5 h-5" />
            Onboard New User
          </button>
        </div>
      </header>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard icon={Users} label="Total Farmers" value={stats.totalFarmers} trend="8%" color="bg-blue-500" delay={0.1} />
        <StatCard icon={UserCheck} label="Verified Buyers" value={stats.totalBuyers} trend="12%" color="bg-purple-500" delay={0.2} />
        <StatCard icon={Activity} label="Active Tasks" value={stats.activeTasks} trend="High" color="bg-amber-500" delay={0.3} />
        <StatCard icon={ShieldCheck} label="Reliability" value={stats.performance} color="bg-emerald-500" delay={0.4} />
      </div>

      <div className="grid lg:grid-cols-3 gap-10">
        {/* Managed Users List */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="lg:col-span-2 bg-white rounded-[3rem] border border-gray-100 p-10 shadow-sm overflow-hidden"
        >
          <div className="flex items-center justify-between mb-10">
            <h2 className="text-2xl font-black text-gray-900 flex items-center gap-3">
              <div className="w-2 h-8 bg-agriGreen rounded-full" />
              Your Managed Network
            </h2>
            <div className="flex gap-2">
              <div className="relative group hidden sm:block">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input placeholder="Search users..." className="pl-10 pr-4 py-2 bg-gray-50 border-0 rounded-xl text-xs font-medium focus:ring-2 focus:ring-agriGreen/10 outline-none" />
              </div>
              <button className="p-2 bg-gray-50 rounded-xl text-gray-400 hover:text-agriGreen transition-colors">
                <Filter className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-50 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                  <th className="pb-4 px-4">User</th>
                  <th className="pb-4 px-4">Role</th>
                  <th className="pb-4 px-4">Location</th>
                  <th className="pb-4 px-4">Status</th>
                  <th className="pb-4 px-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {managedUsers.map((mUser) => (
                  <tr key={mUser._id} className="group hover:bg-gray-50/50 transition-colors">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-agriGreen/10 flex items-center justify-center text-agriGreen font-black">
                          {mUser.name[0]}
                        </div>
                        <span className="font-bold text-gray-900">{mUser.name}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className={cn(
                        "text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider",
                        mUser.role === 'Farmer' ? "bg-green-50 text-green-600" : "bg-blue-50 text-blue-600"
                      )}>
                        {mUser.role}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-sm font-medium text-gray-500">{mUser.location}</td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-1.5">
                        <div className={cn(
                          "w-1.5 h-1.5 rounded-full",
                          mUser.status === 'Active' ? "bg-emerald-500" : "bg-amber-500"
                        )} />
                        <span className="text-xs font-bold text-gray-700">{mUser.status}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <button className="p-2 text-gray-400 hover:text-agriGreen transition-colors">
                        <MessageSquare className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Support & Alerts */}
        <div className="space-y-8">
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-gray-900 rounded-[3rem] p-10 text-white relative overflow-hidden group shadow-2xl"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-agriGreen opacity-10 rounded-full -mr-16 -mt-16 blur-2xl transition-transform group-hover:scale-150" />
            <h2 className="text-2xl font-black mb-6 flex items-center gap-3">
              <TrendingUp className="text-agriGreen w-6 h-6" />
              Regional Pulse
            </h2>
            <div className="space-y-6">
              <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                <p className="text-xs font-black text-agriGreen uppercase tracking-widest mb-1">Market Alert</p>
                <p className="text-sm font-medium opacity-80 italic leading-relaxed">
                  "Sorghum prices in Haramaya have stabilized. Advise your farmers to update listing prices."
                </p>
              </div>
              <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                <p className="text-xs font-black text-blue-400 uppercase tracking-widest mb-1">Logistics</p>
                <p className="text-sm font-medium opacity-80 italic leading-relaxed">
                  "Road closure on Harar-Dire Dawa route. Coordinate alternative transport for 3 pending orders."
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.7 }}
            className="bg-white rounded-[3rem] p-10 border border-gray-100 shadow-sm"
          >
            <h3 className="text-xl font-black text-gray-900 mb-6">Support Queue</h3>
            <div className="space-y-4">
              {[
                { name: 'Kassa T.', type: 'Verification', time: '14m' },
                { name: 'Abebe B.', type: 'Dispute', time: '1h' },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                  <div>
                    <p className="text-sm font-black text-gray-900">{item.name}</p>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{item.type}</p>
                  </div>
                  <span className="text-[10px] font-black text-agriGreen">{item.time} ago</span>
                </div>
              ))}
            </div>
            <button className="w-full mt-6 py-4 bg-gray-50 text-gray-900 font-black rounded-2xl text-xs uppercase tracking-widest hover:bg-gray-100 transition-colors">
              Open Support Dashboard
            </button>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

// Simple CN utility since this file was created from scratch
const cn = (...classes) => classes.filter(Boolean).join(' ');

export default RepresentativeDashboard;
