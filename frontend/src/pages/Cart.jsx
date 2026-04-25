import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShoppingCart, 
  Trash2, 
  Plus, 
  Minus, 
  ArrowRight, 
  Shield, 
  Truck, 
  CreditCard,
  Lock,
  CheckCircle2,
  AlertCircle,
  Loader2,
  X,
  Package,
  MapPin,
  Phone,
  Mail,
  User,
  Calendar,
  DollarSign,
  Percent
} from 'lucide-react';

const Cart = () => {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState(1);
  const [promoCode, setPromoCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [shippingMethod, setShippingMethod] = useState('standard');
  
  const [shippingInfo, setShippingInfo] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    region: 'East Hararghe',
    postalCode: ''
  });

  const [paymentInfo, setPaymentInfo] = useState({
    method: 'telebirr',
    phoneNumber: '',
    cardNumber: '',
    cardExpiry: '',
    cardCvv: '',
    bankName: 'CBE',
    accountNumber: ''
  });

  // Sample cart data
  const sampleCartItems = [
    {
      id: 1,
      name: 'Premium Ethiopian Coffee',
      price: 4500,
      quantity: 2,
      image: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=200',
      farmer: 'Abebe Kebede',
      location: 'Harar',
      unit: 'Kg'
    },
    {
      id: 2,
      name: 'Organic Teff White',
      price: 3200,
      quantity: 1,
      image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=200',
      farmer: 'Fatuma Ahmed',
      location: 'East Hararghe',
      unit: 'Kg'
    },
    {
      id: 3,
      name: 'Fresh Khat Premium',
      price: 2800,
      quantity: 3,
      image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=200',
      farmer: 'Kedir Jemal',
      location: 'Dire Dawa',
      unit: 'Bundle'
    }
  ];

  useEffect(() => {
    setCartItems(sampleCartItems);
  }, []);

  const updateQuantity = (id, newQuantity) => {
    if (newQuantity < 1) return;
    setCartItems(items => 
      items.map(item => 
        item.id === id ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const removeItem = (id) => {
    setCartItems(items => items.filter(item => item.id !== id));
  };

  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shippingCost = shippingMethod === 'express' ? 500 : 200;
  const tax = subtotal * 0.15; // 15% VAT
  const total = subtotal + shippingCost + tax - discount;

  const applyPromoCode = () => {
    if (promoCode.toLowerCase() === 'agrilink10') {
      setDiscount(subtotal * 0.1);
    } else if (promoCode.toLowerCase() === 'fresh20') {
      setDiscount(subtotal * 0.2);
    } else {
      alert('Invalid promo code');
    }
  };

  const handleCheckout = async () => {
    setLoading(true);
    // Simulate checkout process
    setTimeout(() => {
      setLoading(false);
      setCheckoutStep(2);
    }, 1500);
  };

  const handlePayment = async () => {
    setLoading(true);
    // Simulate payment processing
    setTimeout(() => {
      setLoading(false);
      setCheckoutStep(3);
    }, 2000);
  };

  const shippingMethods = [
    { id: 'standard', name: 'Standard Delivery', cost: 200, days: '3-5 business days' },
    { id: 'express', name: 'Express Delivery', cost: 500, days: '1-2 business days' },
    { id: 'pickup', name: 'Local Pickup', cost: 0, days: 'Same day' }
  ];

  const paymentMethods = [
    { id: 'telebirr', name: 'Telebirr', icon: '📱', color: 'from-blue-500 to-blue-600' },
    { id: 'mpesa', name: 'M-Pesa', icon: '💚', color: 'from-green-500 to-green-600' },
    { id: 'cbe', name: 'CBE Birr', icon: '🏦', color: 'from-yellow-500 to-orange-600' },
    { id: 'card', name: 'Credit/Debit Card', icon: '💳', color: 'from-purple-500 to-pink-600' }
  ];

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <ShoppingCart className="w-24 h-24 text-gray-300 mx-auto mb-6" />
          <h2 className="text-3xl font-black text-gray-900 mb-4">Your cart is empty</h2>
          <p className="text-gray-500 mb-8">Start shopping to add items to your cart</p>
          <Link to="/products" className="btn-primary inline-flex items-center gap-2 px-8 py-4 rounded-2xl font-bold">
            Browse Products <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link to="/products" className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                <X className="w-5 h-5 text-gray-600" />
              </Link>
              <h1 className="text-2xl font-black text-gray-900">Shopping Cart</h1>
              <span className="bg-agriGreen text-white text-sm font-bold px-3 py-1 rounded-full">
                {cartItems.length} items
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 bg-green-50 px-3 py-1.5 rounded-full border border-green-100">
                <Shield className="w-4 h-4 text-green-600" />
                <span className="text-xs font-bold text-green-700">Secure Checkout</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-12">
          <div className="flex items-center gap-4">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                  checkoutStep >= step 
                    ? 'bg-agriGreen text-white' 
                    : 'bg-gray-200 text-gray-500'
                }`}>
                  {checkoutStep > step ? <CheckCircle2 className="w-5 h-5" /> : step}
                </div>
                {step < 3 && (
                  <div className={`w-16 h-1 mx-2 ${
                    checkoutStep > step ? 'bg-agriGreen' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {checkoutStep === 1 && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex gap-6">
                    <img 
                      src={item.image} 
                      alt={item.name}
                      className="w-24 h-24 object-cover rounded-2xl"
                    />
                    
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-bold text-gray-900 mb-1">{item.name}</h3>
                          <p className="text-sm text-gray-500">by {item.farmer}</p>
                          <div className="flex items-center gap-1 text-xs text-gray-400 mt-1">
                            <MapPin className="w-3 h-3" />
                            {item.location}
                          </div>
                        </div>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="p-2 hover:bg-red-50 rounded-xl transition-colors text-gray-400 hover:text-red-500"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                      
                      <div className="flex items-center justify-between mt-4">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="font-bold text-gray-900 w-8 text-center">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="w-8 h-8 rounded-full bg-agriGreen text-white hover:bg-agriDark flex items-center justify-center transition-colors"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                        
                        <div className="text-right">
                          <p className="text-2xl font-black text-agriGreen">
                            ETB {(item.price * item.quantity).toLocaleString()}
                          </p>
                          <p className="text-xs text-gray-400">ETB {item.price.toLocaleString()} / {item.unit}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm sticky top-24">
                <h3 className="text-lg font-black text-gray-900 mb-6">Order Summary</h3>
                
                <div className="space-y-4 mb-6">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span className="font-bold">ETB {subtotal.toLocaleString()}</span>
                  </div>
                  
                  <div className="flex justify-between text-gray-600">
                    <span>Shipping</span>
                    <span className="font-bold">ETB {shippingCost.toLocaleString()}</span>
                  </div>
                  
                  <div className="flex justify-between text-gray-600">
                    <span>Tax (15%)</span>
                    <span className="font-bold">ETB {tax.toLocaleString()}</span>
                  </div>
                  
                  {discount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Discount</span>
                      <span className="font-bold">-ETB {discount.toLocaleString()}</span>
                    </div>
                  )}
                  
                  <div className="border-t border-gray-200 pt-4">
                    <div className="flex justify-between">
                      <span className="text-lg font-black text-gray-900">Total</span>
                      <span className="text-2xl font-black text-agriGreen">ETB {total.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Promo Code */}
                <div className="mb-6">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Promo code"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value)}
                      className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-agriGreen/10 font-medium"
                    />
                    <button
                      onClick={applyPromoCode}
                      className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold px-4 py-3 rounded-xl transition-colors"
                    >
                      Apply
                    </button>
                  </div>
                </div>

                {/* Shipping Method */}
                <div className="mb-6">
                  <h4 className="text-sm font-bold text-gray-700 mb-3">Shipping Method</h4>
                  <div className="space-y-2">
                    {shippingMethods.map((method) => (
                      <button
                        key={method.id}
                        onClick={() => setShippingMethod(method.id)}
                        className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                          shippingMethod === method.id
                            ? 'border-agriGreen bg-agriGreen/5'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-bold text-gray-900">{method.name}</p>
                            <p className="text-xs text-gray-500">{method.days}</p>
                          </div>
                          <span className="font-bold text-gray-900">
                            {method.cost === 0 ? 'Free' : `ETB ${method.cost}`}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={handleCheckout}
                  disabled={loading}
                  className="w-full btn-primary py-4 rounded-2xl text-lg font-black shadow-xl shadow-green-200 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <Loader2 className="w-6 h-6 animate-spin" />
                  ) : (
                    <>
                      Proceed to Checkout <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>

                <div className="flex items-center justify-center gap-2 mt-4 text-xs text-gray-500">
                  <Lock className="w-4 h-4" />
                  <span>Secure SSL encrypted checkout</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {checkoutStep === 2 && (
          <div className="max-w-3xl mx-auto">
            <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
              <h2 className="text-2xl font-black text-gray-900 mb-8">Shipping Information</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      value={shippingInfo.fullName}
                      onChange={(e) => setShippingInfo({...shippingInfo, fullName: e.target.value})}
                      className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-4 pl-12 pr-4 outline-none focus:ring-4 focus:ring-agriGreen/10 font-medium"
                      placeholder="Enter your full name"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="email"
                      value={shippingInfo.email}
                      onChange={(e) => setShippingInfo({...shippingInfo, email: e.target.value})}
                      className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-4 pl-12 pr-4 outline-none focus:ring-4 focus:ring-agriGreen/10 font-medium"
                      placeholder="your@email.com"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700">Phone</label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="tel"
                      value={shippingInfo.phone}
                      onChange={(e) => setShippingInfo({...shippingInfo, phone: e.target.value})}
                      className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-4 pl-12 pr-4 outline-none focus:ring-4 focus:ring-agriGreen/10 font-medium"
                      placeholder="+251 9XX XXX XXX"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700">Region</label>
                  <select
                    value={shippingInfo.region}
                    onChange={(e) => setShippingInfo({...shippingInfo, region: e.target.value})}
                    className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-4 px-4 outline-none focus:ring-4 focus:ring-agriGreen/10 font-medium cursor-pointer"
                  >
                    <option value="East Hararghe">East Hararghe</option>
                    <option value="West Hararghe">West Hararghe</option>
                    <option value="Addis Ababa">Addis Ababa</option>
                    <option value="Dire Dawa">Dire Dawa</option>
                    <option value="Oromia">Oromia</option>
                  </select>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-bold text-gray-700">Address</label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      value={shippingInfo.address}
                      onChange={(e) => setShippingInfo({...shippingInfo, address: e.target.value})}
                      className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-4 pl-12 pr-4 outline-none focus:ring-4 focus:ring-agriGreen/10 font-medium"
                      placeholder="Street address, building, etc."
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700">City</label>
                  <input
                    type="text"
                    value={shippingInfo.city}
                    onChange={(e) => setShippingInfo({...shippingInfo, city: e.target.value})}
                    className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-4 px-4 outline-none focus:ring-4 focus:ring-agriGreen/10 font-medium"
                    placeholder="City name"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700">Postal Code</label>
                  <input
                    type="text"
                    value={shippingInfo.postalCode}
                    onChange={(e) => setShippingInfo({...shippingInfo, postalCode: e.target.value})}
                    className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-4 px-4 outline-none focus:ring-4 focus:ring-agriGreen/10 font-medium"
                    placeholder="Postal code"
                  />
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => setCheckoutStep(1)}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-4 rounded-2xl transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={handlePayment}
                  disabled={loading}
                  className="flex-1 btn-primary py-4 rounded-2xl font-bold disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <Loader2 className="w-6 h-6 animate-spin" />
                  ) : (
                    <>
                      Continue to Payment <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {checkoutStep === 3 && (
          <div className="max-w-3xl mx-auto">
            <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
              <h2 className="text-2xl font-black text-gray-900 mb-8">Payment Method</h2>
              
              {/* Payment Methods */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                {paymentMethods.map((method) => (
                  <button
                    key={method.id}
                    onClick={() => setPaymentInfo({...paymentInfo, method: method.id})}
                    className={`p-6 rounded-2xl border-2 transition-all text-center ${
                      paymentInfo.method === method.id
                        ? 'border-agriGreen bg-agriGreen/5'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-3xl mb-2">{method.icon}</div>
                    <p className="font-bold text-gray-900 text-sm">{method.name}</p>
                  </button>
                ))}
              </div>

              {/* Payment Details */}
              <div className="mb-8">
                {paymentInfo.method === 'telebirr' && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-gray-700">Telebirr Phone Number</label>
                      <input
                        type="tel"
                        value={paymentInfo.phoneNumber}
                        onChange={(e) => setPaymentInfo({...paymentInfo, phoneNumber: e.target.value})}
                        className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-4 px-4 outline-none focus:ring-4 focus:ring-agriGreen/10 font-medium"
                        placeholder="0911 XXX XXX"
                      />
                    </div>
                  </div>
                )}

                {paymentInfo.method === 'card' && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-gray-700">Card Number</label>
                      <div className="relative">
                        <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                          type="text"
                          value={paymentInfo.cardNumber}
                          onChange={(e) => setPaymentInfo({...paymentInfo, cardNumber: e.target.value})}
                          className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-4 pl-12 pr-4 outline-none focus:ring-4 focus:ring-agriGreen/10 font-medium"
                          placeholder="XXXX XXXX XXXX XXXX"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-700">Expiry Date</label>
                        <input
                          type="text"
                          value={paymentInfo.cardExpiry}
                          onChange={(e) => setPaymentInfo({...paymentInfo, cardExpiry: e.target.value})}
                          className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-4 px-4 outline-none focus:ring-4 focus:ring-agriGreen/10 font-medium"
                          placeholder="MM/YY"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-700">CVV</label>
                        <input
                          type="text"
                          value={paymentInfo.cardCvv}
                          onChange={(e) => setPaymentInfo({...paymentInfo, cardCvv: e.target.value})}
                          className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-4 px-4 outline-none focus:ring-4 focus:ring-agriGreen/10 font-medium"
                          placeholder="XXX"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {paymentInfo.method === 'cbe' && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-gray-700">Bank Account Number</label>
                      <input
                        type="text"
                        value={paymentInfo.accountNumber}
                        onChange={(e) => setPaymentInfo({...paymentInfo, accountNumber: e.target.value})}
                        className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-4 px-4 outline-none focus:ring-4 focus:ring-agriGreen/10 font-medium"
                        placeholder="1000 XXXX XXXX"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Order Summary */}
              <div className="bg-gray-50 rounded-2xl p-6 mb-8">
                <h3 className="text-lg font-black text-gray-900 mb-4">Order Summary</h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span className="font-bold">ETB {subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Shipping</span>
                    <span className="font-bold">ETB {shippingCost.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Tax (15%)</span>
                    <span className="font-bold">ETB {tax.toLocaleString()}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Discount</span>
                      <span className="font-bold">-ETB {discount.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="border-t border-gray-200 pt-2 mt-2">
                    <div className="flex justify-between">
                      <span className="text-xl font-black text-gray-900">Total</span>
                      <span className="text-2xl font-black text-agriGreen">ETB {total.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => setCheckoutStep(2)}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-4 rounded-2xl transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={handlePayment}
                  disabled={loading}
                  className="flex-1 btn-primary py-4 rounded-2xl font-bold disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <Loader2 className="w-6 h-6 animate-spin" />
                  ) : (
                    <>
                      <Lock className="w-5 h-5" />
                      Pay ETB {total.toLocaleString()}
                    </>
                  )}
                </button>
              </div>

              <div className="flex items-center justify-center gap-2 mt-4 text-xs text-gray-500">
                <Shield className="w-4 h-4" />
                <span>Your payment information is secure and encrypted</span>
              </div>
            </div>
          </div>
        )}

        {checkoutStep === 4 && (
          <div className="max-w-2xl mx-auto text-center">
            <div className="bg-white rounded-3xl p-12 border border-gray-100 shadow-sm">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-10 h-10 text-green-600" />
              </div>
              <h2 className="text-3xl font-black text-gray-900 mb-4">Order Placed Successfully!</h2>
              <p className="text-gray-600 mb-8">Thank you for your order. You will receive a confirmation email shortly.</p>
              
              <div className="bg-gray-50 rounded-2xl p-6 mb-8">
                <p className="text-sm text-gray-500 mb-2">Order Number</p>
                <p className="text-2xl font-black text-agriGreen">#AGR-{Date.now()}</p>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => navigate('/products')}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-4 rounded-2xl transition-colors"
                >
                  Continue Shopping
                </button>
                <button
                  onClick={() => navigate('/dashboard/buyer')}
                  className="flex-1 btn-primary py-4 rounded-2xl font-bold"
                >
                  View Orders
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;
