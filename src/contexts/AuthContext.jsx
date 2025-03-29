import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../utils/api';
import { useAlert } from './AlertContext';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const { setAlert } = useAlert();

  // Load user from token on initial load
  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem('token');
      
      if (token) {
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        try {
          const res = await api.get('/api/auth/user');
          setCurrentUser(res.data.user);
          setIsAuthenticated(true);
        } catch (err) {
          // Token is invalid or expired
          localStorage.removeItem('token');
          delete api.defaults.headers.common['Authorization'];
        }
      }
      
      setLoading(false);
    };
    
    loadUser();
  }, []);

  // Login
  const login = async (email, password) => {
    try {
      const res = await api.post('/api/auth/login', { email, password });
      
      if (res.data.token) {
        localStorage.setItem('token', res.data.token);
        api.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;
        
        setCurrentUser(res.data.user);
        setIsAuthenticated(true);
        
        return { success: true };
      }
    } catch (err) {
      const message = err.response && err.response.data && err.response.data.message
        ? err.response.data.message
        : 'Login failed. Please check your credentials.';
      
      setAlert(message, 'error');
      return { success: false, message };
    }
  };

  // Register
  const register = async (username, email, password) => {
    try {
      const res = await api.post('/api/auth/register', { 
        username, 
        email, 
        password 
      });
      
      if (res.data.token) {
        localStorage.setItem('token', res.data.token);
        api.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;
        
        setCurrentUser(res.data.user);
        setIsAuthenticated(true);
        
        return { success: true };
      }
    } catch (err) {
      const message = err.response && err.response.data && err.response.data.message
        ? err.response.data.message
        : 'Registration failed. Please try again.';
      
      setAlert(message, 'error');
      return { success: false, message };
    }
  };

  // Logout
  const logout = () => {
    localStorage.removeItem('token');
    delete api.defaults.headers.common['Authorization'];
    setCurrentUser(null);
    setIsAuthenticated(false);
  };

  // Update user settings
  const updateSettings = async (settings) => {
    try {
      const res = await api.put('/api/auth/user', { settings });
      
      setCurrentUser({
        ...currentUser,
        settings: res.data.user.settings
      });
      
      setAlert('Settings updated successfully', 'success');
      return { success: true };
    } catch (err) {
      const message = err.response && err.response.data && err.response.data.message
        ? err.response.data.message
        : 'Failed to update settings. Please try again.';
      
      setAlert(message, 'error');
      return { success: false, message };
    }
  };

  // Change password
  const changePassword = async (currentPassword, newPassword) => {
    try {
      await api.put('/api/auth/password', { 
        currentPassword, 
        newPassword 
      });
      
      setAlert('Password changed successfully', 'success');
      return { success: true };
    } catch (err) {
      const message = err.response && err.response.data && err.response.data.message
        ? err.response.data.message
        : 'Failed to change password. Please try again.';
      
      setAlert(message, 'error');
      return { success: false, message };
    }
  };

  const value = {
    currentUser,
    isAuthenticated,
    loading,
    login,
    register,
    logout,
    updateSettings,
    changePassword
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export default AuthContext;