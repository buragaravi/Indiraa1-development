import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiShoppingCart, FiMinus, FiPlus, FiTrash2, FiArrowRight, FiArrowLeft, FiRefreshCw } from 'react-icons/fi';
import { toast } from 'react-hot-toast';

const Cart = () => {  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updatingItems, setUpdatingItems] = useState(new Set());
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    fetchCart();
  }, [navigate]);

  const fetchCart = async () => {
    try {
      const response = await fetch('http://localhost:5001/api/products/cart/me', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setCart(data.cart || []);
      } else {
        setError('Failed to fetch cart');
      }
    } catch (error) {
      setError('Error fetching cart');
    } finally {
      setLoading(false);
    }
  };  const updateQuantity = async (itemId, qty, variantId = null, itemType = 'product') => {
    const itemKey = variantId ? `${itemId}-${variantId}` : itemId;
    if (updatingItems.has(itemKey)) return;
    
    setUpdatingItems(prev => new Set(prev).add(itemKey));
    
    try {
      const requestBody = { qty, type: itemType };
      
      if (itemType === 'combo') {
        requestBody.comboPackId = itemId;
      } else {
        requestBody.productId = itemId;
        if (variantId) {
          requestBody.variantId = variantId;
        }
      }

      const response = await fetch('http://localhost:5001/api/products/cart/update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(requestBody)
      });

      if (response.ok) {
        await fetchCart();
        toast.success('Quantity updated');
      } else {
        toast.error('Failed to update quantity');
      }
    } catch (error) {
      toast.error('Error updating quantity');
    } finally {
      setUpdatingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(itemKey);
        return newSet;
      });
    }
  };  const removeItem = async (itemId, variantId = null, itemType = 'product') => {
    const itemKey = variantId ? `${itemId}-${variantId}` : itemId;
    if (updatingItems.has(itemKey)) return;
    
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

      const response = await fetch('http://localhost:5001/api/products/cart/remove', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(requestBody)
      });

      if (response.ok) {
        await fetchCart();
        toast.success('Item removed from cart');      } else {
        toast.error('Failed to remove item');
      }
    } catch (error) {
      toast.error('Error removing item');
    } finally {
      setUpdatingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(itemKey);
        return newSet;
      });
    }
  };

  // Calculate totals
  const subtotal = cart.reduce((total, item) => total + (item.price * item.qty), 0);
  const deliveryCharge = subtotal > 500 ? 0 : 50;
  const total = subtotal + deliveryCharge;
  if (loading) {
    return (      <div className="min-h-screen bg-gradient-to-br from-[#f8faf8] to-white flex justify-center items-center">
        <motion.div 
          className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-2xl"
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        >
          <div className="w-8 h-8 border-4 border-[#2ecc71] border-t-transparent rounded-full"></div>
        </motion.div>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-[#f8faf8] py-6 sm:py-8 lg:py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-center mb-12"
        >
          <Link
            to="/products"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-[#2ecc71] transition-colors mb-6"
          >
            <FiArrowLeft />
            <span>Continue Shopping</span>
          </Link>
          <div className="flex items-center justify-center gap-3 mb-4">
            <FiShoppingCart className="w-8 h-8 text-[#2ecc71]" />
            <h1 className="text-4xl font-bold text-gray-800">Your Cart</h1>
          </div>
          {cart.length === 0 ? (
            <p className="text-gray-600">Your shopping cart is empty</p>
          ) : (
            <p className="text-gray-600">{cart.length} items in your cart</p>
          )}
        </motion.div>        {error && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white/80 backdrop-blur-sm border border-red-200 text-red-600 p-6 rounded-3xl text-center mb-8 shadow-xl"
          >
            <div className="flex items-center justify-center gap-2 mb-2">
              <FiShoppingCart className="w-5 h-5" />
              <span className="font-semibold">Error</span>
            </div>
            <p className="mb-4">{error}</p>
            <button
              onClick={fetchCart}
              className="inline-flex items-center gap-2 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl transition-colors"
            >
              <FiRefreshCw className="w-4 h-4" />
              Try Again
            </button>
          </motion.div>
        )}        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          <div className="lg:col-span-2">
            <AnimatePresence>
              {cart.map((item, index) => (                <motion.div
                  key={item._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white mb-4 sm:mb-6 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-[8px_8px_16px_#e8eae8,-8px_-8px_16px_#ffffff] hover:shadow-[12px_12px_24px_#e8eae8,-12px_-12px_24px_#ffffff] transition-all"
                >
                  {/* Mobile Layout - Two Columns */}
                  <div className="sm:hidden">
                    <div className="flex gap-3">
                      {/* Left Column - Image + Product Name */}
                      <div className="flex-1 min-w-0">                        <Link to={`/${item.type === 'combo' ? 'combo-packs' : 'products'}/${item._id}`} className="flex gap-3 items-start">
                          <div className="w-16 h-16 rounded-xl overflow-hidden shadow-inner bg-[#f8faf8] flex-shrink-0">
                            <img
                              src={item.type === 'combo' 
                                ? (item.mainImage || item.products?.[0]?.images?.[0]?.url || '/placeholder.png')
                                : (item.images?.[0] || item.selectedVariant?.images?.[0] || '/placeholder.png')
                              }
                              alt={item.name}
                              className="w-full h-full object-cover hover:scale-105 transition-transform"
                            />
                          </div><div className="flex-1 min-w-0">
                            <h3 className="text-sm font-semibold text-gray-800 hover:text-[#2ecc71] transition-colors line-clamp-2">
                              {item.name}
                            </h3>
                            {item.selectedVariant && (
                              <p className="text-xs text-[#2ecc71] font-medium mt-0.5">
                                {item.selectedVariant.label || item.selectedVariant.name}
                              </p>
                            )}
                            <p className="text-xs text-gray-600 mt-1">
                              ₹{item.price.toLocaleString()} each
                            </p>
                          </div>
                        </Link>
                      </div>

                      {/* Right Column - Quantity + Price + Actions */}
                      <div className="flex flex-col items-end gap-2 flex-shrink-0">
                        {/* Total Price */}
                        <p className="text-lg font-bold text-[#2ecc71]">
                          ₹{(item.price * item.qty).toLocaleString()}
                        </p>
                          {/* Quantity Controls */}
                        <div className="flex items-center bg-[#f8faf8] rounded-xl p-1 shadow-inner">
                          <button
                            onClick={() => updateQuantity(item._id, Math.max(1, item.qty - 1), item.selectedVariant?.id, item.type)}
                            disabled={updatingItems.has(item.selectedVariant?.id ? `${item._id}-${item.selectedVariant.id}` : item._id) || item.qty <= 1}
                            className="w-7 h-7 flex items-center justify-center text-gray-600 hover:text-[#2ecc71] transition-colors rounded-lg hover:bg-white hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {updatingItems.has(item.selectedVariant?.id ? `${item._id}-${item.selectedVariant.id}` : item._id) ? (
                              <div className="w-3 h-3 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                            ) : (
                              <FiMinus className="w-3 h-3" />
                            )}
                          </button>
                          <span className="w-8 text-center font-medium text-gray-800 text-sm">{item.qty}</span>
                          <button
                            onClick={() => updateQuantity(item._id, item.qty + 1, item.selectedVariant?.id, item.type)}
                            disabled={updatingItems.has(item.selectedVariant?.id ? `${item._id}-${item.selectedVariant.id}` : item._id)}
                            className="w-7 h-7 flex items-center justify-center text-gray-600 hover:text-[#2ecc71] transition-colors rounded-lg hover:bg-white hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {updatingItems.has(item.selectedVariant?.id ? `${item._id}-${item.selectedVariant.id}` : item._id) ? (
                              <div className="w-3 h-3 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                            ) : (
                              <FiPlus className="w-3 h-3" />
                            )}
                          </button>
                        </div>

                        {/* Remove Button */}
                        <button
                          onClick={() => removeItem(item._id, item.selectedVariant?.id, item.type)}
                          disabled={updatingItems.has(item.selectedVariant?.id ? `${item._id}-${item.selectedVariant.id}` : item._id)}
                          className="w-8 h-8 flex items-center justify-center text-red-400 hover:text-red-500 bg-red-50 rounded-xl transition-all hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {updatingItems.has(item.selectedVariant?.id ? `${item._id}-${item.selectedVariant.id}` : item._id) ? (
                            <div className="w-3 h-3 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <FiTrash2 className="w-3 h-3" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Desktop/Tablet Layout - Original */}                  <div className="hidden sm:flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
                    <Link to={`/${item.type === 'combo' ? 'combo-packs' : 'products'}/${item._id}`}>
                      <div className="w-16 h-16 sm:w-24 sm:h-24 rounded-xl sm:rounded-2xl overflow-hidden shadow-inner bg-[#f8faf8]">
                        <img
                          src={item.type === 'combo' 
                            ? (item.mainImage || item.products?.[0]?.images?.[0]?.url || '/placeholder.png')
                            : (item.images?.[0] || item.selectedVariant?.images?.[0] || '/placeholder.png')
                          }
                          alt={item.name}
                          className="w-full h-full object-cover hover:scale-105 transition-transform"
                        />
                      </div>
                    </Link>                    <div className="flex-grow min-w-0">
                      <Link to={`/${item.type === 'combo' ? 'combo-packs' : 'products'}/${item._id}`}>
                        <h3 className="text-base sm:text-lg font-semibold text-gray-800 hover:text-[#2ecc71] transition-colors overflow-hidden" style={{display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical'}}>
                          {item.name}
                        </h3>
                      </Link>
                      {item.selectedVariant && (
                        <p className="text-sm text-[#2ecc71] font-medium mt-1">
                          {item.selectedVariant.label || item.selectedVariant.name}
                        </p>
                      )}
                      <div className="mt-2 flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
                        <p className="text-sm text-gray-600">
                          ₹{item.price.toLocaleString()} × {item.qty}
                        </p>
                        <p className="text-lg sm:text-xl font-bold text-[#2ecc71]">
                          ₹{(item.price * item.qty).toLocaleString()}
                        </p>
                      </div>
                    </div>                    <div className="flex items-center gap-3 sm:gap-4 w-full sm:w-auto justify-between sm:justify-end">                      <div className="flex items-center bg-[#f8faf8] rounded-xl sm:rounded-2xl p-1 sm:p-2 shadow-inner">
                        <button
                          onClick={() => updateQuantity(item._id, Math.max(1, item.qty - 1), item.selectedVariant?.id, item.type)}
                          disabled={updatingItems.has(item.selectedVariant?.id ? `${item._id}-${item.selectedVariant.id}` : item._id) || item.qty <= 1}
                          className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center text-gray-600 hover:text-[#2ecc71] transition-colors rounded-lg sm:rounded-xl hover:bg-white hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {updatingItems.has(item.selectedVariant?.id ? `${item._id}-${item.selectedVariant.id}` : item._id) ? (
                            <div className="w-3 h-3 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <FiMinus className="w-3 h-3 sm:w-4 sm:h-4" />
                          )}
                        </button>
                        <span className="w-8 sm:w-12 text-center font-medium text-gray-800 text-sm sm:text-base">{item.qty}</span>
                        <button
                          onClick={() => updateQuantity(item._id, item.qty + 1, item.selectedVariant?.id, item.type)}
                          disabled={updatingItems.has(item.selectedVariant?.id ? `${item._id}-${item.selectedVariant.id}` : item._id)}
                          className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center text-gray-600 hover:text-[#2ecc71] transition-colors rounded-lg sm:rounded-xl hover:bg-white hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {updatingItems.has(item.selectedVariant?.id ? `${item._id}-${item.selectedVariant.id}` : item._id) ? (
                            <div className="w-3 h-3 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <FiPlus className="w-3 h-3 sm:w-4 sm:h-4" />
                          )}
                        </button>
                      </div>
                      <button
                        onClick={() => removeItem(item._id, item.selectedVariant?.id, item.type)}
                        disabled={updatingItems.has(item.selectedVariant?.id ? `${item._id}-${item.selectedVariant.id}` : item._id)}
                        className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center text-red-400 hover:text-red-500 bg-red-50 rounded-xl sm:rounded-2xl transition-all hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"                      >
                        {updatingItems.has(item.selectedVariant?.id ? `${item._id}-${item.selectedVariant.id}` : item._id) ? (
                          <div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <FiTrash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}              className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-8 shadow-[8px_8px_16px_#e8eae8,-8px_-8px_16px_#ffffff] sticky top-4"
            >
              <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-6 sm:mb-8">Order Summary</h2>
              <div className="space-y-4 sm:space-y-6">
                <div className="flex justify-between text-gray-600 text-sm sm:text-base">
                  <span>Subtotal</span>
                  <span className="font-medium">₹{subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-gray-600 text-sm sm:text-base">
                  <span>Delivery</span>
                  <span className="font-medium">
                    {deliveryCharge === 0 ? (
                      <span className="text-[#2ecc71]">Free</span>
                    ) : (
                      `₹${deliveryCharge}`
                    )}
                  </span>
                </div>
                <div className="h-px bg-gray-100 shadow-sm" />
                <div className="flex justify-between text-lg sm:text-xl font-semibold text-gray-800">
                  <span>Total</span>
                  <span>₹{total.toLocaleString()}</span>
                </div>
                <button
                  onClick={() => navigate('/checkout')}
                  disabled={cart.length === 0}
                  className="w-full mt-4 sm:mt-6 bg-[#2ecc71] text-white py-3 sm:py-4 px-4 sm:px-6 rounded-xl sm:rounded-2xl font-medium flex items-center justify-center gap-2 hover:bg-[#27ae60] transition-all disabled:bg-gray-300 disabled:cursor-not-allowed shadow-[0_4px_12px_rgba(46,204,113,0.2)] hover:shadow-[0_6px_16px_rgba(46,204,113,0.3)] disabled:shadow-none text-sm sm:text-base"
                >
                  <span>Proceed to Checkout</span>
                  <FiArrowRight className="w-4 h-4" />
                </button>
                {cart.length > 0 && (
                  <p className="text-sm text-gray-500 text-center mt-4">
                    Free delivery on orders above ₹500
                  </p>
                )}
              </div>
            </motion.div>
          </div>
        </div>

        {cart.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center mt-12"
          >
            <Link
              to="/products"
              className="inline-flex items-center gap-2 bg-[#2ecc71] text-white px-8 py-4 rounded-2xl font-medium hover:bg-[#27ae60] transition-all shadow-[0_4px_12px_rgba(46,204,113,0.2)] hover:shadow-[0_6px_16px_rgba(46,204,113,0.3)]"
            >
              Shop Now
              <FiArrowRight />
            </Link>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Cart;
