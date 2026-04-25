import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Filter, 
  SlidersHorizontal, 
  Grid, 
  List, 
  ShoppingCart, 
  Heart, 
  Star, 
  MapPin, 
  TrendingUp,
  ChevronDown,
  X,
  Loader2,
  Package,
  DollarSign,
  Calendar,
  Truck,
  Shield,
  Zap
} from 'lucide-react';

const Products = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [priceRange, setPriceRange] = useState([0, 10000]);
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [sortBy, setSortBy] = useState('popular');
  const [viewMode, setViewMode] = useState('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);

  const categories = [
    { id: 'all', name: 'All Products', icon: '🌾' },
    { id: 'coffee', name: 'Coffee', icon: '☕' },
    { id: 'khat', name: 'Khat', icon: '🌿' },
    { id: 'grains', name: 'Grains', icon: '🌾' },
    { id: 'vegetables', name: 'Vegetables', icon: '🥬' },
    { id: 'fruits', name: 'Fruits', icon: '🍎' },
    { id: 'livestock', name: 'Livestock', icon: '🐄' },
    { id: 'spices', name: 'Spices', icon: '🌶️' }
  ];

  const locations = [
    { id: 'all', name: 'All Locations' },
    { id: 'harar', name: 'Harar' },
    { id: 'dire_dawa', name: 'Dire Dawa' },
    { id: 'haramaya', name: 'Haramaya' },
    { id: 'chiro', name: 'Chiro' },
    { id: 'bedesa', name: 'Bedesa' }
  ];

  const sortOptions = [
    { id: 'popular', name: 'Most Popular' },
    { id: 'price_low', name: 'Price: Low to High' },
    { id: 'price_high', name: 'Price: High to Low' },
    { id: 'newest', name: 'Newest First' },
    { id: 'rating', name: 'Highest Rated' }
  ];

  // Sample product data
  const sampleProducts = [
    {
      id: 1,
      name: 'Premium Ethiopian Coffee',
      category: 'coffee',
      price: 4500,
      originalPrice: 5200,
      rating: 4.8,
      reviews: 124,
      location: 'Harar',
      farmer: 'Abebe Kebede',
      image: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=400',
      badge: 'Best Seller',
      organic: true,
      featured: true,
      harvestDate: '2026-04-01'
    },
    {
      id: 2,
      name: 'Organic Teff White',
      category: 'grains',
      price: 3200,
      originalPrice: 3800,
      rating: 4.9,
      reviews: 89,
      location: 'East Hararghe',
      farmer: 'Fatuma Ahmed',
      image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400',
      badge: 'Organic',
      organic: true,
      featured: false,
      harvestDate: '2026-03-28'
    },
    {
      id: 3,
      name: 'Fresh Khat Premium',
      category: 'khat',
      price: 2800,
      originalPrice: 3200,
      rating: 4.7,
      reviews: 156,
      location: 'Dire Dawa',
      farmer: 'Kedir Jemal',
      image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400',
      badge: 'Fresh',
      organic: false,
      featured: true,
      harvestDate: '2026-04-05'
    },
    {
      id: 4,
      name: 'Organic Vegetables Bundle',
      category: 'vegetables',
      price: 850,
      originalPrice: 1000,
      rating: 4.6,
      reviews: 67,
      location: 'Haramaya',
      farmer: 'Chaltu Tadesse',
      image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400',
      badge: 'Fresh',
      organic: true,
      featured: false,
      harvestDate: '2026-04-06'
    },
    {
      id: 5,
      name: 'Premium Arabica Coffee',
      category: 'coffee',
      price: 5200,
      originalPrice: 6000,
      rating: 4.9,
      reviews: 201,
      location: 'Harar',
      farmer: 'Mohammed Ali',
      image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=400',
      badge: 'Premium',
      organic: true,
      featured: true,
      harvestDate: '2026-04-02'
    },
    {
      id: 6,
      name: 'Fresh Mangoes',
      category: 'fruits',
      price: 1200,
      originalPrice: 1500,
      rating: 4.5,
      reviews: 45,
      location: 'Dire Dawa',
      farmer: 'Aisha Omar',
      image: 'https://images.unsplash.com/photo-1553279768-865429fa0078?w=400',
      badge: 'Seasonal',
      organic: false,
      featured: false,
      harvestDate: '2026-04-07'
    },
    {
      id: 7,
      name: 'Berbere Spice Mix',
      category: 'spices',
      price: 450,
      originalPrice: 550,
      rating: 4.8,
      reviews: 78,
      location: 'Harar',
      farmer: 'Zeyneb Ahmed',
      image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=400',
      badge: 'Traditional',
      organic: true,
      featured: false,
      harvestDate: '2026-03-25'
    },
    {
      id: 8,
      name: 'Organic Honey',
      category: 'livestock',
      price: 1800,
      originalPrice: 2200,
      rating: 4.7,
      reviews: 92,
      location: 'Chiro',
      farmer: 'Hussein Mussa',
      image: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=400',
      badge: 'Pure',
      organic: true,
      featured: true,
      harvestDate: '2026-03-30'
    }
  ];

  useEffect(() => {
    setProducts(sampleProducts);
    setFilteredProducts(sampleProducts);
  }, []);

  useEffect(() => {
    let filtered = [...products];

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(p => p.category === selectedCategory);
    }

    // Filter by location
    if (selectedLocation !== 'all') {
      filtered = filtered.filter(p => p.location.toLowerCase().includes(selectedLocation.toLowerCase()));
    }

    // Filter by price range
    filtered = filtered.filter(p => p.price >= priceRange[0] && p.price <= priceRange[1]);

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(query) ||
        p.category.toLowerCase().includes(query) ||
        p.location.toLowerCase().includes(query) ||
        p.farmer.toLowerCase().includes(query)
      );
    }

    // Sort products
    switch (sortBy) {
      case 'price_low':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price_high':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'newest':
        filtered.sort((a, b) => new Date(b.harvestDate) - new Date(a.harvestDate));
        break;
      case 'rating':
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      default:
        // Popular - sort by reviews and rating
        filtered.sort((a, b) => (b.reviews * b.rating) - (a.reviews * a.rating));
    }

    setFilteredProducts(filtered);
  }, [products, selectedCategory, selectedLocation, priceRange, searchQuery, sortBy]);

  const clearFilters = () => {
    setSelectedCategory('all');
    setSelectedLocation('all');
    setPriceRange([0, 10000]);
    setSearchQuery('');
    setSortBy('popular');
  };

  const activeFiltersCount = (
    (selectedCategory !== 'all' ? 1 : 0) +
    (selectedLocation !== 'all' ? 1 : 0) +
    (priceRange[0] !== 0 || priceRange[1] !== 10000 ? 1 : 0) +
    (searchQuery ? 1 : 0)
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex flex-col lg:flex-row items-center gap-4">
            {/* Search Bar */}
            <div className="flex-1 w-full">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search products, farmers, locations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-3 pl-12 pr-4 outline-none focus:ring-4 focus:ring-agriGreen/10 focus:border-agriGreen transition-all font-medium"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>

            {/* Filter Controls */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 px-4 py-3 rounded-xl font-bold transition-all ${
                  showFilters || activeFiltersCount > 0
                    ? 'bg-agriGreen text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <SlidersHorizontal className="w-5 h-5" />
                Filters
                {activeFiltersCount > 0 && (
                  <span className="bg-white/20 px-2 py-0.5 rounded-full text-xs">
                    {activeFiltersCount}
                  </span>
                )}
              </button>

              <div className="flex items-center bg-gray-100 rounded-xl p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg transition-all ${
                    viewMode === 'grid' ? 'bg-white text-agriGreen shadow-sm' : 'text-gray-500'
                  }`}
                >
                  <Grid className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg transition-all ${
                    viewMode === 'list' ? 'bg-white text-agriGreen shadow-sm' : 'text-gray-500'
                  }`}
                >
                  <List className="w-5 h-5" />
                </button>
              </div>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-gray-100 border-0 rounded-xl px-4 py-3 font-bold text-gray-700 outline-none focus:ring-2 focus:ring-agriGreen/10 cursor-pointer"
              >
                {sortOptions.map(option => (
                  <option key={option.id} value={option.id}>{option.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-white border-b border-gray-100 overflow-hidden"
          >
            <div className="max-w-7xl mx-auto px-4 py-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Category Filter */}
                <div>
                  <label className="text-sm font-bold text-gray-700 mb-2 block">Category</label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 font-medium outline-none focus:ring-2 focus:ring-agriGreen/10 cursor-pointer"
                  >
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.icon} {cat.name}</option>
                    ))}
                  </select>
                </div>

                {/* Location Filter */}
                <div>
                  <label className="text-sm font-bold text-gray-700 mb-2 block">Location</label>
                  <select
                    value={selectedLocation}
                    onChange={(e) => setSelectedLocation(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 font-medium outline-none focus:ring-2 focus:ring-agriGreen/10 cursor-pointer"
                  >
                    {locations.map(loc => (
                      <option key={loc.id} value={loc.id}>{loc.name}</option>
                    ))}
                  </select>
                </div>

                {/* Price Range */}
                <div>
                  <label className="text-sm font-bold text-gray-700 mb-2 block">Price Range (ETB)</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={priceRange[0]}
                      onChange={(e) => setPriceRange([parseInt(e.target.value), priceRange[1]])}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 font-medium outline-none focus:ring-2 focus:ring-agriGreen/10"
                      placeholder="Min"
                    />
                    <span className="text-gray-400">-</span>
                    <input
                      type="number"
                      value={priceRange[1]}
                      onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 font-medium outline-none focus:ring-2 focus:ring-agriGreen/10"
                      placeholder="Max"
                    />
                  </div>
                </div>

                {/* Clear Filters */}
                <div className="flex items-end">
                  <button
                    onClick={clearFilters}
                    className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold px-4 py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
                  >
                    <X className="w-4 h-4" />
                    Clear All
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <p className="text-gray-600 font-medium">
            Showing <span className="font-bold text-gray-900">{filteredProducts.length}</span> products
          </p>
          
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 bg-green-50 px-3 py-1.5 rounded-full border border-green-100">
              <Zap className="w-4 h-4 text-green-600" />
              <span className="text-xs font-bold text-green-700">AI-Powered Search</span>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-agriGreen" />
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-20">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">No products found</h3>
            <p className="text-gray-500 mb-6">Try adjusting your filters or search terms</p>
            <button
              onClick={clearFilters}
              className="btn-primary px-6 py-3 rounded-xl font-bold"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div className={viewMode === 'grid' 
            ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
            : 'space-y-4'
          }>
            {filteredProducts.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`group bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-300 cursor-pointer ${
                  viewMode === 'list' ? 'flex' : ''
                }`}
              >
                <div className={`relative ${viewMode === 'list' ? 'w-48 h-48 flex-shrink-0' : 'h-48'}`}>
                  <img 
                    src={product.image} 
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute top-4 left-4">
                    <span className="bg-agriGreen text-white text-xs font-bold px-3 py-1 rounded-full">
                      {product.badge}
                    </span>
                  </div>
                  {product.featured && (
                    <div className="absolute top-4 right-4">
                      <span className="bg-amber-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                        Featured
                      </span>
                    </div>
                  )}
                  <button className="absolute bottom-4 right-4 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg hover:bg-red-50 transition-colors">
                    <Heart className="w-5 h-5 text-gray-400 hover:text-red-500" />
                  </button>
                </div>
                
                <div className={`p-6 ${viewMode === 'list' ? 'flex-1' : ''}`}>
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-500">{product.location}</span>
                  </div>
                  
                  <h3 className="font-bold text-gray-900 mb-2 group-hover:text-agriGreen transition-colors">
                    {product.name}
                  </h3>
                  
                  <div className="flex items-center gap-1 mb-3">
                    <Star className="w-4 h-4 text-amber-400 fill-current" />
                    <span className="text-sm font-semibold text-gray-700">{product.rating}</span>
                    <span className="text-sm text-gray-400">({product.reviews})</span>
                  </div>
                  
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <span className="text-2xl font-black text-agriGreen">ETB {product.price.toLocaleString()}</span>
                      <span className="text-sm text-gray-400 line-through ml-2">ETB {product.originalPrice.toLocaleString()}</span>
                    </div>
                  </div>
                  
                  <button className="w-full bg-agriDark text-white py-3 rounded-xl font-bold hover:bg-agriGreen transition-colors flex items-center justify-center gap-2">
                    <ShoppingCart className="w-5 h-5" />
                    Add to Cart
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Products;
