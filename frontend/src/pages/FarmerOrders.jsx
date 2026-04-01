import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { 
  Package, CheckCircle2, Clock, 
  MapPin, User, Phone, 
  ArrowRight, Search, Filter 
} from 'lucide-react';
import { Link } from 'react-router-dom';

const FarmerOrders = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const config = {
          headers: { Authorization: `Bearer ${user.token}` }
        };
        // In a real app we'd have a specific /api/orders/farmer route
        // For now, we'll fetch all orders and filter locally to reflect the role
        const { data } = await axios.get('http://localhost:5000/api/orders/myorders', config);
        setOrders(data);
      } catch (err) {
        console.error("Error fetching farmer orders:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [user]);

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-800">Incoming Harvest Orders</h1>
          <p className="text-slate-500 font-medium tracking-tight">Managing sales and logistics for your East Hararghe farm.</p>
        </div>
        <div className="flex gap-2 p-1 bg-slate-100 rounded-2xl w-fit">
           <button className="px-6 py-2 bg-white shadow-sm rounded-xl font-black text-agriGreen text-sm transition-all duration-300">All Orders</button>
           <button className="px-6 py-2 text-slate-500 hover:text-slate-800 font-black text-sm transition-all duration-300">Pending</button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
           <div className="w-12 h-12 border-4 border-agriGreen/20 border-t-agriGreen rounded-full animate-spin"></div>
        </div>
      ) : orders.length === 0 ? (
        <div className="py-20 text-center glass rounded-3xl border-dashed border-2 border-slate-200">
           <Package size={48} className="mx-auto text-slate-300 mb-4" />
           <h3 className="text-xl font-bold text-slate-600">No sales yet</h3>
           <p className="text-slate-400">Buyers from Harar and Dire Dawa will see your listings soon!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {orders.map((order, idx) => (
            <div key={order._id} className="glass p-8 rounded-[2.5rem] border border-white shadow-2xl shadow-slate-200/40 hover:shadow-agriGreen/10 transition-all group overflow-hidden relative">
               <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                  <Package size={120} />
               </div>
               
               <div className="relative z-10 grid grid-cols-1 lg:grid-cols-4 gap-8 items-center">
                  {/* Order Info */}
                  <div className="lg:col-span-1 space-y-2 text-center lg:text-left">
                     <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Order ID: #{order._id.slice(-6)}</span>
                     <h3 className="text-2xl font-black text-slate-800">{order.crop?.name || 'Fresh Harvest'}</h3>
                     <div className="flex items-center justify-center lg:justify-start gap-2 mt-1">
                        {order.status === 'Pending' ? (
                          <span className="bg-amber-100 text-amber-700 text-xs font-black px-3 py-1.5 rounded-full flex items-center gap-1">
                            <Clock size={14} /> Pending Delivery
                          </span>
                        ) : (
                          <span className="bg-green-100 text-green-700 text-xs font-black px-3 py-1.5 rounded-full flex items-center gap-1">
                            <CheckCircle2 size={14} /> Completed
                          </span>
                        )}
                     </div>
                  </div>

                  {/* Buyer Details */}
                  <div className="lg:col-span-1 space-y-4">
                     <div className="flex items-center gap-3">
                        <div className="p-2 bg-slate-100 rounded-xl text-slate-500">
                           <User size={18} />
                        </div>
                        <div>
                           <p className="text-xs font-black text-slate-400 uppercase tracking-widest leading-none">Buyer</p>
                           <p className="text-sm font-bold text-slate-800 mt-1">{order.buyer?.name || 'Verified Buyer'}</p>
                        </div>
                     </div>
                     <div className="flex items-center gap-3">
                        <div className="p-2 bg-slate-100 rounded-xl text-slate-500">
                           <MapPin size={18} />
                        </div>
                        <div>
                           <p className="text-xs font-black text-slate-400 uppercase tracking-widest leading-none">Destination</p>
                           <p className="text-sm font-bold text-slate-600 mt-1 truncate max-w-[150px]">{order.deliveryAddress}</p>
                        </div>
                     </div>
                  </div>

                  {/* Pricing & Logistics */}
                  <div className="lg:col-span-1 space-y-1 text-center">
                     <p className="text-xs font-black text-slate-400 uppercase tracking-widest leading-none">Order Total</p>
                     <p className="text-3xl font-black text-agriGreen tracking-tighter">{order.totalPrice} ETB</p>
                     <p className="text-xs font-bold text-slate-400">{order.quantity} Units Requested</p>
                  </div>

                  {/* Action Button */}
                  <div className="lg:col-span-1">
                     <button className="w-full btn-primary py-4 group/btn">
                        Ship Harvest <ArrowRight size={20} className="group-hover/btn:translate-x-2 transition-transform" />
                     </button>
                  </div>
               </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FarmerOrders;
