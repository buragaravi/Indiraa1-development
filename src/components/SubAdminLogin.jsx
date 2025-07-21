import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FaEye, FaEyeSlash, FaUserShield, FaEnvelope, FaLock, FaExclamationTriangle } from 'react-icons/fa';

const SubAdminLogin = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const navigate = useNavigate();

  // Check if already logged in
  useEffect(() => {
    const token = localStorage.getItem('subAdminToken') || sessionStorage.getItem('subAdminToken');
    if (token) {
      navigate('/sub-admin/dashboard');
    }
  }, [navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (error) setError('');
  };

  const validateForm = () => {
    if (!formData.email || !formData.password) {
      setError('Email and password are required');
      return false;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError('Please enter a valid email address');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    setError('');

    try {
      const apiUrl = 'https://indiraa1-backend.onrender.com';
      const response = await fetch(`${apiUrl}/api/sub-admin/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      if (data.success) {
        // Store token based on remember me preference
        const storage = rememberMe ? localStorage : sessionStorage;
        storage.setItem('subAdminToken', data.token);
        storage.setItem('subAdminData', JSON.stringify(data.subAdmin));

        console.log('[SUB ADMIN LOGIN] Login successful:', data.subAdmin.email);
        console.log('[SUB ADMIN LOGIN] Sub admin role:', data.subAdmin.role);
        console.log('[SUB ADMIN LOGIN] Sub admin permissions:', data.subAdmin.permissions);
        console.log('[SUB ADMIN LOGIN] Sub admin access_level:', data.subAdmin.access_level);
        console.log('[SUB ADMIN LOGIN] Token stored in:', rememberMe ? 'localStorage' : 'sessionStorage');
        console.log('[SUB ADMIN LOGIN] Stored token:', storage.getItem('subAdminToken'));
        console.log('[SUB ADMIN LOGIN] Stored data:', storage.getItem('subAdminData'));

        // Navigate to role-specific dashboard
        const dashboardPath = `/sub-admin/${data.subAdmin.role}/`;
        console.log('[SUB ADMIN LOGIN] Navigating to:', dashboardPath);
        navigate(dashboardPath);
      } else {
        setError(data.message || 'Login failed');
      }
    } catch (error) {
      console.error('[SUB ADMIN LOGIN] Error:', error);
      
      // Handle specific error types
      if (error.message.includes('Account is temporarily locked')) {
        setError('Account is locked due to multiple failed attempts. Please try again later or contact administrator.');
      } else if (error.message.includes('Account has been deactivated')) {
        setError('Your account has been deactivated. Please contact administrator.');
      } else if (error.message.includes('Invalid email or password')) {
        setError('Invalid email or password. Please try again.');
      } else {
        setError(error.message || 'Login failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center mb-4">
            <FaUserShield className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Sub Admin Portal
          </h2>
          <p className="text-gray-600">
            Sign in to access your management dashboard
          </p>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Error Display */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start space-x-3">
                <FaExclamationTriangle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-red-800 text-sm font-medium">Login Failed</p>
                  <p className="text-red-700 text-sm mt-1">{error}</p>
                </div>
              </div>
            )}

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaEnvelope className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  placeholder="Enter your email address"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaLock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                  className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? (
                    <FaEyeSlash className="h-5 w-5" />
                  ) : (
                    <FaEye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                  Remember me
                </label>
              </div>
              <div className="text-sm">
                <Link 
                  to="/sub-admin/forgot-password" 
                  className="text-blue-600 hover:text-blue-500 font-medium transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              {loading ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Signing in...</span>
                </div>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          {/* Footer Links */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Need help? {' '}
              <Link 
                to="/contact" 
                className="text-blue-600 hover:text-blue-500 font-medium transition-colors"
              >
                Contact Administrator
              </Link>
            </p>
            <div className="mt-4 pt-4 border-t border-gray-200">
              <Link 
                to="/login" 
                className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
              >
                ← Back to Main Admin Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubAdminLogin;
