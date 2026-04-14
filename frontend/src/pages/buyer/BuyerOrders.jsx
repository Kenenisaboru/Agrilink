import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { 
  Package, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  User, 
  CreditCard,
  Loader2,
  ShoppingBag,
  ArrowRight,
  Truck,
  Eye,
  DollarSign,
  Calendar,
  Box
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { getCropImage } from '../../utils/cropUtils';

/**
 * BuyerOrders Page
 * 
 * Shows the buyer's purchase history with order status tracking.
 * Accessible at: /dashboard/buyer/orders
 * 
 * Each order card shows:
 * - Order items with images
 * - Farmer (seller) info
 * - Payment status
 * - Delivery status tracker
 * - Transaction ID
 */
const BuyerOrders = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  const [expandedOrder, setExpandedOrder] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const { data } = await axios.get('/api/orders/myorders');
        setOrders(data);
      } catch (err) {
        console.error('Error fetching buyer orders:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const filteredOrders = filter === 'All' 
    ? orders 
    : orders.filter(o => o.status === filter || o.paymentStatus === filter);

  // Quick stats
  const stats = {
    total: orders.length,
    paid: orders.filter(o => o.paymentStatus === 'Paid').length,
    delivered: orders.filter(o => o.status === 'Delivered' || o.status === 'Completed').length,
    totalSpent: orders.reduce((acc, o) => acc + (o.totalPrice || 0), 0),
  };

  // Status badge helper
  const getStatusBadge = (status) => {
    const styles = {
      Pending:    'bg-gray-100 text-gray-600',
      Paid:       'bg-green-100 text-green-700',
      Processing: 'bg-blue-100 text-blue-700',
      Shipped:    'bg-amber-100 text-amber-700',
      Delivered:  'bg-emerald-100 text-emerald-700',
      Completed:  'bg-emerald-100 text-emerald-700',
      Cancelled:  'bg-red-100 text-red-600',
    };
    const icons = {
      Pending:    <Clock className="w-3 h-3" />,
      Paid:       <CheckCircle2 className="w-3 h-3" />,
      Processing: <Package className="w-3 h-3" />,
      Shipped:    <Truck className="w-3 h-3" />,
      Delivered:  <CheckCircle2 className="w-3 h-3" />,
      Completed:  <CheckCircle2 className="w-3 h-3" />,
      Cancelled:  <Clock className="w-3 h-3" />,
    };
    return (
      <span className={`${styles[status] || styles.Pending} text-[10px] font-black px-3 py-1 rounded-full flex items-center gap-1 uppercase tracking-wider w-fit`}>
        {icons[status] || icons.Pending}
        {status}
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
          <h1 className="text-4xl font-black text-gray-900 tracking-tight">My Orders</h1>
          <p className="text-gray-500 font-medium mt-1">Track your purchases from East Hararghe farmers.</p>
        </div>
        <div className="flex items-center gap-2 p-1.5 bg-gray-100 rounded-2xl w-fit">
          {['All', 'Paid', 'Shipped', 'Delivered'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all ${
                filter === status 
                  ? 'bg-white text-agriGreen shadow-sm' 
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </header>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Orders', value: stats.total, icon: ShoppingBag, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Paid', value: stats.paid, icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-50' },
          { label: 'Delivered', value: stats.delivered, icon: Truck, color: 'text-amber-600', bg: 'bg-amber-50' },
          { label: 'Total Spent', value: `${stats.totalSpent.toLocaleString()} ETB`, icon: DollarSign, color: 'text-purple-600', bg: 'bg-purple-50' },
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
                className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden"
              >
                <div className="p-8">
                  {/* Order Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 bg-gray-50 px-3 py-1 rounded-md">
                        #{order._id.slice(-6)}
                      </span>
                      {getStatusBadge(order.status)}
                      {order.paymentStatus === 'Paid' && (
                        <span className="bg-green-50 text-green-600 text-[10px] font-black px-2 py-1 rounded-full uppercase tracking-wider">
                          💰 Paid
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-400 font-bold">
                      <Calendar className="w-3.5 h-3.5" />
                      {new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </div>
                  </div>

                  {/* Items */}
                  <div className="grid lg:grid-cols-12 gap-6 items-center">
                    <div className="lg:col-span-5">
                      <div className="space-y-3">
                        {order.orderItems.map((item, i) => (
                          <div key={i} className="flex items-center gap-4 p-3 bg-gray-50 rounded-2xl">
                            <div className="w-12 h-12 rounded-xl bg-white border border-gray-100 overflow-hidden shrink-0">
                              <img 
                                src={getCropImage(item)} 
                                alt={item.name}
                                className="w-full h-full object-cover" 
                              />
                            </div>
                            <div className="flex-grow min-w-0">
                              <p className="font-black text-gray-900 text-sm truncate">{item.name}</p>
                              <p className="text-[10px] text-gray-400 font-bold">Qty: {item.quantity} × {item.price?.toLocaleString()} ETB</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Seller + Delivery Info */}
                    <div className="lg:col-span-4 space-y-3">
                      {order.farmer && (
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-gray-50 rounded-xl text-gray-400">
                            <User className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Farmer</p>
                            <p className="text-sm font-bold text-gray-900">{order.farmer.name}</p>
                          </div>
                        </div>
                      )}
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-gray-50 rounded-xl text-gray-400">
                          <MapPin className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Delivery</p>
                          <p className="text-sm font-medium text-gray-600 line-clamp-1">{order.deliveryAddress}</p>
                        </div>
                      </div>
                      {order.transactionId && (
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-gray-50 rounded-xl text-gray-400">
                            <CreditCard className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Txn ID</p>
                            <p className="text-xs font-mono text-gray-600 truncate max-w-[200px]">{order.transactionId}</p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Total + Action */}
                    <div className="lg:col-span-3 text-right space-y-3">
                      <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total</p>
                        <p className="text-2xl font-black text-agriGreen">{order.totalPrice?.toLocaleString()} <span className="text-xs text-gray-400">ETB</span></p>
                      </div>
                      <button 
                        onClick={() => setExpandedOrder(expandedOrder === order._id ? null : order._id)}
                        className="w-full py-3 rounded-xl bg-gray-50 hover:bg-gray-100 text-gray-600 font-bold text-sm transition-all flex items-center justify-center gap-2"
                      >
                        <Eye className="w-4 h-4" />
                        {expandedOrder === order._id ? 'Hide Details' : 'View Details'}
                      </button>
                    </div>
                  </div>

                  {/* Expanded Details */}
                  <AnimatePresence>
                    {expandedOrder === order._id && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-6 pt-6 border-t border-gray-100"
                      >
                        {/* Delivery Progress Tracker */}
                        <div className="mb-6">
                          <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Delivery Progress</h4>
                          <div className="relative flex justify-between max-w-md">
                            <div className="absolute top-5 left-0 w-full h-0.5 bg-gray-100" />
                            <div className={`absolute top-5 left-0 h-0.5 bg-agriGreen transition-all duration-1000 ${
                              order.status === 'Delivered' || order.status === 'Completed' ? 'w-full' :
                              order.status === 'Shipped' ? 'w-2/3' :
                              order.status === 'Paid' || order.status === 'Processing' ? 'w-1/3' : 'w-0'
                            }`} />
                            {[
                              { icon: CreditCard, label: 'Paid', done: ['Paid','Processing','Shipped','Delivered','Completed'].includes(order.status) },
                              { icon: Package, label: 'Preparing', done: ['Processing','Shipped','Delivered','Completed'].includes(order.status) },
                              { icon: Truck, label: 'Shipped', done: ['Shipped','Delivered','Completed'].includes(order.status) },
                              { icon: CheckCircle2, label: 'Delivered', done: ['Delivered','Completed'].includes(order.status) },
                            ].map((step, i) => (
                              <div key={i} className="relative z-10 flex flex-col items-center gap-2">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center border-4 border-white shadow-sm ${
                                  step.done ? 'bg-agriGreen text-white' : 'bg-gray-100 text-gray-400'
                                }`}>
                                  <step.icon className="w-4 h-4" />
                                </div>
                                <span className="text-[10px] font-black uppercase tracking-wider text-gray-400">{step.label}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="grid sm:grid-cols-3 gap-4 text-sm">
                          <div className="bg-gray-50 rounded-xl p-4">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Payment Method</p>
                            <p className="font-bold text-gray-900">{order.paymentMethod || 'Chapa'}</p>
                          </div>
                          <div className="bg-gray-50 rounded-xl p-4">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Order Time</p>
                            <p className="font-bold text-gray-900">
                              {new Date(order.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                          {order.farmer?.location && (
                            <div className="bg-gray-50 rounded-xl p-4">
                              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Farm Location</p>
                              <p className="font-bold text-gray-900">{order.farmer.location}</p>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            ))
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="py-24 text-center bg-gray-50 rounded-[3rem] border-2 border-dashed border-gray-200"
            >
              <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-600">No orders found</h3>
              <p className="text-gray-400 mt-1 mb-6">Start shopping for fresh produce from local farmers!</p>
              <button 
                onClick={() => navigate('/dashboard/buyer')}
                className="btn-primary py-3 px-8 rounded-2xl inline-flex"
              >
                Browse Market <ArrowRight className="w-5 h-5" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default BuyerOrders;
