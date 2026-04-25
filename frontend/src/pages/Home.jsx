import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Leaf, 
  Users, 
  LineChart, 
  ShieldCheck, 
  ArrowRight,
  ChevronRight,
  Globe,
  Zap,
  Star,
  ShoppingCart,
  Truck,
  Headphones,
  Package,
  TrendingUp,
  Award,
  Clock,
  MapPin,
  Phone,
  Mail,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Search,
  Menu,
  X,
  Heart,
  Filter
} from 'lucide-react';

const FeatureCard = ({ icon: Icon, title, description, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay }}
    viewport={{ once: true }}
    className="p-8 rounded-[2.5rem] bg-white border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300 group"
  >
    <div className="w-14 h-14 rounded-2xl bg-agriGreen/10 flex items-center justify-center text-agriGreen mb-6 group-hover:scale-110 transition-transform">
      <Icon className="w-7 h-7" />
    </div>
    <h3 className="text-xl font-bold text-gray-900 mb-3">{title}</h3>
    <p className="text-gray-600 leading-relaxed">{description}</p>
  </motion.div>
);

const Home = () => {
  const [cartCount, setCartCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Sample product data
  const featuredProducts = [
    {
      id: 1,
      name: 'Premium Ethiopian Coffee',
      category: 'Coffee',
      price: 4500,
      originalPrice: 5200,
      rating: 4.8,
      reviews: 124,
      image: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=400',
      location: 'Harar',
      farmer: 'Abebe Kebede',
      badge: 'Best Seller'
    },
    {
      id: 2,
      name: 'Organic Teff White',
      category: 'Grains',
      price: 3200,
      originalPrice: 3800,
      rating: 4.9,
      reviews: 89,
      image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400',
      location: 'East Hararghe',
      farmer: 'Fatuma Ahmed',
      badge: 'Organic'
    },
    {
      id: 3,
      name: 'Fresh Khat Premium',
      category: 'Khat',
      price: 2800,
      originalPrice: 3200,
      rating: 4.7,
      reviews: 156,
      image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400',
      location: 'Dire Dawa',
      farmer: 'Kedir Jemal',
      badge: 'Fresh'
    },
    {
      id: 4,
      name: 'Organic Vegetables Bundle',
      category: 'Vegetables',
      price: 850,
      originalPrice: 1000,
      rating: 4.6,
      reviews: 67,
      image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400',
      location: 'Haramaya',
      farmer: 'Chaltu Tadesse',
      badge: 'Fresh'
    }
  ];

  const categories = [
    { name: 'Coffee', icon: '☕', count: 245, color: 'from-amber-500 to-orange-600' },
    { name: 'Khat', icon: '🌿', count: 189, color: 'from-green-500 to-emerald-600' },
    { name: 'Grains', icon: '🌾', count: 312, color: 'from-yellow-500 to-amber-600' },
    { name: 'Vegetables', icon: '🥬', count: 156, color: 'from-green-400 to-teal-600' },
    { name: 'Fruits', icon: '🍎', count: 98, color: 'from-red-500 to-pink-600' },
    { name: 'Livestock', icon: '🐄', count: 67, color: 'from-orange-500 to-red-600' }
  ];

  const testimonials = [
    {
      name: 'Abebe Kebede',
      role: 'Coffee Farmer',
      location: 'Harar',
      rating: 5,
      text: 'AgriLink transformed my business. I now sell directly to buyers and get 40% better prices for my coffee.',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100'
    },
    {
      name: 'Fatuma Ahmed',
      role: 'Grain Trader',
      location: 'Dire Dawa',
      rating: 5,
      text: 'The platform is amazing. I can find quality products from verified farmers and track my orders in real-time.',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100'
    },
    {
      name: 'Kedir Jemal',
      role: 'Khat Farmer',
      location: 'East Hararghe',
      rating: 5,
      text: 'Finally, a platform that understands Ethiopian agriculture. The AI assistant helps me with pricing and market insights.',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100'
    }
  ];

  const newsItems = [
    {
      title: 'Coffee Prices Reach Record High in East Hararghe',
      excerpt: 'Ethiopian coffee exports surge as international demand increases...',
      date: 'April 15, 2026',
      category: 'Market News',
      image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400'
    },
    {
      title: 'New Agricultural Technologies Transforming Farming',
      excerpt: 'Modern farming techniques and AI-powered tools are revolutionizing...',
      date: 'April 12, 2026',
      category: 'Technology',
      image: 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=400'
    },
    {
      title: 'Government Announces Support for Local Farmers',
      excerpt: 'New initiatives to support small-scale farmers with subsidies...',
      date: 'April 10, 2026',
      category: 'Policy',
      image: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=400'
    }
  ];

  return (
    <div className="overflow-hidden">
      {/* Hero Section */}
      <section className="relative pt-20 pb-32 lg:pt-32 lg:pb-48">
        <div className="absolute inset-0 -z-10 hero-pattern opacity-40" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-green-100/40 via-transparent to-transparent" />
        
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-50 border border-green-100 text-agriGreen text-sm font-bold mb-8"
            >
              <Zap className="w-4 h-4" />
              <span>The Future of Ethiopian Agriculture</span>
            </motion.div>
            
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-6xl lg:text-7xl font-black text-gray-900 leading-[1.1] tracking-tighter mb-8"
            >
              Connecting <span className="text-agriGreen">Farmers</span> with <span className="text-amber-600">Innovation</span>
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-xl text-gray-600 mb-12 leading-relaxed max-w-2xl mx-auto"
            >
              Empowering East Hararghe's agricultural landscape through a revolutionary platform for farmers, students, and buyers.
            </motion.p>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <Link to="/register" className="btn-primary px-10 py-4 text-lg w-full sm:w-auto">
                Get Started Now
                <ArrowRight className="w-5 h-5" />
              </Link>
              <a href="#about" className="px-10 py-4 text-lg font-bold text-gray-600 hover:text-agriGreen transition-colors flex items-center gap-2">
                Learn More
                <ChevronRight className="w-5 h-5" />
              </a>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-agriDark text-white rounded-[4rem] mx-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />
        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-12 text-center">
            {[
              { label: 'Active Farmers', value: '2,500+' },
              { label: 'Student Experts', value: '450+' },
              { label: 'Tons Produced', value: '15.2k' },
              { label: 'Happy Buyers', value: '1,200+' },
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.5 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                viewport={{ once: true }}
              >
                <div className="text-4xl lg:text-5xl font-black mb-2">{stat.value}</div>
                <div className="text-agriLight/80 font-bold uppercase tracking-wider text-sm">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-32">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col lg:flex-row items-end justify-between mb-20 gap-8 text-center lg:text-left">
            <div className="max-w-2xl mx-auto lg:mx-0">
              <h2 className="text-4xl lg:text-5xl font-black text-gray-900 mb-6 tracking-tight">
                Designed for the <span className="text-agriGreen">Modern Ecosystem</span>
              </h2>
              <p className="text-lg text-gray-600">
                A comprehensive suite of tools built specifically for the needs of the East Hararghe agricultural community.
              </p>
            </div>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard 
              icon={Globe}
              title="Market Access"
              description="Direct connection between local farmers and bulk buyers, ensuring fair pricing and reduced waste."
              delay={0.1}
            />
            <FeatureCard 
              icon={Users}
              title="Expert Guidance"
              description="Connect with agriculture students and experts for real-time advice and modern farming techniques."
              delay={0.2}
            />
            <FeatureCard 
              icon={LineChart}
              title="Yield Analytics"
              description="Track your crop performance and market trends with advanced data visualization tools."
              delay={0.3}
            />
          </div>
        </div>
      </section>

      {/* Product Categories Section */}
      <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-black text-gray-900 mb-4 tracking-tight">
              Browse by <span className="text-agriGreen">Category</span>
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Explore our wide range of agricultural products from trusted farmers across East Hararghe
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {categories.map((category, index) => (
              <motion.div
                key={category.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="group cursor-pointer"
              >
                <div className={`bg-gradient-to-br ${category.color} rounded-3xl p-6 text-center hover:shadow-2xl hover:-translate-y-2 transition-all duration-300`}>
                  <div className="text-5xl mb-4">{category.icon}</div>
                  <h3 className="text-white font-bold text-lg mb-2">{category.name}</h3>
                  <p className="text-white/80 text-sm">{category.count} Products</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col lg:flex-row items-end justify-between mb-16 gap-8">
            <div>
              <h2 className="text-4xl lg:text-5xl font-black text-gray-900 mb-4 tracking-tight">
                Featured <span className="text-agriGreen">Products</span>
              </h2>
              <p className="text-lg text-gray-600">
                Premium quality products from our verified farmers
              </p>
            </div>
            <Link to="/products" className="flex items-center gap-2 text-agriGreen font-bold hover:gap-4 transition-all">
              View All Products <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {featuredProducts.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="group bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-300 cursor-pointer"
              >
                <div className="relative">
                  <img 
                    src={product.image} 
                    alt={product.name}
                    className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute top-4 left-4">
                    <span className="bg-agriGreen text-white text-xs font-bold px-3 py-1 rounded-full">
                      {product.badge}
                    </span>
                  </div>
                  <button className="absolute top-4 right-4 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg hover:bg-red-50 transition-colors">
                    <Heart className="w-5 h-5 text-gray-400 hover:text-red-500" />
                  </button>
                </div>
                
                <div className="p-6">
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
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-gradient-to-b from-agriDark to-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-black mb-4 tracking-tight">
              What Our <span className="text-agriGreen">Users Say</span>
            </h2>
            <p className="text-lg text-gray-300 max-w-2xl mx-auto">
              Hear from farmers and buyers who have transformed their businesses with AgriLink
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20"
              >
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-amber-400 fill-current" />
                  ))}
                </div>
                
                <p className="text-gray-200 mb-6 leading-relaxed">
                  "{testimonial.text}"
                </p>
                
                <div className="flex items-center gap-4">
                  <img 
                    src={testimonial.avatar} 
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <h4 className="font-bold text-white">{testimonial.name}</h4>
                    <p className="text-sm text-gray-400">{testimonial.role} · {testimonial.location}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* News Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col lg:flex-row items-end justify-between mb-16 gap-8">
            <div>
              <h2 className="text-4xl lg:text-5xl font-black text-gray-900 mb-4 tracking-tight">
                Agricultural <span className="text-agriGreen">News</span>
              </h2>
              <p className="text-lg text-gray-600">
                Stay updated with the latest market trends and agricultural insights
              </p>
            </div>
            <Link to="/news" className="flex items-center gap-2 text-agriGreen font-bold hover:gap-4 transition-all">
              View All News <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {newsItems.map((news, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="group cursor-pointer"
              >
                <div className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-300">
                  <div className="relative">
                    <img 
                      src={news.image} 
                      alt={news.title}
                      className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute top-4 left-4">
                      <span className="bg-agriGreen text-white text-xs font-bold px-3 py-1 rounded-full">
                        {news.category}
                      </span>
                    </div>
                  </div>
                  
                  <div className="p-6">
                    <div className="flex items-center gap-2 mb-3">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-500">{news.date}</span>
                    </div>
                    
                    <h3 className="font-bold text-gray-900 mb-2 group-hover:text-agriGreen transition-colors">
                      {news.title}
                    </h3>
                    
                    <p className="text-gray-600 text-sm mb-4">
                      {news.excerpt}
                    </p>
                    
                    <div className="flex items-center gap-2 text-agriGreen font-bold text-sm">
                      Read More <ChevronRight className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-6xl mx-auto bg-amber-500 rounded-[3rem] p-12 lg:p-20 relative overflow-hidden flex flex-col lg:flex-row items-center justify-between gap-12"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-amber-400 rounded-full blur-3xl opacity-50 -mr-20 -mt-20" />
          <div className="relative z-10 text-center lg:text-left">
            <h2 className="text-4xl lg:text-6xl font-black text-white mb-6 leading-tight">
              Ready to Transform <br /> Your Harvest?
            </h2>
            <p className="text-amber-50 text-xl font-medium max-w-xl">
              Join thousands of farmers and buyers already using AgriLink to grow their business and the community.
            </p>
          </div>
          <div className="relative z-10 flex flex-col sm:flex-row gap-4">
            <Link to="/register" className="bg-white text-amber-600 px-10 py-5 rounded-2xl font-black text-lg hover:bg-gray-50 transition-colors shadow-xl shadow-amber-900/20 text-center">
              Join the Movement
            </Link>
          </div>
        </motion.div>
      </section>
    </div>
  );
};

export default Home;
