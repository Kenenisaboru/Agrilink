import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Menu, 
  X, 
  Leaf, 
  User, 
  LogOut, 
  MessageSquare, 
  LayoutDashboard, 
  Package,
  Globe
} from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useTranslation } from 'react-i18next';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const Navbar = () => {
  const { user, logout } = useAuth();
  const { t, i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: t('nav.home', 'Home'), path: '/', icon: Leaf },
    { name: t('nav.about', 'About'), path: '/#about', icon: Leaf },
    ...(user ? [
      { 
        name: t('nav.dashboard', 'Dashboard'), 
        path: `/dashboard/${user.role?.toLowerCase() || 'user'}`,
        icon: LayoutDashboard 
      },
      { name: 'Chat', path: '/chat', icon: MessageSquare },
    ] : []),
  ];

  if (user?.role === 'Farmer') {
    navLinks.push(
      { name: 'My Crops', path: '/dashboard/farmer/crops', icon: Leaf },
      { name: 'Orders', path: '/dashboard/farmer/orders', icon: Package }
    );
  }

  const changeLanguage = (e) => {
    i18n.changeLanguage(e.target.value);
  };

  return (
    <nav
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300 px-4 py-3",
        scrolled ? "bg-white/80 backdrop-blur-md shadow-lg border-b border-gray-200/50" : "bg-transparent"
      )}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="p-1 rounded-xl group-hover:rotate-12 transition-transform duration-300 shadow-lg shadow-green-200/50 overflow-hidden bg-white w-12 h-12 flex items-center justify-center border border-gray-100">
            <img src="/logo.png" alt="AgriLink Logo" className="w-full h-full object-contain" />
          </div>
          <span className={cn(
            "text-2xl font-black tracking-tighter transition-colors",
            scrolled ? "text-agriDark" : "text-agriGreen"
          )}>
            Agri<span className="text-amber-600">Link</span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            link.path.startsWith('/#') ? (
              <a
                key={link.path}
                href={link.path}
                className={cn(
                  "text-sm font-bold transition-all hover:text-agriGreen relative group",
                  "text-gray-600"
                )}
              >
                {link.name}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-agriGreen transition-all group-hover:w-full" />
              </a>
            ) : (
              <Link
                key={link.path}
                to={link.path}
                className={cn(
                  "text-sm font-bold transition-all hover:text-agriGreen relative group",
                  location.pathname === link.path ? "text-agriGreen" : "text-gray-600"
                )}
              >
                {link.name}
                <span className={cn(
                  "absolute -bottom-1 left-0 w-0 h-0.5 bg-agriGreen transition-all group-hover:w-full",
                  location.pathname === link.path && "w-full"
                )} />
              </Link>
            )
          ))}
          
          <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-100">
            <Globe className="w-4 h-4 text-gray-400" />
            <select 
              value={i18n.language} 
              onChange={changeLanguage}
              className="bg-transparent text-sm font-bold text-gray-600 outline-none cursor-pointer"
            >
              <option value="en">EN</option>
              <option value="am">አማ</option>
              <option value="om">ORO</option>
            </select>
          </div>

          {user ? (
            <div className="flex items-center gap-4">
              <div className="h-8 w-px bg-gray-200" />
              <div className="flex items-center gap-3 bg-gray-50 p-1.5 pr-4 rounded-full border border-gray-100 hover:border-agriGreen/30 transition-colors">
                <div className="w-8 h-8 rounded-full bg-agriGreen/10 flex items-center justify-center text-agriGreen font-bold">
                  {user.name?.[0] || <User className="w-4 h-4" />}
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-gray-900 leading-none">{user.name}</span>
                  <span className="text-[10px] text-gray-500 font-medium">{user.role}</span>
                </div>
              </div>
              <button
                onClick={logout}
                className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <Link to="/login" className="text-sm font-bold text-gray-600 hover:text-agriGreen transition-colors">
                {t('nav.login', 'Sign In')}
              </Link>
              <Link 
                to="/register" 
                className="btn-primary py-2 shadow-none"
              >
                {t('nav.register', 'Join Now')}
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Toggle */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden p-2 text-gray-600 hover:text-agriGreen"
        >
          {isOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white mt-2 rounded-2xl border border-gray-100 shadow-2xl overflow-hidden"
          >
            <div className="p-4 space-y-2">
              {navLinks.map((link) => (
                link.path.startsWith('/#') ? (
                  <a
                    key={link.path}
                    href={link.path}
                    onClick={() => setIsOpen(false)}
                    className={cn(
                      "flex items-center gap-3 p-3 rounded-xl font-bold transition-colors",
                      "text-gray-600 hover:bg-gray-50 hover:text-agriGreen"
                    )}
                  >
                    {link.icon && <link.icon className="w-5 h-5" />}
                    {link.name}
                  </a>
                ) : (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={() => setIsOpen(false)}
                    className={cn(
                      "flex items-center gap-3 p-3 rounded-xl font-bold transition-colors",
                      location.pathname === link.path ? "bg-agriGreen text-white" : "text-gray-600 hover:bg-gray-50 hover:text-agriGreen"
                    )}
                  >
                    {link.icon && <link.icon className="w-5 h-5" />}
                    {link.name}
                  </Link>
                )
              ))}
              <div className="h-px bg-gray-100 my-2" />
              {user ? (
                <button
                  onClick={() => {
                    logout();
                    setIsOpen(false);
                  }}
                  className="w-full flex items-center gap-3 p-3 rounded-xl font-bold text-red-500 hover:bg-red-50 transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                  Sign Out
                </button>
              ) : (
                <div className="grid grid-cols-2 gap-2 p-2">
                  <Link 
                    to="/login" 
                    onClick={() => setIsOpen(false)}
                    className="flex justify-center p-3 rounded-xl font-bold text-gray-600 bg-gray-100"
                  >
                    Login
                  </Link>
                  <Link 
                    to="/register" 
                    onClick={() => setIsOpen(false)}
                    className="flex justify-center p-3 rounded-xl font-bold bg-agriGreen text-white"
                  >
                    Join
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
