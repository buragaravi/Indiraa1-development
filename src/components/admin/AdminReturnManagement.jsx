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
  FaUser,
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

  const API_URL = import.meta.env.VITE_API_URL || 'https://indiraa1-backend.onrender.com';

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
      'requested': 'admin-return-status-requested',
      'admin_review': 'admin-return-status-review',
      'approved': 'admin-return-status-approved',
      'rejected': 'admin-return-status-rejected',
      'warehouse_assigned': 'admin-return-status-warehouse',
      'pickup_scheduled': 'admin-return-status-pickup',
      'picked_up': 'admin-return-status-picked',
      'in_warehouse': 'admin-return-status-in-warehouse',
      'quality_checked': 'admin-return-status-quality',
      'refund_approved': 'admin-return-status-refund-approved',
      'refund_processed': 'admin-return-status-refund-processed',
      'completed': 'admin-return-status-completed'
    };
    return colors[status] || 'admin-return-status-default';
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
    <div className="admin-returns-page-bg">
      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-10 2xl:px-12 py-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-3">
            <div className="admin-returns-header-icon">
              <FaBoxOpen className="text-white text-xl" />
            </div>
            <div>
              <h1 className="admin-returns-title">
                Return Management
              </h1>
              <p className="text-slate-600 mt-1">Streamlined return processing with elegant workflow management</p>
            </div>
          </div>
        </div>

        {/* Modern Search and Quick Filters */}
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl shadow-slate-200/30 border border-white/60 p-6 mb-8">
          {/* Search Bar */}
          <div className="relative mb-6">
            <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
              <div className="admin-returns-search-icon">
                <FaSearch className="text-white text-xs" />
              </div>
            </div>
            <input
              type="text"
              placeholder="Search by return ID, order ID, or customer name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-14 pr-12 py-4 bg-white/80 backdrop-blur-sm border border-slate-200/50 rounded-xl focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-300 transition-all duration-300 text-sm placeholder-slate-400 shadow-sm"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <FaTimes className="text-sm" />
              </button>
            )}
          </div>

          {/* Quick Filter Tabs */}
          <div className="flex flex-wrap gap-3 mb-6">
            <button
              onClick={() => setFilters(prev => ({ ...prev, status: 'all', page: 1 }))}
              className={`px-5 py-3 rounded-xl text-sm font-medium transition-all duration-300 shadow-sm ${
                filters.status === 'all' 
                  ? 'admin-returns-filter-active' 
                  : 'bg-white/60 text-slate-600 hover:bg-white/80 border border-slate-200/50 hover:shadow-md'
              }`}
            >
              All Returns
            </button>
            <button
              onClick={() => setFilters(prev => ({ ...prev, status: 'requested', page: 1 }))}
              className={`px-5 py-3 rounded-xl text-sm font-medium transition-all duration-300 shadow-sm ${
                filters.status === 'requested' 
                  ? 'admin-returns-filter-requested' 
                  : 'bg-white/60 text-slate-600 hover:bg-white/80 border border-slate-200/50 hover:shadow-md'
              }`}
            >
              <span className="mr-2">🟡</span>Pending Review
            </button>
            <button
              onClick={() => setFilters(prev => ({ ...prev, status: 'admin_review', page: 1 }))}
              className={`px-5 py-3 rounded-xl text-sm font-medium transition-all duration-300 shadow-sm ${
                filters.status === 'admin_review' 
                  ? 'admin-returns-filter-review' 
                  : 'bg-white/60 text-slate-600 hover:bg-white/80 border border-slate-200/50 hover:shadow-md'
              }`}
            >
              <span className="mr-2">🔍</span>Under Review
            </button>
            <button
              onClick={() => setFilters(prev => ({ ...prev, status: 'approved', page: 1 }))}
              className={`px-5 py-3 rounded-xl text-sm font-medium transition-all duration-300 shadow-sm ${
                filters.status === 'approved' 
                  ? 'admin-returns-filter-approved' 
                  : 'bg-white/60 text-slate-600 hover:bg-white/80 border border-slate-200/50 hover:shadow-md'
              }`}
            >
              <span className="mr-2">✅</span>Approved
            </button>
            <button
              onClick={() => setFilters(prev => ({ ...prev, status: 'quality_checked', page: 1 }))}
              className={`px-5 py-3 rounded-xl text-sm font-medium transition-all duration-300 shadow-sm ${
                filters.status === 'quality_checked' 
                  ? 'admin-returns-filter-quality' 
                  : 'bg-white/60 text-slate-600 hover:bg-white/80 border border-slate-200/50 hover:shadow-md'
              }`}
            >
              <span className="mr-2">🔬</span>Quality Checked
            </button>
            <button
              onClick={() => setFilters(prev => ({ ...prev, status: 'refund_approved', page: 1 }))}
              className={`px-5 py-3 rounded-xl text-sm font-medium transition-all duration-300 shadow-sm ${
                filters.status === 'refund_approved' 
                  ? 'admin-returns-filter-refund' 
                  : 'bg-white/60 text-slate-600 hover:bg-white/80 border border-slate-200/50 hover:shadow-md'
              }`}
            >
              <span className="mr-2">💰</span>Refund Ready
            </button>
            <button
              onClick={() => setFilters(prev => ({ ...prev, status: 'completed', page: 1 }))}
              className={`px-5 py-3 rounded-xl text-sm font-medium transition-all duration-300 shadow-sm ${
                filters.status === 'completed' 
                  ? 'admin-returns-filter-completed' 
                  : 'bg-white/60 text-slate-600 hover:bg-white/80 border border-slate-200/50 hover:shadow-md'
              }`}
            >
              <span className="mr-2">✔️</span>Completed
            </button>
          </div>

          {/* Advanced Filters (Collapsible) */}
          <details className="group">
            <summary className="flex items-center gap-3 text-sm text-slate-600 cursor-pointer hover:text-slate-800 transition-colors p-3 bg-slate-50/50 rounded-lg">
              <div className="admin-returns-advanced-filter-icon">
                <FaFilter className="text-white text-xs" />
              </div>
              <span className="font-medium">Advanced Filters</span>
              <svg className="w-4 h-4 transition-transform group-open:rotate-180 ml-auto" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </summary>
            <div className="mt-6 pt-6 border-t border-slate-200/50 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-3">Return Reason</label>
                <select
                  value={filters.returnReason}
                  onChange={(e) => setFilters(prev => ({ ...prev, returnReason: e.target.value, page: 1 }))}
                  className="w-full px-4 py-3 bg-white/80 backdrop-blur-sm border border-slate-200/50 rounded-xl focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-300 text-sm transition-all duration-300"
                >
                  <option value="all">All Reasons</option>
                  <option value="defective">Defective Product</option>
                  <option value="wrong_item">Wrong Item Received</option>
                  <option value="not_as_described">Not as Described</option>
                  <option value="quality_issue">Quality Issues</option>
                  <option value="changed_mind">Changed Mind</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-3">Items per Page</label>
                <select
                  value={filters.limit}
                  onChange={(e) => setFilters(prev => ({ ...prev, limit: parseInt(e.target.value), page: 1 }))}
                  className="w-full px-4 py-3 bg-white/80 backdrop-blur-sm border border-slate-200/50 rounded-xl focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-300 text-sm transition-all duration-300"
                >
                  <option value="10">10 per page</option>
                  <option value="20">20 per page</option>
                  <option value="50">50 per page</option>
                </select>
              </div>
              <div className="flex items-end">
                <button
                  onClick={fetchReturns}
                  className="admin-returns-refresh-button"
                >
                  <div className="w-4 h-4 bg-white/20 rounded-md flex items-center justify-center">
                    <FaSearch className="text-white text-xs" />
                  </div>
                  Refresh
                </button>
              </div>
            </div>
          </details>
        </div>

      {/* Error Display */}
      {error && (
        <div className="admin-returns-error-container">
          <div className="flex items-center gap-3 mb-3">
            <div className="admin-returns-error-icon">
              <FaExclamationTriangle className="text-white" />
            </div>
            <p className="text-red-800 font-bold text-lg">Unable to Load Returns</p>
          </div>
          <p className="text-red-700 mb-4">{error}</p>
          <button 
            onClick={() => {
              setError('');
              fetchReturns();
            }}
            className="admin-returns-error-button"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Returns Display */}
      {loading ? (
        <div className="flex items-center justify-center py-24">
          <div className="text-center">
            <div className="admin-returns-loading-icon">
              <FaSpinner className="animate-spin text-white text-xl" />
            </div>
            <h3 className="admin-returns-loading-title">
              Loading Returns
            </h3>
            <p className="text-slate-500">Fetching the latest return requests...</p>
          </div>
        </div>
      ) : !Array.isArray(returns) || returns.length === 0 ? (
        <div className="text-center py-24">
          <div className="admin-returns-empty-icon">
            <FaBoxOpen className="text-slate-400 text-2xl" />
          </div>
          <h3 className="text-2xl font-bold text-slate-800 mb-3">No Return Requests Found</h3>
          <p className="text-slate-500 mb-6 max-w-md mx-auto">
            {searchTerm || filters.status !== 'all' || filters.returnReason !== 'all' 
              ? 'No returns match your current search criteria. Try adjusting your filters.' 
              : 'No return requests have been submitted yet. They will appear here when customers request returns.'}
          </p>
          {(searchTerm || filters.status !== 'all' || filters.returnReason !== 'all') && (
            <button
              onClick={() => {
                setSearchTerm('');
                setFilters({ status: 'all', returnReason: 'all', page: 1, limit: 20 });
              }}
              className="admin-returns-clear-filters-button"
            >
              Clear All Filters
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {returns.map((returnRequest) => {
            const priority = getPriorityLevel(returnRequest);
            const totalAmount = returnRequest.items.reduce((sum, item) => 
              sum + (item.originalPrice * item.quantity), 0);
            
            return (
              <div 
                key={returnRequest._id} 
                onClick={() => navigate(`/admin/returns/${returnRequest._id}`)}
                className="group bg-white/60 backdrop-blur-sm rounded-2xl shadow-xl shadow-slate-200/30 border border-white/50 p-6 hover:shadow-2xl hover:shadow-slate-300/40 transition-all duration-500 cursor-pointer hover:scale-[1.02] hover:bg-white/80"
              >
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className="admin-returns-card-icon">
                      <FaBoxOpen className="text-white text-lg" />
                    </div>
                    <div>
                      <h3 className="admin-returns-card-title">
                        Return #{returnRequest.returnRequestId}
                      </h3>
                      <p className="text-slate-500 text-sm mt-1">
                        Order #{(returnRequest.orderId?._id || returnRequest.orderId)?.toString()?.slice(-8) || 'N/A'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`admin-returns-status-badge ${getStatusBadgeColor(returnRequest.status)}`}>
                      {returnRequest.status.replace('_', ' ').toUpperCase()}
                    </span>
                    <p className="text-slate-400 text-sm mt-2 font-medium">
                      {new Date(returnRequest.requestedAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </p>
                  </div>
                </div>

                {/* Info Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <div className="admin-return-blue-card">
                    <div className="admin-return-blue-icon">
                      <FaUser className="text-white text-sm" />
                    </div>
                    <div>
                      <p className="text-slate-800 font-semibold text-sm">
                        {returnRequest.customerId?.name || 'N/A'}
                      </p>
                      <p className="text-slate-500 text-xs">Customer</p>
                    </div>
                  </div>
                  <div className="admin-return-green-card">
                    <div className="admin-return-green-icon">
                      <FaCoins className="text-white text-sm" />
                    </div>
                    <div>
                      <p className="text-slate-800 font-semibold text-sm">₹{totalAmount.toFixed(2)}</p>
                      <p className="text-slate-500 text-xs">{returnRequest.items.length} item(s)</p>
                    </div>
                  </div>
                  <div className="admin-return-orange-card">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-md ${
                      priority === 'high' ? 'admin-return-priority-high' :
                      priority === 'medium' ? 'admin-return-priority-medium' :
                      'admin-return-priority-low'
                    }`}>
                      <FaExclamationTriangle className="text-white text-sm" />
                    </div>
                    <div>
                      <p className="text-slate-800 font-semibold text-sm capitalize">{priority} Priority</p>
                      <p className="text-slate-500 text-xs">{returnRequest.returnReason.replace('_', ' ')}</p>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap gap-3 pt-4 border-t border-slate-200/50">
                  {returnRequest.status === 'requested' && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openReviewModal(returnRequest);
                      }}
                      className="admin-return-btn-blue"
                    >
                      <div className="w-4 h-4 bg-white/20 rounded-md flex items-center justify-center">
                        <FaClipboardCheck className="text-white text-xs" />
                      </div>
                      Review Request
                    </button>
                  )}

                  {returnRequest.status === 'quality_checked' && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openRefundModal(returnRequest);
                      }}
                      className="admin-return-btn-amber"
                    >
                      <div className="w-4 h-4 bg-white/20 rounded-md flex items-center justify-center">
                        <FaCoins className="text-white text-xs" />
                      </div>
                      Final Decision
                    </button>
                  )}

                  {returnRequest.status === 'refund_approved' && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        processRefund(returnRequest._id);
                      }}
                      className="admin-return-btn-green"
                    >
                      <div className="w-4 h-4 bg-white/20 rounded-md flex items-center justify-center">
                        <FaCheckCircle className="text-white text-xs" />
                      </div>
                      Process Refund
                    </button>
                  )}

                  <div className="ml-auto flex items-center text-slate-400 group-hover:text-slate-600 transition-colors">
                    <span className="text-xs font-medium mr-2">Click to view details</span>
                    <FaEye className="text-sm" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Elegant Pagination */}
      {pagination.pages > 1 && (
        <div className="bg-white/60 backdrop-blur-sm rounded-2xl shadow-xl shadow-slate-200/30 border border-white/50 px-8 py-6 mt-8">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-600 font-medium">
              Showing <span className="font-bold text-indigo-600">{((filters.page - 1) * filters.limit) + 1}</span> to <span className="font-bold text-indigo-600">{Math.min(filters.page * filters.limit, pagination.total)}</span> of <span className="font-bold text-indigo-600">{pagination.total}</span> results
            </p>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setFilters(prev => ({ ...prev, page: Math.max(prev.page - 1, 1) }))}
                disabled={filters.page === 1}
                className="px-6 py-3 text-slate-600 bg-white/80 backdrop-blur-sm border border-slate-200/50 rounded-xl hover:bg-white hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 font-medium"
              >
                Previous
              </button>
              <div className="admin-return-header">
                {filters.page} of {pagination.pages}
              </div>
              <button
                onClick={() => setFilters(prev => ({ ...prev, page: Math.min(prev.page + 1, pagination.pages) }))}
                disabled={filters.page === pagination.pages}
                className="px-6 py-3 text-slate-600 bg-white/80 backdrop-blur-sm border border-slate-200/50 rounded-xl hover:bg-white hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 font-medium"
              >
                Next
              </button>
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

      {/* Elegant Review Modal */}
      {showReviewModal && selectedReturn && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl shadow-slate-300/30 border border-white/50 max-w-lg w-full">
            <div className="p-8">
              <div className="flex items-center gap-4 mb-6">
                <div className="admin-return-modal-icon-blue">
                  <FaClipboardCheck className="text-white text-lg" />
                </div>
                <div>
                  <h3 className="admin-return-modal-title-blue">
                    Review Return Request
                  </h3>
                  <p className="text-slate-500 font-medium">#{selectedReturn.returnRequestId}</p>
                </div>
              </div>
              
              <form onSubmit={reviewReturnRequest} className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-3">
                    Decision
                  </label>
                  <select
                    required
                    value={reviewForm.decision}
                    onChange={(e) => setReviewForm(prev => ({ ...prev, decision: e.target.value }))}
                    className="w-full px-4 py-3 bg-white/80 backdrop-blur-sm border border-slate-200/50 rounded-xl focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-300 transition-all duration-300"
                  >
                    <option value="">Select your decision</option>
                    <option value="approve">✅ Approve Return Request</option>
                    <option value="reject">❌ Reject Return Request</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-3">
                    Comments (Optional)
                  </label>
                  <textarea
                    value={reviewForm.adminComments}
                    onChange={(e) => setReviewForm(prev => ({ ...prev, adminComments: e.target.value }))}
                    placeholder="Add any comments about your decision..."
                    className="w-full px-4 py-3 bg-white/80 backdrop-blur-sm border border-slate-200/50 rounded-xl focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-300 transition-all duration-300"
                    rows="4"
                  />
                </div>

                <div className="flex gap-4 pt-6">
                  <button
                    type="button"
                    onClick={() => setShowReviewModal(false)}
                    className="flex-1 px-6 py-3 text-slate-600 bg-white/60 backdrop-blur-sm border border-slate-200/50 rounded-xl hover:bg-white/80 transition-all duration-300 font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={actionLoading || !reviewForm.decision}
                    className="admin-return-modal-btn-blue"
                  >
                    {actionLoading ? (
                      <>
                        <FaSpinner className="animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <FaCheck />
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

      {/* Elegant Refund Decision Modal */}
      {showRefundModal && selectedReturn && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl shadow-slate-300/30 border border-white/50 max-w-2xl w-full">
            <div className="p-8">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 admin-return-modal-icon rounded-2xl flex items-center justify-center shadow-lg">
                  <FaCoins className="text-white text-lg" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold admin-return-modal-title">
                    Final Refund Decision
                  </h3>
                  <p className="text-slate-500 font-medium">#{selectedReturn.returnRequestId}</p>
                </div>
              </div>
              
              <form onSubmit={makeFinalDecision} className="space-y-6">
                {selectedReturn.refund?.warehouseRecommendation && (
                  <div className="admin-return-modal-step-bg p-6 rounded-xl border border-blue-200/50">
                    <h4 className="font-bold text-indigo-900 mb-3 flex items-center gap-2">
                      <FaWarehouse className="text-indigo-600" />
                      Warehouse Recommendation
                    </h4>
                    <div className="bg-white/60 p-4 rounded-lg mb-3">
                      <p className="text-indigo-800 font-bold text-lg mb-2">
                        Recommended Refund: {selectedReturn.refund.warehouseRecommendation.refundPercentage}%
                      </p>
                      <p className="text-indigo-700">
                        {selectedReturn.refund.warehouseRecommendation.recommendation}
                      </p>
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-3">
                    Final Refund Percentage
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={refundForm.finalRefundPercentage}
                    onChange={(e) => setRefundForm(prev => ({ ...prev, finalRefundPercentage: parseInt(e.target.value) || 0 }))}
                    className="w-full px-4 py-3 bg-white/80 backdrop-blur-sm border border-slate-200/50 rounded-xl focus:ring-2 focus:ring-orange-500/50 focus:border-orange-300 transition-all duration-300 font-bold text-lg"
                  />
                </div>

                <div className="admin-return-modal-success-bg p-6 rounded-xl border border-emerald-200/50">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 admin-return-modal-success-icon rounded-xl flex items-center justify-center">
                      <FaCoins className="text-white" />
                    </div>
                    <div>
                      <p className="font-bold text-emerald-800 text-xl">
                        {refundForm.coinRefund} coins
                      </p>
                      <p className="text-emerald-600 text-sm">Will be credited to customer</p>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-3">
                    Comments (Optional)
                  </label>
                  <textarea
                    value={refundForm.adminComments}
                    onChange={(e) => setRefundForm(prev => ({ ...prev, adminComments: e.target.value }))}
                    placeholder="Add comments about your final decision..."
                    className="w-full px-4 py-3 bg-white/80 backdrop-blur-sm border border-slate-200/50 rounded-xl focus:ring-2 focus:ring-orange-500/50 focus:border-orange-300 transition-all duration-300"
                    rows="4"
                  />
                </div>

                <div className="flex gap-4 pt-6">
                  <button
                    type="button"
                    onClick={() => setShowRefundModal(false)}
                    className="flex-1 px-6 py-3 text-slate-600 bg-white/60 backdrop-blur-sm border border-slate-200/50 rounded-xl hover:bg-white/80 transition-all duration-300 font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="flex-1 px-6 py-3 admin-return-modal-confirm-btn text-white rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center gap-2 font-medium shadow-lg shadow-emerald-200/50"
                  >
                    {actionLoading ? (
                      <>
                        <FaSpinner className="animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <FaCoins />
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
    </div>
  );
};

export default AdminReturnManagement;
