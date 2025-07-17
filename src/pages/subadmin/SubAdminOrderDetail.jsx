import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useThemeContext } from '../../context/ThemeProvider';
import { classNames } from '../../admin/utils/classNames';
import { useWarehousePermissions } from '../../hooks/useWarehousePermissions';
import { 
  LoadingIcon, 
  EmptyIcon, 
  BackIcon,
  PendingIcon,
  ShippedIcon,
  DeliveredIcon,
  CancelledIcon,
  PaidIcon,
  UpdateIcon,
  MoneyIcon,
  PackageIcon,
  PeopleIcon,
  CloseIcon,
  OrdersIcon
} from '../../admin/components/AdminIcons';
import toast from 'react-hot-toast';

const SubAdminOrderDetail = () => {
  const { primary, mode } = useThemeContext();
  const { hasAccess, isReadOnly } = useWarehousePermissions();
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [deliveryOtp, setDeliveryOtp] = useState('');
  const [otpError, setOtpError] = useState('');

  useEffect(() => {
    fetchOrder();
  }, [orderId]);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      // Check for both admin and sub-admin tokens
      const adminToken = localStorage.getItem('token');
      const subAdminToken = localStorage.getItem('subAdminToken') || sessionStorage.getItem('subAdminToken');
      const token = adminToken || subAdminToken;
      
      console.log('SubAdminOrderDetail - Admin Token:', adminToken ? 'exists' : 'null');
      console.log('SubAdminOrderDetail - SubAdmin Token:', subAdminToken ? 'exists' : 'null');
      console.log('SubAdminOrderDetail - Using token:', token ? 'exists' : 'null');
      
      if (!token) {
        console.error('No token found for authentication');
        toast.error('Authentication token not found');
        navigate('/dashboard/orders');
        return;
      }
      
      const response = await fetch(`https://indiraa1-backend.onrender.com/api/products/orders/${orderId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setOrder(data.order);
      } else {
        toast.error('Failed to fetch order details');
        navigate('/dashboard/orders');
      }
    } catch (error) {
      console.error('Error fetching order:', error);
      toast.error('Error loading order details');
      navigate('/dashboard/orders');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async () => {
    if (!newStatus) return;
    
    // Clear previous OTP error
    setOtpError('');
    
    // Check if OTP is required for this status update
    const requiresOtp = order.status?.toLowerCase() === 'shipped' && newStatus.toLowerCase() === 'delivered';
    
    if (requiresOtp && !deliveryOtp) {
      setOtpError('Delivery verification code is required to mark order as delivered');
      return;
    }
    
    if (requiresOtp && !/^\d{6}$/.test(deliveryOtp)) {
      setOtpError('Please enter a valid 6-digit verification code');
      return;
    }
    
    setUpdating(true);
    try {
      // Check for both admin and sub-admin tokens
      const adminToken = localStorage.getItem('token');
      const subAdminToken = localStorage.getItem('subAdminToken') || sessionStorage.getItem('subAdminToken');
      const token = adminToken || subAdminToken;
      
      if (!token) {
        toast.error('Authentication token not found');
        return;
      }
      
      const requestBody = { status: newStatus };
      
      // Include OTP if required
      if (requiresOtp) {
        requestBody.deliveryOtp = deliveryOtp;
      }
      
      const response = await fetch(`https://indiraa1-backend.onrender.com/api/products/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });
      
      const responseData = await response.json();
      
      if (response.ok) {
        await fetchOrder();
        setShowStatusModal(false);
        setNewStatus('');
        setDeliveryOtp('');
        setOtpError('');
        toast.success(responseData.message || 'Order status updated successfully');
      } else {
        // Handle specific OTP-related errors
        if (responseData.requiresOtp) {
          setOtpError(responseData.message);
        } else {
          toast.error(responseData.message || 'Failed to update order status');
        }
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error('Error updating order status');
    } finally {
      setUpdating(false);
    }
  };

  const handleCloseModal = () => {
    setShowStatusModal(false);
    setNewStatus('');
    setDeliveryOtp('');
    setOtpError('');
  };

  const handleMarkAsPaid = async () => {
    setUpdating(true);
    try {
      // Check for both admin and sub-admin tokens
      const adminToken = localStorage.getItem('token');
      const subAdminToken = localStorage.getItem('subAdminToken') || sessionStorage.getItem('subAdminToken');
      const token = adminToken || subAdminToken;
      
      if (!token) {
        toast.error('Authentication token not found');
        return;
      }
      
      const response = await fetch(`https://indiraa1-backend.onrender.com/api/products/orders/${orderId}/mark-paid`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        await fetchOrder();
        toast.success('Order marked as paid successfully');
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || 'Failed to mark order as paid');
      }
    } catch (error) {
      console.error('Error marking as paid:', error);
      toast.error('Error marking order as paid');
    } finally {
      setUpdating(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Pending': return <PendingIcon className="w-5 h-5" />;
      case 'Shipped': return <ShippedIcon className="w-5 h-5" />;
      case 'Delivered': return <DeliveredIcon className="w-5 h-5" />;
      case 'Cancelled': return <CancelledIcon className="w-5 h-5" />;
      default: return null;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'Shipped': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'Delivered': return 'bg-green-100 text-green-700 border-green-200';
      case 'Cancelled': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!hasAccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100">
        <div className="text-center p-8 rounded-3xl shadow-soft bg-white/70 backdrop-blur-sm">
          <EmptyIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-4 text-gray-800">Access Denied</h1>
          <p className="text-gray-600">You need warehouse manager or logistics manager privileges to access this page.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center">
        <div className="text-center p-8 rounded-3xl shadow-soft bg-white/70 backdrop-blur-sm">
          <LoadingIcon className="w-12 h-12 text-emerald-600 mx-auto mb-4" />
          <p className="text-gray-600 text-lg">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center">
        <div className="text-center p-8 rounded-3xl shadow-soft bg-white/70 backdrop-blur-sm">
          <EmptyIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-4 text-gray-800">Order Not Found</h1>
          <p className="text-gray-600 mb-6">The order you're looking for could not be found.</p>
          <button
            onClick={() => navigate('/dashboard/orders')}
            className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-xl transition-colors duration-200"
          >
            Back to Orders
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={() => navigate('/dashboard/orders')}
              className={classNames(
                "p-3 rounded-xl transition-colors duration-200",
                mode === 'dark' 
                  ? "bg-gray-800 hover:bg-gray-700 text-white" 
                  : "bg-white hover:bg-gray-50 text-gray-700 shadow-soft"
              )}
            >
              <BackIcon className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Order Details</h1>
              <p className="text-gray-600">Order ID: {order._id}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Order Information */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Status and Actions */}
            <div className={classNames(
              "p-6 rounded-2xl shadow-soft",
              mode === 'dark' ? "bg-gray-800" : "bg-white"
            )}>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Order Status</h2>
                <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${getStatusColor(order.status)}`}>
                  {getStatusIcon(order.status)}
                  <span className="font-medium">{order.status}</span>
                </div>
              </div>

              {/* Action Buttons */}
              {!isReadOnly && (
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => setShowStatusModal(true)}
                    disabled={updating}
                    className={classNames(
                      "flex items-center gap-2 px-4 py-2 rounded-lg transition-colors duration-200",
                      updating
                        ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                        : "bg-emerald-500 hover:bg-emerald-600 text-white"
                    )}
                  >
                    <UpdateIcon className="w-4 h-4" />
                    Update Status
                  </button>

                  {order.paymentStatus !== 'paid' && (
                    <button
                      onClick={handleMarkAsPaid}
                      disabled={updating}
                      className={classNames(
                        "flex items-center gap-2 px-4 py-2 rounded-lg transition-colors duration-200",
                        updating
                          ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                          : "bg-blue-500 hover:bg-blue-600 text-white"
                      )}
                    >
                      <PaidIcon className="w-4 h-4" />
                      Mark as Paid
                    </button>
                  )}
                </div>
              )}

              {isReadOnly && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-yellow-800 text-sm">
                    <strong>Read-Only Access:</strong> You can view order details but cannot modify them.
                  </p>
                </div>
              )}
            </div>

            {/* Customer Information */}
            <div className={classNames(
              "p-6 rounded-2xl shadow-soft",
              mode === 'dark' ? "bg-gray-800" : "bg-white"
            )}>
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <PeopleIcon className="w-5 h-5" />
                Customer Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Name</p>
                  <p className="font-medium text-gray-900">{order.shippingAddress?.fullName || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Phone</p>
                  <p className="font-medium text-gray-900">{order.shippingAddress?.phone || 'N/A'}</p>
                </div>
                <div className="md:col-span-2">
                  <p className="text-sm text-gray-500">Address</p>
                  <p className="font-medium text-gray-900">
                    {order.shippingAddress ? 
                      `${order.shippingAddress.street}, ${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.zipCode}` 
                      : 'N/A'
                    }
                  </p>
                </div>
              </div>
            </div>

            {/* Order Items */}
            <div className={classNames(
              "p-6 rounded-2xl shadow-soft",
              mode === 'dark' ? "bg-gray-800" : "bg-white"
            )}>
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <PackageIcon className="w-5 h-5" />
                Order Items
              </h2>
              <div className="space-y-4">
                {order.items?.map((item, index) => (
                  <div key={index} className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg">
                    {item.product?.images?.[0] && (
                      <img
                        src={item.product.images[0]}
                        alt={item.product.name}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                    )}
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{item.product?.name || 'Unknown Product'}</h3>
                      <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
                      <p className="text-sm text-gray-500">Price: ₹{item.price}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">₹{(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="space-y-6">
            {/* Payment Summary */}
            <div className={classNames(
              "p-6 rounded-2xl shadow-soft",
              mode === 'dark' ? "bg-gray-800" : "bg-white"
            )}>
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <MoneyIcon className="w-5 h-5" />
                Payment Summary
              </h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">₹{order.totalAmount?.toFixed(2) || '0.00'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-medium">₹{order.shippingCost?.toFixed(2) || '0.00'}</span>
                </div>
                {order.discountAmount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount</span>
                    <span className="font-medium">-₹{order.discountAmount?.toFixed(2)}</span>
                  </div>
                )}
                <div className="border-t pt-3">
                  <div className="flex justify-between text-lg font-semibold">
                    <span>Total</span>
                    <span>₹{order.finalAmount?.toFixed(2) || order.totalAmount?.toFixed(2) || '0.00'}</span>
                  </div>
                </div>
                <div className="mt-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Payment Status</span>
                    <span className={classNames(
                      "px-2 py-1 rounded text-sm font-medium",
                      order.paymentStatus === 'paid' 
                        ? "bg-green-100 text-green-700"
                        : "bg-yellow-100 text-yellow-700"
                    )}>
                      {order.paymentStatus || 'Pending'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Order Timeline */}
            <div className={classNames(
              "p-6 rounded-2xl shadow-soft",
              mode === 'dark' ? "bg-gray-800" : "bg-white"
            )}>
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <OrdersIcon className="w-5 h-5" />
                Order Timeline
              </h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Order Date</span>
                  <span className="font-medium">{formatDate(order.createdAt)}</span>
                </div>
                {order.updatedAt !== order.createdAt && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Last Updated</span>
                    <span className="font-medium">{formatDate(order.updatedAt)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Status Update Modal */}
      {showStatusModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className={classNames(
            "w-full max-w-md p-6 rounded-2xl shadow-soft",
            mode === 'dark' ? "bg-gray-800" : "bg-white"
          )}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Update Order Status</h3>
              <button
                onClick={handleCloseModal}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
              >
                <CloseIcon className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Current Status: <span className="text-emerald-600">{order.status}</span>
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                >
                  <option value="">Select new status</option>
                  <option value="Pending">Pending</option>
                  <option value="Shipped">Shipped</option>
                  <option value="Delivered">Delivered</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>

              {/* Delivery OTP field - shown when updating from Shipped to Delivered */}
              {order.status?.toLowerCase() === 'shipped' && newStatus.toLowerCase() === 'delivered' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Delivery Verification Code *
                  </label>
                  <input
                    type="text"
                    placeholder="Enter 6-digit verification code"
                    value={deliveryOtp}
                    onChange={(e) => setDeliveryOtp(e.target.value)}
                    className={classNames(
                      "w-full p-3 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500",
                      otpError ? "border-red-300" : "border-gray-300"
                    )}
                    maxLength={6}
                  />
                  {otpError && (
                    <p className="mt-1 text-sm text-red-600">{otpError}</p>
                  )}
                  <p className="mt-1 text-xs text-gray-500">
                    This code should be provided by the customer upon delivery
                  </p>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={handleCloseModal}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleStatusUpdate}
                  disabled={!newStatus || updating}
                  className={classNames(
                    "flex-1 px-4 py-2 rounded-lg transition-colors duration-200",
                    !newStatus || updating
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : "bg-emerald-500 hover:bg-emerald-600 text-white"
                  )}
                >
                  {updating ? 'Updating...' : 'Update Status'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubAdminOrderDetail;
