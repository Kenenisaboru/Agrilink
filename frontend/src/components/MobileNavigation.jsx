import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  Package, 
  ShoppingCart, 
  User, 
  Menu, 
  X, 
  Search,
  Bell,
  Heart,
  Settings,
  LogOut,
  ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const MobileNavigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [cartCount, setCartCount] = useState(3);
  const [notificationCount, setNotificationCount] = useState(5);
  const location = useLocation();

  // Close menu when route changes
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const menuItems = [
    { icon: Home, label: 'Home', path: '/' },
    { icon: Package, label: 'Products', path: '/products' },
    { icon: ShoppingCart, label: 'Cart', path: '/cart', badge: cartCount },
    { icon: User, label: 'Profile', path: '/dashboard' },
    { icon: Settings, label: 'Settings', path: '/settings' },
  ];

  const secondaryItems = [
    { icon: Heart, label: 'Wishlist', path: '/wishlist' },
    { icon: Bell, label: 'Notifications', path: '/notifications', badge: notificationCount },
    { icon: Search, label: 'Search', path: '/search' },
  ];

  return (
    <>
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 bg-white border-b border-gray-100 z-50 safe-top">
        <div className="flex items-center justify-between px-4 py-3">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-agriGreen rounded-xl flex items-center justify-center">
              <span className="text-white font-black text-lg">A</span>
            </div>
            <span className="font-black text-gray-900 text-lg">AgriLink</span>
          </Link>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <Link to="/cart" className="relative p-2 hover:bg-gray-100 rounded-xl transition-colors">
              <ShoppingCart className="w-6 h-6 text-gray-700" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-agriGreen text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
              aria-label="Toggle menu"
            >
              {isOpen ? <X className="w-6 h-6 text-gray-700" /> : <Menu className="w-6 h-6 text-gray-700" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-50 lg:hidden"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 bottom-0 w-80 max-w-full bg-white z-50 lg:hidden overflow-y-auto"
            >
              {/* Menu Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-100">
                <h2 className="text-xl font-black text-gray-900">Menu</h2>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
                >
                  <X className="w-6 h-6 text-gray-700" />
                </button>
              </div>

              {/* User Profile Section */}
              <div className="p-4 bg-gradient-to-r from-agriGreen to-green-600 text-white">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="font-bold">Welcome Back</p>
                    <p className="text-sm opacity-90">user@email.com</p>
                  </div>
                </div>
              </div>

              {/* Main Menu Items */}
              <div className="p-4">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Main</p>
                <div className="space-y-1">
                  {menuItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.path;
                    return (
                      <Link
                        key={item.path}
                        to={item.path}
                        className={`flex items-center justify-between p-4 rounded-2xl transition-colors ${
                          isActive ? 'bg-agriGreen text-white' : 'hover:bg-gray-100 text-gray-700'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Icon className="w-5 h-5" />
                          <span className="font-bold">{item.label}</span>
                        </div>
                        {item.badge && (
                          <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                            {item.badge}
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </div>
              </div>

              {/* Secondary Menu Items */}
              <div className="p-4 border-t border-gray-100">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">More</p>
                <div className="space-y-1">
                  {secondaryItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.path}
                        to={item.path}
                        className="flex items-center justify-between p-4 rounded-2xl hover:bg-gray-100 text-gray-700 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <Icon className="w-5 h-5" />
                          <span className="font-bold">{item.label}</span>
                        </div>
                        {item.badge && (
                          <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                            {item.badge}
                          </span>
                        )}
                        <ChevronRight className="w-5 h-5 text-gray-400" />
                      </Link>
                    );
                  })}
                </div>
              </div>

              {/* Logout */}
              <div className="p-4 border-t border-gray-100">
                <button className="flex items-center gap-3 p-4 rounded-2xl hover:bg-red-50 text-red-600 transition-colors w-full">
                  <LogOut className="w-5 h-5" />
                  <span className="font-bold">Logout</span>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Bottom Navigation Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 z-40 safe-bottom">
        <div className="flex items-center justify-around py-2">
          {[
            { icon: Home, label: 'Home', path: '/' },
            { icon: Package, label: 'Products', path: '/products' },
            { icon: ShoppingCart, label: 'Cart', path: '/cart', badge: cartCount },
            { icon: User, label: 'Profile', path: '/dashboard' },
          ].map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className="flex flex-col items-center gap-1 p-2 relative"
              >
                <div className="relative">
                  <Icon className={`w-6 h-6 ${isActive ? 'text-agriGreen' : 'text-gray-400'}`} />
                  {item.badge && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold w-4 h-4 rounded-full flex items-center justify-center">
                      {item.badge}
                    </span>
                  )}
                </div>
                <span className={`text-xs font-bold ${isActive ? 'text-agriGreen' : 'text-gray-400'}`}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </>
  );
};

export default MobileNavigation;
