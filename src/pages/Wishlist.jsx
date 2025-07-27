import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiHeart, 
  FiShoppingCart, 
  FiTrash2, 
  FiStar, 
  FiEye,
  FiRefreshCw,
  FiShoppingBag
} from 'react-icons/fi';
import { toast } from 'react-hot-toast';

const Wishlist = () => {  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [removingItems, setRemovingItems] = useState(new Set());
  const [movingItems, setMovingItems] = useState(new Set());
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    fetchWishlist();
  }, [navigate]);

  const fetchWishlist = async () => {
    try {
      const response = await fetch('http://localhost:5001/api/products/wishlist/me', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log("data - wishlist :", data);
        setWishlistItems(data.wishlist || []);
      } else {
        setError('Failed to fetch wishlist');
      }
    } catch (error) {
      setError('Error fetching wishlist');
    } finally {
      setLoading(false);
    }
  };
  const removeFromWishlist = async (productId) => {
    if (removingItems.has(productId)) return;
    
    setRemovingItems(prev => new Set(prev).add(productId));
    
    try {
      const response = await fetch('http://localhost:5001/api/products/wishlist/remove', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ productId })
      });

      if (response.ok) {
        await fetchWishlist(); // Refresh wishlist
        toast.success('Removed from wishlist');
      } else {
        toast.error('Failed to remove item from wishlist');
      }
    } catch (error) {
      toast.error('Error removing item from wishlist');
    } finally {
      setRemovingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(productId);
        return newSet;
      });
    }
  };
  const moveToCart = async (productId) => {
    if (movingItems.has(productId)) return;
    
    setMovingItems(prev => new Set(prev).add(productId));
    
    try {
      // First add to cart
      const addToCartResponse = await fetch('http://localhost:5001/api/products/cart/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ productId, quantity: 1 })
      });

      if (addToCartResponse.ok) {
        // Then remove from wishlist
        await removeFromWishlist(productId);
        toast.success('Moved to cart successfully!');
      } else {
        toast.error('Failed to add item to cart');
      }
    } catch (error) {
      toast.error('Error moving item to cart');
    } finally {
      setMovingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(productId);
        return newSet;
      });
    }
  };
  const clearWishlist = async () => {
    try {
      const response = await fetch('http://localhost:5001/api/products/wishlist/clear', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        setWishlistItems([]);
        toast.success('Wishlist cleared successfully!');
      } else {
        toast.error('Failed to clear wishlist');
      }
    } catch (error) {
      toast.error('Error clearing wishlist');
    }
  };  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#f8faf8] to-white flex justify-center items-center">
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

  if (error) {
    return (      <div className="min-h-screen bg-gradient-to-br from-[#f8faf8] to-white flex justify-center items-center">
        <motion.div 
          className="text-center bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-2xl max-w-md"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <FiHeart className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Error</h3>
          <p className="text-gray-600 mb-6">{error}</p>
          <button 
            onClick={fetchWishlist}
            className="flex items-center gap-2 px-6 py-3 bg-[#2ecc71] text-white rounded-xl hover:bg-[#27ae60] transition-all duration-200 shadow-lg mx-auto"
          >
            <FiRefreshCw className="w-4 h-4" />
            Try Again
          </button>
        </motion.div>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f8faf8] to-white py-8">
      <div className="container mx-auto px-4 max-w-7xl">        {/* Header */}
        <motion.div 
          className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 md:mb-8 gap-4"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >          <div className="flex items-center gap-3 md:gap-4">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-[#2ecc71] rounded-xl md:rounded-2xl flex items-center justify-center shadow-lg">
              <FiHeart className="w-5 h-5 md:w-6 md:h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800">My Wishlist</h1>
              <p className="text-sm md:text-base text-gray-600">
                {wishlistItems.length === 0 
                  ? 'No items in your wishlist' 
                  : `${wishlistItems.length} item${wishlistItems.length !== 1 ? 's' : ''} saved`
                }
              </p>
            </div>
          </div>
            {wishlistItems.length > 0 && (
            <motion.button
              onClick={clearWishlist}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 md:px-6 py-2 md:py-3 bg-white/80 backdrop-blur-sm text-red-600 border border-red-200 rounded-xl hover:bg-red-50 hover:border-red-300 transition-all duration-200 shadow-lg text-sm md:text-base"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <FiTrash2 className="w-4 h-4" />
              Clear Wishlist
            </motion.button>
          )}
        </motion.div>

        {wishlistItems.length === 0 ? (
          <motion.div 
            className="text-center py-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >            <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 md:p-12 shadow-xl border border-white/30 max-w-md mx-auto">
              <div className="w-20 h-20 md:w-24 md:h-24 bg-gradient-to-r from-[#f8faf8] to-white rounded-full flex items-center justify-center mx-auto mb-4 md:mb-6">
                <FiHeart className="w-10 h-10 md:w-12 md:h-12 text-[#2ecc71]" />
              </div>
              <h3 className="text-xl md:text-2xl font-bold text-gray-800 mb-3 md:mb-4">Your wishlist is empty</h3>
              <p className="text-sm md:text-base text-gray-600 mb-6 md:mb-8">Save items you love to your wishlist and shop them later</p>
              <Link 
                to="/products" 
                className="inline-flex items-center gap-2 px-6 md:px-8 py-3 md:py-4 bg-[#2ecc71] text-white rounded-xl hover:bg-[#27ae60] transition-all duration-200 shadow-lg font-semibold text-sm md:text-base"
              >
                <FiShoppingBag className="w-4 h-4 md:w-5 md:h-5" />
                Continue Shopping
              </Link>
            </div>
          </motion.div>        ) : (
          <motion.div 
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <AnimatePresence>
              {wishlistItems.map((item, index) => (
                <motion.div
                  key={item._id}
                  className="bg-white/80 backdrop-blur-sm rounded-3xl overflow-hidden shadow-xl border border-white/30 hover:shadow-2xl transition-all duration-300 group"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ delay: index * 0.1 }}
                  layout
                >
                  {/* Product Image */}
                  <div className="relative aspect-square overflow-hidden">
                    <img 
                      src={item.images?.[0] || '/placeholder.png'} 
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    
                    {/* Quick Actions Overlay */}
                    <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <button
                        onClick={() => navigate(`/products/${item._id}`)}
                        className="p-2 bg-white/90 backdrop-blur-sm rounded-xl shadow-lg hover:bg-white transition-all duration-200 mb-2"
                      >
                        <FiEye className="w-4 h-4 text-gray-700" />
                      </button>
                    </div>

                    {/* Stock Badge */}
                    {item.stock <= 0 && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <span className="bg-red-500 text-white px-3 py-1 rounded-                 full text-sm font-medium">
                          Out of Stock
                        </span>
                      </div>
                    )}
                  </div>                  {/* Product Details */}
                  <div className="p-4 md:p-6">                    <div className="mb-3 md:mb-4">
                      <h3 className="text-base md:text-lg font-semibold text-gray-800 mb-2 group-hover:text-[#2ecc71] transition-colors overflow-hidden" style={{display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical'}}>
                        {item.name}
                      </h3>
                      <div className="flex items-center justify-between">
                        <span className="text-xl md:text-2xl font-bold text-[#2ecc71]">₹{item.price}</span>
                        {item.originalPrice && item.originalPrice > item.price && (
                          <span className="text-xs md:text-sm text-gray-400 line-through">₹{item.originalPrice}</span>
                        )}
                      </div>
                    </div>

                    {/* Rating */}
                    {item.rating && (
                      <div className="flex items-center gap-1 mb-3 md:mb-4">
                        {[...Array(5)].map((_, i) => (
                          <FiStar
                            key={i}
                            className={`w-3 h-3 md:w-4 md:h-4 ${
                              i < Math.floor(item.rating) 
                                ? 'text-yellow-400 fill-current' 
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                        <span className="text-xs md:text-sm text-gray-600 ml-1">
                          ({item.numReviews || 0})
                        </span>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-2 md:gap-3">
                      <motion.button
                        onClick={() => moveToCart(item._id)}
                        disabled={movingItems.has(item._id) || item.stock <= 0}                        className={`flex-1 flex items-center justify-center gap-1 md:gap-2 px-3 md:px-4 py-2 md:py-3 rounded-lg md:rounded-xl font-semibold transition-all duration-200 shadow-lg text-xs md:text-sm ${
                          item.stock <= 0
                            ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                            : 'bg-[#2ecc71] text-white hover:bg-[#27ae60]'
                        }`}
                        whileHover={item.stock > 0 ? { scale: 1.02 } : {}}
                        whileTap={item.stock > 0 ? { scale: 0.98 } : {}}
                      >
                        {movingItems.has(item._id) ? (
                          <div className="w-3 h-3 md:w-4 md:h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <>
                            <FiShoppingCart className="w-3 h-3 md:w-4 md:h-4" />
                            <span className="hidden sm:inline">{item.stock <= 0 ? 'Out of Stock' : 'Move to Cart'}</span>
                            <span className="sm:hidden">{item.stock <= 0 ? 'Out' : 'Cart'}</span>
                          </>
                        )}
                      </motion.button>
                      
                      <motion.button
                        onClick={() => removeFromWishlist(item._id)}
                        disabled={removingItems.has(item._id)}
                        className="p-2 md:p-3 bg-white/80 backdrop-blur-sm text-red-500 border border-red-200 rounded-lg md:rounded-xl hover:bg-red-50 hover:border-red-300 transition-all duration-200 shadow-lg"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        {removingItems.has(item._id) ? (
                          <div className="w-3 h-3 md:w-4 md:h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <FiTrash2 className="w-3 h-3 md:w-4 md:h-4" />
                        )}
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Wishlist;
