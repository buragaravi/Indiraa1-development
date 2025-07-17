import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiPlus, 
  FiMinus, 
  FiShoppingBag, 
  FiUsers, 
  FiEye, 
  FiTool,
  FiCalendar,
  FiFilter,
  FiRefreshCw,
  FiChevronDown
} from 'react-icons/fi';

const TransactionHistory = ({ limit = null, compact = false }) => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [filter, setFilter] = useState('ALL');
  const [showFilters, setShowFilters] = useState(false);
  const [pagination, setPagination] = useState(null);

  const transactionTypes = {
    'ALL': { label: 'All Transactions', icon: FiCalendar, color: 'gray' },
    'ORDER_REWARD': { label: 'Order Rewards', icon: FiShoppingBag, color: 'green' },
    'REFERRAL_BONUS': { label: 'Referral Bonus', icon: FiUsers, color: 'blue' },
    'VISIT_REWARD': { label: 'Visit Rewards', icon: FiEye, color: 'purple' },
    'MANUAL_ADJUSTMENT': { label: 'Adjustments', icon: FiTool, color: 'orange' }
  };

  // Fetch transactions from API
  const fetchTransactions = async (page = 1, pageLimit = 20, filterType = null) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const params = new URLSearchParams({
        page: page.toString(),
        limit: pageLimit.toString()
      });
      
      if (filterType) {
        params.append('type', filterType);
      }

      const response = await fetch(`http://localhost:5001/api/wallet/transactions?${params}`, {
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
        if (page === 1) {
          setTransactions(data.transactions);
        } else {
          setTransactions(prev => [...prev, ...data.transactions]);
        }
        return {
          hasNext: data.pagination.hasNext,
          currentPage: data.pagination.currentPage,
          totalPages: data.pagination.totalPages
        };
      } else {
        throw new Error(data.message || 'Failed to fetch transactions');
      }
    } catch (error) {
      console.error('Fetch transactions error:', error);
      setTransactions([]);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Load transactions on mount and filter change
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      loadTransactions(1);
    } else {
      setLoading(false);
    }
  }, [filter]);

  const loadTransactions = async (page) => {
    const pageLimit = limit || 20;
    const filterType = filter === 'ALL' ? null : filter;
    const paginationData = await fetchTransactions(page, pageLimit, filterType);
    if (paginationData) {
      setPagination(paginationData);
      setCurrentPage(page);
    }
  };

  const loadMore = () => {
    if (pagination && pagination.hasNext) {
      loadTransactions(currentPage + 1);
    }
  };

  const formatTransactionType = (type) => {
    return transactionTypes[type] || transactionTypes['ALL'];
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return 'Today';
    if (diffDays === 2) return 'Yesterday';
    if (diffDays <= 7) return `${diffDays - 1} days ago`;
    return date.toLocaleDateString('en-IN', { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric' 
    });
  };

  const TransactionItem = ({ transaction, index }) => {
    const typeInfo = formatTransactionType(transaction.type);
    const isCredit = transaction.amount > 0;

    return (
      <motion.div
        className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: index * 0.05 }}
        whileHover={{ scale: 1.01 }}
      >
        <div className="flex items-center justify-between">
          {/* Left Side - Icon and Details */}
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center bg-${typeInfo.color}-100`}>
              <typeInfo.icon className={`w-6 h-6 text-${typeInfo.color}-600`} />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-gray-800 text-sm">
                {typeInfo.label}
              </h4>
              <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                {transaction.description}
              </p>
              <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                <span>{formatDate(transaction.createdAt)}</span>
                {transaction.orderId && (
                  <span>Order #{transaction.orderId._id?.slice(-8)}</span>
                )}
                {transaction.referredUserId && (
                  <span>@{transaction.referredUserId.username}</span>
                )}
              </div>
            </div>
          </div>

          {/* Right Side - Amount */}
          <div className="text-right">
            <div className={`flex items-center gap-1 font-bold text-lg ${
              isCredit ? 'text-green-600' : 'text-red-600'
            }`}>
              {isCredit ? <FiPlus className="w-4 h-4" /> : <FiMinus className="w-4 h-4" />}
              {Math.abs(transaction.amount).toLocaleString()}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Balance: {transaction.balanceAfter?.toLocaleString() || 'N/A'}
            </div>
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <motion.div
      className="bg-gray-50 rounded-3xl p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-gray-800">Transaction History</h3>
          <p className="text-sm text-gray-500">
            {pagination ? `${pagination.totalTransactions} total transactions` : 'Your coin activity'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <motion.button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-3 py-2 bg-white rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors"
            whileTap={{ scale: 0.95 }}
          >
            <FiFilter className="w-4 h-4" />
            <span className="text-sm">{transactionTypes[filter].label}</span>
            <FiChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
          </motion.button>
          <motion.button
            onClick={() => loadTransactions(1)}
            disabled={loading}
            className="p-2 bg-white rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors"
            whileTap={{ scale: 0.95 }}
          >
            <FiRefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </motion.button>
        </div>
      </div>

      {/* Filter Dropdown */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            className="mb-4 p-4 bg-white rounded-2xl border border-gray-200"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
              {Object.entries(transactionTypes).map(([key, typeInfo]) => (
                <motion.button
                  key={key}
                  onClick={() => {
                    setFilter(key);
                    setShowFilters(false);
                  }}
                  className={`flex items-center gap-2 p-2 rounded-xl transition-colors ${
                    filter === key
                      ? `bg-${typeInfo.color}-100 text-${typeInfo.color}-700 border-${typeInfo.color}-200 border`
                      : 'hover:bg-gray-100 text-gray-600'
                  }`}
                  whileTap={{ scale: 0.95 }}
                >
                  <typeInfo.icon className="w-4 h-4" />
                  <span className="text-sm">{typeInfo.label}</span>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Transactions List */}
      <div className="space-y-3">
        {loading && transactions.length === 0 ? (
          // Loading skeleton
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gray-200 rounded-2xl animate-pulse"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-1/3 mb-2 animate-pulse"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3 animate-pulse"></div>
                </div>
                <div className="h-6 bg-gray-200 rounded w-16 animate-pulse"></div>
              </div>
            </div>
          ))
        ) : transactions.length === 0 ? (
          // Empty state
          <motion.div
            className="text-center py-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <FiCalendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h4 className="text-lg font-semibold text-gray-600 mb-2">No Transactions Yet</h4>
            <p className="text-gray-500">
              Start earning Indira Coins by placing orders and referring friends!
            </p>
          </motion.div>
        ) : (
          transactions.slice(0, limit || transactions.length).map((transaction, index) => (
            <TransactionItem key={transaction._id} transaction={transaction} index={index} />
          ))
        )}
      </div>

      {/* Load More Button */}
      {!limit && pagination && pagination.hasNext && (
        <motion.div
          className="text-center mt-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <motion.button
            onClick={loadMore}
            disabled={loading}
            className="px-6 py-3 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50"
            whileTap={{ scale: 0.95 }}
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <FiRefreshCw className="w-4 h-4 animate-spin" />
                Loading...
              </span>
            ) : (
              `Load More (${pagination.totalTransactions - transactions.length} remaining)`
            )}
          </motion.button>
        </motion.div>
      )}
    </motion.div>
  );
};

export default TransactionHistory;
