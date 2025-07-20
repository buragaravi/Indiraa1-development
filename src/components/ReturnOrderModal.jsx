import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiX, 
  FiRotateCcw, 
  FiUpload, 
  FiPackage, 
  FiAlertCircle,
  FiCheck,
  FiLoader,
  FiCalendar,
  FiShoppingBag,
  FiUser
} from 'react-icons/fi';

const ReturnOrderModal = ({ isOpen, onClose, orderId }) => {
  const [loading, setLoading] = useState(false);
  const [orderLoading, setOrderLoading] = useState(true);
  const [order, setOrder] = useState(null);
  const [eligibility, setEligibility] = useState(null);
  const [selectedItems, setSelectedItems] = useState([]);
  const [returnReason, setReturnReason] = useState('');
  const [customerComments, setCustomerComments] = useState('');
  const [evidenceImages, setEvidenceImages] = useState([]);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const returnReasons = [
    'Defective/Damaged product',
    'Wrong item received',
    'Size/fit issues',
    'Quality not as expected',
    'Not as described',
    'Changed mind',
    'Received duplicate order',
    'Other'
  ];

  // Fetch order details and check eligibility
  useEffect(() => {
    if (isOpen && orderId) {
      fetchOrderDetails();
      checkReturnEligibility();
    }
  }, [isOpen, orderId]);

  const fetchOrderDetails = async () => {
    setOrderLoading(true);
    setError(null);
    try {
      const response = await fetch(`http://localhost:5001/api/products/orders/user/${orderId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setOrder(data.order);
        // Initialize all items as selected by default
        if (data.order?.items) {
          setSelectedItems(data.order.items.map(item => ({
            productId: item.productId,
            variantId: item.variantId,
            quantity: item.quantity || item.qty || 1,
            name: item.name,
            variantName: item.variantName,
            price: item.price
          })));
        }
      } else {
        if (response.status === 401) {
          localStorage.removeItem('token');
          window.location.href = '/login';
        } else {
          setError('Failed to fetch order details');
        }
      }
    } catch (error) {
      setError('Error fetching order details');
    } finally {
      setOrderLoading(false);
    }
  };

  const checkReturnEligibility = async () => {
    try {
      const response = await fetch(`http://localhost:5001/api/returns/orders/${orderId}/eligibility`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Eligibility response:', data); // Debug log
        setEligibility(data.data);
      } else {
        console.error('Eligibility check failed:', response.status);
        // If eligibility check fails, assume it's eligible but show warning
        setEligibility({
          isEligible: true,
          daysRemaining: 7,
          reason: 'Unable to verify eligibility, proceeding with caution'
        });
      }
    } catch (error) {
      console.error('Error checking return eligibility:', error);
      // If eligibility check fails, assume it's eligible but show warning
      setEligibility({
        isEligible: true,
        daysRemaining: 7,
        reason: 'Unable to verify eligibility, proceeding with caution'
      });
    }
  };

  const handleItemSelection = (item, isSelected) => {
    if (isSelected) {
      setSelectedItems(prev => [...prev, item]);
    } else {
      setSelectedItems(prev => prev.filter(selected => 
        selected.productId !== item.productId || selected.variantId !== item.variantId
      ));
    }
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + evidenceImages.length > 5) {
      setError('Maximum 5 images allowed');
      return;
    }

    const validFiles = files.filter(file => {
      const isValid = file.type.startsWith('image/') && file.size <= 5 * 1024 * 1024; // 5MB
      if (!isValid) {
        setError('Only image files under 5MB are allowed');
      }
      return isValid;
    });

    setEvidenceImages(prev => [...prev, ...validFiles]);
  };

  const removeImage = (index) => {
    setEvidenceImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmitReturn = async () => {
    if (selectedItems.length === 0) {
      setError('Please select at least one item to return');
      return;
    }

    if (!returnReason) {
      setError('Please select a return reason');
      return;
    }

    if (evidenceImages.length === 0) {
      setError('Please upload at least one evidence image');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('orderId', orderId);
      formData.append('items', JSON.stringify(selectedItems));
      formData.append('returnReason', returnReason);
      formData.append('customerComments', customerComments);

      // Append images
      evidenceImages.forEach((file, index) => {
        formData.append('evidenceImages', file);
      });

      const response = await fetch('http://localhost:5001/api/returns/create', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
        setTimeout(() => {
          onClose();
          window.location.reload(); // Refresh to update orders
        }, 2000);
      } else {
        setError(data.message || 'Failed to create return request');
      }
    } catch (error) {
      setError('Error creating return request');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setSelectedItems([]);
    setReturnReason('');
    setCustomerComments('');
    setEvidenceImages([]);
    setError(null);
    setSuccess(false);
    setOrder(null);
    setEligibility(null);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={handleClose}
      >
        <motion.div
          className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-orange-500 to-red-500 p-6 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FiRotateCcw className="w-6 h-6" />
                <h2 className="text-2xl font-bold">Return Order</h2>
              </div>
              <button
                onClick={handleClose}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <FiX className="w-6 h-6" />
              </button>
            </div>
            {order && (
              <p className="mt-2 opacity-90">
                Order #{order._id?.slice(-8)} - ₹{(order.totalAmount || order.total || 0).toLocaleString()}
              </p>
            )}
          </div>

          {/* Content */}
          <div className="overflow-y-auto max-h-[calc(90vh-120px)]">
            {orderLoading ? (
              <div className="flex items-center justify-center py-12">
                <FiLoader className="w-8 h-8 animate-spin text-orange-500" />
                <span className="ml-3 text-gray-600">Loading order details...</span>
              </div>
            ) : success ? (
              <div className="p-8 text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"
                >
                  <FiCheck className="w-8 h-8 text-green-600" />
                </motion.div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">Return Request Submitted!</h3>
                <p className="text-gray-600 mb-4">
                  Your return request has been successfully submitted. You will receive updates via email and SMS.
                </p>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-green-800 text-sm">
                    <strong>Next Steps:</strong> Our team will review your request within 24-48 hours. 
                    You can track the status in your orders section.
                  </p>
                </div>
              </div>
            ) : (
              <div className="p-6 space-y-6">
                {/* Error Display */}
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3"
                  >
                    <FiAlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                    <p className="text-red-700">{error}</p>
                  </motion.div>
                )}

                {/* Eligibility Check */}
                {eligibility && !eligibility.isEligible && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <FiAlertCircle className="w-5 h-5 text-red-500" />
                      <h3 className="font-semibold text-red-800">Return Not Eligible</h3>
                    </div>
                    <p className="text-red-700">{eligibility.reason}</p>
                  </div>
                )}

                {/* Order Details */}
                {order && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                      <FiShoppingBag className="w-5 h-5" />
                      Order Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Order Date:</span>
                        <p className="font-medium">
                          {new Date(order.placedAt || order.createdAt).toLocaleDateString('en-IN')}
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-600">Status:</span>
                        <p className="font-medium text-green-600">{order.status}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Total Amount:</span>
                        <p className="font-medium">₹{(order.totalAmount || order.total || 0).toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Items Selection */}
                {order?.items && (
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                      <FiPackage className="w-5 h-5" />
                      Select Items to Return
                    </h3>
                    {!eligibility?.isEligible && (
                      <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <p className="text-yellow-800 text-sm">
                          <strong>Note:</strong> This order may not meet standard return eligibility criteria. 
                          Proceeding will submit a special case request that requires manual review.
                        </p>
                      </div>
                    )}
                    <div className="space-y-3">
                      {order.items.map((item, index) => {
                        const isSelected = selectedItems.some(selected => 
                          selected.productId === item.productId && selected.variantId === item.variantId
                        );
                        return (
                          <div
                            key={index}
                            className={`border rounded-lg p-4 cursor-pointer transition-all ${
                              isSelected ? 'border-orange-500 bg-orange-50' : 'border-gray-200 hover:border-gray-300'
                            }`}
                            onClick={() => handleItemSelection({
                              productId: item.productId,
                              variantId: item.variantId,
                              quantity: item.quantity || item.qty || 1,
                              name: item.name,
                              variantName: item.variantName,
                              price: item.price
                            }, !isSelected)}
                          >
                            <div className="flex items-center gap-3">
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => {}}
                                className="w-4 h-4 text-orange-500 border-gray-300 rounded focus:ring-orange-500"
                              />
                              <div className="flex-1">
                                <h4 className="font-medium text-gray-800">{item.name}</h4>
                                {item.variantName && (
                                  <p className="text-sm text-gray-600">Variant: {item.variantName}</p>
                                )}
                                <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                                  <span>Qty: {item.quantity || item.qty || 1}</span>
                                  <span>Price: ₹{(item.price || 0).toLocaleString()}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Return Reason */}
                {order && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Return Reason *
                    </label>
                    <select
                      value={returnReason}
                      onChange={(e) => setReturnReason(e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    >
                      <option value="">Select a reason</option>
                      {returnReasons.map((reason) => (
                        <option key={reason} value={reason}>{reason}</option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Customer Comments */}
                {order && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Additional Comments (Optional)
                    </label>
                    <textarea
                      value={customerComments}
                      onChange={(e) => setCustomerComments(e.target.value)}
                      placeholder="Please provide any additional details about the return..."
                      rows={3}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
                    />
                  </div>
                )}

                {/* Evidence Images */}
                {order && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Evidence Images *
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                      <FiUpload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600 mb-2">Click to upload images (Max 5 files, 5MB each)</p>
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        id="evidence-upload"
                      />
                      <label
                        htmlFor="evidence-upload"
                        className="inline-block px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors cursor-pointer"
                      >
                        Choose Images
                      </label>
                    </div>

                    {/* Image Preview */}
                    {evidenceImages.length > 0 && (
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-4">
                        {evidenceImages.map((file, index) => (
                          <div key={index} className="relative group">
                            <img
                              src={URL.createObjectURL(file)}
                              alt={`Evidence ${index + 1}`}
                              className="w-full h-24 object-cover rounded-lg border"
                            />
                            <button
                              onClick={() => removeImage(index)}
                              className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                            >
                              <FiX className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          {!orderLoading && !success && order && (
            <div className="bg-gray-50 px-6 py-4 flex items-center justify-between">
              <button
                onClick={handleClose}
                className="px-6 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Cancel
              </button>
              {eligibility?.isEligible ? (
                <button
                  onClick={handleSubmitReturn}
                  disabled={loading || selectedItems.length === 0}
                  className="px-6 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg hover:from-orange-600 hover:to-red-600 transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {loading ? (
                    <>
                      <FiLoader className="w-4 h-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <FiRotateCcw className="w-4 h-4" />
                      Submit Return Request
                    </>
                  )}
                </button>
              ) : (
                <div className="text-right">
                  <p className="text-sm text-red-600 mb-2">
                    {eligibility?.reason || 'Return not available for this order'}
                  </p>
                  <button
                    onClick={handleSubmitReturn}
                    disabled={loading || selectedItems.length === 0}
                    className="px-6 py-2 bg-gradient-to-r from-gray-400 to-gray-500 text-white rounded-lg hover:from-gray-500 hover:to-gray-600 transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {loading ? (
                      <>
                        <FiLoader className="w-4 h-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <FiRotateCcw className="w-4 h-4" />
                        Submit Anyway (Special Case)
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ReturnOrderModal;
