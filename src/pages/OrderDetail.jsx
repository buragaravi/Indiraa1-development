import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import ReturnOrderModal from '../components/ReturnOrderModal';
import { 
  FiArrowLeft,
  FiShoppingBag, 
  FiPackage, 
  FiTruck, 
  FiClock, 
  FiCheck, 
  FiX, 
  FiMapPin,
  FiPhone,
  FiUser,
  FiCalendar,
  FiDollarSign,
  FiCreditCard,
  FiRefreshCw,
  FiDownload,
  FiStar,
  FiRotateCcw,
  FiEye,
  FiAlertTriangle
} from 'react-icons/fi';
import DeliverySlotSelector from '../components/DeliverySlotSelector';
import DeliveryRatingModal from '../components/DeliveryRatingModal';

const OrderDetail = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDeliverySlotModalOpen, setIsDeliverySlotModalOpen] = useState(false);
  const [deliverySlotLoading, setDeliverySlotLoading] = useState(false);
  const [returnModalOpen, setReturnModalOpen] = useState(false);
  const [orderReturns, setOrderReturns] = useState([]);
  const [returnLoading, setReturnLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    fetchOrderDetail();
    fetchOrderReturns();
  }, [orderId, navigate]);
  const fetchOrderDetail = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`https://indiraa1-backend.onrender.com/api/products/orders/user/${orderId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setOrder(data.order);
        console.log("Order data:", data.order);
      } else {
        if (response.status === 401) {
          localStorage.removeItem('token');
          navigate('/login');
        } else if (response.status === 404) {
          setError('Order not found');
        } else {
          setError('Failed to fetch order details');
        }
      }
    } catch (error) {
      setError('Error fetching order details');
    } finally {
      setLoading(false);
    }
  };

  const fetchOrderReturns = async () => {
    setReturnLoading(true);
    try {
      const response = await fetch(`https://indiraa1-backend.onrender.com/api/returns/my-returns`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        // Filter returns for this specific order
        const orderSpecificReturns = data.data?.returns?.filter(
          returnItem => returnItem.orderId._id === orderId
        ) || [];
        setOrderReturns(orderSpecificReturns);
      }
    } catch (error) {
      console.error('Error fetching order returns:', error);
    } finally {
      setReturnLoading(false);
    }
  };

  const handleDeliverySlotUpdate = async (selectedDate, selectedTimeSlot) => {
    setDeliverySlotLoading(true);
    
    console.log('Sending delivery slot update:', { date: selectedDate, timeSlot: selectedTimeSlot });
    
    try {
      const response = await fetch(`https://indiraa1-backend.onrender.com/api/orders/${orderId}/delivery-slot`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          date: selectedDate,
          timeSlot: selectedTimeSlot
        })
      });

      if (response.ok) {
        const data = await response.json();
        setOrder(prev => ({
          ...prev,
          deliverySlot: data.deliverySlot
        }));
        setIsDeliverySlotModalOpen(false);
        // You could add a success toast here
        alert('Delivery preferences updated successfully!');
      } else {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
        console.error('Backend error:', errorData);
        alert(errorData.message || errorData.error || 'Failed to update delivery preferences');
      }
    } catch (error) {
      console.error('Error updating delivery slot:', error);
      alert('Error updating delivery preferences');
    } finally {
      setDeliverySlotLoading(false);
    }
  };

  // Return status utilities
  const getReturnStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'requested':
        return 'order-status-pending';
      case 'admin_review':
        return 'order-status-confirmed';
      case 'approved':
        return 'order-status-processing';
      case 'rejected':
        return 'order-status-cancelled';
      case 'picked_up':
        return 'order-status-shipped';
      case 'quality_checked':
        return 'order-status-returned';
      case 'refund_approved':
        return 'order-status-delivered';
      case 'completed':
        return 'order-status-delivered';
      case 'cancelled':
        return 'order-status-cancelled';
      default:
        return 'gray-badge';
    }
  };

  const getReturnStatusText = (status) => {
    switch (status?.toLowerCase()) {
      case 'requested': return 'Return Requested';
      case 'admin_review': return 'Under Review';
      case 'approved': return 'Return Approved';
      case 'rejected': return 'Return Rejected';
      case 'picked_up': return 'Items Picked Up';
      case 'quality_checked': return 'Quality Checked';
      case 'refund_approved': return 'Refund Approved';
      case 'completed': return 'Refund Completed';
      case 'cancelled': return 'Return Cancelled';
      default: return status;
    }
  };

  const navigateToReturns = () => {
    navigate('/returns');
  };

  const getStatusIcon = (status) => {
    const normalizedStatus = status?.toLowerCase();
    switch (normalizedStatus) {
      case 'delivered':
        return <FiCheck className="w-6 h-6 icon-green" />;
      case 'shipped':
        return <FiTruck className="w-6 h-6 icon-purple" />;
      case 'confirmed':
      case 'pending':
        return <FiPackage className="w-6 h-6 icon-blue" />;
      case 'cancelled':
        return <FiX className="w-6 h-6 icon-red" />;
      default:
        return <FiClock className="w-6 h-6 icon-orange" />;
    }
  };

  const getStatusColor = (status) => {
    const normalizedStatus = status?.toLowerCase();
    switch (normalizedStatus) {
      case 'delivered':
        return 'status-color-green';
      case 'shipped':
        return 'status-color-purple';
      case 'confirmed':
      case 'pending':
        return 'status-color-blue';
      case 'cancelled':
        return 'status-color-red';
      default:
        return 'status-color-orange';
    }
  };  const getStatusMessage = (status) => {
    const normalizedStatus = status?.toLowerCase();
    switch (normalizedStatus) {
      case 'pending':
        return {
          title: 'Order Placed Successfully!',
          message: "We've received your order and are preparing it for shipment.",
          icon: FiClock,
          color: "timeline-orange",
          bgColor: "timeline-orange-bg",
          borderColor: "timeline-orange-border"
        };
      case 'confirmed':
        return {
          title: 'Order Confirmed!',
          message: "Great! Your order has been confirmed and is being prepared.",
          icon: FiPackage,
          color: "timeline-blue",
          bgColor: "timeline-blue-bg",
          borderColor: "timeline-blue-border"
        };
      case 'shipped':
        return {
          title: 'Your Order is On Its Way!',
          message: "Your package has been shipped and is en route to your address.",
          icon: FiTruck,
          color: "timeline-purple",
          bgColor: "timeline-purple-bg",
          borderColor: "timeline-purple-border"
        };
      case 'delivered':
        return {
          title: 'Order Delivered Successfully!',
          message: "Your order has been delivered. We hope you love your purchase!",
          icon: FiCheck,
          color: "timeline-green",
          bgColor: "timeline-green-bg",
          borderColor: "timeline-green-border"
        };
      case 'cancelled':
        return {
          title: 'Order Cancelled',
          message: "This order has been cancelled. Refund will be processed if applicable.",
          icon: FiX,
          color: "timeline-red",
          bgColor: "timeline-red-bg",
          borderColor: "timeline-red-border"
        };
      default:
        return {
          title: 'Order Status',
          message: "Your order is being processed.",
          icon: FiClock,
          color: "timeline-gray",
          bgColor: "timeline-gray-bg",
          borderColor: "timeline-gray-border"
        };
    }
  };

  const getStatusSteps = (currentStatus) => {
    const allSteps = [
      { key: 'pending', label: 'Order Placed', icon: FiClock },
      { key: 'confirmed', label: 'Confirmed', icon: FiCheck },
      { key: 'shipped', label: 'Shipped', icon: FiTruck },
      { key: 'delivered', label: 'Delivered', icon: FiPackage }
    ];

    // Map backend status to our step keys
    const statusMapping = {
      'pending': 'pending',
      'confirmed': 'confirmed', 
      'shipped': 'shipped',
      'delivered': 'delivered',
      'cancelled': 'cancelled'
    };

    const mappedStatus = statusMapping[currentStatus?.toLowerCase()] || currentStatus?.toLowerCase();
    const statusOrder = ['pending', 'confirmed', 'shipped', 'delivered'];
    const currentIndex = statusOrder.indexOf(mappedStatus);
    
    if (mappedStatus === 'cancelled') {
      return [
        { ...allSteps[0], completed: true, active: false },
        { key: 'cancelled', label: 'Cancelled', icon: FiX, completed: true, active: true, cancelled: true }
      ];
    }

    return allSteps.map((step, index) => ({
      ...step,
      completed: index <= currentIndex,
      active: index === currentIndex
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen orderdetail-bg-gradient flex justify-center items-center">
        <motion.div 
          className="glass-medium rounded-3xl p-8 shadow-2xl"
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        >
          <div className="w-8 h-8 border-4 orderdetail-spinner-border border-t-transparent rounded-full"></div>
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen orderdetail-bg-gradient flex justify-center items-center">
        <motion.div 
          className="text-center glass-medium rounded-3xl p-8 shadow-2xl max-w-md"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <FiX className="w-16 h-16 orderdetail-error-icon mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Error</h3>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="flex gap-4 justify-center">
            <button 
              onClick={() => navigate('/orders')}
              className="px-6 py-3 gray-button-gradient text-white rounded-xl transition-all duration-200 shadow-lg"
            >
              Back to Orders
            </button>
            <button 
              onClick={fetchOrderDetail}
              className="flex items-center gap-2 px-6 py-3 emerald-teal-gradient text-white rounded-xl transition-all duration-200 shadow-lg"
            >
              <FiRefreshCw className="w-4 h-4" />
              Try Again
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  if (!order) {
    return null;
  }

  const statusSteps = getStatusSteps(order.status);

  return (
    <div className="min-h-screen orderdetail-bg-gradient py-8">
      {/* Delivery Rating & Review Section */}
      {order.deliveryRating && (
        <div className="max-w-2xl mx-auto mb-8 rating-section-bg rounded-3xl p-6 shadow-lg">
          <h2 className="text-xl font-bold rating-title mb-2 flex items-center">
            <FiStar className="w-6 h-6 rating-star-icon mr-2" /> Delivery Rating & Review
          </h2>
          <div className="flex items-center mb-2">
            <span className="rating-label font-semibold mr-2">Rating:</span>
            <span className="text-lg font-bold rating-value">{order.deliveryRating} / 5</span>
          </div>
          {order.deliveryReview && (
            <div className="mt-2">
              <span className="rating-label font-semibold mr-2">Review:</span>
              <span className="text-gray-800">{order.deliveryReview}</span>
            </div>
          )}
        </div>
      )}
      {/* Delivery Rating Modal for Delivered Orders without Review */}
      {order.status?.toLowerCase() === 'delivered' && !order.deliveryRating && (
        <DeliveryRatingModal orderId={order._id} onReviewSubmitted={(rating, review) => {
          setOrder(prev => ({ ...prev, deliveryRating: rating, deliveryReview: review }));
        }} />
      )}
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <motion.div 
          className="flex items-center gap-4 mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <button
            onClick={() => navigate('/orders')}
            className="p-3 bg-white/80 backdrop-blur-sm rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
          >
            <FiArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Order Details</h1>
            <p className="text-gray-600">Order #{order._id.slice(-8)}</p>
          </div>
        </motion.div>

        {/* Status Message */}
        <motion.div 
          className="mb-8 bg-white/90 backdrop-blur-sm rounded-3xl p-6 shadow-xl border border-white/30"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          {(() => {
            const statusInfo = getStatusMessage(order.status);
            const IconComponent = statusInfo.icon;
            
            return (
              <div className={`flex items-center gap-4 p-4 rounded-2xl border-2 ${statusInfo.bgColor} ${statusInfo.borderColor}`}>
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${statusInfo.bgColor} shadow-lg`}>
                  <IconComponent className={`w-6 h-6 ${statusInfo.color}`} />
                </div>
                <div className="flex-1">
                  <h3 className={`text-lg font-bold ${statusInfo.color}`}>
                    {statusInfo.title}
                  </h3>
                  <p className="text-gray-600 mt-1">
                    {statusInfo.message}
                  </p>
                </div>
              </div>
            );
          })()}
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">          {/* Order Status & Timeline */}
          <motion.div 
            className="lg:col-span-3 bg-white/90 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-white/30"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <motion.div 
              className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <div className="flex items-center gap-4">
                <motion.div 
                  className="w-16 h-16 timeline-icon-bg rounded-2xl flex items-center justify-center shadow-lg"
                  initial={{ rotate: -180, scale: 0 }}
                  animate={{ rotate: 0, scale: 1 }}
                  transition={{ 
                    duration: 0.8, 
                    delay: 0.2,
                    type: "spring",
                    stiffness: 200,
                    damping: 15
                  }}
                >
                  {getStatusIcon(order.status)}
                </motion.div>
                <div>
                  <motion.h2 
                    className="text-2xl font-bold text-gray-800"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    Order Status
                  </motion.h2>
                  <motion.span 
                    className={`inline-block px-4 py-1 rounded-full text-sm font-medium border shadow-sm ${getStatusColor(order.status)}`}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5 }}
                  >
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </motion.span>
                </div>
              </div>
              <motion.div 
                className="text-right"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 }}
              >
                <p className="text-sm text-gray-600">Order Date</p>
                <p className="text-lg font-semibold text-gray-800">
                  {new Date(order.placedAt || order.createdAt).toLocaleDateString('en-IN', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </motion.div>
            </motion.div>            {/* Status Timeline */}
            <div className="relative px-4 sm:px-8">
              {/* Progress Container */}
              <div className="relative flex items-center justify-between">
                {/* Background Progress Line */}
                <div className="absolute top-6 left-6 right-6 h-1 bg-gray-200 rounded-full"></div>
                
                {/* Animated Progress Line */}
                <motion.div 
                  className="absolute top-6 left-6 h-1 progress-bar-gradient rounded-full"
                  initial={{ width: 0 }}
                  animate={{ 
                    width: (() => {
                      if (statusSteps.find(step => step.cancelled)) {
                        return '20%';
                      }
                      
                      const activeIndex = statusSteps.findIndex(step => step.active);
                      const completedSteps = statusSteps.filter(step => step.completed).length;
                      
                      // If all steps are completed (delivered), fill to right-6
                      if (completedSteps === statusSteps.length) {
                        return 'calc(100% - 48px)';
                      }
                      
                      // If there's an active step, progress to that step
                      if (activeIndex >= 0) {
                        const progress = activeIndex / (statusSteps.length - 1);
                        return `calc(${progress * 100}% - ${48 * (1 - progress)}px)`;
                      }
                      
                      return '0%';
                    })()
                  }}
                  transition={{ duration: 2, delay: 0.5, ease: "easeInOut" }}
                />                {statusSteps.map((step, index) => {
                  const IconComponent = step.icon;
                  return (
                    <motion.div 
                      key={step.key} 
                      className="flex flex-col items-center min-w-0 flex-1 relative z-10"
                      initial={{ opacity: 0, scale: 0.5, y: 20 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      transition={{ 
                        duration: 0.6, 
                        delay: 0.2 + index * 0.3,
                        type: "spring",
                        stiffness: 150,
                        damping: 12
                      }}
                    >
                      <motion.div 
                        className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center border-2 transition-all duration-500 relative z-10 ${
                          step.cancelled
                            ? 'return-request-button shadow-lg'
                            : step.completed
                            ? 'order-timeline-complete shadow-lg'
                            : step.active
                            ? 'order-timeline-incomplete shadow-lg'
                            : 'bg-gray-100 border-gray-300 text-gray-400'
                        }`}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ 
                          duration: 0.4, 
                          delay: 0.4 + index * 0.3,
                          type: "spring",
                          stiffness: 200,
                          damping: 10
                        }}
                        whileHover={{ scale: 1.1 }}
                      >                        {/* Pulse animation for active step */}
                        {step.active && !step.cancelled && (
                          <motion.div
                            className="absolute inset-0 rounded-full order-timeline-progress"
                            animate={{ 
                              scale: [1, 1.4, 1], 
                              opacity: [0.7, 0.3, 0.7] 
                            }}
                            transition={{ 
                              duration: 2, 
                              repeat: Infinity,
                              ease: "easeInOut"
                            }}
                          />
                        )}
                        
                        <motion.div
                          initial={{ rotate: -180, opacity: 0 }}
                          animate={{ rotate: 0, opacity: 1 }}
                          transition={{ 
                            duration: 0.5, 
                            delay: 0.6 + index * 0.3 
                          }}
                        >
                          <IconComponent className="w-4 h-4 sm:w-5 sm:h-5 relative z-10" />
                        </motion.div>
                          {/* Success checkmark animation for completed steps */}
                        {step.completed && !step.active && !step.cancelled && (
                          <motion.div
                            className="absolute inset-0 flex items-center justify-center"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ 
                              duration: 0.4, 
                              delay: 0.8 + index * 0.3,
                              type: "spring",
                              stiffness: 300,
                              damping: 20
                            }}
                          >
                            <FiCheck className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                          </motion.div>
                        )}
                      </motion.div>
                      
                      <motion.p 
                        className={`text-xs sm:text-sm font-medium mt-2 sm:mt-3 text-center leading-tight ${
                          step.completed || step.active ? 'text-gray-800' : 'text-gray-400'
                        }`}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ 
                          duration: 0.4, 
                          delay: 0.8 + index * 0.3
                        }}
                      >
                        {step.label}
                      </motion.p>

                      {/* Date/Time for completed steps */}
                      {(step.completed || step.active) && (
                        <motion.p 
                          className="text-xs text-gray-500 mt-1 hidden sm:block"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ 
                            duration: 0.3, 
                            delay: 1 + index * 0.3
                          }}
                        >
                          {step.active ? 'In Progress' : 'Completed'}
                        </motion.p>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </motion.div>

          {/* Order Items */}
          <motion.div 
            className="lg:col-span-2 bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-lg border border-white/20"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-3">
              <FiShoppingBag className="w-6 h-6" />
              Order Items ({order.items?.length || 0})
            </h3>
              {order.items && order.items.length > 0 ? (
              <div className="space-y-4">                {order.items.map((item, index) => (
                  <motion.div
                    key={index}
                    className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl cursor-pointer hover:bg-gray-100 transition-all duration-200 hover:shadow-md"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + index * 0.1 }}                    onClick={() => {
                      if (item.id || item.productId) {
                        navigate(`/products/${item.id || item.productId}`);
                      }
                    }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  ><div className="w-16 h-16 order-image-placeholder rounded-xl flex items-center justify-center overflow-hidden">
                      {item.image ? (
                        <img 
                          src={item.image} 
                          alt={item.name || 'Product'}
                          className="w-full h-full object-cover rounded-xl"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                      ) : (
                        <FiPackage className="w-6 h-6 text-gray-600" />
                      )}
                      <div className="w-full h-full hidden items-center justify-center">
                        <FiPackage className="w-6 h-6 text-gray-600" />
                      </div>
                    </div>                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-800 flex items-center gap-2">
                        {item.name || 'Product'}
                        <FiArrowLeft className="w-4 h-4 text-gray-400 rotate-180" />
                      </h4>
                      {item.variantName && (
                        <p className="text-sm order-item-price font-medium">
                          Variant: {item.variantName}
                        </p>
                      )}
                      <p className="text-sm text-gray-600">
                        Quantity: {item.qty || 1} × ₹{item.variantPrice || item.price || 0}
                      </p>
                      <p className="text-xs text-gray-500">
                        Product ID: {item.id || item.productId || 'N/A'}
                      </p>
                      <p className="text-xs order-item-price mt-1 font-medium">
                        Click to view product details
                      </p>
                    </div>                    <div className="text-right">
                      <p className="font-bold text-gray-800">₹{((item.qty || 1) * (item.variantPrice || item.price || 0)).toFixed(2)}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <p className="text-gray-600">No items found for this order.</p>
            )}
          </motion.div>

          {/* Order Summary & Details */}
          <motion.div 
            className="space-y-6"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            {/* Payment Summary */}
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-lg border border-white/20">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-3">
                <FiDollarSign className="w-5 h-5" />
                Payment Summary
              </h3>              <div className="space-y-3">
                {(() => {                  // Calculate subtotal from items
                  const itemsSubtotal = order.items?.reduce((sum, item) => {
                    const itemPrice = item.variantPrice || item.price || 0;
                    return sum + ((item.qty || 1) * itemPrice);
                  }, 0) || 0;
                  
                  // Calculate shipping (₹100 for orders < ₹500, free otherwise)
                  const shippingCost = itemsSubtotal < 500 ? 100 : 0;
                  
                  // Calculate discount if coupon is applied
                  let discountAmount = 0;
                  if (order.coupon && typeof order.coupon === 'object') {
                    if (order.coupon.type === 'percent') {
                      discountAmount = (itemsSubtotal * order.coupon.amount) / 100;
                      if (order.coupon.maxDiscount) {
                        discountAmount = Math.min(discountAmount, order.coupon.maxDiscount);
                      }
                    } else if (order.coupon.type === 'flat') {
                      discountAmount = order.coupon.amount;
                    }
                  }
                  
                  return (
                    <>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Subtotal:</span>
                        <span className="font-semibold">₹{itemsSubtotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Shipping:</span>
                        <span className="font-semibold">
                          {shippingCost > 0 ? `₹${shippingCost}` : 'Free'}
                        </span>
                      </div>
                      {order.coupon && typeof order.coupon === 'object' && (
                        <div className="flex justify-between order-summary-values">
                          <span>Coupon ({order.coupon.code}):</span>
                          <span className="font-semibold">-₹{discountAmount.toFixed(2)}</span>
                        </div>
                      )}
                      {order.coinDiscount && order.coinDiscount.amount > 0 && (
                        <div className="flex justify-between order-summary-values">
                          <span>Indira Coins ({order.coinDiscount.coinsUsed} coins):</span>
                          <span className="font-semibold">-₹{order.coinDiscount.amount.toFixed(2)}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-gray-600">Tax:</span>
                        <span className="font-semibold">₹0</span>
                      </div>
                    </>
                  );
                })()}
                <div className="border-t border-gray-200 pt-3">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total:</span>
                    <span>₹{order.totalAmount}</span>
                  </div>
                </div>
                <div className="mt-4 p-3 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <FiCreditCard className="w-4 h-4 text-gray-600" />
                    <span className="text-sm font-medium text-gray-700">
                      Payment Status: {order.paymentStatus}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FiDollarSign className="w-4 h-4 text-gray-600" />
                    <span className="text-sm font-medium text-gray-700">
                      Payment Method: {order.paymentMethod}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Delivery Verification Code - Only show when order is shipped */}
            {order.status?.toLowerCase() === 'shipped' && order.deliveryOtp?.code && (
              <motion.div 
                className="delivery-info-bg rounded-3xl p-6 shadow-lg border-2"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <h3 className="text-lg font-bold delivery-info-title mb-4 flex items-center gap-3">
                  <div className="w-8 h-8 delivery-info-icon-bg rounded-full flex items-center justify-center">
                    <FiCheck className="w-4 h-4 text-white" />
                  </div>
                  🔒 Delivery Verification Code
                </h3>
                <div className="delivery-info-content-bg rounded-2xl p-4 border">
                  <div className="text-center">
                    <p className="text-sm delivery-tracking-text mb-3">
                      Share this code with the delivery person to confirm delivery
                    </p>
                    <div className="flex items-center justify-center gap-4 mb-4">
                      <div className="text-3xl font-mono font-bold delivery-tracking-id-bg px-6 py-3 rounded-xl border-2 tracking-wider">
                        {order.deliveryOtp.code}
                      </div>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(order.deliveryOtp.code);
                          // You can add a toast notification here
                        }}
                        className="px-4 py-2 delivery-tracking-copy rounded-lg transition-colors flex items-center gap-2"
                        title="Copy to clipboard"
                      >
                        <FiDownload className="w-4 h-4" />
                        Copy
                      </button>
                    </div>
                    <div className="text-xs delivery-tracking-notes space-y-1">
                      <p>✓ Keep this code safe and share only with the delivery person</p>
                      <p>✓ This code is required to mark your order as delivered</p>
                      <p>✓ Do not share this code with anyone else</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Shipping Address */}
            {(order.shippingAddress || order.shipping) && (
              <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-lg border border-white/20">
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-3">
                  <FiMapPin className="w-5 h-5" />
                  Shipping Address
                </h3>
                <div className="space-y-2 text-gray-600">
                  <p className="font-semibold text-gray-800">
                    {order.shippingAddress?.name || order.shipping?.name || 'Name not available'}
                  </p>
                  <p>{order.shippingAddress?.address || order.shipping?.address || 'Address not available'}</p>
                  <p>{order.shippingAddress?.city || order.shipping?.city || ''} {order.shippingAddress?.pincode || order.shipping?.pincode || ''}</p>
                  <p>{order.shippingAddress?.state || order.shipping?.state || ''}</p>
                  {(order.shippingAddress?.phone || order.shipping?.phone) && (
                    <div className="flex items-center gap-2">
                      <FiPhone className="w-4 h-4" />
                      <span>{order.shippingAddress?.phone || order.shipping?.phone}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Delivery Slot Information */}
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-lg border border-white/20">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-3">
                <FiTruck className="w-5 h-5" />
                Delivery Preferences
              </h3>
              
              {order.deliverySlot?.date || order.deliverySlot?.timeSlot ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {order.deliverySlot.date && (
                      <div className="p-4 delivery-slot-date-bg rounded-2xl">
                        <div className="flex items-center gap-2 mb-2">
                          <FiCalendar className="w-4 h-4 delivery-slot-date-text" />
                          <span className="text-sm font-medium delivery-slot-date-text">Preferred Date</span>
                        </div>
                        <p className="text-gray-800 font-semibold">
                          {new Date(order.deliverySlot.date).toLocaleDateString('en-IN', { 
                            weekday: 'long', 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                          })}
                        </p>
                      </div>
                    )}
                    
                    {order.deliverySlot.timeSlot && (
                      <div className="p-4 delivery-slot-time-bg rounded-2xl">
                        <div className="flex items-center gap-2 mb-2">
                          <FiClock className="w-4 h-4 delivery-slot-time-text" />
                          <span className="text-sm font-medium delivery-slot-time-text">Preferred Time</span>
                        </div>
                        <p className="text-gray-800 font-semibold">
                          {order.deliverySlot.timeSlot}
                        </p>
                      </div>
                    )}
                  </div>
                  
                  {order.deliverySlot.lastModified && (
                    <p className="text-xs text-gray-500 text-center">
                      Last updated: {new Date(order.deliverySlot.lastModified).toLocaleString('en-IN')}
                    </p>
                  )}
                  
                  {/* Delivery slot can always be modified */}
                  <button 
                    onClick={() => setIsDeliverySlotModalOpen(true)}
                    className="w-full px-4 py-2 delivery-instructions-button border-2 rounded-xl transition-all duration-200 flex items-center justify-center gap-2"
                  >
                    <FiRefreshCw className="w-4 h-4" />
                    Change Delivery Preferences
                  </button>
                </div>
              ) : (
                <div className="text-center py-6">
                  <p className="text-gray-500 mb-4">No delivery preferences selected</p>
                  <button 
                    onClick={() => setIsDeliverySlotModalOpen(true)}
                    className="px-6 py-2 track-order-button rounded-xl transition-all duration-200 flex items-center justify-center gap-2 mx-auto"
                  >
                    <FiClock className="w-4 h-4" />
                    Select Delivery Preferences
                  </button>
                </div>
              )}
            </div>

            {/* Return Information Section */}
            {orderReturns.length > 0 && (
              <motion.div 
                className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-lg border border-white/20"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-3">
                  <FiRotateCcw className="w-5 h-5 returns-icon" />
                  Return Information
                </h3>
                
                <div className="space-y-4">
                  {orderReturns.map((returnRequest, index) => (
                    <div 
                      key={returnRequest._id}
                      className="border border-gray-200 rounded-2xl p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="font-semibold text-gray-900">
                            Return #{returnRequest.returnRequestId}
                          </h4>
                          <p className="text-sm text-gray-600">
                            Requested: {new Date(returnRequest.requestedAt).toLocaleDateString('en-IN', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getReturnStatusColor(returnRequest.status)}`}>
                          {getReturnStatusText(returnRequest.status)}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                        <div>
                          <span className="text-sm font-medium text-gray-700">Reason:</span>
                          <p className="text-sm text-gray-600 mt-1 capitalize">
                            {returnRequest.returnReason.replace(/_/g, ' ')}
                          </p>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-gray-700">Items:</span>
                          <p className="text-sm text-gray-600 mt-1">
                            {returnRequest.items.length} item(s) returned
                          </p>
                        </div>
                      </div>

                      {returnRequest.customerComments && (
                        <div className="mb-3">
                          <span className="text-sm font-medium text-gray-700">Comments:</span>
                          <p className="text-sm text-gray-600 mt-1 bg-gray-50 p-2 rounded-lg">
                            {returnRequest.customerComments}
                          </p>
                        </div>
                      )}

                      {/* Return Progress Info */}
                      <div className="flex flex-wrap gap-3 text-xs">
                        {returnRequest.status === 'completed' && returnRequest.refund?.processing?.coinsCredited && (
                          <div className="flex items-center gap-1 return-item-approved px-2 py-1 rounded-full">
                            <FiCheck className="w-3 h-3" />
                            <span>Refunded: {returnRequest.refund.processing.coinsCredited} coins</span>
                          </div>
                        )}
                        {returnRequest.status === 'rejected' && (
                          <div className="flex items-center gap-1 return-item-rejected px-2 py-1 rounded-full">
                            <FiX className="w-3 h-3" />
                            <span>Return was rejected</span>
                          </div>
                        )}
                        {['requested', 'admin_review', 'approved'].includes(returnRequest.status) && (
                          <div className="flex items-center gap-1 return-item-pending px-2 py-1 rounded-full">
                            <FiClock className="w-3 h-3" />
                            <span>Processing in progress</span>
                          </div>
                        )}
                      </div>

                      {/* Action Button */}
                      <div className="mt-4 pt-3 border-t border-gray-100">
                        <button
                          onClick={navigateToReturns}
                          className="flex items-center gap-2 returns-link text-sm font-medium"
                        >
                          <FiEye className="w-4 h-4" />
                          View Full Return Details
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Quick Actions for Returns */}
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <button
                    onClick={navigateToReturns}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 returns-button rounded-xl transition-all duration-200 border"
                  >
                    <FiRotateCcw className="w-4 h-4" />
                    Manage All Returns
                  </button>
                </div>
              </motion.div>
            )}

            {/* Actions */}
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-lg border border-white/20">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Actions</h3>
              <div className="space-y-3">
                <button className="w-full flex items-center justify-center gap-2 px-4 py-3 emerald-teal-gradient text-white rounded-xl transition-all duration-200 shadow-lg">
                  <FiDownload className="w-4 h-4" />
                  Download Invoice
                </button>
                {order.status?.toLowerCase() === 'delivered' && (
                  <>
                    <button 
                      onClick={() => setReturnModalOpen(true)}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 action-button-purple rounded-xl transition-all duration-200 shadow-lg"
                    >
                      <FiRefreshCw className="w-4 h-4" />
                      Return Order
                    </button>
                    <button className="w-full flex items-center justify-center gap-2 px-4 py-3 action-button-yellow rounded-xl transition-all duration-200 shadow-lg">
                      <FiStar className="w-4 h-4" />
                      Rate & Review
                    </button>
                  </>
                )}
                {(order.status?.toLowerCase() === 'pending' || order.status?.toLowerCase() === 'confirmed') && (
                  <button className="w-full flex items-center justify-center gap-2 px-4 py-3 action-button-red rounded-xl transition-all duration-200 shadow-lg">
                    <FiX className="w-4 h-4" />
                    Cancel Order
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Delivery Slot Modal */}
      <AnimatePresence>
        {isDeliverySlotModalOpen && (
          <motion.div 
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsDeliverySlotModalOpen(false)}
          >
            <motion.div 
              className="w-full max-w-md bg-white rounded-2xl p-6 max-h-[90vh] overflow-y-auto"
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-800">Select Delivery Preferences</h3>
                <button 
                  onClick={() => setIsDeliverySlotModalOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <FiX className="w-5 h-5" />
                </button>
              </div>
              
              <DeliverySlotSelector 
                onSlotSelect={handleDeliverySlotUpdate}
                loading={deliverySlotLoading}
                initialDate={order?.deliverySlot?.date}
                initialTimeSlot={order?.deliverySlot?.timeSlot}
                canModify={true}
                onCancel={() => setIsDeliverySlotModalOpen(false)}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Return Order Modal */}
      <ReturnOrderModal
        isOpen={returnModalOpen}
        onClose={() => setReturnModalOpen(false)}
        orderId={orderId}
      />
    </div>
  );
};

export default OrderDetail;
