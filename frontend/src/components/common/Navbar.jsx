import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { 
  Menu, 
  X, 
  Leaf, 
  User, 
  LogOut, 
  Bell,
  Search,
  ShoppingBag,
  CheckCircle2,
  Package,
  Clock,
  Truck
} from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

/**
 * Common Navbar - Top navigation bar for authenticated layouts
 * 
 * Features:
 * - Search bar
 * - 🔔 Real-time notification bell (fetches from /api/notifications)
 * - User profile display
 */
const Navbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Fetch notifications when component mounts
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const { data } = await axios.get('/api/notifications');
        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);
      } catch (err) {
        // Silently fail - notifications are non-critical
        console.log('Could not fetch notifications');
      }
    };

    if (user?.token) {
      fetchNotifications();
      // Poll for new notifications every 30 seconds
      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  // Mark a notification as read
  const markAsRead = async (notifId) => {
    try {
      await axios.put(`/api/notifications/${notifId}/read`);
      setNotifications(prev => prev.map(n => n._id === notifId ? { ...n, isRead: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Error marking notification as read');
    }
  };

  // Mark all as read
  const markAllRead = async () => {
    try {
      await axios.put('/api/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Error marking all as read');
    }
  };

  // Get the right icon for a notification type
  const getNotifIcon = (type) => {
    switch (type) {
      case 'NEW_ORDER': return <ShoppingBag className="w-4 h-4" />;
      case 'PAYMENT_SUCCESS': return <CheckCircle2 className="w-4 h-4" />;
      case 'ORDER_SHIPPED': return <Truck className="w-4 h-4" />;
      case 'ORDER_DELIVERED': return <Package className="w-4 h-4" />;
      default: return <Bell className="w-4 h-4" />;
    }
  };

  const getNotifColor = (type) => {
    switch (type) {
      case 'NEW_ORDER': return 'bg-green-100 text-green-600';
      case 'PAYMENT_SUCCESS': return 'bg-blue-100 text-blue-600';
      case 'ORDER_SHIPPED': return 'bg-amber-100 text-amber-600';
      case 'ORDER_DELIVERED': return 'bg-emerald-100 text-emerald-600';
      default: return 'bg-gray-100 text-gray-500';
    }
  };

  // Time ago helper
  const timeAgo = (dateStr) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    return `${days}d ago`;
  };

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
        {/* Notifications Bell */}
        <div className="relative">
          <button 
            onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
            className="p-2.5 text-gray-400 hover:text-agriGreen hover:bg-agriGreen/5 rounded-xl transition-all relative"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <motion.span 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[8px] font-black rounded-full flex items-center justify-center border-2 border-white"
              >
                {unreadCount > 9 ? '9+' : unreadCount}
              </motion.span>
            )}
          </button>
          
          <AnimatePresence>
            {isNotificationsOpen && (
              <>
                {/* Click outside overlay */}
                <div 
                  className="fixed inset-0 z-40" 
                  onClick={() => setIsNotificationsOpen(false)} 
                />
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute right-0 mt-4 w-96 bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden z-50"
                >
                  {/* Header */}
                  <div className="p-5 border-b border-gray-50 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <h3 className="font-black text-gray-900">Notifications</h3>
                      {unreadCount > 0 && (
                        <span className="bg-red-100 text-red-600 text-[10px] font-black px-2 py-0.5 rounded-full">
                          {unreadCount} new
                        </span>
                      )}
                    </div>
                    {unreadCount > 0 && (
                      <button 
                        onClick={markAllRead}
                        className="text-[10px] font-black text-agriGreen hover:underline uppercase tracking-wider"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>

                  {/* Notification List */}
                  <div className="max-h-96 overflow-y-auto custom-scrollbar">
                    {notifications.length > 0 ? (
                      notifications.slice(0, 10).map((notif) => (
                        <div
                          key={notif._id}
                          onClick={() => markAsRead(notif._id)}
                          className={`p-4 border-b border-gray-50 hover:bg-gray-50 transition-colors cursor-pointer ${
                            !notif.isRead ? 'bg-green-50/20' : ''
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div className={`p-2 rounded-xl shrink-0 ${getNotifColor(notif.type)}`}>
                              {getNotifIcon(notif.type)}
                            </div>
                            <div className="flex-grow min-w-0">
                              <div className="flex items-center gap-2">
                                <p className="text-xs font-black text-gray-900 truncate">{notif.title}</p>
                                {!notif.isRead && (
                                  <span className="w-2 h-2 bg-agriGreen rounded-full shrink-0" />
                                )}
                              </div>
                              <p className="text-[11px] text-gray-500 mt-1 line-clamp-2">{notif.message}</p>
                              <p className="text-[9px] text-gray-400 font-bold mt-2 flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {timeAgo(notif.createdAt)}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-10 text-center">
                        <Bell className="w-8 h-8 text-gray-200 mx-auto mb-2" />
                        <p className="text-gray-400 font-bold text-xs">No notifications yet</p>
                      </div>
                    )}
                  </div>

                  {/* Footer */}
                  {notifications.length > 0 && (
                    <Link 
                      to={user?.role === 'Farmer' ? '/dashboard/farmer/orders' : '/dashboard/buyer/orders'}
                      onClick={() => setIsNotificationsOpen(false)}
                      className="block p-3 text-center text-xs font-black text-agriGreen hover:bg-gray-50 transition-colors border-t border-gray-50"
                    >
                      View All Orders →
                    </Link>
                  )}
                </motion.div>
              </>
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
