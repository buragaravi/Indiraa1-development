import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../utils/useAuth';

const AdminProtectedRoute = ({ children }) => {
  const { token, isAdmin, admin, permissionsLoading } = useAuth();
  const location = useLocation();

  // Check if user has valid admin session
  const hasValidAdminSession = () => {
    const storedToken = localStorage.getItem('token') || localStorage.getItem('adminToken');
    const storedAdmin = localStorage.getItem('admin');
    const userType = localStorage.getItem('userType');
    
    return storedToken && storedAdmin && userType === 'admin';
  };

  // If still loading permissions, show loading state
  if (permissionsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  // Check authentication
  if (!token && !hasValidAdminSession()) {
    console.log('🚫 No valid admin session found - redirecting to login');
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check if user is admin
  if (!isAdmin && !hasValidAdminSession()) {
    console.log('🚫 User is not an admin - redirecting to login');
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Valid admin session
  return children;
};

export default AdminProtectedRoute;
