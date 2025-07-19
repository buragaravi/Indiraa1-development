import React, { useState, useEffect } from 'react';
import { 
  FaBoxOpen, 
  FaClock, 
  FaImage, 
  FaInfoCircle,
  FaCheckCircle,
  FaTimesCircle,
  FaSpinner,
  FaUpload,
  FaTrash,
  FaEye
} from 'react-icons/fa';

const CustomerReturnManagement = () => {
  const [activeTab, setActiveTab] = useState('eligible-orders');
  const [eligibleOrders, setEligibleOrders] = useState([]);
  const [myReturns, setMyReturns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Return request form state
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [returnForm, setReturnForm] = useState({
    items: [],
    returnReason: '',
    customerComments: '',
    evidenceImages: []
  });
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');

  // Image upload state
  const [uploadedImages, setUploadedImages] = useState([]);
  const [imageUploading, setImageUploading] = useState(false);

  const API_URL = 'https://indiraa1-backend.onrender.com';

  // Get user token
  const getToken = () => {
    return localStorage.getItem('token') || localStorage.getItem('userToken');
  };

  // Fetch eligible orders for return
  const fetchEligibleOrders = async () => {
    try {
      setLoading(true);
      const token = getToken();
      
      if (!token) {
        throw new Error('Please login to view eligible orders');
      }

      const response = await fetch(`${API_URL}/api/product/orders`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch orders');
      }

      const data = await response.json();
      
      // Filter delivered orders within return window
      const eligibleForReturn = data.orders?.filter(order => {
        if (order.status !== 'Delivered') return false;
        
        const deliveredDate = new Date(order.delivery?.deliveredAt || order.updatedAt);
        const daysSinceDelivery = (new Date() - deliveredDate) / (1000 * 60 * 60 * 24);
        
        return daysSinceDelivery <= 7 && !order.returnInfo?.hasActiveReturn;
      }) || [];

      setEligibleOrders(eligibleForReturn);
    } catch (error) {
      console.error('Error fetching eligible orders:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch customer's return requests
  const fetchMyReturns = async () => {
    try {
      setLoading(true);
      const token = getToken();
      
      if (!token) {
        throw new Error('Please login to view your returns');
      }

      const response = await fetch(`${API_URL}/api/returns`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch return requests');
      }

      const data = await response.json();
      setMyReturns(data.data || []);
    } catch (error) {
      console.error('Error fetching returns:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Check return eligibility for specific order
  const checkReturnEligibility = async (orderId) => {
    try {
      const token = getToken();
      const response = await fetch(`${API_URL}/api/returns/eligibility/${orderId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to check eligibility');
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('Error checking eligibility:', error);
      return null;
    }
  };

  // Handle image upload
  const handleImageUpload = async (files) => {
    setImageUploading(true);
    const uploadedFiles = [];

    try {
      for (const file of files) {
        // Validate file type
        if (!file.type.startsWith('image/')) {
          throw new Error('Please upload only image files');
        }

        // Validate file size (5MB max)
        if (file.size > 5 * 1024 * 1024) {
          throw new Error('Image size should be less than 5MB');
        }

        // Create preview for display
        const reader = new FileReader();
        reader.onload = (e) => {
          uploadedFiles.push({
            file: file,
            preview: e.target.result,
            name: file.name,
            size: file.size
          });
          
          if (uploadedFiles.length === files.length) {
            setUploadedImages(prev => [...prev, ...uploadedFiles]);
          }
        };
        reader.readAsDataURL(file);
      }
    } catch (error) {
      setFormError(error.message);
    } finally {
      setImageUploading(false);
    }
  };

  // Remove uploaded image
  const removeImage = (index) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index));
  };

  // Open return request modal
  const openReturnModal = async (order) => {
    setSelectedOrder(order);
    setReturnForm({
      items: order.items.map(item => ({
        orderItemId: item._id,
        quantity: item.qty,
        selected: true
      })),
      returnReason: '',
      customerComments: '',
      evidenceImages: []
    });
    setUploadedImages([]);
    setFormError('');
    setShowReturnModal(true);

    // Check eligibility
    const eligibility = await checkReturnEligibility(order._id);
    if (!eligibility?.isEligible) {
      setFormError(eligibility?.reason || 'This order is not eligible for return');
    }
  };

  // Submit return request
  const submitReturnRequest = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    setFormError('');

    try {
      const token = getToken();
      
      if (!token) {
        throw new Error('Please login to submit return request');
      }

      if (uploadedImages.length === 0) {
        throw new Error('Please upload at least one evidence image');
      }

      if (!returnForm.returnReason) {
        throw new Error('Please select a return reason');
      }

      // Create form data for file upload
      const formData = new FormData();
      formData.append('orderId', selectedOrder._id);
      formData.append('returnReason', returnForm.returnReason);
      formData.append('customerComments', returnForm.customerComments);
      
      // Add selected items
      const selectedItems = returnForm.items.filter(item => item.selected);
      formData.append('items', JSON.stringify(selectedItems));

      // Add evidence images
      uploadedImages.forEach((imageData, index) => {
        formData.append('evidenceImages', imageData.file);
      });

      const response = await fetch(`${API_URL}/api/returns`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to submit return request');
      }

      // Success
      alert('Return request submitted successfully! You will receive updates via SMS/Email.');
      setShowReturnModal(false);
      fetchMyReturns(); // Refresh returns list
      fetchEligibleOrders(); // Refresh eligible orders
      
    } catch (error) {
      console.error('Error submitting return request:', error);
      setFormError(error.message);
    } finally {
      setFormLoading(false);
    }
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

  // Calculate days remaining for return
  const getDaysRemaining = (deliveredAt) => {
    const deliveredDate = new Date(deliveredAt);
    const daysSinceDelivery = (new Date() - deliveredDate) / (1000 * 60 * 60 * 24);
    return Math.max(0, 7 - Math.floor(daysSinceDelivery));
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
    if (activeTab === 'eligible-orders') {
      fetchEligibleOrders();
    } else {
      fetchMyReturns();
    }
  }, [activeTab]);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center">
          <FaBoxOpen className="mr-3 text-blue-600" />
          Return & Refund Center
        </h1>
        <p className="mt-1 text-gray-600">
          Manage your return requests and check eligible orders
        </p>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-gray-200 p-1 rounded-lg mb-6 w-fit">
        <button
          onClick={() => setActiveTab('eligible-orders')}
          className={`px-4 py-2 rounded-md transition-colors ${
            activeTab === 'eligible-orders'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Eligible Orders
        </button>
        <button
          onClick={() => setActiveTab('my-returns')}
          className={`px-4 py-2 rounded-md transition-colors ${
            activeTab === 'my-returns'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          My Returns
        </button>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-800">{error}</p>
          <button 
            onClick={() => {
              setError('');
              if (activeTab === 'eligible-orders') {
                fetchEligibleOrders();
              } else {
                fetchMyReturns();
              }
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
          {activeTab === 'eligible-orders' ? (
            // Eligible Orders Tab
            <div>
              {eligibleOrders.length === 0 ? (
                <div className="text-center py-12">
                  <FaBoxOpen className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No Eligible Orders
                  </h3>
                  <p className="text-gray-600">
                    You don't have any delivered orders eligible for return right now.
                  </p>
                  <div className="mt-4 p-4 bg-blue-50 rounded-lg max-w-md mx-auto">
                    <FaInfoCircle className="inline mr-2 text-blue-600" />
                    <span className="text-sm text-blue-800">
                      Orders are eligible for return within 7 days of delivery.
                    </span>
                  </div>
                </div>
              ) : (
                <div className="grid gap-6">
                  {eligibleOrders.map((order) => (
                    <div key={order._id} className="bg-white rounded-lg shadow border p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            Order #{order.orderNumber || order._id.slice(-8)}
                          </h3>
                          <p className="text-sm text-gray-600">
                            Delivered: {new Date(order.delivery?.deliveredAt || order.updatedAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center text-orange-600 mb-1">
                            <FaClock className="mr-1" />
                            <span className="text-sm font-medium">
                              {getDaysRemaining(order.delivery?.deliveredAt || order.updatedAt)} days left
                            </span>
                          </div>
                          <p className="text-lg font-bold text-gray-900">
                            ₹{order.totalAmount}
                          </p>
                        </div>
                      </div>

                      {/* Order Items */}
                      <div className="mb-4">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Items:</h4>
                        <div className="space-y-2">
                          {order.items.map((item, index) => (
                            <div key={index} className="flex items-center space-x-3 p-2 bg-gray-50 rounded">
                              {item.image && (
                                <img 
                                  src={item.image} 
                                  alt={item.name}
                                  className="w-12 h-12 object-cover rounded"
                                />
                              )}
                              <div className="flex-1">
                                <p className="text-sm font-medium text-gray-900">{item.name}</p>
                                <p className="text-xs text-gray-600">
                                  Qty: {item.qty} × ₹{item.price}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Return Button */}
                      <button
                        onClick={() => openReturnModal(order)}
                        className="w-full bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center"
                      >
                        <FaBoxOpen className="mr-2" />
                        Request Return
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            // My Returns Tab
            <div>
              {myReturns.length === 0 ? (
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
                    <div key={returnRequest._id} className="bg-white rounded-lg shadow border p-6">
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
                            onClick={() => cancelReturnRequest(returnRequest._id)}
                            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                          >
                            Cancel Request
                          </button>
                        )}
                        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center">
                          <FaEye className="mr-2" />
                          View Details
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Return Request Modal */}
      {showReturnModal && selectedOrder && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-2xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Create Return Request - Order #{selectedOrder.orderNumber || selectedOrder._id.slice(-8)}
              </h3>
              
              {formError && (
                <div className="bg-red-50 border border-red-200 rounded p-3 mb-4">
                  <p className="text-red-800 text-sm">{formError}</p>
                </div>
              )}

              <form onSubmit={submitReturnRequest} className="space-y-4">
                {/* Items Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Items to Return
                  </label>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {returnForm.items.map((item, index) => {
                      const orderItem = selectedOrder.items[index];
                      return (
                        <div key={index} className="flex items-center space-x-3 p-3 border rounded-lg">
                          <input
                            type="checkbox"
                            checked={item.selected}
                            onChange={(e) => {
                              const newItems = [...returnForm.items];
                              newItems[index].selected = e.target.checked;
                              setReturnForm(prev => ({ ...prev, items: newItems }));
                            }}
                            className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                          />
                          {orderItem.image && (
                            <img 
                              src={orderItem.image} 
                              alt={orderItem.name}
                              className="w-12 h-12 object-cover rounded"
                            />
                          )}
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">{orderItem.name}</p>
                            <p className="text-xs text-gray-600">Qty: {orderItem.qty} × ₹{orderItem.price}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Return Reason */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Return Reason *
                  </label>
                  <select
                    required
                    value={returnForm.returnReason}
                    onChange={(e) => setReturnForm(prev => ({ ...prev, returnReason: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select a reason</option>
                    <option value="defective">Defective/Damaged product</option>
                    <option value="wrong_item">Wrong item received</option>
                    <option value="not_as_described">Not as described</option>
                    <option value="quality_issue">Quality issue</option>
                    <option value="damaged_in_transit">Damaged in transit</option>
                    <option value="changed_mind">Changed my mind</option>
                    <option value="size_issue">Size/fit issue</option>
                  </select>
                </div>

                {/* Comments */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Additional Comments
                  </label>
                  <textarea
                    value={returnForm.customerComments}
                    onChange={(e) => setReturnForm(prev => ({ ...prev, customerComments: e.target.value }))}
                    placeholder="Please provide additional details about the issue..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows="3"
                  />
                </div>

                {/* Evidence Images */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Evidence Images * (Required)
                  </label>
                  
                  {/* Upload Area */}
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={(e) => handleImageUpload(Array.from(e.target.files))}
                      className="hidden"
                      id="image-upload"
                      disabled={imageUploading}
                    />
                    <label
                      htmlFor="image-upload"
                      className="cursor-pointer flex flex-col items-center"
                    >
                      <FaUpload className="text-gray-400 text-2xl mb-2" />
                      <span className="text-sm text-gray-600">
                        Click to upload images or drag and drop
                      </span>
                      <span className="text-xs text-gray-500 mt-1">
                        PNG, JPG up to 5MB each
                      </span>
                    </label>
                  </div>

                  {/* Uploaded Images Preview */}
                  {uploadedImages.length > 0 && (
                    <div className="mt-4 grid grid-cols-3 gap-4">
                      {uploadedImages.map((image, index) => (
                        <div key={index} className="relative">
                          <img
                            src={image.preview}
                            alt={image.name}
                            className="w-full h-24 object-cover rounded-lg"
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 text-xs hover:bg-red-600"
                          >
                            <FaTrash />
                          </button>
                          <p className="text-xs text-gray-600 mt-1 truncate">{image.name}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {imageUploading && (
                    <div className="mt-2 flex items-center text-blue-600">
                      <FaSpinner className="animate-spin mr-2" />
                      <span className="text-sm">Uploading images...</span>
                    </div>
                  )}
                </div>

                {/* Form Actions */}
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowReturnModal(false);
                      setUploadedImages([]);
                      setFormError('');
                    }}
                    className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={formLoading || imageUploading || uploadedImages.length === 0}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 flex items-center"
                  >
                    {formLoading ? (
                      <>
                        <FaSpinner className="animate-spin mr-2" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <FaBoxOpen className="mr-2" />
                        Submit Return Request
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

export default CustomerReturnManagement;
