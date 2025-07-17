import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
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
  FiStar
} from 'react-icons/fi';
import DeliverySlotSelector from '../components/DeliverySlotSelector';

const OrderDetail = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDeliverySlotModalOpen, setIsDeliverySlotModalOpen] = useState(false);
  const [deliverySlotLoading, setDeliverySlotLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    fetchOrderDetail();
  }, [orderId, navigate]);
  const fetchOrderDetail = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`http://localhost:5001/api/products/orders/${orderId}`, {
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

  const handleDeliverySlotUpdate = async (selectedDate, selectedTimeSlot) => {
    setDeliverySlotLoading(true);
    
    console.log('Sending delivery slot update:', { date: selectedDate, timeSlot: selectedTimeSlot });
    
    try {
      const response = await fetch(`http://localhost:5001/api/orders/${orderId}/delivery-slot`, {
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
  const getStatusIcon = (status) => {
    const normalizedStatus = status?.toLowerCase();
    switch (normalizedStatus) {
      case 'delivered':
        return <FiCheck className="w-6 h-6 text-green-500" />;
      case 'shipped':
        return <FiTruck className="w-6 h-6 text-purple-500" />;
      case 'confirmed':
      case 'pending':
        return <FiPackage className="w-6 h-6 text-blue-500" />;
      case 'cancelled':
        return <FiX className="w-6 h-6 text-red-500" />;
      default:
        return <FiClock className="w-6 h-6 text-orange-500" />;
    }
  };

  const getStatusColor = (status) => {
    const normalizedStatus = status?.toLowerCase();
    switch (normalizedStatus) {
      case 'delivered':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'shipped':
        return 'text-purple-600 bg-purple-50 border-purple-200';
      case 'confirmed':
      case 'pending':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'cancelled':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-orange-600 bg-orange-50 border-orange-200';
    }
  };  const getStatusMessage = (status) => {
    const normalizedStatus = status?.toLowerCase();
    switch (normalizedStatus) {
      case 'pending':
        return {
          title: 'Order Placed Successfully!',
          message: "We've received your order and are preparing it for shipment.",
          icon: FiClock,
          color: "text-orange-600",
          bgColor: "bg-orange-50",
          borderColor: "border-orange-200"
        };
      case 'confirmed':
        return {
          title: 'Order Confirmed!',
          message: "Great! Your order has been confirmed and is being prepared.",
          icon: FiPackage,
          color: "text-blue-600",
          bgColor: "bg-blue-50",
          borderColor: "border-blue-200"
        };
      case 'shipped':
        return {
          title: 'Your Order is On Its Way!',
          message: "Your package has been shipped and is en route to your address.",
          icon: FiTruck,
          color: "text-purple-600",
          bgColor: "bg-purple-50",
          borderColor: "border-purple-200"
        };
      case 'delivered':
        return {
          title: 'Order Delivered Successfully!',
          message: "Your order has been delivered. We hope you love your purchase!",
          icon: FiCheck,
          color: "text-green-600",
          bgColor: "bg-green-50",
          borderColor: "border-green-200"
        };
      case 'cancelled':
        return {
          title: 'Order Cancelled',
          message: "This order has been cancelled. Refund will be processed if applicable.",
          icon: FiX,
          color: "text-red-600",
          bgColor: "bg-red-50",
          borderColor: "border-red-200"
        };
      default:
        return {
          title: 'Order Status',
          message: "Your order is being processed.",
          icon: FiClock,
          color: "text-gray-600",
          bgColor: "bg-gray-50",
          borderColor: "border-gray-200"
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
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 flex justify-center items-center">
        <motion.div 
          className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-2xl"
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        >
          <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full"></div>
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 flex justify-center items-center">
        <motion.div 
          className="text-center bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-2xl max-w-md"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <FiX className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Error</h3>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="flex gap-4 justify-center">
            <button 
              onClick={() => navigate('/orders')}
              className="px-6 py-3 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-xl hover:from-gray-600 hover:to-gray-700 transition-all duration-200 shadow-lg"
            >
              Back to Orders
            </button>
            <button 
              onClick={fetchOrderDetail}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl hover:from-emerald-600 hover:to-teal-700 transition-all duration-200 shadow-lg"
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
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 py-8">
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
                  className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg"
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
                  className="absolute top-6 left-6 h-1 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full"
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
                            ? 'bg-red-500 border-red-500 text-white shadow-lg'
                            : step.completed
                            ? 'bg-emerald-500 border-emerald-500 text-white shadow-lg'
                            : step.active
                            ? 'bg-white border-emerald-500 text-emerald-600 shadow-lg'
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
                            className="absolute inset-0 rounded-full bg-emerald-400"
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
                  ><div className="w-16 h-16 bg-gradient-to-r from-gray-200 to-gray-300 rounded-xl flex items-center justify-center overflow-hidden">
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
                        <p className="text-sm text-emerald-600 font-medium">
                          Variant: {item.variantName}
                        </p>
                      )}
                      <p className="text-sm text-gray-600">
                        Quantity: {item.qty || 1} × ₹{item.variantPrice || item.price || 0}
                      </p>
                      <p className="text-xs text-gray-500">
                        Product ID: {item.id || item.productId || 'N/A'}
                      </p>
                      <p className="text-xs text-emerald-600 mt-1 font-medium">
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
                        <div className="flex justify-between text-green-600">
                          <span>Coupon ({order.coupon.code}):</span>
                          <span className="font-semibold">-₹{discountAmount.toFixed(2)}</span>
                        </div>
                      )}
                      {order.coinDiscount && order.coinDiscount.amount > 0 && (
                        <div className="flex justify-between text-green-600">
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
                className="bg-gradient-to-r from-blue-50 to-indigo-50 backdrop-blur-sm rounded-3xl p-6 shadow-lg border-2 border-blue-200"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <h3 className="text-lg font-bold text-blue-800 mb-4 flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                    <FiCheck className="w-4 h-4 text-white" />
                  </div>
                  🔒 Delivery Verification Code
                </h3>
                <div className="bg-white/80 rounded-2xl p-4 border border-blue-200">
                  <div className="text-center">
                    <p className="text-sm text-blue-600 mb-3">
                      Share this code with the delivery person to confirm delivery
                    </p>
                    <div className="flex items-center justify-center gap-4 mb-4">
                      <div className="text-3xl font-mono font-bold text-blue-700 bg-blue-50 px-6 py-3 rounded-xl border-2 border-blue-200 tracking-wider">
                        {order.deliveryOtp.code}
                      </div>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(order.deliveryOtp.code);
                          // You can add a toast notification here
                        }}
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
                        title="Copy to clipboard"
                      >
                        <FiDownload className="w-4 h-4" />
                        Copy
                      </button>
                    </div>
                    <div className="text-xs text-blue-500 space-y-1">
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
                      <div className="p-4 bg-blue-50 rounded-2xl">
                        <div className="flex items-center gap-2 mb-2">
                          <FiCalendar className="w-4 h-4 text-blue-600" />
                          <span className="text-sm font-medium text-blue-600">Preferred Date</span>
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
                      <div className="p-4 bg-green-50 rounded-2xl">
                        <div className="flex items-center gap-2 mb-2">
                          <FiClock className="w-4 h-4 text-green-600" />
                          <span className="text-sm font-medium text-green-600">Preferred Time</span>
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
                    className="w-full px-4 py-2 bg-white border-2 border-blue-300 text-blue-600 rounded-xl hover:bg-blue-50 transition-all duration-200 flex items-center justify-center gap-2"
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
                    className="px-6 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200 flex items-center justify-center gap-2 mx-auto"
                  >
                    <FiClock className="w-4 h-4" />
                    Select Delivery Preferences
                  </button>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-lg border border-white/20">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Actions</h3>
              <div className="space-y-3">
                <button className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl hover:from-emerald-600 hover:to-teal-700 transition-all duration-200 shadow-lg">
                  <FiDownload className="w-4 h-4" />
                  Download Invoice
                </button>                {order.status?.toLowerCase() === 'delivered' && (
                  <button className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-yellow-500 to-orange-600 text-white rounded-xl hover:from-yellow-600 hover:to-orange-700 transition-all duration-200 shadow-lg">
                    <FiStar className="w-4 h-4" />
                    Rate & Review
                  </button>
                )}
                {(order.status?.toLowerCase() === 'pending' || order.status?.toLowerCase() === 'confirmed') && (
                  <button className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-200 shadow-lg">
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
    </div>
  );
};

export default OrderDetail;
