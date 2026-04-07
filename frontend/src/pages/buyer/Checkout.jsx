import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  ArrowLeft, 
  CreditCard, 
  MapPin, 
  Phone, 
  CheckCircle2,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { motion } from 'framer-motion';

const Checkout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { cart, total } = location.state || { cart: [], total: 0 };

  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  const handleCheckout = async (e) => {
    e.preventDefault();
    if (cart.length === 0) return;

    setLoading(true);
    setError(null);

    try {
      // 1. Create Order
      const orderData = {
        orderItems: cart.map(item => ({
          name: item.name,
          quantity: item.quantity,
          image: item.image,
          price: item.price,
          crop: item._id
        })),
        totalPrice: total,
        deliveryAddress
      };

      const orderRes = await axios.post('http://localhost:5000/api/orders', orderData, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });

      const orderId = orderRes.data._id;

      // 2. Request Payment (Simulation)
      await axios.post('http://localhost:5000/api/payments/request', {
        orderId,
        amount: total,
        phone
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });

      setSuccess(true);
      setTimeout(() => {
        navigate('/dashboard/buyer');
      }, 3000);

    } catch (err) {
      setError(err.response?.data?.message || 'Payment failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-[70vh] flex flex-center flex-col items-center justify-center p-8 text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="w-24 h-24 bg-agriGreen/10 text-agriGreen rounded-full flex items-center justify-center mb-6"
        >
          <CheckCircle2 size={48} />
        </motion.div>
        <h2 className="text-3xl font-black text-gray-900 mb-2">Payment Successful!</h2>
        <p className="text-gray-500 max-w-xs">Your order has been placed and is being processed. Redirecting you back...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <button 
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-gray-500 hover:text-agriGreen font-bold mb-8 transition-colors"
      >
        <ArrowLeft size={20} />
        Back to Basket
      </button>

      <div className="flex flex-col lg:flex-row gap-12">
        {/* Form Section */}
        <div className="flex-grow space-y-8">
          <div>
            <h1 className="text-4xl font-black text-gray-900 mb-2">Checkout</h1>
            <p className="text-gray-500">Complete your purchase by providing details below.</p>
          </div>

          <form onSubmit={handleCheckout} className="space-y-6">
            <div className="space-y-4">
              <label className="block text-sm font-black text-gray-700 uppercase tracking-wider">
                Delivery Address
              </label>
              <div className="relative">
                <MapPin className="absolute left-4 top-4 text-gray-400" size={20} />
                <textarea
                  required
                  placeholder="Enter your full delivery address..."
                  className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl p-4 pl-12 min-h-[120px] focus:bg-white focus:border-agriGreen outline-none transition-all"
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-4">
              <label className="block text-sm font-black text-gray-700 uppercase tracking-wider">
                M-Pesa Phone Number
              </label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  required
                  type="tel"
                  placeholder="e.g., 254712345678"
                  className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl py-4 pl-12 pr-4 focus:bg-white focus:border-agriGreen outline-none transition-all"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
            </div>

            {error && (
              <div className="p-4 bg-red-50 text-red-600 rounded-2xl flex items-center gap-3 font-bold">
                <AlertCircle size={20} />
                {error}
              </div>
            )}

            <button
              disabled={loading || cart.length === 0}
              className="w-full btn-primary py-5 rounded-2xl text-xl font-black shadow-xl shadow-green-200 disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="animate-spin" />
              ) : (
                <>
                  Pay ${total.toFixed(2)} with M-Pesa
                  <CreditCard size={24} />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Order Summary Sticky */}
        <div className="w-full lg:w-80 h-fit bg-white border border-gray-100 rounded-[2.5rem] p-8 space-y-6 lg:sticky lg:top-8 shadow-sm">
          <h3 className="text-xl font-black text-gray-900 border-b border-gray-100 pb-4">Summary</h3>
          <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
            {cart.map((item) => (
              <div key={item._id} className="flex justify-between items-center gap-4">
                <div className="flex-grow">
                  <p className="font-bold text-gray-900 leading-tight">{item.name}</p>
                  <p className="text-xs text-gray-400">Qty: {item.quantity}</p>
                </div>
                <div className="font-black text-agriGreen">
                  ${(item.price * item.quantity).toFixed(2)}
                </div>
              </div>
            ))}
          </div>
          <div className="pt-4 border-t border-gray-100 flex justify-between items-center text-xl font-black">
            <span>Total</span>
            <span className="text-agriGreen">${total.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
