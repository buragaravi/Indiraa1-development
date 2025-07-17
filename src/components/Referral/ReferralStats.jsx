import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiUsers, FiEye, FiTrendingUp, FiCalendar, FiClock, FiGift } from 'react-icons/fi';

const ReferralStats = () => {
  const [stats, setStats] = useState({
    totalReferrals: 0,
    totalVisits: 0,
    totalCoinsEarned: 0,
    conversionRate: 0,
    recentActivity: [],
    monthlyStats: [],
    topReferrers: []
  });
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30'); // days

  // Fetch referral statistics from API
  const fetchReferralStats = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`http://localhost:5001/api/referral/stats?days=${timeRange}`, {
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
        setStats(data.stats);
      } else {
        throw new Error(data.message || 'Failed to fetch referral stats');
      }
    } catch (error) {
      console.error('Fetch referral stats error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetchReferralStats();
    } else {
      setLoading(false);
    }
  }, [timeRange]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  if (loading) {
    return (
      <div className="bg-white rounded-3xl p-6 shadow-xl border border-gray-100">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="h-20 bg-gray-200 rounded-xl"></div>
            <div className="h-20 bg-gray-200 rounded-xl"></div>
            <div className="h-20 bg-gray-200 rounded-xl"></div>
            <div className="h-20 bg-gray-200 rounded-xl"></div>
          </div>
          <div className="h-40 bg-gray-200 rounded-xl"></div>
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
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-2xl flex items-center justify-center">
            <FiTrendingUp className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-800">Referral Statistics</h3>
            <p className="text-sm text-gray-500">Track your referral performance</p>
          </div>
        </div>

        {/* Time Range Selector */}
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="7">Last 7 days</option>
          <option value="30">Last 30 days</option>
          <option value="90">Last 90 days</option>
          <option value="365">Last year</option>
        </select>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Total Referrals */}
        <motion.div 
          className="bg-green-50 rounded-2xl p-4 border border-green-100"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <div className="flex items-center gap-2 mb-2">
            <FiUsers className="w-4 h-4 text-green-600" />
            <span className="text-sm font-medium text-green-700">Referrals</span>
          </div>
          <div className="text-2xl font-bold text-green-800">
            {stats.totalReferrals}
          </div>
        </motion.div>

        {/* Total Visits */}
        <motion.div 
          className="bg-blue-50 rounded-2xl p-4 border border-blue-100"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <div className="flex items-center gap-2 mb-2">
            <FiEye className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-700">Visits</span>
          </div>
          <div className="text-2xl font-bold text-blue-800">
            {stats.totalVisits}
          </div>
        </motion.div>

        {/* Coins Earned */}
        <motion.div 
          className="bg-amber-50 rounded-2xl p-4 border border-amber-100"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          <div className="flex items-center gap-2 mb-2">
            <FiGift className="w-4 h-4 text-amber-600" />
            <span className="text-sm font-medium text-amber-700">Coins</span>
          </div>
          <div className="text-2xl font-bold text-amber-800">
            {stats.totalCoinsEarned}
          </div>
        </motion.div>

        {/* Conversion Rate */}
        <motion.div 
          className="bg-purple-50 rounded-2xl p-4 border border-purple-100"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.4 }}
        >
          <div className="flex items-center gap-2 mb-2">
            <FiTrendingUp className="w-4 h-4 text-purple-600" />
            <span className="text-sm font-medium text-purple-700">Rate</span>
          </div>
          <div className="text-2xl font-bold text-purple-800">
            {stats.conversionRate}%
          </div>
        </motion.div>
      </div>

      {/* Recent Activity */}
      {stats.recentActivity && stats.recentActivity.length > 0 && (
        <motion.div 
          className="mb-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <FiClock className="w-5 h-5 text-gray-500" />
            Recent Activity
          </h4>
          <div className="space-y-3 max-h-48 overflow-y-auto">
            {stats.recentActivity.map((activity, index) => (
              <motion.div 
                key={index}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-xl"
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.6 + index * 0.1 }}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    activity.type === 'registration' 
                      ? 'bg-green-100 text-green-600' 
                      : 'bg-blue-100 text-blue-600'
                  }`}>
                    {activity.type === 'registration' ? (
                      <FiUsers className="w-4 h-4" />
                    ) : (
                      <FiEye className="w-4 h-4" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-800">
                      {activity.type === 'registration' 
                        ? 'New registration' 
                        : 'Visit milestone reached'}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatDate(activity.date)}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-sm font-bold text-amber-600">
                    +{activity.coins} coins
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Monthly Chart */}
      {stats.monthlyStats && stats.monthlyStats.length > 0 && (
        <motion.div 
          className="mb-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
        >
          <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <FiCalendar className="w-5 h-5 text-gray-500" />
            Monthly Performance
          </h4>
          <div className="bg-gray-50 rounded-xl p-4">
            <div className="flex items-end justify-between h-32 gap-2">
              {stats.monthlyStats.map((month, index) => {
                const maxValue = Math.max(...stats.monthlyStats.map(m => m.registrations));
                const height = maxValue > 0 ? (month.registrations / maxValue) * 100 : 0;
                
                return (
                  <div key={index} className="flex-1 flex flex-col items-center">
                    <motion.div 
                      className="w-full bg-gradient-to-t from-blue-500 to-blue-300 rounded-t-lg min-h-1"
                      style={{ height: `${height}%` }}
                      initial={{ height: 0 }}
                      animate={{ height: `${height}%` }}
                      transition={{ duration: 0.8, delay: 0.8 + index * 0.1 }}
                    />
                    <span className="text-xs text-gray-500 mt-2">
                      {month.month}
                    </span>
                    <span className="text-xs font-bold text-gray-700">
                      {month.registrations}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </motion.div>
      )}

      {/* Performance Insights */}
      <motion.div 
        className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl p-4 border border-indigo-100"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.9 }}
      >
        <h5 className="font-semibold text-indigo-800 mb-2">Performance Insights</h5>
        <div className="text-sm text-indigo-700 space-y-1">
          {stats.conversionRate > 5 && (
            <p>🎉 Great conversion rate! Your referrals are highly effective.</p>
          )}
          {stats.totalVisits > stats.totalReferrals * 10 && (
            <p>👀 High visit-to-referral ratio. Consider optimizing your call-to-action.</p>
          )}
          {stats.totalCoinsEarned > 100 && (
            <p>💎 You're a referral champion! Keep sharing to earn more rewards.</p>
          )}
          {stats.conversionRate === 0 && stats.totalVisits > 0 && (
            <p>💡 You have visits but no conversions yet. Try following up with visitors!</p>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ReferralStats;
