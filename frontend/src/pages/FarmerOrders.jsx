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
  ChevronRight,
  Truck,
  Box,
  DollarSign,
  Loader2,
  Calendar,
  CreditCard,
  Bell,
  Eye,
  ShieldCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * FarmerOrders Page — The Farmer's Order Dashboard
 * 
 * Shows orders where buyers purchased THIS farmer's crops.
 * Uses the /api/orders/farmer/orders endpoint (NOT /myorders).
 * 
 * Key features:
 * - See WHO bought your crops (buyer name, phone, email)
 * - See WHAT was ordered (items, quantities, total)
 * - See payment status (Paid ✅)
 * - Update order status (Ship Now → Delivered)
 * - Stats overview (total sales, revenue, pending shipments)
 */
const FarmerOrders = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  const [updatingId, setUpdatingId] = useState(null);

  // Fetch orders where THIS farmer's crops were purchased
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        // This endpoint returns orders where farmer = current user
        const { data } = await axios.get('/api/orders/farmer/orders');
        setOrders(data);
      } catch (err) {
        console.error("Error fetching farmer orders:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [user]);

  // Update order status (e.g., "Ship Now" → marks as Shipped)
  const handleStatusUpdate = async (orderId, newStatus) => {
    setUpdatingId(orderId);
    try {
      const { data } = await axios.put(`/api/orders/${orderId}/status`, { status: newStatus });
      // Update the order in local state
      setOrders(prev => prev.map(o => o._id === orderId ? { ...o, status: data.status } : o));
    } catch (err) {
      console.error('Error updating order status:', err);
    } finally {
      setUpdatingId(null);
    }
  };

  // Filter orders
  const filteredOrders = filter === 'All' 
    ? orders 
    : orders.filter(o => o.status === filter);

  // Calculate stats
  const stats = {
    total: orders.length,
    pending: orders.filter(o => o.status === 'Paid' || o.status === 'Processing').length,
    shipped: orders.filter(o => o.status === 'Shipped').length,
    completed: orders.filter(o => o.status === 'Delivered' || o.status === 'Completed').length,
    revenue: orders
      .filter(o => o.paymentStatus === 'Paid')
      .reduce((acc, curr) => acc + (curr.totalPrice || 0), 0)
  };

  // Status badge helper
  const getStatusBadge = (status) => {
    const config = {
      Pending:    { bg: 'bg-gray-100', text: 'text-gray-600', icon: <Clock className="w-3 h-3" /> },
      Paid:       { bg: 'bg-green-100', text: 'text-green-700', icon: <CheckCircle2 className="w-3 h-3" /> },
      Processing: { bg: 'bg-blue-100', text: 'text-blue-700', icon: <Package className="w-3 h-3" /> },
      Shipped:    { bg: 'bg-amber-100', text: 'text-amber-700', icon: <Truck className="w-3 h-3" /> },
      Delivered:  { bg: 'bg-emerald-100', text: 'text-emerald-700', icon: <CheckCircle2 className="w-3 h-3" /> },
      Completed:  { bg: 'bg-emerald-100', text: 'text-emerald-700', icon: <CheckCircle2 className="w-3 h-3" /> },
      Cancelled:  { bg: 'bg-red-100', text: 'text-red-600', icon: <Clock className="w-3 h-3" /> },
    };
    const c = config[status] || config.Pending;
    return (
      <span className={`${c.bg} ${c.text} text-[10px] font-black px-3 py-1 rounded-full flex items-center gap-1 uppercase tracking-wider w-fit`}>
        {c.icon} {status}
      </span>
    );
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
          <h1 className="text-4xl font-black text-gray-900 tracking-tight">Incoming Orders</h1>
          <p className="text-gray-500 font-medium mt-1">Manage orders from buyers across East Hararghe.</p>
        </div>
        <div className="flex items-center gap-2 p-1.5 bg-gray-100 rounded-2xl w-fit">
          {['All', 'Paid', 'Shipped', 'Delivered'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all ${
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
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { label: 'Total Orders', value: stats.total, icon: Box, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Awaiting Ship', value: stats.pending, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
          { label: 'In Transit', value: stats.shipped, icon: Truck, color: 'text-indigo-600', bg: 'bg-indigo-50' },
          { label: 'Delivered', value: stats.completed, icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-50' },
          { label: 'Revenue', value: `${stats.revenue.toLocaleString()} ETB`, icon: DollarSign, color: 'text-purple-600', bg: 'bg-purple-50' },
        ].map((item, i) => (
          <div key={i} className="bg-white p-5 rounded-[2rem] border border-gray-100 shadow-sm flex items-center gap-3">
            <div className={`p-2.5 rounded-xl ${item.bg} ${item.color}`}>
              <item.icon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{item.label}</p>
              <p className="text-lg font-black text-gray-900">{item.value}</p>
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
                  {/* Order Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 bg-gray-50 px-3 py-1 rounded-md">
                        #{order._id.slice(-6)}
                      </span>
                      {getStatusBadge(order.status)}
                      {order.paymentStatus === 'Paid' && (
                        <span className="bg-green-50 text-green-600 text-[10px] font-black px-2 py-1 rounded-full flex items-center gap-1">
                          <ShieldCheck className="w-3 h-3" /> Payment Verified
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-400 font-bold">
                      <Calendar className="w-3.5 h-3.5" />
                      {new Date(order.createdAt).toLocaleDateString('en-US', { 
                        month: 'short', day: 'numeric', year: 'numeric',
                        hour: '2-digit', minute: '2-digit'
                      })}
                    </div>
                  </div>

                  <div className="grid lg:grid-cols-12 gap-8 items-start">
                    {/* Crop Items */}
                    <div className="lg:col-span-4">
                      <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Ordered Items</h4>
                      <div className="space-y-2">
                        {order.orderItems.map((item, i) => (
                          <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-2xl">
                            <div className="w-12 h-12 rounded-xl bg-white border border-gray-100 overflow-hidden shrink-0">
                              <img 
                                src={item.image || 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?auto=format&fit=crop&q=80&w=200'} 
                                alt={item.name} 
                                className="w-full h-full object-cover" 
                              />
                            </div>
                            <div className="min-w-0">
                              <p className="font-black text-gray-900 text-sm truncate">{item.name}</p>
                              <p className="text-[10px] text-gray-400 font-bold">
                                {item.quantity} {item.unit || 'units'} × {item.price?.toLocaleString()} ETB
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="mt-3 p-3 bg-agriGreen/5 rounded-xl border border-agriGreen/10">
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-bold text-gray-500">Order Total</span>
                          <span className="text-lg font-black text-agriGreen">{order.totalPrice?.toLocaleString()} ETB</span>
                        </div>
                      </div>
                    </div>

                    {/* Buyer Info */}
                    <div className="lg:col-span-4 space-y-4">
                      <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Buyer Information</h4>
                      
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-blue-50 rounded-xl text-blue-500">
                          <User className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">Name</p>
                          <p className="text-sm font-bold text-gray-900 mt-1">{order.buyer?.name || 'Verified Buyer'}</p>
                        </div>
                      </div>

                      {(order.buyerPhone || order.buyer?.phone) && (
                        <div className="flex items-start gap-3">
                          <div className="p-2 bg-green-50 rounded-xl text-green-500">
                            <Phone className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">Phone</p>
                            <p className="text-sm font-bold text-gray-900 mt-1">{order.buyerPhone || order.buyer?.phone}</p>
                          </div>
                        </div>
                      )}

                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-amber-50 rounded-xl text-amber-500">
                          <MapPin className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">Delivery Address</p>
                          <p className="text-sm font-medium text-gray-600 mt-1">{order.deliveryAddress}</p>
                        </div>
                      </div>

                      {order.transactionId && (
                        <div className="flex items-start gap-3">
                          <div className="p-2 bg-purple-50 rounded-xl text-purple-500">
                            <CreditCard className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">Transaction</p>
                            <p className="text-xs font-mono text-gray-600 mt-1 break-all">{order.transactionId}</p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="lg:col-span-4 space-y-4">
                      <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Delivery Progress</h4>
                      
                      {/* Mini Progress */}
                      <div className="relative flex justify-between mb-6">
                        <div className="absolute top-5 left-0 w-full h-0.5 bg-gray-100" />
                        <div className={`absolute top-5 left-0 h-0.5 bg-agriGreen transition-all duration-1000 ${
                          order.status === 'Delivered' || order.status === 'Completed' ? 'w-full' : 
                          order.status === 'Shipped' ? 'w-2/3' :
                          order.status === 'Paid' || order.status === 'Processing' ? 'w-1/3' : 'w-0'
                        }`} />
                        
                        {[
                          { icon: CreditCard, label: 'Paid' },
                          { icon: Truck, label: 'Ship' },
                          { icon: MapPin, label: 'Deliver' },
                        ].map((step, i) => {
                          const stepStatuses = [
                            ['Paid', 'Processing', 'Shipped', 'Delivered', 'Completed'],
                            ['Shipped', 'Delivered', 'Completed'],
                            ['Delivered', 'Completed'],
                          ];
                          const isActive = stepStatuses[i].includes(order.status);
                          
                          return (
                            <div key={i} className="relative z-10 flex flex-col items-center gap-2">
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center border-4 border-white shadow-sm ${
                                isActive ? 'bg-agriGreen text-white' : 'bg-gray-100 text-gray-400'
                              }`}>
                                <step.icon className="w-4 h-4" />
                              </div>
                              <span className="text-[10px] font-black uppercase tracking-wider text-gray-400">{step.label}</span>
                            </div>
                          );
                        })}
                      </div>

                      {/* Action Button */}
                      {(order.status === 'Paid' || order.status === 'Processing') && (
                        <button
                          onClick={() => handleStatusUpdate(order._id, 'Shipped')}
                          disabled={updatingId === order._id}
                          className="w-full py-4 rounded-2xl font-black transition-all flex items-center justify-center gap-2 bg-agriGreen text-white shadow-lg shadow-green-100 hover:shadow-green-200 active:scale-95 disabled:opacity-50"
                        >
                          {updatingId === order._id ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                          ) : (
                            <>
                              <Truck className="w-5 h-5" />
                              Ship Now
                              <ArrowRight className="w-5 h-5" />
                            </>
                          )}
                        </button>
                      )}

                      {order.status === 'Shipped' && (
                        <button
                          onClick={() => handleStatusUpdate(order._id, 'Delivered')}
                          disabled={updatingId === order._id}
                          className="w-full py-4 rounded-2xl font-black transition-all flex items-center justify-center gap-2 bg-blue-600 text-white shadow-lg hover:bg-blue-700 active:scale-95 disabled:opacity-50"
                        >
                          {updatingId === order._id ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                          ) : (
                            <>
                              <CheckCircle2 className="w-5 h-5" />
                              Mark Delivered
                            </>
                          )}
                        </button>
                      )}

                      {(order.status === 'Delivered' || order.status === 'Completed') && (
                        <div className="w-full py-4 rounded-2xl font-black flex items-center justify-center gap-2 bg-gray-100 text-gray-400">
                          <CheckCircle2 className="w-5 h-5" />
                          Order Complete
                        </div>
                      )}
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
              <h3 className="text-xl font-bold text-gray-600">No {filter.toLowerCase()} orders yet</h3>
              <p className="text-gray-400 mt-1">When buyers purchase your crops, orders will appear here.</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default FarmerOrders;
