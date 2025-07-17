import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiPackage, FiHeart, FiShoppingCart, FiEye, FiStar } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const ComboCard = ({ comboPack, index, onAddToWishlist, onAddToCart, isInWishlist, navigate }) => {
  const comboIsWishlisted = isInWishlist && isInWishlist(comboPack._id);
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="bg-white rounded-3xl p-6 shadow-[8px_8px_16px_#e8eae8,-8px_-8px_16px_#ffffff] hover:shadow-[12px_12px_24px_#e8eae8,-12px_-12px_24px_#ffffff] transition-all duration-300 group relative"
    >
      {/* Combo Badge */}
      <div className="absolute top-3 left-3 z-10">
        <div className="px-3 py-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-semibold rounded-xl shadow-lg">
          <FiPackage className="w-3 h-3 inline-block mr-1" />
          Combo
        </div>
      </div>

      {/* Wishlist indicator - always visible if wishlisted */}
      {comboIsWishlisted && (
        <div className="absolute top-12 left-3 z-10">
          <div className="p-2 bg-red-500 text-white rounded-xl shadow-lg">
            <FiHeart className="w-4 h-4 fill-current" />
          </div>
        </div>
      )}
      
      <div className="relative mb-4">
        <div className="w-full h-48 bg-[#f8faf8] rounded-2xl shadow-inner overflow-hidden">
          <img
            src={comboPack.image || comboPack.products?.[0]?.images?.[0] || '/placeholder.png'}
            alt={comboPack.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
        <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onAddToWishlist && onAddToWishlist(comboPack._id)}
            className={`p-2 rounded-xl shadow-[4px_4px_8px_#e8eae8,-4px_-4px_8px_#ffffff] transition-all ${
              comboIsWishlisted 
                ? 'bg-red-500 text-white hover:bg-red-600' 
                : 'bg-white hover:bg-red-50 hover:text-red-500'
            }`}
          >
            <FiHeart className={`w-4 h-4 ${comboIsWishlisted ? 'fill-current' : ''}`} />
          </button>
          <button
            onClick={() => navigate(`/combo-packs/${comboPack._id}`)}
            className="p-2 bg-white rounded-xl shadow-[4px_4px_8px_#e8eae8,-4px_-4px_8px_#ffffff] hover:bg-blue-50 hover:text-blue-500 transition-all"
          >
            <FiEye className="w-4 h-4" />
          </button>
        </div>
      </div>
      
      <div className="space-y-3">
        <h3 className="font-semibold text-gray-800 line-clamp-2 group-hover:text-[#2ecc71] transition-colors">
          {comboPack.name}
        </h3>
        
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[#2ecc71] font-bold text-lg">₹{comboPack.discountedPrice?.toLocaleString()}</span>
            {comboPack.originalPrice && (
              <span className="text-gray-400 line-through text-sm">₹{comboPack.originalPrice.toLocaleString()}</span>
            )}
          </div>
          <div className="flex items-center gap-1">
            <FiStar className="w-4 h-4 text-yellow-400 fill-current" />
            <span className="text-sm text-gray-600">4.5</span>
          </div>
        </div>
        
        <button
          onClick={() => onAddToCart && onAddToCart(comboPack._id)}
          className="w-full py-3 bg-[#2ecc71] text-white rounded-xl font-medium shadow-[0_4px_12px_rgba(46,204,113,0.2)] hover:shadow-[0_6px_16px_rgba(46,204,113,0.3)] hover:bg-[#27ae60] transition-all flex items-center justify-center gap-2"
        >
          <FiShoppingCart className="w-4 h-4" />
          Add to Cart
        </button>
      </div>
    </motion.div>
  );
};

const ComboDeals = () => {
  const [comboPacks, setComboPacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [wishlistItems, setWishlistItems] = useState([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsAuthenticated(!!token);
    fetchComboPacks();
    if (token) {
      fetchWishlist();
    }
  }, []);

  const fetchComboPacks = async () => {
    try {
      const response = await fetch('http://localhost:5001/api/combo-packs/featured?limit=6');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success && data.comboPacks && data.comboPacks.length > 0) {
        setComboPacks(data.comboPacks);
      }
    } catch (error) {
      console.error('Error fetching combo packs:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchWishlist = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch('http://localhost:5001/api/combo-packs/wishlist/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setWishlistItems(data.wishlist || []);
      }
    } catch (error) {
      console.error('Error fetching combo pack wishlist:', error);
    }
  };

  const isInWishlist = (comboPackId) => {
    return wishlistItems.some(item => item._id === comboPackId);
  };

  const addToWishlist = async (comboPackId) => {
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Please login to add to wishlist');
      return;
    }

    try {
      const isWishlisted = isInWishlist(comboPackId);
      const endpoint = isWishlisted 
        ? 'http://localhost:5001/api/combo-packs/wishlist/remove'
        : 'http://localhost:5001/api/combo-packs/wishlist/add';

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ comboPackId })
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

  const addToCart = async (comboPackId) => {
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Please login to add to cart');
      return;
    }

    try {
      const response = await fetch('http://localhost:5001/api/combo-packs/cart/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ comboPackId, qty: 1 })
      });

      if (response.ok) {
        toast.success('Combo pack added to cart!');
      } else {
        throw new Error('Failed to add to cart');
      }
    } catch (error) {
      toast.error('Error adding combo pack to cart');
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
      className="py-16 px-4 bg-gradient-to-br from-purple-50 via-white to-pink-50"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
    >
      <div className="max-w-7xl mx-auto">
        <SectionHeader
          title="Combo Deals"
          subtitle="Get more value with our carefully curated combo packs"
          icon={FiPackage}
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
          {loading ? (
            [...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-3xl p-6 shadow-[8px_8px_16px_#e8eae8,-8px_-8px_16px_#ffffff] animate-pulse">
                <div className="w-full h-48 bg-gray-200 rounded-2xl mb-4"></div>
                <div className="space-y-3">
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-10 bg-gray-200 rounded"></div>
                </div>
              </div>
            ))
          ) : comboPacks.length > 0 ? (
            comboPacks.map((comboPack, index) => (
              <ComboCard
                key={comboPack._id}
                comboPack={comboPack}
                index={index}
                onAddToCart={addToCart}
                onAddToWishlist={addToWishlist}
                isInWishlist={isInWishlist}
                navigate={navigate}
              />
            ))
          ) : (
            <div className="col-span-full text-center py-8">
              <div className="bg-white rounded-3xl p-6 shadow-[8px_8px_16px_#e8eae8,-8px_-8px_16px_#ffffff] max-w-sm mx-auto">
                <FiPackage className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">No Combo Deals Available</h3>
                <p className="text-gray-500">Amazing combo deals coming soon!</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.section>
  );
};

export default ComboDeals;
