import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { 
  Package, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  User, 
  Phone, 
  ArrowRight, 
  Search, 
  Filter,
  ChevronRight,
  Truck,
  Box,
  DollarSign,
  Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const FarmerOrders = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const config = {
          headers: { Authorization: `Bearer ${user.token}` }
        };
        const { data } = await axios.get('/api/orders/myorders', config);
        setOrders(data);
      } catch (err) {
        console.error("Error fetching farmer orders:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [user]);

  const filteredOrders = filter === 'All' 
    ? orders 
    : orders.filter(o => o.status === filter);

  const stats = {
    total: orders.length,
    pending: orders.filter(o => o.status === 'Pending').length,
    completed: orders.filter(o => o.status === 'Completed').length,
    revenue: orders.reduce((acc, curr) => acc + (curr.totalPrice || 0), 0)
  };

  if (loading) return (
    <div className="h-[60vh] flex items-center justify-center">
      <Loader2 className="w-10 h-10 animate-spin text-agriGreen" />
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 space-y-10">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight">Order Management</h1>
          <p className="text-gray-500 font-medium mt-1">Track and manage your harvest deliveries across East Hararghe.</p>
        </div>
        <div className="flex items-center gap-2 p-1.5 bg-gray-100 rounded-2xl w-fit">
          {['All', 'Pending', 'Completed'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all ${
                filter === status 
                  ? 'bg-white text-agriGreen shadow-sm shadow-gray-200' 
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </header>

      {/* Mini Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Sales', value: stats.total, icon: Box, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Pending Ship', value: stats.pending, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
          { label: 'Completed', value: stats.completed, icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-50' },
          { label: 'Total Revenue', value: `${stats.revenue.toLocaleString()} ETB`, icon: DollarSign, color: 'text-purple-600', bg: 'bg-purple-50' },
        ].map((item, i) => (
          <div key={i} className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex items-center gap-4">
            <div className={`p-3 rounded-2xl ${item.bg} ${item.color}`}>
              <item.icon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">{item.label}</p>
              <p className="text-xl font-black text-gray-900">{item.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Orders List */}
      <div className="space-y-6">
        <AnimatePresence mode="popLayout">
          {filteredOrders.length > 0 ? (
            filteredOrders.map((order, idx) => (
              <motion.div
                key={order._id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3, delay: idx * 0.05 }}
                className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden group"
              >
                <div className="p-8">
                  <div className="grid lg:grid-cols-12 gap-8 items-center">
                    {/* Crop Info */}
                    <div className="lg:col-span-3 space-y-3">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 bg-gray-50 px-2 py-1 rounded-md">#{order._id.slice(-6)}</span>
                        {order.status === 'Pending' ? (
                          <span className="bg-amber-100 text-amber-700 text-[10px] font-black px-2 py-1 rounded-full flex items-center gap-1 uppercase tracking-wider">
                            <Clock className="w-3 h-3" /> Processing
                          </span>
                        ) : (
                          <span className="bg-green-100 text-green-700 text-[10px] font-black px-2 py-1 rounded-full flex items-center gap-1 uppercase tracking-wider">
                            <CheckCircle2 className="w-3 h-3" /> Shipped
                          </span>
                        )}
                      </div>
                      <h3 className="text-2xl font-black text-gray-900">{order.crop?.name || 'Fresh Harvest'}</h3>
                      <div className="flex items-center gap-2 text-agriGreen font-black">
                        <DollarSign className="w-4 h-4" />
                        <span className="text-xl">{order.totalPrice} ETB</span>
                      </div>
                    </div>

                    {/* Logistics Tracker */}
                    <div className="lg:col-span-4 px-4">
                      <div className="relative flex justify-between">
                        <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gray-100 -translate-y-1/2" />
                        <div className={`absolute top-1/2 left-0 h-0.5 bg-agriGreen -translate-y-1/2 transition-all duration-1000 ${order.status === 'Completed' ? 'w-full' : 'w-1/2'}`} />
                        
                        {[
                          { icon: Package, label: 'Packed' },
                          { icon: Truck, label: 'Transit' },
                          { icon: MapPin, label: 'Arrived' },
                        ].map((step, i) => (
                          <div key={i} className="relative z-10 flex flex-col items-center gap-2">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center border-4 border-white shadow-sm ${
                              (order.status === 'Completed') || (order.status === 'Pending' && i === 0)
                                ? 'bg-agriGreen text-white'
                                : 'bg-gray-100 text-gray-400'
                            }`}>
                              <step.icon className="w-4 h-4" />
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-wider text-gray-400">{step.label}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Buyer & Address */}
                    <div className="lg:col-span-3 space-y-4 border-l border-gray-50 pl-8">
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-gray-50 rounded-xl text-gray-400">
                          <User className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">Buyer</p>
                          <p className="text-sm font-bold text-gray-900 mt-1">{order.buyer?.name || 'Verified Buyer'}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-gray-50 rounded-xl text-gray-400">
                          <MapPin className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">Shipping To</p>
                          <p className="text-sm font-medium text-gray-600 mt-1 line-clamp-1">{order.deliveryAddress}</p>
                        </div>
                      </div>
                    </div>

                    {/* Action */}
                    <div className="lg:col-span-2 text-right">
                      <button className={`w-full py-4 rounded-2xl font-black transition-all flex items-center justify-center gap-2 group/btn ${
                        order.status === 'Pending'
                          ? 'bg-agriGreen text-white shadow-lg shadow-green-100 hover:shadow-green-200'
                          : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      }`}>
                        {order.status === 'Pending' ? (
                          <>
                            Ship Now
                            <ArrowRight className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />
                          </>
                        ) : (
                          'Delivered'
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="py-24 text-center bg-gray-50 rounded-[3rem] border-2 border-dashed border-gray-200"
            >
              <Box className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-600">No {filter.toLowerCase()} orders found</h3>
              <p className="text-gray-400 mt-1">Your harvest is ready, waiting for the right buyer!</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default FarmerOrders;
