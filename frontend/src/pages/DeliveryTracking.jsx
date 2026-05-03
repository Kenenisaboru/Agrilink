import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { motion } from 'framer-motion';
import io from 'socket.io-client';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import {
  Package, Truck, CheckCircle2, Clock, MapPin,
  Loader2, ChevronRight, Phone, User, ArrowLeft,
  CreditCard, ShoppingBag, AlertCircle, Box, Warehouse, Navigation
} from 'lucide-react';

// Fix Leaflet marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// ── Delivery Status Steps ───────────────────────────────────────────────────
const STATUS_STEPS = [
  { key: 'Paid', label: 'Order Confirmed', icon: CreditCard, description: 'Payment verified successfully' },
  { key: 'Processing', label: 'Being Prepared', icon: Warehouse, description: 'Farmer is packing your order' },
  { key: 'Shipped', label: 'In Transit', icon: Truck, description: 'Your order is on the way' },
  { key: 'Delivered', label: 'Delivered', icon: CheckCircle2, description: 'Order delivered to your address' },
];

const getStepIndex = (status) => {
  const idx = STATUS_STEPS.findIndex(s => s.key === status);
  return idx >= 0 ? idx : -1;
};

const getStatusColor = (status) => {
  switch (status) {
    case 'Delivered': case 'Completed': return 'text-green-600 bg-green-50 border-green-200';
    case 'Shipped': return 'text-blue-600 bg-blue-50 border-blue-200';
    case 'Processing': return 'text-amber-600 bg-amber-50 border-amber-200';
    case 'Cancelled': return 'text-red-600 bg-red-50 border-red-200';
    default: return 'text-gray-600 bg-gray-50 border-gray-200';
  }
};

// ── Estimated Time Helper ───────────────────────────────────────────────────
const getEstimatedTime = (status, createdAt) => {
  const created = new Date(createdAt);
  switch (status) {
    case 'Paid': case 'Pending': return '1-2 days for preparation';
    case 'Processing': return '1-3 days until shipment';
    case 'Shipped': return 'Arriving in 1-2 days';
    case 'Delivered': return `Delivered on ${created.toLocaleDateString()}`;
    default: return 'Tracking unavailable';
  }
};

const DeliveryTracking = () => {
  const { orderId } = useParams();
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  // Live GPS Tracking States
  const [liveLocation, setLiveLocation] = useState(null); // { lat, lng }
  const [trackingActive, setTrackingActive] = useState(false);
  const [socket, setSocket] = useState(null);

  // Initialize Socket Connection with auth
  useEffect(() => {
    if (!user?.token) return;
    const newSocket = io(import.meta.env.VITE_API_URL || 'http://localhost:5557', {
      auth: { token: user.token },
      reconnection: true,
      reconnectionDelay: 1000,
    });
    setSocket(newSocket);
    return () => newSocket.close();
  }, [user]);

  // Listen for socket location updates (For Buyers)
  useEffect(() => {
    if (socket && selectedOrder) {
      socket.emit('joinTrackingRoom', selectedOrder._id);
      
      socket.on('locationUpdate', (data) => {
        setLiveLocation(data);
      });
      
      return () => socket.off('locationUpdate');
    }
  }, [socket, selectedOrder]);

  // Farmer's GPS Broadcasting
  useEffect(() => {
    let watchId;
    if (trackingActive && user?.role === 'Farmer' && selectedOrder && socket) {
      if ('geolocation' in navigator) {
        watchId = navigator.geolocation.watchPosition(
          (position) => {
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;
            setLiveLocation({ lat, lng });
            socket.emit('shareLocation', { orderId: selectedOrder._id, lat, lng });
          },
          (error) => console.error('GPS Error:', error),
          { enableHighAccuracy: true, maximumAge: 0, timeout: 5000 }
        );
      } else {
        alert("GPS is not supported by your browser");
        setTrackingActive(false);
      }
    }
    return () => {
      if (watchId) navigator.geolocation.clearWatch(watchId);
    };
  }, [trackingActive, user, selectedOrder, socket]);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user?.token) return;
      try {
        const config = { headers: { Authorization: `Bearer ${user.token}` } };
        
        // If orderId is provided, fetch that specific order
        if (orderId) {
          const { data } = await axios.get(`/api/orders/${orderId}`, config);
          setSelectedOrder(data);
          setOrders([data]);
        } else {
          // Fetch all orders for the user
          const endpoint = user.role === 'Farmer' ? '/api/orders/farmer/orders' : '/api/orders/myorders';
          const { data } = await axios.get(endpoint, config);
          setOrders(data);
          if (data.length > 0) setSelectedOrder(data[0]);
        }
      } catch (err) {
        console.error('Error fetching orders:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [user, orderId]);

  // Farmer can update status
  const handleUpdateStatus = async (newStatus) => {
    if (!selectedOrder || user?.role !== 'Farmer') return;
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.put(`/api/orders/${selectedOrder._id}/status`, { status: newStatus }, config);
      setSelectedOrder(data);
      setOrders(prev => prev.map(o => o._id === data._id ? data : o));
    } catch (err) {
      console.error('Error updating status:', err);
    }
  };

  if (loading) {
    return (
      <div className="h-[60vh] flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-agriGreen" />
      </div>
    );
  }

  const currentStepIndex = selectedOrder ? getStepIndex(selectedOrder.status) : -1;

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link to={user?.role === 'Farmer' ? '/dashboard/farmer/orders' : '/dashboard/buyer/orders'} className="p-3 bg-white border border-gray-100 rounded-2xl hover:bg-gray-50 transition">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </Link>
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
            <Truck className="w-8 h-8 text-agriGreen" />
            Delivery Tracking
          </h1>
          <p className="text-gray-500 font-medium mt-1">Track your orders in real-time</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Orders List */}
        <div className="space-y-4">
          <h2 className="text-sm font-black text-gray-400 uppercase tracking-widest">Your Orders</h2>
          {orders.length > 0 ? orders.map(order => (
            <motion.div
              key={order._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={() => setSelectedOrder(order)}
              className={`bg-white rounded-2xl p-5 border cursor-pointer transition-all hover:shadow-lg ${
                selectedOrder?._id === order._id 
                  ? 'border-agriGreen shadow-lg shadow-green-100 ring-2 ring-agriGreen/20' 
                  : 'border-gray-100 hover:border-gray-200'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="font-black text-gray-900 text-sm">
                  #{order._id?.slice(-6).toUpperCase()}
                </span>
                <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full border ${getStatusColor(order.status)}`}>
                  {order.status}
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <Clock className="w-3 h-3" />
                {new Date(order.createdAt).toLocaleDateString()}
              </div>
              <div className="flex items-center justify-between mt-3">
                <span className="text-xs text-gray-500">{order.orderItems?.length || 0} items</span>
                <span className="font-black text-agriGreen text-sm">ETB {order.totalPrice?.toLocaleString()}</span>
              </div>
            </motion.div>
          )) : (
            <div className="bg-white rounded-2xl p-8 border border-gray-100 text-center">
              <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">No orders to track</p>
            </div>
          )}
        </div>

        {/* Tracking Detail */}
        {selectedOrder ? (
          <div className="lg:col-span-2 space-y-6">
            {/* Status Timeline */}
            <motion.div
              key={selectedOrder._id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm p-8"
            >
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-2xl font-black text-gray-900">
                    Order #{selectedOrder._id?.slice(-6).toUpperCase()}
                  </h2>
                  <p className="text-sm text-gray-500 font-medium mt-1">
                    {getEstimatedTime(selectedOrder.status, selectedOrder.createdAt)}
                  </p>
                </div>
                <span className={`text-xs font-black uppercase tracking-wider px-4 py-2 rounded-full border ${getStatusColor(selectedOrder.status)}`}>
                  {selectedOrder.status}
                </span>
              </div>

              {/* Visual Timeline */}
              <div className="relative mb-8">
                {STATUS_STEPS.map((step, idx) => {
                  const StepIcon = step.icon;
                  const isCompleted = idx <= currentStepIndex;
                  const isCurrent = idx === currentStepIndex;

                  return (
                    <div key={step.key} className="flex items-start gap-4 relative">
                      {/* Connector Line */}
                      {idx < STATUS_STEPS.length - 1 && (
                        <div className={`absolute left-5 top-10 w-0.5 h-12 ${
                          idx < currentStepIndex ? 'bg-agriGreen' : 'bg-gray-200'
                        }`} />
                      )}

                      {/* Step Circle */}
                      <motion.div
                        initial={isCurrent ? { scale: 0.8 } : {}}
                        animate={isCurrent ? { scale: [0.8, 1.1, 1] } : {}}
                        transition={{ duration: 0.5 }}
                        className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 z-10 ${
                          isCompleted
                            ? isCurrent
                              ? 'bg-agriGreen text-white shadow-lg shadow-green-200 ring-4 ring-green-100'
                              : 'bg-agriGreen text-white'
                            : 'bg-gray-100 text-gray-400'
                        }`}
                      >
                        <StepIcon className="w-5 h-5" />
                      </motion.div>

                      {/* Step Info */}
                      <div className={`pb-10 ${isCompleted ? '' : 'opacity-40'}`}>
                        <p className={`font-black text-sm ${isCompleted ? 'text-gray-900' : 'text-gray-500'}`}>
                          {step.label}
                          {isCurrent && (
                            <span className="ml-2 text-[10px] font-black text-agriGreen bg-green-50 px-2 py-0.5 rounded-full">
                              CURRENT
                            </span>
                          )}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">{step.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* GIS Live Map Tracking */}
              {selectedOrder.status !== 'Paid' && selectedOrder.status !== 'Cancelled' && (
                <div className="mb-8 border border-gray-100 rounded-[2rem] overflow-hidden shadow-sm relative">
                  <div className="absolute top-4 left-4 z-[1000] bg-white/90 backdrop-blur-sm px-4 py-2 rounded-xl shadow-sm border border-gray-100 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-agriGreen animate-pulse" />
                    <span className="text-xs font-bold text-gray-700 uppercase tracking-widest">Live GIS Tracking</span>
                  </div>
                  <div className="h-[250px] w-full relative z-0">
                    <MapContainer 
                      center={[9.0300, 38.7400]} // Center between Harar and Addis
                      zoom={6} 
                      scrollWheelZoom={false}
                      className="h-full w-full"
                    >
                      <TileLayer
                        url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
                      />
                      {/* Farmer Location (Harar approx) */}
                      <Marker position={[9.3138, 42.1183]}>
                        <Popup>
                          <div className="font-bold">Farm Location</div>
                          <div className="text-xs text-gray-500">Origin</div>
                        </Popup>
                      </Marker>
                      {/* Buyer Location (Addis approx) */}
                      <Marker position={[9.0054, 38.7636]}>
                        <Popup>
                          <div className="font-bold">Delivery Address</div>
                          <div className="text-xs text-gray-500">Destination</div>
                        </Popup>
                      </Marker>
                      {/* Route Line (Draws from Harar to Live Location if available, else Addis) */}
                      <Polyline 
                        positions={[ 
                          [9.3138, 42.1183], 
                          liveLocation ? [liveLocation.lat, liveLocation.lng] : [9.0054, 38.7636] 
                        ]}
                        color="#10b981" 
                        weight={4}
                        dashArray="10, 10"
                        className={selectedOrder.status === 'Shipped' && !liveLocation ? 'animate-pulse' : ''}
                      />
                      {/* Moving Truck (Live GPS or Simulated) */}
                      {selectedOrder.status === 'Shipped' && (
                        <Marker position={liveLocation ? [liveLocation.lat, liveLocation.lng] : [9.1500, 40.5000]}> 
                           <Popup>
                             <div className="font-bold flex items-center gap-2 text-blue-600">
                               <Truck className="w-4 h-4" /> {liveLocation ? 'LIVE Location' : 'In Transit (Estimated)'}
                             </div>
                           </Popup>
                        </Marker>
                      )}
                    </MapContainer>
                  </div>
                </div>
              )}

              {/* Farmer Action Buttons */}
              {user?.role === 'Farmer' && selectedOrder.status !== 'Delivered' && selectedOrder.status !== 'Cancelled' && (
                <div className="mt-4 pt-6 border-t border-gray-100">
                  <p className="text-sm font-black text-gray-900 mb-3">Update Order Status</p>
                  <div className="flex flex-wrap gap-3">
                    {selectedOrder.status === 'Paid' && (
                      <button onClick={() => handleUpdateStatus('Processing')} className="px-5 py-2.5 bg-amber-500 text-white rounded-xl font-bold text-sm hover:bg-amber-600 transition flex items-center gap-2">
                        <Warehouse className="w-4 h-4" /> Start Preparing
                      </button>
                    )}
                    {selectedOrder.status === 'Processing' && (
                      <button onClick={() => handleUpdateStatus('Shipped')} className="px-5 py-2.5 bg-blue-500 text-white rounded-xl font-bold text-sm hover:bg-blue-600 transition flex items-center gap-2">
                        <Truck className="w-4 h-4" /> Mark as Shipped
                      </button>
                    )}
                    {selectedOrder.status === 'Shipped' && (
                      <>
                        <button onClick={() => handleUpdateStatus('Delivered')} className="px-5 py-2.5 bg-green-500 text-white rounded-xl font-bold text-sm hover:bg-green-600 transition flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4" /> Confirm Delivery
                        </button>
                        
                        <button 
                          onClick={() => setTrackingActive(!trackingActive)} 
                          className={`px-5 py-2.5 rounded-xl font-bold text-sm transition flex items-center gap-2 ${
                            trackingActive ? 'bg-red-500 hover:bg-red-600 text-white' : 'bg-blue-500 hover:bg-blue-600 text-white'
                          }`}
                        >
                          <Navigation className={`w-4 h-4 ${trackingActive ? 'animate-spin' : ''}`} /> 
                          {trackingActive ? 'Stop Broadcasting GPS' : 'Start Live GPS'}
                        </button>
                      </>
                    )}
                  </div>
                </div>
              )}
            </motion.div>

            {/* Order Details Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Items */}
              <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm p-6">
                <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <ShoppingBag className="w-4 h-4" /> Order Items
                </h3>
                <div className="space-y-3">
                  {selectedOrder.orderItems?.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                      {item.image ? (
                        <img src={item.image} alt={item.name} className="w-12 h-12 rounded-lg object-cover" />
                      ) : (
                        <div className="w-12 h-12 bg-agriGreen/10 rounded-lg flex items-center justify-center">
                          <Box className="w-6 h-6 text-agriGreen" />
                        </div>
                      )}
                      <div className="flex-1">
                        <p className="font-bold text-gray-900 text-sm">{item.name}</p>
                        <p className="text-xs text-gray-500">{item.quantity} {item.unit || 'kg'}</p>
                      </div>
                      <p className="font-black text-agriGreen text-sm">ETB {item.price?.toLocaleString()}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center">
                  <span className="text-sm font-bold text-gray-500">Total</span>
                  <span className="text-xl font-black text-agriGreen">ETB {selectedOrder.totalPrice?.toLocaleString()}</span>
                </div>
              </div>

              {/* Delivery Info */}
              <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm p-6">
                <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <MapPin className="w-4 h-4" /> Delivery Details
                </h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                    <MapPin className="w-5 h-5 text-agriGreen mt-0.5" />
                    <div>
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Address</p>
                      <p className="text-sm font-semibold text-gray-900 mt-0.5">{selectedOrder.deliveryAddress || 'Not specified'}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                    <User className="w-5 h-5 text-blue-500 mt-0.5" />
                    <div>
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                        {user?.role === 'Farmer' ? 'Buyer' : 'Seller'}
                      </p>
                      <p className="text-sm font-semibold text-gray-900 mt-0.5">
                        {user?.role === 'Farmer' 
                          ? selectedOrder.buyer?.name || 'Buyer' 
                          : selectedOrder.farmer?.name || 'Farmer'}
                      </p>
                    </div>
                  </div>
                  {(selectedOrder.buyerPhone || selectedOrder.buyer?.phone) && (
                    <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                      <Phone className="w-5 h-5 text-emerald-500 mt-0.5" />
                      <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Phone</p>
                        <p className="text-sm font-semibold text-gray-900 mt-0.5">
                          {selectedOrder.buyerPhone || selectedOrder.buyer?.phone || 'N/A'}
                        </p>
                      </div>
                    </div>
                  )}
                  <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                    <CreditCard className="w-5 h-5 text-purple-500 mt-0.5" />
                    <div>
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Payment</p>
                      <p className="text-sm font-semibold text-gray-900 mt-0.5">
                        {selectedOrder.paymentMethod} — {selectedOrder.paymentStatus}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="lg:col-span-2 flex items-center justify-center bg-white rounded-[2.5rem] border border-gray-100 p-12">
            <div className="text-center">
              <Truck className="w-16 h-16 text-gray-200 mx-auto mb-4" />
              <h3 className="text-xl font-black text-gray-900 mb-2">Select an Order</h3>
              <p className="text-gray-500 font-medium">Choose an order from the list to track its delivery status.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DeliveryTracking;
