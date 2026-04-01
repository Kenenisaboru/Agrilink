import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Lock, Mail } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      const { data } = await axios.post('http://localhost:5000/api/auth/login', {
        email,
        password
      });
      
      login(data);
      // Navigate to dashboard based on role
      navigate(`/dashboard/${data.role.toLowerCase()}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="flex justify-center items-center min-h-[70vh]">
      <div className="card p-8 w-full max-w-md border-t-4 border-agriGreen">
        <h2 className="text-3xl font-bold text-center text-agriDark mb-6">Welcome Back</h2>
        
        {error && (
          <div className="bg-red-100 text-red-700 p-3 rounded mb-4 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-700 mb-2 font-medium">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 text-gray-400" size={20} />
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field pl-10" 
                placeholder="Enter your email" 
                required 
              />
            </div>
          </div>
          
          <div>
            <label className="block text-gray-700 mb-2 font-medium">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 text-gray-400" size={20} />
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field pl-10" 
                placeholder="Enter your password" 
                required 
              />
            </div>
          </div>

          <button type="submit" className="btn-primary w-full py-3 mt-4 text-lg">
            Login
          </button>
        </form>

        <p className="mt-6 text-center text-gray-600">
          Don't have an account? <Link to="/register" className="text-agriGreen font-bold hover:underline">Register here</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
