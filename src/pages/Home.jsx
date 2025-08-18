import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, useScroll, useTransform, useMotionValue, useSpring } from 'framer-motion';
import { FiShoppingBag, FiStar, FiTrendingUp, FiArrowRight, FiHeart, FiShoppingCart, FiEye, FiUsers, FiShield, FiTruck, FiPackage, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import toast from 'react-hot-toast';

// Import the new components
import ComboDeals from '../components/home/ComboDeals';
import FeaturedProducts from '../components/home/FeaturedProducts';
import DynamicHeroSection from '../components/DynamicHeroSection';

// Horizontal scrollable product section component
const HorizontalProductSection = ({ title, products, icon: Icon, sectionId, onAddToWishlist, onAddToCart, isInWishlist, navigate }) => {
  const scrollRef = useRef(null);
  
  const scroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = 220; // Width of card + gap
      const currentScroll = scrollRef.current.scrollLeft;
      const targetScroll = direction === 'left' 
        ? currentScroll - scrollAmount 
        : currentScroll + scrollAmount;
      
      scrollRef.current.scrollTo({
        left: targetScroll,
        behavior: 'smooth'
      });
    }
  };

  if (!products || products.length === 0) {
    return (
      <section className="py-6 px-4">
        <div className="w-full">
          <div className="flex items-center justify-between mb-4 px-4">
            <div className="flex items-center gap-2">
              <Icon className="w-5 h-5 text-[#2ecc71]" />
              <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
            </div>
          </div>
          <div className="text-center py-6 px-4">
            <div className="bg-white rounded-xl p-4 shadow-[4px_4px_8px_#e8eae8,-4px_-4px_8px_#ffffff] max-w-sm mx-auto">
              <Icon className="w-6 h-6 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-500">No products available</p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-6 px-4">
      <div className="w-full">
        <div className="flex items-center justify-between mb-4 px-4">
          <div className="flex items-center gap-2">
            <Icon className="w-5 h-5 text-[#2ecc71]" />
            <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
            <span className="text-xs text-gray-500">({products.length} items)</span>
          </div>
          
          {products.length > 6 && (
            <div className="flex gap-2">
              <button
                onClick={() => scroll('left')}
                className="p-2 bg-white rounded-lg shadow-[4px_4px_8px_#e8eae8,-4px_-4px_8px_#ffffff] hover:shadow-[6px_6px_12px_#e8eae8,-6px_-6px_12px_#ffffff] text-[#2ecc71] transition-all"
              >
                <FiChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => scroll('right')}
                className="p-2 bg-white rounded-lg shadow-[4px_4px_8px_#e8eae8,-4px_-4px_8px_#ffffff] hover:shadow-[6px_6px_12px_#e8eae8,-6px_-6px_12px_#ffffff] text-[#2ecc71] transition-all"
              >
                <FiChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
        
        <div className="relative px-4">
          <div 
            ref={scrollRef}
            className="flex gap-4 overflow-x-auto scrollbar-hide pb-2"
            style={{ 
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
              WebkitScrollbarDisplay: 'none'
            }}
          >
            {products.map((product, index) => (
              <ProductCard 
                key={product._id} 
                product={product} 
                index={index}
                onAddToWishlist={onAddToWishlist}
                onAddToCart={onAddToCart}
                isInWishlist={isInWishlist}
                navigate={navigate}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

// ProductCard component for other sections
const ProductCard = ({ product, index, onAddToWishlist, onAddToCart, isInWishlist, navigate }) => {
  const productIsWishlisted = isInWishlist(product._id);
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="bg-white rounded-xl p-3 shadow-[4px_4px_8px_#e8eae8,-4px_-4px_8px_#ffffff] hover:shadow-[8px_8px_16px_#e8eae8,-8px_-8px_16px_#ffffff] transition-all duration-300 group relative min-w-[200px] flex-shrink-0 border border-white/50"
      style={{ aspectRatio: '3/4' }}
      whileHover={{ y: -5 }}
    >
      {/* Wishlist indicator - always visible if wishlisted */}
      {productIsWishlisted && (
        <div className="absolute top-2 left-2 z-10">
          <div className="p-1.5 bg-red-500 text-white rounded-lg shadow-lg">
            <FiHeart className="w-3 h-3 fill-current" />
          </div>
        </div>
      )}
      
      <div className="relative mb-3">
        <div className="home-hero-banner-bg">
          <img
            src={product.images?.[0] || product.image || '/placeholder.png'}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
          <div className="home-hero-overlay"></div>
        </div>
        <div className="absolute top-1 right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => onAddToWishlist(product._id)}
            className={`p-1.5 rounded-lg shadow-[2px_2px_4px_#e8eae8,-2px_-2px_4px_#ffffff] transition-all ${
              productIsWishlisted 
                ? 'bg-red-500 text-white hover:bg-red-600' 
                : 'bg-white hover:bg-red-50 hover:text-red-500'
            }`}
          >
            <FiHeart className={`w-3 h-3 ${productIsWishlisted ? 'fill-current' : ''}`} />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => navigate(`/products/${product._id}`)}
            className="p-1.5 bg-white rounded-lg shadow-[2px_2px_4px_#e8eae8,-2px_-2px_4px_#ffffff] hover:bg-blue-50 hover:text-blue-500 transition-all"
          >
            <FiEye className="w-3 h-3" />
          </motion.button>
        </div>
      </div>
      
      <div className="space-y-2">
        <h3 className="font-medium text-sm text-gray-800 line-clamp-2 group-hover:text-[#2ecc71] transition-colors leading-tight">
          {product.name}
        </h3>
        
        <div className="flex items-center justify-between">
          <span className="text-[#2ecc71] font-semibold text-sm">₹{product.price.toLocaleString()}</span>
          <div className="flex items-center gap-1">
            <FiStar className="w-3 h-3 text-yellow-400 fill-current" />
            <span className="text-xs text-gray-600 font-medium">4.5</span>
          </div>
        </div>
        
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onAddToCart(product._id)}
          className="home-add-to-cart-button group"
        >
          <FiShoppingCart className="w-3 h-3 group-hover:rotate-12 transition-transform" />
          Add to Cart
        </motion.button>
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
  const [categorizedProducts, setCategorizedProducts] = useState({});
  const [scrollPositions, setScrollPositions] = useState({});
  
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
      // Use standard API to fetch products
      const response = await fetch('https://indiraa1-backend.onrender.com/api/products');
      const data = await response.json();
      
      if (data.products && data.products.length > 0) {
        setProducts(data.products);
        
        // Organize products by categories
        const categories = {};
        data.products.forEach(product => {
          const category = product.category || 'Others';
          if (!categories[category]) {
            categories[category] = [];
          }
          categories[category].push(product);
        });
        setCategorizedProducts(categories);
        
        // Create new arrivals and top rated from the same data
        const shuffled = [...data.products].sort(() => 0.5 - Math.random());
        setNewArrivals(shuffled.slice(0, 8));
        setTopRated(shuffled.slice(8, 16));
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

      // Use standard API to fetch wishlist
      const response = await fetch('https://indiraa1-backend.onrender.com/api/wishlist', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      setWishlistItems(data || []);
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
      // Add to cart using standard API
      const response = await fetch('/api/cart/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ productId, quantity: 1 })
      });

      const result = await response.json();

      if (response.ok && result.success) {
        toast.success('Added to cart!');
      } else {
        throw new Error(result.message || 'Failed to add to cart');
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
      className="text-center mb-6"
    >
      <div className="flex items-center justify-center gap-2 mb-2">
        <Icon className="w-5 h-5 text-[#2ecc71]" />
        <h2 className="text-xl font-semibold text-gray-800">{title}</h2>
      </div>
      <p className="text-sm text-gray-600 max-w-2xl mx-auto">{subtitle}</p>
    </motion.div>
  );  return (
    <motion.div 
      ref={containerRef}
      className="min-h-screen bg-[#f8faf8] relative overflow-hidden w-full"
      onMouseMove={handleMouseMove}
    >
      {/* Add custom styles for scrollbar hiding */}
      <style jsx>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
      {/* Animated Background Elements */}
      <div className="fixed inset-0 pointer-events-none">
        {/* Floating Orbs */}
        <motion.div
          className="home-bg-decoration-large"
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
          className="home-bg-decoration-medium"
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
          className="home-bg-decoration-medium"
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
          className="home-progress-bar"
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

      {/* Unified Dynamic Hero Banner Section - Optimized 18:9 Panoramic Container */}
      <motion.section 
        className="relative py-6 px-2 sm:px-3 md:px-4 lg:px-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        style={{
          y: heroY,
          scale: heroScale,
          rotate: heroRotate,
        }}
      >
        {/* Hero Section Background Elements */}
        <div className="home-main-content-bg">
          {/* Decorative geometric patterns */}
          <div className="home-decoration-circle-1"></div>
          <div className="home-decoration-circle-2"></div>
          <div className="home-decoration-circle-3"></div>
          
          {/* Floating coins animation */}
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              className="home-floating-coin"
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
              <div className="home-bubble-gradient"></div>
            </motion.div>
          ))}
          
          {/* Grid pattern overlay */}
          <div className="home-grid-pattern"></div>
        </div>

    {/* Dynamic Hero Banner with Perfect 18:9 Panoramic Aspect Ratio (fixed height on >=1024px) */}
    <div className="relative z-[60] w-full">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
      className="relative overflow-hidden rounded-lg sm:rounded-xl md:rounded-2xl lg:rounded-3xl w-full shadow-lg hover:shadow-xl transition-shadow duration-300 hero-panorama"
          >
            <DynamicHeroSection />
          </motion.div>

          {/* Quality indicators footer */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="text-center mt-4"
          >
            <div className="flex items-center justify-center gap-6 text-sm text-gray-600 flex-wrap w-full">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-[#2ecc71] rounded-full shadow-[2px_2px_4px_rgba(46,204,113,0.3)]"></div>
                <span className="font-medium">Premium Quality</span>
              </div>
              <div className="w-px h-4 bg-gray-300 rounded-full"></div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-[#27ae60] rounded-full shadow-[2px_2px_4px_rgba(39,174,96,0.3)]"></div>
                <span className="font-medium">Fast Delivery</span>
              </div>
              <div className="w-px h-4 bg-gray-300 rounded-full"></div>
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
        className="py-6 px-4"
        style={{
          y: statsY,
        }}
      >
        <div className="w-full">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4 px-4">
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
                className="text-center bg-white rounded-xl p-3 lg:p-4 shadow-[4px_4px_8px_#e8eae8,-4px_-4px_8px_#ffffff] hover:shadow-[6px_6px_12px_#e8eae8,-6px_-6px_12px_#ffffff] transition-all duration-300"
              >
                <stat.icon className="w-5 h-5 text-[#2ecc71] mx-auto mb-2" />
                <div className="text-lg font-semibold text-gray-800 mb-1">{stat.number}</div>
                <div className="text-gray-600 text-xs font-medium">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Combo Deals Component */}
      <ComboDeals />

      {/* Featured Products Component */}
      <FeaturedProducts />

      {/* Category-based Product Sections */}
      {Object.entries(categorizedProducts).map(([category, products]) => {
        const categoryIcons = {
          'Beverages': FiPackage,
          'Electronics': FiTrendingUp,
          'Spinach': FiShield,
          'Accessories': FiHeart,
          'Others': FiShoppingBag
        };
        
        return (
          <HorizontalProductSection
            key={category}
            title={category}
            products={products}
            icon={categoryIcons[category] || FiShoppingBag}
            sectionId={category.toLowerCase()}
            onAddToWishlist={addToWishlist}
            onAddToCart={addToCart}
            isInWishlist={isInWishlist}
            navigate={navigate}
          />
        );
      })}

      {/* New Arrivals */}
      <HorizontalProductSection
        title="New Arrivals"
        products={newArrivals}
        icon={FiTrendingUp}
        sectionId="new-arrivals"
        onAddToWishlist={addToWishlist}
        onAddToCart={addToCart}
        isInWishlist={isInWishlist}
        navigate={navigate}
      />

      {/* Top Rated */}
      <HorizontalProductSection
        title="Top Rated"
        products={topRated}
        icon={FiStar}
        sectionId="top-rated"
        onAddToWishlist={addToWishlist}
        onAddToCart={addToCart}
        isInWishlist={isInWishlist}
        navigate={navigate}
      />

      {/* CTA Section */}
      <motion.section 
        className="home-footer-cta-bg"
        style={{
          y: ctaY,
          scale: ctaScale,
        }}
      >
        <div className="w-full">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-white rounded-2xl p-8 shadow-[4px_4px_8px_#e8eae8,-4px_-4px_8px_#ffffff] hover:shadow-[8px_8px_16px_#e8eae8,-8px_-8px_16px_#ffffff] transition-all duration-300 text-center mx-4"
          >
            <div className="mb-4">
              <div className="home-cta-icon-bg">
                <FiShoppingBag className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-2xl font-semibold text-gray-800 mb-2">
                Ready to Start Shopping?
              </h2>
              <p className="text-gray-600 text-sm max-w-md mx-auto">
                Join thousands of satisfied customers and discover amazing deals on quality products.
              </p>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/products')}
              className="home-cta-button"
            >
              <FiShoppingBag className="w-4 h-4 group-hover:rotate-12 transition-transform" />
              Explore All Products
              <motion.div
                animate={{ x: [0, 3, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <FiArrowRight className="w-4 h-4" />
              </motion.div>
            </motion.button>
          </motion.div>
        </div>
      </motion.section>
    </motion.div>
  );
};

export default Home;
