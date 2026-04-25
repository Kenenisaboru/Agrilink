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
  Sprout, 
  ShoppingBag, 
  GraduationCap,
  Shield,
  Users,
  Eye,
  EyeOff
} from 'lucide-react';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);
  const { login } = useAuth();
  const navigate = useNavigate();

  const roles = [
    { id: 'farmer', name: 'Farmer', icon: Sprout, description: 'Sell your agricultural products', color: 'from-green-500 to-emerald-600' },
    { id: 'buyer', name: 'Buyer', icon: ShoppingBag, description: 'Purchase quality products', color: 'from-blue-500 to-indigo-600' },
    { id: 'student', name: 'Student', icon: GraduationCap, description: 'Get expert guidance', color: 'from-purple-500 to-pink-600' },
    { id: 'admin', name: 'Admin', icon: Shield, description: 'Manage the platform', color: 'from-red-500 to-orange-600' },
    { id: 'representative', name: 'Representative', icon: Users, description: 'Connect farmers & buyers', color: 'from-amber-500 to-yellow-600' }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const user = await login(formData.email, formData.password);
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
                  <p className="text-gray-500 font-medium">East Hararghe Agricultural Platform</p>
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
          >
            <div className="bg-white rounded-[3rem] shadow-2xl shadow-green-100/50 border border-gray-100 p-8 lg:p-12 relative overflow-hidden">
              {/* Decorative background element */}
              <div className="absolute top-0 right-0 w-48 h-48 bg-agriGreen/5 rounded-full -mr-24 -mt-24 blur-3xl" />
              
              <div className="relative z-10">
                <div className="flex flex-col items-center mb-10">
                  <div className="bg-agriGreen p-4 rounded-3xl mb-4 shadow-lg shadow-green-200/50">
                    <Leaf className="text-white w-10 h-10" />
                  </div>
                  <h2 className="text-3xl font-black text-gray-900 tracking-tight">Welcome Back</h2>
                  <p className="text-gray-500 font-medium mt-2 text-center">Enter your details to access your account</p>
                </div>

                {/* Role Selection */}
                <div className="mb-8">
                  <label className="text-sm font-bold text-gray-700 ml-1 mb-3 block">Select Your Role</label>
                  <div className="grid grid-cols-5 gap-2">
                    {roles.map((role) => (
                      <motion.button
                        key={role.id}
                        type="button"
                        onClick={() => setSelectedRole(role.id)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className={`relative p-3 rounded-2xl border-2 transition-all ${
                          selectedRole === role.id
                            ? 'border-agriGreen bg-agriGreen/10'
                            : 'border-gray-100 hover:border-gray-200'
                        }`}
                      >
                        <role.icon className={`w-6 h-6 mx-auto mb-1 ${
                          selectedRole === role.id ? 'text-agriGreen' : 'text-gray-400'
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

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700 ml-1">Email Address</label>
                    <div className="relative group">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-agriGreen transition-colors w-5 h-5" />
                      <input
                        type="email"
                        required
                        className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 pl-12 pr-4 outline-none focus:ring-4 focus:ring-agriGreen/10 focus:border-agriGreen transition-all font-medium"
                        placeholder="name@example.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
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
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
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

                <div className="mt-10 text-center">
                  <p className="text-gray-500 font-medium">
                    Don't have an account?{' '}
                    <Link to="/register" className="text-agriGreen font-black hover:underline underline-offset-4 decoration-2">
                      Create account
                    </Link>
                  </p>
                </div>

                {/* Social Login */}
                <div className="mt-8">
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-200"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-4 bg-white text-gray-500 font-medium">Or continue with</span>
                    </div>
                  </div>

                  <div className="mt-6 grid grid-cols-2 gap-4">
                    <button className="flex items-center justify-center gap-2 py-3 px-4 border border-gray-200 rounded-2xl hover:bg-gray-50 transition-colors font-medium text-gray-700">
                      <svg className="w-5 h-5" viewBox="0 0 24 24">
                        <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                        <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                      </svg>
                      Google
                    </button>
                    <button className="flex items-center justify-center gap-2 py-3 px-4 border border-gray-200 rounded-2xl hover:bg-gray-50 transition-colors font-medium text-gray-700">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                      </svg>
                      GitHub
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
