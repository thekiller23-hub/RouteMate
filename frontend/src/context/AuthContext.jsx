import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('rm_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('rm_access_token');
      if (token) {
        try {
          const res = await api.get('/auth/me/');
          setUser(res.data.user);
          localStorage.setItem('rm_user', JSON.stringify(res.data.user));
        } catch (err) {
          console.warn('Session expired or invalid token');
          localStorage.removeItem('rm_access_token');
          localStorage.removeItem('rm_refresh_token');
          localStorage.removeItem('rm_user');
          setUser(null);
        }
      }
      setLoading(false);
    };
    initAuth();
  }, []);

  const login = async (credential, password) => {
    const res = await api.post('/auth/login/', { credential, password });
    const { user: userData, tokens, dashboard_redirect } = res.data;
    localStorage.setItem('rm_access_token', tokens.access);
    localStorage.setItem('rm_refresh_token', tokens.refresh);
    localStorage.setItem('rm_user', JSON.stringify(userData));
    setUser(userData);
    return { user: userData, dashboard_redirect };
  };

  const register = async (formData) => {
    const res = await api.post('/auth/register/', formData);
    const { user: userData, tokens, dashboard_redirect } = res.data;
    localStorage.setItem('rm_access_token', tokens.access);
    localStorage.setItem('rm_refresh_token', tokens.refresh);
    localStorage.setItem('rm_user', JSON.stringify(userData));
    setUser(userData);
    return { user: userData, dashboard_redirect };
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout/');
    } catch (e) {
      // ignore network errors on logout
    }
    localStorage.removeItem('rm_access_token');
    localStorage.removeItem('rm_refresh_token');
    localStorage.removeItem('rm_user');
    setUser(null);
  };

  const getDashboardPath = () => {
    if (!user) return '/login';
    if (user.role === 'ADMIN' || user.is_staff) return '/admin/dashboard';
    if (user.role === 'TRAVELLER') return '/traveller/dashboard';
    return '/requester/dashboard';
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        isAuthenticated: !!user,
        getDashboardPath,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

