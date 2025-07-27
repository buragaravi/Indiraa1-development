import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiStar, FiCircle, FiHeart, FiUsers, FiTrendingUp, FiRefreshCw } from 'react-icons/fi';

const ReferralLeaderboard = () => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [userRank, setUserRank] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState('monthly'); // weekly, monthly, all-time

  // Fetch leaderboard data from API
  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`http://localhost:5001/api/referral/leaderboard?timeframe=${timeframe}`, {
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
        setLeaderboard(data.leaderboard);
        setUserRank(data.userRank);
      } else {
        throw new Error(data.message || 'Failed to fetch leaderboard');
      }
    } catch (error) {
      console.error('Fetch leaderboard error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetchLeaderboard();
    } else {
      setLoading(false);
    }
  }, [timeframe]);

  const getRankIcon = (rank) => {
    switch (rank) {
      case 1:
        return <FiStar className="w-6 h-6 text-yellow-500" />;
      case 2:
        return <FiCircle className="w-6 h-6 text-gray-400" />;
      case 3:
        return <FiHeart className="w-6 h-6 text-orange-500" />;
      default:
        return (
          <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center text-xs font-bold text-gray-600">
            {rank}
          </div>
        );
    }
  };

  const getRankBadgeColor = (rank) => {
    switch (rank) {
      case 1:
        return 'from-yellow-400 to-yellow-600';
      case 2:
        return 'from-gray-300 to-gray-500';
      case 3:
        return 'from-orange-400 to-orange-600';
      default:
        return 'from-blue-400 to-blue-600';
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-3xl p-6 shadow-xl border border-gray-100">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="h-16 bg-gray-200 rounded-xl"></div>
            ))}
          </div>
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
          <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-2xl flex items-center justify-center">
            <FiStar className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-800">Referral Leaderboard</h3>
            <p className="text-sm text-gray-500">Top referrers this {timeframe === 'all-time' ? 'year' : timeframe}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Timeframe Selector */}
          <select
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500"
          >
            <option value="weekly">This Week</option>
            <option value="monthly">This Month</option>
            <option value="all-time">All Time</option>
          </select>

          {/* Refresh Button */}
          <motion.button
            onClick={fetchLeaderboard}
            disabled={loading}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            whileTap={{ scale: 0.9 }}
          >
            <FiRefreshCw className={`w-5 h-5 text-gray-600 ${loading ? 'animate-spin' : ''}`} />
          </motion.button>
        </div>
      </div>

      {/* User's Rank (if not in top 10) */}
      {userRank && userRank.rank > 10 && (
        <motion.div 
          className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-100"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-sm font-bold text-blue-600">#{userRank.rank}</span>
              </div>
              <div>
                <p className="font-semibold text-blue-800">Your Rank</p>
                <p className="text-sm text-blue-600">{userRank.referrals} referrals</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-lg font-bold text-blue-800">{userRank.coinsEarned}</div>
              <div className="text-xs text-blue-600">coins earned</div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Leaderboard List */}
      <div className="space-y-3">
        {leaderboard.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <FiUsers className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>No referral data available yet.</p>
            <p className="text-sm">Be the first to start referring friends!</p>
          </div>
        ) : (
          leaderboard.map((user, index) => {
            const rank = index + 1;
            const isCurrentUser = userRank && userRank.rank === rank;
            
            return (
              <motion.div 
                key={user.userId || index}
                className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${
                  isCurrentUser 
                    ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200' 
                    : rank <= 3 
                      ? 'bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200' 
                      : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                }`}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                {/* Rank and User Info */}
                <div className="flex items-center gap-4">
                  <div className="flex-shrink-0">
                    {getRankIcon(rank)}
                  </div>
                  
                  <div className="flex items-center gap-3">
                    {/* User Avatar */}
                    <div className={`w-10 h-10 rounded-full bg-gradient-to-r ${getRankBadgeColor(rank)} flex items-center justify-center text-white font-bold`}>
                      {user.username ? user.username.charAt(0).toUpperCase() : '?'}
                    </div>
                    
                    {/* User Details */}
                    <div>
                      <p className="font-semibold text-gray-800">
                        {user.username || 'Anonymous User'}
                        {isCurrentUser && (
                          <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                            You
                          </span>
                        )}
                      </p>
                      <p className="text-sm text-gray-500">
                        {user.referrals} referral{user.referrals !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Stats */}
                <div className="text-right">
                  <div className="flex items-center gap-4">
                    {/* Coins Earned */}
                    <div className="text-right">
                      <div className="text-lg font-bold text-amber-600">{user.coinsEarned}</div>
                      <div className="text-xs text-gray-500">coins</div>
                    </div>
                    
                    {/* Conversion Rate */}
                    {user.conversionRate !== undefined && (
                      <div className="text-right">
                        <div className="text-sm font-bold text-green-600">{user.conversionRate}%</div>
                        <div className="text-xs text-gray-500">rate</div>
                      </div>
                    )}
                    
                    {/* Trend Indicator */}
                    {user.trend && (
                      <div className={`text-${user.trend === 'up' ? 'green' : 'red'}-500`}>
                        <FiTrendingUp className={`w-4 h-4 ${user.trend === 'down' ? 'rotate-180' : ''}`} />
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </div>

      {/* Achievement Badges */}
      {leaderboard.length > 0 && (
        <motion.div 
          className="mt-6 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl border border-purple-100"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          <h5 className="font-semibold text-purple-800 mb-3 flex items-center gap-2">
            <FiHeart className="w-4 h-4" />
            Achievements
          </h5>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-yellow-100 rounded-full flex items-center justify-center">
                <FiStar className="w-3 h-3 text-yellow-600" />
              </div>
              <span className="text-purple-700">
                Top Referrer: {leaderboard[0]?.username || 'None'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                <FiTrendingUp className="w-3 h-3 text-green-600" />
              </div>
              <span className="text-purple-700">
                Total Active: {leaderboard.length}
              </span>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default ReferralLeaderboard;
