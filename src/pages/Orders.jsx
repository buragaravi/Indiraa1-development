import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  FiShoppingBag, 
  FiPackage, 
  FiTruck, 
  FiClock, 
  FiCheck, 
  FiX, 
  FiEye,
  FiCalendar,
  FiDollarSign,
  FiShoppingCart,
  FiFilter,
  FiRefreshCw
} from 'react-icons/fi';

const Orders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const statusOptions = [
    { value: 'all', label: 'All Orders', color: 'gray' },
    { value: 'Pending', label: 'Pending', color: 'orange' },
    { value: 'Shipped', label: 'Shipped', color: 'purple' },
    { value: 'Delivered', label: 'Delivered', color: 'green' },
    { value: 'Cancelled', label: 'Cancelled', color: 'red' }
  ];

  const sortOptions = [
    { value: 'newest', label: 'Newest First' },
    { value: 'oldest', label: 'Oldest First' },
    { value: 'amount-high', label: 'Amount: High to Low' },
    { value: 'amount-low', label: 'Amount: Low to High' }
  ];

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    fetchOrders();
  }, [navigate]);

  useEffect(() => {
    filterAndSortOrders();
  }, [orders, statusFilter, sortBy]);

  const fetchOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('http://localhost:5001/api/products/orders/user', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setOrders(data.orders || []);
      } else {
        if (response.status === 401) {
          localStorage.removeItem('token');
          navigate('/login');
        } else {
          setError('Failed to fetch orders');
        }
      }
    } catch (error) {
      setError('Error fetching orders');
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortOrders = () => {
    let filtered = [...orders];

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => order.status === statusFilter);
    }    // Sort orders
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'oldest':
          return new Date(a.placedAt || a.createdAt) - new Date(b.placedAt || b.createdAt);
        case 'amount-high':
          return (b.totalAmount || b.total) - (a.totalAmount || a.total);
        case 'amount-low':
          return (a.totalAmount || a.total) - (b.totalAmount || b.total);
        case 'newest':
        default:
          return new Date(b.placedAt || b.createdAt) - new Date(a.placedAt || a.createdAt);
      }
    });

    setFilteredOrders(filtered);
  };
  const getStatusIcon = (status) => {
    switch (status) {
      case 'Delivered':
        return <FiCheck className="w-5 h-5 text-green-500" />;
      case 'Shipped':
        return <FiTruck className="w-5 h-5 text-purple-500" />;
      case 'Cancelled':
        return <FiX className="w-5 h-5 text-red-500" />;
      case 'Pending':
      default:
        return <FiClock className="w-5 h-5 text-orange-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Delivered':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'Shipped':
        return 'text-purple-600 bg-purple-50 border-purple-200';
      case 'Cancelled':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'Pending':
      default:
        return 'text-orange-600 bg-orange-50 border-orange-200';
    }
  };
  const getStatusMessage = (status) => {
    switch (status) {
      case 'Pending':
        return {
          title: 'Order Placed Successfully!',
          message: 'We\'ve received your order and are preparing it for shipment.'
        };
      case 'Shipped':
        return {
          title: 'Your Order is On Its Way!',
          message: 'Your package has been shipped and is en route to your address.'
        };
      case 'Delivered':
        return {
          title: 'Order Delivered Successfully!',
          message: 'Your order has been delivered. We hope you love your purchase!'
        };
      case 'Cancelled':
        return {
          title: 'Order Cancelled',
          message: 'This order has been cancelled. Refund will be processed if applicable.'
        };
      default:
        return {
          title: 'Order Status',
          message: 'Your order is being processed.'
        };
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 flex justify-center items-center">
        <motion.div 
          className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-2xl"
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        >
          <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full"></div>
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 flex justify-center items-center">
        <motion.div 
          className="text-center bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-2xl max-w-md"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <FiX className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Error Loading Orders</h3>
          <p className="text-gray-600 mb-6">{error}</p>
          <button 
            onClick={fetchOrders}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl hover:from-emerald-600 hover:to-teal-700 transition-all duration-200 shadow-lg mx-auto"
          >
            <FiRefreshCw className="w-4 h-4" />
            Try Again
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 py-8">
      <div className="container mx-auto px-4 max-w-7xl">        {/* Header */}
        <motion.div 
          className="text-center mb-6 md:mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">My Orders</h1>
          <p className="text-sm md:text-base text-gray-600">Track and manage your orders</p>
        </motion.div>

        {/* Filters and Sort */}
        <motion.div 
          className="bg-white/80 backdrop-blur-sm rounded-2xl md:rounded-3xl p-4 md:p-6 shadow-lg border border-white/20 mb-6 md:mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            <div className="w-full lg:w-auto">
              <div className="flex items-center gap-2 md:gap-3 mb-3 lg:mb-0">
                <FiFilter className="w-4 h-4 md:w-5 md:h-5 text-gray-600" />
                <span className="font-medium text-gray-700 text-sm md:text-base">Filter by Status:</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {statusOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setStatusFilter(option.value)}
                    className={`px-3 md:px-4 py-1.5 md:py-2 rounded-lg md:rounded-xl text-xs md:text-sm font-medium transition-all duration-200 ${
                      statusFilter === option.value
                        ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="flex items-center gap-2 md:gap-3 w-full lg:w-auto">
              <span className="font-medium text-gray-700 text-sm md:text-base">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="flex-1 lg:flex-none px-3 md:px-4 py-1.5 md:py-2 bg-white border border-gray-200 rounded-lg md:rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm md:text-base"
              >
                {sortOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </motion.div>        {/* Orders List */}
        {filteredOrders.length > 0 ? (
          <div className="space-y-4 md:space-y-6">
            {filteredOrders.map((order, index) => (
              <motion.div
                key={order._id}
                className="bg-white/80 backdrop-blur-sm rounded-2xl md:rounded-3xl p-4 md:p-6 shadow-lg border border-white/20 hover:shadow-xl transition-all duration-200 cursor-pointer"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => navigate(`/orders/${order._id}`)}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Order Info */}
                  <div className="flex items-start gap-3 md:gap-4">
                    <div className="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl md:rounded-2xl flex items-center justify-center flex-shrink-0">
                      <FiShoppingBag className="w-6 h-6 md:w-8 md:h-8 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 md:gap-3 mb-2">
                        <h3 className="text-lg md:text-xl font-bold text-gray-800 truncate">
                          Order #{order._id.slice(-8)}
                        </h3>
                        <span className={`flex items-center gap-1 md:gap-2 px-2 md:px-3 py-1 rounded-full text-xs md:text-sm font-medium border w-fit ${getStatusColor(order.status)}`}>
                          {getStatusIcon(order.status)}
                          {order.status}
                        </span>
                      </div>
                      <div className="mb-2 md:mb-3">
                        <p className="text-sm md:text-base font-medium text-gray-700">
                          {getStatusMessage(order.status).title}
                        </p>
                        <p className="text-xs md:text-sm text-gray-600">
                          {getStatusMessage(order.status).message}
                        </p>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 md:gap-4 text-xs md:text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <FiCalendar className="w-3 h-3 md:w-4 md:h-4" />
                          <span className="hidden sm:inline">
                            {new Date(order.placedAt || order.createdAt).toLocaleDateString('en-IN', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </span>
                          <span className="sm:hidden">
                            {new Date(order.placedAt || order.createdAt).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                              year: '2-digit'
                            })}
                          </span>                        </div>
                        <div className="flex items-center gap-1">
                          <FiShoppingCart className="w-3 h-3 md:w-4 md:h-4" />
                          <span className="text-xs md:text-sm">{order.items?.length || 0} item{(order.items?.length || 0) !== 1 ? 's' : ''}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <FiDollarSign className="w-3 h-3 md:w-4 md:h-4" />
                          <span className="text-xs md:text-sm">Payment: {order.paymentStatus || 'Pending'}</span>
                        </div>
                      </div>
                    </div>
                  </div>                  {/* Order Summary - Desktop Layout */}
                  <div className="hidden lg:flex flex-col items-end gap-3 lg:w-auto">
                    <div className="text-right">
                      <p className="text-2xl font-bold text-gray-800">₹{(order.totalAmount || order.total || 0).toLocaleString()}</p>
                      <p className="text-sm text-gray-600">Total Amount</p>
                    </div>
                    <div className="flex items-center gap-3">
                      {getStatusIcon(order.status)}
                      <FiEye className="w-5 h-5 text-gray-400" />
                    </div>
                  </div>
                </div>

                {/* Mobile Combined Layout - Items + Price in same row */}
                {order.items && order.items.length > 0 && (
                  <div className="lg:hidden mt-3 pt-3 border-t border-gray-200">
                    <div className="flex items-start justify-between gap-3">
                      {/* Items Section */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <FiPackage className="w-3 h-3 text-gray-600 flex-shrink-0" />
                          <span className="text-xs font-medium text-gray-700">Items:</span>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {order.items.slice(0, 2).map((item, itemIndex) => (
                            <span
                              key={itemIndex}
                              className="px-2 py-1 bg-gray-100 rounded text-xs text-gray-700"
                            >
                              {item.name || 'Product'}
                              {item.variantName && (
                                <span className="text-gray-500"> ({item.variantName})</span>
                              )}
                              {' × '}
                              {item.qty || item.quantity || 1}
                            </span>
                          ))}
                          {order.items.length > 2 && (
                            <span className="px-2 py-1 bg-gray-100 rounded text-xs text-gray-700">
                              +{order.items.length - 2} more
                            </span>
                          )}
                        </div>
                      </div>
                      
                      {/* Price Section */}
                      <div className="text-right flex-shrink-0">
                        <p className="text-xl font-bold text-gray-800">₹{(order.totalAmount || order.total || 0).toLocaleString()}</p>
                        <p className="text-xs text-gray-600">Total</p>
                        <div className="flex items-center gap-2 mt-1 justify-end">
                          {getStatusIcon(order.status)}
                          <FiEye className="w-4 h-4 text-gray-400" />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Desktop Items Preview - Separate Section */}
                {order.items && order.items.length > 0 && (
                  <div className="hidden lg:block mt-4 pt-4 border-t border-gray-200">
                    <div className="flex items-center gap-2 mb-2">
                      <FiPackage className="w-4 h-4 text-gray-600" />
                      <span className="text-sm font-medium text-gray-700">Items in this order:</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {order.items.slice(0, 3).map((item, itemIndex) => (
                        <span
                          key={itemIndex}
                          className="px-3 py-1 bg-gray-100 rounded-lg text-sm text-gray-700"
                        >
                          {item.name || 'Product'}
                          {item.variantName && (
                            <span className="text-gray-500"> ({item.variantName})</span>
                          )}
                          {' × '}
                          {item.qty || item.quantity || 1}
                        </span>
                      ))}
                      {order.items.length > 3 && (
                        <span className="px-3 py-1 bg-gray-100 rounded-lg text-sm text-gray-700">
                          +{order.items.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        ) : (
          <motion.div 
            className="text-center bg-white/80 backdrop-blur-sm rounded-2xl md:rounded-3xl p-8 md:p-12 shadow-lg"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <FiShoppingBag className="w-16 h-16 md:w-20 md:h-20 text-gray-300 mx-auto mb-4 md:mb-6" />
            <h3 className="text-xl md:text-2xl font-bold text-gray-700 mb-2">
              {statusFilter === 'all' ? 'No Orders Yet' : `No ${statusFilter} Orders`}
            </h3>
            <p className="text-sm md:text-base text-gray-600 mb-4 md:mb-6">
              {statusFilter === 'all' 
                ? "You haven't placed any orders yet. Start shopping to see your orders here!" 
                : `You don't have any ${statusFilter} orders at the moment.`
              }
            </p>
            {statusFilter === 'all' ? (
              <button
                onClick={() => navigate('/products')}
                className="w-full sm:w-auto px-6 md:px-8 py-2 md:py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-lg md:rounded-xl hover:from-emerald-600 hover:to-teal-700 transition-all duration-200 shadow-lg text-sm md:text-base"
              >
                Start Shopping
              </button>
            ) : (
              <button
                onClick={() => setStatusFilter('all')}
                className="w-full sm:w-auto px-6 md:px-8 py-2 md:py-3 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-lg md:rounded-xl hover:from-gray-600 hover:to-gray-700 transition-all duration-200 shadow-lg text-sm md:text-base"
              >
                View All Orders
              </button>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Orders;
