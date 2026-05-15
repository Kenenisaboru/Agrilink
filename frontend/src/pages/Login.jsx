import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { 
  Leaf, 
  Mail, 
  Lock, 
  ArrowRight, 
  Loader2, 
  AlertCircle, 
  Sprout, 
  ShoppingBag, 
  GraduationCap,
  Shield,
  Users,
  Eye,
  EyeOff
} from 'lucide-react';

const Login = () => {
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [selectedLoginRole, setSelectedLoginRole] = useState(null);
  const { login } = useAuth();
  const navigate = useNavigate();

  const roles = [
    { id: 'farmer', name: 'Farmer', icon: Sprout, description: 'Sell your agricultural products', color: 'from-green-500 to-emerald-600' },
    { id: 'buyer', name: 'Buyer', icon: ShoppingBag, description: 'Purchase quality products', color: 'from-blue-500 to-indigo-600' },
    { id: 'student', name: 'Student', icon: GraduationCap, description: 'Get expert guidance', color: 'from-purple-500 to-pink-600' },
    { id: 'admin', name: 'Admin', icon: Shield, description: 'Manage the platform', color: 'from-red-500 to-orange-600' }
  ];

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const user = await login(loginData.email, loginData.password);
      
      // Redirect based on the role returned by the backend
      const rolePath = user.role.toLowerCase();
      navigate(`/dashboard/${rolePath}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-green-50 via-white to-amber-50">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-6xl"
      >
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          
          {/* Left Side - Branding */}
          <div className="hidden lg:block">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="space-y-8"
            >
              <div className="flex items-center gap-4">
                <div className="bg-agriGreen p-4 rounded-3xl shadow-xl shadow-green-200/50">
                  <Leaf className="text-white w-10 h-10" />
                </div>
                <div>
                  <h1 className="text-4xl font-black text-gray-900 tracking-tight">AgriLink</h1>
                  <p className="text-gray-500 font-medium">Ethiopia Agricultural Platform</p>
                </div>
              </div>

              <div className="space-y-4">
                <h2 className="text-5xl font-black text-gray-900 leading-tight">
                  Transform Your <span className="text-agriGreen">Agricultural</span> Business
                </h2>
                <p className="text-xl text-gray-600 leading-relaxed">
                  Join thousands of farmers, buyers, and experts connecting on Ethiopia's premier agricultural marketplace.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-6">
                {[
                  { icon: Users, label: '2,500+ Farmers', color: 'text-green-600' },
                  { icon: ShoppingBag, label: '1,200+ Buyers', color: 'text-blue-600' },
                  { icon: Shield, label: 'Secure Platform', color: 'text-purple-600' },
                  { icon: Leaf, label: 'Premium Quality', color: 'text-amber-600' }
                ].map((stat, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                    className="flex items-center gap-3 bg-white p-4 rounded-2xl shadow-sm"
                  >
                    <stat.icon className={`w-6 h-6 ${stat.color}`} />
                    <span className="font-bold text-gray-700">{stat.label}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        
          {/* Right Side - Login Form */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-[3rem] shadow-2xl shadow-green-100/50 border border-gray-100 p-8 lg:p-12 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-48 h-48 bg-agriGreen/5 rounded-full -mr-24 -mt-24 blur-3xl" />
            
            <div className="relative z-10">
              <div className="flex flex-col items-center mb-8">
                <div className="bg-agriGreen p-4 rounded-3xl mb-4 shadow-lg shadow-green-200/50">
                  <Leaf className="text-white w-10 h-10" />
                </div>
                <h2 className="text-3xl font-black text-gray-900 tracking-tight">Welcome Back</h2>
                <p className="text-gray-500 font-medium mt-2 text-center">Sign in to your account</p>
              </div>



              {error && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-2xl mb-6 flex items-center gap-3 text-sm font-bold"
                >
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  {error}
                </motion.div>
              )}

              <form onSubmit={handleLogin} className="space-y-5">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 ml-1">Email Address</label>
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-agriGreen transition-colors w-5 h-5" />
                    <input
                      type="email"
                      required
                      className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 pl-12 pr-4 outline-none focus:ring-4 focus:ring-agriGreen/10 focus:border-agriGreen transition-all font-medium"
                      placeholder="name@example.com"
                      value={loginData.email}
                      onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 ml-1">Password</label>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-agriGreen transition-colors w-5 h-5" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 pl-12 pr-12 outline-none focus:ring-4 focus:ring-agriGreen/10 focus:border-agriGreen transition-all font-medium"
                      placeholder="••••••••"
                      value={loginData.password}
                      onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-agriGreen transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-agriGreen focus:ring-agriGreen" />
                    <span className="text-sm font-medium text-gray-600">Remember me</span>
                  </label>
                  <button type="button" className="text-sm font-bold text-agriGreen hover:text-agriDark transition-colors">
                    Forgot password?
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full btn-primary py-4 rounded-2xl text-lg font-black mt-4 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <Loader2 className="w-6 h-6 animate-spin" />
                  ) : (
                    <>
                      Sign In
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              </form>

              <div className="mt-8 text-center">
                <p className="text-gray-500 font-medium">
                  Don't have an account?{' '}
                  <Link to="/register" className="text-agriGreen font-black hover:underline underline-offset-4 decoration-2">
                    Create account
                  </Link>
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
