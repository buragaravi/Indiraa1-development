import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiCopy, FiShare2, FiUsers, FiGift, FiCheck } from 'react-icons/fi';

const ReferralLink = () => {
  const [referralData, setReferralData] = useState({
    referralCode: '',
    referralLink: '',
    stats: {
      registrations: 0,
      visits: 0,
      coinsEarned: 0
    }
  });
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  // Fetch referral data from API
  const fetchReferralData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch('http://localhost:5001/api/referral/code', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (data.success) {
        setReferralData({
          referralCode: data.referralCode,
          referralLink: `${window.location.origin}/register?ref=${data.referralCode}`,
          stats: data.stats
        });
      } else {
        throw new Error(data.message || 'Failed to fetch referral data');
      }
    } catch (error) {
      console.error('Fetch referral data error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetchReferralData();
    } else {
      setLoading(false);
    }
  }, []);

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const shareLink = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Join Indiraa1 and get rewards!',
          text: 'Use my referral code to get started with Indiraa1 and earn Indira Coins!',
          url: referralData.referralLink,
        });
      } catch (err) {
        console.error('Error sharing:', err);
      }
    } else {
      copyToClipboard(referralData.referralLink);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-3xl p-6 shadow-xl border border-gray-100">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-12 bg-gray-200 rounded mb-4"></div>
          <div className="h-10 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      className="bg-white rounded-3xl p-6 shadow-xl border border-gray-100"
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center">
          <FiShare2 className="w-6 h-6 text-white" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-gray-800">Share & Earn</h3>
          <p className="text-sm text-gray-500">Invite friends to earn rewards</p>
        </div>
      </div>

      {/* Referral Code */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Your Referral Code
        </label>
        <div className="flex items-center gap-2">
          <div className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3">
            <span className="font-mono text-lg font-bold text-purple-600">
              {referralData.referralCode}
            </span>
          </div>
          <motion.button
            onClick={() => copyToClipboard(referralData.referralCode)}
            className="p-3 bg-purple-100 text-purple-600 rounded-xl hover:bg-purple-200 transition-colors"
            whileTap={{ scale: 0.95 }}
          >
            {copied ? <FiCheck className="w-5 h-5" /> : <FiCopy className="w-5 h-5" />}
          </motion.button>
        </div>
      </div>

      {/* Referral Link */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Referral Link
        </label>
        <div className="flex items-center gap-2">
          <div className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 overflow-hidden">
            <span className="text-sm text-gray-600 truncate block">
              {referralData.referralLink}
            </span>
          </div>
          <motion.button
            onClick={() => copyToClipboard(referralData.referralLink)}
            className="p-3 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 transition-colors"
            whileTap={{ scale: 0.95 }}
          >
            {copied ? <FiCheck className="w-5 h-5" /> : <FiCopy className="w-5 h-5" />}
          </motion.button>
        </div>
      </div>

      {/* Share Button */}
      <motion.button
        onClick={shareLink}
        className="w-full bg-gradient-to-r from-purple-500 to-pink-600 text-white py-4 rounded-xl font-semibold flex items-center justify-center gap-2 hover:from-purple-600 hover:to-pink-700 transition-all"
        whileTap={{ scale: 0.98 }}
      >
        <FiShare2 className="w-5 h-5" />
        Share with Friends
      </motion.button>

      {/* Reward Info */}
      <div className="mt-6 bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-4 border border-purple-100">
        <div className="flex items-center gap-2 mb-3">
          <FiGift className="w-5 h-5 text-purple-600" />
          <span className="font-semibold text-purple-800">Reward Structure</span>
        </div>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Friend registers with your code:</span>
            <span className="font-bold text-purple-600">+20 coins</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Per 10 unique visits (2+ min):</span>
            <span className="font-bold text-purple-600">+2 coins</span>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="mt-6 grid grid-cols-3 gap-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-purple-600">
            {referralData.stats.registrations}
          </div>
          <div className="text-xs text-gray-500">Registrations</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">
            {referralData.stats.visits}
          </div>
          <div className="text-xs text-gray-500">Visits</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-amber-600">
            {referralData.stats.coinsEarned}
          </div>
          <div className="text-xs text-gray-500">Coins Earned</div>
        </div>
      </div>
    </motion.div>
  );
};

export default ReferralLink;
