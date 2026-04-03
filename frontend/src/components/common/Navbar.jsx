import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Menu, 
  X, 
  Leaf, 
  User, 
  LogOut, 
  Bell,
  Search
} from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const Navbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  return (
    <nav className="h-20 bg-white border-b border-gray-100 px-8 flex items-center justify-between sticky top-0 z-30 shadow-sm">
      {/* Search Bar */}
      <div className="hidden md:flex flex-1 max-w-md relative group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-agriGreen transition-colors w-4 h-4" />
        <input 
          type="text" 
          placeholder="Search products, orders, or contacts..." 
          className="w-full pl-12 pr-4 py-2.5 bg-gray-50 border-0 rounded-2xl text-sm font-medium focus:ring-4 focus:ring-agriGreen/10 transition-all outline-none"
        />
      </div>

      {/* Actions */}
      <div className="flex items-center gap-6">
        {/* Notifications */}
        <div className="relative">
          <button 
            onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
            className="p-2.5 text-gray-400 hover:text-agriGreen hover:bg-agriGreen/5 rounded-xl transition-all relative"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-amber-500 rounded-full border-2 border-white" />
          </button>
          
          <AnimatePresence>
            {isNotificationsOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute right-0 mt-4 w-80 bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden"
              >
                <div className="p-5 border-b border-gray-50 flex justify-between items-center">
                  <h3 className="font-black text-gray-900 uppercase tracking-widest text-[10px]">Notifications</h3>
                  <button className="text-[10px] font-black text-agriGreen hover:underline">Mark all read</button>
                </div>
                <div className="max-h-96 overflow-y-auto p-2">
                  <div className="p-4 hover:bg-gray-50 rounded-2xl transition-colors cursor-pointer group">
                    <p className="text-xs font-bold text-gray-900 mb-1 group-hover:text-agriGreen transition-colors">New order received!</p>
                    <p className="text-[10px] text-gray-500">You have a new request for 50kg Tomatoes.</p>
                    <p className="text-[9px] text-gray-400 mt-2">2 mins ago</p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="h-8 w-px bg-gray-100 mx-2" />

        {/* User Profile */}
        <div className="flex items-center gap-4 bg-gray-50 p-1.5 pr-4 rounded-2xl border border-gray-100 hover:border-agriGreen/30 transition-all cursor-pointer group">
          <div className="w-10 h-10 rounded-xl bg-agriGreen/10 flex items-center justify-center text-agriGreen font-black text-lg group-hover:bg-agriGreen group-hover:text-white transition-all">
            {user?.name?.[0] || 'U'}
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-black text-gray-900 leading-none">{user?.name}</span>
            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-tighter mt-1">{user?.role}</span>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
