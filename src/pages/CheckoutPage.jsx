import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiShoppingCart, FiCreditCard, FiMapPin, FiCoins, FiCheck } from 'react-icons/fi';
import toast from 'react-hot-toast';
import CoinRedemptionWidget from '../components/Checkout/CoinRedemptionWidget';

const CheckoutPage = () => {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [orderTotal, setOrderTotal] = useState(0);
  const [coinDiscount, setCoinDiscount] = useState(null);
  const [finalAmount, setFinalAmount] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    fetchCartItems();
  }, []);

  useEffect(() => {
    calculateOrderTotal();
  }, [cartItems, coinDiscount]);

  const fetchCartItems = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await fetch('http://localhost:5001/api/products/cart/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setCartItems(data.cart || []);
      } else {
        throw new Error('Failed to fetch cart');
      }
    } catch (error) {
      console.error('Error fetching cart:', error);
      toast.error('Failed to load cart items');
    } finally {
      setLoading(false);
    }
  };

  const calculateOrderTotal = () => {
    const subtotal = cartItems.reduce((total, item) => {
      const price = item.variantPrice || item.product?.price || 0;
      return total + (price * item.quantity);
    }, 0);
    
    setOrderTotal(subtotal);
    
    // Calculate final amount after coin discount
    const discountAmount = coinDiscount?.discountAmount || 0;
    setFinalAmount(subtotal - discountAmount);
  };

  const handleCoinDiscountApply = (discountData) => {
    setCoinDiscount(discountData);
  };

  const processOrder = async () => {
    if (cartItems.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    setIsProcessing(true);
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      // First, create the order
      const orderData = {
        items: cartItems.map(item => ({
          type: item.type,
          product: item.product?._id,
          variantId: item.variantId,
          variantName: item.variantName,
          variantPrice: item.variantPrice,
          comboPackId: item.comboPackId,
          quantity: item.quantity,
          price: item.variantPrice || item.product?.price
        })),
        totalAmount: orderTotal,
        finalAmount: finalAmount,
        coinDiscount: coinDiscount?.discountAmount || 0,
        coinsUsed: coinDiscount?.coinsUsed || 0
      };

      const orderResponse = await fetch('http://localhost:5001/api/products/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(orderData)
      });

      if (!orderResponse.ok) {
        throw new Error('Failed to create order');
      }

      const orderResult = await orderResponse.json();
      const orderId = orderResult.order._id;

      // If coins were used, redeem them
      if (coinDiscount && coinDiscount.coinsUsed > 0) {
        const redemptionResponse = await fetch('http://localhost:5001/api/wallet/redeem-coins', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            orderValue: orderTotal,
            coinsToRedeem: coinDiscount.coinsUsed,
            orderId: orderId
          })
        });

        if (!redemptionResponse.ok) {
          throw new Error('Failed to redeem coins');
        }
      }

      // Clear cart
      await fetch('http://localhost:5001/api/products/cart/clear', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      // Calculate reward points to be earned (after delivery)
      const rewardPoints = Math.floor(finalAmount / 100) * 5;

      // Show success modal with reward points preview
      showSuccessModal(orderResult.order, rewardPoints);

    } catch (error) {
      console.error('Error processing order:', error);
      toast.error('Failed to process order');
    } finally {
      setIsProcessing(false);
    }
  };

  const showSuccessModal = (order, rewardPoints) => {
    // Create success modal that stays for 60 seconds
    const modalContent = (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-3xl p-8 max-w-md mx-4 text-center"
        >
          <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <FiCheck className="w-8 h-8 text-white" />
          </div>
          
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Order Placed Successfully!</h2>
          
          <div className="space-y-3 mb-6">
            <div className="flex justify-between">
              <span>Order ID:</span>
              <span className="font-mono">{order._id.slice(-8)}</span>
            </div>
            <div className="flex justify-between">
              <span>Total Amount:</span>
              <span className="font-semibold">₹{orderTotal}</span>
            </div>
            {coinDiscount && (
              <div className="flex justify-between text-green-600">
                <span>Coin Discount:</span>
                <span className="font-semibold">-₹{coinDiscount.discountAmount}</span>
              </div>
            )}
            <div className="flex justify-between text-lg font-bold border-t pt-2">
              <span>Final Amount:</span>
              <span>₹{finalAmount}</span>
            </div>
          </div>

          <div className="bg-blue-50 rounded-2xl p-4 mb-6">
            <p className="text-sm text-blue-600">
              🎉 You'll earn <span className="font-bold">{rewardPoints} Indira Coins</span> after delivery!
            </p>
          </div>

          <CountdownTimer 
            duration={60} 
            onComplete={() => {
              document.body.removeChild(document.getElementById('success-modal'));
              showRewardDialog(rewardPoints);
            }} 
          />
        </motion.div>
      </div>
    );

    // Create and append modal to body
    const modalDiv = document.createElement('div');
    modalDiv.id = 'success-modal';
    modalDiv.innerHTML = modalContent;
    document.body.appendChild(modalDiv);
  };

  const showRewardDialog = (rewardPoints) => {
    // Show reward points dialog for 30 seconds
    toast.custom((t) => (
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 50 }}
        className="bg-gradient-to-r from-[#2ecc71] to-[#27ae60] text-white p-6 rounded-3xl shadow-lg max-w-sm"
      >
        <div className="flex items-center gap-3 mb-3">
          <FiCoins className="w-6 h-6" />
          <span className="font-semibold">Reward Points Coming!</span>
        </div>
        <p className="text-sm opacity-90 mb-3">
          You'll receive {rewardPoints} Indira Coins after your order is delivered.
        </p>
        <p className="text-xs opacity-75">
          * Coins will be credited to your wallet after delivery confirmation
        </p>
        <CountdownTimer duration={30} showSeconds={true} />
      </motion.div>
    ), {
      duration: 30000,
      position: 'bottom-right'
    });

    // Navigate to orders page after dialog
    setTimeout(() => {
      navigate('/orders');
    }, 30000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8faf8] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#2ecc71] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading checkout...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8faf8] py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-800 mb-8 flex items-center gap-3">
          <FiShoppingCart className="w-8 h-8 text-[#2ecc71]" />
          Checkout
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Order Summary */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-3xl p-6 shadow-[8px_8px_16px_#e8eae8,-8px_-8px_16px_#ffffff] mb-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Order Summary</h2>
              
              <div className="space-y-4">
                {cartItems.map((item) => (
                  <div key={item._id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl">
                    <img
                      src={item.product?.images?.[0] || '/placeholder.png'}
                      alt={item.product?.name}
                      className="w-16 h-16 object-cover rounded-xl"
                    />
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-800">{item.product?.name}</h3>
                      {item.variantName && (
                        <p className="text-sm text-gray-600">{item.variantName}</p>
                      )}
                      <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-[#2ecc71]">
                        ₹{((item.variantPrice || item.product?.price) * item.quantity).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Coin Redemption Widget */}
            <CoinRedemptionWidget 
              orderValue={orderTotal}
              onDiscountApply={handleCoinDiscountApply}
            />
          </div>

          {/* Payment Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-3xl p-6 shadow-[8px_8px_16px_#e8eae8,-8px_-8px_16px_#ffffff] sticky top-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-6">Payment Summary</h2>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>₹{orderTotal.toLocaleString()}</span>
                </div>
                
                {coinDiscount && (
                  <div className="flex justify-between text-green-600">
                    <span>Coin Discount:</span>
                    <span>-₹{coinDiscount.discountAmount}</span>
                  </div>
                )}
                
                <div className="border-t pt-3">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total:</span>
                    <span className="text-[#2ecc71]">₹{finalAmount.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={processOrder}
                disabled={isProcessing || cartItems.length === 0}
                className="w-full py-4 bg-gradient-to-r from-[#2ecc71] to-[#27ae60] text-white rounded-2xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
              >
                {isProcessing ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <FiCreditCard className="w-5 h-5" />
                    Place Order
                  </>
                )}
              </motion.button>

              <p className="text-xs text-gray-500 text-center mt-4">
                By placing this order, you agree to our terms and conditions
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Countdown Timer Component
const CountdownTimer = ({ duration, onComplete, showSeconds = false }) => {
  const [timeLeft, setTimeLeft] = useState(duration);

  useEffect(() => {
    if (timeLeft <= 0) {
      onComplete?.();
      return;
    }

    const timer = setTimeout(() => {
      setTimeLeft(timeLeft - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [timeLeft, onComplete]);

  if (!showSeconds) return null;

  return (
    <div className="text-center mt-3">
      <div className="text-xs opacity-75">
        Auto-close in {timeLeft}s
      </div>
    </div>
  );
};

export default CheckoutPage;
