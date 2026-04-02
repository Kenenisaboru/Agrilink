import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { 
  Lightbulb, 
  Info, 
  Search, 
  Filter, 
  MessageSquare, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  ArrowRight,
  Loader2,
  TrendingUp,
  Target
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const StudentDashboard = () => {
  const { user } = useAuth();
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('All');

  useEffect(() => {
    const fetchProblems = async () => {
      try {
        const { data } = await axios.get('http://localhost:5000/api/problems');
        setProblems(data);
      } catch (err) {
        console.error("Error fetching problems:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProblems();
  }, []);

  const stats = {
    total: problems.length,
    urgent: problems.filter(p => p.priority === 'High' || p.status === 'Needs Solution').length,
    solved: problems.filter(p => p.status === 'Solved').length,
    proposals: 12 // Mock data for demo
  };

  const filteredProblems = problems.filter(p => {
    const matchesSearch = p.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          p.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === 'All' || p.category === filter;
    return matchesSearch && matchesFilter;
  });

  if (loading) return (
    <div className="h-[60vh] flex items-center justify-center">
      <Loader2 className="w-10 h-10 animate-spin text-agriGreen" />
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 space-y-10">
      {/* Welcome Section */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <motion.h1 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-4xl font-black text-gray-900 tracking-tight"
          >
            Hello, <span className="text-agriGreen">{user.name}</span> 👋
          </motion.h1>
          <p className="text-gray-500 font-medium">Empower local farmers with your innovative solutions.</p>
        </div>
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex bg-gray-100 p-1.5 rounded-2xl"
        >
          <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl shadow-sm">
            <TrendingUp className="w-4 h-4 text-agriGreen" />
            <span className="text-sm font-bold text-gray-900">Rank: Senior Innovator</span>
          </div>
        </motion.div>
      </header>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Available Tasks', value: stats.total, icon: Target, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Urgent Issues', value: stats.urgent, icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-50' },
          { label: 'Total Solved', value: stats.solved, icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-50' },
          { label: 'My Proposals', value: stats.proposals, icon: Lightbulb, color: 'text-amber-600', bg: 'bg-amber-50' },
        ].map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm"
          >
            <div className={`w-12 h-12 rounded-2xl ${stat.bg} ${stat.color} flex items-center justify-center mb-4`}>
              <stat.icon className="w-6 h-6" />
            </div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest leading-none mb-1">{stat.label}</p>
            <p className="text-3xl font-black text-gray-900">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-grow group w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-agriGreen transition-colors" />
          <input 
            type="text" 
            placeholder="Search problems, categories, or crops..."
            className="w-full bg-white border border-gray-100 rounded-2xl py-4 pl-12 pr-4 outline-none focus:ring-4 focus:ring-agriGreen/10 transition-all font-medium"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
          {['All', 'Disease', 'Soil', 'Pest', 'Irrigation'].map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-6 py-4 rounded-2xl font-bold whitespace-nowrap transition-all ${
                filter === cat 
                  ? 'bg-agriGreen text-white shadow-lg shadow-green-200' 
                  : 'bg-white text-gray-500 border border-gray-100 hover:border-agriGreen/30'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Problems Feed */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        <AnimatePresence mode="popLayout">
          {filteredProblems.length > 0 ? (
            filteredProblems.map((problem, idx) => (
              <motion.div
                key={problem._id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3, delay: idx * 0.05 }}
                className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-xl transition-all group overflow-hidden flex flex-col"
              >
                <div className="p-8 space-y-6 flex-grow">
                  <div className="flex justify-between items-start">
                    <span className="bg-agriGreen/10 text-agriGreen text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full">
                      {problem.category}
                    </span>
                    <div className="flex items-center gap-1 text-red-500 bg-red-50 px-2 py-1 rounded-lg">
                      <Clock className="w-3 h-3" />
                      <span className="text-[10px] font-black uppercase">Urgent</span>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="text-2xl font-black text-gray-900 leading-tight group-hover:text-agriGreen transition-colors line-clamp-2">
                      {problem.title}
                    </h3>
                    <p className="text-gray-500 font-medium line-clamp-3 leading-relaxed">
                      {problem.description}
                    </p>
                  </div>

                  <div className="flex items-center gap-3 pt-4 border-t border-gray-50">
                    <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400">
                      <Info className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Farmer</p>
                      <p className="text-sm font-bold text-gray-900">{problem.farmer?.name || 'Local Farmer'}</p>
                    </div>
                  </div>
                </div>

                <div className="p-6 bg-gray-50 mt-auto border-t border-gray-100">
                  <button className="w-full btn-primary py-4 rounded-2xl flex items-center justify-center gap-2 group/btn">
                    <Lightbulb className="w-5 h-5" />
                    Propose Solution
                    <ArrowRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
                  </button>
                </div>
              </motion.div>
            ))
          ) : (
            <motion.div 
              className="col-span-full py-24 text-center bg-white rounded-[3rem] border-2 border-dashed border-gray-100"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <Target className="w-16 h-16 text-gray-200 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-600">No matching problems found</h3>
              <p className="text-gray-400 mt-1">Check back later for new agricultural challenges.</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default StudentDashboard;
