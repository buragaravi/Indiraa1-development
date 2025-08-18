import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';
import { toast } from 'react-hot-toast';
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
  FiNavigation,
  FiPhone,
  FiShield,
  FiTruck
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
  const [orderResult, setOrderResult] = useState(null);
  const [clickedAddress, setClickedAddress] = useState(null); // Track which address was just clicked
  const [updatingItems, setUpdatingItems] = useState(new Set()); // Track items being updated
  const [subtotal, setSubtotal] = useState(0);
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

  // Debug useEffect to monitor address selection
  useEffect(() => {
    console.log('[DEBUG] Selected address changed:', selectedAddress);
    console.log('[DEBUG] Available addresses:', addresses);
    
    // Show a brief confirmation when address is selected
    if (selectedAddress && addresses.length > 0) {
      console.log(`[CONFIRMATION] Address selected: ${selectedAddress.name}`);
    }
  }, [selectedAddress, addresses]);

  // Helper function to check if two addresses are the same
  const isSameAddress = (addr1, addr2) => {
    if (!addr1 || !addr2) return false;
    
    // Try _id comparison first (if available)
    if (addr1._id && addr2._id) {
      return addr1._id.toString() === addr2._id.toString();
    }
    
    // Fallback to content-based comparison
    return (
      addr1.name === addr2.name && 
      addr1.address === addr2.address && 
      addr1.phone === addr2.phone &&
      addr1.city === addr2.city &&
      addr1.state === addr2.state &&
      addr1.pincode === addr2.pincode
    );
  };

  // Helper function to generate item key for cart operations
  const getItemKey = (itemId, variantId = null) => {
    return variantId ? `${itemId}-${variantId}` : itemId;
  };

  // Helper function to check if item matches for cart operations
  const isMatchingItem = (item, itemId, variantId = null) => {
    if (variantId) {
      return item.selectedVariant?.id === variantId && item._id === itemId;
    }
    return item._id === itemId;
  };

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
          const productResponse = await fetch(`https://indiraa1-backend.onrender.com/api/products/${productId}`);
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
        const cartResponse = await fetch('https://indiraa1-backend.onrender.com/api/products/cart/me', {
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
        const userResponse = await fetch('https://indiraa1-backend.onrender.com/api/auth/me', {
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
            console.log('Auto-selecting first address:', userData.user.addresses[0]); // Debug log
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
      const response = await fetch('https://indiraa1-backend.onrender.com/api/coupons/validate', {
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

  const updateCartQuantity = async (itemId, newQty, variantId = null, itemType = 'product') => {
    if (newQty < 1) return;
    
    const itemKey = getItemKey(itemId, variantId);
    if (updatingItems.has(itemKey)) return; // Prevent multiple updates
    
    setUpdatingItems(prev => new Set(prev).add(itemKey));
    
    try {
      const requestBody = { qty: newQty, type: itemType };
      
      if (itemType === 'combo') {
        requestBody.comboPackId = itemId;
      } else {
        requestBody.productId = itemId;
        if (variantId) {
          requestBody.variantId = variantId;
        }
      }

      const response = await fetch('https://indiraa1-backend.onrender.com/api/products/cart/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(requestBody)
      });

      if (response.ok) {
        // Update local cart state for better UX
        setCart(prevCart => prevCart.map(item => {
          if (isMatchingItem(item, itemId, variantId)) {
            return { ...item, qty: newQty };
          }
          return item;
        }));
        
        console.log(`[CART] Updated quantity for ${itemType} ${itemId}${variantId ? ` (variant: ${variantId})` : ''} to ${newQty}`);
        toast.success('Quantity updated');
      } else {
        const errorData = await response.json();
        console.error('Error updating quantity:', errorData);
        toast.error('Failed to update quantity');
      }
    } catch (error) {
      console.error('Error updating quantity:', error);
      toast.error('Error updating quantity');
    } finally {
      setUpdatingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(itemKey);
        return newSet;
      });
    }
  };

  const removeFromCart = async (itemId, variantId = null, itemType = 'product') => {
    const itemKey = getItemKey(itemId, variantId);
    if (updatingItems.has(itemKey)) return; // Prevent multiple updates
    
    setUpdatingItems(prev => new Set(prev).add(itemKey));
    
    try {
      const requestBody = { type: itemType };
      
      if (itemType === 'combo') {
        requestBody.comboPackId = itemId;
      } else {
        requestBody.productId = itemId;
        if (variantId) {
          requestBody.variantId = variantId;
        }
      }

      const response = await fetch('https://indiraa1-backend.onrender.com/api/products/cart/remove', {
        method: 'POST', // Changed from DELETE to POST to match Cart.jsx
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(requestBody)
      });

      if (response.ok) {
        // Update local cart state
        setCart(prevCart => prevCart.filter(item => !isMatchingItem(item, itemId, variantId)));
        
        console.log(`[CART] Removed ${itemType} ${itemId}${variantId ? ` (variant: ${variantId})` : ''} from cart`);
        toast.success('Item removed from cart');
      } else {
        const errorData = await response.json();
        console.error('Error removing item:', errorData);
        toast.error('Failed to remove item');
      }
    } catch (error) {
      console.error('Error removing item:', error);
      toast.error('Error removing item');
    } finally {
      setUpdatingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(itemKey);
        return newSet;
      });
    }
  };
  const addAddress = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('https://indiraa1-backend.onrender.com/api/auth/address/add', {
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
      await new Promise(resolve => setTimeout(resolve, 1000));        
      const orderData = {
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

      const response = await fetch('https://indiraa1-backend.onrender.com/api/products/orders', {
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
            const clearCartResponse = await fetch('https://indiraa1-backend.onrender.com/api/products/cart/clear', {
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
      <div className="checkout-loading-bg">
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
    <div className="checkout-main-bg">
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
              className="checkout-progress-bar"
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
                    >                      <div className="relative w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex items-center justify-center overflow-hidden shadow-inner">
                        {(item.type === 'combo' ? (item.mainImage || item.products?.[0]?.images?.[0]?.url) : (item.image || (item.images && item.images[0]))) ? (
                          <>
                            <img 
                              src={item.type === 'combo' 
                                ? (item.mainImage || item.products?.[0]?.images?.[0] || '/placeholder.png')
                                : (item.image || item.images[0] || '/placeholder.png')
                              } 
                              alt={item.name || 'Product'}
                              className="w-full h-full object-cover rounded-xl transition-transform duration-200 hover:scale-105"
                              onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'flex';
                              }}
                            />
                            <div className="hidden w-full h-full absolute inset-0 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-xl flex items-center justify-center">
                              <FiShoppingCart className="w-6 h-6 text-emerald-600" />
                            </div>
                          </>
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-xl flex items-center justify-center">
                            <FiShoppingCart className="w-6 h-6 text-emerald-600" />
                          </div>
                        )}
                        {item.type === 'combo' && (
                          <div className="absolute -top-1 -right-1 bg-emerald-500 text-white text-xs px-1.5 py-0.5 rounded-full font-medium shadow-lg">
                            COMBO
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-gray-800 truncate">
                          {item.name || 'Product'}
                        </h4>
                        {item.selectedVariant && (
                          <div className="flex items-center gap-1 mt-1">
                            <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                            <p className="text-xs text-emerald-600 font-medium">
                              {item.selectedVariant.label || item.selectedVariant.name}
                            </p>
                          </div>
                        )}
                        <p className="text-sm text-gray-600 mt-1">
                          ₹{item.price || 0} each
                        </p>
                        {item.type === 'combo' && item.products?.length > 1 && (
                          <p className="text-xs text-blue-600 font-medium mt-1">
                            {item.products.length} items included
                          </p>
                        )}
                      </div>
                        {/* Quantity Controls */}
                      <div className="flex items-center gap-3">
                        {!item.isDirect && (
                          <div className="flex items-center gap-2 bg-white rounded-lg p-1">
                            <button
                              onClick={() => updateCartQuantity(item._id, (item.qty || 1) - 1, item.selectedVariant?.id, item.type)}
                              disabled={item.qty <= 1 || updatingItems.has(getItemKey(item._id, item.selectedVariant?.id))}
                              className="w-8 h-8 flex items-center justify-center rounded-md bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {updatingItems.has(getItemKey(item._id, item.selectedVariant?.id)) ? (
                                <div className="w-3 h-3 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                              ) : (
                                <FiMinus className="w-4 h-4" />
                              )}
                            </button>
                            <span className="w-8 text-center font-medium">{item.qty || 1}</span>
                            <button
                              onClick={() => updateCartQuantity(item._id, (item.qty || 1) + 1, item.selectedVariant?.id, item.type)}
                              disabled={item.qty >= (item.selectedVariant?.stock || item.stock) || updatingItems.has(getItemKey(item._id, item.selectedVariant?.id))}
                              className="w-8 h-8 flex items-center justify-center rounded-md bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {updatingItems.has(getItemKey(item._id, item.selectedVariant?.id)) ? (
                                <div className="w-3 h-3 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                              ) : (
                                <FiPlus className="w-4 h-4" />
                              )}
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
                            onClick={() => removeFromCart(item._id, item.selectedVariant?.id, item.type)}
                            disabled={updatingItems.has(getItemKey(item._id, item.selectedVariant?.id))}
                            className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {updatingItems.has(getItemKey(item._id, item.selectedVariant?.id)) ? (
                              <div className="w-3 h-3 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
                            ) : (
                              <FiTrash2 className="w-4 h-4" />
                            )}
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
                        className="px-6 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-200 flex items-center gap-2"
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
                  className="px-8 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors duration-200 shadow-lg"
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
                    className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors duration-200 flex items-center gap-2 shadow-md"
                  >
                    <FiPlus className="w-4 h-4" />
                    Add New Address
                  </button>
                </div>                {/* Address List */}
                <div className="space-y-4 mb-6">
                  {/* Selected Address Indicator */}
                  {selectedAddress && (
                    <motion.div 
                      className="p-3 bg-green-100 border border-green-300 rounded-xl"
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="flex items-center gap-2">
                        <FiCheckCircle className="w-4 h-4 text-green-600" />
                        <span className="text-sm font-medium text-green-800">
                          Selected: {selectedAddress.name}
                        </span>
                      </div>
                    </motion.div>
                  )}
                  
                  {console.log('Current selectedAddress:', selectedAddress)} {/* Debug log */}
                  {addresses.length > 0 ? (
                    addresses.map((address, index) => {
                      // Use the helper function for more robust comparison
                      const isSelected = isSameAddress(selectedAddress, address);
                      const isJustClicked = isSameAddress(clickedAddress, address);
                      
                      return (
                        <motion.div
                          key={address._id || `${address.name}-${address.phone}-${index}`}
                          className={`p-5 border-2 rounded-2xl cursor-pointer transition-all duration-300 relative overflow-hidden ${
                            isSelected 
                              ? 'border-green-500 bg-green-50 shadow-xl ring-4 ring-green-100 transform scale-[1.02]' 
                              : isJustClicked
                              ? 'border-blue-400 bg-blue-50 shadow-lg ring-2 ring-blue-200 transform scale-[1.01]'
                              : 'border-gray-200 hover:border-green-300 hover:shadow-lg bg-white hover:bg-green-50/30'
                          }`}
                          onClick={() => {
                            console.log('[CLICK] Selecting address:', address._id || 'no-id', address); // Debug log
                            console.log('[CLICK] Current selectedAddress before:', selectedAddress); // Debug log
                            
                            // Immediate visual feedback
                            setClickedAddress(address);
                            setTimeout(() => setClickedAddress(null), 500);
                            
                            setSelectedAddress(address);
                            console.log('[CLICK] Address selection triggered for:', address.name); // Debug log
                          }}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          whileHover={{ scale: 1.01 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          {/* Selection indicator overlay */}
                          {isSelected && (
                            <motion.div
                              className="absolute inset-0 bg-gradient-to-r from-green-400/10 to-emerald-400/10 pointer-events-none"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ duration: 0.3 }}
                            />
                          )}
                          <div className="flex items-start gap-4">
                            {/* Enhanced Radio button style selector */}
                            <motion.div 
                              className={`relative w-8 h-8 rounded-full border-3 flex items-center justify-center mt-0.5 flex-shrink-0 transition-all duration-300 ${
                                isSelected 
                                  ? 'border-green-500 bg-green-500 shadow-lg ring-4 ring-green-200' 
                                  : 'border-gray-300 bg-white hover:border-green-400 hover:bg-green-50'
                              }`}
                              animate={isSelected ? { 
                                boxShadow: [
                                  "0 0 0 0 rgba(34, 197, 94, 0.4)",
                                  "0 0 0 8px rgba(34, 197, 94, 0)",
                                  "0 0 0 0 rgba(34, 197, 94, 0)"
                                ]
                              } : {}}
                              transition={{ 
                                duration: 1.5,
                                repeat: isSelected ? Infinity : 0,
                                ease: "easeInOut"
                              }}
                            >
                              {isSelected && (
                                <motion.div 
                                  className="w-4 h-4 bg-white rounded-full shadow-sm"
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
                                  transition={{ duration: 0.3, type: "spring" }}
                                />
                              )}
                              
                              {/* Check mark overlay for extra confirmation */}
                              {isSelected && (
                                <motion.div
                                  className="absolute inset-0 flex items-center justify-center"
                                  initial={{ opacity: 0, scale: 0 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  transition={{ delay: 0.2, duration: 0.3 }}
                                >
                                  <FiCheckCircle className="w-3 h-3 text-green-600" />
                                </motion.div>
                              )}
                            </motion.div>
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-3 mb-3">
                                <h4 className={`font-bold text-lg ${isSelected ? 'text-green-800' : 'text-gray-800'}`}>
                                  {address.name}
                                </h4>
                                {address.isDefault && (
                                  <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs rounded-full font-medium">
                                    Default
                                  </span>
                                )}
                                {isSelected && (
                                  <motion.span 
                                    className="px-3 py-1 bg-green-500 text-white text-xs rounded-full font-bold shadow-md"
                                    initial={{ scale: 0, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{ duration: 0.3, delay: 0.1 }}
                                  >
                                    ✓ SELECTED
                                  </motion.span>
                                )}
                              </div>
                              <p className={`mb-2 text-base ${isSelected ? 'text-gray-700 font-medium' : 'text-gray-600'}`}>
                                {address.address}
                              </p>
                              <p className={`mb-2 text-base ${isSelected ? 'text-gray-700 font-medium' : 'text-gray-600'}`}>
                                {address.city}, {address.state} - {address.pincode}
                              </p>
                              <p className={`text-sm ${isSelected ? 'text-green-700 font-medium' : 'text-gray-600'}`}>
                                <FiPhoneCall className="w-3 h-3 inline mr-1" />
                                Phone: {address.phone}
                              </p>
                            </div>
                            
                            {isSelected && (
                              <div className="text-green-500 flex-shrink-0">
                                <FiCheckCircle className="w-7 h-7" />
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
                            className="px-6 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-colors duration-200 shadow-lg"
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
                  className={`px-8 py-3 rounded-xl font-semibold transition-colors duration-200 shadow-lg ${
                    selectedAddress 
                      ? 'bg-green-600 text-white hover:bg-green-700' 
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
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
                              className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors duration-200 flex items-center justify-center gap-2 shadow-md"
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
                  className={`px-8 py-3 rounded-xl font-semibold transition-colors duration-200 shadow-lg ${
                    (paymentMethod === 'upi' && !utrNumber.trim())
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-green-600 text-white hover:bg-green-700'
                  }`}
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
                    <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                      <FiShoppingCart className="w-5 h-5 text-emerald-600" />
                      Items ({cart.length})
                    </h3>
                    <div className="space-y-3">                      {cart.map((item, index) => (
                        <motion.div 
                          key={item._id || index} 
                          className="flex items-center gap-4 p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200 hover:shadow-md transition-all duration-200"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                        >
                          <div className="relative w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex items-center justify-center overflow-hidden shadow-inner">
                            {(item.type === 'combo' ? (item.mainImage || item.products?.[0]?.images?.[0]?.url) : (item.image || (item.images && item.images[0]))) ? (
                              <>
                                <img 
                                  src={item.type === 'combo' 
                                    ? (item.mainImage || item.products?.[0]?.images?.[0] || '/placeholder.png')
                                    : (item.image || item.images[0] || '/placeholder.png')
                                  } 
                                  alt={item.name || 'Product'}
                                  className="w-full h-full object-cover rounded-xl transition-transform duration-200 hover:scale-105"
                                  onError={(e) => {
                                    e.target.style.display = 'none';
                                    e.target.nextSibling.style.display = 'flex';
                                  }}
                                />
                                <div className="hidden w-full h-full absolute inset-0 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-xl flex items-center justify-center">
                                  <FiShoppingCart className="w-6 h-6 text-emerald-600" />
                                </div>
                              </>
                            ) : (
                              <div className="w-full h-full bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-xl flex items-center justify-center">
                                <FiShoppingCart className="w-6 h-6 text-emerald-600" />
                              </div>
                            )}
                            {item.type === 'combo' && (
                              <div className="absolute -top-1 -right-1 bg-emerald-500 text-white text-xs px-1.5 py-0.5 rounded-full font-medium shadow-lg">
                                COMBO
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-gray-800 text-sm truncate">
                              {item.name || 'Product'}
                            </h4>
                            {item.selectedVariant && (
                              <div className="flex items-center gap-1 mt-1">
                                <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                                <p className="text-xs text-emerald-600 font-medium">
                                  {item.selectedVariant.label || item.selectedVariant.name}
                                </p>
                              </div>
                            )}
                            <p className="text-sm text-gray-600 mt-1">
                              ₹{item.price || 0} × {item.qty || 1}
                            </p>
                            {item.type === 'combo' && item.products?.length > 1 && (
                              <p className="text-xs text-blue-600 font-medium mt-1">
                                {item.products.length} items included
                              </p>
                            )}
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-gray-800 text-sm">
                              ₹{((item.qty || 1) * (item.price || 0)).toFixed(2)}
                            </p>
                            <div className="flex items-center justify-end gap-1 mt-1">
                              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                              <span className="text-xs text-gray-500">Confirmed</span>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  {/* Delivery Address */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                      <FiMapPin className="w-5 h-5 text-emerald-600" />
                      Delivery Address
                    </h3>
                    <motion.div 
                      className="p-5 bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200 rounded-xl"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg">
                          <FiHome className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-800 flex items-center gap-2">
                            {selectedAddress?.name}
                            {selectedAddress?.isDefault && (
                              <span className="bg-emerald-100 text-emerald-700 text-xs px-2 py-1 rounded-full font-medium">
                                Default
                              </span>
                            )}
                          </h4>
                          <p className="text-gray-700 text-sm mt-1 leading-relaxed">{selectedAddress?.address}</p>
                          <p className="text-gray-600 text-sm mt-1">
                            📍 {selectedAddress?.city}, {selectedAddress?.state} - {selectedAddress?.pincode}
                          </p>
                          <div className="flex items-center gap-4 mt-2">
                            <div className="flex items-center gap-1">
                              <FiPhone className="w-4 h-4 text-emerald-600" />
                              <span className="text-sm text-gray-600">{selectedAddress?.phone}</span>
                            </div>
                            {selectedAddress?.email && (
                              <div className="flex items-center gap-1">
                                <FiMail className="w-4 h-4 text-emerald-600" />
                                <span className="text-sm text-gray-600">{selectedAddress?.email}</span>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-1">
                            <FiCheckCircle className="w-4 h-4 text-emerald-500" />
                            <span className="text-xs text-emerald-600 font-medium">Verified</span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  </div>

                  {/* Payment Method */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                      <FiCreditCard className="w-5 h-5 text-emerald-600" />
                      Payment Method
                    </h3>
                    <motion.div 
                      className="p-5 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3, delay: 0.1 }}
                    >
                      <div className="flex items-center gap-4">
                        {paymentMethod === 'cod' ? (
                          <>
                            <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
                              <FiDollarSign className="w-6 h-6 text-white" />
                            </div>
                            <div className="flex-1">
                              <h4 className="font-semibold text-gray-800 flex items-center gap-2">
                                Cash on Delivery
                                <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full font-medium">
                                  COD
                                </span>
                              </h4>
                              <p className="text-sm text-gray-600 mt-1">Pay when your order arrives at your doorstep</p>
                              <div className="flex items-center gap-2 mt-2">
                                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                <span className="text-xs text-green-600 font-medium">No advance payment required</span>
                              </div>
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center shadow-lg">
                              <FiPhoneCall className="w-6 h-6 text-white" />
                            </div>
                            <div className="flex-1">
                              <h4 className="font-semibold text-gray-800 flex items-center gap-2">
                                UPI Payment
                                <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full font-medium">
                                  PAID
                                </span>
                              </h4>
                              <p className="text-sm text-gray-600 mt-1">Payment completed via UPI</p>
                              <div className="flex items-center gap-2 mt-2">
                                <FiCheckCircle className="w-4 h-4 text-green-500" />
                                <span className="text-xs text-green-600 font-medium">UTR: {utrNumber}</span>
                              </div>
                            </div>
                          </>
                        )}
                        <div className="text-right">
                          <div className="flex items-center gap-1">
                            <FiShield className="w-4 h-4 text-blue-500" />
                            <span className="text-xs text-blue-600 font-medium">Secure</span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  </div>

                  {/* Applied Coupon */}
                  {appliedCoupon && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                        <FiTag className="w-5 h-5 text-emerald-600" />
                        Applied Coupon
                      </h3>
                      <motion.div 
                        className="p-5 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3, delay: 0.2 }}
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
                            <FiTag className="w-6 h-6 text-white" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-green-800 flex items-center gap-2">
                              {appliedCoupon.code}
                              <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full font-medium">
                                ACTIVE
                              </span>
                            </h4>                            <p className="text-sm text-green-600 mt-1">
                              {appliedCoupon.description || 
                                (appliedCoupon.type === 'percent' 
                                  ? `${appliedCoupon.amount}% discount applied` 
                                  : `₹${appliedCoupon.amount} discount applied`)}
                            </p>
                          </div>
                          <div className="text-right">
                            <div className="flex items-center gap-1">
                              <FiPercent className="w-4 h-4 text-green-500" />
                              <span className="text-sm font-bold text-green-700">
                                -₹{discount.toFixed(2)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    </div>
                  )}

                  {/* Applied Coin Discount */}
                  {coinDiscount && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                        <FiCheckCircle className="w-5 h-5 text-emerald-600" />
                        Indira Coins Applied
                      </h3>
                      <motion.div 
                        className="p-5 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-xl"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3, delay: 0.3 }}
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full flex items-center justify-center shadow-lg">
                            <FiCheckCircle className="w-6 h-6 text-white" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-emerald-800 flex items-center gap-2">
                              {coinDiscount.coinsUsed} Indira Coins Used
                              <span className="bg-emerald-100 text-emerald-700 text-xs px-2 py-1 rounded-full font-medium">
                                REDEEMED
                              </span>
                            </h4>
                            <p className="text-sm text-emerald-600 mt-1">
                              ₹{coinDiscount.discountAmount} discount from your coin balance
                            </p>
                            <div className="flex items-center gap-2 mt-2">
                              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                              <span className="text-xs text-emerald-600 font-medium">Coins deducted from wallet</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="flex items-center gap-1">
                              <span className="text-lg font-bold text-emerald-700">
                                -₹{coinDiscount.discountAmount.toFixed(2)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    </div>
                  )}                  {/* Final Total */}
                  <div className="border-t border-gray-200 pt-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                      <FiDollarSign className="w-5 h-5 text-emerald-600" />
                      Payment Summary
                    </h3>
                    <motion.div 
                      className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-5 border border-gray-200"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: 0.4 }}
                    >
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600 flex items-center gap-2">
                            <FiShoppingCart className="w-4 h-4" />
                            Subtotal:
                          </span>
                          <span className="font-semibold text-gray-800">₹{subtotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600 flex items-center gap-2">
                            <FiTruck className="w-4 h-4" />
                            Shipping:
                          </span>
                          <span className={`font-semibold ${subtotal >= 500 ? 'text-green-600' : 'text-gray-800'} flex items-center gap-1`}>
                            {subtotal >= 500 ? (
                              <>
                                <FiCheckCircle className="w-4 h-4 text-green-500" />
                                Free
                              </>
                            ) : (
                              '₹100.00'
                            )}
                          </span>
                        </div>
                        {discount > 0 && (
                          <div className="flex justify-between items-center text-green-600">
                            <span className="flex items-center gap-2">
                              <FiTag className="w-4 h-4" />
                              Coupon Discount:
                            </span>
                            <span className="font-semibold">-₹{discount.toFixed(2)}</span>
                          </div>
                        )}
                        {coinDiscount && coinDiscount.discountAmount > 0 && (
                          <div className="flex justify-between items-center text-emerald-600">
                            <span className="flex items-center gap-2">
                              <FiCheckCircle className="w-4 h-4" />
                              Indira Coins ({coinDiscount.coinsUsed} coins):
                            </span>
                            <span className="font-semibold">-₹{coinDiscount.discountAmount.toFixed(2)}</span>
                          </div>
                        )}
                        <div className="border-t border-gray-300 pt-3 mt-3">
                          <div className="flex justify-between items-center">
                            <span className="text-xl font-bold text-gray-800 flex items-center gap-2">
                              <FiCreditCard className="w-5 h-5 text-emerald-600" />
                              Total Amount:
                            </span>
                            <motion.span 
                              className="text-2xl font-bold text-emerald-600"
                              initial={{ scale: 0.9 }}
                              animate={{ scale: 1 }}
                              transition={{ duration: 0.3, delay: 0.5 }}
                            >
                              ₹{total.toFixed(2)}
                            </motion.span>
                          </div>
                          <div className="flex items-center justify-end gap-2 mt-2">
                            <FiShield className="w-4 h-4 text-blue-500" />
                            <span className="text-sm text-blue-600 font-medium">100% Secure Payment</span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
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
                  className="px-8 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-colors duration-200 shadow-lg flex items-center gap-2"
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
                            className="checkout-success-circle"
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
                          className="checkout-success-card"
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
                              className="checkout-success-progress"
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
                          className="px-8 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-colors duration-200 shadow-lg"
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
