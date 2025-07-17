import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiStar, FiHeart, FiShoppingCart, FiEye } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

// Unified Featured Product Card Component
const FeaturedCard = ({ product, index, onAddToWishlist, onAddToCart, isInWishlist, navigate }) => {
  const productIsWishlisted = isInWishlist && isInWishlist(product._id);
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="bg-white rounded-3xl p-6 shadow-[8px_8px_16px_#e8eae8,-8px_-8px_16px_#ffffff] hover:shadow-[12px_12px_24px_#e8eae8,-12px_-12px_24px_#ffffff] transition-all duration-300 group relative"
    >
      {/* Featured Badge */}
      <div className="absolute top-3 left-3 z-10">
        <div className="px-3 py-1 bg-gradient-to-r from-[#2ecc71] to-[#27ae60] text-white text-xs font-semibold rounded-xl shadow-lg">
          <FiStar className="w-3 h-3 inline-block mr-1" />
          Featured
        </div>
      </div>

      {/* Wishlist indicator - always visible if wishlisted */}
      {productIsWishlisted && (
        <div className="absolute top-12 left-3 z-10">
          <div className="p-2 bg-red-500 text-white rounded-xl shadow-lg">
            <FiHeart className="w-4 h-4 fill-current" />
          </div>
        </div>
      )}
      
      <div className="relative mb-4">
        <div className="w-full h-48 bg-[#f8faf8] rounded-2xl shadow-inner overflow-hidden">
          <img
            src={product.images?.[0] || product.image || '/placeholder.png'}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
        <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onAddToWishlist && onAddToWishlist(product._id)}
            className={`p-2 rounded-xl shadow-[4px_4px_8px_#e8eae8,-4px_-4px_8px_#ffffff] transition-all ${
              productIsWishlisted 
                ? 'bg-red-500 text-white hover:bg-red-600' 
                : 'bg-white hover:bg-red-50 hover:text-red-500'
            }`}
          >
            <FiHeart className={`w-4 h-4 ${productIsWishlisted ? 'fill-current' : ''}`} />
          </button>
          <button
            onClick={() => navigate(`/products/${product._id}`)}
            className="p-2 bg-white rounded-xl shadow-[4px_4px_8px_#e8eae8,-4px_-4px_8px_#ffffff] hover:bg-blue-50 hover:text-blue-500 transition-all"
          >
            <FiEye className="w-4 h-4" />
          </button>
        </div>
      </div>
      
      <div className="space-y-3">
        <h3 className="font-semibold text-gray-800 line-clamp-2 group-hover:text-[#2ecc71] transition-colors">
          {product.name}
        </h3>
        
        <div className="flex items-center justify-between">
          <span className="text-[#2ecc71] font-bold text-lg">₹{product.price?.toLocaleString()}</span>
          <div className="flex items-center gap-1">
            <FiStar className="w-4 h-4 text-yellow-400 fill-current" />
            <span className="text-sm text-gray-600">4.5</span>
          </div>
        </div>
        
        <button
          onClick={() => onAddToCart && onAddToCart(product._id)}
          className="w-full py-3 bg-[#2ecc71] text-white rounded-xl font-medium shadow-[0_4px_12px_rgba(46,204,113,0.2)] hover:shadow-[0_6px_16px_rgba(46,204,113,0.3)] hover:bg-[#27ae60] transition-all flex items-center justify-center gap-2"
        >
          <FiShoppingCart className="w-4 h-4" />
          Add to Cart
        </button>
      </div>
    </motion.div>
  );
};

const FeaturedProducts = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [wishlistItems, setWishlistItems] = useState([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsAuthenticated(!!token);
    fetchProducts();
    if (token) {
      fetchWishlist();
    }
  }, []);

  const fetchProducts = async () => {
    try {
      console.log('Fetching featured products...');
      const response = await fetch('http://localhost:5001/api/products');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Products API response for featured:', data);
      
      if (data.products && data.products.length > 0) {
        // Get featured products (first 6 shuffled)
        const shuffled = [...data.products].sort(() => 0.5 - Math.random());
        setFeaturedProducts(shuffled.slice(0, 6));
        
        console.log('Featured products loaded successfully:', shuffled.slice(0, 6).length);
      } else {
        console.warn('No products received from API for featured products');
      }
    } catch (error) {
      console.error('Error fetching featured products:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchWishlist = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch('http://localhost:5001/api/products/wishlist/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setWishlistItems(data.wishlist || []);
      }
    } catch (error) {
      console.error('Error fetching product wishlist:', error);
    }
  };

  const isInWishlist = (productId) => {
    return wishlistItems.some(item => item._id === productId);
  };

  const addToWishlist = async (productId) => {
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Please login to add to wishlist');
      return;
    }

    try {
      const isWishlisted = isInWishlist(productId);
      const endpoint = isWishlisted 
        ? 'http://localhost:5001/api/products/wishlist/remove'
        : 'http://localhost:5001/api/products/wishlist/add';

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ productId })
      });

      if (response.ok) {
        toast.success(isWishlisted ? 'Removed from wishlist' : 'Added to wishlist!');
        fetchWishlist();
      } else {
        throw new Error('Failed to update wishlist');
      }
    } catch (error) {
      toast.error('Error updating wishlist');
    }
  };

  const addToCart = async (productId) => {
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Please login to add to cart');
      return;
    }

    try {
      const response = await fetch('http://localhost:5001/api/products/cart/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ productId, qty: 1 })
      });

      if (response.ok) {
        toast.success('Product added to cart!');
      } else {
        throw new Error('Failed to add to cart');
      }
    } catch (error) {
      toast.error('Error adding product to cart');
    }
  };

  const SectionHeader = ({ title, subtitle, icon: Icon }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="text-center mb-12"
    >
      <div className="flex items-center justify-center gap-3 mb-4">
        <Icon className="w-8 h-8 text-[#2ecc71]" />
        <h2 className="text-3xl font-bold text-gray-800">{title}</h2>
      </div>
      <p className="text-gray-600 max-w-2xl mx-auto">{subtitle}</p>
    </motion.div>
  );

  return (
    <motion.section 
      className="py-16 px-4 bg-gradient-to-br from-green-50 via-white to-emerald-50"
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
    >
      <div className="max-w-7xl mx-auto">
        <SectionHeader
          title="Featured Products"
          subtitle="Handpicked products that our customers love the most"
          icon={FiStar}
        />
        
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
            {[...Array(6)].map((_, i) => (
              <motion.div 
                key={i} 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className="bg-white rounded-3xl p-6 shadow-[8px_8px_16px_#e8eae8,-8px_-8px_16px_#ffffff] animate-pulse"
              >
                <div className="w-full h-48 bg-[#f8faf8] rounded-2xl mb-4 shadow-inner"></div>
                <div className="space-y-3">
                  <div className="h-4 bg-[#f8faf8] rounded-xl w-3/4 shadow-inner"></div>
                  <div className="h-4 bg-[#f8faf8] rounded-xl w-1/2 shadow-inner"></div>
                  <div className="h-10 bg-[#f8faf8] rounded-xl shadow-inner"></div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : featuredProducts.length > 0 ? (
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            {featuredProducts.map((product, index) => (
              <FeaturedCard
                key={product._id}
                product={product}
                index={index}
                onAddToCart={addToCart}
                onAddToWishlist={addToWishlist}
                isInWishlist={isInWishlist}
                navigate={navigate}
              />
            ))}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="text-center py-12"
          >
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiStar className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No Featured Products Available</h3>
            <p className="text-gray-500">Check back soon for our amazing featured products!</p>
          </motion.div>
        )}
      </div>
    </motion.section>
  );
};

export default FeaturedProducts;
