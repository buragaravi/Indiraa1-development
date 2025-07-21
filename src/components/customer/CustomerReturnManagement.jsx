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

  const API_URL = 'http://localhost:5001';

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
      'completed': 'bg-green-100 text-green-800',
      'cancelled': 'bg-gray-100 text-gray-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
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
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center">
          <FaBoxOpen className="mr-3 text-blue-600" />
          My Returns
        </h1>
        <p className="mt-1 text-gray-600">
          View and track your return requests
        </p>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-800">{error}</p>
          <button 
            onClick={() => {
              setError('');
              fetchMyReturns();
            }}
            className="mt-2 text-red-600 hover:text-red-800 underline"
          >
            Try again
          </button>
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <FaSpinner className="animate-spin text-2xl text-gray-400" />
          <span className="ml-2 text-gray-600">Loading...</span>
        </div>
      ) : (
        <div>
          {!Array.isArray(myReturns) || myReturns.length === 0 ? (
            <div className="text-center py-12">
              <FaBoxOpen className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No Return Requests
              </h3>
              <p className="text-gray-600">
                You haven't made any return requests yet.
              </p>
            </div>
          ) : (
            <div className="grid gap-6">
              {myReturns.map((returnRequest) => (
                <div 
                  key={returnRequest._id} 
                  className="bg-white rounded-lg shadow border p-6 cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => navigateToReturnDetail(returnRequest._id)}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        Return #{returnRequest.returnRequestId}
                      </h3>
                      <p className="text-sm text-gray-600">
                        Requested: {new Date(returnRequest.requestedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(returnRequest.status)}`}>
                      {getStatusText(returnRequest.status)}
                    </span>
                  </div>

                  {/* Return Details */}
                  <div className="mb-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-gray-700">Reason:</span>
                        <span className="ml-2 text-gray-600">{returnRequest.returnReason}</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Items:</span>
                        <span className="ml-2 text-gray-600">{returnRequest.items.length} item(s)</span>
                      </div>
                    </div>
                    {returnRequest.customerComments && (
                      <div className="mt-2 text-sm">
                        <span className="font-medium text-gray-700">Comments:</span>
                        <p className="text-gray-600 mt-1">{returnRequest.customerComments}</p>
                      </div>
                    )}
                  </div>

                  {/* Progress Timeline */}
                  <div className="mb-4">
                    <div className="flex items-center space-x-2 text-sm">
                      {returnRequest.status === 'completed' && (
                        <div className="flex items-center text-green-600">
                          <FaCheckCircle className="mr-1" />
                          <span>Refund processed: {returnRequest.refund?.processing?.coinRefund || 0} coins</span>
                        </div>
                      )}
                      {returnRequest.status === 'rejected' && (
                        <div className="flex items-center text-red-600">
                          <FaTimesCircle className="mr-1" />
                          <span>Return rejected</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex space-x-3">
                    {returnRequest.status === 'requested' && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          cancelReturnRequest(returnRequest._id);
                        }}
                        className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                      >
                        Cancel Request
                      </button>
                    )}
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        navigateToReturnDetail(returnRequest._id);
                      }}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                    >
                      <FaEye className="mr-2" />
                      View Return Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CustomerReturnManagement;
