import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Search, 
  ShoppingCart, 
  Leaf, 
  MapPin, 
  Filter, 
  ChevronRight,
  Loader2,
  ArrowRight,
  Plus,
  Minus,
  X,
  MessageSquare,
  Zap,
  Star,
  Heart
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getCropImage } from '../utils/cropUtils';
import { useTranslation } from 'react-i18next';

const BuyerDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [crops, setCrops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [cart, setCart] = useState(() => {
    const saved = localStorage.getItem('agrilink_cart');
    return saved ? JSON.parse(saved) : [];
  });
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [sortBy, setSortBy] = useState('newest');
  const [showOnlyDeals, setShowOnlyDeals] = useState(false);

  useEffect(() => {
    localStorage.setItem('agrilink_cart', JSON.stringify(cart));
  }, [cart]);

  const categories = ['All', 'Vegetables', 'Fruits', 'Grains', 'Tubers'];

  useEffect(() => {
    const fetchCrops = async () => {
      try {
        const res = await axios.get('/api/crops');
        setCrops(res.data);
      } catch (err) {
        console.error('Error fetching crops:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCrops();
  }, []);

  const addToCart = (crop) => {
    setCart(prev => {
      const existing = prev.find(item => item._id === crop._id);
      if (existing) {
        return prev.map(item => 
          item._id === crop._id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...crop, quantity: 1 }];
    });
  };

  const removeFromCart = (id) => {
    setCart(prev => prev.filter(item => item._id !== id));
  };

  const updateQuantity = (id, delta) => {
    setCart(prev => prev.map(item => {
      if (item._id === id) {
        const newQty = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const filteredCrops = crops.filter(crop => {
    const matchesSearch = crop.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          crop.location?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || crop.category === selectedCategory;
    const matchesDeal = showOnlyDeals ? (crop.aiAnalysis?.badge?.type === 'deal') : true;
    return matchesSearch && matchesCategory && matchesDeal;
  }).sort((a, b) => {
    if (sortBy === 'price_asc') return a.pricePerUnit - b.pricePerUnit;
    if (sortBy === 'price_desc') return b.pricePerUnit - a.pricePerUnit;
    return new Date(b.createdAt) - new Date(a.createdAt); // newest
  });

  const cartTotal = cart.reduce((acc, item) => acc + (item.pricePerUnit * item.quantity), 0);

  if (loading) return (
    <div className="h-[60vh] flex items-center justify-center">
      <Loader2 className="w-10 h-10 animate-spin text-agriGreen" />
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 space-y-12">
      {/* Hero Search Section */}
      <section className="relative rounded-[2rem] md:rounded-[3rem] overflow-hidden bg-agriDark p-6 md:p-12 lg:p-20 text-white">
        <div className="absolute top-0 right-0 w-96 h-96 bg-agriGreen/20 rounded-full -mr-20 -mt-20 blur-3xl" />
        <div className="relative z-10 max-w-2xl">
          {/* User greeting with profile picture */}
          {user && (
            <div className="flex items-center gap-3 mb-6">
              {user.profilePicture ? (
                <img src={user.profilePicture} alt={user.name} className="w-12 h-12 rounded-full object-cover ring-2 ring-white/30" />
              ) : (
                <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-white text-lg font-black">
                  {user.name?.[0]}
                </div>
              )}
              <div>
                <p className="text-white/70 text-sm font-medium">Welcome back,</p>
                <p className="text-white font-bold text-lg">{user.name}</p>
              </div>
            </div>
          )}
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl md:text-4xl lg:text-6xl font-black mb-6 leading-tight"
          >
            {t('buyerDashboard.heroTitle', 'Fresh Produce from')} <br /> <span className="text-agriLight">{t('buyerDashboard.heroSubtitle', 'Local Farms')}</span>
          </motion.h1>
          <div className="relative group">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-agriGreen transition-colors" />
            <input 
              type="text"
              placeholder={t('buyerDashboard.searchPlaceholder', 'Search for vegetables, fruits, or location...')}
              className="w-full bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl py-5 pl-16 pr-6 outline-none focus:bg-white focus:text-gray-900 transition-all text-lg font-medium placeholder:text-gray-400"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </section>

      {/* Categories & Filter */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-hide">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-6 py-3 rounded-xl font-bold whitespace-nowrap transition-all ${
                selectedCategory === cat 
                  ? 'bg-agriGreen text-white shadow-lg shadow-green-200' 
                  : 'bg-white text-gray-500 border border-gray-100 hover:border-agriGreen/30'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
        
        <div className="flex flex-wrap md:flex-nowrap items-center gap-4 bg-white p-2 rounded-xl border border-gray-100 shadow-sm shrink-0 w-full md:w-auto">
          <label className="flex items-center gap-2 cursor-pointer text-sm font-bold text-gray-700 hover:bg-gray-50 px-3 py-2 rounded-lg transition-colors whitespace-nowrap">
            <input 
              type="checkbox" 
              checked={showOnlyDeals} 
              onChange={(e) => setShowOnlyDeals(e.target.checked)}
              className="w-4 h-4 rounded text-agriGreen focus:ring-agriGreen border-gray-300"
            />
            <Zap className="w-4 h-4 text-green-500" />
            {t('buyerDashboard.aiDealsOnly', 'AI Deals Only')}
          </label>
          <div className="w-px h-6 bg-gray-200"></div>
          <select 
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-transparent text-sm font-bold text-gray-700 outline-none cursor-pointer pr-4"
          >
            <option value="newest">{t('buyerDashboard.sortNewest', 'Sort: Newest')}</option>
            <option value="price_asc">{t('buyerDashboard.sortPriceAsc', 'Price: Low to High')}</option>
            <option value="price_desc">{t('buyerDashboard.sortPriceDesc', 'Price: High to Low')}</option>
          </select>
        </div>
      </div>

      {/* Crops Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        <AnimatePresence mode="popLayout">
          {filteredCrops.map((crop, idx) => (
            <motion.div
              layout
              key={crop._id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3, delay: idx * 0.05 }}
              className="group bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-300 cursor-pointer"
            >
              <div className="relative h-48">
                <img 
                  src={getCropImage(crop)} 
                  alt={crop.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute top-4 left-4">
                  <span className="bg-agriGreen text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">
                    {crop.category || 'Fresh'}
                  </span>
                </div>
                {crop.aiAnalysis?.badge?.type === 'deal' && (
                  <div className="absolute top-4 right-4">
                    <span className="bg-amber-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md flex items-center gap-1">
                      <Zap className="w-3 h-3" />
                      Deal
                    </span>
                  </div>
                )}
                <button className="absolute bottom-4 right-4 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg hover:bg-red-50 transition-colors">
                  <Heart className="w-5 h-5 text-gray-400 hover:text-red-500" />
                </button>
              </div>
              
              <div className="p-6">
                <div className="flex items-center gap-2 mb-2">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-500 line-clamp-1">{crop.location || 'East Hararghe'}</span>
                </div>
                
                <h3 className="font-bold text-gray-900 mb-2 group-hover:text-agriGreen transition-colors line-clamp-1">
                  {crop.name}
                </h3>
                
                <div className="flex items-center gap-1 mb-3">
                  <Star className="w-4 h-4 text-amber-400 fill-current" />
                  <span className="text-sm font-semibold text-gray-700">
                    {crop.rating > 0 ? crop.rating.toFixed(1) : '4.8'}
                  </span>
                  <span className="text-sm text-gray-400">
                    ({crop.numReviews > 0 ? crop.numReviews : Math.floor(Math.random() * 50) + 10} reviews)
                  </span>
                </div>
                
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <span className="text-2xl font-black text-agriGreen">ETB {crop.pricePerUnit?.toLocaleString() || crop.price}</span>
                    <span className="text-sm text-gray-400 line-through ml-2">
                      ETB {(crop.pricePerUnit ? crop.pricePerUnit * 1.15 : 0).toLocaleString(undefined, {maximumFractionDigits: 0})}
                    </span>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <button 
                    onClick={() => addToCart(crop)}
                    className="flex-grow bg-agriDark text-white py-3 rounded-xl font-bold hover:bg-agriGreen transition-colors flex items-center justify-center gap-2 group/btn"
                  >
                    <ShoppingCart className="w-5 h-5 transition-transform group-hover/btn:-translate-y-1" />
                    Add to Cart
                  </button>
                  <Link 
                    to={`/chat?userId=${crop.farmer?._id || crop.farmer}&userName=${crop.farmer?.name || 'Farmer'}`}
                    className="p-3 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-xl transition-colors flex items-center justify-center"
                  >
                    <MessageSquare className="w-5 h-5" />
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {filteredCrops.length === 0 && (
        <div className="py-20 text-center bg-gray-50 rounded-[3rem] border-dashed border-2 border-gray-200">
          <Search size={48} className="mx-auto text-gray-300 mb-4" />
          <h3 className="text-xl font-bold text-gray-600">No results found</h3>
          <p className="text-gray-400">Try adjusting your search or filters.</p>
        </div>
      )}

      {/* Cart Floating Button */}
      {cart.length > 0 && (
        <motion.button
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          onClick={() => setIsCartOpen(true)}
          className="fixed bottom-8 right-8 bg-agriGreen text-white p-5 rounded-full shadow-2xl shadow-green-400 z-40 flex items-center gap-3 hover:scale-110 transition-transform"
        >
          <div className="relative">
            <ShoppingCart className="w-7 h-7" />
            <span className="absolute -top-2 -right-2 bg-amber-500 text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center ring-4 ring-agriGreen">
              {cart.reduce((acc, item) => acc + item.quantity, 0)}
            </span>
          </div>
          <span className="font-black pr-2">${cartTotal.toFixed(2)}</span>
        </motion.button>
      )}

      {/* Cart Drawer */}
      <AnimatePresence>
        {isCartOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCartOpen(false)}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl z-50 flex flex-col"
            >
              <div className="p-8 flex items-center justify-between border-b border-gray-100">
                <h2 className="text-2xl font-black text-gray-900">Your Basket</h2>
                <button onClick={() => setIsCartOpen(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="flex-grow overflow-y-auto p-8 space-y-6">
                {cart.map((item) => (
                  <div key={item._id} className="flex gap-4">
                    <div className="w-20 h-20 rounded-2xl bg-gray-100 overflow-hidden shrink-0">
                      <img src={getCropImage(item)} alt={item.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-grow">
                      <div className="flex justify-between items-start">
                        <h4 className="font-bold text-gray-900">{item.name}</h4>
                        <button onClick={() => removeFromCart(item._id)} className="text-gray-400 hover:text-red-500 transition-colors">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="text-agriGreen font-black mt-1">${item.pricePerUnit}</div>
                      <div className="flex items-center gap-3 mt-3">
                        <button 
                          onClick={() => updateQuantity(item._id, -1)}
                          className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="font-bold w-4 text-center">{item.quantity}</span>
                        <button 
                          onClick={() => updateQuantity(item._id, 1)}
                          className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-8 border-t border-gray-100 bg-gray-50 space-y-4">
                <div className="flex justify-between items-center text-lg font-bold">
                  <span className="text-gray-500">Subtotal</span>
                  <span className="text-gray-900 font-black">${cartTotal.toFixed(2)}</span>
                </div>
                <button 
                  onClick={() => setIsCartOpen(false) & navigate('/checkout', { state: { cart, total: cartTotal } })}
                  className="w-full btn-primary py-4 rounded-2xl text-lg font-black shadow-xl shadow-green-200"
                >
                  Checkout Now
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default BuyerDashboard;
