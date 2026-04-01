import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Sprout, LogOut, User as UserIcon, LayoutDashboard, ShoppingBag, Info, ShieldCheck } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getDashboardLink = () => {
    if (!user) return '/';
    return `/dashboard/${user.role.toLowerCase()}`;
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-[100] w-full px-6 py-4">
      <div className="max-w-7xl mx-auto glass rounded-[2rem] shadow-xl shadow-green-900/10 px-8 py-3 flex justify-between items-center border border-white/60">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="bg-agriGreen p-2 rounded-2xl group-hover:rotate-12 transition-transform duration-300">
            <Sprout size={28} className="text-white" />
          </div>
          <span className="text-2xl font-black tracking-tighter text-slate-800">
            Agri<span className="text-agriGreen">Link</span>
          </span>
        </Link>
        
        <div className="hidden lg:flex space-x-8 items-center">
          <NavLink to="/" active={isActive('/')}>Home</NavLink>
          <NavLink to="/#about" active={isActive('/#about')} icon={<Info size={16}/>}>About</NavLink>
          <NavLink to="/#market" active={isActive('/#market')} icon={<ShoppingBag size={16}/>}>Marketplace</NavLink>

          {!user ? (
            <div className="flex items-center gap-4 pl-4 border-l border-slate-200">
              <Link to="/login" className="text-sm font-black text-slate-600 hover:text-agriGreen transition-colors">Sign In</Link>
              <Link to="/register" className="btn-primary py-2 px-6 shadow-green-200/50">Join Platform</Link>
            </div>
          ) : (
            <div className="flex items-center gap-6 pl-6 border-l border-slate-200">
              <Link 
                to={getDashboardLink()} 
                className={`flex items-center gap-2 group transition-all ${isActive(getDashboardLink()) ? 'text-agriGreen' : 'text-slate-600'}`}
              >
                <div className={`p-2 rounded-xl transition-all ${isActive(getDashboardLink()) ? 'bg-agriGreen text-white' : 'bg-slate-100 group-hover:bg-agriGreen/10 group-hover:text-agriGreen'}`}>
                  {user.role === 'Admin' ? <ShieldCheck size={18} /> : <LayoutDashboard size={18} />}
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-black uppercase tracking-widest leading-none opacity-50">{user.role}</span>
                  <span className="text-sm font-black tracking-tight leading-none mt-1">Dashboard</span>
                </div>
              </Link>
              
              <button 
                onClick={handleLogout} 
                className="flex items-center gap-2 text-slate-400 hover:text-red-500 transition-all font-bold group"
              >
                <div className="p-2 bg-slate-50 group-hover:bg-red-50 rounded-xl transition-all">
                  <LogOut size={18} />
                </div>
              </button>
            </div>
          )}
        </div>

        {/* Mobile menu toggle would go here */}
      </div>
    </nav>
  );
};

const NavLink = ({ to, children, active, icon }) => (
  <Link 
    to={to} 
    className={`flex items-center gap-1.5 text-sm font-black tracking-tight transition-all duration-300 ${active ? 'text-agriGreen' : 'text-slate-500 hover:text-agriGreen'}`}
  >
    {icon}
    {children}
    {active && <div className="w-1 h-1 bg-agriGreen rounded-full ml-0.5"></div>}
  </Link>
);

export default Navbar;
