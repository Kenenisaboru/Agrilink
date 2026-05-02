import React, { useState, useEffect } from 'react';
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
  Scale,
  Upload,
  Trash2,
  Star,
  TrendingUp,
  Calendar,
  Truck,
  Shield,
  Zap,
  DollarSign,
  Box,
  Layers
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { getCropImage } from '../utils/cropUtils';

const CropManagement = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [activeTab, setActiveTab] = useState('basic');
  
  const [formData, setFormData] = useState({
    name: '',
    category: 'Coffee',
    pricePerUnit: '',
    originalPrice: '',
    unit: 'Kg',
    quantity: '',
    minOrder: '1',
    location: user?.location || 'East Hararghe',
    description: '',
    specifications: '',
    harvestDate: '',
    expiryDate: '',
    inStock: true,
    featured: false,
    organic: false,
    fairTrade: false
  });

  const categories = [
    { id: 'coffee', name: 'Coffee', icon: '☕', subcategories: ['Arabica', 'Robusta', 'Yirgacheffe', 'Sidamo', 'Harar'] },
    { id: 'khat', name: 'Khat', icon: '🌿', subcategories: ['Premium', 'Standard', 'Fresh'] },
    { id: 'grains', name: 'Grains', icon: '🌾', subcategories: ['Teff', 'Wheat', 'Barley', 'Maize', 'Sorghum'] },
    { id: 'vegetables', name: 'Vegetables', icon: '🥬', subcategories: ['Tomatoes', 'Onions', 'Peppers', 'Cabbage', 'Carrots'] },
    { id: 'fruits', name: 'Fruits', icon: '🍎', subcategories: ['Bananas', 'Mangoes', 'Avocados', 'Papayas', 'Oranges'] },
    { id: 'livestock', name: 'Livestock', icon: '🐄', subcategories: ['Cattle', 'Sheep', 'Goats', 'Poultry', 'Honey'] },
    { id: 'spices', name: 'Spices', icon: '🌶️', subcategories: ['Berbere', 'Cardamom', 'Turmeric', 'Cumin', 'Fenugreek'] }
  ];

  const units = ['Kg', 'Quintal', 'Tonne', 'Gram', 'Liter', 'Piece', 'Box', 'Bundle'];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ 
      ...formData, 
      [name]: type === 'checkbox' ? checked : value 
    });
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 5) {
      alert('Maximum 5 images allowed');
      return;
    }
    
    const newFiles = [...imageFiles, ...files];
    const newPreviews = [...imagePreviews];
    
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        newPreviews.push(reader.result);
        setImagePreviews([...newPreviews]);
      };
      reader.readAsDataURL(file);
    });
    
    setImageFiles(newFiles);
  };

  const removeImage = (index) => {
    const newFiles = imageFiles.filter((_, i) => i !== index);
    const newPreviews = imagePreviews.filter((_, i) => i !== index);
    setImageFiles(newFiles);
    setImagePreviews(newPreviews);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Strict numerical validations
    if (Number(formData.pricePerUnit) <= 0) {
      alert('Price per unit must be greater than zero.');
      return;
    }
    if (Number(formData.quantity) <= 0) {
      alert('Quantity must be greater than zero.');
      return;
    }

    setIsSubmitting(true);
    try {
      const data = new FormData();
      Object.keys(formData).forEach(key => {
        data.append(key, formData[key]);
      });
      
      imageFiles.forEach((file, index) => {
        data.append(`images`, file);
      });

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
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-10">
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
          <p className="text-gray-500 font-medium">Add your fresh harvest to the premium marketplace.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-green-50 px-4 py-2 rounded-full border border-green-100">
            <Zap className="w-4 h-4 text-green-600" />
            <span className="text-sm font-bold text-green-700">AI Pricing Assistant</span>
          </div>
          <div className="flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-full border border-blue-100">
            <TrendingUp className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-bold text-blue-700">Market Insights</span>
          </div>
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
            <p className="font-black text-lg">Product Successfully Listed! Redirecting...</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tabs */}
      <div className="flex gap-2 bg-gray-100 p-2 rounded-2xl w-fit">
        {['basic', 'pricing', 'inventory', 'images'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-3 rounded-xl font-bold transition-all ${
              activeTab === tab 
                ? 'bg-white text-agriGreen shadow-sm' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Form Section */}
        <div className="lg:col-span-2">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white p-8 lg:p-10 rounded-[3rem] border border-gray-100 shadow-sm"
          >
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Basic Information */}
              <div className="space-y-6">
                <h3 className="text-lg font-black text-gray-900 flex items-center gap-2">
                  <Box className="w-5 h-5 text-agriGreen" />
                  Basic Information
                </h3>
                
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 ml-1">Product Name</label>
                  <input 
                    type="text" 
                    name="name" 
                    required
                    placeholder="e.g. Premium Ethiopian Coffee, Organic Teff"
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
                        {categories.map(c => <option key={c.id} value={c.name}>{c.icon} {c.name}</option>)}
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
                        placeholder="e.g. Harar, East Hararghe"
                        className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 pl-12 pr-4 outline-none focus:ring-4 focus:ring-agriGreen/10 focus:border-agriGreen transition-all font-medium"
                        value={formData.location} 
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 ml-1">Description</label>
                  <textarea 
                    name="description" 
                    rows={4}
                    placeholder="Describe your product quality, origin, and unique characteristics..."
                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 px-6 outline-none focus:ring-4 focus:ring-agriGreen/10 focus:border-agriGreen transition-all font-medium resize-none"
                    value={formData.description} 
                    onChange={handleChange}
                  />
                </div>
              </div>

              {/* Pricing */}
              <div className="space-y-6 pt-6 border-t border-gray-100">
                <h3 className="text-lg font-black text-gray-900 flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-agriGreen" />
                  Pricing Information
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700 ml-1">Price (ETB)</label>
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
                    <label className="text-sm font-bold text-gray-700 ml-1">Original Price</label>
                    <input 
                      type="number" 
                      name="originalPrice" 
                      placeholder="0.00"
                      className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 px-6 outline-none focus:ring-4 focus:ring-agriGreen/10 focus:border-agriGreen transition-all font-medium"
                      value={formData.originalPrice} 
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
                  <label className="text-sm font-bold text-gray-700 ml-1">Minimum Order Quantity</label>
                  <input 
                    type="number" 
                    name="minOrder" 
                    placeholder="1"
                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 px-6 outline-none focus:ring-4 focus:ring-agriGreen/10 focus:border-agriGreen transition-all font-medium"
                    value={formData.minOrder} 
                    onChange={handleChange}
                  />
                </div>
              </div>

              {/* Inventory */}
              <div className="space-y-6 pt-6 border-t border-gray-100">
                <h3 className="text-lg font-black text-gray-900 flex items-center gap-2">
                  <Layers className="w-5 h-5 text-agriGreen" />
                  Inventory Management
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700 ml-1">Available Quantity</label>
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

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700 ml-1">Harvest Date</label>
                    <div className="relative group">
                      <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-agriGreen w-5 h-5" />
                      <input 
                        type="date" 
                        name="harvestDate"
                        className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 pl-12 pr-4 outline-none focus:ring-4 focus:ring-agriGreen/10 focus:border-agriGreen transition-all font-medium"
                        value={formData.harvestDate} 
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input 
                      type="checkbox" 
                      name="inStock"
                      checked={formData.inStock}
                      onChange={handleChange}
                      className="w-5 h-5 rounded border-gray-300 text-agriGreen focus:ring-agriGreen" 
                    />
                    <span className="text-sm font-bold text-gray-700">In Stock</span>
                  </label>
                  
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input 
                      type="checkbox" 
                      name="featured"
                      checked={formData.featured}
                      onChange={handleChange}
                      className="w-5 h-5 rounded border-gray-300 text-agriGreen focus:ring-agriGreen" 
                    />
                    <span className="text-sm font-bold text-gray-700">Featured Product</span>
                  </label>
                </div>

                <div className="flex items-center gap-6">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input 
                      type="checkbox" 
                      name="organic"
                      checked={formData.organic}
                      onChange={handleChange}
                      className="w-5 h-5 rounded border-gray-300 text-agriGreen focus:ring-agriGreen" 
                    />
                    <span className="text-sm font-bold text-gray-700">Organic Certified</span>
                  </label>
                  
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input 
                      type="checkbox" 
                      name="fairTrade"
                      checked={formData.fairTrade}
                      onChange={handleChange}
                      className="w-5 h-5 rounded border-gray-300 text-agriGreen focus:ring-agriGreen" 
                    />
                    <span className="text-sm font-bold text-gray-700">Fair Trade</span>
                  </label>
                </div>
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
                    Publish Product Listing
                  </div>
                )}
              </button>
            </form>
          </motion.div>
        </div>

        {/* Sidebar Section */}
        <div className="space-y-8">
          {/* Image Upload */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-sm"
          >
            <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-6 px-2">Product Images</h3>
            
            <div className="space-y-4">
              <div className="aspect-square bg-gray-50 border-4 border-dashed border-gray-100 rounded-[2.5rem] flex flex-col items-center justify-center p-6 text-center group hover:bg-gray-100 hover:border-agriGreen/20 transition-all cursor-pointer relative overflow-hidden">
                <div className="bg-white p-4 rounded-3xl shadow-sm mb-4 group-hover:scale-110 transition-transform">
                  <Upload className="w-10 h-10 text-agriGreen" />
                </div>
                <p className="text-gray-600 font-bold">Upload Images</p>
                <p className="text-gray-400 text-xs mt-2">Up to 5 images<br />Recommended: 800x800px</p>
                <input type="file" accept="image/*" multiple className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleImageChange} />
              </div>

              {imagePreviews.length > 0 && (
                <div className="grid grid-cols-2 gap-3">
                  {imagePreviews.map((preview, index) => (
                    <div key={index} className="relative aspect-square rounded-2xl overflow-hidden group">
                      <img src={preview} alt={`Preview ${index + 1}`} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>

          {/* Marketplace Preview */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-6 px-4">Live Preview</h3>
            <div className="bg-white rounded-[2.5rem] border border-gray-100 overflow-hidden shadow-sm">
              <div className="h-48 bg-gray-50 relative overflow-hidden">
                <img 
                  src={imagePreviews[0] || getCropImage(formData)} 
                  alt="Preview" 
                  className="w-full h-full object-cover"
                />
                {formData.featured && (
                  <div className="absolute top-4 left-4 bg-amber-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                    Featured
                  </div>
                )}
              </div>
              <div className="p-6">
                <div className="flex items-center gap-2 mb-2">
                  {formData.organic && <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded-full">Organic</span>}
                  {formData.fairTrade && <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-1 rounded-full">Fair Trade</span>}
                </div>
                <h3 className="text-xl font-black text-gray-900 truncate">
                  {formData.name || 'Product Title'}
                </h3>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-agriGreen font-black text-lg">
                    ETB {formData.pricePerUnit || '0.00'}
                  </span>
                  {formData.originalPrice && (
                    <span className="text-gray-400 text-sm line-through">
                      ETB {formData.originalPrice}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 text-gray-400 text-xs font-bold mt-4 uppercase tracking-wider">
                  <MapPin className="w-3 h-3" />
                  {formData.location || 'Location'}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Tips */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-4"
          >
            <div className="flex items-start gap-3 p-4 bg-green-50 rounded-2xl border border-green-100">
              <TrendingUp className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
              <p className="text-xs text-green-700 font-medium leading-relaxed">
                Products with multiple images get <span className="font-bold">3x more views</span> and higher conversion rates.
              </p>
            </div>
            
            <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-2xl border border-blue-100">
              <Shield className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
              <p className="text-xs text-blue-700 font-medium leading-relaxed">
                Organic and Fair Trade certifications increase buyer trust and allow premium pricing.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default CropManagement;
