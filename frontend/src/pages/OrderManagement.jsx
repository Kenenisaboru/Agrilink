import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Package, 
  Truck, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  Phone, 
  Calendar, 
  DollarSign, 
  ArrowRight,
  Filter,
  Search,
  RefreshCw,
  Download,
  Eye,
  MessageSquare,
  MoreHorizontal,
  AlertCircle,
  User,
  Star,
  X,
  ChevronDown,
  ChevronUp,
  Loader2,
  BarChart3,
  TrendingUp,
  Activity
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const OrderManagement = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showDetails, setShowDetails] = useState(false);

  // Sample order data
  const sampleOrders = [
    {
      id: 'AGR-2026-001',
      buyer: { name: 'Fatuma Ahmed', email: 'fatuma@email.com', phone: '+251 911 123 456' },
      farmer: { name: 'Abebe Kebede', phone: '+251 922 345 678' },
      items: [
        { name: 'Premium Coffee', quantity: 50, unit: 'Kg', price: 4500, image: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=100' }
      ],
      total: 225000,
      status: 'Processing',
      paymentStatus: 'Paid',
      paymentMethod: 'Telebirr',
      shippingAddress: 'Mekanisa, Addis Ababa, Ethiopia',
      orderDate: '2026-04-20',
      estimatedDelivery: '2026-04-25',
      tracking: [
        { status: 'Order Placed', date: '2026-04-20 10:30', completed: true },
        { status: 'Payment Confirmed', date: '2026-04-20 10:35', completed: true },
        { status: 'Processing', date: '2026-04-20 14:00', completed: true },
        { status: 'Shipped', date: '2026-04-22', completed: false },
        { status: 'Delivered', date: '2026-04-25', completed: false }
      ]
    },
    {
      id: 'AGR-2026-002',
      buyer: { name: 'Chaltu Tadesse', email: 'chaltu@email.com', phone: '+251 933 456 789' },
      farmer: { name: 'Kedir Jemal', phone: '+251 944 567 890' },
      items: [
        { name: 'Organic Teff', quantity: 100, unit: 'Kg', price: 3200, image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=100' },
        { name: 'Fresh Khat', quantity: 20, unit: 'Bundle', price: 2800, image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=100' }
      ],
      total: 388000,
      status: 'Shipped',
      paymentStatus: 'Paid',
      paymentMethod: 'CBE',
      shippingAddress: 'Bole, Addis Ababa, Ethiopia',
      orderDate: '2026-04-19',
      estimatedDelivery: '2026-04-24',
      tracking: [
        { status: 'Order Placed', date: '2026-04-19 09:00', completed: true },
        { status: 'Payment Confirmed', date: '2026-04-19 09:05', completed: true },
        { status: 'Processing', date: '2026-04-19 11:00', completed: true },
        { status: 'Shipped', date: '2026-04-21', completed: true },
        { status: 'Delivered', date: '2026-04-24', completed: false }
      ]
    },
    {
      id: 'AGR-2026-003',
      buyer: { name: 'Mohammed Ali', email: 'mohammed@email.com', phone: '+251 955 678 901' },
      farmer: { name: 'Zeyneb Ahmed', phone: '+251 966 789 012' },
      items: [
        { name: 'Berbere Spice Mix', quantity: 30, unit: 'Kg', price: 450, image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=100' }
      ],
      total: 13500,
      status: 'Delivered',
      paymentStatus: 'Paid',
      paymentMethod: 'M-Pesa',
      shippingAddress: 'Kazanchis, Addis Ababa, Ethiopia',
      orderDate: '2026-04-15',
      estimatedDelivery: '2026-04-18',
      tracking: [
        { status: 'Order Placed', date: '2026-04-15 08:00', completed: true },
        { status: 'Payment Confirmed', date: '2026-04-15 08:05', completed: true },
        { status: 'Processing', date: '2026-04-15 10:00', completed: true },
        { status: 'Shipped', date: '2026-04-16', completed: true },
        { status: 'Delivered', date: '2026-04-18', completed: true }
      ]
    },
    {
      id: 'AGR-2026-004',
      buyer: { name: 'Abebe Kebede', email: 'abebe@email.com', phone: '+251 977 890 123' },
      farmer: { name: 'Fatuma Ahmed', phone: '+251 988 901 234' },
      items: [
        { name: 'Organic Honey', quantity: 25, unit: 'Kg', price: 1800, image: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=100' }
      ],
      total: 45000,
      status: 'Pending',
      paymentStatus: 'Pending',
      paymentMethod: 'Telebirr',
      shippingAddress: 'Piassa, Addis Ababa, Ethiopia',
      orderDate: '2026-04-22',
      estimatedDelivery: '2026-04-27',
      tracking: [
        { status: 'Order Placed', date: '2026-04-22 12:00', completed: true },
        { status: 'Payment Confirmed', date: 'Pending', completed: false },
        { status: 'Processing', date: 'Pending', completed: false },
        { status: 'Shipped', date: 'Pending', completed: false },
        { status: 'Delivered', date: '2026-04-27', completed: false }
      ]
    }
  ];

  useEffect(() => {
    setOrders(sampleOrders);
    setLoading(false);
  }, []);

  const statusColors = {
    Pending: 'bg-amber-100 text-amber-700',
    Processing: 'bg-blue-100 text-blue-700',
    Shipped: 'bg-purple-100 text-purple-700',
    Delivered: 'bg-green-100 text-green-700',
    Cancelled: 'bg-red-100 text-red-700'
  };

  const filteredOrders = orders.filter(order => {
    const matchesStatus = filterStatus === 'all' || order.status === filterStatus;
    const matchesSearch = searchQuery === '' || 
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.buyer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.farmer.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const stats = {
    total: orders.length,
    pending: orders.filter(o => o.status === 'Pending').length,
    processing: orders.filter(o => o.status === 'Processing').length,
    shipped: orders.filter(o => o.status === 'Shipped').length,
    delivered: orders.filter(o => o.status === 'Delivered').length,
    revenue: orders.filter(o => o.paymentStatus === 'Paid').reduce((sum, o) => sum + o.total, 0)
  };

  if (loading) {
    return (
      <div className="h-[60vh] flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-agriGreen" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-1">
          <h1 className="text-4xl font-black text-gray-900 tracking-tight flex items-center gap-3">
            <Package className="w-10 h-10 text-agriGreen" />
            Order Management
          </h1>
          <p className="text-gray-500 font-medium">Track and manage all orders across the platform</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold px-4 py-3 rounded-2xl transition-colors">
            <Download className="w-5 h-5" />
            Export
          </button>
          <button className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold px-4 py-3 rounded-2xl transition-colors">
            <RefreshCw className="w-5 h-5" />
            Refresh
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <Package className="w-5 h-5 text-gray-400" />
            <span className="text-xs font-bold text-gray-400">Total</span>
          </div>
          <p className="text-2xl font-black text-gray-900">{stats.total}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <Clock className="w-5 h-5 text-amber-500" />
            <span className="text-xs font-bold text-gray-400">Pending</span>
          </div>
          <p className="text-2xl font-black text-gray-900">{stats.pending}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <Activity className="w-5 h-5 text-blue-500" />
            <span className="text-xs font-bold text-gray-400">Processing</span>
          </div>
          <p className="text-2xl font-black text-gray-900">{stats.processing}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <Truck className="w-5 h-5 text-purple-500" />
            <span className="text-xs font-bold text-gray-400">Shipped</span>
          </div>
          <p className="text-2xl font-black text-gray-900">{stats.shipped}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <CheckCircle2 className="w-5 h-5 text-green-500" />
            <span className="text-xs font-bold text-gray-400">Delivered</span>
          </div>
          <p className="text-2xl font-black text-gray-900">{stats.delivered}</p>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search orders by ID, buyer, or farmer..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-gray-200 rounded-2xl py-4 pl-12 pr-4 outline-none focus:ring-4 focus:ring-agriGreen/10 focus:border-agriGreen transition-all font-medium"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-gray-400" />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-white border border-gray-200 rounded-2xl px-6 py-4 outline-none focus:ring-4 focus:ring-agriGreen/10 font-bold cursor-pointer"
          >
            <option value="all">All Status</option>
            <option value="Pending">Pending</option>
            <option value="Processing">Processing</option>
            <option value="Shipped">Shipped</option>
            <option value="Delivered">Delivered</option>
          </select>
        </div>
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {filteredOrders.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 border border-gray-100 text-center">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">No orders found</h3>
            <p className="text-gray-500">Try adjusting your filters or search terms</p>
          </div>
        ) : (
          filteredOrders.map((order, index) => (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden"
            >
              <div className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Order Info */}
                  <div className="flex items-start gap-4 flex-1">
                    <div className="w-12 h-12 bg-agriGreen/10 rounded-xl flex items-center justify-center shrink-0">
                      <Package className="w-6 h-6 text-agriGreen" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="font-black text-gray-900">{order.id}</h3>
                        <span className={`text-xs font-bold px-3 py-1 rounded-full ${statusColors[order.status]}`}>
                          {order.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <User className="w-4 h-4" />
                          {order.buyer.name}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {order.orderDate}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Items Preview */}
                  <div className="flex items-center gap-2">
                    {order.items.slice(0, 2).map((item, idx) => (
                      <img
                        key={idx}
                        src={item.image}
                        alt={item.name}
                        className="w-12 h-12 rounded-xl object-cover border border-gray-100"
                      />
                    ))}
                    {order.items.length > 2 && (
                      <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500">
                        +{order.items.length - 2}
                      </div>
                    )}
                  </div>

                  {/* Total */}
                  <div className="text-right">
                    <p className="text-2xl font-black text-agriGreen">ETB {order.total.toLocaleString()}</p>
                    <p className="text-xs text-gray-400">{order.paymentMethod}</p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSelectedOrder(order)}
                      className="p-3 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
                    >
                      <Eye className="w-5 h-5 text-gray-600" />
                    </button>
                    <button className="p-3 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors">
                      <MessageSquare className="w-5 h-5 text-gray-600" />
                    </button>
                    <button className="p-3 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors">
                      <MoreHorizontal className="w-5 h-5 text-gray-600" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Order Details Modal */}
      <AnimatePresence>
        {selectedOrder && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedOrder(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h2 className="text-2xl font-black text-gray-900">{selectedOrder.id}</h2>
                    <p className="text-gray-500">Order Details</p>
                  </div>
                  <button
                    onClick={() => setSelectedOrder(null)}
                    className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
                  >
                    <X className="w-6 h-6 text-gray-400" />
                  </button>
                </div>

                {/* Order Status */}
                <div className="bg-gray-50 rounded-2xl p-6 mb-8">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-gray-900">Order Status</h3>
                    <span className={`text-sm font-bold px-4 py-2 rounded-full ${statusColors[selectedOrder.status]}`}>
                      {selectedOrder.status}
                    </span>
                  </div>
                  <div className="space-y-4">
                    {selectedOrder.tracking.map((step, index) => {
                      const StepIcon = step.completed ? CheckCircle2 : Clock;
                      return (
                        <div key={index} className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            step.completed ? 'bg-agriGreen text-white' : 'bg-gray-200 text-gray-400'
                          }`}>
                            <StepIcon className="w-5 h-5" />
                          </div>
                          <div className="flex-1">
                            <p className={`font-bold ${step.completed ? 'text-gray-900' : 'text-gray-400'}`}>
                              {step.status}
                            </p>
                            <p className="text-sm text-gray-500">{step.date}</p>
                          </div>
                          {index < selectedOrder.tracking.length - 1 && (
                            <div className={`w-0.5 h-8 ${step.completed ? 'bg-agriGreen' : 'bg-gray-200'}`} />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Order Items */}
                <div className="mb-8">
                  <h3 className="font-bold text-gray-900 mb-4">Order Items</h3>
                  <div className="space-y-4">
                    {selectedOrder.items.map((item, index) => (
                      <div key={index} className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl">
                        <img src={item.image} alt={item.name} className="w-16 h-16 rounded-xl object-cover" />
                        <div className="flex-1">
                          <p className="font-bold text-gray-900">{item.name}</p>
                          <p className="text-sm text-gray-500">{item.quantity} {item.unit} × ETB {item.price.toLocaleString()}</p>
                        </div>
                        <p className="font-black text-agriGreen">ETB {(item.quantity * item.price).toLocaleString()}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Buyer & Farmer Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div className="bg-blue-50 rounded-2xl p-6">
                    <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <User className="w-5 h-5 text-blue-600" />
                      Buyer Information
                    </h3>
                    <div className="space-y-3">
                      <p className="font-bold text-gray-900">{selectedOrder.buyer.name}</p>
                      <p className="text-sm text-gray-600 flex items-center gap-2">
                        <Mail className="w-4 h-4" />
                        {selectedOrder.buyer.email}
                      </p>
                      <p className="text-sm text-gray-600 flex items-center gap-2">
                        <Phone className="w-4 h-4" />
                        {selectedOrder.buyer.phone}
                      </p>
                      <p className="text-sm text-gray-600 flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        {selectedOrder.shippingAddress}
                      </p>
                    </div>
                  </div>
                  <div className="bg-green-50 rounded-2xl p-6">
                    <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <Package className="w-5 h-5 text-green-600" />
                      Farmer Information
                    </h3>
                    <div className="space-y-3">
                      <p className="font-bold text-gray-900">{selectedOrder.farmer.name}</p>
                      <p className="text-sm text-gray-600 flex items-center gap-2">
                        <Phone className="w-4 h-4" />
                        {selectedOrder.farmer.phone}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Payment Info */}
                <div className="bg-purple-50 rounded-2xl p-6 mb-8">
                  <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-purple-600" />
                    Payment Information
                  </h3>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Payment Method</p>
                      <p className="font-bold text-gray-900">{selectedOrder.paymentMethod}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Payment Status</p>
                      <p className={`font-bold ${selectedOrder.paymentStatus === 'Paid' ? 'text-green-600' : 'text-amber-600'}`}>
                        {selectedOrder.paymentStatus}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Total Amount</p>
                      <p className="text-2xl font-black text-agriGreen">ETB {selectedOrder.total.toLocaleString()}</p>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-4">
                  <button className="flex-1 btn-primary py-4 rounded-2xl font-bold flex items-center justify-center gap-2">
                    <MessageSquare className="w-5 h-5" />
                    Contact Buyer
                  </button>
                  <button className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-4 rounded-2xl transition-colors">
                    Print Invoice
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default OrderManagement;
