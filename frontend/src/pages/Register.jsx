import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Lock, MapPin, Phone, GraduationCap } from 'lucide-react';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'Farmer',
    location: '',
    mpesaNumber: '',
    university: ''
  });
  const [error, setError] = useState(null);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      const { data } = await axios.post('http://localhost:5000/api/auth/register', formData);
      login(data);
      navigate(`/dashboard/${data.role.toLowerCase()}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="flex justify-center items-center py-10">
      <div className="card p-8 w-full max-w-lg border-t-4 border-agriGreen">
        <h2 className="text-3xl font-bold text-center text-agriDark mb-6">Create Account</h2>
        
        {error && (
          <div className="bg-red-100 text-red-700 p-3 rounded mb-4 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-700 mb-2 font-medium">Role</label>
            <select 
              name="role" 
              value={formData.role} 
              onChange={handleChange} 
              className="input-field"
            >
              <option value="Farmer">Farmer (Sell crops & get problems solved)</option>
              <option value="Student">Student (Provide agricultural solutions)</option>
              <option value="Buyer">Buyer (Buy fresh crops)</option>
            </select>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 mb-2 font-medium">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-3 text-gray-400" size={20} />
                <input type="text" name="name" onChange={handleChange} className="input-field pl-10" required />
              </div>
            </div>

            <div>
              <label className="block text-gray-700 mb-2 font-medium">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 text-gray-400" size={20} />
                <input type="email" name="email" onChange={handleChange} className="input-field pl-10" required />
              </div>
            </div>
          </div>

          <div>
             <label className="block text-gray-700 mb-2 font-medium">Password</label>
             <div className="relative">
               <Lock className="absolute left-3 top-3 text-gray-400" size={20} />
               <input type="password" name="password" onChange={handleChange} className="input-field pl-10" required />
             </div>
          </div>

          {/* Conditional Fields based on Role */}
          {formData.role !== 'Student' && (
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 mb-2 font-medium">Location</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 text-gray-400" size={20} />
                  <select name="location" onChange={handleChange} className="input-field pl-10">
                    <option value="">Select Location</option>
                    <option value="Harar">Harar</option>
                    <option value="Haramaya">Haramaya</option>
                    <option value="Dire Dawa">Dire Dawa</option>
                    <option value="Jigjiga">Jigjiga</option>
                    <option value="Oda Bultum">Oda Bultum</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-gray-700 mb-2 font-medium">M-Pesa Number</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 text-gray-400" size={20} />
                  <input type="text" name="mpesaNumber" onChange={handleChange} className="input-field pl-10" placeholder="e.g. +2519..." />
                </div>
              </div>
            </div>
          )}

          {formData.role === 'Student' && (
             <div>
                <label className="block text-gray-700 mb-2 font-medium">University</label>
                <div className="relative">
                  <GraduationCap className="absolute left-3 top-3 text-gray-400" size={20} />
                  <input type="text" name="university" onChange={handleChange} className="input-field pl-10" placeholder="e.g. Haramaya University" required />
                </div>
             </div>
          )}

          <button type="submit" className="btn-primary w-full py-3 mt-4 text-lg">
            Register Account
          </button>
        </form>

        <p className="mt-6 text-center text-gray-600">
          Already have an account? <Link to="/login" className="text-agriGreen font-bold hover:underline">Login here</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
