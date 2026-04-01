import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { PlusCircle, Search, Sprout, AlertCircle, Package, TrendingUp, Users, ArrowRight, Edit, Trash2 } from 'lucide-react';

const FarmerDashboard = () => {
  const { user } = useAuth();
  const [crops, setCrops] = useState([]);
  const [problems, setProblems] = useState([]);
  const [activeTab, setActiveTab] = useState('crops');

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const cropRes = await axios.get('http://localhost:5000/api/crops');
        const myCrops = cropRes.data.filter(c => c.farmer?._id === user?._id || c.farmer === user?._id);
        setCrops(myCrops);
        
        const probRes = await axios.get('http://localhost:5000/api/problems');
        const myProblems = probRes.data.filter(p => p.farmer?._id === user?._id || p.farmer === user?._id);
        setProblems(myProblems);
      } catch (err) {
        console.error("Error fetching data:", err);
      }
    };

    if (user?.token) {
       axios.defaults.headers.common['Authorization'] = `Bearer ${user.token}`;
       fetchDashboardData();
    }
  }, [user]);

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Header Banner */}
      <div className="bg-white p-8 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 flex flex-col md:flex-row justify-between items-center gap-6 bg-gradient-to-br from-white to-green-50/30">
        <div className="flex items-center gap-5">
           <div className="w-16 h-16 bg-agriGreen/10 rounded-2xl flex items-center justify-center text-agriGreen shadow-inner">
              <Sprout size={32} />
           </div>
           <div>
              <h1 className="text-3xl font-black text-slate-800">Hello, {user?.name}!</h1>
              <p className="text-slate-500 font-medium flex items-center gap-2 mt-1">
                Manage your East Hararghe farms <ArrowRight size={14} className="text-agriGreen" />
              </p>
           </div>
        </div>
        <Link to="/dashboard/farmer/crops" className="btn-primary">
          <PlusCircle size={20} />
          {activeTab === 'crops' ? 'Add New Crop' : 'Request Student Help'}
        </Link>
      </div>

      {/* Stats Summary Panel */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="glass p-6 rounded-2xl border-l-4 border-agriGreen hover:border-l-8 transition-all">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-green-100 rounded-lg text-agriGreen">
              <Package size={20} />
            </div>
            <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded">LIVE</span>
          </div>
          <p className="text-slate-500 text-sm font-bold uppercase tracking-wider">Active Crops</p>
          <h3 className="text-3xl font-black text-slate-800 mt-1">{crops.length}</h3>
        </div>

        <div className="glass p-6 rounded-2xl border-l-4 border-agriEarth hover:border-l-8 transition-all">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-amber-100 rounded-lg text-agriEarth">
              <AlertCircle size={20} />
            </div>
            <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded">URGENT</span>
          </div>
          <p className="text-slate-500 text-sm font-bold uppercase tracking-wider">Open Problems</p>
          <h3 className="text-3xl font-black text-slate-800 mt-1">{problems.length}</h3>
        </div>

        <div className="glass p-6 rounded-2xl border-l-4 border-blue-500 hover:border-l-8 transition-all">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
              <Users size={20} />
            </div>
          </div>
          <p className="text-slate-500 text-sm font-bold uppercase tracking-wider">Student Proposals</p>
          <h3 className="text-3xl font-black text-slate-800 mt-1">4</h3>
        </div>

        <Link to="/dashboard/farmer/orders" className="glass p-6 rounded-2xl border-l-4 border-purple-500 hover:border-l-8 transition-all hover:bg-purple-50/50 group">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-purple-100 rounded-lg text-purple-600">
              <TrendingUp size={20} />
            </div>
            <ArrowRight size={16} className="text-purple-400 group-hover:translate-x-1 transition-transform" />
          </div>
          <p className="text-slate-500 text-sm font-bold uppercase tracking-wider">Manage Shipments</p>
          <h3 className="text-3xl font-black text-slate-800 mt-1">View All <span className="text-sm font-medium text-slate-400">Orders</span></h3>
        </Link>
      </div>

      {/* Modern Tabs */}
      <div className="flex gap-2 p-1 bg-slate-100 rounded-2xl w-fit">
        <button 
          onClick={() => setActiveTab('crops')}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl font-black transition-all duration-300 ${activeTab === 'crops' ? 'bg-white text-agriGreen shadow-lg' : 'text-slate-500 hover:text-slate-800'}`}
        >
          <Package size={18} /> My Crop Listings
        </button>
        <button 
          onClick={() => setActiveTab('problems')}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl font-black transition-all duration-300 ${activeTab === 'problems' ? 'bg-white text-agriEarth shadow-lg' : 'text-slate-500 hover:text-slate-800'}`}
        >
          <AlertCircle size={18} /> Problem Inbox
        </button>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {activeTab === 'crops' && (
          <>
            {crops.length === 0 ? (
              <div className="col-span-full py-20 text-center glass rounded-3xl border-dashed border-2 border-slate-200">
                 <Package size={48} className="mx-auto text-slate-300 mb-4" />
                 <h3 className="text-xl font-bold text-slate-600">No active crops</h3>
                 <p className="text-slate-400">Time to list your harvest and reach more buyers!</p>
              </div>
            ) : (
              crops.map((crop, idx) => (
                <div key={crop._id} className="card group animate-fade-in" style={{ animationDelay: `${idx * 100}ms` }}>
                   <div className="h-44 bg-slate-100 relative overflow-hidden">
                      {crop.image ? 
                        <img src={crop.image} alt={crop.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" /> : 
                        <div className="w-full h-full flex flex-col items-center justify-center text-slate-300 italic text-xs font-bold tracking-widest">
                          <Package size={32} className="mb-2 opacity-20" /> NO IMAGE
                        </div>
                      }
                      <div className="absolute bottom-3 left-3 flex gap-2">
                         <span className="bg-white/90 backdrop-blur px-2 py-1 rounded-lg text-xs font-black text-slate-700 shadow-sm">{crop.quantity} {crop.unit}</span>
                      </div>
                   </div>
                   <div className="p-6">
                      <h3 className="text-xl font-black text-slate-800">{crop.name}</h3>
                      <p className="text-agriGreen font-black text-lg mt-1">{crop.pricePerUnit} <span className="text-xs text-slate-400">ETB/{crop.unit}</span></p>
                      
                      <div className="flex gap-2 mt-6 pt-6 border-t border-slate-50">
                        <button className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-600 p-2.5 rounded-xl transition-colors flex items-center justify-center gap-2 text-sm font-bold">
                          <Edit size={16} /> Edit
                        </button>
                        <button className="flex-1 bg-red-50 hover:bg-red-100 text-red-500 p-2.5 rounded-xl transition-colors flex items-center justify-center gap-2 text-sm font-bold">
                          <Trash2 size={16} /> Delete
                        </button>
                      </div>
                   </div>
                </div>
              ))
            )}
          </>
        )}

        {activeTab === 'problems' && (
          <>
            {problems.length === 0 ? (
              <div className="col-span-full py-20 text-center glass rounded-3xl border-dashed border-2 border-slate-200">
                 <AlertCircle size={48} className="mx-auto text-slate-300 mb-4" />
                 <h3 className="text-xl font-bold text-slate-600">Your fields look healthy!</h3>
                 <p className="text-slate-400">Post a problem if you need help from Haramaya University students.</p>
              </div>
            ) : (
              problems.map((problem, idx) => (
                <div key={problem._id} className="card p-6 animate-fade-in group border-l-8 border-agriEarth" style={{ animationDelay: `${idx * 100}ms` }}>
                   <div className="flex justify-between items-start mb-4">
                      <h3 className="text-xl font-black text-slate-800 leading-tight group-hover:text-agriEarth transition-colors">{problem.title}</h3>
                      <span className="bg-amber-100 text-amber-700 text-[10px] uppercase font-black px-2 py-1 rounded-full">{problem.status}</span>
                   </div>
                   <p className="text-slate-500 text-sm leading-relaxed line-clamp-3 mb-6">{problem.description}</p>
                   
                   <Link to={`/problem/${problem._id}`} className="btn-secondary w-full">
                      View Solutions <ArrowRight size={18} />
                   </Link>
                </div>
              ))
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default FarmerDashboard;
