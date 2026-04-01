import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Sprout, LogOut, User as UserIcon } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const dashboardLink = user ? `/dashboard/${user.role.toLowerCase()}` : '/';

  return (
    <nav className="bg-agriDark text-white shadow-md">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link to="/" className="flex items-center space-x-2 text-2xl font-bold text-agriLight hover:text-white transition">
          <Sprout size={32} />
          <span>AgriLink</span>
        </Link>
        
        <div className="hidden md:flex space-x-6 items-center">
          <Link to="/" className="hover:text-agriLight transition">Home</Link>
          <a href="#about" className="hover:text-agriLight transition">About</a>
          <a href="#market" className="hover:text-agriLight transition">Marketplace</a>

          {!user ? (
            <div className="space-x-3">
              <Link to="/login" className="px-4 py-2 bg-agriGreen hover:bg-green-600 rounded drop-shadow transition">Login</Link>
              <Link to="/register" className="px-4 py-2 border border-agriLight text-agriLight hover:bg-agriLight hover:text-agriDark rounded transition">Register</Link>
            </div>
          ) : (
            <div className="flex items-center space-x-4">
              <Link to={dashboardLink} className="flex items-center space-x-1 hover:text-agriLight transition">
                <UserIcon size={18} />
                <span>Dashboard ({user.role})</span>
              </Link>
              <button onClick={handleLogout} className="flex items-center space-x-1 hover:text-red-400 transition">
                <LogOut size={18} />
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
