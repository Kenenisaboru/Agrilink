import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Leaf, 
  Mail, 
  Lock, 
  ArrowRight, 
  Loader2, 
  AlertCircle, 
  User, 
  UserPlus,
  Sprout, 
  ShoppingBag, 
  GraduationCap,
  Shield,
  Users,
  Eye,
  EyeOff,
  Phone,
  MapPin
} from 'lucide-react';

const Login = () => {
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [registerData, setRegisterData] = useState({ 
    name: '', 
    email: '', 
    phone: '',
    location: '',
    password: '', 
    confirmPassword: '',
    role: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [selectedLoginRole, setSelectedLoginRole] = useState(null);
  const [selectedRegisterRole, setSelectedRegisterRole] = useState(null);
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const roles = [
    { id: 'farmer', name: 'Farmer', icon: Sprout, description: 'Sell your agricultural products', color: 'from-green-500 to-emerald-600' },
    { id: 'buyer', name: 'Buyer', icon: ShoppingBag, description: 'Purchase quality products', color: 'from-blue-500 to-indigo-600' },
    { id: 'student', name: 'Student', icon: GraduationCap, description: 'Get expert guidance', color: 'from-purple-500 to-pink-600' },
    { id: 'admin', name: 'Admin', icon: Shield, description: 'Manage the platform', color: 'from-red-500 to-orange-600' },
    { id: 'representative', name: 'Representative', icon: Users, description: 'Connect farmers & buyers', color: 'from-amber-500 to-yellow-600' }
  ];

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!selectedLoginRole) {
      setError('Please select your role to login');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const user = await login(loginData.email, loginData.password);
      const rolePath = user.role.toLowerCase();
      navigate(`/dashboard/${rolePath}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!selectedRegisterRole) {
      setError('Please select your role to register');
      return;
    }
    if (registerData.password !== registerData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const userData = {
        ...registerData,
        role: selectedRegisterRole
      };
      delete userData.confirmPassword;
      const user = await register(userData);
      const rolePath = user.role.toLowerCase();
      navigate(`/dashboard/${rolePath}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-green-50 via-white to-amber-50">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-7xl"
      >
        <div className="grid lg:grid-cols-2 gap-8 items-center">
          
          {/* Left Side - Login */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
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

              {/* Login Role Selection */}
              <div className="mb-6">
                <label className="text-sm font-bold text-gray-700 ml-1 mb-3 block">Select Your Role</label>
                <div className="grid grid-cols-5 gap-2">
                  {roles.map((role) => (
                    <motion.button
                      key={role.id}
                      type="button"
                      onClick={() => setSelectedLoginRole(role.id)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className={`relative p-3 rounded-2xl border-2 transition-all ${
                        selectedLoginRole === role.id
                          ? 'border-agriGreen bg-agriGreen/10'
                          : 'border-gray-100 hover:border-gray-200'
                      }`}
                    >
                      <role.icon className={`w-6 h-6 mx-auto mb-1 ${
                        selectedLoginRole === role.id ? 'text-agriGreen' : 'text-gray-400'
                      }`} />
                      <span className="text-xs font-medium text-gray-600">{role.name}</span>
                    </motion.button>
                  ))}
                </div>
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
            </div>
          </motion.div>

          {/* Right Side - Registration */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-[3rem] shadow-2xl shadow-blue-100/50 border border-gray-100 p-8 lg:p-12 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/5 rounded-full -mr-24 -mt-24 blur-3xl" />
            
            <div className="relative z-10">
              <div className="flex flex-col items-center mb-8">
                <div className="bg-blue-500 p-4 rounded-3xl mb-4 shadow-lg shadow-blue-200/50">
                  <UserPlus className="text-white w-10 h-10" />
                </div>
                <h2 className="text-3xl font-black text-gray-900 tracking-tight">Create Account</h2>
                <p className="text-gray-500 font-medium mt-2 text-center">Join our agricultural community</p>
              </div>

              {/* Registration Role Selection */}
              <div className="mb-6">
                <label className="text-sm font-bold text-gray-700 ml-1 mb-3 block">Choose Your Role</label>
                <div className="grid grid-cols-5 gap-2">
                  {roles.map((role) => (
                    <motion.button
                      key={role.id}
                      type="button"
                      onClick={() => setSelectedRegisterRole(role.id)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className={`relative p-3 rounded-2xl border-2 transition-all ${
                        selectedRegisterRole === role.id
                          ? 'border-blue-500 bg-blue-500/10'
                          : 'border-gray-100 hover:border-gray-200'
                      }`}
                    >
                      <role.icon className={`w-6 h-6 mx-auto mb-1 ${
                        selectedRegisterRole === role.id ? 'text-blue-500' : 'text-gray-400'
                      }`} />
                      <span className="text-xs font-medium text-gray-600">{role.name}</span>
                    </motion.button>
                  ))}
                </div>
              </div>

              <form onSubmit={handleRegister} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700 ml-1">Full Name</label>
                    <div className="relative group">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors w-5 h-5" />
                      <input
                        type="text"
                        required
                        className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-3 pl-12 pr-4 outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium"
                        placeholder="John Doe"
                        value={registerData.name}
                        onChange={(e) => setRegisterData({ ...registerData, name: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700 ml-1">Email</label>
                    <div className="relative group">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors w-5 h-5" />
                      <input
                        type="email"
                        required
                        className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-3 pl-12 pr-4 outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium"
                        placeholder="name@example.com"
                        value={registerData.email}
                        onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700 ml-1">Phone</label>
                    <div className="relative group">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors w-5 h-5" />
                      <input
                        type="tel"
                        className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-3 pl-12 pr-4 outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium"
                        placeholder="+251 900 000 000"
                        value={registerData.phone}
                        onChange={(e) => setRegisterData({ ...registerData, phone: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700 ml-1">Location</label>
                    <div className="relative group">
                      <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors w-5 h-5" />
                      <input
                        type="text"
                        className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-3 pl-12 pr-4 outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium"
                        placeholder="East Hararghe"
                        value={registerData.location}
                        onChange={(e) => setRegisterData({ ...registerData, location: e.target.value })}
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700 ml-1">Password</label>
                    <div className="relative group">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors w-5 h-5" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-3 pl-12 pr-12 outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium"
                        placeholder="••••••••"
                        value={registerData.password}
                        onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-500 transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700 ml-1">Confirm Password</label>
                    <div className="relative group">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors w-5 h-5" />
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        required
                        className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-3 pl-12 pr-12 outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium"
                        placeholder="••••••••"
                        value={registerData.confirmPassword}
                        onChange={(e) => setRegisterData({ ...registerData, confirmPassword: e.target.value })}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-500 transition-colors"
                      >
                        {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <input type="checkbox" required className="w-4 h-4 rounded border-gray-300 text-blue-500 focus:ring-blue-500" />
                  <span className="text-sm text-gray-600">
                    I agree to the <a href="#" className="text-blue-500 font-bold hover:underline">Terms</a> and <a href="#" className="text-blue-500 font-bold hover:underline">Privacy Policy</a>
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white py-4 rounded-2xl text-lg font-black mt-4 flex items-center justify-center gap-2 transition-colors"
                >
                  {loading ? (
                    <Loader2 className="w-6 h-6 animate-spin" />
                  ) : (
                    <>
                      Create Account
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              </form>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
