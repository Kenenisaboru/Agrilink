import { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const setAuthenticatedUser = (userData) => {
    if (userData?.token) {
      axios.defaults.headers.common.Authorization = `Bearer ${userData.token}`;
    }
    setUser(userData);
  };

  useEffect(() => {
    let active = true;
    localStorage.removeItem('user');
    localStorage.removeItem('token');

    axios.get('/api/auth/profile')
      .then(({ data }) => {
        if (active) setAuthenticatedUser(data);
      })
      .catch((error) => {
        if (error.response?.status !== 401) {
          console.error('Failed to restore session:', error.message);
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const login = async (email, password) => {
    const response = await axios.post('/api/auth/login', { email, password });
    setAuthenticatedUser(response.data);
    return response.data;
  };

  const register = async (userData) => {
    const response = userData instanceof FormData
      ? await axios.post('/api/auth/register', userData)
      : await axios.post('/api/auth/register', userData);
    setAuthenticatedUser(response.data);
    return response.data;
  };

  const logout = () => {
    setUser(null);
    delete axios.defaults.headers.common.Authorization;
    axios.post('/api/auth/logout').catch((error) => {
      console.error('Failed to invalidate server session:', error.message);
    });
  };

  const updateUser = (newData) => {
    setUser(prev => {
      const updated = prev ? { ...prev, ...newData } : prev;
      if (updated?.token) {
        axios.defaults.headers.common.Authorization = `Bearer ${updated.token}`;
      }
      return updated;
    });
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
