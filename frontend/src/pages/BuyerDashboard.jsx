import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { ShoppingCart, MapPin, Search, Tag, Filter, CheckCircle2, ChevronRight, X } from 'lucide-react';

const BuyerDashboard = () => {
  const { user } = useAuth();
  const [crops, setCrops] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCrop, setSelectedCrop] = useState(null);
  const [showPaymentSuccess, setShowPaymentSuccess] = useState(false);
  const [isPaying, setIsPaying] = useState(false);

  useEffect(() => {
    const fetchCrops = async () => {
      try {
        const { data } = await axios.get('http://localhost:5000/api/crops');
        setCrops(data);
      } catch (err) {
        console.error("Error fetching crops:", err);
      }
    };
    fetchCrops();
  }, []);

  const handleBuy = (crop) => {
    setSelectedCrop(crop);
  };

  const [deliveryAddress, setDeliveryAddress] = useState(user?.location || '');

  const processPayment = async () => {
    setIsPaying(true);
    try {
      const config = {
        headers: { Authorization: `Bearer ${user.token}` }
      };
      await axios.post('http://localhost:5000/api/orders', {
        cropId: selectedCrop._id,
        quantity: 1, // Defaulting to 1 for demo simplification
        deliveryAddress
      }, config);

      setSelectedCrop(null);
      setShowPaymentSuccess(true);
      setTimeout(() => setShowPaymentSuccess(false), 5000);
    } catch (err) {
      console.error("Payment Error:", err);
      alert("Payment failed: " + (err.response?.data?.message || err.message));
    } finally {
      setIsPaying(false);
    }
  };

  const filteredCrops = crops.filter(crop => 
    crop.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    crop.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Premium Welcome Banner */}
      <div className="relative overflow-hidden bg-gradient-to-br from-agriGreen to-agriDark p-8 rounded-3xl shadow-2xl shadow-green-900/30">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl"></div>
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="text-white">
            <h1 className="text-4xl font-extrabold tracking-tight">Welcome, {user?.name}!</h1>
            <p className="text-agriLight mt-2 text-lg font-medium opacity-90 max-w-lg">
              Empowering your agricultural supply chain with direct-from-farmer connections in East Hararghe.
            </p>
            <div className="flex gap-4 mt-6">
              <div className="glass px-4 py-2 rounded-full flex items-center gap-2 text-sm">
                <Tag size={16} /> Best regional prices
              </div>
              <div className="glass px-4 py-2 rounded-full flex items-center gap-2 text-sm">
                <CheckCircle2 size={16} /> Verified Farmers
              </div>
            </div>
          </div>
          
          <div className="w-full md:w-96 relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="text-agriGreen" size={20} />
            </div>
            <input 
              type="text" 
              placeholder="Search by crop or location..." 
              className="w-full pl-12 pr-4 py-4 bg-white/95 backdrop-blur shadow-xl border-0 rounded-2xl focus:ring-4 focus:ring-agriLight/50 text-gray-800 transition-all font-medium"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Success Notification */}
      {showPaymentSuccess && (
        <div className="fixed top-24 right-8 z-50 bg-green-500 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 animate-fade-in">
          <div className="bg-white/20 p-2 rounded-full">
            <CheckCircle2 size={24} />
          </div>
          <div>
            <p className="font-bold">Payment Successful!</p>
            <p className="text-sm opacity-90">M-Pesa transaction complete. Check your dashboard for details.</p>
          </div>
        </div>
      )}

      {/* Marketplace Grid */}
      <div>
        <div className="flex justify-between items-center mb-8 px-2">
          <h2 className="text-2xl font-black text-slate-800 flex items-center gap-2">
            <ShoppingCart className="text-agriGreen" /> Fresh Harvest Marketplace
          </h2>
          <button className="flex items-center gap-2 text-agriGreen font-bold hover:gap-3 transition-all">
            Filter <Filter size={18} />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {filteredCrops.map((crop, idx) => (
            <div key={crop._id} className="card group" style={{ animationDelay: `${idx * 100}ms` }}>
              <div className="relative h-56 overflow-hidden">
                <div className="absolute top-3 left-3 z-10">
                  <span className="bg-black/50 backdrop-blur-md text-white text-[10px] uppercase tracking-widest font-black px-3 py-1.5 rounded-full">
                    {crop.category || "General"}
                  </span>
                </div>
                {crop.image 
                  ? <img src={crop.image} alt={crop.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                  : <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-green-50 to-amber-50">
                      <div className="text-center">
                        <ShoppingCart size={40} className="mx-auto text-agriLight opacity-40" />
                        <span className="text-xs text-agriLight mt-2 font-bold uppercase tracking-widest">No Image</span>
                      </div>
                    </div>
                }
              </div>
              
              <div className="p-6">
                <div className="flex justify-between items-start">
                  <h3 className="text-xl font-black text-slate-800 group-hover:text-agriGreen transition-colors">{crop.name}</h3>
                  <div className="flex items-center text-slate-500 text-xs font-bold">
                    <MapPin size={14} className="mr-1 text-agriEarth" /> {crop.location}
                  </div>
                </div>

                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-3xl font-black text-slate-900">{crop.pricePerUnit}</span>
                  <span className="text-sm font-bold text-slate-400">ETB / {crop.unit}</span>
                </div>

                <div className="mt-4 flex items-center justify-between text-xs font-bold tracking-tight">
                    <span className="text-slate-400">STOCK: <span className="text-slate-700">{crop.quantity} {crop.unit}</span></span>
                    <span className="px-2 py-1 bg-amber-50 text-amber-600 rounded">Fresh Harvest</span>
                </div>
                
                <button 
                  onClick={() => handleBuy(crop)}
                  className="btn-primary w-full mt-6"
                >
                  <ShoppingCart size={18} /> Buy with M-Pesa
                </button>
              </div>
            </div>
          ))}
        </div>

        {filteredCrops.length === 0 && (
          <div className="py-20 text-center glass rounded-3xl border-dashed border-2 border-slate-200">
            <Search size={48} className="mx-auto text-slate-300 mb-4" />
            <h3 className="text-xl font-bold text-slate-600">No crops found</h3>
            <p className="text-slate-400">Try searching for something else like "Coffee" or "Harar"</p>
          </div>
        )}
      </div>

      {/* Mock M-Pesa Payment Modal */}
      {selectedCrop && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden relative">
            <button 
              onClick={() => setSelectedCrop(null)}
              className="absolute top-4 right-4 p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400"
            >
              <X size={20} />
            </button>

            <div className="p-8">
              <div className="bg-agriGreen/10 w-16 h-16 rounded-2xl flex items-center justify-center mb-6">
                <ShoppingCart className="text-agriGreen" size={32} />
              </div>
              <h3 className="text-2xl font-black text-slate-800">Complete Purchase</h3>
              <p className="text-slate-500 mt-2">You are about to buy <strong>{selectedCrop.name}</strong> from a local farmer.</p>
              
              <div className="mt-6 space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Delivery Address</label>
                <textarea 
                  className="input-field min-h-[80px]" 
                  value={deliveryAddress} 
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  placeholder="Specify location for drop-off..."
                ></textarea>
              </div>

              <div className="mt-6 space-y-4 bg-slate-50 p-6 rounded-2xl border border-slate-100">
                <div className="flex justify-between font-medium">
                  <span className="text-slate-500">Unit Price:</span>
                  <span className="text-slate-800">{selectedCrop.pricePerUnit} ETB</span>
                </div>
                <div className="flex justify-between font-medium">
                  <span className="text-slate-500">Service Fee:</span>
                  <span className="text-slate-800">5 ETB</span>
                </div>
                <div className="h-px bg-slate-200 my-2"></div>
                <div className="flex justify-between text-lg font-black">
                  <span className="text-slate-800">Total:</span>
                  <span className="text-agriGreen">{selectedCrop.pricePerUnit + 5} ETB</span>
                </div>
              </div>

              <div className="mt-8 flex items-center gap-3 bg-amber-50/50 p-4 rounded-xl border border-amber-100 italic text-sm text-amber-700">
                <ChevronRight size={16} /> M-Pesa prompt will be sent to your phone
              </div>

              <button 
                onClick={processPayment}
                disabled={isPaying}
                className={`btn-primary w-full mt-8 py-4 ${isPaying ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {isPaying ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Processing Payment...
                  </div>
                ) : (
                  <>Confirm & Pay with M-Pesa</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BuyerDashboard;
