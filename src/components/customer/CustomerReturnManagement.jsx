import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FaBoxOpen, 
  FaInfoCircle,
  FaCheckCircle,
  FaTimesCircle,
  FaSpinner,
  FaEye
} from 'react-icons/fa';

const CustomerReturnManagement = () => {
  const navigate = useNavigate();
  const [myReturns, setMyReturns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const API_URL = 'https://indiraa1-backend.onrender.com';

  // Get user token
  const getToken = () => {
    return localStorage.getItem('token') || localStorage.getItem('userToken');
  };

  // Fetch eligible orders for return
  // Fetch customer's return requests
  const fetchMyReturns = async () => {
    try {
      setLoading(true);
      const token = getToken();
      
      if (!token) {
        throw new Error('Please login to view your returns');
      }

      const response = await fetch(`${API_URL}/api/returns/my-returns`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch return requests');
      }

      const data = await response.json();
      setMyReturns(Array.isArray(data.data?.returns) ? data.data.returns : []);
    } catch (error) {
      console.error('Error fetching returns:', error);
      setError(error.message);
      setMyReturns([]); // Ensure array on error
    } finally {
      setLoading(false);
    }
  };

  // Navigate to user return detail page
  const navigateToReturnDetail = (returnId) => {
    navigate(`/user/return/${returnId}`);
  };

  // Cancel return request
  const cancelReturnRequest = async (returnId) => {
    if (!confirm('Are you sure you want to cancel this return request?')) {
      return;
    }

    try {
      const token = getToken();
      const response = await fetch(`${API_URL}/api/returns/${returnId}/cancel`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to cancel return request');
      }

      alert('Return request cancelled successfully');
      fetchMyReturns();
      
    } catch (error) {
      console.error('Error cancelling return:', error);
      alert(`Failed to cancel return: ${error.message}`);
    }
  };

  // Get status badge color
  const getStatusBadgeColor = (status) => {
    const colors = {
      'requested': 'return-status-requested',
      'admin_review': 'return-status-admin-review',
      'approved': 'return-status-approved',
      'rejected': 'return-status-rejected',
      'warehouse_assigned': 'return-status-warehouse-assigned',
      'pickup_scheduled': 'return-status-pickup-scheduled',
      'picked_up': 'return-status-picked-up',
      'in_warehouse': 'return-status-in-warehouse',
      'quality_checked': 'return-status-quality-checked',
      'refund_approved': 'return-status-refund-approved',
      'refund_processed': 'return-status-refund-processed',
      'completed': 'return-status-completed',
      'cancelled': 'return-status-cancelled'
    };
    return colors[status] || 'gray-badge';
  };

  // Format status text
  const getStatusText = (status) => {
    const statusTexts = {
      'requested': 'Requested',
      'admin_review': 'Under Review',
      'approved': 'Approved',
      'rejected': 'Rejected',
      'warehouse_assigned': 'Assigned to Warehouse',
      'pickup_scheduled': 'Pickup Scheduled',
      'picked_up': 'Picked Up',
      'in_warehouse': 'In Warehouse',
      'quality_checked': 'Quality Checked',
      'refund_approved': 'Refund Approved',
      'refund_processed': 'Refund Processed',
      'completed': 'Completed',
      'cancelled': 'Cancelled'
    };
    return statusTexts[status] || status;
  };

  useEffect(() => {
    fetchMyReturns();
  }, []);

  return (
    <div className="min-h-screen returns-page-bg py-4 sm:py-6 lg:py-8">
      <div className="w-full max-w-none px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16">
        {/* Header */}
        <div className="mb-4 sm:mb-6 lg:mb-8">
          <h1 className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-bold text-gray-800 flex items-center">
            <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 xl:w-14 xl:h-14 returns-header-icon rounded-xl flex items-center justify-center shadow-lg shadow-emerald-200 mr-2 sm:mr-3">
              <FaBoxOpen className="text-white text-sm sm:text-base lg:text-lg xl:text-xl" />
            </div>
            My Returns
          </h1>
          <p className="mt-1 sm:mt-2 text-sm sm:text-base lg:text-lg text-gray-600">
            View and track your return requests
          </p>
        </div>

        {/* Error Display */}
        {error && (
          <div className="returns-error-bg rounded-2xl p-4 sm:p-6 mb-4 sm:mb-6 shadow-lg shadow-red-100">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 returns-error-icon rounded-xl flex items-center justify-center shadow-lg">
                <FaTimesCircle className="text-white text-sm sm:text-base" />
              </div>
              <div>
                <p className="text-red-800 font-medium text-sm sm:text-base">{error}</p>
                <button 
                  onClick={() => {
                    setError('');
                    fetchMyReturns();
                  }}
                  className="mt-2 text-xs sm:text-sm text-red-600 hover:text-red-800 underline font-medium transition-colors"
                >
                  Try again
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Content */}
        {loading ? (
          <div className="flex justify-center items-center py-16 sm:py-20 lg:py-24">
            <div className="text-center">
              <div className="w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20 returns-loading-spinner rounded-full flex items-center justify-center mx-auto mb-4 shadow-xl shadow-emerald-200">
                <FaSpinner className="animate-spin text-white text-lg sm:text-xl lg:text-2xl" />
              </div>
              <span className="text-sm sm:text-base lg:text-lg text-gray-600 font-medium">Loading your returns...</span>
            </div>
          </div>
        ) : (
          <div>
            {!Array.isArray(myReturns) || myReturns.length === 0 ? (
              <div className="text-center py-16 sm:py-20 lg:py-24">
                <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 xl:w-28 xl:h-28 returns-empty-state-icon rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl shadow-gray-200">
                  <FaBoxOpen className="text-gray-500 text-xl sm:text-2xl lg:text-3xl xl:text-4xl" />
                </div>
                <h3 className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-semibold text-gray-800 mb-2 sm:mb-3">
                  No Return Requests
                </h3>
                <p className="text-sm sm:text-base lg:text-lg text-gray-600">
                  You haven't made any return requests yet.
                </p>
              </div>
            ) : (
              <div className="grid gap-4 sm:gap-6 lg:gap-8">
                {myReturns.map((returnRequest) => (
                  <div 
                    key={returnRequest._id} 
                    className="returns-card rounded-2xl sm:rounded-3xl shadow-xl shadow-emerald-100/50 p-4 sm:p-6 lg:p-8 cursor-pointer transition-all duration-300 group"
                    onClick={() => navigateToReturnDetail(returnRequest._id)}
                  >
                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 sm:gap-6">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
                          <div className="w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 returns-card-icon rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg transition-all duration-300">
                            <FaBoxOpen className="text-white text-sm sm:text-base lg:text-lg" />
                          </div>
                          <div>
                            <h3 className="text-base sm:text-lg lg:text-xl xl:text-2xl font-semibold text-gray-800">
                              Return #{returnRequest.returnRequestId}
                            </h3>
                            <p className="text-xs sm:text-sm lg:text-base text-gray-600">
                              Requested: {new Date(returnRequest.requestedAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>

                        {/* Return Details */}
                        <div className="mb-3 sm:mb-4">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4 text-xs sm:text-sm lg:text-base">
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 sm:w-7 sm:h-7 returns-info-icon rounded-lg flex items-center justify-center shadow-md">
                                <FaInfoCircle className="text-white text-xs sm:text-sm" />
                              </div>
                              <span className="font-medium text-gray-700">Reason:</span>
                              <span className="text-gray-600 truncate">{returnRequest.returnReason}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 sm:w-7 sm:h-7 returns-reason-icon rounded-lg flex items-center justify-center shadow-md">
                                <FaBoxOpen className="text-white text-xs sm:text-sm" />
                              </div>
                              <span className="font-medium text-gray-700">Items:</span>
                              <span className="text-gray-600">{returnRequest.items.length} item(s)</span>
                            </div>
                          </div>
                          {returnRequest.customerComments && (
                            <div className="mt-3 sm:mt-4 p-3 sm:p-4 bg-emerald-50/80 backdrop-blur-sm rounded-xl sm:rounded-2xl border border-emerald-100">
                              <span className="text-xs sm:text-sm font-medium text-emerald-800">Comments:</span>
                              <p className="text-xs sm:text-sm text-emerald-700 mt-1 line-clamp-2">{returnRequest.customerComments}</p>
                            </div>
                          )}
                        </div>

                        {/* Progress Timeline */}
                        <div className="mb-3 sm:mb-4">
                          <div className="flex items-center space-x-2 text-xs sm:text-sm">
                            {returnRequest.status === 'completed' && (
                              <div className="flex items-center text-green-600 bg-green-50/80 backdrop-blur-sm p-2 sm:p-3 rounded-xl border border-green-100">
                                <div className="w-5 h-5 sm:w-6 sm:h-6 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center mr-2 shadow-md">
                                  <FaCheckCircle className="text-white text-xs sm:text-sm" />
                                </div>
                                <span className="font-medium">Refund processed: {returnRequest.refund?.processing?.coinRefund || 0} coins</span>
                              </div>
                            )}
                            {returnRequest.status === 'rejected' && (
                              <div className="flex items-center text-red-600 bg-red-50/80 backdrop-blur-sm p-2 sm:p-3 rounded-xl border border-red-100">
                                <div className="w-5 h-5 sm:w-6 sm:h-6 bg-gradient-to-br from-red-500 to-pink-500 rounded-lg flex items-center justify-center mr-2 shadow-md">
                                  <FaTimesCircle className="text-white text-xs sm:text-sm" />
                                </div>
                                <span className="font-medium">Return rejected</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-wrap gap-2 sm:gap-3">
                          {returnRequest.status === 'requested' && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                cancelReturnRequest(returnRequest._id);
                              }}
                              className="returns-cancel-button"
                            >
                              Cancel Request
                            </button>
                          )}
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              navigateToReturnDetail(returnRequest._id);
                            }}
                            className="returns-view-details-button"
                          >
                            <div className="returns-view-icon">
                              <FaEye className="text-white text-xs" />
                            </div>
                            View Return Details
                          </button>
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-2 sm:gap-3">
                        <span className={`returns-status-badge ${getStatusBadgeColor(returnRequest.status)}`}>
                          {getStatusText(returnRequest.status)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerReturnManagement;
