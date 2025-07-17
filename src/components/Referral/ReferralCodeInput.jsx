import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiGift, FiCheck, FiX, FiLoader } from 'react-icons/fi';

const ReferralCodeInput = ({ onCodeChange, initialCode = '' }) => {
  const [code, setCode] = useState(initialCode);
  const [validationStatus, setValidationStatus] = useState(null); // null, 'validating', 'valid', 'invalid'
  const [validationMessage, setValidationMessage] = useState('');
  const [debounceTimer, setDebounceTimer] = useState(null);

  // Validate referral code with backend
  const validateCode = async (referralCode) => {
    if (!referralCode.trim()) {
      setValidationStatus(null);
      setValidationMessage('');
      onCodeChange(referralCode, false);
      return;
    }

    setValidationStatus('validating');
    try {
      const response = await fetch(`http://localhost:5001/api/referral/validate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ referralCode })
      });

      const data = await response.json();
      
      if (data.success) {
        setValidationStatus('valid');
        setValidationMessage(`Valid code! You'll get a bonus from ${data.referrer?.name || 'this referrer'}.`);
        onCodeChange(referralCode, true); // Mark as valid
      } else {
        setValidationStatus('invalid');
        setValidationMessage(data.message || 'Invalid referral code');
        onCodeChange(referralCode, false); // Mark as invalid
      }
    } catch (error) {
      console.error('Validation error:', error);
      setValidationStatus('invalid');
      setValidationMessage('Unable to validate code. Please try again.');
      onCodeChange(referralCode, false); // Mark as invalid
    }
  };

  // Handle code change with debounced validation
  const handleCodeChange = (newCode) => {
    setCode(newCode);
    
    // Don't call onCodeChange here - wait for validation

    // Clear existing timer
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }

    // Set new timer for validation
    const timer = setTimeout(() => {
      validateCode(newCode);
    }, 800); // 800ms delay

    setDebounceTimer(timer);
  };

  // Check for referral code in URL on mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const refCode = urlParams.get('ref');
    if (refCode && !initialCode) {
      setCode(refCode);
      onCodeChange(refCode, false);
      validateCode(refCode);
    }
  }, [initialCode, onCodeChange]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }
    };
  }, [debounceTimer]);

  const getStatusIcon = () => {
    switch (validationStatus) {
      case 'validating':
        return <FiLoader className="w-4 h-4 text-blue-500 animate-spin" />;
      case 'valid':
        return <FiCheck className="w-4 h-4 text-green-500" />;
      case 'invalid':
        return <FiX className="w-4 h-4 text-red-500" />;
      default:
        return null;
    }
  };

  const getInputBorderColor = () => {
    switch (validationStatus) {
      case 'valid':
        return 'border-green-300 focus:border-green-500 focus:ring-green-500';
      case 'invalid':
        return 'border-red-300 focus:border-red-500 focus:ring-red-500';
      case 'validating':
        return 'border-blue-300 focus:border-blue-500 focus:ring-blue-500';
      default:
        return 'border-gray-300 focus:border-purple-500 focus:ring-purple-500';
    }
  };

  return (
    <motion.div 
      className="space-y-3"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Input Field */}
      <div className="relative">
        <label htmlFor="referralCode" className="block text-sm font-medium text-gray-700 mb-2">
          <div className="flex items-center gap-2">
            <FiGift className="w-4 h-4 text-purple-500" />
            Referral Code (Optional)
          </div>
        </label>
        
        <div className="relative">
          <input
            type="text"
            id="referralCode"
            value={code}
            onChange={(e) => handleCodeChange(e.target.value.toUpperCase().trim())}
            placeholder="Enter referral code"
            className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-colors ${getInputBorderColor()} ${
              validationStatus === 'valid' ? 'bg-green-50' : 
              validationStatus === 'invalid' ? 'bg-red-50' : 
              'bg-white'
            }`}
            maxLength={12}
          />
          
          {/* Status Icon */}
          {getStatusIcon() && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              {getStatusIcon()}
            </div>
          )}
        </div>

        {/* Validation Message */}
        {validationMessage && (
          <motion.div 
            className={`mt-2 text-sm flex items-center gap-2 ${
              validationStatus === 'valid' ? 'text-green-600' : 'text-red-600'
            }`}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            transition={{ duration: 0.2 }}
          >
            {getStatusIcon()}
            {validationMessage}
          </motion.div>
        )}
      </div>

      {/* Bonus Information */}
      <motion.div 
        className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-100"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
            <FiGift className="w-4 h-4 text-purple-600" />
          </div>
          <div>
            <h4 className="font-semibold text-purple-800 text-sm mb-1">
              Referral Bonus
            </h4>
            <p className="text-xs text-purple-700 leading-relaxed">
              If you have a referral code, enter it above to help your friend earn bonus coins! 
              You'll also be part of our rewards community from day one.
            </p>
          </div>
        </div>

        {/* Benefits List */}
        <div className="mt-3 space-y-1">
          <div className="flex items-center gap-2 text-xs text-purple-600">
            <div className="w-1 h-1 bg-purple-400 rounded-full"></div>
            <span>Your referrer gets +20 coins when you sign up</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-purple-600">
            <div className="w-1 h-1 bg-purple-400 rounded-full"></div>
            <span>You'll earn coins on your future purchases</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-purple-600">
            <div className="w-1 h-1 bg-purple-400 rounded-full"></div>
            <span>Get your own referral code to share with friends</span>
          </div>
        </div>
      </motion.div>

      {/* Success Animation */}
      {validationStatus === 'valid' && (
        <motion.div 
          className="bg-green-50 border border-green-200 rounded-xl p-3"
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex items-center gap-2 text-green-700">
            <FiCheck className="w-5 h-5 text-green-500" />
            <span className="text-sm font-medium">Referral code applied successfully!</span>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default ReferralCodeInput;
