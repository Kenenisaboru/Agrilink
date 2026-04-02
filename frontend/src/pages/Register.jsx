import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Leaf, 
  Mail, 
  Lock, 
  User, 
  ArrowRight, 
  Loader2, 
  AlertCircle,
  Briefcase,
  GraduationCap,
  ShoppingBag,
  CheckCircle2,
  MapPin,
  Phone
} from 'lucide-react';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'Buyer',
    location: '',
    mpesaNumber: '',
    university: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const roles = [
    { id: 'Farmer', icon: Leaf, desc: 'Sell your crops directly' },
    { id: 'Buyer', icon: ShoppingBag, desc: 'Purchase fresh produce' },
    { id: 'Student', icon: GraduationCap, desc: 'Provide expert advice' },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const user = await register(formData.name, formData.email, formData.password, formData.role, formData.location, formData.mpesaNumber, formData.university);
      navigate(`/dashboard/${user.role.toLowerCase()}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[90vh] flex items-center justify-center p-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl"
      >
        <div className="bg-white rounded-[3rem] shadow-2xl shadow-green-100/50 border border-gray-100 p-8 lg:p-12 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-agriGreen/5 rounded-full -mr-32 -mt-32 blur-3xl" />
          
          <div className="relative z-10">
            <div className="flex flex-col items-center mb-10">
              <div className="bg-agriGreen p-3 rounded-2xl mb-4 shadow-lg shadow-green-200/50 text-white">
                <Leaf className="w-8 h-8" />
              </div>
              <h2 className="text-3xl lg:text-4xl font-black text-gray-900 tracking-tight">Create Account</h2>
              <p className="text-gray-500 font-medium mt-2 text-center">Join the East Hararghe agricultural revolution</p>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-2xl mb-8 flex items-center gap-3 text-sm font-bold"
              >
                <AlertCircle className="w-5 h-5 shrink-0" />
                {error}
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 ml-1">Full Name</label>
                  <div className="relative group">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-agriGreen transition-colors w-5 h-5" />
                    <input
                      type="text"
                      required
                      className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 pl-12 pr-4 outline-none focus:ring-4 focus:ring-agriGreen/10 focus:border-agriGreen transition-all font-medium"
                      placeholder="John Doe"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>
                </div>

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

              <div className="space-y-4">
                <label className="text-sm font-bold text-gray-700 ml-1">Select Your Role</label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {roles.map((role) => (
                    <button
                      key={role.id}
                      type="button"
                      onClick={() => setFormData({ ...formData, role: role.id })}
                      className={`relative p-4 rounded-2xl border-2 text-left transition-all duration-300 ${
                        formData.role === role.id
                          ? 'border-agriGreen bg-green-50/50 ring-4 ring-agriGreen/10'
                          : 'border-gray-100 bg-white hover:border-gray-200'
                      }`}
                    >
                      <role.icon className={`w-6 h-6 mb-3 ${formData.role === role.id ? 'text-agriGreen' : 'text-gray-400'}`} />
                      <div className="font-bold text-gray-900 leading-tight mb-1">{role.id}</div>
                      <div className="text-[10px] text-gray-500 font-medium uppercase">{role.desc}</div>
                      {formData.role === role.id && (
                        <div className="absolute top-3 right-3 text-agriGreen">
                          <CheckCircle2 className="w-5 h-5" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
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
                    Create Account
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-10 text-center">
              <p className="text-gray-500 font-medium">
                Already have an account?{' '}
                <Link to="/login" className="text-agriGreen font-black hover:underline underline-offset-4 decoration-2">
                  Sign In
                </Link>
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Register;
