import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const ProtectedRoute = ({ children, requiredPermissions = [], requiredRoles = [] }) => {
  const { isAuthenticated, isLoading, user, hasPermission, hasRole } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Redirect to login with return URL
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check required roles
  if (requiredRoles.length > 0 && !requiredRoles.some(role => hasRole(role))) {
    return <Navigate to="/unauthorized" replace />;
  }

  // Check required permissions
  if (requiredPermissions.length > 0 && !requiredPermissions.every(permission => hasPermission(permission))) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

export default ProtectedRoute;
