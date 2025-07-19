import React, { useState, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';

const SubAdminRouteGuard = ({ children, requiredRole = null }) => {
  const [loading, setLoading] = useState(true);
  const [subAdmin, setSubAdmin] = useState(null);
  const [error, setError] = useState('');
  const location = useLocation();

  useEffect(() => {
    const checkSubAdminAuth = async () => {
      try {
        console.log('[SUB ADMIN GUARD] Starting auth check...');
        
        // Get token from storage
        const token = localStorage.getItem('subAdminToken') || sessionStorage.getItem('subAdminToken');
        
        console.log('[SUB ADMIN GUARD] Token found:', !!token);
        console.log('[SUB ADMIN GUARD] Required role:', requiredRole);
        
        if (!token) {
          console.log('[SUB ADMIN GUARD] No token found, redirecting to login');
          setLoading(false);
          return;
        }

        // Verify token with backend
        const apiUrl = 'https://indiraa1-backend.onrender.com';
        console.log('[SUB ADMIN GUARD] Verifying token with backend...');
        
        const response = await fetch(`${apiUrl}/api/sub-admin/profile`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          console.log('[SUB ADMIN GUARD] Token verification failed:', response.status);
          // Token is invalid, clear storage
          localStorage.removeItem('subAdminToken');
          localStorage.removeItem('subAdminData');
          sessionStorage.removeItem('subAdminToken');
          sessionStorage.removeItem('subAdminData');
          
          throw new Error('Invalid or expired token');
        }

        const data = await response.json();
        console.log('[SUB ADMIN GUARD] Profile response:', data);
        
        if (data.success && data.subAdmin) {
          console.log('[SUB ADMIN GUARD] Authentication successful for:', data.subAdmin.email);
          console.log('[SUB ADMIN GUARD] Sub admin role:', data.subAdmin.role);
          console.log('[SUB ADMIN GUARD] Sub admin active status:', data.subAdmin.isActive);
          console.log('[SUB ADMIN GUARD] Email verified:', data.subAdmin.isEmailVerified);
          
          setSubAdmin(data.subAdmin);
          
          // Update stored data
          const storage = localStorage.getItem('subAdminToken') ? localStorage : sessionStorage;
          storage.setItem('subAdminData', JSON.stringify(data.subAdmin));
        } else {
          throw new Error('Invalid sub admin data');
        }
      } catch (error) {
        console.error('[SUB ADMIN GUARD] Auth check error:', error);
        setError(error.message);
        
        // Clear any stored data on error
        localStorage.removeItem('subAdminToken');
        localStorage.removeItem('subAdminData');
        sessionStorage.removeItem('subAdminToken');
        sessionStorage.removeItem('subAdminData');
      } finally {
        setLoading(false);
      }
    };

    checkSubAdminAuth();
  }, []);

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Verifying access...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!subAdmin || error) {
    return (
      <Navigate 
        to="/sub-admin/login" 
        state={{ 
          from: location.pathname,
          error: error || 'Please login to access this page'
        }} 
        replace 
      />
    );
  }

  // Check role requirement
  if (requiredRole && subAdmin.role !== requiredRole) {
    console.log('[SUB ADMIN GUARD] Role mismatch!');
    console.log('[SUB ADMIN GUARD] Required role:', requiredRole);
    console.log('[SUB ADMIN GUARD] User role:', subAdmin.role);
    
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto">
          <div className="bg-red-100 rounded-full p-4 mx-auto w-16 h-16 flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600 mb-4">
            You don't have permission to access this page. Required role: {requiredRole}
          </p>
          <p className="text-sm text-gray-500">
            Your role: {subAdmin.roleDisplayName}
          </p>
          <button
            onClick={() => window.history.back()}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // Check if account is active
  if (!subAdmin.isActive) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto">
          <div className="bg-yellow-100 rounded-full p-4 mx-auto w-16 h-16 flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Account Deactivated</h2>
          <p className="text-gray-600 mb-4">
            Your account has been deactivated. Please contact the administrator for assistance.
          </p>
          <button
            onClick={() => {
              localStorage.removeItem('subAdminToken');
              localStorage.removeItem('subAdminData');
              sessionStorage.removeItem('subAdminToken');
              sessionStorage.removeItem('subAdminData');
              window.location.href = '/sub-admin/login';
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Login with Different Account
          </button>
        </div>
      </div>
    );
  }

  // Access granted
  console.log('[SUB ADMIN GUARD] Access granted to:', subAdmin.email);
  console.log('[SUB ADMIN GUARD] Role check passed:', requiredRole ? `${subAdmin.role} === ${requiredRole}` : 'No role requirement');

  // Render protected content
  return children;
};

export default SubAdminRouteGuard;
