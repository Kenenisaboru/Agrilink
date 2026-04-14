import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { 
  CheckCircle2, 
  XCircle, 
  Loader2, 
  Home, 
  Package, 
  User, 
  MapPin, 
  CreditCard,
  Copy,
  ArrowRight,
  ShieldCheck,
  Clock,
  Receipt,
  Truck
} from 'lucide-react';
import { motion } from 'framer-motion';

/**
 * PaymentVerify Page
 * 
 * This page is shown after Chapa redirects the buyer back.
 * It verifies the payment and shows a rich order confirmation.
 * 
 * URL: /payment/verify/:tx_ref
 * 
 * Flow:
 * 1. Page loads → calls /api/payments/verify/:tx_ref
 * 2. Backend verifies payment with Chapa (or mock in demo)
 * 3. If success → shows full order confirmation with details
 * 4. Farmer is automatically notified (backend handles this)
 */
const PaymentVerify = () => {
  const { tx_ref } = useParams();
  const navigate = useNavigate();
  
  // Status: 'verifying' → 'success' → navigate, or 'failed'
  const [status, setStatus] = useState('verifying');
  const [message, setMessage] = useState('');
  const [orderData, setOrderData] = useState(null);
  const [paymentData, setPaymentData] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        // Call backend to verify the transaction
        const response = await axios.get(`/api/payments/verify/${tx_ref}`);
        
        if (response.data.success) {
          setStatus('success');
          setMessage('Your payment has been confirmed!');
          setOrderData(response.data.order);
          setPaymentData(response.data.payment);
        } else {
          setStatus('failed');
          setMessage('Payment verification failed.');
        }
      } catch (error) {
        setStatus('failed');
        setMessage(error.response?.data?.message || 'An error occurred during verification.');
      }
    };

    verifyPayment();
  }, [tx_ref]);

  // Copy transaction ID to clipboard
  const copyTxRef = () => {
    navigator.clipboard.writeText(tx_ref);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Format date nicely
  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // ─── VERIFYING STATE ───
  if (status === 'verifying') {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-6">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-[3rem] p-16 max-w-lg w-full text-center shadow-2xl border border-gray-100"
        >
          <div className="relative w-28 h-28 mx-auto mb-10">
            {/* Spinning ring */}
            <div className="absolute inset-0 border-4 border-gray-100 rounded-full" />
            <div className="absolute inset-0 border-4 border-transparent border-t-agriGreen rounded-full animate-spin" />
            <div className="absolute inset-4 bg-blue-50 rounded-full flex items-center justify-center">
              <Loader2 size={36} className="animate-spin text-agriGreen" />
            </div>
          </div>
          <h2 className="text-3xl font-black text-gray-900 mb-3 tracking-tight">Verifying Payment</h2>
          <p className="text-gray-400 font-medium mb-2">
            Connecting to Chapa payment gateway...
          </p>
          <p className="text-xs text-gray-300 font-bold uppercase tracking-widest">
            Please do not close this page
          </p>
        </motion.div>
      </div>
    );
  }

  // ─── FAILED STATE ───
  if (status === 'failed') {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-6">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-[3rem] p-12 max-w-lg w-full text-center shadow-2xl border border-gray-100"
        >
          <div className="w-24 h-24 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-8">
            <XCircle size={56} />
          </div>
          <h2 className="text-4xl font-black text-gray-900 mb-4 tracking-tight">Payment Failed</h2>
          <p className="text-red-500 font-medium mb-4">{message}</p>
          <div className="bg-gray-50 rounded-2xl p-4 mb-8">
            <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-1">Transaction Ref</p>
            <p className="text-gray-600 font-mono text-sm">{tx_ref}</p>
          </div>
          <div className="space-y-3">
            <button 
              onClick={() => navigate('/dashboard/buyer')}
              className="w-full bg-gray-900 hover:bg-gray-800 text-white py-4 rounded-2xl text-lg font-black transition-all flex items-center justify-center gap-2"
            >
              <Home size={20} />
              Return to Market
            </button>
            <button
              onClick={() => navigate(-2)}
              className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-4 rounded-2xl font-bold transition-all"
            >
              Try Again
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  // ─── SUCCESS STATE — Full Order Confirmation ───
  return (
    <div className="min-h-[80vh] py-12 px-4">
      <div className="max-w-3xl mx-auto space-y-8">
        
        {/* ✅ Success Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
            className="w-28 h-28 bg-green-50 text-agriGreen rounded-full flex items-center justify-center mx-auto mb-8 ring-8 ring-green-100/50"
          >
            <CheckCircle2 size={60} />
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-4xl lg:text-5xl font-black text-gray-900 mb-3 tracking-tight"
          >
            Order Successful! 🎉
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-gray-500 font-medium text-lg"
          >
            {message} The farmer has been notified.
          </motion.p>
        </motion.div>

        {/* 📋 Order Summary Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden"
        >
          {/* Card Header */}
          <div className="bg-gradient-to-r from-agriGreen to-agriDark p-8 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Receipt className="w-6 h-6 opacity-80" />
                <h2 className="text-xl font-black">Order Confirmation</h2>
              </div>
              {orderData && (
                <span className="bg-white/20 backdrop-blur-sm px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider">
                  #{orderData._id?.slice(-6)}
                </span>
              )}
            </div>
          </div>

          {/* Items List */}
          <div className="p-8 border-b border-gray-50">
            <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-6">Order Items</h3>
            <div className="space-y-4">
              {orderData?.orderItems?.map((item, i) => (
                <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-xl bg-white border border-gray-100 overflow-hidden">
                      <img 
                        src={item.image || 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?auto=format&fit=crop&q=80&w=200'} 
                        alt={item.name}
                        className="w-full h-full object-cover" 
                      />
                    </div>
                    <div>
                      <p className="font-black text-gray-900">{item.name}</p>
                      <p className="text-xs text-gray-400 font-bold">Qty: {item.quantity} × {item.price?.toLocaleString()} ETB</p>
                    </div>
                  </div>
                  <p className="font-black text-gray-900">{(item.price * item.quantity).toLocaleString()} <span className="text-xs text-gray-400">ETB</span></p>
                </div>
              ))}
            </div>
          </div>

          {/* Order Details Grid */}
          <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Transaction ID */}
            <div className="bg-gray-50 rounded-2xl p-5 space-y-2">
              <div className="flex items-center gap-2 text-gray-400">
                <CreditCard className="w-4 h-4" />
                <span className="text-[10px] font-black uppercase tracking-widest">Transaction ID</span>
              </div>
              <div className="flex items-center gap-2">
                <p className="text-sm font-bold text-gray-900 font-mono break-all">{tx_ref}</p>
                <button 
                  onClick={copyTxRef} 
                  className="shrink-0 p-1.5 hover:bg-gray-200 rounded-lg transition-colors"
                  title="Copy"
                >
                  <Copy className={`w-4 h-4 ${copied ? 'text-agriGreen' : 'text-gray-400'}`} />
                </button>
              </div>
              {copied && <p className="text-[10px] text-agriGreen font-bold">Copied!</p>}
            </div>

            {/* Payment Status */}
            <div className="bg-green-50 rounded-2xl p-5 space-y-2">
              <div className="flex items-center gap-2 text-green-600">
                <ShieldCheck className="w-4 h-4" />
                <span className="text-[10px] font-black uppercase tracking-widest">Payment Status</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-black">
                  ✅ PAID
                </span>
              </div>
            </div>

            {/* Delivery Address */}
            <div className="bg-gray-50 rounded-2xl p-5 space-y-2">
              <div className="flex items-center gap-2 text-gray-400">
                <MapPin className="w-4 h-4" />
                <span className="text-[10px] font-black uppercase tracking-widest">Delivery Address</span>
              </div>
              <p className="text-sm font-medium text-gray-700">{orderData?.deliveryAddress}</p>
            </div>

            {/* Order Date */}
            <div className="bg-gray-50 rounded-2xl p-5 space-y-2">
              <div className="flex items-center gap-2 text-gray-400">
                <Clock className="w-4 h-4" />
                <span className="text-[10px] font-black uppercase tracking-widest">Order Date</span>
              </div>
              <p className="text-sm font-medium text-gray-700">
                {orderData?.createdAt ? formatDate(orderData.createdAt) : 'Just now'}
              </p>
            </div>

            {/* Farmer Info */}
            {orderData?.farmer && (
              <div className="bg-gray-50 rounded-2xl p-5 space-y-2">
                <div className="flex items-center gap-2 text-gray-400">
                  <User className="w-4 h-4" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Seller</span>
                </div>
                <p className="text-sm font-bold text-gray-900">{orderData.farmer.name}</p>
                {orderData.farmer.location && (
                  <p className="text-xs text-gray-400">{orderData.farmer.location}</p>
                )}
              </div>
            )}

            {/* Payment Method */}
            <div className="bg-gray-50 rounded-2xl p-5 space-y-2">
              <div className="flex items-center gap-2 text-gray-400">
                <CreditCard className="w-4 h-4" />
                <span className="text-[10px] font-black uppercase tracking-widest">Payment Method</span>
              </div>
              <p className="text-sm font-bold text-gray-900">
                {paymentData?.paymentMethod || orderData?.paymentMethod || 'Chapa'}
              </p>
            </div>
          </div>

          {/* Total */}
          <div className="p-8 bg-gray-50 border-t border-gray-100">
            <div className="flex justify-between items-center">
              <span className="text-xl font-black text-gray-900">Total Paid</span>
              <span className="text-3xl font-black text-agriGreen">
                {orderData?.totalPrice?.toLocaleString() || paymentData?.amount?.toLocaleString()} <span className="text-sm">ETB</span>
              </span>
            </div>
          </div>
        </motion.div>

        {/* 🚚 What's Next */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-blue-50 rounded-[2rem] p-8 border border-blue-100"
        >
          <div className="flex items-start gap-4">
            <div className="bg-blue-100 p-3 rounded-xl text-blue-600 shrink-0">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-black text-gray-900 text-lg mb-2">What happens next?</h3>
              <div className="space-y-2 text-sm text-gray-600">
                <p className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-agriGreen shrink-0" />
                  <span>The farmer has been <strong>notified</strong> about your order</span>
                </p>
                <p className="flex items-center gap-2">
                  <Package className="w-4 h-4 text-blue-500 shrink-0" />
                  <span>They will <strong>prepare and ship</strong> your fresh produce</span>
                </p>
                <p className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-amber-500 shrink-0" />
                  <span>Your order will be <strong>delivered</strong> to your address</span>
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="flex flex-col sm:flex-row gap-4"
        >
          <button 
            onClick={() => navigate('/dashboard/buyer/orders')}
            className="flex-1 btn-primary py-5 rounded-2xl text-lg font-black flex items-center justify-center gap-2"
          >
            <Package size={20} />
            View My Orders
          </button>
          <button 
            onClick={() => navigate('/dashboard/buyer')}
            className="flex-1 bg-white border-2 border-gray-100 hover:border-agriGreen/30 text-gray-900 py-5 rounded-2xl text-lg font-black transition-all flex items-center justify-center gap-2"
          >
            Continue Shopping
            <ArrowRight size={20} />
          </button>
        </motion.div>
      </div>
    </div>
  );
};

export default PaymentVerify;
