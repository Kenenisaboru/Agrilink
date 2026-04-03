import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  LayoutDashboard, 
  Leaf, 
  ShoppingCart, 
  MessageSquare, 
  Users, 
  Settings, 
  LogOut,
  ChevronLeft,
  ChevronRight,
  Package,
  TrendingUp,
  Shield
} from 'lucide-react';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const Sidebar = ({ role }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();
  const { logout } = useAuth();

  const farmerLinks = [
    { name: 'Dashboard', path: '/dashboard/farmer', icon: LayoutDashboard },
    { name: 'My Harvests', path: '/dashboard/farmer/crops', icon: Leaf },
    { name: 'Orders', path: '/dashboard/farmer/orders', icon: Package },
    { name: 'Analytics', path: '/dashboard/farmer/analytics', icon: TrendingUp },
    { name: 'Messages', path: '/chat', icon: MessageSquare },
  ];

  const buyerLinks = [
    { name: 'Marketplace', path: '/dashboard/buyer', icon: ShoppingCart },
    { name: 'My Orders', path: '/dashboard/buyer/orders', icon: Package },
    { name: 'Messages', path: '/chat', icon: MessageSquare },
  ];

  const studentLinks = [
    { name: 'Innovation Hub', path: '/dashboard/student', icon: TrendingUp },
    { name: 'My Proposals', path: '/dashboard/student/proposals', icon: Leaf },
    { name: 'Messages', path: '/chat', icon: MessageSquare },
  ];

  const adminLinks = [
    { name: 'Command Center', path: '/dashboard/admin', icon: Shield },
    { name: 'User Management', path: '/dashboard/admin/users', icon: Users },
    { name: 'Platform Logs', path: '/dashboard/admin/logs', icon: Settings },
  ];

  const links = role === 'Farmer' ? farmerLinks : 
                role === 'Buyer' ? buyerLinks : 
                role === 'Student' ? studentLinks : adminLinks;

  return (
    <motion.aside
      initial={false}
      animate={{ width: isCollapsed ? '80px' : '280px' }}
      className="h-screen bg-white border-r border-gray-100 flex flex-col relative z-40 shadow-sm"
    >
      {/* Brand */}
      <div className="p-6 flex items-center gap-3">
        <div className="bg-agriGreen p-2 rounded-xl flex-shrink-0">
          <Leaf className="text-white w-6 h-6" />
        </div>
        {!isCollapsed && (
          <span className="text-2xl font-black tracking-tighter text-agriGreen">
            Agri<span className="text-amber-600">Link</span>
          </span>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto custom-scrollbar">
        {links.map((link) => {
          const isActive = location.pathname === link.path;
          return (
            <Link
              key={link.path}
              to={link.path}
              className={cn(
                "flex items-center gap-4 px-4 py-3.5 rounded-2xl font-bold transition-all group",
                isActive 
                  ? "bg-agriGreen text-white shadow-lg shadow-green-200" 
                  : "text-gray-500 hover:bg-gray-50 hover:text-agriGreen"
              )}
            >
              <link.icon className={cn("w-5 h-5", isActive ? "text-white" : "group-hover:text-agriGreen")} />
              {!isCollapsed && <span>{link.name}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-50 space-y-2">
        <button
          onClick={logout}
          className={cn(
            "w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl font-bold text-red-500 hover:bg-red-50 transition-all group",
            isCollapsed && "justify-center px-0"
          )}
        >
          <LogOut className="w-5 h-5" />
          {!isCollapsed && <span>Logout</span>}
        </button>
        
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -right-3 top-20 bg-white border border-gray-100 p-1 rounded-full shadow-md text-gray-400 hover:text-agriGreen transition-colors hidden lg:block"
        >
          {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>
    </motion.aside>
  );
};

export default Sidebar;
