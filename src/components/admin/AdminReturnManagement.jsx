import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FaBoxOpen, 
  FaEye, 
  FaCheck, 
  FaTimes, 
  FaFilter,
  FaSearch,
  FaSpinner,
  FaCoins,
  FaWarehouse,
  FaClipboardCheck,
  FaClock,
  FaExclamationTriangle,
  FaCheckCircle,
  FaTimesCircle
} from 'react-icons/fa';

const AdminReturnManagement = () => {
  const navigate = useNavigate();
  const [returns, setReturns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    status: 'all',
    returnReason: 'all',
    page: 1,
    limit: 20
  });
  const [pagination, setPagination] = useState({});
  const [searchTerm, setSearchTerm] = useState('');

  // Modal states
  const [selectedReturn, setSelectedReturn] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showRefundModal, setShowRefundModal] = useState(false);

  // Form states
  const [reviewForm, setReviewForm] = useState({
    decision: '',
    adminComments: ''
  });
  const [refundForm, setRefundForm] = useState({
    finalRefundPercentage: 100,
    adminComments: '',
    coinRefund: 0
  });
  const [actionLoading, setActionLoading] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

  // Get admin token
  const getAdminToken = () => {
    return localStorage.getItem('adminToken') || localStorage.getItem('token');
  };

  // Fetch return requests
  const fetchReturns = async () => {
    try {
      setLoading(true);
      const token = getAdminToken();
      
      if (!token) {
        throw new Error('Admin authentication required');
      }

      const queryParams = new URLSearchParams({
        ...filters,
        search: searchTerm
      });

      const response = await fetch(`${API_URL}/api/admin/returns/all?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch return requests');
      }

      const data = await response.json();
      setReturns(Array.isArray(data.data?.returns) ? data.data.returns : []);
      setPagination(data.data?.pagination || {});
    } catch (error) {
      console.error('Error fetching returns:', error);
      setError(error.message);
      setReturns([]); // Ensure array on error
    } finally {
      setLoading(false);
    }
  };

  // Review return request
  const reviewReturnRequest = async (e) => {
    e.preventDefault();
    setActionLoading(true);

    try {
      const token = getAdminToken();
      const response = await fetch(`${API_URL}/api/admin/returns/${selectedReturn._id}/review`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          decision: reviewForm.decision,
          adminComments: reviewForm.adminComments
        })
      });

      if (!response.ok) {
        throw new Error('Failed to review return request');
      }

      alert(`Return request ${reviewForm.decision} successfully!`);
      setShowReviewModal(false);
      fetchReturns();
      
    } catch (error) {
      console.error('Error reviewing return:', error);
      alert(`Failed to review return: ${error.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  // Make final refund decision
  const makeFinalDecision = async (e) => {
    e.preventDefault();
    setActionLoading(true);

    try {
      const token = getAdminToken();
      const response = await fetch(`${API_URL}/api/admin/returns/${selectedReturn._id}/final-decision`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          finalRefundPercentage: refundForm.finalRefundPercentage,
          adminComments: refundForm.adminComments
        })
      });

      if (!response.ok) {
        throw new Error('Failed to make final decision');
      }

      alert('Final refund decision saved successfully!');
      setShowRefundModal(false);
      fetchReturns();
      
    } catch (error) {
      console.error('Error making final decision:', error);
      alert(`Failed to make final decision: ${error.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  // Process coin refund
  const processRefund = async (returnId) => {
    if (!confirm('Are you sure you want to process this refund?')) {
      return;
    }

    try {
      const token = getAdminToken();
      const response = await fetch(`${API_URL}/api/admin/returns/${returnId}/process-refund`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to process refund');
      }

      const data = await response.json();
      alert(`Refund processed successfully! ${data.data.coinsCredited} coins credited to customer.`);
      fetchReturns();
      
    } catch (error) {
      console.error('Error processing refund:', error);
      alert(`Failed to process refund: ${error.message}`);
    }
  };

  // Open review modal
  const openReviewModal = (returnRequest) => {
    setSelectedReturn(returnRequest);
    setReviewForm({
      decision: '',
      adminComments: ''
    });
    setShowReviewModal(true);
  };

  // Open refund modal
  const openRefundModal = (returnRequest) => {
    setSelectedReturn(returnRequest);
    const recommendedPercentage = returnRequest.refund?.warehouseRecommendation?.refundPercentage || 100;
    const originalAmount = returnRequest.items.reduce((sum, item) => 
      sum + (item.originalPrice * item.quantity), 0);
    const coinRefund = (originalAmount * recommendedPercentage / 100) * 5;
    
    setRefundForm({
      finalRefundPercentage: recommendedPercentage,
      adminComments: '',
      coinRefund: coinRefund
    });
    setShowRefundModal(true);
  };

  // Calculate refund amount
  const calculateRefundAmount = (returnRequest, percentage) => {
    const originalAmount = returnRequest.items.reduce((sum, item) => 
      sum + (item.originalPrice * item.quantity), 0);
    return (originalAmount * percentage / 100) * 5; // Convert to coins
  };

  // Get status badge color
  const getStatusBadgeColor = (status) => {
    const colors = {
      'requested': 'bg-yellow-100 text-yellow-800',
      'admin_review': 'bg-blue-100 text-blue-800',
      'approved': 'bg-green-100 text-green-800',
      'rejected': 'bg-red-100 text-red-800',
      'warehouse_assigned': 'bg-purple-100 text-purple-800',
      'pickup_scheduled': 'bg-indigo-100 text-indigo-800',
      'picked_up': 'bg-cyan-100 text-cyan-800',
      'in_warehouse': 'bg-gray-100 text-gray-800',
      'quality_checked': 'bg-orange-100 text-orange-800',
      'refund_approved': 'bg-emerald-100 text-emerald-800',
      'refund_processed': 'bg-green-100 text-green-800',
      'completed': 'bg-green-100 text-green-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  // Get priority level
  const getPriorityLevel = (returnRequest) => {
    const hoursOld = (new Date() - new Date(returnRequest.requestedAt)) / (1000 * 60 * 60);
    const originalAmount = returnRequest.items.reduce((sum, item) => 
      sum + (item.originalPrice * item.quantity), 0);
    
    if (hoursOld > 48 || originalAmount > 5000) return 'high';
    if (hoursOld > 24 || originalAmount > 2000) return 'medium';
    return 'low';
  };

  // Get priority color
  const getPriorityColor = (priority) => {
    const colors = {
      'high': 'text-red-600',
      'medium': 'text-yellow-600',
      'low': 'text-green-600'
    };
    return colors[priority];
  };

  useEffect(() => {
    fetchReturns();
  }, [filters, searchTerm]);

  // Update coin refund when percentage changes
  useEffect(() => {
    if (selectedReturn) {
      const coinRefund = calculateRefundAmount(selectedReturn, refundForm.finalRefundPercentage);
      setRefundForm(prev => ({ ...prev, coinRefund }));
    }
  }, [refundForm.finalRefundPercentage, selectedReturn]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 py-4 sm:py-6 lg:py-8">
      <div className="w-full max-w-none px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16">
        {/* Header */}
        <div className="mb-4 sm:mb-6 lg:mb-8">
          <h1 className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-bold text-gray-800 flex items-center">
            <div className="w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 xl:w-16 xl:h-16 bg-gradient-to-br from-emerald-500 via-green-500 to-teal-500 rounded-2xl flex items-center justify-center shadow-xl shadow-emerald-200 mr-3 sm:mr-4">
              <FaBoxOpen className="text-white text-sm sm:text-base lg:text-lg xl:text-xl" />
            </div>
            Return Management Dashboard
          </h1>
          <p className="mt-1 sm:mt-2 text-sm sm:text-base lg:text-lg text-gray-600">
            Review and manage customer return requests
          </p>
        </div>

        {/* Filters and Search */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl sm:rounded-3xl shadow-xl shadow-emerald-100/50 border border-white/50 p-4 sm:p-6 mb-4 sm:mb-6 lg:mb-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {/* Search */}
            <div className="relative">
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-md flex items-center justify-center">
                <FaSearch className="text-white text-xs" />
              </div>
              <input
                type="text"
                placeholder="Search return ID, order ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-11 pr-4 py-2 sm:py-3 border border-emerald-200 rounded-xl sm:rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white/80 backdrop-blur-sm text-sm sm:text-base transition-all duration-300"
              />
            </div>
          </div>

            {/* Status Filter */}
            <select
              value={filters.status}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value, page: 1 }))}
              className="w-full px-3 py-2 sm:py-3 border border-emerald-200 rounded-xl sm:rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white/80 backdrop-blur-sm text-sm sm:text-base transition-all duration-300"
            >
              <option value="all">All Status</option>
              <option value="requested">Requested</option>
              <option value="admin_review">Under Review</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="quality_checked">Quality Checked</option>
              <option value="refund_approved">Refund Approved</option>
              <option value="completed">Completed</option>
            </select>

            {/* Return Reason Filter */}
            <select
              value={filters.returnReason}
              onChange={(e) => setFilters(prev => ({ ...prev, returnReason: e.target.value, page: 1 }))}
              className="w-full px-3 py-2 sm:py-3 border border-emerald-200 rounded-xl sm:rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white/80 backdrop-blur-sm text-sm sm:text-base transition-all duration-300"
            >
              <option value="all">All Reasons</option>
              <option value="defective">Defective</option>
              <option value="wrong_item">Wrong Item</option>
              <option value="not_as_described">Not as Described</option>
              <option value="quality_issue">Quality Issue</option>
              <option value="changed_mind">Changed Mind</option>
            </select>

            {/* Items per page */}
            <select
              value={filters.limit}
              onChange={(e) => setFilters(prev => ({ ...prev, limit: parseInt(e.target.value), page: 1 }))}
              className="w-full px-3 py-2 sm:py-3 border border-emerald-200 rounded-xl sm:rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white/80 backdrop-blur-sm text-sm sm:text-base transition-all duration-300"
          >
            <option value="10">10 per page</option>
            <option value="20">20 per page</option>
            <option value="50">50 per page</option>
          </select>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-800">{error}</p>
          <button 
            onClick={() => {
              setError('');
              fetchReturns();
            }}
            className="mt-2 text-red-600 hover:text-red-800 underline"
          >
            Try again
          </button>
        </div>
      )}

      {/* Returns Display */}
      {loading ? (
        <div className="flex justify-center items-center py-16 sm:py-20 lg:py-24">
          <div className="text-center">
            <div className="w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-xl shadow-emerald-200">
              <FaSpinner className="animate-spin text-white text-lg sm:text-xl lg:text-2xl" />
            </div>
            <p className="text-sm sm:text-base lg:text-lg text-gray-600 font-medium">Loading return requests...</p>
          </div>
        </div>
      ) : !Array.isArray(returns) || returns.length === 0 ? (
        <div className="text-center py-16 sm:py-20 lg:py-24">
          <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 xl:w-28 xl:h-28 bg-gradient-to-br from-gray-300 via-gray-200 to-gray-300 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl shadow-gray-200">
            <FaBoxOpen className="text-gray-500 text-xl sm:text-2xl lg:text-3xl xl:text-4xl" />
          </div>
          <h3 className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-semibold text-gray-800 mb-2 sm:mb-3">
            No Return Requests
          </h3>
          <p className="text-sm sm:text-base lg:text-lg text-gray-600">
            No return requests found matching your criteria
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:gap-6 lg:gap-8">
          {returns.map((returnRequest) => {
            const priority = getPriorityLevel(returnRequest);
            const totalAmount = returnRequest.items.reduce((sum, item) => 
              sum + (item.originalPrice * item.quantity), 0);
            
            return (
              <div 
                key={returnRequest._id} 
                className="bg-white/80 backdrop-blur-sm rounded-2xl sm:rounded-3xl shadow-xl shadow-emerald-100/50 border border-white/50 p-4 sm:p-6 lg:p-8 hover:shadow-2xl hover:shadow-emerald-200/70 transition-all duration-300 hover:scale-[1.01] group"
              >
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 sm:gap-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 bg-gradient-to-br from-emerald-500 via-green-500 to-teal-500 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-200 group-hover:shadow-emerald-300 transition-all duration-300">
                        <FaBoxOpen className="text-white text-sm sm:text-base lg:text-lg" />
                      </div>
                      <div>
                        <h3 className="text-base sm:text-lg lg:text-xl xl:text-2xl font-semibold text-gray-800">
                          Return #{returnRequest.returnRequestId}
                        </h3>
                        <p className="text-xs sm:text-sm lg:text-base text-gray-600">
                          Order: #{(returnRequest.orderId?._id || returnRequest.orderId)?.toString()?.slice(-8) || 'N/A'}
                        </p>
                        <p className="text-xs sm:text-sm lg:text-base text-gray-500">
                          {new Date(returnRequest.requestedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    {/* Customer Info */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-3 sm:mb-4">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 sm:w-7 sm:h-7 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center shadow-md">
                          <FaUser className="text-white text-xs sm:text-sm" />
                        </div>
                        <div>
                          <p className="text-xs sm:text-sm font-medium text-gray-700">
                            {returnRequest.customerId?.name || 'N/A'}
                          </p>
                          <p className="text-xs text-gray-500">
                            {returnRequest.customerId?.email || 'N/A'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 sm:w-7 sm:h-7 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center shadow-md">
                          <FaCoins className="text-white text-xs sm:text-sm" />
                        </div>
                        <div>
                          <p className="text-xs sm:text-sm font-medium text-gray-700">
                            ₹{totalAmount.toFixed(2)}
                          </p>
                          <p className="text-xs text-gray-500">
                            {returnRequest.items.length} item(s)
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className={`w-6 h-6 sm:w-7 sm:h-7 rounded-lg flex items-center justify-center shadow-md ${
                          priority === 'high' ? 'bg-gradient-to-br from-red-500 to-pink-500' :
                          priority === 'medium' ? 'bg-gradient-to-br from-yellow-500 to-orange-500' :
                          'bg-gradient-to-br from-green-500 to-emerald-500'
                        }`}>
                          <FaExclamationTriangle className="text-white text-xs sm:text-sm" />
                        </div>
                        <div>
                          <p className="text-xs sm:text-sm font-medium text-gray-700">
                            {priority?.toUpperCase()} Priority
                          </p>
                          <p className="text-xs text-gray-500">
                            {returnRequest.returnReason}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Status Badge */}
                    <div className="mb-3 sm:mb-4">
                      <span className={`px-3 sm:px-4 py-1 sm:py-2 rounded-full text-xs sm:text-sm font-medium border shadow-md ${getStatusBadgeColor(returnRequest.status)}`}>
                        {returnRequest.status.replace('_', ' ').toUpperCase()}
                      </span>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-2 sm:gap-3">
                      <button
                        onClick={() => navigate(`/admin/returns/${returnRequest._id}`)}
                        className="px-3 sm:px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-lg sm:rounded-xl hover:from-emerald-600 hover:to-teal-600 transition-all duration-300 flex items-center text-xs sm:text-sm font-medium shadow-lg hover:shadow-xl"
                      >
                        <div className="w-4 h-4 sm:w-5 sm:h-5 bg-white/20 rounded-md flex items-center justify-center mr-2">
                          <FaEye className="text-white text-xs" />
                        </div>
                        View Details
                      </button>

                      {returnRequest.status === 'requested' && (
                        <button
                          onClick={() => openReviewModal(returnRequest)}
                          className="px-3 sm:px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-lg sm:rounded-xl hover:from-blue-600 hover:to-indigo-600 transition-all duration-300 flex items-center text-xs sm:text-sm font-medium shadow-lg hover:shadow-xl"
                        >
                          <div className="w-4 h-4 sm:w-5 sm:h-5 bg-white/20 rounded-md flex items-center justify-center mr-2">
                            <FaClipboardCheck className="text-white text-xs" />
                          </div>
                          Review
                        </button>
                      )}

                      {returnRequest.status === 'quality_checked' && (
                        <button
                          onClick={() => openRefundModal(returnRequest)}
                          className="px-3 sm:px-4 py-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-lg sm:rounded-xl hover:from-yellow-600 hover:to-orange-600 transition-all duration-300 flex items-center text-xs sm:text-sm font-medium shadow-lg hover:shadow-xl"
                        >
                          <div className="w-4 h-4 sm:w-5 sm:h-5 bg-white/20 rounded-md flex items-center justify-center mr-2">
                            <FaCoins className="text-white text-xs" />
                          </div>
                          Final Decision
                        </button>
                      )}

                      {returnRequest.status === 'refund_approved' && (
                        <button
                          onClick={() => processRefund(returnRequest._id)}
                          className="px-3 sm:px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg sm:rounded-xl hover:from-green-600 hover:to-emerald-600 transition-all duration-300 flex items-center text-xs sm:text-sm font-medium shadow-lg hover:shadow-xl"
                        >
                          <div className="w-4 h-4 sm:w-5 sm:h-5 bg-white/20 rounded-md flex items-center justify-center mr-2">
                            <FaCheckCircle className="text-white text-xs" />
                          </div>
                          Process Refund
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl sm:rounded-3xl shadow-xl shadow-emerald-100/50 border border-white/50 px-4 sm:px-6 lg:px-8 py-3 sm:py-4 mt-4 sm:mt-6 lg:mt-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
            <div className="flex justify-between sm:hidden">
              <button
                onClick={() => setFilters(prev => ({ ...prev, page: Math.max(prev.page - 1, 1) }))}
                disabled={filters.page === 1}
                className="px-3 sm:px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-lg hover:from-emerald-600 hover:to-teal-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-xs sm:text-sm font-medium shadow-lg"
              >
                Previous
              </button>
              <button
                onClick={() => setFilters(prev => ({ ...prev, page: Math.min(prev.page + 1, pagination.pages) }))}
                disabled={filters.page === pagination.pages}
                className="px-3 sm:px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-lg hover:from-emerald-600 hover:to-teal-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-xs sm:text-sm font-medium shadow-lg"
              >
                Next
              </button>
            </div>
            
            <div className="hidden sm:flex sm:items-center sm:justify-between w-full">
              <div>
                <p className="text-xs sm:text-sm lg:text-base text-gray-700 font-medium">
                  Showing{' '}
                  <span className="font-semibold text-emerald-600">{((filters.page - 1) * filters.limit) + 1}</span>
                  {' '}to{' '}
                  <span className="font-semibold text-emerald-600">
                    {Math.min(filters.page * filters.limit, pagination.total)}
                  </span>
                  {' '}of{' '}
                  <span className="font-semibold text-emerald-600">{pagination.total}</span>
                  {' '}results
                </p>
              </div>
              <div>
                <nav className="flex items-center gap-1 sm:gap-2">
                  {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => setFilters(prev => ({ ...prev, page }))}
                      className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all duration-300 shadow-md ${
                        page === filters.page
                          ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-200'
                          : 'bg-white text-gray-600 hover:bg-emerald-50 hover:text-emerald-600 border border-emerald-200'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </nav>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Details Modal */}
      {showDetailsModal && selectedReturn && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Return Details - #{selectedReturn.returnRequestId}
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Column */}
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-gray-700 mb-2">Return Information</h4>
                    <div className="bg-gray-50 p-3 rounded text-sm space-y-2">
                      <div><span className="font-medium">Status:</span> {selectedReturn.status}</div>
                      <div><span className="font-medium">Reason:</span> {selectedReturn.returnReason}</div>
                      <div><span className="font-medium">Requested:</span> {new Date(selectedReturn.requestedAt).toLocaleString()}</div>
                      <div><span className="font-medium">Items:</span> {selectedReturn.items.length}</div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-700 mb-2">Customer Comments</h4>
                    <div className="bg-gray-50 p-3 rounded text-sm">
                      {selectedReturn.customerComments || 'No comments provided'}
                    </div>
                  </div>

                  {selectedReturn.refund?.warehouseRecommendation && (
                    <div>
                      <h4 className="font-medium text-gray-700 mb-2">Warehouse Recommendation</h4>
                      <div className="bg-blue-50 p-3 rounded text-sm space-y-2">
                        <div><span className="font-medium">Refund %:</span> {selectedReturn.refund.warehouseRecommendation.refundPercentage}%</div>
                        <div><span className="font-medium">Recommendation:</span> {selectedReturn.refund.warehouseRecommendation.recommendation}</div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Right Column */}
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-gray-700 mb-2">Return Items</h4>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {selectedReturn.items.map((item, index) => (
                        <div key={index} className="bg-gray-50 p-3 rounded text-sm">
                          <div className="font-medium">{item.productName}</div>
                          <div className="text-gray-600">
                            Qty: {item.quantity} × ₹{item.originalPrice}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-700 mb-2">Evidence Images</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {selectedReturn.evidenceImages.map((image, index) => (
                        <img
                          key={index}
                          src={image}
                          alt={`Evidence ${index + 1}`}
                          className="w-full h-24 object-cover rounded cursor-pointer hover:opacity-80"
                          onClick={() => window.open(image, '_blank')}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Review Modal */}
      {showReviewModal && selectedReturn && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-2xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Review Return Request - #{selectedReturn.returnRequestId}
              </h3>
              
              <form onSubmit={reviewReturnRequest} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Decision *
                  </label>
                  <select
                    required
                    value={reviewForm.decision}
                    onChange={(e) => setReviewForm(prev => ({ ...prev, decision: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select decision</option>
                    <option value="approve">Approve</option>
                    <option value="reject">Reject</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Admin Comments
                  </label>
                  <textarea
                    value={reviewForm.adminComments}
                    onChange={(e) => setReviewForm(prev => ({ ...prev, adminComments: e.target.value }))}
                    placeholder="Enter your comments..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows="3"
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowReviewModal(false)}
                    className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center"
                  >
                    {actionLoading ? (
                      <>
                        <FaSpinner className="animate-spin mr-2" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <FaCheck className="mr-2" />
                        Submit Review
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Refund Decision Modal */}
      {showRefundModal && selectedReturn && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-2xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Final Refund Decision - #{selectedReturn.returnRequestId}
              </h3>
              
              <form onSubmit={makeFinalDecision} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Warehouse Recommendation: {selectedReturn.refund?.warehouseRecommendation?.refundPercentage || 0}%
                  </label>
                  <div className="bg-blue-50 p-3 rounded text-sm">
                    {selectedReturn.refund?.warehouseRecommendation?.recommendation || 'No recommendation provided'}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Final Refund Percentage *
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={refundForm.finalRefundPercentage}
                    onChange={(e) => setRefundForm(prev => ({ ...prev, finalRefundPercentage: parseInt(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Coin Refund Amount
                  </label>
                  <div className="bg-green-50 p-3 rounded text-sm font-medium text-green-800">
                    <FaCoins className="inline mr-2" />
                    {refundForm.coinRefund} coins will be credited to customer
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Admin Comments
                  </label>
                  <textarea
                    value={refundForm.adminComments}
                    onChange={(e) => setRefundForm(prev => ({ ...prev, adminComments: e.target.value }))}
                    placeholder="Enter final decision comments..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows="3"
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowRefundModal(false)}
                    className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 flex items-center"
                  >
                    {actionLoading ? (
                      <>
                        <FaSpinner className="animate-spin mr-2" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <FaCoins className="mr-2" />
                        Approve Refund
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminReturnManagement;
