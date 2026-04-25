import React, { useState } from 'react';
import { 
  Calendar, 
  Clock, 
  User, 
  Search, 
  Filter, 
  ArrowRight, 
  Share2, 
  Bookmark,
  Tag,
  TrendingUp,
  Leaf,
  Sprout,
  Sun
} from 'lucide-react';
import { motion } from 'framer-motion';

const Blog = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const categories = [
    { id: 'all', name: 'All Articles', icon: TrendingUp },
    { id: 'farming', name: 'Farming Tips', icon: Sprout },
    { id: 'market', name: 'Market News', icon: TrendingUp },
    { id: 'technology', name: 'Technology', icon: Sun },
    { id: 'sustainability', name: 'Sustainability', icon: Leaf }
  ];

  const blogPosts = [
    {
      id: 1,
      title: 'Best Practices for Coffee Farming in East Hararghe',
      excerpt: 'Learn the essential techniques for growing premium coffee beans in the Harar region, from soil preparation to harvest timing.',
      category: 'farming',
      author: 'Dr. Abebe Kebede',
      date: '2026-04-20',
      readTime: '8 min read',
      image: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=800',
      featured: true,
      tags: ['Coffee', 'Farming', 'Harar']
    },
    {
      id: 2,
      title: 'Market Trends: Teff Prices Expected to Rise',
      excerpt: 'Analysis of current market conditions suggests a significant increase in teff prices over the coming months due to high demand.',
      category: 'market',
      author: 'Fatuma Ahmed',
      date: '2026-04-18',
      readTime: '5 min read',
      image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=800',
      featured: true,
      tags: ['Teff', 'Market', 'Prices']
    },
    {
      id: 3,
      title: 'Sustainable Farming: A Guide for Ethiopian Farmers',
      excerpt: 'Discover eco-friendly farming practices that improve yield while protecting the environment for future generations.',
      category: 'sustainability',
      author: 'Kedir Jemal',
      date: '2026-04-15',
      readTime: '10 min read',
      image: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=800',
      featured: false,
      tags: ['Sustainability', 'Environment', 'Organic']
    },
    {
      id: 4,
      title: 'Digital Tools for Modern Agriculture',
      excerpt: 'How mobile apps and AI-powered tools are revolutionizing farming practices across Ethiopia.',
      category: 'technology',
      author: 'Zeyneb Ahmed',
      date: '2026-04-12',
      readTime: '6 min read',
      image: 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=800',
      featured: false,
      tags: ['Technology', 'AI', 'Mobile Apps']
    },
    {
      id: 5,
      title: 'Khat Farming: Traditional Methods Meet Modern Demand',
      excerpt: 'Exploring how traditional khat cultivation is adapting to meet modern market demands while maintaining quality.',
      category: 'farming',
      author: 'Mohammed Ali',
      date: '2026-04-10',
      readTime: '7 min read',
      image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800',
      featured: false,
      tags: ['Khat', 'Farming', 'Traditional']
    },
    {
      id: 6,
      title: 'Organic Certification: Benefits and Process',
      excerpt: 'A comprehensive guide to obtaining organic certification for your agricultural products in Ethiopia.',
      category: 'sustainability',
      author: 'Chaltu Tadesse',
      date: '2026-04-08',
      readTime: '9 min read',
      image: 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=800',
      featured: false,
      tags: ['Organic', 'Certification', 'Quality']
    }
  ];

  const filteredPosts = blogPosts.filter(post => {
    const matchesCategory = selectedCategory === 'all' || post.category === selectedCategory;
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         post.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const featuredPosts = blogPosts.filter(post => post.featured);
  const regularPosts = filteredPosts.filter(post => !post.featured);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header */}
      <div className="bg-agriGreen text-white py-20">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl font-black mb-4"
          >
            Agricultural News & Insights
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-agriLight"
          >
            Stay updated with the latest farming techniques, market trends, and agricultural innovations
          </motion.p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-16">
        {/* Search and Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8 flex flex-col md:flex-row gap-4"
        >
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search articles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-gray-200 rounded-2xl py-4 pl-12 pr-4 outline-none focus:ring-4 focus:ring-agriGreen/10 font-medium shadow-sm"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-white border border-gray-200 rounded-2xl px-6 py-4 outline-none focus:ring-4 focus:ring-agriGreen/10 font-bold cursor-pointer shadow-sm"
            >
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>
        </motion.div>

        {/* Category Pills */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex flex-wrap gap-3 mb-12"
        >
          {categories.map((category) => {
            const Icon = category.icon;
            return (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold transition-all ${
                  selectedCategory === category.id
                    ? 'bg-agriGreen text-white shadow-lg'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                <Icon className="w-5 h-5" />
                {category.name}
              </button>
            );
          })}
        </motion.div>

        {/* Featured Posts */}
        {featuredPosts.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mb-16"
          >
            <h2 className="text-2xl font-black text-gray-900 mb-6 flex items-center gap-3">
              <TrendingUp className="w-6 h-6 text-agriGreen" />
              Featured Articles
            </h2>
            <div className="grid md:grid-cols-2 gap-8">
              {featuredPosts.map((post, index) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                  className="bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow border border-gray-100 group cursor-pointer"
                >
                  <div className="relative h-64 overflow-hidden">
                    <img
                      src={post.image}
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-4 left-4">
                      <span className="bg-agriGreen text-white text-xs font-bold px-4 py-2 rounded-full">
                        Featured
                      </span>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="flex items-center gap-4 mb-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        {post.author}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {new Date(post.date).toLocaleDateString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {post.readTime}
                      </span>
                    </div>
                    <h3 className="text-xl font-black text-gray-900 mb-3 group-hover:text-agriGreen transition-colors">
                      {post.title}
                    </h3>
                    <p className="text-gray-600 mb-4 line-clamp-2">{post.excerpt}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex gap-2">
                        {post.tags.slice(0, 2).map((tag, idx) => (
                          <span key={idx} className="text-xs font-bold text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                            {tag}
                          </span>
                        ))}
                      </div>
                      <ArrowRight className="w-5 h-5 text-agriGreen group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Regular Posts */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <h2 className="text-2xl font-black text-gray-900 mb-6">Latest Articles</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {regularPosts.map((post, index) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 + index * 0.1 }}
                className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow border border-gray-100 group cursor-pointer"
              >
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={post.image}
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-3 mb-3 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(post.date).toLocaleDateString()}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {post.readTime}
                    </span>
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2 group-hover:text-agriGreen transition-colors line-clamp-2">
                    {post.title}
                  </h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">{post.excerpt}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex gap-2">
                      {post.tags.slice(0, 2).map((tag, idx) => (
                        <span key={idx} className="text-[10px] font-bold text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                          {tag}
                        </span>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <button className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                        <Bookmark className="w-4 h-4 text-gray-400" />
                      </button>
                      <button className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                        <Share2 className="w-4 h-4 text-gray-400" />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Newsletter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mt-16 bg-gradient-to-r from-agriGreen to-green-600 rounded-3xl p-12 text-white text-center"
        >
          <h2 className="text-3xl font-black mb-4">Stay Updated</h2>
          <p className="text-agriLight mb-8 max-w-2xl mx-auto">
            Subscribe to our newsletter for the latest agricultural news, farming tips, and market insights delivered to your inbox.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 bg-white/20 backdrop-blur-md border border-white/30 rounded-2xl py-4 px-6 outline-none focus:ring-4 focus:ring-white/30 font-medium placeholder-white/70 text-white"
            />
            <button className="bg-white text-agriGreen font-bold py-4 px-8 rounded-2xl hover:bg-gray-100 transition-colors">
              Subscribe
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Blog;
