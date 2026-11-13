import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-charcoal-950">
        <div className="w-12 h-12 rounded-full border-4 border-charcoal-700 border-t-brand-500 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles.length > 0) {
    const isAdmin = user.role === 'ADMIN' || user.is_staff;
    const hasRole = allowedRoles.includes(user.role) || (isAdmin && allowedRoles.includes('ADMIN'));
    
    if (!hasRole) {
      // Redirect to the user's appropriate dashboard
      if (isAdmin) return <Navigate to="/admin/dashboard" replace />;
      if (user.role === 'TRAVELLER') return <Navigate to="/traveller/dashboard" replace />;
      return <Navigate to="/requester/dashboard" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;

