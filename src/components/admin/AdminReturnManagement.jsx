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
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center">
          <FaBoxOpen className="mr-3 text-blue-600" />
          Return Management Dashboard
        </h1>
        <p className="mt-1 text-gray-600">
          Review and manage customer return requests
        </p>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search return ID, order ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Status Filter */}
          <select
            value={filters.status}
            onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value, page: 1 }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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

      {/* Returns Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <FaSpinner className="animate-spin text-2xl text-gray-400 mx-auto mb-2" />
            <p className="text-gray-600">Loading return requests...</p>
          </div>
        ) : !Array.isArray(returns) || returns.length === 0 ? (
          <div className="p-8 text-center">
            <FaBoxOpen className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-600">No return requests found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Return Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status & Priority
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount & Reason
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {returns.map((returnRequest) => {
                  const priority = getPriorityLevel(returnRequest);
                  const totalAmount = returnRequest.items.reduce((sum, item) => 
                    sum + (item.originalPrice * item.quantity), 0);
                  
                  return (
                    <tr key={returnRequest._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            #{returnRequest.returnRequestId}
                          </div>
                          <div className="text-sm text-gray-500">
                            Order: #{(returnRequest.orderId?._id || returnRequest.orderId)?.toString()?.slice(-8) || 'N/A'}
                          </div>
                          <div className="text-sm text-gray-500">
                            {new Date(returnRequest.requestedAt).toLocaleDateString()}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {returnRequest.customerId?.name || 'N/A'}
                          </div>
                          <div className="text-sm text-gray-500">
                            {returnRequest.customerId?.email}
                          </div>
                          <div className="text-sm text-gray-500">
                            {returnRequest.customerId?.phone}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeColor(returnRequest.status)}`}>
                          {returnRequest.status.replace('_', ' ').toUpperCase()}
                        </span>
                        <div className={`text-xs mt-1 ${getPriorityColor(priority)}`}>
                          <FaExclamationTriangle className="inline mr-1" />
                          {priority.toUpperCase()} PRIORITY
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            ₹{totalAmount}
                          </div>
                          <div className="text-sm text-gray-500">
                            {returnRequest.items.length} item(s)
                          </div>
                          <div className="text-sm text-gray-500">
                            {returnRequest.returnReason}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => navigate(`/admin/returns/${returnRequest._id}`)}
                            className="text-blue-600 hover:text-blue-900 p-1"
                            title="View Details"
                          >
                            <FaEye />
                          </button>
                          
                          {returnRequest.status === 'requested' && (
                            <button
                              onClick={() => openReviewModal(returnRequest)}
                              className="text-green-600 hover:text-green-900 p-1"
                              title="Review"
                            >
                              <FaClipboardCheck />
                            </button>
                          )}
                          
                          {returnRequest.status === 'quality_checked' && (
                            <button
                              onClick={() => openRefundModal(returnRequest)}
                              className="text-yellow-600 hover:text-yellow-900 p-1"
                              title="Final Decision"
                            >
                              <FaCoins />
                            </button>
                          )}
                          
                          {returnRequest.status === 'refund_approved' && (
                            <button
                              onClick={() => processRefund(returnRequest._id)}
                              className="text-green-600 hover:text-green-900 p-1"
                              title="Process Refund"
                            >
                              <FaCheckCircle />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => setFilters(prev => ({ ...prev, page: Math.max(prev.page - 1, 1) }))}
                disabled={filters.page === 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() => setFilters(prev => ({ ...prev, page: Math.min(prev.page + 1, pagination.pages) }))}
                disabled={filters.page === pagination.pages}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing{' '}
                  <span className="font-medium">{((filters.page - 1) * filters.limit) + 1}</span>
                  {' '}to{' '}
                  <span className="font-medium">
                    {Math.min(filters.page * filters.limit, pagination.total)}
                  </span>
                  {' '}of{' '}
                  <span className="font-medium">{pagination.total}</span>
                  {' '}results
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                  {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => setFilters(prev => ({ ...prev, page }))}
                      className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                        page === filters.page
                          ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                          : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>

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
