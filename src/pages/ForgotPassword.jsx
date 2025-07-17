import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiMail, 
  FiLock, 
  FiEye, 
  FiEyeOff, 
  FiArrowLeft, 
  FiCheck,
  FiLoader,
  FiAlertCircle,
  FiRefreshCw,
  FiShield,
  FiClock
} from 'react-icons/fi';
import toast from 'react-hot-toast';

const ForgotPassword = () => {
  const navigate = useNavigate();
  
  // Multi-step state
  const [currentStep, setCurrentStep] = useState('identifier'); // 'identifier', 'otp', 'password', 'success'
  
  // Form data
  const [identifier, setIdentifier] = useState('');
  const [sessionToken, setSessionToken] = useState('');
  const [maskedEmail, setMaskedEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resetToken, setResetToken] = useState('');
  
  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [otpCountdown, setOtpCountdown] = useState(0);

  // Step 1: Submit email/username
  const handleSubmitIdentifier = async (e) => {
    e.preventDefault();
    if (!identifier.trim()) {
      setError('Please enter your email or username');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:5001/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ identifier: identifier.trim() })
      });

      const data = await response.json();

      if (response.ok) {
        setSessionToken(data.sessionToken);
        setMaskedEmail(data.maskedEmail);
        setCurrentStep('otp');
        toast.success('Password reset code sent to your email!');
        
        // Start OTP countdown
        setOtpCountdown(600); // 10 minutes
        const countdown = setInterval(() => {
          setOtpCountdown(prev => {
            if (prev <= 1) {
              clearInterval(countdown);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      } else {
        setError(data.message || 'Failed to send reset code');
      }
    } catch (error) {
      console.error('Forgot password error:', error);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    if (!otp.trim()) {
      setError('Please enter the verification code');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:5001/api/auth/verify-reset-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          sessionToken: sessionToken, 
          otp: otp.trim() 
        })
      });

      const data = await response.json();

      if (response.ok) {
        setResetToken(data.resetToken);
        setCurrentStep('password');
        toast.success('Code verified! Set your new password.');
      } else {
        setError(data.message || 'Invalid verification code');
      }
    } catch (error) {
      console.error('OTP verification error:', error);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Reset password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    
    if (!newPassword || !confirmPassword) {
      setError('Please fill in both password fields');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:5001/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          resetToken,
          newPassword,
          confirmPassword
        })
      });

      const data = await response.json();

      if (response.ok) {
        setCurrentStep('success');
        toast.success('Password reset successfully!');
      } else {
        setError(data.message || 'Failed to reset password');
      }
    } catch (error) {
      console.error('Password reset error:', error);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP
  const handleResendOTP = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:5001/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ identifier: identifier.trim() })
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('New verification code sent!');
        setOtpCountdown(600);
        const countdown = setInterval(() => {
          setOtpCountdown(prev => {
            if (prev <= 1) {
              clearInterval(countdown);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      } else {
        setError(data.message || 'Failed to resend code');
      }
    } catch (error) {
      console.error('Resend OTP error:', error);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getStepTitle = () => {
    switch (currentStep) {
      case 'identifier': return 'Forgot Password';
      case 'otp': return 'Verify Your Email';
      case 'password': return 'Create New Password';
      case 'success': return 'Password Reset Complete';
      default: return 'Forgot Password';
    }
  };

  const getStepDescription = () => {
    switch (currentStep) {
      case 'identifier': return 'Enter your email or username to receive a reset code';
      case 'otp': return `Enter the verification code sent to ${maskedEmail}`;
      case 'password': return 'Choose a strong password for your account';
      case 'success': return 'Your password has been reset successfully';
      default: return '';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <motion.div 
        className="max-w-md w-full space-y-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Header */}
        <div className="text-center">
          <motion.div
            className="mx-auto h-16 w-16 bg-gradient-to-r from-red-500 to-red-600 rounded-2xl flex items-center justify-center shadow-lg mb-6"
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ duration: 0.8, type: "spring", stiffness: 200 }}
          >
            <FiLock className="h-8 w-8 text-white" />
          </motion.div>
          <h2 className="text-3xl font-bold text-gray-900">{getStepTitle()}</h2>
          <p className="mt-2 text-sm text-gray-600">{getStepDescription()}</p>
        </div>

        {/* Progress Indicator */}
        <div className="flex justify-center space-x-2">
          {['identifier', 'otp', 'password', 'success'].map((step, index) => (
            <motion.div
              key={step}
              className={`w-3 h-3 rounded-full ${
                currentStep === step 
                  ? 'bg-red-500' 
                  : ['identifier', 'otp', 'password', 'success'].indexOf(currentStep) > index
                  ? 'bg-green-500'
                  : 'bg-gray-300'
              }`}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: index * 0.1 }}
            />
          ))}
        </div>

        {/* Main Content */}
        <motion.div 
          className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8"
          layout
        >
          <AnimatePresence mode="wait">
            {/* Step 1: Enter Email/Username */}
            {currentStep === 'identifier' && (
              <motion.form
                key="identifier"
                className="space-y-6"
                onSubmit={handleSubmitIdentifier}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
              >
                <div>
                  <label htmlFor="identifier" className="block text-sm font-medium text-gray-700 mb-2">
                    Email or Username
                  </label>
                  <div className="relative">
                    <FiMail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <input
                      id="identifier"
                      type="text"
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                      placeholder="Enter your email or username"
                      required
                    />
                  </div>
                </div>

                {error && (
                  <motion.div 
                    className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                  >
                    <FiAlertCircle className="text-red-500 h-4 w-4 flex-shrink-0" />
                    <span className="text-red-700 text-sm">{error}</span>
                  </motion.div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-red-500 to-red-600 text-white py-3 px-4 rounded-xl hover:from-red-600 hover:to-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-all duration-200 shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <FiLoader className="animate-spin h-5 w-5" />
                  ) : (
                    <FiMail className="h-5 w-5" />
                  )}
                  {loading ? 'Sending...' : 'Send Reset Code'}
                </button>
              </motion.form>
            )}

            {/* Step 2: Verify OTP */}
            {currentStep === 'otp' && (
              <motion.form
                key="otp"
                className="space-y-6"
                onSubmit={handleVerifyOTP}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="text-center">
                  <motion.div
                    className="mx-auto h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center mb-4"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    <FiShield className="h-6 w-6 text-blue-600" />
                  </motion.div>
                  <p className="text-sm text-gray-600">
                    We sent a 6-digit verification code to your email
                  </p>
                </div>

                <div>
                  <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-2">
                    Verification Code
                  </label>
                  <input
                    id="otp"
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors text-center text-lg font-mono tracking-widest"
                    placeholder="000000"
                    maxLength="6"
                    required
                  />
                </div>

                {/* Countdown Timer */}
                {otpCountdown > 0 && (
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                      <FiClock className="h-4 w-4" />
                      <span>Code expires in {formatTime(otpCountdown)}</span>
                    </div>
                  </div>
                )}

                {error && (
                  <motion.div 
                    className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                  >
                    <FiAlertCircle className="text-red-500 h-4 w-4 flex-shrink-0" />
                    <span className="text-red-700 text-sm">{error}</span>
                  </motion.div>
                )}

                <div className="space-y-3">
                  <button
                    type="submit"
                    disabled={loading || otp.length !== 6}
                    className="w-full bg-gradient-to-r from-red-500 to-red-600 text-white py-3 px-4 rounded-xl hover:from-red-600 hover:to-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-all duration-200 shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <FiLoader className="animate-spin h-5 w-5" />
                    ) : (
                      <FiCheck className="h-5 w-5" />
                    )}
                    {loading ? 'Verifying...' : 'Verify Code'}
                  </button>

                  {otpCountdown === 0 && (
                    <button
                      type="button"
                      onClick={handleResendOTP}
                      disabled={loading}
                      className="w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-xl hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all duration-200 flex items-center justify-center gap-2"
                    >
                      <FiRefreshCw className="h-4 w-4" />
                      Resend Code
                    </button>
                  )}
                </div>
              </motion.form>
            )}

            {/* Step 3: Set New Password */}
            {currentStep === 'password' && (
              <motion.form
                key="password"
                className="space-y-6"
                onSubmit={handleResetPassword}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
              >
                <div>
                  <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-2">
                    New Password
                  </label>
                  <div className="relative">
                    <FiLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <input
                      id="newPassword"
                      type={showPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                      placeholder="Enter new password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <FiEyeOff className="h-5 w-5" /> : <FiEye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <FiLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <input
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                      placeholder="Confirm new password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showConfirmPassword ? <FiEyeOff className="h-5 w-5" /> : <FiEye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                {/* Password Requirements */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <h4 className="text-sm font-medium text-blue-800 mb-2">Password Requirements:</h4>
                  <ul className="text-xs text-blue-700 space-y-1">
                    <li className="flex items-center gap-2">
                      <FiCheck className={`h-3 w-3 ${newPassword.length >= 6 ? 'text-green-500' : 'text-gray-400'}`} />
                      At least 6 characters
                    </li>
                    <li className="flex items-center gap-2">
                      <FiCheck className={`h-3 w-3 ${newPassword === confirmPassword && newPassword.length > 0 ? 'text-green-500' : 'text-gray-400'}`} />
                      Passwords match
                    </li>
                  </ul>
                </div>

                {error && (
                  <motion.div 
                    className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                  >
                    <FiAlertCircle className="text-red-500 h-4 w-4 flex-shrink-0" />
                    <span className="text-red-700 text-sm">{error}</span>
                  </motion.div>
                )}

                <button
                  type="submit"
                  disabled={loading || newPassword.length < 6 || newPassword !== confirmPassword}
                  className="w-full bg-gradient-to-r from-red-500 to-red-600 text-white py-3 px-4 rounded-xl hover:from-red-600 hover:to-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-all duration-200 shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <FiLoader className="animate-spin h-5 w-5" />
                  ) : (
                    <FiLock className="h-5 w-5" />
                  )}
                  {loading ? 'Resetting...' : 'Reset Password'}
                </button>
              </motion.form>
            )}

            {/* Step 4: Success */}
            {currentStep === 'success' && (
              <motion.div
                key="success"
                className="text-center space-y-6"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
              >
                <motion.div
                  className="mx-auto h-16 w-16 bg-green-100 rounded-full flex items-center justify-center"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                >
                  <FiCheck className="h-8 w-8 text-green-600" />
                </motion.div>
                
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Password Reset Complete!</h3>
                  <p className="text-gray-600">
                    Your password has been successfully reset. You can now log in with your new password.
                  </p>
                </div>

                <button
                  onClick={() => navigate('/login')}
                  className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-3 px-4 rounded-xl hover:from-green-600 hover:to-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all duration-200 shadow-lg flex items-center justify-center gap-2"
                >
                  <FiArrowLeft className="h-5 w-5" />
                  Back to Login
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Back to Login */}
        {currentStep !== 'success' && (
          <div className="text-center">
            <Link
              to="/login"
              className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              <FiArrowLeft className="h-4 w-4" />
              Back to Login
            </Link>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default ForgotPassword;
