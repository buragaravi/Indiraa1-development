import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiUser, FiLock, FiEye, FiEyeOff, FiShield, FiUsers } from 'react-icons/fi';
import toast from 'react-hot-toast';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loginType, setLoginType] = useState('user'); // 'user' or 'admin'
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      setError('Please fill in all fields');
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      // Determine the endpoint based on login type
      const endpoint = loginType === 'admin' 
        ? 'https://indiraa1-backend.onrender.com/api/auth/admin/login'
        : 'https://indiraa1-backend.onrender.com/api/auth/login';
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        localStorage.setItem('token', data.token);
        
        // Store user/admin data based on login type
        if (loginType === 'admin') {
          localStorage.setItem('adminToken', data.token); // Store as adminToken for admin
          localStorage.setItem('admin', JSON.stringify(data.admin || data.user));
          localStorage.setItem('userType', 'admin');
          toast.success('Admin login successful!');
          navigate('/admin');
        } else {
          localStorage.setItem('token', data.token); // Store as token for regular users
          localStorage.setItem('user', JSON.stringify(data.user));
          localStorage.setItem('userType', 'user');
          toast.success('Login successful!');
          navigate('/');
        }
      } else {
        setError(data.message || 'Login failed');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };  return (
    <div className="min-h-screen flex items-center justify-center login-bg p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, type: "spring", stiffness: 300 }}
        className="w-full max-w-md"
      >
        {/* Logo/Brand */}
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, type: "spring", stiffness: 300 }}
          className="text-center mb-8 md:mb-10"
        >
          <h1 className="text-3xl md:text-4xl font-bold login-title mb-3">
            Welcome Back!
          </h1>
          <p className="text-[#2ecc71]/70 text-sm md:text-base font-medium">Sign in to continue your shopping journey</p>
        </motion.div>

        {/* Login Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6, type: "spring", stiffness: 300 }}
          className="bg-white/90 backdrop-blur-xl p-8 md:p-10 rounded-3xl shadow-2xl shadow-[#2ecc71]/10 border border-green-100/50"
        >
          {/* Login Type Toggle */}
          <div className="mb-6 md:mb-8">
            <div className="flex items-center justify-center p-2 bg-[#f8faf8]/80 backdrop-blur-sm rounded-2xl border border-green-100/50">
              <motion.button
                type="button"
                onClick={() => setLoginType('user')}
                className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-2xl font-semibold transition-all duration-300 text-sm md:text-base ${
                  loginType === 'user'
                    ? 'login-tab-active text-white shadow-lg shadow-[#2ecc71]/25'
                    : 'text-[#2ecc71] hover:text-[#27ae60] hover:bg-[#f8faf8]'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <FiUsers className="w-4 h-4" />
                User Login
              </motion.button>
              <motion.button
                type="button"
                onClick={() => setLoginType('admin')}
                className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-2xl font-semibold transition-all duration-300 text-sm md:text-base ${
                  loginType === 'admin'
                    ? 'login-tab-active text-white shadow-lg shadow-[#2ecc71]/25'
                    : 'text-[#2ecc71] hover:text-[#27ae60] hover:bg-[#f8faf8]'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <FiShield className="w-4 h-4" />
                Admin Login
              </motion.button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 md:space-y-8">
            {/* Username Field */}
            <div className="relative">
              <label className="block text-sm font-semibold text-[#27ae60] mb-2">
                Username
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-[#2ecc71]/60">
                  <FiUser className="w-5 h-5" />
                </span>
                <motion.input
                  whileFocus={{ scale: 1.01 }}
                  transition={{ type: "spring", stiffness: 400 }}
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="pl-12 w-full px-4 py-4 border-0 rounded-2xl bg-[#f8faf8]/50 backdrop-blur-sm focus:ring-2 focus:ring-[#2ecc71]/50 focus:bg-white/80 transition-all duration-300 text-gray-800 placeholder-[#2ecc71]/50 shadow-lg shadow-[#2ecc71]/5 border border-green-100/50"
                  placeholder="Enter your username"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="relative">
              <label className="block text-sm font-semibold text-[#27ae60] mb-2">
                Password
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-[#2ecc71]/60">
                  <FiLock className="w-5 h-5" />
                </span>
                <motion.input
                  whileFocus={{ scale: 1.01 }}
                  transition={{ type: "spring", stiffness: 400 }}
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-12 pr-12 w-full px-4 py-4 border-0 rounded-2xl bg-[#f8faf8]/50 backdrop-blur-sm focus:ring-2 focus:ring-[#2ecc71]/50 focus:bg-white/80 transition-all duration-300 text-gray-800 placeholder-[#2ecc71]/50 shadow-lg shadow-[#2ecc71]/5 border border-green-100/50"
                  placeholder="Enter your password"
                />
                <motion.button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-[#2ecc71]/60 hover:text-[#2ecc71] transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  {showPassword ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
                </motion.button>
              </div>
            </div>

            {/* Error Message */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 400 }}
                  className="bg-red-50/80 backdrop-blur-sm text-red-600 px-6 py-4 rounded-2xl text-sm font-medium border border-red-200/50 shadow-lg shadow-red-500/5"
                >
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Submit Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={isLoading}
              className={`w-full py-4 px-6 rounded-2xl text-white font-semibold transition-all duration-300 text-base shadow-2xl ${
                isLoading 
                  ? 'bg-[#2ecc71]/70 cursor-not-allowed shadow-[#2ecc71]/20' 
                  : 'login-btn hover:shadow-lg hover:shadow-[#2ecc71]/30'
              }`}
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin mr-3" />
                  Signing in...
                </div>
              ) : (
                'Sign In'
              )}
            </motion.button>
          </form>

          {/* Forgot Password Link */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.35, duration: 0.6 }}
            className="mt-4 text-center"
          >
            <Link 
              to="/forgot-password" 
              className="text-[#2ecc71]/80 hover:text-[#2ecc71] text-sm transition-colors hover:underline decoration-2 underline-offset-2"
            >
              Forgot your password?
            </Link>
          </motion.div>

          {/* Register Link */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="mt-6 md:mt-8 text-center"
          >
            <p className="text-[#2ecc71]/70 text-sm md:text-base">
              Don't have an account?{' '}
              <Link 
                to="/register" 
                className="text-[#2ecc71] hover:text-[#27ae60] font-semibold transition-colors hover:underline decoration-2 underline-offset-2"
              >
                Create one
              </Link>
            </p>
          </motion.div>
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="text-center mt-8 md:mt-10 text-xs md:text-sm text-[#2ecc71]/60"
        >
          By signing in, you agree to our{' '}
          <a href="#" className="text-[#2ecc71] hover:text-[#27ae60] font-medium hover:underline">Terms of Service</a>
          {' '}and{' '}
          <a href="#" className="text-[#2ecc71] hover:text-[#27ae60] font-medium hover:underline">Privacy Policy</a>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Login;
