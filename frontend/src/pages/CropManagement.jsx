import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { 
  Package, Plus, Save, X, Image as ImageIcon,
  CheckCircle2, AlertCircle, Trash2, ArrowLeft 
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const CropManagement = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    category: 'Cereal',
    pricePerUnit: '',
    unit: 'Quintal',
    quantity: '',
    location: user?.location || 'Harar',
    description: '',
    image: '',
  });

  const categories = ['Cereal', 'Stimulant', 'Vegetable', 'Fruit', 'Legume', 'Oilseed'];
  const units = ['Quintal', 'Kg', 'Batch', 'Tonne'];

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      // Logic for adding crop to backend
      const config = {
        headers: { Authorization: `Bearer ${user.token}` }
      };
      await axios.post('http://localhost:5000/api/crops', formData, config);
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        navigate('/dashboard/farmer');
      }, 3000);
    } catch (err) {
      console.error("Error adding crop:", err);
      alert("Failed to add crop. Please check your connection.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in pb-20">
      <div className="flex items-center justify-between">
        <Link to="/dashboard/farmer" className="flex items-center gap-2 text-slate-500 font-bold hover:text-agriGreen transition-all">
          <ArrowLeft size={18} /> Back to Dashboard
        </Link>
        <div className="flex items-center gap-3">
           <div className="bg-agriGreen/10 p-2 rounded-xl text-agriGreen">
              <Package size={20} />
           </div>
           <h1 className="text-2xl font-black text-slate-800 tracking-tight">List New Product</h1>
        </div>
      </div>

      {success && (
        <div className="bg-green-500 text-white p-6 rounded-3xl shadow-xl flex items-center justify-between animate-fade-in">
           <div className="flex items-center gap-4">
              <div className="bg-white/20 p-2 rounded-full">
                <CheckCircle2 size={24} />
              </div>
              <p className="font-black">Crop Successfully Listed! Redirecting to dashboard...</p>
           </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Form Column */}
        <div className="glass p-8 rounded-[2.5rem] border border-white shadow-2xl shadow-slate-200/50">
           <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Crop Name</label>
                <input 
                  type="text" name="name" required
                  placeholder="e.g. Red Maize, Harar Coffee"
                  className="input-field"
                  value={formData.name} onChange={handleChange}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                 <div>
                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Category</label>
                    <select 
                      name="category" className="input-field cursor-pointer"
                      value={formData.category} onChange={handleChange}
                    >
                      {categories.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                 </div>
                 <div>
                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Location</label>
                    <input 
                      type="text" name="location" required
                      className="input-field"
                      value={formData.location} onChange={handleChange}
                    />
                 </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                 <div className="col-span-2">
                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Price (ETB)</label>
                    <input 
                      type="number" name="pricePerUnit" required
                      className="input-field"
                      value={formData.pricePerUnit} onChange={handleChange}
                    />
                 </div>
                 <div>
                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Unit</label>
                    <select 
                      name="unit" className="input-field cursor-pointer"
                      value={formData.unit} onChange={handleChange}
                    >
                      {units.map(u => <option key={u} value={u}>{u}</option>)}
                    </select>
                 </div>
              </div>

              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Available Quantity</label>
                <input 
                  type="number" name="quantity" required
                  className="input-field"
                  value={formData.quantity} onChange={handleChange}
                />
              </div>

              <button 
                type="submit" disabled={isSubmitting}
                className={`btn-primary w-full py-4 text-lg ${isSubmitting ? 'opacity-70' : ''}`}
              >
                {isSubmitting ? 'Processing Upload...' : <><Save size={20} /> Publish Crop Listing</>}
              </button>
           </form>
        </div>

        {/* Media & Preview Column */}
        <div className="space-y-6">
           <div className="glass p-8 rounded-[2.5rem] border border-dashed border-slate-200">
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Product Photography</label>
              <div className="flex flex-col items-center justify-center p-12 bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl hover:bg-slate-100/50 transition-all cursor-pointer group">
                 <ImageIcon size={48} className="text-slate-300 group-hover:text-agriGreen transition-colors mb-4" />
                 <p className="text-slate-500 font-bold text-center">Click to upload harvest photo</p>
                 <p className="text-slate-300 text-xs mt-1">High resolution images sell 4x faster</p>
                 <input type="file" className="hidden" />
              </div>
              <div className="mt-4 flex items-center gap-2 p-4 bg-amber-50 rounded-2xl border border-amber-100 text-amber-700 text-xs font-medium italic">
                 <AlertCircle size={16} /> Image upload logic will be connected to your Cloudinary backend
              </div>
           </div>

           {/* Real-time Card Preview */}
           <div>
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-4 px-2">Marketplace Preview</label>
              <div className="card max-w-sm border-2 border-agriLight/20 mx-auto opacity-70">
                 <div className="h-40 bg-slate-100 flex items-center justify-center">
                    <Package size={40} className="text-slate-200" />
                 </div>
                 <div className="p-6">
                    <h3 className="text-lg font-black text-slate-800">{formData.name || 'Your Crop Name'}</h3>
                    <p className="text-agriGreen font-black mt-1">
                      {formData.pricePerUnit || '0'} <span className="text-xs text-slate-400">ETB/{formData.unit}</span>
                    </p>
                    <div className="mt-4 flex items-center gap-1 text-[10px] font-black text-slate-400 uppercase tracking-wider">
                       Listed in <span className="text-slate-600">{formData.location}</span>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default CropManagement;
