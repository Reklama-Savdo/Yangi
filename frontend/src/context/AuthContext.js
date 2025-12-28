import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();
const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export function AuthProvider({ children }) {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem('admin_token');
    if (token) {
      try {
        const response = await axios.get(`${API}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setAdmin(response.data);
      } catch (error) {
        localStorage.removeItem('admin_token');
      }
    }
    setLoading(false);
  };

  const login = async (email, password) => {
    const response = await axios.post(`${API}/auth/login`, { email, password });
    localStorage.setItem('admin_token', response.data.token);
    setAdmin(response.data.admin);
    return response.data;
  };

  const register = async (email, password, name) => {
    const response = await axios.post(`${API}/auth/register`, { email, password, name });
    localStorage.setItem('admin_token', response.data.token);
    setAdmin(response.data.admin);
    return response.data;
  };

  const logout = () => {
    localStorage.removeItem('admin_token');
    setAdmin(null);
  };

  const getAuthHeader = () => {
    const token = localStorage.getItem('admin_token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  return (
    <AuthContext.Provider value={{
      admin,
      loading,
      login,
      register,
      logout,
      getAuthHeader,
      isAuthenticated: !!admin
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
