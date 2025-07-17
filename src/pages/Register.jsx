import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiUser, FiLock, FiMail, FiPhone, FiUserPlus, FiEye, FiEyeOff } from 'react-icons/fi';
import toast from 'react-hot-toast';
import ReferralCodeInput from '../components/Referral/ReferralCodeInput';

const Register = () => {
  const [form, setForm] = useState({ username: '', password: '', name: '', email: '', phone: '' });
  const [referralCode, setReferralCode] = useState('');
  const [validReferralCode, setValidReferralCode] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleReferralCodeChange = (code, isValid) => {
    setReferralCode(code);
    setValidReferralCode(isValid);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      const registrationData = { ...form };
      
      // Include referral code if provided (even if validation is pending)
      if (referralCode && referralCode.trim()) {
        registrationData.referralCode = referralCode.trim();
        console.log('Sending referral code:', referralCode.trim());
      }
      
      console.log('Registration data:', registrationData);
      
      const res = await fetch('http://localhost:5001/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(registrationData),
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.message || 'Registration failed');
      
      let successMessage = 'Registration successful! You can now login.';
      if (referralCode && validReferralCode) {
        successMessage += ' Your referrer has been rewarded with bonus coins!';
      }
      
      setSuccess(successMessage);
      toast.success('Account created successfully!');
      setForm({ username: '', password: '', name: '', email: '', phone: '' });
      setReferralCode('');
      
      // Redirect to login after 2 seconds
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-white to-green-50 p-4">
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
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-[#2ecc71] via-[#27ae60] to-[#2ecc71] bg-clip-text text-transparent mb-3">
            Join Our Family!
          </h1>
          <p className="text-[#2ecc71]/70 text-sm md:text-base font-medium">Create your account to start shopping</p>
        </motion.div>

        {/* Registration Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6, type: "spring", stiffness: 300 }}
          className="bg-white/90 backdrop-blur-xl p-8 md:p-10 rounded-3xl shadow-2xl shadow-[#2ecc71]/10 border border-green-100/50"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
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
                  name="username"
                  value={form.username}
                  onChange={handleChange}
                  className="pl-12 w-full px-4 py-4 border-0 rounded-2xl bg-[#f8faf8]/50 backdrop-blur-sm focus:ring-2 focus:ring-[#2ecc71]/50 focus:bg-white/80 transition-all duration-300 text-gray-800 placeholder-[#2ecc71]/50 shadow-lg shadow-[#2ecc71]/5 border border-green-100/50"
                  placeholder="Choose a username"
                  required
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
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  className="pl-12 pr-12 w-full px-4 py-4 border-0 rounded-2xl bg-[#f8faf8]/50 backdrop-blur-sm focus:ring-2 focus:ring-[#2ecc71]/50 focus:bg-white/80 transition-all duration-300 text-gray-800 placeholder-[#2ecc71]/50 shadow-lg shadow-[#2ecc71]/5 border border-green-100/50"
                  placeholder="Create a password"
                  required
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

            {/* Full Name Field */}
            <div className="relative">
              <label className="block text-sm font-semibold text-[#27ae60] mb-2">
                Full Name
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-[#2ecc71]/60">
                  <FiUserPlus className="w-5 h-5" />
                </span>
                <motion.input
                  whileFocus={{ scale: 1.01 }}
                  transition={{ type: "spring", stiffness: 400 }}
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  className="pl-12 w-full px-4 py-4 border-0 rounded-2xl bg-[#f8faf8]/50 backdrop-blur-sm focus:ring-2 focus:ring-[#2ecc71]/50 focus:bg-white/80 transition-all duration-300 text-gray-800 placeholder-[#2ecc71]/50 shadow-lg shadow-[#2ecc71]/5 border border-green-100/50"
                  placeholder="Enter your full name"
                  required
                />
              </div>
            </div>

            {/* Email Field */}
            <div className="relative">
              <label className="block text-sm font-semibold text-[#27ae60] mb-2">
                Email Address
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-[#2ecc71]/60">
                  <FiMail className="w-5 h-5" />
                </span>
                <motion.input
                  whileFocus={{ scale: 1.01 }}
                  transition={{ type: "spring", stiffness: 400 }}
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  className="pl-12 w-full px-4 py-4 border-0 rounded-2xl bg-[#f8faf8]/50 backdrop-blur-sm focus:ring-2 focus:ring-[#2ecc71]/50 focus:bg-white/80 transition-all duration-300 text-gray-800 placeholder-[#2ecc71]/50 shadow-lg shadow-[#2ecc71]/5 border border-green-100/50"
                  placeholder="Enter your email address"
                  required
                />
              </div>
            </div>

            {/* Phone Field */}
            <div className="relative">
              <label className="block text-sm font-semibold text-[#27ae60] mb-2">
                Phone Number
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-[#2ecc71]/60">
                  <FiPhone className="w-5 h-5" />
                </span>
                <motion.input
                  whileFocus={{ scale: 1.01 }}
                  transition={{ type: "spring", stiffness: 400 }}
                  type="tel"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  className="pl-12 w-full px-4 py-4 border-0 rounded-2xl bg-[#f8faf8]/50 backdrop-blur-sm focus:ring-2 focus:ring-[#2ecc71]/50 focus:bg-white/80 transition-all duration-300 text-gray-800 placeholder-[#2ecc71]/50 shadow-lg shadow-[#2ecc71]/5 border border-green-100/50"
                  placeholder="Enter your phone number"
                  required
                />
              </div>
            </div>

            {/* Referral Code Input */}
            <ReferralCodeInput 
              onCodeChange={handleReferralCodeChange}
              initialCode={referralCode}
            />

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

            {/* Success Message */}
            <AnimatePresence>
              {success && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 400 }}
                  className="bg-green-50/80 backdrop-blur-sm text-[#2ecc71] px-6 py-4 rounded-2xl text-sm font-medium border border-green-200/50 shadow-lg shadow-green-500/5"
                >
                  {success}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Submit Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className={`w-full py-4 px-6 rounded-2xl text-white font-semibold transition-all duration-300 text-base shadow-2xl ${
                loading 
                  ? 'bg-[#2ecc71]/70 cursor-not-allowed shadow-[#2ecc71]/20' 
                  : 'bg-gradient-to-r from-[#2ecc71] to-[#27ae60] hover:shadow-lg hover:shadow-[#2ecc71]/30'
              }`}
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin mr-3" />
                  Creating Account...
                </div>
              ) : (
                'Create Account'
              )}
            </motion.button>
          </form>

          {/* Login Link */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="mt-6 md:mt-8 text-center"
          >
            <p className="text-[#2ecc71]/70 text-sm md:text-base">
              Already have an account?{' '}
              <Link 
                to="/login" 
                className="text-[#2ecc71] hover:text-[#27ae60] font-semibold transition-colors hover:underline decoration-2 underline-offset-2"
              >
                Sign in
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
          By creating an account, you agree to our{' '}
          <a href="#" className="text-[#2ecc71] hover:text-[#27ae60] font-medium hover:underline">Terms of Service</a>
          {' '}and{' '}
          <a href="#" className="text-[#2ecc71] hover:text-[#27ae60] font-medium hover:underline">Privacy Policy</a>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Register;
