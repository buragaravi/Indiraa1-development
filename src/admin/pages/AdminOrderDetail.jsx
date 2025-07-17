import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useThemeContext } from '../../context/ThemeProvider';
import { classNames } from '../utils/classNames';
import { useAuth } from '../utils/useAuth';
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
} from '../components/AdminIcons';
import toast from 'react-hot-toast';

const AdminOrderDetail = () => {
  const { primary, mode } = useThemeContext();
  const { isAdmin } = useAuth();
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);  const [updating, setUpdating] = useState(false);
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
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5001/api/products/orders/${orderId}`, {
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
        navigate('/admin/orders');
      }
    } catch (error) {
      console.error('Error fetching order:', error);
      toast.error('Error loading order details');
      navigate('/admin/orders');
    } finally {
      setLoading(false);
    }
  };  const handleStatusUpdate = async () => {
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
      const token = localStorage.getItem('token');
      const requestBody = { status: newStatus };
      
      // Include OTP if required
      if (requiresOtp) {
        requestBody.deliveryOtp = deliveryOtp;
      }
      
      const response = await fetch(`http://localhost:5001/api/products/orders/${orderId}/status`, {
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
      console.error('Error updating order status:', error);      toast.error('Error updating order status');
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
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5001/api/products/orders/${orderId}/mark-paid`, {
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

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100">
        <div className="text-center p-8 rounded-3xl shadow-soft bg-white/70 backdrop-blur-sm">
          <EmptyIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-4 text-gray-800">Access Denied</h1>
          <p className="text-gray-600">You need admin privileges to access this page.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100">
        <div className="text-center p-8 rounded-3xl shadow-soft bg-white/70 backdrop-blur-sm">
          <LoadingIcon className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <p className="text-gray-600 text-lg">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100">
        <div className="text-center p-8 rounded-3xl shadow-soft bg-white/70 backdrop-blur-sm">
          <EmptyIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-4 text-gray-800">Order Not Found</h1>
          <p className="text-gray-600">The order you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }
  return (
    <>
      <div className="max-w-6xl mx-auto w-full">        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8 space-y-4 lg:space-y-0">
          <div className="flex items-center">
            <button
              onClick={() => navigate('/admin/orders')}
              className="neumorphic-button-small w-10 h-10 lg:w-12 lg:h-12 rounded-2xl bg-white/60 backdrop-blur-sm border border-white/20 flex items-center justify-center mr-3 lg:mr-4 hover:shadow-soft transition-all duration-300 flex-shrink-0"
            >
              <BackIcon className="w-5 h-5 lg:w-6 lg:h-6 text-gray-600" />
            </button>
            <div className="min-w-0">
              <h1 className="text-2xl lg:text-4xl font-bold mb-1 lg:mb-2 text-gray-800 bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                Order Details
              </h1>
              <p className="text-gray-600 text-sm lg:text-lg truncate">
                Order ID: <span className="font-mono text-gray-800">{order._id}</span>
              </p>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 lg:gap-4">
            <button
              onClick={() => setShowStatusModal(true)}
              disabled={updating}
              className="neumorphic-button px-4 lg:px-6 py-2 lg:py-3 rounded-2xl bg-gradient-to-r from-blue-500 to-cyan-600 text-white font-semibold hover:shadow-soft-lg transition-all duration-300 disabled:opacity-50 flex items-center justify-center text-sm lg:text-base"
            >
              <UpdateIcon className="w-4 h-4 lg:w-5 lg:h-5 mr-2" />
              Update Status
            </button>
            {order.paymentStatus !== 'Paid' && (
              <button
                onClick={handleMarkAsPaid}
                disabled={updating}
                className="neumorphic-button px-4 lg:px-6 py-2 lg:py-3 rounded-2xl bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold hover:shadow-soft-lg transition-all duration-300 disabled:opacity-50 flex items-center justify-center text-sm lg:text-base"
              >
                <MoneyIcon className="w-4 h-4 lg:w-5 lg:h-5 mr-2" />
                Mark as Paid
              </button>
            )}
          </div>
        </div>          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 lg:gap-8">
            {/* Order Information */}
            <div className="xl:col-span-2 space-y-6">
              {/* Order Status */}
              <div className="neumorphic-card p-4 lg:p-6 rounded-3xl bg-white/60 backdrop-blur-sm border border-white/20">
                <h2 className="text-xl lg:text-2xl font-bold mb-4 lg:mb-6 text-gray-800 flex items-center">
                  <span className="w-2 h-6 lg:h-8 bg-gradient-to-b from-green-400 to-emerald-500 rounded-full mr-2 lg:mr-3"></span>
                  Order Status
                </h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
                  <div>
                    <label className="block text-sm font-semibold mb-2 text-gray-600">Order Status</label>
                    <span className={classNames('px-3 lg:px-4 py-2 lg:py-3 rounded-2xl text-sm font-medium border flex items-center', getStatusColor(order.status))}>
                      {getStatusIcon(order.status)}
                      <span className="ml-2">{order.status}</span>
                    </span>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2 text-gray-600">Payment Status</label>
                    <span className={classNames('px-3 lg:px-4 py-2 lg:py-3 rounded-2xl text-sm font-medium border flex items-center', 
                      order.paymentStatus === 'Paid' ? 'bg-green-100 text-green-700 border-green-200' : 'bg-yellow-100 text-yellow-700 border-yellow-200')}>
                      {order.paymentStatus === 'Paid' && <PaidIcon className="w-4 h-4 lg:w-5 lg:h-5 mr-2" />}
                      {order.paymentStatus || 'Pending'}
                    </span>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2 text-gray-600">Order Date</label>
                    <p className="text-gray-800 font-medium">{formatDate(order.placedAt || order.createdAt)}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2 text-gray-600">Payment Method</label>
                    <p className="text-gray-800 font-medium">{order.paymentMethod || 'Cash on Delivery'}</p>
                  </div>
                </div>
              </div>

              {/* Delivery Slot Information */}
              <div className="neumorphic-card p-4 lg:p-6 rounded-3xl bg-white/60 backdrop-blur-sm border border-white/20">
                <h2 className="text-xl lg:text-2xl font-bold mb-4 lg:mb-6 text-gray-800 flex items-center">
                  <span className="w-2 h-6 lg:h-8 bg-gradient-to-b from-blue-400 to-indigo-500 rounded-full mr-2 lg:mr-3"></span>
                  Delivery Information
                </h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
                  <div>
                    <label className="block text-sm font-semibold mb-2 text-gray-600">📅 Preferred Delivery Date</label>
                    {order.deliverySlot?.date ? (
                      <p className="text-gray-800 font-medium text-sm lg:text-base">
                        {new Date(order.deliverySlot.date).toLocaleDateString('en-IN', { 
                          weekday: 'long', 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                      </p>
                    ) : (
                      <p className="text-gray-500 italic text-sm lg:text-base">No preference selected</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2 text-gray-600">🕐 Preferred Time Slot</label>
                    {order.deliverySlot?.timeSlot ? (
                      <span className="px-3 lg:px-4 py-2 lg:py-3 rounded-2xl text-sm font-medium border bg-blue-100 text-blue-700 border-blue-200 inline-block">
                        {order.deliverySlot.timeSlot}
                      </span>
                    ) : (
                      <p className="text-gray-500 italic text-sm lg:text-base">No preference selected</p>
                    )}
                  </div>
                  {order.deliverySlot?.lastModified && (
                    <div className="lg:col-span-2">
                      <label className="block text-sm font-semibold mb-2 text-gray-600">Last Updated</label>
                      <p className="text-gray-600 text-xs lg:text-sm">
                        {new Date(order.deliverySlot.lastModified).toLocaleString('en-IN')}
                      </p>
                    </div>
                  )}
                  {(order.deliverySlot?.date || order.deliverySlot?.timeSlot) && (
                    <div className="lg:col-span-2">
                      <div className="flex items-center text-xs lg:text-sm text-gray-600 bg-blue-50 p-3 rounded-xl border border-blue-200">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                        <span>Customer has selected delivery preferences. Plan accordingly for optimal delivery experience.</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Order Items */}
              <div className="neumorphic-card p-4 lg:p-6 rounded-3xl bg-white/60 backdrop-blur-sm border border-white/20">
                <h2 className="text-xl lg:text-2xl font-bold mb-4 lg:mb-6 text-gray-800 flex items-center">
                  <span className="w-2 h-6 lg:h-8 bg-gradient-to-b from-green-400 to-emerald-500 rounded-full mr-2 lg:mr-3"></span>
                  Order Items
                </h2>
                <div className="space-y-4">
                  {order.items?.map((item, index) => {
                    const productName = item.product?.name || item.name || 'Product';
                    const productImage = item.product?.images?.[0] || item.image || '/placeholder.png';
                    return (
                      <div key={index} className="flex items-center p-3 lg:p-4 rounded-2xl bg-white/40 backdrop-blur-sm border border-white/20">
                        {productImage && (
                          <img
                            src={productImage}
                            alt={productName}
                            className="w-12 h-12 lg:w-16 lg:h-16 object-cover rounded-xl mr-3 lg:mr-4 shadow-soft flex-shrink-0"
                          />
                        )}                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-800 text-sm lg:text-base truncate">{productName}</h3>
                          {item.variantName && (
                            <p className="text-xs lg:text-sm text-emerald-600 font-medium">Variant: {item.variantName}</p>
                          )}
                          <p className="text-xs lg:text-sm text-gray-600">Quantity: {item.qty}</p>
                          <p className="text-xs lg:text-sm text-gray-600">Price: ₹{item.variantPrice || item.price}</p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="font-semibold text-green-600 text-sm lg:text-base">₹{(item.variantPrice || item.price) * item.qty}</p>
                        </div>
                      </div>
                    );
                  })}                </div>
              </div>
            </div>            {/* Order Summary */}
            <div className="space-y-6">
              {/* Shipping Information */}
              <div className="neumorphic-card p-4 lg:p-6 rounded-3xl bg-white/60 backdrop-blur-sm border border-white/20">
                <h2 className="text-xl lg:text-2xl font-bold mb-4 lg:mb-6 text-gray-800 flex items-center">
                  <span className="w-2 h-6 lg:h-8 bg-gradient-to-b from-green-400 to-emerald-500 rounded-full mr-2 lg:mr-3"></span>
                  Shipping Information
                </h2>
                <div className="space-y-4 lg:space-y-6">
                  <div>
                    <label className="block text-sm font-semibold mb-2 text-gray-600">Customer Name</label>
                    <p className="text-gray-800 font-medium">{order.shipping?.name || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2 text-gray-600">Phone Number</label>
                    <p className="text-gray-800 font-medium">{order.shipping?.phone || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2 text-gray-600">Shipping Address</label>
                    <p className="text-gray-800 font-medium break-words">{order.shipping?.address || 'N/A'}</p>
                  </div>
                </div>
              </div>

              <div className="neumorphic-card p-4 lg:p-6 rounded-3xl bg-white/60 backdrop-blur-sm border border-white/20">
                <h2 className="text-xl lg:text-2xl font-bold mb-4 lg:mb-6 text-gray-800 flex items-center">
                  <span className="w-2 h-6 lg:h-8 bg-gradient-to-b from-green-400 to-emerald-500 rounded-full mr-2 lg:mr-3"></span>
                  Order Summary
                </h2>
                <div className="space-y-3 lg:space-y-4">
                  <div className="flex justify-between text-sm lg:text-base">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-semibold">₹{order.totalAmount}</span>
                  </div>
                  <div className="flex justify-between text-sm lg:text-base">
                    <span className="text-gray-600">Shipping</span>
                    <span className="font-semibold">₹0</span>
                  </div>
                  <div className="flex justify-between text-sm lg:text-base">
                    <span className="text-gray-600">Tax</span>
                    <span className="font-semibold">₹0</span>
                  </div>
                  <hr className="border-gray-200" />
                  <div className="flex justify-between text-base lg:text-lg font-bold text-green-600">                    <span>Total</span>
                    <span>₹{order.totalAmount}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>      {/* Status Update Modal */}
      {showStatusModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="neumorphic-card p-4 lg:p-8 rounded-3xl bg-white/90 backdrop-blur-sm border border-white/20 max-w-md w-full">
            <div className="flex justify-between items-center mb-4 lg:mb-6">
              <h3 className="text-xl lg:text-2xl font-bold text-gray-800">Update Order Status</h3>              <button
                onClick={handleCloseModal}
                className="neumorphic-button-small w-8 h-8 rounded-full bg-gray-500 text-white flex items-center justify-center hover:shadow-soft transition-all duration-300 flex-shrink-0"
              >
                <CloseIcon className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-700">New Status</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="neumorphic-input w-full p-3 lg:p-4 rounded-2xl bg-white/60 backdrop-blur-sm border border-white/20 focus:outline-none focus:ring-2 focus:ring-green-500/50"
                >
                  <option value="">Select Status</option>
                  <option value="Pending">Pending</option>
                  <option value="Shipped">Shipped</option>
                  <option value="Delivered">Delivered</option>
                  <option value="Cancelled">Cancelled</option>                </select>
              </div>
              
              {/* OTP Input - Show only when updating to "Delivered" from "Shipped" */}
              {order?.status?.toLowerCase() === 'shipped' && newStatus.toLowerCase() === 'delivered' && (
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700">
                    Delivery Verification Code
                  </label>
                  <input
                    type="text"
                    maxLength="6"
                    pattern="[0-9]{6}"
                    value={deliveryOtp}
                    onChange={(e) => {
                      setDeliveryOtp(e.target.value.replace(/\D/g, ''));
                      setOtpError('');
                    }}
                    className={`neumorphic-input w-full p-3 lg:p-4 rounded-2xl bg-white/60 backdrop-blur-sm border ${
                      otpError ? 'border-red-300' : 'border-white/20'
                    } focus:outline-none focus:ring-2 focus:ring-green-500/50 font-mono text-lg tracking-wider text-center`}
                    placeholder="Enter 6-digit OTP"
                  />
                  {otpError && (
                    <p className="text-red-500 text-sm mt-2">{otpError}</p>
                  )}
                  <p className="text-gray-600 text-sm mt-2">
                    Enter the delivery verification code provided by the customer to confirm delivery.
                  </p>
                </div>
              )}
              
              <div className="flex flex-col sm:flex-row gap-3 lg:gap-4">
                <button
                  onClick={handleStatusUpdate}
                  disabled={!newStatus || updating}
                  className="flex-1 neumorphic-button px-4 lg:px-6 py-2 lg:py-3 rounded-2xl bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold hover:shadow-soft-lg transition-all duration-300 disabled:opacity-50 flex items-center justify-center text-sm lg:text-base"
                >
                  {updating ? (
                    <>
                      <LoadingIcon className="w-4 h-4 lg:w-5 lg:h-5 mr-2" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <UpdateIcon className="w-4 h-4 lg:w-5 lg:h-5 mr-2" />
                      Update Status
                    </>
                  )}
                </button>                <button
                  onClick={handleCloseModal}
                  disabled={updating}
                  className="flex-1 neumorphic-button px-4 lg:px-6 py-2 lg:py-3 rounded-2xl bg-gray-500 text-white font-semibold hover:shadow-soft-lg transition-all duration-300 disabled:opacity-50 text-sm lg:text-base"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .neumorphic-card {
          box-shadow: 
            20px 20px 60px rgba(0, 0, 0, 0.05),
            -20px -20px 60px rgba(255, 255, 255, 0.8);
        }
        .neumorphic-button {
          box-shadow: 
            8px 8px 16px rgba(0, 0, 0, 0.2),
            -8px -8px 16px rgba(255, 255, 255, 0.1);
        }
        .neumorphic-button-small {
          box-shadow: 
            4px 4px 8px rgba(0, 0, 0, 0.2),
            -4px -4px 8px rgba(255, 255, 255, 0.1);
        }
        .neumorphic-input {
          box-shadow: 
            inset 4px 4px 8px rgba(0, 0, 0, 0.05),
            inset -4px -4px 8px rgba(255, 255, 255, 0.8);
        }
        .shadow-soft {
          box-shadow: 
            8px 8px 16px rgba(0, 0, 0, 0.1),
            -8px -8px 16px rgba(255, 255, 255, 0.8);
        }
        .shadow-soft-lg {
          box-shadow: 
            12px 12px 24px rgba(0, 0, 0, 0.1),
            -12px -12px 24px rgba(255, 255, 255, 0.8);
        }      `}</style>
    </>
  );
};

export default AdminOrderDetail; 