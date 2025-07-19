import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiDollarSign, FiTrendingUp, FiTrendingDown, FiRefreshCw } from 'react-icons/fi';

const WalletBalance = ({ compact = false }) => {
  const [wallet, setWallet] = useState({
    balance: 0,
    totalEarned: 0,
    totalSpent: 0,
    recentTransactionsCount: 0,
    transactionStats: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch wallet balance from API
  const fetchWalletBalance = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch('http://localhost:5001/api/wallet/balance', {
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
        setWallet(data.wallet);
      } else {
        throw new Error(data.message || 'Failed to fetch wallet balance');
      }
    } catch (error) {
      console.error('Fetch wallet balance error:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Load wallet data on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetchWalletBalance();
    } else {
      setLoading(false);
    }
  }, []);

  const handleRefresh = () => {
    fetchWalletBalance();
  };

  if (compact) {
    return (
      <motion.div 
        className="bg-gradient-to-r from-amber-500 to-orange-600 rounded-2xl p-4 text-white shadow-lg"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FiDollarSign className="w-5 h-5" />
            <span className="font-medium">Indira Coins</span>
          </div>
          <motion.button
            onClick={handleRefresh}
            disabled={loading}
            className="p-1 hover:bg-white/20 rounded-full transition-colors"
            whileTap={{ scale: 0.9 }}
          >
            <FiRefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </motion.button>
        </div>
        <div className="mt-2">
          <span className="text-2xl font-bold">
            {loading ? '...' : wallet.balance.toLocaleString()}
          </span>
        </div>
      </motion.div>
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
          <div className="w-12 h-12 bg-gradient-to-r from-amber-500 to-orange-600 rounded-2xl flex items-center justify-center">
            <FiDollarSign className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-800">Wallet Balance</h3>
            <p className="text-sm text-gray-500">Your Indira Coins</p>
          </div>
        </div>
        <motion.button
          onClick={handleRefresh}
          disabled={loading}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          whileTap={{ scale: 0.9 }}
        >
          <FiRefreshCw className={`w-5 h-5 text-gray-600 ${loading ? 'animate-spin' : ''}`} />
        </motion.button>
      </div>

      {/* Main Balance */}
      <div className="text-center mb-6">
        <motion.div 
          className="text-4xl font-bold text-gray-800 mb-2"
          initial={{ scale: 0.5 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {loading ? (
            <div className="animate-pulse bg-gray-200 h-12 w-32 mx-auto rounded"></div>
          ) : (
            <>
              <FiDollarSign className="w-8 h-8 text-amber-500 inline mr-2" />
              {wallet.balance.toLocaleString()}
            </>
          )}
        </motion.div>
        <p className="text-gray-500">Available Balance</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        {/* Total Earned */}
        <motion.div 
          className="bg-green-50 rounded-2xl p-4 border border-green-100"
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <div className="flex items-center gap-2 mb-2">
            <FiTrendingUp className="w-4 h-4 text-green-600" />
            <span className="text-sm font-medium text-green-700">Total Earned</span>
          </div>
          <div className="text-2xl font-bold text-green-800">
            {loading ? (
              <div className="animate-pulse bg-green-200 h-6 w-16 rounded"></div>
            ) : (
              wallet.totalEarned.toLocaleString()
            )}
          </div>
        </motion.div>

        {/* Total Spent */}
        <motion.div 
          className="bg-blue-50 rounded-2xl p-4 border border-blue-100"
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <div className="flex items-center gap-2 mb-2">
            <FiTrendingDown className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-700">Total Spent</span>
          </div>
          <div className="text-2xl font-bold text-blue-800">
            {loading ? (
              <div className="animate-pulse bg-blue-200 h-6 w-16 rounded"></div>
            ) : (
              wallet.totalSpent.toLocaleString()
            )}
          </div>
        </motion.div>
      </div>

      {/* Recent Activity */}
      {!loading && wallet.recentTransactionsCount > 0 && (
        <motion.div 
          className="mt-4 p-3 bg-gray-50 rounded-xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <p className="text-sm text-gray-600 text-center">
            {wallet.recentTransactionsCount} transactions in the last 30 days
          </p>
        </motion.div>
      )}

      {/* Transaction Stats Summary */}
      {!loading && wallet.transactionStats && wallet.transactionStats.length > 0 && (
        <motion.div 
          className="mt-4 grid grid-cols-1 gap-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          {wallet.transactionStats.map((stat, index) => (
            <div key={stat._id} className="flex justify-between items-center p-2 bg-gray-50 rounded-lg">
              <span className="text-sm font-medium text-gray-700 capitalize">
                {stat._id.replace('_', ' ').toLowerCase()}
              </span>
              <div className="text-right">
                <span className="text-sm font-bold text-gray-800">
                  +{stat.total}
                </span>
                <span className="text-xs text-gray-500 ml-1">
                  ({stat.count})
                </span>
              </div>
            </div>
          ))}
        </motion.div>
      )}
    </motion.div>
  );
};

export default WalletBalance;
