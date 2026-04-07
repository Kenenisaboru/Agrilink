import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  ArrowLeft, 
  CreditCard, 
  MapPin, 
  Phone, 
  CheckCircle2,
  AlertCircle,
  Loader2,
  Wallet,
  Smartphone,
  Building2,
  ChevronRight,
  ShieldCheck,
  History
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';

const Checkout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();
  const { cart, total } = location.state || { cart: [], total: 0 };

  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [phoneNumber, setPhoneNumber] = useState(user?.phone || user?.telebirrNumber || '');
  const [accountNumber, setAccountNumber] = useState(user?.cbeAccountNumber || '');
  const [loading, setLoading] = useState(false);
  const [successData, setSuccessData] = useState(null);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    if (paymentMethod === 'Telebirr') {
      setPhoneNumber(user?.telebirrNumber || user?.phone || '');
    } else if (paymentMethod === 'MPesa') {
      setPhoneNumber(user?.mpesaNumber || user?.phone || '');
    } else if (paymentMethod === 'CBE') {
      setAccountNumber(user?.cbeAccountNumber || '');
    }
  }, [paymentMethod, user]);

  const methods = [
    { id: 'Telebirr', name: 'Telebirr', icon: Smartphone, color: 'bg-blue-600', group: 'Mobile' },
    { id: 'MPesa', name: 'M-Pesa Ethiopia', icon: Smartphone, color: 'bg-green-600', group: 'Mobile' },
    { id: 'CBE', name: 'Commercial Bank of Ethiopia', icon: Building2, color: 'bg-purple-700', group: 'Bank' },
    { id: 'DashenBank', name: 'Dashen Bank (Amole)', icon: Building2, color: 'bg-blue-800', group: 'Bank' },
    { id: 'AbyssiniaBank', name: 'Bank of Abyssinia', icon: Building2, color: 'bg-red-600', group: 'Bank' },
    { id: 'AwashBank', name: 'Awash Bank', icon: Building2, color: 'bg-orange-600', group: 'Bank' },
    { id: 'NigdBank', name: 'Nigd Bank', icon: Building2, color: 'bg-amber-600', group: 'Bank' },
    { id: 'Wallet', name: 'Agrilink Wallet', icon: Wallet, color: 'bg-agriGreen', balance: user?.balance || 0, group: 'Wallet' },
  ];

  const handleCheckout = async (e) => {
    e.preventDefault();
    if (cart.length === 0 || !paymentMethod) return;

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

      const orderRes = await axios.post('/api/orders', orderData);
      const orderId = orderRes.data._id;

      // 2. Request Payment
      const paymentRes = await axios.post('/api/payments/request', {
        orderId,
        amount: total,
        paymentMethod,
        phoneNumber,
        accountNumber: paymentMethod === 'Wallet' ? 'WALLET' : accountNumber
      });

      // Update local user data if balance changed
      if (paymentMethod === 'Wallet') {
        updateUser({ balance: (user.balance || 0) - total });
      }

      setSuccessData(paymentRes.data);
      setLoading(false);
      
      // Auto-redirect after 5 seconds
      setTimeout(() => {
        navigate('/dashboard/buyer');
      }, 5000);

    } catch (err) {
      setError(err.response?.data?.message || 'Transaction failed. Please check your connection or balance.');
      setLoading(false);
    }
  };

  if (successData) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-6">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-[3rem] p-12 max-w-lg w-full text-center shadow-2xl border border-gray-100"
        >
          <div className="w-24 h-24 bg-green-50 text-agriGreen rounded-full flex items-center justify-center mx-auto mb-8 animate-bounce">
            <CheckCircle2 size={56} />
          </div>
          <h2 className="text-4xl font-black text-gray-900 mb-4 tracking-tight">Payment Approved!</h2>
          <p className="text-gray-500 font-medium mb-8">
            Your order has been confirmed. Receipt <span className="text-agriGreen font-bold">#{successData.payment.receiptNumber}</span> has been sent to your email.
          </p>
          
          <div className="bg-gray-50 rounded-3xl p-6 mb-8 space-y-3 text-left">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400 font-bold uppercase tracking-widest">Transaction ID</span>
              <span className="text-gray-900 font-black">{successData.payment.transactionReference}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400 font-bold uppercase tracking-widest">Amount Paid</span>
              <span className="text-agriGreen font-black">{total.toFixed(2)} ETB</span>
            </div>
          </div>

          <button 
            onClick={() => navigate('/dashboard/buyer')}
            className="w-full btn-primary py-4 rounded-2xl text-lg font-black"
          >
            Go to My Dashboard
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-12 px-4">
      <motion.button 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-gray-400 hover:text-agriGreen font-black mb-10 transition-all uppercase tracking-widest text-xs"
      >
        <ArrowLeft size={16} />
        Return to Market
      </motion.button>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Left Column: Form Details */}
        <div className="lg:col-span-7 space-y-10">
          <div>
            <h1 className="text-5xl font-black text-gray-900 mb-4 tracking-tighter">Finalize Order</h1>
            <p className="text-gray-500 text-lg font-medium">Verify your delivery and secure your payment.</p>
          </div>

          <div className="space-y-8">
            {/* Step 1: Delivery */}
            <section className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm relative overflow-hidden">
               <div className="absolute top-0 right-0 p-8 text-agriLight/10 pointer-events-none">
                 <MapPin size={80} />
               </div>
               <h3 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-3">
                 <div className="w-8 h-8 bg-agriGreen text-white rounded-full flex items-center justify-center text-xs">1</div>
                 Delivery Logistics
               </h3>
               <textarea
                 required
                 placeholder="Full Name, House No, Region, City, specific landmark..."
                 className="w-full bg-gray-50 border-2 border-gray-100 rounded-3xl p-6 min-h-[140px] focus:bg-white focus:border-agriGreen outline-none transition-all font-medium text-gray-700"
                 value={deliveryAddress}
                 onChange={(e) => setDeliveryAddress(e.target.value)}
               />
            </section>

            {/* Step 2: Payment Method */}
            <section className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm">
               <h3 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-3">
                 <div className="w-8 h-8 bg-agriGreen text-white rounded-full flex items-center justify-center text-xs">2</div>
                 Payment Selection
               </h3>
               
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {methods.map((method) => {
                    const isSelected = paymentMethod === method.id;
                    const isDisabled = method.id === 'Wallet' && (method.balance < total);
                    
                    return (
                      <button
                        key={method.id}
                        disabled={isDisabled}
                        onClick={() => setPaymentMethod(method.id)}
                        className={`p-5 rounded-3xl border-2 flex items-center justify-between transition-all ${
                          isSelected 
                            ? 'border-agriGreen bg-green-50/30' 
                            : 'border-gray-100 hover:border-agriGreen/30'
                        } ${isDisabled ? 'opacity-40 grayscale cursor-not-allowed' : ''}`}
                      >
                        <div className="flex items-center gap-4">
                          <div className={`p-3 rounded-2xl ${method.color} text-white`}>
                            <method.icon size={20} />
                          </div>
                          <div className="text-left">
                            <p className="font-black text-gray-900 text-sm leading-none">{method.name}</p>
                            {method.id === 'Wallet' ? (
                              <p className={`text-[10px] font-bold mt-1 ${isDisabled ? 'text-red-500' : 'text-gray-400'}`}>
                                Balance: {method.balance.toLocaleString()} ETB
                              </p>
                            ) : (
                              <p className="text-[10px] font-bold text-gray-400 mt-1 uppercase tracking-wider">{method.group}</p>
                            )}
                          </div>
                        </div>
                        {isSelected && <CheckCircle2 className="text-agriGreen" size={20} />}
                      </button>
                    );
                  })}
               </div>

               {/* Payment Info Input */}
               <AnimatePresence>
                 {paymentMethod && paymentMethod !== 'Wallet' && (
                   <motion.div 
                     initial={{ opacity: 0, height: 0 }}
                     animate={{ opacity: 1, height: 'auto' }}
                     exit={{ opacity: 0, height: 0 }}
                     className="mt-8 p-6 bg-gray-50 rounded-[2rem] border border-gray-100"
                   >
                     {['Telebirr', 'MPesa'].includes(paymentMethod) ? (
                        <div className="space-y-3">
                           <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-2">Phone Number</label>
                           <div className="relative">
                              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                              <input 
                                type="tel"
                                placeholder="254..."
                                className="w-full bg-white border border-gray-200 rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-agriGreen transition-all font-bold"
                                value={phoneNumber}
                                onChange={(e) => setPhoneNumber(e.target.value)}
                              />
                           </div>
                        </div>
                     ) : (
                        <div className="space-y-3">
                           <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-2">Account Number / IBAN</label>
                           <div className="relative">
                              <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                              <input 
                                type="text"
                                placeholder="Account details"
                                className="w-full bg-white border border-gray-200 rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-agriGreen transition-all font-bold"
                                value={accountNumber}
                                onChange={(e) => setAccountNumber(e.target.value)}
                              />
                           </div>
                        </div>
                     )}
                   </motion.div>
                 )}
               </AnimatePresence>
            </section>
          </div>
        </div>

        {/* Right Column: Order Summary */}
        <div className="lg:col-span-5">
           <div className="lg:sticky lg:top-8 space-y-8">
              <section className="bg-white rounded-[3rem] border border-gray-100 shadow-sm overflow-hidden flex flex-col">
                 <div className="p-10 border-b border-gray-50">
                    <h3 className="text-2xl font-black text-gray-900 border-b border-gray-100 pb-6 mb-6">Basket Summary</h3>
                    <div className="space-y-6 max-h-[300px] overflow-y-auto pr-4 custom-scrollbar">
                      {cart.map((item) => (
                        <div key={item._id} className="flex justify-between items-center gap-6 group">
                          <div className="flex items-center gap-4">
                            <div className="w-16 h-16 rounded-2xl bg-gray-50 border border-gray-100 overflow-hidden ring-4 ring-transparent group-hover:ring-agriGreen/10 transition-all">
                               <img src={item.image || 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?auto=format&fit=crop&q=80&w=200'} className="w-full h-full object-cover" />
                            </div>
                            <div className="space-y-1">
                              <p className="font-black text-gray-900 text-sm leading-tight">{item.name}</p>
                              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Quantity: {item.quantity}</p>
                            </div>
                          </div>
                          <div className="font-black text-gray-900">
                            {(item.price * item.quantity).toLocaleString()} <span className="text-[10px] text-gray-400">ETB</span>
                          </div>
                        </div>
                      ))}
                    </div>
                 </div>

                 <div className="p-10 bg-gray-50 space-y-6">
                    <div className="space-y-3">
                       <div className="flex justify-between items-center text-sm">
                          <span className="text-gray-400 font-bold">Subtotal</span>
                          <span className="text-gray-900 font-black">{total.toLocaleString()} ETB</span>
                       </div>
                       <div className="flex justify-between items-center text-sm">
                          <span className="text-gray-400 font-bold">Shipping</span>
                          <span className="text-agriGreen font-black uppercase tracking-widest text-[10px]">Free</span>
                       </div>
                    </div>
                    
                    <div className="pt-6 border-t border-gray-200 flex justify-between items-center">
                       <span className="text-xl font-black text-gray-900">Total Price</span>
                       <span className="text-3xl font-black text-agriGreen">{total.toLocaleString()} <span className="text-sm">ETB</span></span>
                    </div>

                    {error && (
                      <div className="p-4 bg-red-50 text-red-600 rounded-2xl flex items-center gap-3 font-bold text-sm">
                        <AlertCircle size={18} />
                        {error}
                      </div>
                    )}

                    <button
                      onClick={handleCheckout}
                      disabled={loading || cart.length === 0 || !paymentMethod || !deliveryAddress}
                      className="w-full btn-primary py-5 rounded-[2rem] text-xl font-black shadow-2xl shadow-green-200 disabled:opacity-50 disabled:scale-100 flex items-center justify-center gap-3 group"
                    >
                      {loading ? (
                        <Loader2 className="animate-spin" size={24} />
                      ) : (
                        <>
                          Authorize Payment
                          <ChevronRight className="group-hover:translate-x-1 transition-transform" />
                        </>
                      )}
                    </button>

                    <div className="flex items-center justify-center gap-2 text-gray-400 pt-2 font-bold">
                       <ShieldCheck size={16} />
                       <span className="text-[10px] uppercase tracking-[0.2em]">End-to-End Encrypted</span>
                    </div>
                 </div>
              </section>

              <div className="bg-amber-50 rounded-3xl p-6 border border-amber-100 flex gap-4">
                 <History className="text-amber-600 shrink-0" size={20} />
                 <p className="text-xs text-amber-900 font-medium leading-relaxed">
                    By confirming this payment, you agree to our <span className="underline font-bold">Safe-Delivery Guarantee</span>. Funds are held in escrow until you confirm delivery.
                 </p>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
