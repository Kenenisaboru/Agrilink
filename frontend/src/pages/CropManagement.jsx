import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { 
  Package, 
  Plus, 
  Save, 
  X, 
  Image as ImageIcon,
  CheckCircle2, 
  AlertCircle, 
  ArrowLeft,
  Loader2,
  MapPin,
  Tag,
  Scale
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const CropManagement = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '',
    category: 'Vegetable',
    pricePerUnit: '',
    unit: 'Kg',
    quantity: '',
    location: user?.location || '',
    description: '',
  });

  const categories = ['Vegetable', 'Fruit', 'Grain', 'Cereal', 'Legume', 'Oilseed', 'Stimulant'];
  const units = ['Kg', 'Quintal', 'Tonne', 'Batch', 'Box'];

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const data = new FormData();
      data.append('name', formData.name);
      data.append('category', formData.category);
      data.append('pricePerUnit', formData.pricePerUnit);
      data.append('unit', formData.unit);
      data.append('quantity', formData.quantity);
      data.append('location', formData.location);
      data.append('description', formData.description);
      if (imageFile) {
        data.append('image', imageFile);
      }

      const config = {
        headers: { 
          Authorization: `Bearer ${user.token}`,
          'Content-Type': 'multipart/form-data'
        }
      };
      await axios.post('/api/crops', data, config);
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        navigate('/dashboard/farmer');
      }, 2000);
    } catch (err) {
      console.error("Error adding crop:", err);
      alert("Failed to add crop. Please check your connection.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <Link to="/dashboard/farmer" className="inline-flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-agriGreen transition-colors mb-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight flex items-center gap-3">
            <div className="bg-agriGreen/10 p-2 rounded-2xl text-agriGreen">
              <Package className="w-8 h-8" />
            </div>
            List New Product
          </h1>
          <p className="text-gray-500 font-medium">Add your fresh harvest to the marketplace.</p>
        </div>
      </div>

      <AnimatePresence>
        {success && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-green-500 text-white p-6 rounded-[2rem] shadow-xl shadow-green-200 flex items-center gap-4"
          >
            <div className="bg-white/20 p-2 rounded-full">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <p className="font-black text-lg">Harvest Successfully Listed! Redirecting...</p>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Form Section */}
        <div className="lg:col-span-2">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white p-8 lg:p-10 rounded-[3rem] border border-gray-100 shadow-sm"
          >
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 ml-1">Crop Name</label>
                <input 
                  type="text" 
                  name="name" 
                  required
                  placeholder="e.g. Fresh Red Tomatoes, Organic Coffee"
                  className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 px-6 outline-none focus:ring-4 focus:ring-agriGreen/10 focus:border-agriGreen transition-all font-medium text-lg"
                  value={formData.name} 
                  onChange={handleChange}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 ml-1">Category</label>
                  <div className="relative group">
                    <Tag className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-agriGreen w-5 h-5" />
                    <select 
                      name="category" 
                      className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 pl-12 pr-4 outline-none focus:ring-4 focus:ring-agriGreen/10 focus:border-agriGreen transition-all font-medium appearance-none cursor-pointer"
                      value={formData.category} 
                      onChange={handleChange}
                    >
                      {categories.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 ml-1">Location</label>
                  <div className="relative group">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-agriGreen w-5 h-5" />
                    <input 
                      type="text" 
                      name="location" 
                      required
                      placeholder="e.g. Haramaya, EH"
                      className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 pl-12 pr-4 outline-none focus:ring-4 focus:ring-agriGreen/10 focus:border-agriGreen transition-all font-medium"
                      value={formData.location} 
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 space-y-2">
                  <label className="text-sm font-bold text-gray-700 ml-1">Price per Unit (ETB)</label>
                  <input 
                    type="number" 
                    name="pricePerUnit" 
                    required
                    placeholder="0.00"
                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 px-6 outline-none focus:ring-4 focus:ring-agriGreen/10 focus:border-agriGreen transition-all font-medium"
                    value={formData.pricePerUnit} 
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 ml-1">Unit</label>
                  <div className="relative group">
                    <Scale className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-agriGreen w-5 h-5" />
                    <select 
                      name="unit" 
                      className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 pl-12 pr-4 outline-none focus:ring-4 focus:ring-agriGreen/10 focus:border-agriGreen transition-all font-medium appearance-none cursor-pointer"
                      value={formData.unit} 
                      onChange={handleChange}
                    >
                      {units.map(u => <option key={u} value={u}>{u}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 ml-1">Total Available Quantity</label>
                <input 
                  type="number" 
                  name="quantity" 
                  required
                  placeholder="e.g. 500"
                  className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 px-6 outline-none focus:ring-4 focus:ring-agriGreen/10 focus:border-agriGreen transition-all font-medium"
                  value={formData.quantity} 
                  onChange={handleChange}
                />
              </div>

              <button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full btn-primary py-5 rounded-2xl text-xl font-black shadow-xl shadow-green-200 mt-4 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <Loader2 className="w-7 h-7 animate-spin mx-auto" />
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    <Save className="w-6 h-6" />
                    Publish Crop Listing
                  </div>
                )}
              </button>
            </form>
          </motion.div>
        </div>

        {/* Sidebar Section */}
        <div className="space-y-8">
          {/* Image Upload Preview */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-sm"
          >
            <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-6 px-2">Product Photo</h3>
            <div className="aspect-square bg-gray-50 border-4 border-dashed border-gray-100 rounded-[2.5rem] flex flex-col items-center justify-center p-6 text-center group hover:bg-gray-100 hover:border-agriGreen/20 transition-all cursor-pointer relative overflow-hidden">
              {imagePreview ? (
                <img src={imagePreview} alt="Preview" className="absolute inset-0 w-full h-full object-cover" />
              ) : (
                <>
                  <div className="bg-white p-4 rounded-3xl shadow-sm mb-4 group-hover:scale-110 transition-transform">
                    <ImageIcon className="w-10 h-10 text-agriGreen" />
                  </div>
                  <p className="text-gray-600 font-bold">Add Harvest Photo</p>
                  <p className="text-gray-400 text-xs mt-2">Recommended: 800x800px <br /> (JPG or PNG)</p>
                </>
              )}
              <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleImageChange} />
            </div>
          </motion.div>

          {/* Marketplace Preview */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-6 px-4">Marketplace Preview</h3>
            <div className="bg-white rounded-[2.5rem] border border-gray-100 overflow-hidden shadow-sm opacity-60 pointer-events-none">
              <div className="h-48 bg-gray-50 flex items-center justify-center">
                <Package className="w-12 h-12 text-gray-200" />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-black text-gray-900 truncate">
                  {formData.name || 'Product Title'}
                </h3>
                <div className="text-agriGreen font-black text-lg mt-1">
                  {formData.pricePerUnit || '0.00'} <span className="text-xs text-gray-400 font-bold uppercase">ETB / {formData.unit}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-400 text-xs font-bold mt-4 uppercase tracking-wider">
                  <MapPin className="w-3 h-3" />
                  {formData.location || 'Location'}
                </div>
              </div>
            </div>
            <div className="mt-4 flex items-start gap-3 p-4 bg-amber-50 rounded-2xl border border-amber-100">
              <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <p className="text-xs text-amber-700 font-medium leading-relaxed">
                Make sure your price is competitive for the <span className="font-bold underline">{formData.location || 'local'}</span> area.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default CropManagement;
