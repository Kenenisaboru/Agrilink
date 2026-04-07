import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  CreditCard, 
  Search, 
  Filter, 
  ArrowUpRight, 
  ArrowDownRight,
  Loader2,
  Calendar,
  Receipt,
  Download,
  AlertCircle,
  ExternalLink,
  Smartphone,
  Building2,
  Wallet,
  CheckCircle2,
  XCircle,
  Clock,
  ShieldCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';

const PaymentHistory = () => {
  const { user } = useAuth();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('All');

  const methodIcons = {
    Telebirr: { icon: Smartphone, color: 'text-blue-600', bg: 'bg-blue-50' },
    MPesa: { icon: Smartphone, color: 'text-green-600', bg: 'bg-green-50' },
    CBE: { icon: Building2, color: 'text-purple-600', bg: 'bg-purple-50' },
    Wallet: { icon: Wallet, color: 'text-agriGreen', bg: 'bg-green-50' },
    Cash: { icon: CreditCard, color: 'text-gray-600', bg: 'bg-gray-100' },
  };

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const res = await axios.get('/api/payments/history');
        setPayments(res.data);
      } catch (err) {
        console.error('Error fetching payments:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchPayments();
  }, []);

  const filteredPayments = payments.filter((p) => {
    const matchesSearch = p.receiptNumber?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          p.paymentMethod?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === 'All' || p.status === filter;
    return matchesSearch && matchesFilter;
  });

  const getStatusChip = (status) => {
    switch (status) {
      case 'Success': return <span className="bg-green-50 text-green-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5"><CheckCircle2 size={12} /> Success</span>;
      case 'Failed': return <span className="bg-red-50 text-red-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5"><XCircle size={12} /> Failed</span>;
      default: return <span className="bg-amber-50 text-amber-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5"><Clock size={12} /> Processing</span>;
    }
  };

  if (loading) return (
    <div className="h-[60vh] flex items-center justify-center">
      <Loader2 className="w-10 h-10 animate-spin text-agriGreen" />
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 space-y-12">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-1">
          <h1 className="text-4xl font-black text-gray-900 tracking-tight">Payment History</h1>
          <p className="text-gray-500 font-medium font-inter">Audit trail of all your agricultural transactions.</p>
        </div>
        <div className="flex bg-gray-100 p-1.5 rounded-[1.5rem]">
          {['All', 'Success', 'Failed'].map((tab) => (
            <button 
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-6 py-2.5 rounded-2xl text-sm font-black transition-all capitalize ${
                filter === tab 
                  ? 'bg-white shadow-sm text-agriGreen' 
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </header>

      {/* Wallet Balance Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div 
           whileHover={{ scale: 1.02 }}
           className="bg-agriDark rounded-[2.5rem] p-8 text-white relative overflow-hidden group shadow-2xl shadow-green-100/50"
        >
           <div className="absolute top-0 right-0 p-8 text-white/5 pointer-events-none group-hover:scale-110 transition-transform">
             <Wallet size={120} />
           </div>
           <div className="relative z-10 flex flex-col h-full justify-between gap-8">
              <div>
                 <p className="text-[10px] font-black text-agriLight uppercase tracking-[0.2em] mb-1 opacity-80">Available Wallet Balance</p>
                 <h2 className="text-5xl font-black tracking-tighter">{(user?.balance || 0).toLocaleString()} <span className="text-lg">ETB</span></h2>
              </div>
              <div className="flex gap-3">
                 <button className="bg-white text-agriDark px-6 py-3 rounded-2xl font-black text-sm flex items-center gap-2 hover:bg-agriLight transition-colors">
                    <ArrowUpRight size={16} /> Top Up
                 </button>
                 <button className="bg-white/10 backdrop-blur-md text-white px-6 py-3 rounded-2xl font-black text-sm border border-white/20 hover:bg-white/20">
                    Withdraw
                 </button>
              </div>
           </div>
        </motion.div>

        <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm flex flex-col justify-center gap-2">
           <div className="p-4 bg-blue-50 text-blue-600 rounded-3xl w-fit mb-2">
              <Download size={24} />
           </div>
           <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Reports</p>
           <h3 className="text-xl font-black text-gray-900">Export Statements</h3>
           <p className="text-xs text-gray-500 font-medium">Download your financial reports in PDF or CSV format.</p>
        </div>

        <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm flex flex-col justify-center gap-2">
           <div className="p-4 bg-amber-50 text-amber-600 rounded-3xl w-fit mb-2">
              <ShieldCheck size={24} />
           </div>
           <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Security</p>
           <h3 className="text-xl font-black text-gray-900">Fraud Prevention</h3>
           <p className="text-xs text-gray-500 font-medium">Your transactions are monitored by end-to-end encryption.</p>
        </div>
      </div>

      <div className="bg-white rounded-[3rem] border border-gray-100 p-8 lg:p-12 shadow-sm">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-10">
          <h2 className="text-2xl font-black text-gray-900 flex items-center gap-3">
            <div className="w-2 h-8 bg-agriGreen rounded-full" />
            Recent Settlements
          </h2>
          <div className="relative group w-full sm:max-w-sm">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-agriGreen transition-colors" size={18} />
            <input 
              placeholder="Search receipt no or method..." 
              className="w-full pl-14 pr-6 py-4 bg-gray-50 border-0 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-agriGreen/10 transition-all outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-50">
                <th className="pb-6 text-[10px] font-black text-gray-400 uppercase tracking-widest pl-4">Transaction Details</th>
                <th className="pb-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Amount</th>
                <th className="pb-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Method</th>
                <th className="pb-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                <th className="pb-6 text-[10px] font-black text-gray-400 uppercase tracking-widest pr-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              <AnimatePresence mode="popLayout">
                {filteredPayments.map((p, idx) => {
                  const meta = methodIcons[p.paymentMethod] || methodIcons.Cash;
                  const Icon = meta.icon;
                  return (
                    <motion.tr 
                      key={p._id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="group hover:bg-gray-50/50 transition-colors"
                    >
                      <td className="py-6 pl-4">
                         <div className="flex items-center gap-4">
                            <div className={`p-3 rounded-2xl ${meta.bg} ${meta.color} group-hover:scale-110 transition-transform`}>
                               <Receipt size={20} />
                            </div>
                            <div>
                               <p className="text-sm font-black text-gray-900 leading-tight">#{p.receiptNumber}</p>
                               <div className="flex items-center gap-2 mt-1">
                                  <Calendar size={12} className="text-gray-400" />
                                  <p className="text-[10px] font-bold text-gray-500">{new Date(p.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                               </div>
                            </div>
                         </div>
                      </td>
                      <td className="py-6 font-black text-gray-900">
                         {p.amount.toLocaleString()} <span className="text-[10px] text-gray-400 font-bold tracking-tight">ETB</span>
                      </td>
                      <td className="py-6">
                         <div className="flex items-center gap-2">
                            <Icon size={14} className={meta.color} />
                            <span className="text-xs font-bold text-gray-600">{p.paymentMethod}</span>
                         </div>
                      </td>
                      <td className="py-6">
                        {getStatusChip(p.status)}
                      </td>
                      <td className="py-6 pr-4 text-right">
                         <button className="p-3 text-gray-400 hover:text-agriGreen hover:bg-white rounded-xl transition-all shadow-none hover:shadow-sm border border-transparent hover:border-gray-100">
                            <ExternalLink size={18} />
                         </button>
                      </td>
                    </motion.tr>
                  );
                })}
              </AnimatePresence>
            </tbody>
          </table>
          
          {filteredPayments.length === 0 && (
            <div className="py-24 text-center">
               <AlertCircle size={48} className="mx-auto text-gray-200 mb-4" />
               <h3 className="text-xl font-bold text-gray-400">No transactions found</h3>
               <p className="text-gray-300 text-sm mt-1">Try adjusting your filters or search query.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentHistory;
