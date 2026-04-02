import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { Leaf, Mail, Lock, ArrowRight, Loader2, AlertCircle } from 'lucide-react';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

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
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-green-100/50 border border-gray-100 p-8 lg:p-12 relative overflow-hidden">
          {/* Decorative background element */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-agriGreen/5 rounded-full -mr-16 -mt-16 blur-2xl" />
          
          <div className="relative z-10">
            <div className="flex flex-col items-center mb-10">
              <div className="bg-agriGreen p-3 rounded-2xl mb-4 shadow-lg shadow-green-200/50">
                <Leaf className="text-white w-8 h-8" />
              </div>
              <h2 className="text-3xl font-black text-gray-900 tracking-tight">Welcome Back</h2>
              <p className="text-gray-500 font-medium mt-2 text-center">Enter your details to access your account</p>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl mb-6 flex items-center gap-3 text-sm font-bold"
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
                    type="password"
                    required
                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 pl-12 pr-4 outline-none focus:ring-4 focus:ring-agriGreen/10 focus:border-agriGreen transition-all font-medium"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex items-center justify-end">
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
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
