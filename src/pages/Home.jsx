import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, useScroll, useTransform, useMotionValue, useSpring } from 'framer-motion';
import { FiShoppingBag, FiStar, FiTrendingUp, FiArrowRight, FiHeart, FiShoppingCart, FiEye, FiUsers, FiShield, FiTruck, FiPackage } from 'react-icons/fi';
import toast from 'react-hot-toast';

// Import the new components
import ComboDeals from '../components/home/ComboDeals';
import FeaturedProducts from '../components/home/FeaturedProducts';
import DynamicHeroSection from '../components/DynamicHeroSection';

// PWA Services
import { 
  getProductsWithOffline, 
  addToCartWithSync, 
  addToWishlistWithSync,
  getWishlistWithOffline 
} from '../services/apiWithOffline';

// ProductCard component for other sections
const ProductCard = ({ product, index, onAddToWishlist, onAddToCart, isInWishlist, navigate }) => {
  const productIsWishlisted = isInWishlist(product._id);
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="bg-white rounded-3xl p-6 shadow-[8px_8px_16px_#e8eae8,-8px_-8px_16px_#ffffff] hover:shadow-[12px_12px_24px_#e8eae8,-12px_-12px_24px_#ffffff] transition-all duration-300 group relative"
    >
      {/* Wishlist indicator - always visible if wishlisted */}
      {productIsWishlisted && (
        <div className="absolute top-3 left-3 z-10">
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
            onClick={() => onAddToWishlist(product._id)}
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
          <span className="text-[#2ecc71] font-bold text-lg">₹{product.price.toLocaleString()}</span>
          <div className="flex items-center gap-1">
            <FiStar className="w-4 h-4 text-yellow-400 fill-current" />
            <span className="text-sm text-gray-600">4.5</span>
          </div>
        </div>
        
        <button
          onClick={() => onAddToCart(product._id)}
          className="w-full py-3 bg-[#2ecc71] text-white rounded-xl font-medium shadow-[0_4px_12px_rgba(46,204,113,0.2)] hover:shadow-[0_6px_16px_rgba(46,204,113,0.3)] hover:bg-[#27ae60] transition-all flex items-center justify-center gap-2"
        >
          <FiShoppingCart className="w-4 h-4" />
          Add to Cart
        </button>
      </div>
    </motion.div>
  );
};

const Home = () => {
  // Simplified state management for remaining sections
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newArrivals, setNewArrivals] = useState([]);
  const [topRated, setTopRated] = useState([]);
  const [wishlistItems, setWishlistItems] = useState([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  // All useRef hooks and navigate
  const navigate = useNavigate();
  const containerRef = useRef(null);
  
  // All motion values and framer-motion hooks declared at top level
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springX = useSpring(mouseX, { stiffness: 300, damping: 30 });
  const springY = useSpring(mouseY, { stiffness: 300, damping: 30 });
  
  // Scroll animations - declared at top level
  const { scrollYProgress } = useScroll({ target: containerRef });
  const backgroundY = useTransform(scrollYProgress, [0, 1], ['0%', '100%']);
  const backgroundRotate = useTransform(scrollYProgress, [0, 1], [0, 360]);
  const backgroundScale = useTransform(scrollYProgress, [0, 0.5, 1], [1, 1.2, 1]);
  
  // Pre-declare all useTransform hooks to avoid conditional calls
  const heroY = useTransform(scrollYProgress, [0, 0.2], [0, -50]);
  const heroScale = useTransform(scrollYProgress, [0, 0.2], [1, 1.1]);
  const heroRotate = useTransform(scrollYProgress, [0, 0.2], [0, 2]);
  const statsY = useTransform(scrollYProgress, [0.1, 0.3], [0, -30]);
  const newArrivalsY = useTransform(scrollYProgress, [0.4, 0.6], [0, -15]);
  const newArrivalsScale = useTransform(scrollYProgress, [0.4, 0.6], [1, 1.02]);
  const topRatedY = useTransform(scrollYProgress, [0.6, 0.8], [0, -10]);
  const ctaY = useTransform(scrollYProgress, [0.8, 1], [0, -5]);
  const ctaScale = useTransform(scrollYProgress, [0.8, 1], [1, 1.05]);
  
  // Additional transforms for animations
  const springXTransform1 = useTransform(springX, [0, 1], [-100, 100]);
  const springYTransform1 = useTransform(springY, [0, 1], [-100, 100]);
  const springXTransform2 = useTransform(springX, [0, 1], [50, -50]);
  const springYTransform2 = useTransform(springY, [0, 1], [50, -50]);
  const scaleTransform = useTransform(scrollYProgress, [0, 1], [0.8, 1.2]);
  const springXPercent = useTransform(springX, [0, 1], [0, 100]);
  const springYPercent = useTransform(springY, [0, 1], [0, 100]);
  // Handle mouse movement for interactive animations
  const handleMouseMove = (e) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (rect) {
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;
      mouseX.set(x);
      mouseY.set(y);
    }
  };

  // All useEffect hooks
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
      // Use PWA-enabled product service
      const response = await getProductsWithOffline();
      const data = response.data;
      
      if (data.products && data.products.length > 0) {
        setProducts(data.products);
        
        // Show offline indicator if data is from cache
        if (response.source === 'offline') {
          toast('Products loaded from offline storage', { icon: '📦' });
        }
        
        // Create new arrivals and top rated from the same data
        const shuffled = [...data.products].sort(() => 0.5 - Math.random());
        setNewArrivals(shuffled.slice(6, 12));
        setTopRated(shuffled.slice(12, 18));
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const fetchWishlist = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      // Use PWA-enabled wishlist service
      const response = await getWishlistWithOffline();
      setWishlistItems(response.data || []);
    } catch (error) {
      console.error('Error fetching wishlist:', error);
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
        ? 'https://indiraa1-backend.onrender.com/api/products/wishlist/remove'
        : 'https://indiraa1-backend.onrender.com/api/products/wishlist/add';

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
      // Use PWA-enabled cart service
      const result = await addToCartWithSync(productId, 1);

      if (result.success) {
        toast.success(result.queued ? result.message : 'Added to cart!');
      } else {
        throw new Error('Failed to add to cart');
      }
    } catch (error) {
      toast.error('Error adding to cart');
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
  );  return (
    <motion.div 
      ref={containerRef}
      className="min-h-screen bg-[#f8faf8] relative overflow-hidden"
      onMouseMove={handleMouseMove}
    >
      {/* Animated Background Elements */}
      <div className="fixed inset-0 pointer-events-none">
        {/* Floating Orbs */}
        <motion.div
          className="absolute w-96 h-96 rounded-full bg-gradient-to-r from-[#2ecc71]/10 to-[#27ae60]/5 blur-3xl"
          style={{
            x: springXTransform1,
            y: springYTransform1,
            scale: backgroundScale,
            rotate: backgroundRotate,
          }}
          animate={{
            x: [0, 100, 0],
            y: [0, -100, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        
        <motion.div
          className="absolute right-0 top-1/4 w-64 h-64 rounded-full bg-gradient-to-l from-[#27ae60]/10 to-[#2ecc71]/5 blur-2xl"
          style={{
            x: springXTransform2,
            y: springYTransform2,
          }}
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        
        <motion.div
          className="absolute bottom-1/4 left-1/4 w-48 h-48 rounded-full bg-gradient-to-br from-[#2ecc71]/15 to-transparent blur-xl"
          style={{
            y: backgroundY,
            scale: scaleTransform,
          }}
          animate={{
            x: [0, -50, 0],
            y: [0, 50, 0],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        
        {/* Scroll Progress Indicator */}
        <motion.div
          className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#2ecc71] to-[#27ae60] origin-left z-50"
          style={{ scaleX: scrollYProgress }}
        />
        
        {/* Floating Particles */}
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-[#2ecc71]/20 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -100, 0],
              opacity: [0, 1, 0],
              scale: [0, 1, 0],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
              ease: "easeInOut"
            }}
          />
        ))}
      </div>

      {/* Dynamic Hero Banner Section Container */}
      <motion.section 
        className="relative min-h-screen flex items-center justify-center overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        {/* Hero Section Background Elements */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#f8faf8] via-white to-[#f0f4f0]">
          {/* Decorative geometric patterns */}
          <div className="absolute top-10 left-10 w-32 h-32 bg-gradient-to-br from-[#2ecc71]/10 to-transparent rounded-full blur-xl"></div>
          <div className="absolute top-1/4 right-20 w-24 h-24 bg-gradient-to-bl from-[#27ae60]/15 to-transparent rounded-full blur-lg"></div>
          <div className="absolute bottom-1/3 left-1/4 w-40 h-40 bg-gradient-to-tr from-[#2ecc71]/8 to-transparent rounded-full blur-2xl"></div>
          
          {/* Floating coins animation */}
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-6 h-6 bg-gradient-to-br from-[#2ecc71] to-[#27ae60] rounded-full shadow-lg"
              style={{
                left: `${15 + Math.random() * 70}%`,
                top: `${20 + Math.random() * 60}%`,
              }}
              animate={{
                y: [0, -20, 0],
                rotate: [0, 360],
                scale: [1, 1.2, 1],
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 2,
                ease: "easeInOut"
              }}
            >
              <div className="w-full h-full rounded-full bg-gradient-to-br from-white/30 to-transparent"></div>
            </motion.div>
          ))}
          
          {/* Grid pattern overlay */}
          <div className="absolute inset-0 opacity-5" style={{
            backgroundImage: `radial-gradient(circle, #2ecc71 1px, transparent 1px)`,
            backgroundSize: '50px 50px'
          }}></div>
        </div>

        {/* Clean Welcome Section Container - No special styling */}
        <div className="relative z-10 w-full max-w-6xl mx-auto px-4">
          
          {/* The actual DynamicHeroSection component - TEMPORARILY HIDDEN */}
          {/* <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="relative overflow-hidden rounded-[3rem]"
          >
            <DynamicHeroSection />
          </motion.div> */}

          {/* BEAUTIFUL WELCOME SECTION - Clean Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="relative overflow-hidden p-8 md:p-12 lg:p-16"
          >
            {/* Animated Background Pattern */}
            <div className="absolute inset-0 overflow-hidden">
              {/* Floating geometric shapes */}
              {[...Array(6)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute"
                  style={{
                    left: `${20 + Math.random() * 60}%`,
                    top: `${20 + Math.random() * 60}%`,
                  }}
                  animate={{
                    y: [0, -30, 0],
                    rotate: [0, 360],
                    scale: [1, 1.2, 1],
                  }}
                  transition={{
                    duration: 4 + Math.random() * 3,
                    repeat: Infinity,
                    delay: Math.random() * 2,
                    ease: "easeInOut"
                  }}
                >
                  <div className={`w-4 h-4 ${i % 2 === 0 ? 'bg-[#2ecc71]/20' : 'bg-[#27ae60]/15'} rounded-full blur-sm`}></div>
                </motion.div>
              ))}
              
              {/* Gradient waves */}
              <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-[#2ecc71]/5 to-transparent rounded-full blur-3xl"></div>
              <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-[#27ae60]/5 to-transparent rounded-full blur-3xl"></div>
            </div>

            {/* Main Content */}
            <div className="relative z-10 text-center">
              {/* Logo/Brand Icon */}
              <motion.div
                initial={{ opacity: 0, y: -30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.5 }}
                className="mb-8"
              >
                <div className="w-20 h-20 mx-auto bg-gradient-to-br from-[#2ecc71] to-[#27ae60] rounded-3xl shadow-[8px_8px_16px_rgba(46,204,113,0.2)] flex items-center justify-center mb-4">
                  <FiShoppingBag className="w-10 h-10 text-white" />
                </div>
                <motion.div
                  animate={{ 
                    rotate: [0, 5, -5, 0],
                    scale: [1, 1.05, 1]
                  }}
                  transition={{ 
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-[#2ecc71] to-[#27ae60] bg-clip-text text-transparent"
                >
                  Indiraa1
                </motion.div>
              </motion.div>

              {/* Welcome Text */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.7 }}
                className="mb-8"
              >
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-800 mb-4 leading-tight">
                  Welcome to{' '}
                  <motion.span
                    animate={{ 
                      backgroundPosition: ['0%', '100%', '0%'],
                    }}
                    transition={{ 
                      duration: 3,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                    className="bg-gradient-to-r from-[#2ecc71] via-[#27ae60] to-[#2ecc71] bg-300% bg-clip-text text-transparent"
                    style={{ backgroundSize: '300% 100%' }}
                  >
                    Excellence
                  </motion.span>
                </h1>
                
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 1, delay: 1 }}
                  className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed"
                >
                  Discover premium quality products at unbeatable prices. Your journey to 
                  exceptional shopping experience starts here.
                </motion.p>
              </motion.div>

              {/* Features Grid */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.9 }}
                className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10"
              >
                {[
                  { icon: FiShield, title: 'Premium Quality', desc: 'Only the finest products' },
                  { icon: FiTruck, title: 'Fast Delivery', desc: 'Quick & reliable shipping' },
                  { icon: FiHeart, title: 'Customer Love', desc: '99% satisfaction rate' }
                ].map((feature, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.1 + index * 0.1 }}
                    whileHover={{ 
                      scale: 1.05,
                      y: -5
                    }}
                    className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-[4px_4px_12px_rgba(46,204,113,0.1)] border border-white/50"
                  >
                    <feature.icon className="w-8 h-8 text-[#2ecc71] mx-auto mb-3" />
                    <h3 className="font-semibold text-gray-800 mb-1">{feature.title}</h3>
                    <p className="text-sm text-gray-600">{feature.desc}</p>
                  </motion.div>
                ))}
              </motion.div>

              {/* Call to Action Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 1.3 }}
                className="flex flex-col sm:flex-row gap-4 justify-center items-center"
              >
                <motion.button
                  onClick={() => navigate('/products')}
                  whileHover={{ 
                    scale: 1.05,
                    boxShadow: '0 12px 32px rgba(46,204,113,0.3)'
                  }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-4 bg-gradient-to-r from-[#2ecc71] to-[#27ae60] text-white rounded-2xl font-semibold shadow-[0_8px_24px_rgba(46,204,113,0.2)] transition-all inline-flex items-center gap-3 group"
                >
                  <FiShoppingBag className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                  Start Shopping
                  <motion.div
                    animate={{ x: [0, 5, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    <FiArrowRight className="w-5 h-5" />
                  </motion.div>
                </motion.button>

                <motion.button
                  onClick={() => navigate('/products')}
                  whileHover={{ 
                    scale: 1.05,
                    backgroundColor: 'rgba(46,204,113,0.1)'
                  }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-4 bg-white/80 backdrop-blur-sm text-[#2ecc71] rounded-2xl font-semibold border-2 border-[#2ecc71]/20 hover:border-[#2ecc71]/40 transition-all inline-flex items-center gap-3 group"
                >
                  <FiEye className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  Explore Deals
                </motion.button>
              </motion.div>

              {/* Floating Action Hint */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 2 }}
                className="mt-12"
              >
                <motion.div
                  animate={{ 
                    y: [0, -10, 0],
                  }}
                  transition={{ 
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  className="inline-flex items-center gap-2 text-sm text-gray-500 bg-white/40 backdrop-blur-sm px-4 py-2 rounded-full border border-white/50"
                >
                  <div className="w-2 h-2 bg-[#2ecc71] rounded-full animate-pulse"></div>
                  Scroll down to discover more
                </motion.div>
              </motion.div>
            </div>

            {/* Decorative Corner Elements */}
            <div className="absolute top-4 left-4 w-16 h-16 bg-gradient-to-br from-[#2ecc71]/10 to-transparent rounded-full blur-xl"></div>
            <div className="absolute bottom-4 right-4 w-20 h-20 bg-gradient-to-tl from-[#27ae60]/10 to-transparent rounded-full blur-xl"></div>
          </motion.div>

          {/* Quality indicators footer */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="text-center mt-6 sm:mt-8"
          >
            <div className="flex items-center justify-center gap-4 sm:gap-6 text-xs sm:text-sm text-gray-600 flex-wrap">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-[#2ecc71] rounded-full shadow-[2px_2px_4px_rgba(46,204,113,0.3)]"></div>
                <span className="font-medium">Premium Quality</span>
              </div>
              <div className="w-px h-4 bg-gray-300 rounded-full hidden sm:block"></div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-[#27ae60] rounded-full shadow-[2px_2px_4px_rgba(39,174,96,0.3)]"></div>
                <span className="font-medium">Fast Delivery</span>
              </div>
              <div className="w-px h-4 bg-gray-300 rounded-full hidden sm:block"></div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-[#2ecc71] rounded-full shadow-[2px_2px_4px_rgba(46,204,113,0.3)]"></div>
                <span className="font-medium">Best Prices</span>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.section>

      {/* Stats Section */}
      <motion.section 
        className="py-16 px-4"
        style={{
          y: statsY,
        }}
      >
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-8">
            {[
              { icon: FiUsers, number: '10K+', label: 'Happy Customers' },
              { icon: FiShoppingBag, number: '50K+', label: 'Products Sold' },
              { icon: FiShield, number: '99%', label: 'Satisfaction Rate' },
              { icon: FiTruck, number: '24/7', label: 'Fast Delivery' }
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center bg-white rounded-2xl lg:rounded-3xl p-4 lg:p-6 shadow-[8px_8px_16px_#e8eae8,-8px_-8px_16px_#ffffff]"
              >
                <stat.icon className="w-6 h-6 lg:w-8 lg:h-8 text-[#2ecc71] mx-auto mb-2 lg:mb-3" />
                <div className="text-lg lg:text-2xl font-bold text-gray-800 mb-1">{stat.number}</div>
                <div className="text-gray-600 text-xs lg:text-sm">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Combo Deals Component */}
      <ComboDeals />

      {/* Featured Products Component */}
      <FeaturedProducts />

      {/* New Arrivals */}
      <motion.section 
        className="py-16 px-4 bg-gradient-to-br from-[#f8faf8] to-white"
        style={{
          y: newArrivalsY,
          scale: newArrivalsScale,
        }}
      >
        <div className="max-w-7xl mx-auto">
          <SectionHeader
            title="New Arrivals"
            subtitle="Fresh products just added to our collection"
            icon={FiTrendingUp}
          />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {newArrivals.length > 0 ? (
              newArrivals.map((product, index) => (
                <ProductCard 
                  key={product._id} 
                  product={product} 
                  index={index}
                  onAddToWishlist={addToWishlist}
                  onAddToCart={addToCart}
                  isInWishlist={isInWishlist}
                  navigate={navigate}
                />
              ))
            ) : (
              <div className="col-span-full text-center py-8">
                <div className="bg-white rounded-3xl p-6 shadow-[8px_8px_16px_#e8eae8,-8px_-8px_16px_#ffffff] max-w-sm mx-auto">
                  <FiTrendingUp className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">New arrivals coming soon!</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.section>

      {/* Top Rated */}
      <motion.section 
        className="py-16 px-4"
        style={{
          y: topRatedY,
        }}
      >
        <div className="max-w-7xl mx-auto">
          <SectionHeader
            title="Top Rated"
            subtitle="Products with the highest customer ratings"
            icon={FiShield}
          />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {topRated.length > 0 ? (
              topRated.map((product, index) => (
                <ProductCard 
                  key={product._id} 
                  product={product} 
                  index={index}
                  onAddToWishlist={addToWishlist}
                  onAddToCart={addToCart}
                  isInWishlist={isInWishlist}
                  navigate={navigate}
                />
              ))
            ) : (
              <div className="col-span-full text-center py-8">
                <div className="bg-white rounded-3xl p-6 shadow-[8px_8px_16px_#e8eae8,-8px_-8px_16px_#ffffff] max-w-sm mx-auto">
                  <FiShield className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">Top rated products coming soon!</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.section>

      {/* CTA Section */}
      <motion.section 
        className="py-20 px-4"
        style={{
          y: ctaY,
          scale: ctaScale,
        }}
      >
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-white rounded-3xl p-12 shadow-[8px_8px_16px_#e8eae8,-8px_-8px_16px_#ffffff] text-center"
          >
            <h2 className="text-4xl font-bold text-gray-800 mb-6">
              Ready to Start Shopping?
            </h2>
            <p className="text-gray-600 mb-8 text-lg">
              Join thousands of satisfied customers and discover amazing deals on quality products.
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/products')}
              className="px-12 py-4 bg-[#2ecc71] text-white rounded-2xl font-semibold shadow-[0_8px_24px_rgba(46,204,113,0.2)] hover:shadow-[0_12px_32px_rgba(46,204,113,0.3)] transition-all inline-flex items-center gap-3"
            >
              <FiShoppingBag className="w-5 h-5" />
              Explore All Products
              <FiArrowRight className="w-5 h-5" />
            </motion.button>
          </motion.div>
        </div>
      </motion.section>
    </motion.div>
  );
};

export default Home;
