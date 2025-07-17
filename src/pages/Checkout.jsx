import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';
import CoinRedemptionWidget from './CoinRedemptionWidget';
import { 
  FiArrowLeft,
  FiShoppingCart,
  FiMapPin,
  FiCreditCard,
  FiCheck,
  FiX,
  FiPlus,
  FiMinus,
  FiEdit3,
  FiTrash2,
  FiPercent,
  FiTag,
  FiDollarSign,
  FiClock,
  FiLoader,
  FiCheckCircle,
  FiXCircle,
  FiCopy,
  FiPhoneCall,  FiUser,
  FiPackage,
  FiEye,
  FiShoppingBag,
  FiMail,
  FiHome,
  FiNavigation
} from 'react-icons/fi';

const Checkout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [utrNumber, setUtrNumber] = useState('');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [orderProcessing, setOrderProcessing] = useState(false);
  const [orderResult, setOrderResult] = useState(null);  const [subtotal, setSubtotal] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [coinDiscount, setCoinDiscount] = useState(null); // New state for coin discount
  const [userEmail, setUserEmail] = useState('');
  const [total, setTotal] = useState(0);
  
  const [newAddress, setNewAddress] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    isDefault: false
  });

  const steps = [
    { number: 1, title: 'Review Items', icon: FiShoppingCart },
    { number: 2, title: 'Delivery Address', icon: FiMapPin },
    { number: 3, title: 'Payment', icon: FiCreditCard },
    { number: 4, title: 'Confirmation', icon: FiCheck }
  ];

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    fetchCheckoutData();
  }, [navigate]);

  useEffect(() => {
    calculateTotals();
  }, [cart, appliedCoupon, coinDiscount]); // Add coinDiscount dependency

  const fetchCheckoutData = async () => {
    setLoading(true);
    try {
      // Check if this is a direct product purchase from URL parameters
      const urlParams = new URLSearchParams(location.search);
      const productId = urlParams.get('product');
      const quantity = parseInt(urlParams.get('quantity')) || 1;
      const variantId = urlParams.get('variantId');

      if (productId) {
        // Direct product purchase - fetch the specific product
        try {
          const productResponse = await fetch(`http://localhost:5001/api/products/${productId}`);
          if (productResponse.ok) {
            const productData = await productResponse.json();
            const product = productData.product;
            
            // Handle variant selection
            let selectedVariant = null;
            let itemPrice = product.price;
            let itemName = product.name;
            
            if (variantId && product.hasVariants && product.variants) {
              selectedVariant = product.variants.find(v => v.id === variantId);
              if (selectedVariant) {
                itemPrice = selectedVariant.price;
                itemName = `${product.name} - ${selectedVariant.label}`;
              }
            }
            
            // Create cart item for direct purchase
            const directCartItem = {
              _id: productId,
              name: itemName,
              price: itemPrice,
              qty: quantity,
              image: product.images?.[0] || '/placeholder.png',
              selectedVariant: selectedVariant,
              isDirect: true // Flag to indicate direct purchase
            };
            
            setCart([directCartItem]);
          } else {
            throw new Error('Product not found');
          }
        } catch (error) {
          console.error('Error fetching product for direct purchase:', error);
          alert('Product not found. Redirecting to products page.');
          navigate('/products');
          return;
        }
      } else {
        // Regular cart checkout - fetch cart items
        const cartResponse = await fetch('http://localhost:5001/api/products/cart/me', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        if (cartResponse.ok) {
          const cartData = await cartResponse.json();
          console.log('Cart Data:', cartData);
          setCart(cartData.cart || []);
        }
      }

      // Fetch user profile to get addresses
      try {
        const userResponse = await fetch('http://localhost:5001/api/auth/me', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });          if (userResponse.ok) {
          const userData = await userResponse.json();
          console.log('User addresses:', userData.user.addresses); // Debug log
          setAddresses(userData.user.addresses || []);
          setUserEmail(userData.user.email || ''); // Set user email
          // Auto-select first address if available and none is currently selected
          if (userData.user.addresses && userData.user.addresses.length > 0 && !selectedAddress) {
            console.log('Auto-selecting first address:', userData.user.addresses[0]._id); // Debug log
            setSelectedAddress(userData.user.addresses[0]);
          }
        }
      } catch (error) {
        console.log('Error fetching user profile:', error);
        setAddresses([]);
      }

    } catch (error) {
      console.error('Error fetching checkout data:', error);
    } finally {
      setLoading(false);
    }
  };  const calculateTotals = () => {
    const subtotalAmount = cart.reduce((sum, item) => {
      return sum + ((item.price || 0) * (item.qty || 1));
    }, 0);
    
    setSubtotal(subtotalAmount);
    
    let discountAmount = 0;
    if (appliedCoupon) {
      if (appliedCoupon.type === 'percent') {
        discountAmount = (subtotalAmount * appliedCoupon.amount) / 100;
        // Apply max discount limit if exists
        if (appliedCoupon.maxDiscount) {
          discountAmount = Math.min(discountAmount, appliedCoupon.maxDiscount);
        }
      } else if (appliedCoupon.type === 'flat') {
        discountAmount = appliedCoupon.amount;
      }
      discountAmount = Math.min(discountAmount, subtotalAmount);
    }
    
    setDiscount(discountAmount);
    
    // Add coin discount
    const coinDiscountAmount = coinDiscount ? coinDiscount.discountAmount : 0;
    
    // Calculate shipping: Free if subtotal >= 500, otherwise ₹100
    const shippingCost = subtotalAmount >= 500 ? 0 : 100;
    setTotal(subtotalAmount - discountAmount - coinDiscountAmount + shippingCost);
  };
  const applyCoupon = async () => {
    if (!couponCode.trim()) return;
    
    setCouponLoading(true);
    try {
      const response = await fetch('http://localhost:5001/api/coupons/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ 
          code: couponCode
        })
      });

      if (response.ok) {
        const data = await response.json();
        // Check if coupon is valid and meets requirements
        const coupon = data.coupon;
        if (coupon.minOrder && subtotal < coupon.minOrder) {
          alert(`Minimum order value should be ₹${coupon.minOrder}`);
          return;
        }        setAppliedCoupon({
          ...coupon,
          type: coupon.type,
          amount: coupon.amount
        });
        setCouponCode('');
        alert('Coupon applied successfully!');
      } else {
        const errorData = await response.json();
        alert(errorData.message || 'Invalid coupon code');
      }
    } catch (error) {
      alert('Error applying coupon');
    } finally {
      setCouponLoading(false);
    }
  };
  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
  };

  const updateCartQuantity = async (itemId, newQty) => {
    if (newQty < 1) return;
    
    try {
      const response = await fetch('http://localhost:5001/api/products/cart/update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          productId: itemId,
          qty: newQty
        })
      });

      if (response.ok) {
        // Update local cart state
        setCart(cart.map(item => 
          item._id === itemId ? { ...item, qty: newQty } : item
        ));
      } else {
        alert('Error updating quantity');
      }
    } catch (error) {
      alert('Error updating quantity');
    }
  };

  const removeFromCart = async (itemId) => {
    try {
      const response = await fetch('http://localhost:5001/api/products/cart/remove', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          productId: itemId
        })
      });

      if (response.ok) {
        setCart(cart.filter(item => item._id !== itemId));
      } else {
        alert('Error removing item');
      }
    } catch (error) {
      alert('Error removing item');
    }
  };
  const addAddress = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5001/api/auth/address/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          name: newAddress.name,
          address: newAddress.address,
          phone: newAddress.phone,
          city: newAddress.city,
          state: newAddress.state,
          pincode: newAddress.pincode
        })
      });      if (response.ok) {
        const data = await response.json();
        console.log('Added address response:', data); // Debug log
        // Update addresses list with the new address
        setAddresses(data.addresses);
        // Select the newly added address (it should be the last one)
        const newAddressItem = data.addresses[data.addresses.length - 1];
        console.log('Selecting new address:', newAddressItem._id); // Debug log
        setSelectedAddress(newAddressItem);
        setShowAddressForm(false);
        setNewAddress({
          name: '',
          phone: '',
          email: '',
          address: '',
          city: '',
          state: '',
          pincode: '',
          isDefault: false
        });
        alert('Address added successfully!');
      } else {
        const errorData = await response.json();
        alert(errorData.message || 'Error adding address');
      }
    } catch (error) {
      alert('Error adding address');
    }
  };  const generateUPIDeepLink = () => {
    const merchantUPI = "yourstore@paytm"; // Replace with your actual UPI ID
    const merchantName = "Your Store";
    const amount = total.toFixed(2);
    const transactionId = `TXN${Date.now()}`;
    const note = "Order Payment";
    
    return `upi://pay?pa=${merchantUPI}&pn=${encodeURIComponent(merchantName)}&am=${amount}&tr=${transactionId}&tn=${encodeURIComponent(note)}`;
  };

  const nextStep = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };
  const placeOrder = async () => {
    // Validation checks
    if (!cart.length) {
      alert('Your cart is empty');
      return;
    }
    
    if (!selectedAddress) {
      alert('Please select a delivery address');
      return;
    }
    
    if (paymentMethod === 'upi' && !utrNumber.trim()) {
      alert('Please enter UTR number for UPI payment');
      return;
    }

    setOrderProcessing(true);
    setShowPaymentModal(true);
      try {
      // Simulate processing delay
      await new Promise(resolve => setTimeout(resolve, 1000));        const orderData = {
        items: cart.map(item => ({
          id: item._id,
          name: item.name,
          price: item.selectedVariant ? item.selectedVariant.price : item.price,
          qty: item.qty || 1,
          image: item.type === 'combo' 
            ? (item.mainImage || item.products?.[0]?.images?.[0]?.url || '/placeholder.png')
            : (item.image || (item.images && item.images[0] ? item.images[0] : '/placeholder.png')),
          // Item type information
          type: item.type || 'product', // 'product' or 'combo'
          itemType: item.type || 'product', // For Order model compatibility
          // Variant information (for products)
          hasVariant: !!item.selectedVariant,
          variantId: item.selectedVariant?.id || null,
          variantName: item.selectedVariant?.label || item.selectedVariant?.name || null,
          variantPrice: item.selectedVariant?.price || null,
          // Combo pack information
          ...(item.type === 'combo' && {
            originalTotalPrice: item.originalTotalPrice,
            discountAmount: item.discountAmount,
            discountPercentage: item.discountPercentage,
            comboProducts: item.products || []
          }),
          isDirect: item.isDirect || false
        })),
        totalAmount: total,
        shipping: {
          name: selectedAddress.name,
          address: selectedAddress.address,
          phone: selectedAddress.phone,
          city: selectedAddress.city,
          state: selectedAddress.state,
          pincode: selectedAddress.pincode
        },
        paymentMethod: paymentMethod.toUpperCase(), // COD or UPI
        paymentStatus: paymentMethod === 'cod' ? 'pending' : 'paid',
        coupon: appliedCoupon?._id || null, // Send coupon ID if applied
        coinDiscount: coinDiscount, // Include coin discount data
        subtotal: subtotal, // Include subtotal for backend calculations
        upiTransactionId: paymentMethod === 'upi' ? utrNumber : null
      };

      console.log('[CHECKOUT] Order Data being sent:', orderData);
      console.log('[CHECKOUT] Coin discount data:', coinDiscount);

      console.log('Order Data:', orderData); // Debug log

      const response = await fetch('http://localhost:5001/api/products/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(orderData)
      });

      
      
      if (response.ok) {
        const data = await response.json();
        setOrderResult({
          success: true,
          orderId: data.order._id,
          message: 'Your order has been placed successfully!'
        });        // Clear cart after successful order (only for regular cart purchases, not direct purchases)
        const hasDirectPurchase = cart.some(item => item.isDirect);
        if (!hasDirectPurchase) {
          console.log('Order placed successfully, attempting to clear cart...');
          try {
            const clearCartResponse = await fetch('http://localhost:5001/api/products/cart/clear', {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            });
            
            console.log('Clear cart response status:', clearCartResponse.status);
            
            if (clearCartResponse.ok) {
              const clearData = await clearCartResponse.json();
              console.log('Cart cleared successfully after order placement:', clearData);
            } else {
              const errorData = await clearCartResponse.text();
              console.warn('Failed to clear cart after order placement:', errorData);
            }
          } catch (error) {
            console.error('Error clearing cart after order placement:', error);
          }
        }
        await new Promise(resolve => setTimeout(resolve, 1000)); // UX delay
        setTimeout(() => {
          navigate(`/orders/${data.order._id}`);
        }, 3000);
      } else {
        const errorData = await response.json();
        console.error('Order placement error:', errorData);
        setOrderResult({
          success: false,
          message: errorData.message || 'Sorry, there was an error placing your order. Please try again.'
        });
      }
    } catch (error) {
      setOrderResult({
        success: false,
        message: 'Network error. Please check your connection and try again.'
      });
    } finally {
      setOrderProcessing(false);
    }
  };

  // Handler for coin discount application
  const handleCoinDiscountApply = (discount) => {
    console.log('[CHECKOUT] Coin discount applied:', discount);
    setCoinDiscount(discount);
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
            onClick={() => navigate('/cart')}
            className="p-3 bg-white/80 backdrop-blur-sm rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
          >
            <FiArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Checkout</h1>
            <p className="text-gray-600">Complete your order in {4 - currentStep + 1} steps</p>
          </div>
        </motion.div>

        {/* Progress Steps */}
        <motion.div 
          className="bg-white/90 backdrop-blur-sm rounded-3xl p-6 shadow-xl border border-white/30 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex items-center justify-between relative">
            {/* Progress Line */}
            <div className="absolute top-6 left-6 right-6 h-1 bg-gray-200 rounded-full"></div>            <motion.div 
              className="absolute top-6 left-6 h-1 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full"
              initial={{ width: 0 }}
              animate={{ 
                width: `${Math.min(((currentStep - 1) / (steps.length - 1)) * 100, 100)}%`
              }}
              transition={{ duration: 0.5 }}
            />
            
            {steps.map((step, index) => {
              const IconComponent = step.icon;
              const isActive = currentStep >= step.number;
              const isCurrent = currentStep === step.number;
              
              return (
                <motion.div 
                  key={step.number}
                  className="flex flex-col items-center relative z-10"
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1 + index * 0.1 }}
                >
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                    isActive 
                      ? 'bg-emerald-500 border-emerald-500 text-white shadow-lg' 
                      : 'bg-gray-100 border-gray-300 text-gray-400'
                  }`}>
                    {isCurrent ? (
                      <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 1, repeat: Infinity }}
                      >
                        <IconComponent className="w-5 h-5" />
                      </motion.div>
                    ) : (
                      <IconComponent className="w-5 h-5" />
                    )}
                  </div>
                  <p className={`text-sm font-medium mt-2 ${
                    isActive ? 'text-gray-800' : 'text-gray-400'
                  }`}>
                    {step.title}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Step Content */}
        <AnimatePresence mode="wait">
          {currentStep === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              {/* Cart Items Review */}
              <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-white/30">
                <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                  <FiShoppingCart className="w-6 h-6" />
                  Review Your Items ({cart.length})
                </h2>
                  <div className="space-y-4 mb-6">
                  {cart.map((item, index) => (
                    <motion.div
                      key={item._id || index}
                      className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >                      <div className="w-16 h-16 bg-gradient-to-r from-gray-200 to-gray-300 rounded-xl flex items-center justify-center overflow-hidden">
                        {(item.type === 'combo' ? (item.mainImage || item.products?.[0]?.images?.[0]?.url) : (item.image || (item.images && item.images[0]))) ? (
                          <img 
                            src={item.type === 'combo' 
                              ? (item.mainImage || item.products?.[0]?.images?.[0] || '/placeholder.png')
                              : (item.image || item.images[0] || '/placeholder.png')
                            } 
                            alt={item.name || 'Product'}
                            className="w-full h-full object-cover rounded-xl"
                          />
                        ) : (
                          <FiShoppingCart className="w-6 h-6 text-gray-600" />
                        )}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-800">
                          {item.name || 'Product'}
                        </h4>
                        {item.selectedVariant && (
                          <p className="text-xs text-emerald-600 font-medium">
                            Variant: {item.selectedVariant.label || item.selectedVariant.name}
                          </p>
                        )}
                        <p className="text-sm text-gray-600">
                          ₹{item.price || 0} each
                        </p>
                      </div>
                        {/* Quantity Controls */}
                      <div className="flex items-center gap-3">
                        {!item.isDirect && (
                          <div className="flex items-center gap-2 bg-white rounded-lg p-1">
                            <button
                              onClick={() => updateCartQuantity(item._id, (item.qty || 1) - 1)}
                              disabled={item.qty <= 1}
                              className="w-8 h-8 flex items-center justify-center rounded-md bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <FiMinus className="w-4 h-4" />
                            </button>
                            <span className="w-8 text-center font-medium">{item.qty || 1}</span>
                            <button
                              onClick={() => updateCartQuantity(item._id, (item.qty || 1) + 1)}
                              disabled={item.qty >= (item.selectedVariant?.stock || item.stock)}
                              className="w-8 h-8 flex items-center justify-center rounded-md bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <FiPlus className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                        
                        {item.isDirect ? (
                          <div className="text-sm text-gray-600 font-medium">
                            Qty: {item.qty || 1}
                          </div>
                        ) : null}
                        
                        {!item.isDirect && (
                          <button
                            onClick={() => removeFromCart(item._id)}
                            className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <FiTrash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                      
                      <div className="text-right">
                        <p className="font-bold text-gray-800">
                          ₹{((item.qty || 1) * (item.price || 0)).toFixed(2)}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Coupon Section */}
                <div className="border-t border-gray-200 pt-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <FiTag className="w-5 h-5" />
                    Apply Coupon
                  </h3>
                  
                  {!appliedCoupon ? (
                    <div className="flex gap-3">
                      <input
                        type="text"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                        placeholder="Enter coupon code"
                        className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      />
                      <button
                        onClick={applyCoupon}
                        disabled={couponLoading || !couponCode.trim()}
                        className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl hover:from-emerald-600 hover:to-teal-700 transition-all duration-200 shadow-lg disabled:opacity-50 flex items-center gap-2"
                      >
                        {couponLoading ? (
                          <FiLoader className="w-4 h-4 animate-spin" />
                        ) : (
                          <FiPercent className="w-4 h-4" />
                        )}
                        Apply
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-xl">
                      <div className="flex items-center gap-3">
                        <FiCheckCircle className="w-5 h-5 text-green-600" />
                        <div>                          <p className="font-semibold text-green-800">{appliedCoupon.code}</p>                          <p className="text-sm text-green-600">
                            {appliedCoupon.description || 
                              (appliedCoupon.type === 'percent' 
                                ? `${appliedCoupon.amount}% off` 
                                : `₹${appliedCoupon.amount} off`)}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={removeCoupon}
                        className="text-red-500 hover:text-red-700 transition-colors"
                      >
                        <FiX className="w-5 h-5" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Coin Redemption Widget */}
                <div className="border-t border-gray-200 pt-6 mt-6">
                  <CoinRedemptionWidget 
                    orderValue={subtotal}
                    onDiscountApply={handleCoinDiscountApply}
                    appliedCoinDiscount={coinDiscount}
                  />
                </div>

                {/* Price Summary */}
                <div className="border-t border-gray-200 pt-6 mt-6">
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Subtotal:</span>
                      <span className="font-semibold">₹{subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Shipping:</span>
                      <span className={`font-semibold ${subtotal >= 500 ? 'text-green-600' : 'text-gray-800'}`}>
                        {subtotal >= 500 ? 'Free' : '₹100.00'}
                      </span>
                    </div>
                    {subtotal < 500 && (
                      <div className="text-xs text-blue-600 bg-blue-50 p-2 rounded-lg">
                        💡 Add ₹{(500 - subtotal).toFixed(2)} more for free shipping!
                      </div>
                    )}
                    {discount > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span>Coupon Discount:</span>
                        <span className="font-semibold">-₹{discount.toFixed(2)}</span>
                      </div>
                    )}
                    {coinDiscount && (
                      <div className="flex justify-between text-emerald-600">
                        <span>Coin Discount ({coinDiscount.coinsUsed} coins):</span>
                        <span className="font-semibold">-₹{coinDiscount.discountAmount.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="border-t border-gray-200 pt-3">
                      <div className="flex justify-between text-lg font-bold">
                        <span>Total:</span>
                        <span>₹{total.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Navigation */}
              <div className="flex justify-end">
                <button
                  onClick={nextStep}
                  className="px-8 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl hover:from-emerald-600 hover:to-teal-700 transition-all duration-200 shadow-lg"
                >
                  Continue to Address
                </button>
              </div>
            </motion.div>
          )}

          {currentStep === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              {/* Address Selection */}
              <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-white/30">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
                    <FiMapPin className="w-6 h-6" />
                    Delivery Address
                  </h2>
                  <button
                    onClick={() => setShowAddressForm(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl hover:from-emerald-600 hover:to-teal-700 transition-all duration-200 shadow-lg"
                  >
                    <FiPlus className="w-4 h-4" />
                    Add New Address
                  </button>
                </div>                {/* Address List */}
                <div className="space-y-4 mb-6">
                  {console.log('Current selectedAddress:', selectedAddress)} {/* Debug log */}
                  {addresses.length > 0 ? (
                    addresses.map((address, index) => {
                      const isSelected = selectedAddress && selectedAddress._id && address._id && 
                                        selectedAddress._id.toString() === address._id.toString();
                      
                      return (
                        <motion.div
                          key={address._id || index}
                          className={`p-4 border-2 rounded-2xl cursor-pointer transition-all duration-200 ${
                            isSelected 
                              ? 'border-emerald-500 bg-emerald-50 shadow-lg ring-2 ring-emerald-200' 
                              : 'border-gray-200 hover:border-emerald-300 hover:shadow-sm bg-white'
                          }`}
                          onClick={() => {
                            console.log('Selecting address:', address._id); // Debug log
                            setSelectedAddress(address);
                          }}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                        >
                          <div className="flex items-start gap-3">
                            {/* Radio button style selector */}
                            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center mt-0.5 flex-shrink-0 transition-all duration-200 ${
                              isSelected 
                                ? 'border-emerald-500 bg-emerald-500 shadow-sm' 
                                : 'border-gray-300 bg-white hover:border-emerald-400'
                            }`}>
                              {isSelected && (
                                <motion.div 
                                  className="w-3 h-3 bg-white rounded-full"
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
                                  transition={{ duration: 0.2 }}
                                />
                              )}
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-2">
                                <h4 className={`font-semibold ${isSelected ? 'text-emerald-800' : 'text-gray-800'}`}>
                                  {address.name}
                                </h4>
                                {address.isDefault && (
                                  <span className="px-2 py-1 bg-emerald-100 text-emerald-700 text-xs rounded-full">
                                    Default
                                  </span>
                                )}
                                {isSelected && (
                                  <span className="px-2 py-1 bg-emerald-500 text-white text-xs rounded-full">
                                    Selected
                                  </span>
                                )}
                              </div>
                              <p className={`mb-1 ${isSelected ? 'text-gray-700' : 'text-gray-600'}`}>
                                {address.address}
                              </p>
                              <p className={`mb-1 ${isSelected ? 'text-gray-700' : 'text-gray-600'}`}>
                                {address.city}, {address.state} - {address.pincode}
                              </p>
                              <p className={`${isSelected ? 'text-gray-700' : 'text-gray-600'}`}>
                                Phone: {address.phone}
                              </p>
                            </div>
                            
                            {isSelected && (
                              <div className="text-emerald-500 flex-shrink-0">
                                <FiCheckCircle className="w-6 h-6" />
                              </div>
                            )}
                          </div>
                        </motion.div>
                      );
                    })
                  ) : (
                    <div className="text-center py-8">
                      <FiMapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">No addresses found. Please add a new address.</p>
                    </div>
                  )}
                </div>

                {/* Add Address Form */}
                <AnimatePresence>
                  {showAddressForm && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="border-t border-gray-200 pt-6"
                    >
                      <h3 className="text-lg font-semibold text-gray-800 mb-4">Add New Address</h3>
                      <form onSubmit={addAddress} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Full Name *
                            </label>
                            <input
                              type="text"
                              required
                              value={newAddress.name}
                              onChange={(e) => setNewAddress({...newAddress, name: e.target.value})}
                              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Phone Number *
                            </label>
                            <input
                              type="tel"
                              required
                              value={newAddress.phone}
                              onChange={(e) => setNewAddress({...newAddress, phone: e.target.value})}
                              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                            />
                          </div>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Email (Optional)
                          </label>
                          <input
                            type="email"
                            value={newAddress.email}
                            onChange={(e) => setNewAddress({...newAddress, email: e.target.value})}
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Address *
                          </label>
                          <textarea
                            required
                            rows={3}
                            value={newAddress.address}
                            onChange={(e) => setNewAddress({...newAddress, address: e.target.value})}
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              City *
                            </label>
                            <input
                              type="text"
                              required
                              value={newAddress.city}
                              onChange={(e) => setNewAddress({...newAddress, city: e.target.value})}
                              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              State *
                            </label>
                            <input
                              type="text"
                              required
                              value={newAddress.state}
                              onChange={(e) => setNewAddress({...newAddress, state: e.target.value})}
                              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Pincode *
                            </label>
                            <input
                              type="text"
                              required
                              value={newAddress.pincode}
                              onChange={(e) => setNewAddress({...newAddress, pincode: e.target.value})}
                              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                            />
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            id="isDefault"
                            checked={newAddress.isDefault}
                            onChange={(e) => setNewAddress({...newAddress, isDefault: e.target.checked})}
                            className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
                          />
                          <label htmlFor="isDefault" className="text-sm text-gray-700">
                            Set as default address
                          </label>
                        </div>

                        <div className="flex gap-3">
                          <button
                            type="button"
                            onClick={() => setShowAddressForm(false)}
                            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-200"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl hover:from-emerald-600 hover:to-teal-700 transition-all duration-200 shadow-lg"
                          >
                            Save Address
                          </button>
                        </div>
                      </form>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Navigation */}
              <div className="flex justify-between">
                <button
                  onClick={prevStep}
                  className="px-8 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-200"
                >
                  Back to Items
                </button>
                <button
                  onClick={nextStep}
                  disabled={!selectedAddress}
                  className="px-8 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl hover:from-emerald-600 hover:to-teal-700 transition-all duration-200 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Continue to Payment
                </button>
              </div>
            </motion.div>
          )}

          {currentStep === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              {/* Payment Methods */}
              <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-white/30">
                <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                  <FiCreditCard className="w-6 h-6" />
                  Payment Method
                </h2>

                <div className="space-y-4 mb-6">
                  {/* Cash on Delivery */}
                  <div
                    className={`p-4 border-2 rounded-2xl cursor-pointer transition-all duration-200 ${
                      paymentMethod === 'cod' 
                        ? 'border-emerald-500 bg-emerald-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setPaymentMethod('cod')}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <FiDollarSign className={`w-6 h-6 ${paymentMethod === 'cod' ? 'text-emerald-600' : 'text-gray-400'}`} />
                        <div>
                          <h4 className="font-semibold text-gray-800">Cash on Delivery</h4>
                          <p className="text-sm text-gray-600">Pay when your order arrives</p>
                        </div>
                      </div>
                      {paymentMethod === 'cod' && (
                        <FiCheckCircle className="w-5 h-5 text-emerald-500" />
                      )}
                    </div>
                  </div>

                  {/* UPI Payment */}
                  <div
                    className={`p-4 border-2 rounded-2xl cursor-pointer transition-all duration-200 ${
                      paymentMethod === 'upi' 
                        ? 'border-emerald-500 bg-emerald-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setPaymentMethod('upi')}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <FiPhoneCall className={`w-6 h-6 ${paymentMethod === 'upi' ? 'text-emerald-600' : 'text-gray-400'}`} />
                        <div>
                          <h4 className="font-semibold text-gray-800">UPI Payment</h4>
                          <p className="text-sm text-gray-600">Pay using UPI apps like GPay, PhonePe, Paytm</p>
                        </div>
                      </div>
                      {paymentMethod === 'upi' && (
                        <FiCheckCircle className="w-5 h-5 text-emerald-500" />
                      )}
                    </div>
                  </div>
                </div>                {/* UPI Payment Details */}
                <AnimatePresence>
                  {paymentMethod === 'upi' && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="border-t border-gray-200 pt-6"
                    >
                      <h3 className="text-lg font-semibold text-gray-800 mb-4">UPI Payment</h3>
                      
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* QR Code */}
                        <div className="text-center">
                          <h4 className="font-medium text-gray-800 mb-4">Scan QR Code to Pay</h4>
                          <div className="bg-white p-4 rounded-2xl shadow-lg inline-block">
                            <QRCodeSVG 
                              value={generateUPIDeepLink()} 
                              size={200}
                              level="H"
                              includeMargin={true}
                            />
                          </div>
                          <p className="text-sm text-gray-600 mt-2">Scan with any UPI app</p>
                          <p className="text-xs text-gray-500 mt-1">Amount: ₹{total.toFixed(2)}</p>
                        </div>

                        {/* UPI App Links */}
                        <div>
                          <h4 className="font-medium text-gray-800 mb-4">Pay with UPI Apps</h4>
                          <div className="space-y-3">
                            <button
                              onClick={() => window.open(generateUPIDeepLink(), '_blank')}
                              className="w-full p-4 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl hover:from-purple-600 hover:to-purple-700 transition-all duration-200 shadow-lg flex items-center justify-center gap-2"
                            >
                              <FiPhoneCall className="w-5 h-5" />
                              Open UPI App
                            </button>
                              <div className="grid grid-cols-2 gap-2 mt-4">
                              <button
                                onClick={() => window.open(`phonepe://pay?${new URLSearchParams({
                                  pa: 'yourstore@paytm',
                                  pn: 'Your Store',
                                  am: total.toFixed(2),
                                  tr: `TXN${Date.now()}`
                                })}`, '_blank')}
                                className="p-3 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors text-sm"
                              >
                                PhonePe
                              </button>
                              <button
                                onClick={() => window.open(`gpay://upi/pay?${new URLSearchParams({
                                  pa: 'yourstore@paytm',
                                  pn: 'Your Store',
                                  am: total.toFixed(2),
                                  tr: `TXN${Date.now()}`
                                })}`, '_blank')}
                                className="p-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
                              >
                                Google Pay
                              </button>
                            </div>
                          </div>

                          <div className="mt-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Transaction Reference (UTR) *
                            </label>
                            <input
                              type="text"
                              value={utrNumber}
                              onChange={(e) => setUtrNumber(e.target.value)}
                              placeholder="Enter UTR after payment"
                              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                            />
                            <p className="text-xs text-gray-500 mt-1">
                              Complete the payment first, then enter the UTR number from your payment confirmation
                            </p>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>{/* Order Summary */}
                <div className="border-t border-gray-200 pt-6 mt-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Order Summary</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Subtotal:</span>
                      <span className="font-semibold">₹{subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Shipping:</span>
                      <span className={`font-semibold ${subtotal >= 500 ? 'text-green-600' : 'text-gray-800'}`}>
                        {subtotal >= 500 ? 'Free' : '₹100.00'}
                      </span>
                    </div>
                    {discount > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span>Discount:</span>
                        <span className="font-semibold">-₹{discount.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="border-t border-gray-200 pt-3">
                      <div className="flex justify-between text-lg font-bold">
                        <span>Total:</span>
                        <span>₹{total.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Navigation */}
              <div className="flex justify-between">
                <button
                  onClick={prevStep}
                  className="px-8 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-200"
                >
                  Back to Address
                </button>
                <button
                  onClick={nextStep}
                  disabled={paymentMethod === 'upi' && !utrNumber.trim()}
                  className="px-8 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl hover:from-emerald-600 hover:to-teal-700 transition-all duration-200 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Review Order
                </button>
              </div>
            </motion.div>
          )}

          {currentStep === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              {/* Order Confirmation */}
              <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-white/30">
                <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                  <FiCheck className="w-6 h-6" />
                  Review & Confirm Order
                </h2>

                {/* Order Details */}
                <div className="space-y-6">                  {/* Items */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-3">Items ({cart.length})</h3>
                    <div className="space-y-3">                      {cart.map((item, index) => (
                        <div key={item._id || index} className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl">                          <div className="w-12 h-12 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg flex items-center justify-center overflow-hidden">
                            {(item.type === 'combo' ? (item.mainImage || item.products?.[0]?.images?.[0]?.url) : (item.image || (item.images && item.images[0]))) ? (
                              <img 
                                src={item.type === 'combo' 
                                  ? (item.mainImage || item.products?.[0]?.images?.[0] || '/placeholder.png')
                                  : (item.image || item.images[0] || '/placeholder.png')
                                } 
                                alt={item.name || 'Product'}
                                className="w-full h-full object-cover rounded-lg"
                              />
                            ) : (
                              <FiShoppingCart className="w-4 h-4 text-gray-600" />
                            )}
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-800">
                              {item.name || 'Product'}
                            </h4>
                            {item.selectedVariant && (
                              <p className="text-xs text-emerald-600 font-medium">
                                Variant: {item.selectedVariant.label || item.selectedVariant.name}
                              </p>
                            )}
                            <p className="text-sm text-gray-600">₹{item.price || 0} × {item.qty || 1}</p>
                          </div>
                          <p className="font-semibold text-gray-800 text-sm">
                            ₹{((item.qty || 1) * (item.price || 0)).toFixed(2)}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Delivery Address */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-3">Delivery Address</h3>
                    <div className="p-4 bg-gray-50 rounded-xl">
                      <h4 className="font-medium text-gray-800">{selectedAddress?.name}</h4>
                      <p className="text-gray-600 text-sm mt-1">{selectedAddress?.address}</p>
                      <p className="text-gray-600 text-sm">{selectedAddress?.city}, {selectedAddress?.state} - {selectedAddress?.pincode}</p>
                      <p className="text-gray-600 text-sm">Phone: {selectedAddress?.phone}</p>
                    </div>
                  </div>

                  {/* Payment Method */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-3">Payment Method</h3>
                    <div className="p-4 bg-gray-50 rounded-xl">
                      <div className="flex items-center gap-3">
                        {paymentMethod === 'cod' ? (
                          <>
                            <FiDollarSign className="w-5 h-5 text-emerald-600" />
                            <div>
                              <h4 className="font-medium text-gray-800">Cash on Delivery</h4>
                              <p className="text-sm text-gray-600">Pay when your order arrives</p>
                            </div>
                          </>
                        ) : (
                          <>
                            <FiPhoneCall className="w-5 h-5 text-emerald-600" />
                            <div>
                              <h4 className="font-medium text-gray-800">UPI Payment</h4>
                              <p className="text-sm text-gray-600">UTR: {utrNumber}</p>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Applied Coupon */}
                  {appliedCoupon && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-3">Applied Coupon</h3>
                      <div className="p-4 bg-green-50 border border-green-200 rounded-xl">
                        <div className="flex items-center gap-3">
                          <FiTag className="w-5 h-5 text-green-600" />
                          <div>
                            <h4 className="font-medium text-green-800">{appliedCoupon.code}</h4>                            <p className="text-sm text-green-600">
                              {appliedCoupon.description || 
                                (appliedCoupon.type === 'percent' 
                                  ? `${appliedCoupon.amount}% off` 
                                  : `₹${appliedCoupon.amount} off`)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Applied Coin Discount */}
                  {coinDiscount && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-3">Indira Coins Applied</h3>
                      <div className="p-4 bg-green-50 border border-green-200 rounded-xl">
                        <div className="flex items-center gap-3">
                          <FiCheckCircle className="w-5 h-5 text-green-600" />
                          <div>
                            <h4 className="font-medium text-green-800">{coinDiscount.coinsUsed} coins used</h4>
                            <p className="text-sm text-green-600">
                              ₹{coinDiscount.discountAmount} discount applied
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}                  {/* Final Total */}
                  <div className="border-t border-gray-200 pt-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-3">Payment Summary</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Subtotal:</span>
                        <span className="font-semibold">₹{subtotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Shipping:</span>
                        <span className={`font-semibold ${subtotal >= 500 ? 'text-green-600' : 'text-gray-800'}`}>
                          {subtotal >= 500 ? 'Free' : '₹100.00'}
                        </span>
                      </div>
                      {discount > 0 && (
                        <div className="flex justify-between text-green-600">
                          <span>Discount:</span>
                          <span className="font-semibold">-₹{discount.toFixed(2)}</span>
                        </div>
                      )}
                      {coinDiscount && coinDiscount.discountAmount > 0 && (
                        <div className="flex justify-between text-green-600">
                          <span>Indira Coins ({coinDiscount.coinsUsed} coins):</span>
                          <span className="font-semibold">-₹{coinDiscount.discountAmount.toFixed(2)}</span>
                        </div>
                      )}
                      <div className="border-t border-gray-200 pt-3">
                        <div className="flex justify-between text-xl font-bold">
                          <span>Total Amount:</span>
                          <span>₹{total.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Navigation */}
              <div className="flex justify-between">
                <button
                  onClick={prevStep}
                  className="px-8 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-200"
                >
                  Back to Payment
                </button>
                <button
                  onClick={placeOrder}
                  className="px-8 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl hover:from-emerald-600 hover:to-teal-700 transition-all duration-200 shadow-lg flex items-center gap-2"
                >
                  <FiCheck className="w-5 h-5" />
                  Place Order
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Order Processing Modal */}
        <AnimatePresence>
          {showPaymentModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-3xl p-8 max-w-md w-full text-center shadow-2xl"
              >
                {orderProcessing ? (
                  <div>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                      className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full mx-auto mb-4"
                    />
                    <h3 className="text-xl font-bold text-gray-800 mb-2">Processing Your Order</h3>
                    <p className="text-gray-600">Please wait while we place your order...</p>
                  </div>
                ) : orderResult ? (
                  <div>                    {orderResult.success ? (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center relative overflow-hidden"
                      >
                        {/* Confetti Effect */}
                        <div className="absolute inset-0 pointer-events-none">
                          {[...Array(20)].map((_, i) => (
                            <motion.div
                              key={i}
                              initial={{ 
                                y: -20, 
                                x: Math.random() * 400 - 200,
                                rotate: 0,
                                opacity: 1
                              }}
                              animate={{ 
                                y: 400, 
                                rotate: 360,
                                opacity: 0
                              }}
                              transition={{ 
                                duration: 3,
                                delay: i * 0.1,
                                ease: "easeOut"
                              }}
                              className={`absolute w-3 h-3 ${
                                i % 4 === 0 ? 'bg-emerald-500' :
                                i % 4 === 1 ? 'bg-yellow-500' :
                                i % 4 === 2 ? 'bg-pink-500' : 'bg-blue-500'
                              }`}
                              style={{
                                clipPath: i % 2 === 0 ? 'polygon(50% 0%, 0% 100%, 100% 100%)' : 'circle(50%)'
                              }}
                            />
                          ))}
                        </div>

                        {/* Success Icon with Pulse Animation */}
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ 
                            delay: 0.3, 
                            type: "spring",
                            stiffness: 200,
                            damping: 10
                          }}
                          className="relative mx-auto mb-6"
                        >
                          <motion.div
                            animate={{ 
                              scale: [1, 1.2, 1],
                              boxShadow: [
                                "0 0 0 0 rgba(34, 197, 94, 0.4)",
                                "0 0 0 20px rgba(34, 197, 94, 0)",
                                "0 0 0 0 rgba(34, 197, 94, 0)"
                              ]
                            }}
                            transition={{ 
                              duration: 2,
                              repeat: Infinity,
                              ease: "easeInOut"
                            }}
                            className="w-20 h-20 bg-gradient-to-r from-emerald-500 to-green-600 rounded-full flex items-center justify-center"
                          >
                            <FiCheckCircle className="w-10 h-10 text-white" />
                          </motion.div>
                        </motion.div>

                        {/* Success Message with Typewriter Effect */}
                        <motion.h3 
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.6 }}
                          className="text-2xl font-bold text-gray-800 mb-3"
                        >
                          🎉 Order Placed Successfully!
                        </motion.h3>

                        <motion.p 
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.8 }}
                          className="text-gray-600 mb-6 text-lg"
                        >
                          {orderResult.message}
                        </motion.p>

                        {/* Order Details Card */}
                        <motion.div
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 1 }}
                          className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl p-6 mb-6 border border-emerald-200"
                        >
                          <div className="flex items-center justify-center gap-3 mb-4">
                            <div className="w-12 h-12 bg-emerald-500 rounded-xl flex items-center justify-center">
                              <FiPackage className="w-6 h-6 text-white" />
                            </div>
                            <div>
                              <p className="text-sm text-gray-600">Order ID</p>
                              <p className="font-bold text-emerald-800">#{orderResult.orderId?.slice(-8)}</p>
                            </div>
                          </div>
                          
                          <div className="space-y-2 text-sm text-gray-700">
                            <div className="flex justify-between">
                              <span>📧 Confirmation sent to:</span>
                              <span className="font-medium">{userEmail || 'your email'}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>📱 Order tracking:</span>
                              <span className="font-medium text-emerald-600">Available shortly</span>
                            </div>
                            <div className="flex justify-between">
                              <span>🚚 Estimated delivery:</span>
                              <span className="font-medium">3-5 business days</span>
                            </div>
                          </div>
                        </motion.div>

                        {/* Progress Indicator */}
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 1.2 }}
                          className="mb-6"
                        >
                          <div className="flex items-center justify-center gap-2 mb-2">
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                              className="w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full"
                            />
                            <span className="text-sm text-gray-600">Redirecting to order details...</span>
                          </div>
                          
                          {/* Progress Bar */}
                          <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: "100%" }}
                              transition={{ duration: 3, ease: "easeInOut" }}
                              className="bg-gradient-to-r from-emerald-500 to-teal-500 h-2 rounded-full"
                            />
                          </div>
                        </motion.div>

                        {/* Quick Actions */}
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 1.4 }}
                          className="flex gap-3 justify-center"
                        >
                          <button
                            onClick={() => navigate(`/orders/${orderResult.orderId}`)}
                            className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-all duration-200 text-sm font-medium"
                          >
                            <FiEye className="w-4 h-4" />
                            View Order
                          </button>
                          <button
                            onClick={() => navigate('/products')}
                            className="flex items-center gap-2 px-4 py-2 border border-emerald-500 text-emerald-600 rounded-lg hover:bg-emerald-50 transition-all duration-200 text-sm font-medium"
                          >
                            <FiShoppingBag className="w-4 h-4" />
                            Continue Shopping
                          </button>                        </motion.div>
                      </motion.div>
                    ) : (
                      <>
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: 0.2, type: "spring" }}
                          className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4"
                        >
                          <FiXCircle className="w-8 h-8 text-red-600" />
                        </motion.div>
                        <h3 className="text-xl font-bold text-gray-800 mb-2">Order Failed</h3>
                        <p className="text-gray-600 mb-6">{orderResult.message}</p>
                        <button
                          onClick={() => setShowPaymentModal(false)}
                          className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl hover:from-emerald-600 hover:to-teal-700 transition-all duration-200 shadow-lg"
                        >
                          Try Again
                        </button>
                      </>
                    )}
                  </div>
                ) : null}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Checkout;
