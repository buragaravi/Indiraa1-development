import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiArrowLeft, 
  FiSearch, 
  FiShoppingCart, 
  FiZap, 
  FiHeart,
  FiFilter,
  FiX,
  FiGrid,
  FiList,
  FiStar,
  FiCheck,
  FiPlus,
  FiMinus,
  FiChevronDown
} from 'react-icons/fi';
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';
import VariantPopup from '../components/VariantPopup';
import ComboPackCard from '../components/ComboPackCard';

const ProductList = () => {
 const [products, setProducts] = useState([]);
  const [comboPacks, setComboPacks] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [ratingFilter, setRatingFilter] = useState(0);
  const [viewMode, setViewMode] = useState('grid');
  const [showFilters, setShowFilters] = useState(false);  const [sortBy, setSortBy] = useState('name');
  const [cart, setCart] = useState([]);
  const [loadingStates, setLoadingStates] = useState({});
  const [selectedVariants, setSelectedVariants] = useState({}); // Track selected variant per product
  const [showVariantPopup, setShowVariantPopup] = useState(false);
  const [popupProduct, setPopupProduct] = useState(null);
  const [popupAction, setPopupAction] = useState('cart'); // 'cart' or 'buy'
  const [wishlistItems, setWishlistItems] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const params = new URLSearchParams(location.search);
  const categoryParam = params.get('category');
  // Authentication token (you'll need to get this from your auth context/storage)
  const getAuthToken = () => localStorage.getItem('token');

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showSortDropdown) {
        setShowSortDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showSortDropdown]);

  const showNotification = (message, type = 'success') => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 3000);
  };

  const apiCall = async (url, options = {}) => {
    const token = getAuthToken();
    const headers = {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers
    };

    const response = await fetch(url, { ...options, headers });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  };
  const fetchWishlistAndCart = useCallback(async () => {
    try {
      const token = getAuthToken();
      if (!token) return;

      const [wishlistData, cartData] = await Promise.all([
        apiCall('https://coms-again.onrender.com/api/products/wishlist/me'),
        apiCall('https://coms-again.onrender.com/api/products/cart/me')      ]);

      setWishlistItems(wishlistData.wishlist || []);
      setCart(cartData.cart || []);
    } catch (error) {
      console.log('Not authenticated or error fetching user data');
    }  }, []);

  // Variant helper functions
  const getDefaultVariant = (product) => {
    if (!product?.hasVariants || !product?.variants?.length) return null;
    
    // Filter variants with stock > 0
    const availableVariants = product.variants.filter(v => v.stock > 0);
    if (!availableVariants.length) return null;
    
    // Find explicitly marked default variant
    const defaultVariant = availableVariants.find(v => v.isDefault);
    if (defaultVariant) return defaultVariant;
    
    // Return cheapest variant as default
    return availableVariants.reduce((cheapest, current) => 
      current.price < cheapest.price ? current : cheapest
    );
  };
  const getDisplayPrice = (product) => {
    if (product.hasVariants && product.variants?.length > 0) {
      const defaultVariant = getDefaultVariant(product);
      return defaultVariant ? defaultVariant.price : product.price;
    }
    
    return product.price;
  };

  const getDisplayOriginalPrice = (product) => {
    if (product.hasVariants && product.variants?.length > 0) {
      const defaultVariant = getDefaultVariant(product);
      return defaultVariant ? defaultVariant.originalPrice : product.originalPrice;
    }
    
    return product.originalPrice;
  };

  const getDisplayStock = (product) => {
    if (product.hasVariants && product.variants?.length > 0) {
      const defaultVariant = getDefaultVariant(product);
      return defaultVariant ? defaultVariant.stock : 0;
    }
    
    return product.stock;
  };
useEffect(() => {
    const token = getAuthToken();
    setIsAuthenticated(!!token);
    
    setLoading(true);
    let url = 'https://coms-again.onrender.com/api/products';
    if (categoryParam) url += `?category=${encodeURIComponent(categoryParam)}`;

    // Fetch both products and combo packs
    const fetchData = async () => {
      try {
        const [productsResponse, comboPacksResponse] = await Promise.all([
          fetch(url),
          fetch('https://coms-again.onrender.com/api/combo-packs/all')
        ]);

        const productsData = await productsResponse.json();
        const comboPacksData = await comboPacksResponse.json();

        const allProducts = productsData.products || [];
        const allComboPacks = comboPacksData.success ? (comboPacksData.comboPacks || []) : [];

        setProducts(allProducts);
        setComboPacks(allComboPacks);
        setFiltered(allProducts); // Initially show only products, combo packs will be shown separately

        const categories = [...new Set(allProducts.map(p => p.category))];
        setCategoryOptions(categories);

        const prices = allProducts.map(p => p.price);
        const min = Math.min(...prices);
        const max = Math.max(...prices);
        setPriceRange([min, max]);

        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to load products');
        setLoading(false);
      }
    };

    setTimeout(fetchData, 500);

    if (token) {
      fetchWishlistAndCart();
    }
  }, [categoryParam, fetchWishlistAndCart]);

  useEffect(() => {
    let filteredData = products
      .filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description?.toLowerCase().includes(searchQuery.toLowerCase()))
      .filter(p => selectedCategories.length ? selectedCategories.includes(p.category) : true)
      .filter(p => p.price >= priceRange[0] && p.price <= priceRange[1])
      .filter(p => {
        if (ratingFilter === 0) return true;
        const avgRating = p.reviews?.length
          ? p.reviews.reduce((sum, r) => sum + r.rating, 0) / p.reviews.length
          : 0;
        return avgRating >= ratingFilter;
      });

    // Sorting
    filteredData.sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          return a.price - b.price;
        case 'price-high':
          return b.price - a.price;
        case 'rating':
          const avgA = a.reviews?.length ? a.reviews.reduce((sum, r) => sum + r.rating, 0) / a.reviews.length : 0;
          const avgB = b.reviews?.length ? b.reviews.reduce((sum, r) => sum + r.rating, 0) / b.reviews.length : 0;
          return avgB - avgA;
        case 'newest':
          return new Date(b.createdAt) - new Date(a.createdAt);
        default:
          return a.name.localeCompare(b.name);
      }
    });

    setFiltered(filteredData);
  }, [searchQuery, selectedCategories, priceRange, ratingFilter, products, sortBy]);

  const handleCategoryToggle = (cat) => {
    setSelectedCategories(prev =>
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
  };

  const setLoadingState = (productId, action, state) => {
    setLoadingStates(prev => ({
      ...prev,
      [`${productId}-${action}`]: state
    }));
  };

  const getLoadingState = (productId, action) => {
    return loadingStates[`${productId}-${action}`] || false;
  };
  const handleWishlistToggle = async (productId, isInWishlist) => {
    setLoadingState(productId, 'wishlist', true);
    try {
      if (isInWishlist) {
        await apiCall('https://coms-again.onrender.com/api/products/wishlist/remove', {
          method: 'POST',
          body: JSON.stringify({ productId })
        });
        setWishlistItems(prev => prev.filter(item => item._id !== productId));
        showNotification('Removed from wishlist');
      } else {
        await apiCall('https://coms-again.onrender.com/api/products/wishlist/add', {
          method: 'POST',
          body: JSON.stringify({ productId })
        });
        // Optimistically add to wishlist - you might want to fetch the full item details
        const product = products.find(p => p._id === productId);
        if (product) {
          setWishlistItems(prev => [...prev, product]);
        }
        showNotification('Added to wishlist');
      }
    } catch (error) {
      showNotification('Please login to manage wishlist', 'error');
    } finally {
      setLoadingState(productId, 'wishlist', false);
    }
  };  const handleAddToCart = async (productId, quantity = 1, selectedVariant = null) => {
    setLoadingState(productId, 'cart', true);
    try {
      const product = products.find(p => p._id === productId);
      
      // If product has variants and no variant is selected, show popup
      if (product?.hasVariants && !selectedVariant) {
        setPopupProduct(product);
        setPopupAction('cart');
        setShowVariantPopup(true);
        setLoadingState(productId, 'cart', false);
        return;
      }
      
      let variantId = null;
      
      // Get variant ID if available
      if (selectedVariant) {
        variantId = selectedVariant.id;
      } else if (product?.hasVariants) {
        const defaultVariant = getDefaultVariant(product);
        if (defaultVariant) {
          variantId = defaultVariant.id;
        } else {
          showNotification('No variants available for this product', 'error');
          return;
        }
      }

      const requestBody = { productId, quantity };
      if (variantId) {
        requestBody.variantId = variantId;
      }

      await apiCall('https://coms-again.onrender.com/api/products/cart/add', {
        method: 'POST',
        body: JSON.stringify(requestBody)
      });
      
      // Update local cart state
      const existingItem = cart.find(item => {
        if (variantId) {
          return item.product === productId && item.selectedVariant?.id === variantId;
        }
        return item.product === productId && !item.selectedVariant;
      });
      
      if (existingItem) {
        setCart(prev => prev.map(item => {
          if (variantId) {
            return (item.product === productId && item.selectedVariant?.id === variantId)
              ? { ...item, quantity: item.quantity + quantity }
              : item;
          }
          return item.product === productId && !item.selectedVariant
            ? { ...item, quantity: item.quantity + quantity }
            : item;
        }));
      } else {
        const newCartItem = { product: productId, quantity };
        if (selectedVariant) {
          newCartItem.selectedVariant = selectedVariant;
        }
        setCart(prev => [...prev, newCartItem]);
      }
      
      showNotification('Added to cart');
    } catch (error) {
      showNotification('Please login to add to cart', 'error');
    } finally {
      setLoadingState(productId, 'cart', false);
    }
  };
  const handleBuyNow = (productId, quantity = 1, selectedVariant = null) => {
    const product = products.find(p => p._id === productId);
    
    // If product has variants and no variant is selected, show popup
    if (product?.hasVariants && !selectedVariant) {
      setPopupProduct(product);
      setPopupAction('buy');
      setShowVariantPopup(true);
      return;
    }
    
    // Navigate to checkout with variant info if available
    let url = `/checkout?product=${productId}&quantity=${quantity}`;
    if (selectedVariant) {
      url += `&variantId=${selectedVariant.id}`;
    }
    navigate(url);
  };const renderRatingStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <FiStar
          key={i}
          className={`w-4 h-4 ${i <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
        />
      );
    }
    return (
      <div className="flex items-center gap-1">
        {stars}
        <span className="text-gray-600 text-sm ml-2 font-medium">({rating.toFixed(1)})</span>
      </div>
    );
  };

  const clearAllFilters = () => {
    setSearchQuery('');
    setSelectedCategories([]);
    setRatingFilter(0);
    const prices = products.map(p => p.price);
    setPriceRange([Math.min(...prices), Math.max(...prices)]);
  };

  if (error) {
    return (
      <motion.div 
        className="flex flex-col items-center justify-center min-h-[60vh] bg-gradient-to-br from-gray-50 to-gray-100" 
        initial={{ opacity: 0, scale: 0.9 }} 
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="text-center p-8 max-w-md mx-auto bg-white rounded-2xl shadow-lg">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiX className="w-8 h-8 text-red-500" />
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Oops! Something went wrong</h3>
          <p className="text-gray-600 mb-6">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl hover:from-emerald-600 hover:to-teal-700 transition-all duration-200 shadow-lg"
          >
            Try Again
          </button>
        </div>
      </motion.div>
    );
  }
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50">
      {/* Notifications */}
      <AnimatePresence>
        <div className="fixed top-4 right-4 z-50 space-y-2">
          {notifications.map((notification) => (
            <motion.div
              key={notification.id}
              initial={{ opacity: 0, x: 300, scale: 0.3 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 300, scale: 0.3 }}
              transition={{ type: "spring", stiffness: 500, damping: 25 }}
              className={`px-6 py-4 rounded-2xl shadow-2xl backdrop-blur-lg border ${
                notification.type === 'error' 
                  ? 'bg-red-500/95 text-white border-red-400/40 shadow-red-500/25' 
                  : 'bg-[#2ecc71]/95 text-white border-[#2ecc71]/40 shadow-[#2ecc71]/25'
              }`}
            >
              <div className="flex items-center gap-3">
                <FiCheck className="w-5 h-5" />
                <span className="font-medium">{notification.message}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </AnimatePresence>      {/* Header */}
      <motion.div 
        initial={{ y: -10, opacity: 0 }} 
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-green-100/50 shadow-lg shadow-[#2ecc71]/5"
      >
        <div className="max-w-7xl mx-auto px-4 py-6">
          {/* Back Button */}
          <div className="flex items-center justify-between mb-6">
            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate(-1)} 
              className="p-3 rounded-2xl bg-white/90 backdrop-blur-sm hover:bg-[#f8faf8] hover:shadow-lg hover:shadow-[#2ecc71]/10 transition-all duration-300 shadow-lg border border-green-100/50 group" 
              aria-label="Go back"
            >
              <FiArrowLeft className="w-5 h-5 text-[#2ecc71] group-hover:text-[#27ae60] transition-colors" />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
              className="md:hidden p-3 rounded-2xl bg-white/90 backdrop-blur-sm hover:bg-[#f8faf8] hover:shadow-lg hover:shadow-[#2ecc71]/10 transition-all duration-300 shadow-lg border border-green-100/50 group"
            >
              {viewMode === 'grid' ? 
                <FiList className="w-5 h-5 text-[#2ecc71] group-hover:text-[#27ae60] transition-colors" /> : 
                <FiGrid className="w-5 h-5 text-[#2ecc71] group-hover:text-[#27ae60] transition-colors" />
              }
            </motion.button>
          </div>

          {/* Smart Header Row */}
          <div className="relative">
            <AnimatePresence>
              {!isSearchExpanded ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="flex items-center justify-between"
                >                  {/* Title and Count */}
                  <div className="flex items-center">
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
                      {categoryParam || 'All Products'}
                    </h1>
                    <span className="ml-3 text-sm text-gray-600 font-medium bg-gray-100 px-3 py-1 rounded-full">
                      {filtered.length} products
                    </span>
                  </div>

                  {/* Action Icons */}
                  <div className="flex items-center gap-2">
                    {/* Search Icon */}
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setIsSearchExpanded(true)}
                      className="p-3 rounded-2xl bg-white/90 backdrop-blur-sm hover:bg-[#f8faf8] hover:shadow-lg hover:shadow-[#2ecc71]/10 transition-all duration-300 shadow-lg border border-green-100/50 group"
                      title="Search Products"
                    >
                      <FiSearch className="w-5 h-5 text-[#2ecc71] group-hover:text-[#27ae60] transition-colors" />
                    </motion.button>

                    {/* Filter Icon */}
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setShowFilters(!showFilters)}
                      className={`p-3 rounded-2xl backdrop-blur-sm transition-all duration-300 shadow-lg border group ${
                        showFilters 
                          ? 'bg-[#2ecc71] border-[#2ecc71] shadow-[#2ecc71]/20' 
                          : 'bg-white/90 border-green-100/50 hover:bg-[#f8faf8] hover:shadow-lg hover:shadow-[#2ecc71]/10'
                      }`}
                      title="Toggle Filters"
                    >
                      <FiFilter className={`w-5 h-5 transition-colors ${
                        showFilters ? 'text-white' : 'text-[#2ecc71] group-hover:text-[#27ae60]'
                      }`} />
                    </motion.button>

                    {/* Sort Icon */}
                    <div className="relative">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setShowSortDropdown(!showSortDropdown)}
                        className={`p-3 rounded-2xl backdrop-blur-sm transition-all duration-300 shadow-lg border group ${
                          showSortDropdown 
                            ? 'bg-[#2ecc71] border-[#2ecc71] shadow-[#2ecc71]/20' 
                            : 'bg-white/90 border-green-100/50 hover:bg-[#f8faf8] hover:shadow-lg hover:shadow-[#2ecc71]/10'
                        }`}
                        title="Sort Products"
                      >
                        <FiChevronDown className={`w-5 h-5 transition-colors ${
                          showSortDropdown ? 'text-white' : 'text-[#2ecc71] group-hover:text-[#27ae60]'
                        }`} />
                      </motion.button>

                      {/* Sort Dropdown */}
                      <AnimatePresence>
                        {showSortDropdown && (
                          <motion.div
                            initial={{ opacity: 0, y: -10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -10, scale: 0.95 }}
                            transition={{ duration: 0.2 }}
                            className="absolute right-0 top-full mt-2 w-48 bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl border border-green-100/50 overflow-hidden z-50"
                          >
                            {[
                              { value: 'name', label: 'Name (A-Z)' },
                              { value: 'price-low', label: 'Price (Low to High)' },
                              { value: 'price-high', label: 'Price (High to Low)' },
                              { value: 'rating', label: 'Rating (High to Low)' }
                            ].map((option) => (
                              <button
                                key={option.value}
                                onClick={() => {
                                  setSortBy(option.value);
                                  setShowSortDropdown(false);
                                }}
                                className={`w-full text-left px-4 py-3 text-sm transition-colors ${
                                  sortBy === option.value
                                    ? 'bg-[#2ecc71] text-white'
                                    : 'text-gray-700 hover:bg-[#f8faf8]'
                                }`}
                              >
                                {option.label}
                              </button>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* View Mode Toggle (Desktop) */}
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                      className="hidden md:block p-3 rounded-2xl bg-white/90 backdrop-blur-sm hover:bg-[#f8faf8] hover:shadow-lg hover:shadow-[#2ecc71]/10 transition-all duration-300 shadow-lg border border-green-100/50 group"
                      title="Toggle View Mode"
                    >
                      {viewMode === 'grid' ? 
                        <FiList className="w-5 h-5 text-[#2ecc71] group-hover:text-[#27ae60] transition-colors" /> : 
                        <FiGrid className="w-5 h-5 text-[#2ecc71] group-hover:text-[#27ae60] transition-colors" />
                      }
                    </motion.button>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="flex items-center gap-4"
                >
                  {/* Expanded Search Bar */}
                  <div className="relative flex-1">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <FiSearch className="h-5 w-5 text-[#2ecc71]/60" />
                    </div>
                    <input
                      type="text"
                      placeholder="Search products..."
                      className="block w-full pl-12 pr-4 py-4 border-0 rounded-2xl bg-white/90 backdrop-blur-lg shadow-lg shadow-[#2ecc71]/5 focus:ring-2 focus:ring-[#2ecc71]/50 focus:bg-white focus:shadow-xl focus:shadow-[#2ecc71]/10 transition-all duration-300 text-gray-800 placeholder-[#2ecc71]/50 border border-green-100/50"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      autoFocus
                      onBlur={() => setIsSearchExpanded(false)}
                    />
                  </div>

                  {/* Close Search Button */}
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      setIsSearchExpanded(false);
                      setSearchQuery('');
                    }}
                    className="p-3 rounded-2xl bg-white/90 backdrop-blur-sm hover:bg-red-50 hover:shadow-lg hover:shadow-red-500/10 transition-all duration-300 shadow-lg border border-red-100/50 group"
                    title="Close Search"
                  >
                    <FiX className="w-5 h-5 text-red-500 group-hover:text-red-600 transition-colors" />
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>        </div>
      </motion.div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex gap-6">{/* Sidebar Filters */}
          <AnimatePresence>
            {(showFilters || window.innerWidth >= 768) && (
              <motion.div 
                initial={{ x: -300, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -300, opacity: 0 }}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
                className="fixed md:static inset-y-0 left-0 z-30 w-80 md:w-64 bg-white/95 backdrop-blur-xl p-6 rounded-3xl shadow-2xl shadow-[#2ecc71]/10 border border-green-100/50 space-y-6 overflow-y-auto"
              >                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-800">Filters</h2>
                  <div className="flex gap-2">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={clearAllFilters}
                      className="text-sm text-[#2ecc71] hover:text-[#27ae60] font-medium transition-colors px-3 py-1 rounded-xl hover:bg-gray-50"
                    >
                      Clear All
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setShowFilters(false)}
                      className="md:hidden p-2 rounded-xl hover:bg-gray-50 transition-colors"
                    >
                      <FiX className="w-4 h-4 text-gray-600" />
                    </motion.button>
                  </div>
                </div>                {/* Price Range */}
                <div className="space-y-4">
                  <h3 className="font-medium text-gray-700">Price Range</h3>
                  <div className="bg-gray-50 rounded-2xl p-4 border border-gray-200">
                    <div className="px-2 mb-3">
                      <Slider
                        range
                        min={Math.floor(priceRange[0])}
                        max={Math.ceil(priceRange[1])}
                        value={priceRange}
                        onChange={(value) => setPriceRange(value)}
                        trackStyle={[{ backgroundColor: '#2ecc71', height: 6 }]}
                        railStyle={{ backgroundColor: '#f3f4f6', height: 6 }}
                        handleStyle={[
                          { 
                            borderColor: '#2ecc71', 
                            backgroundColor: '#2ecc71',
                            width: 20,
                            height: 20,
                            marginTop: -7,
                            boxShadow: '0 4px 12px rgba(46, 204, 113, 0.3)'
                          }, 
                          { 
                            borderColor: '#2ecc71', 
                            backgroundColor: '#2ecc71',
                            width: 20,
                            height: 20,
                            marginTop: -7,
                            boxShadow: '0 4px 12px rgba(46, 204, 113, 0.3)'
                          }
                        ]}
                      />
                    </div>
                    <div className="flex justify-between text-sm text-gray-600 font-medium">
                      <span>Rs.{priceRange[0]}</span>
                      <span>Rs.{priceRange[1]}</span>
                    </div>
                  </div>
                </div>                {/* Categories */}
                <div className="space-y-4">
                  <h3 className="font-medium text-gray-700">Categories</h3>
                  <div className="space-y-2">
                    {categoryOptions.map((cat) => (
                      <motion.label 
                        key={cat} 
                        whileHover={{ x: 4 }}
                        className="flex items-center gap-3 p-3 rounded-2xl hover:bg-gray-50 cursor-pointer transition-all duration-200 border border-transparent hover:border-gray-200"
                      >
                        <input
                          type="checkbox"
                          checked={selectedCategories.includes(cat)}
                          onChange={() => handleCategoryToggle(cat)}
                          className="w-4 h-4 text-[#2ecc71] border-gray-300 rounded focus:ring-[#2ecc71] focus:ring-2"
                        />
                        <span className="text-sm text-gray-700 font-medium">{cat}</span>
                      </motion.label>
                    ))}
                  </div>
                </div>

                {/* Ratings */}
                <div className="space-y-4">
                  <h3 className="font-medium text-gray-700">Minimum Rating</h3>
                  <div className="space-y-2">
                    {[4, 3, 2, 1].map((star) => (
                      <motion.label 
                        key={star} 
                        whileHover={{ x: 4 }}
                        className="flex items-center gap-3 p-3 rounded-2xl hover:bg-gray-50 cursor-pointer transition-all duration-200 border border-transparent hover:border-gray-200"
                      >
                        <input
                          type="radio"
                          name="rating"
                          checked={ratingFilter === star}
                          onChange={() => setRatingFilter(star)}
                          className="w-4 h-4 text-[#2ecc71] border-gray-300 focus:ring-[#2ecc71] focus:ring-2"
                        />
                        <div className="flex items-center gap-2">
                          <div className="flex">
                            {[...Array(star)].map((_, i) => (
                              <FiStar key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                            ))}
                          </div>
                          <span className="text-sm text-gray-700 font-medium">& up</span>
                        </div>
                      </motion.label>
                    ))}
                    <motion.label 
                      whileHover={{ x: 4 }}
                      className="flex items-center gap-3 p-3 rounded-2xl hover:bg-gray-50 cursor-pointer transition-all duration-200 border border-transparent hover:border-gray-200"
                    >
                      <input
                        type="radio"
                        name="rating"
                        checked={ratingFilter === 0}
                        onChange={() => setRatingFilter(0)}
                        className="w-4 h-4 text-[#2ecc71] border-gray-300 focus:ring-[#2ecc71] focus:ring-2"
                      />
                      <span className="text-sm text-gray-700 font-medium">All ratings</span>
                    </motion.label>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>          {/* Products Grid */}
          <div className="flex-1">
            {loading ? (
              <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
                {[...Array(6)].map((_, i) => (
                  <motion.div 
                    key={i} 
                    initial={{ opacity: 0, y: 20 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    transition={{ delay: i * 0.1, type: "spring", stiffness: 400 }} 
                    className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-lg shadow-[#2ecc71]/5 overflow-hidden animate-pulse border border-green-100/50"
                  >
                    <div className="h-56 bg-gradient-to-br from-green-100 to-green-50"></div>
                    <div className="p-6 space-y-3">
                      <div className="h-4 bg-green-200/60 rounded-xl w-3/4"></div>
                      <div className="h-4 bg-green-200/40 rounded-xl w-1/2"></div>
                      <div className="h-10 bg-gradient-to-r from-green-200/60 to-green-300/60 rounded-2xl w-full mt-4"></div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
                className="text-center py-20"
              >
                <div className="w-32 h-32 bg-gradient-to-br from-green-100 to-green-50 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-[#2ecc71]/10">
                  <FiSearch className="w-16 h-16 text-[#2ecc71]/60" />
                </div>
                <h3 className="text-2xl font-semibold bg-gradient-to-r from-[#2ecc71] to-[#27ae60] bg-clip-text text-transparent mb-3">No products found</h3>
                <p className="text-[#2ecc71]/70 mb-8 text-lg">Try adjusting your filters or search terms</p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={clearAllFilters}
                  className="px-8 py-4 bg-gradient-to-r from-[#2ecc71] to-[#27ae60] text-white rounded-2xl hover:shadow-lg hover:shadow-[#2ecc71]/25 transition-all duration-300 shadow-lg font-medium"
                >
                  Clear Filters
                </motion.button>
              </motion.div>
            ) : (              <motion.div 
                className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }}
                layout
              >                {/* Combo Packs - Display above products */}
                {comboPacks.map((comboPack, index) => (
                  <ComboPackCard
                    key={`combo-${comboPack._id}`}
                    comboPack={comboPack}
                    index={index}
                    viewMode={viewMode}
                  />
                ))}

                {/* Regular Products */}
                {filtered.map((product, index) => {
                  const avgRating = product.reviews?.length
                    ? product.reviews.reduce((sum, r) => sum + r.rating, 0) / product.reviews.length
                    : 0;
                  
                  // Safely check if product is in wishlist
                  const productIsWishlisted = Array.isArray(wishlistItems) && 
                    wishlistItems.length > 0 && 
                    wishlistItems.some(item => item && item._id === product._id);
                    // Check if product (or any of its variants) is in cart
                  const cartItem = Array.isArray(cart) ? cart.find(item => {
                    if (product.hasVariants) {
                      // For variant products, check if any variant is in cart
                      return item.product === product._id;
                    } else {
                      // For non-variant products, simple product match
                      return item.product === product._id && !item.selectedVariant;
                    }
                  }) : null;
                  const isInCart = !!cartItem;

                  return (                    <motion.div
                      key={product._id}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05, duration: 0.3 }}
                      whileHover={{ y: -4, scale: 1.01 }}
                      className={`bg-white/90 backdrop-blur-lg rounded-3xl shadow-lg shadow-[#2ecc71]/10 hover:shadow-2xl hover:shadow-[#2ecc71]/20 transition-all duration-300 overflow-hidden group border border-green-100/50 ${
                        viewMode === 'list' ? 'flex' : ''
                      }`}
                    >{/* Product Image */}                      <div 
                        className={`relative bg-gradient-to-br from-[#f8faf8] to-white cursor-pointer overflow-hidden ${
                          viewMode === 'list' ? 'w-48 h-48' : 'pt-[100%]'
                        }`}
                        onClick={() => navigate(`/products/${product._id}`)}
                      >
                        <img 
                          src={product.images?.[0] || '/placeholder.png'} 
                          alt={product.name} 
                          className={`${
                            viewMode === 'list' 
                              ? 'w-full h-full' 
                              : 'absolute top-0 left-0 w-full h-full'
                          } object-contain p-6 group-hover:scale-105 transition-transform duration-300`}
                        />
                        
                        {/* Wishlist Button */}
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleWishlistToggle(product._id, productIsWishlisted);
                          }}
                          disabled={getLoadingState(product._id, 'wishlist')}
                          className={`absolute top-4 right-4 p-3 rounded-2xl backdrop-blur-lg transition-all duration-300 shadow-lg ${
                            productIsWishlisted 
                              ? 'bg-red-500/90 text-white shadow-red-500/25 border border-red-400/30' 
                              : 'bg-white/90 text-[#2ecc71] hover:bg-red-500/90 hover:text-white shadow-[#2ecc71]/10 border border-green-100/50'
                          }`}
                        >
                          <FiHeart className={`w-5 h-5 ${productIsWishlisted ? 'fill-current' : ''} transition-all duration-300`} />
                        </motion.button>

                        {/* Rating Badge */}
                        {avgRating > 0 && (
                          <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-lg px-3 py-2 rounded-2xl shadow-lg shadow-[#2ecc71]/10 border border-green-100/50">
                            <div className="flex items-center gap-1">
                              <FiStar className="w-4 h-4 text-yellow-400 fill-current" />
                              <span className="text-sm font-semibold text-[#2ecc71]">{avgRating.toFixed(1)}</span>
                            </div>
                          </div>
                        )}                        {/* Stock Badge */}
                        {getDisplayStock(product) <= 0 && (
                          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center">
                            <span className="bg-red-500/95 text-white px-4 py-2 rounded-2xl text-sm font-semibold shadow-lg backdrop-blur-lg border border-red-400/30">
                              Out of Stock
                            </span>
                          </div>
                        )}

                        {/* Discount Badge */}
                        {getDisplayOriginalPrice(product) && getDisplayOriginalPrice(product) > getDisplayPrice(product) && (
                          <div className="absolute bottom-4 left-4 bg-gradient-to-r from-[#2ecc71] to-[#27ae60] text-white px-3 py-2 rounded-2xl text-sm font-semibold shadow-lg shadow-[#2ecc71]/25">
                            {Math.round(((getDisplayOriginalPrice(product) - getDisplayPrice(product)) / getDisplayOriginalPrice(product)) * 100)}% OFF
                          </div>
                        )}
                      </div>{/* Product Info */}
                      <div className={`p-6 ${viewMode === 'list' ? 'flex-1' : ''}`}>
                        <div className="flex items-start justify-between mb-3">                          <h3 className="font-bold text-lg text-gray-800 line-clamp-2 group-hover:text-[#2ecc71] transition-colors duration-300">
                            {product.name}
                          </h3>
                        </div>                        <div className="text-xs text-gray-600 font-semibold mb-3 uppercase tracking-wider bg-gray-100 px-2 py-1 rounded-xl inline-block">
                          {product.category}
                        </div>

                        {/* Variants Badge */}
                        {product.hasVariants && (
                          <div className="mb-3">
                            <span className="text-xs text-[#2ecc71] bg-[#2ecc71]/10 px-2 py-1 rounded-xl font-medium border border-[#2ecc71]/20">
                              {product.variants?.length} variants available
                            </span>
                          </div>
                        )}

                        {product.description && (                          <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                            {product.description}
                          </p>
                        )}

                        {/* Rating */}
                        {avgRating > 0 && (
                          <div className="mb-4">
                            {renderRatingStars(avgRating)}
                          </div>
                        )}                        {/* Price */}
                        <div className="flex items-center gap-3 mb-6">
                          {product.hasVariants && product.variants?.length > 1 ? (
                            // Show price range for variant products
                            <div className="flex flex-col">
                              <span className="text-2xl font-bold text-gray-800">
                                ₹{Math.min(...product.variants.map(v => v.price)).toLocaleString()} - ₹{Math.max(...product.variants.map(v => v.price)).toLocaleString()}
                              </span>
                              <span className="text-xs text-gray-500 font-medium">
                                Price varies by variant
                              </span>
                            </div>
                          ) : (
                            <span className="text-2xl font-bold text-gray-800">
                              ₹{getDisplayPrice(product).toLocaleString()}
                            </span>
                          )}
                          {getDisplayOriginalPrice(product) && getDisplayOriginalPrice(product) > getDisplayPrice(product) && !product.hasVariants && (
                            <span className="text-gray-400 line-through text-lg">
                              ₹{getDisplayOriginalPrice(product).toLocaleString()}
                            </span>
                          )}
                        </div>{/* Action Buttons - Equal Size */}
                        <div className="grid grid-cols-2 gap-3">
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => handleAddToCart(product._id)}
                            disabled={getDisplayStock(product) <= 0 || getLoadingState(product._id, 'cart')}
                            className={`flex items-center justify-center gap-2 px-4 py-3 rounded-2xl transition-all duration-300 font-semibold shadow-lg min-h-[48px] ${
                              isInCart
                                ? 'bg-[#f8faf8] text-[#2ecc71] border-2 border-[#2ecc71]/20 shadow-[#2ecc71]/10'
                                : 'bg-gradient-to-r from-[#2ecc71] to-[#27ae60] text-white hover:from-[#27ae60] hover:to-[#2ecc71] shadow-[#2ecc71]/25 hover:shadow-[#2ecc71]/40'
                            } ${getDisplayStock(product) <= 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                          >
                            {getLoadingState(product._id, 'cart') ? (
                              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                            ) : isInCart ? (
                              <>
                                <FiCheck className="w-4 h-4" />
                                <span className="text-sm">In Cart</span>
                              </>                            ) : (
                              <>
                                <FiShoppingCart className="w-4 h-4" />
                                <span className="text-sm">
                                  {product.hasVariants ? 'Select & Add' : 'Add to Cart'}
                                </span>
                              </>
                            )}
                          </motion.button>                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => handleBuyNow(product._id)}
                            disabled={getDisplayStock(product) <= 0}
                            className={`flex items-center justify-center gap-2 px-4 py-3 rounded-2xl transition-all duration-300 font-semibold shadow-lg min-h-[48px] ${
                              getDisplayStock(product) <= 0 
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                : 'bg-gradient-to-r from-amber-500 to-orange-600 text-white hover:from-amber-600 hover:to-orange-700 shadow-amber-500/25 hover:shadow-amber-500/40'
                            }`}                          >
                            <FiZap className="w-4 h-4" />
                            <span className="text-sm">
                              {product.hasVariants ? 'Select & Buy' : 'Buy Now'}
                            </span>
                          </motion.button>
                        </div>                        {/* Stock Info */}
                        {getDisplayStock(product) > 0 && getDisplayStock(product) <= 10 && (
                          <div className="mt-4 text-center">
                            <span className="text-xs text-amber-600 bg-amber-50 px-3 py-2 rounded-2xl font-medium border border-amber-200">
                              Only {getDisplayStock(product)} left in stock
                            </span>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </motion.div>
            )}
          </div>        </div>
      </div>
      
      {/* Mobile Filter Overlay */}
      {showFilters && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-20 md:hidden"
          onClick={() => setShowFilters(false)}
        />
      )}

      {/* Floating Action Button for Mobile Filters */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setShowFilters(true)}
        className="md:hidden fixed bottom-6 right-6 w-16 h-16 bg-gradient-to-r from-[#2ecc71] to-[#27ae60] text-white rounded-2xl shadow-2xl shadow-[#2ecc71]/30 flex items-center justify-center z-30 border border-green-400/30 backdrop-blur-lg"
      >
        <FiFilter className="w-6 h-6" />
      </motion.button>      {/* Back to Top Button */}
      <motion.button
        initial={{ opacity: 0, y: 100 }}
        animate={{ 
          opacity: typeof window !== 'undefined' && window.scrollY > 500 ? 1 : 0,
          y: typeof window !== 'undefined' && window.scrollY > 500 ? 0 : 100 
        }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className="fixed bottom-6 left-6 w-14 h-14 bg-white/90 backdrop-blur-lg text-[#2ecc71] rounded-2xl shadow-2xl shadow-[#2ecc71]/20 flex items-center justify-center z-30 border border-green-100 hover:bg-[#f8faf8] transition-all duration-300"
      >
        <FiArrowLeft className="w-5 h-5 rotate-90" />
      </motion.button>

      {/* Variant Selection Popup */}
      <VariantPopup
        isOpen={showVariantPopup}
        onClose={() => {
          setShowVariantPopup(false);
          setPopupProduct(null);
          setPopupAction('cart');
        }}
        product={popupProduct}
        onAddToCart={handleAddToCart}
        onBuyNow={handleBuyNow}
        actionType={popupAction}
      />
    </div>
  );
};

export default ProductList;