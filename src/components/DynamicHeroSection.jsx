import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiChevronLeft, FiChevronRight, FiPlay, FiPause, FiShoppingBag, FiArrowRight, FiTruck, FiPackage, FiStar, FiDollarSign, FiUsers, FiGift } from 'react-icons/fi';

const DynamicHeroSection = () => {
  const [banners, setBanners] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewedBanners, setViewedBanners] = useState(new Set()); // Track which banners have been viewed
  const intervalRef = useRef(null);

  const API_BASE_URL = 'https://indiraa1-backend.onrender.com/api';

  // Fetch active banners from API
  useEffect(() => {
    fetchBanners();
  }, []);

  // Auto-play functionality
  useEffect(() => {
    if (isPlaying && banners.length > 1) {
      intervalRef.current = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % banners.length);
      }, 5000); // Change slide every 5 seconds
    } else {
      clearInterval(intervalRef.current);
    }

    return () => clearInterval(intervalRef.current);
  }, [isPlaying, banners.length]);

  // Track view when slide changes
  useEffect(() => {
    if (banners.length > 0 && currentSlide < banners.length) {
      const currentBanner = banners[currentSlide];
      // Only track views for actual banners (not welcome message) and only once per session
      if (currentBanner && currentBanner._id && !currentBanner.isWelcomeMessage && !viewedBanners.has(currentBanner._id)) {
        // Add a small delay to ensure the banner is actually viewed
        const viewTimer = setTimeout(() => {
          trackBannerView(currentBanner._id);
          // Mark this banner as viewed
          setViewedBanners(prev => new Set([...prev, currentBanner._id]));
        }, 1000); // 1 second delay
        
        return () => clearTimeout(viewTimer);
      }
    }
  }, [currentSlide, banners, viewedBanners]);

  // Default welcome message content (separate from banners)
  const defaultWelcomeMessage = {
    _id: 'default-welcome',
    title: 'Welcome to Indiraa1',
    subtitle: 'Discover premium products with exceptional quality and unbeatable prices.',
    description: 'Earn rewards with every purchase • Get exclusive referral bonuses • Premium quality guaranteed',
    ctaText: 'Shop Now',
    ctaLink: '/products',
    isWelcomeMessage: true, // Special flag for welcome message styling
    textColor: '#2ecc71', // Green text for welcome message
    textShadow: false, // No text shadow for welcome message
    buttons: [
      { text: 'Explore Products', link: '/products', type: 'primary' },
      { text: 'Learn More', link: '/about', type: 'secondary' }
    ]
  };

  const fetchBanners = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Fetching banners from:', `${API_BASE_URL}/banners/active`);
      
      const response = await fetch(`${API_BASE_URL}/banners/active`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Banners response:', data);
      
      // Handle different response formats
      let bannersArray = [];
      if (Array.isArray(data)) {
        bannersArray = data;
      } else if (data.banners && Array.isArray(data.banners)) {
        bannersArray = data.banners;
      } else if (data.data && Array.isArray(data.data)) {
        bannersArray = data.data;
      }
      
      // Filter only active banners and sort by priority
      const activeBanners = bannersArray
        .sort((a, b) => (b.priority || 0) - (a.priority || 0));
      
      // Always include default welcome message as first slide
      const allSlides = [defaultWelcomeMessage, ...activeBanners];
      
      console.log('All slides (including welcome message):', allSlides);
      setBanners(allSlides);
      
    } catch (err) {
      console.error('Error fetching banners:', err);
      setError(err.message);
      // Set only default welcome message if API fails
      setBanners([defaultWelcomeMessage]);
    } finally {
      setLoading(false);
    }
  };

  // Track banner view
  const trackBannerView = async (bannerId) => {
    try {
      console.log(`Banner viewed: ${bannerId}`);
      
      // TODO: Implement proper view tracking endpoint
      // For now, just log to prevent double counting from backend auto-increment
      
      // Uncomment below when backend adds proper track-view endpoint
      // and removes auto-increment from getActiveBanners
      /*
      const response = await fetch(`${API_BASE_URL}/banners/${bannerId}/track-view`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('View tracked successfully:', data);
      } else {
        console.error('Failed to track view:', response.statusText);
      }
      */
    } catch (error) {
      console.error('Error tracking banner view:', error);
    }
  };

  // Track banner click and navigate
  const handleBannerClick = async (banner, event) => {
    // Don't handle click if it's on a button or the banner has CTA buttons
    if (event.target.closest('button') || event.target.closest('a')) {
      return;
    }
    
    // Don't handle click if banner has buttons (buttons should handle their own clicks)
    if (banner.buttons && banner.buttons.length > 0) {
      return;
    }
    
    try {
      // Track click for actual banners (not welcome message)
      if (banner._id && !banner.isWelcomeMessage) {
        await fetch(`${API_BASE_URL}/banners/${banner._id}/click`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          }
        });
        console.log(`Tracked click for banner: ${banner._id}`);
      }
      
      // Navigate to CTA link or products page
      const targetUrl = banner.ctaLink || '/products';
      window.location.href = targetUrl;
    } catch (error) {
      console.error('Error tracking banner click:', error);
      // Still navigate even if tracking fails
      const targetUrl = banner.ctaLink || '/products';
      window.location.href = targetUrl;
    }
  };

  // Handle button click with tracking
  const handleButtonClick = async (banner, button, event) => {
    event.stopPropagation(); // Prevent banner click
    
    try {
      // Track click for actual banners (not welcome message)
      if (banner._id && !banner.isWelcomeMessage) {
        await fetch(`${API_BASE_URL}/banners/${banner._id}/click`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          }
        });
        console.log(`Tracked button click for banner: ${banner._id}`);
      }
      
      // Navigate to button link
      window.location.href = button.link || '/products';
    } catch (error) {
      console.error('Error tracking button click:', error);
      // Still navigate even if tracking fails
      window.location.href = button.link || '/products';
    }
  };

  const goToSlide = (index) => {
    if (index !== currentSlide) {
      setCurrentSlide(index);
    }
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % banners.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + banners.length) % banners.length);
  };

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === 'ArrowLeft') prevSlide();
      if (e.key === 'ArrowRight') nextSlide();
      if (e.key === ' ') {
        e.preventDefault();
        togglePlayPause();
      }          
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [banners.length]);

  // Position mapping for text alignment - responsive positioning
  const getPositionClasses = (position) => {
    // On small/medium screens: use original positioning
    // On large screens: simplify to center vertical for top/bottom positions
    const positions = {
      'top-left': 'items-start justify-start text-left lg:items-center lg:justify-start lg:text-left',
      'top-center': 'items-start justify-center text-center lg:items-center lg:justify-center lg:text-center',
      'top-right': 'items-start justify-end text-right lg:items-center lg:justify-end lg:text-right',
      'center-left': 'items-center justify-start text-left',
      'center': 'items-center justify-center text-center',
      'center-right': 'items-center justify-end text-right',
      'bottom-left': 'items-end justify-start text-left lg:items-center lg:justify-start lg:text-left',
      'bottom-center': 'items-end justify-center text-center lg:items-center lg:justify-center lg:text-center',
      'bottom-right': 'items-end justify-end text-right lg:items-center lg:justify-end lg:text-right'
    };
    return positions[position] || positions['center'];
  };

  // Loading state with enhanced animation
  if (loading) {
    return (
      <section className="relative w-full h-full bg-gradient-to-br from-[#f8faf8] via-white to-[#e8eae8] flex items-center justify-center overflow-hidden rounded-xl sm:rounded-2xl">
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="text-center p-8 md:p-12 bg-white/90 rounded-3xl shadow-lg border border-white/50 relative z-10"
        >
          <div className="relative mb-6">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="w-16 h-16 border-4 border-[#2ecc71]/30 border-t-[#2ecc71] rounded-full mx-auto shadow-[8px_8px_16px_rgba(232,234,232,0.6),-8px_-8px_16px_rgba(255,255,255,0.9)]"
            />
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="absolute inset-0 w-16 h-16 border-2 border-[#27ae60]/20 rounded-full mx-auto"
            />
          </div>
          <motion.h3
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-xl font-bold text-gray-800 mb-2"
          >
            Loading Amazing Banners...
          </motion.h3>
          <p className="text-gray-600 font-medium">Preparing your shopping experience</p>
        </motion.div>
      </section>
    );
  }

  // Error state - now shows default banner with proper theme styling
  if (error && banners.length === 0) {
    return (
      <section className="relative w-full h-full overflow-hidden rounded-xl sm:rounded-2xl bg-gradient-to-br from-[#f8faf8] to-[#e8eae8]">
        {/* Show default banner when there's an error */}
        <div className="absolute inset-0 rounded-xl sm:rounded-2xl overflow-hidden">
          <div className="relative w-full h-full">
            {/* Default banner background with theme styling */}
            <div className="absolute inset-0 rounded-xl sm:rounded-2xl overflow-hidden">
              <div className="w-full h-full bg-gradient-to-br from-[#2ecc71] via-[#27ae60] to-[#2ecc71] relative rounded-xl sm:rounded-2xl">
                {/* Animated background patterns */}
                <div className="absolute inset-0">
                  {[...Array(6)].map((_, i) => (
                    <motion.div
                      key={`error-shape-${i}`}
                      animate={{
                        y: [-20, 20, -20],
                        x: [-10, 10, -10],
                        rotate: [0, 180, 360],
                        opacity: [0.3, 0.6, 0.3],
                      }}
                      transition={{
                        duration: 8 + i,
                        repeat: Infinity,
                        delay: i * 1.2,
                        ease: "easeInOut"
                      }}
                      className={`absolute ${i % 2 === 0 ? 'w-20 h-20' : 'w-16 h-16'} bg-white/20 ${i % 3 === 0 ? 'rounded-full' : 'rounded-2xl'}`}
                      style={{
                        left: `${15 + i * 15}%`,
                        top: `${20 + i * 12}%`,
                      }}
                    />
                  ))}
                  
                  <div className="absolute inset-0 opacity-20" style={{
                    backgroundImage: `radial-gradient(circle, white 1px, transparent 1px)`,
                    backgroundSize: '60px 60px'
                  }}></div>
                </div>
              </div>
              
              <div className="absolute inset-0 bg-gradient-to-r from-[#2ecc71]/70 to-[#27ae60]/70 rounded-xl sm:rounded-2xl" />
            </div>

            {/* Simplified error state content */}
            <div className="absolute inset-0 flex p-4 sm:p-6 md:p-8 lg:p-12 items-center justify-center text-center">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.6 }}
                className="max-w-2xl"
              >
                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.5 }}
                  className="text-2xl md:text-4xl lg:text-5xl font-bold mb-3 md:mb-4 leading-tight text-white"
                  style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.5)' }}
                >
                  Welcome to Indiraa1
                </motion.h1>

                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.5 }}
                  className="text-base md:text-lg lg:text-xl mb-4 md:mb-6 leading-relaxed text-white"
                  style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.4)' }}
                >
                  Discover premium products with exceptional quality and unbeatable prices.
                </motion.p>

                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5, duration: 0.5 }}
                  className="text-sm md:text-base mb-4 md:mb-6 leading-relaxed opacity-90 text-white"
                  style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.3)' }}
                >
                  Earn rewards with every purchase • Get exclusive referral bonuses • Premium quality guaranteed
                </motion.p>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6, duration: 0.5 }}
                >
                  <motion.a
                    href="/products"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="inline-flex items-center gap-2 px-6 md:px-8 py-3 md:py-4 bg-white text-[#2ecc71] font-semibold rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl"
                  >
                    <FiShoppingBag className="w-4 h-4" />
                    Shop Now
                    <FiArrowRight className="w-4 h-4" />
                  </motion.a>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  const currentBanner = banners[currentSlide];

  return (
    <section className="relative w-full h-full overflow-hidden rounded-xl sm:rounded-2xl bg-gradient-to-br from-[#f8faf8] to-[#e8eae8]">
      {/* Background Banners */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentSlide}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.7, ease: "easeInOut" }}
          className="absolute inset-0 rounded-xl sm:rounded-2xl overflow-hidden"
          onClick={(e) => handleBannerClick(currentBanner, e)}
          style={{ cursor: (currentBanner.buttons && currentBanner.buttons.length > 0) ? 'default' : 'pointer' }}
        >
          <div className="relative w-full h-full">
            {/* Background Image with overlay */}
            <div className="absolute inset-0 rounded-xl sm:rounded-2xl overflow-hidden">
              {/* Welcome message with white background or API banner image */}
              {currentBanner.isWelcomeMessage ? (
                <div className="w-full h-full bg-gradient-to-br from-white via-[#f8faf8] to-[#e8eae8] relative rounded-xl sm:rounded-2xl">
                  {/* Animated floating bubbles and decorations for welcome message */}
                  <div className="absolute inset-0">
                    {/* Decorative floating icons for welcome message */}
                    {[
                      { Icon: FiGift, delay: 0 },
                      { Icon: FiStar, delay: 1 },
                      { Icon: FiTruck, delay: 2 },
                      { Icon: FiDollarSign, delay: 3 },
                      { Icon: FiUsers, delay: 4 },
                      { Icon: FiPackage, delay: 5 }
                    ].map((item, i) => (
                      <motion.div
                        key={`icon-${i}`}
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ 
                          opacity: [0, 0.6, 0],
                          scale: [0, 1, 0],
                          y: [-10, 10, -10],
                        }}
                        transition={{
                          duration: 4,
                          repeat: Infinity,
                          delay: item.delay,
                          ease: "easeInOut"
                        }}
                        className="absolute text-[#2ecc71]/40"
                        style={{
                          right: `${20 + i * 8}%`,
                          bottom: `${30 + i * 5}%`,
                        }}
                      >
                        <item.Icon className="w-6 h-6" />
                      </motion.div>
                    ))}
                    
                    {/* Floating green bubbles */}
                    {[...Array(8)].map((_, i) => (
                      <motion.div
                        key={`bubble-${i}`}
                        animate={{
                          y: [-30, 30, -30],
                          x: [-15, 15, -15],
                          scale: [0.8, 1.2, 0.8],
                          opacity: [0.2, 0.5, 0.2],
                        }}
                        transition={{
                          duration: 6 + i * 0.5,
                          repeat: Infinity,
                          delay: i * 0.8,
                          ease: "easeInOut"
                        }}
                        className="absolute rounded-full bg-gradient-to-br from-[#2ecc71]/30 to-[#27ae60]/20 shadow-lg"
                        style={{
                          width: `${40 + i * 8}px`,
                          height: `${40 + i * 8}px`,
                          left: `${10 + i * 12}%`,
                          top: `${15 + i * 10}%`,
                        }}
                      />
                    ))}
                    
                    {/* Decorative geometric shapes */}
                    {[...Array(4)].map((_, i) => (
                      <motion.div
                        key={`shape-${i}`}
                        animate={{
                          rotate: [0, 360],
                          scale: [1, 1.1, 1],
                        }}
                        transition={{
                          duration: 10 + i * 2,
                          repeat: Infinity,
                          ease: "linear"
                        }}
                        className="absolute w-16 h-16 border-2 border-[#2ecc71]/20 rounded-xl opacity-30"
                        style={{
                          right: `${20 + i * 15}%`,
                          top: `${25 + i * 15}%`,
                        }}
                      />
                    ))}
                    
                    {/* Subtle dot pattern */}
                    <div className="absolute inset-0 opacity-10" style={{
                      backgroundImage: `radial-gradient(circle, #2ecc71 2px, transparent 2px)`,
                      backgroundSize: '80px 80px'
                    }}></div>
                  </div>
                </div>
              ) : currentBanner.isDefault ? (
                <div className="w-full h-full bg-gradient-to-br from-[#2ecc71] via-[#27ae60] to-[#2ecc71] relative rounded-xl sm:rounded-2xl">
                  {/* Animated background patterns for default banner */}
                  <div className="absolute inset-0">
                    {/* Floating geometric shapes */}
                    {[...Array(6)].map((_, i) => (
                      <motion.div
                        key={`shape-${i}`}
                        animate={{
                          y: [-20, 20, -20],
                          x: [-10, 10, -10],
                          rotate: [0, 180, 360],
                          opacity: [0.3, 0.6, 0.3],
                        }}
                        transition={{
                          duration: 8 + i,
                          repeat: Infinity,
                          delay: i * 1.2,
                          ease: "easeInOut"
                        }}
                        className={`absolute ${i % 2 === 0 ? 'w-20 h-20' : 'w-16 h-16'} bg-white/20 ${i % 3 === 0 ? 'rounded-full' : 'rounded-2xl'}`}
                        style={{
                          left: `${15 + i * 15}%`,
                          top: `${20 + i * 12}%`,
                        }}
                      />
                    ))}
                    
                    {/* Grid pattern overlay */}
                    <div className="absolute inset-0 opacity-20" style={{
                      backgroundImage: `radial-gradient(circle, white 1px, transparent 1px)`,
                      backgroundSize: '60px 60px'
                    }}></div>
                  </div>
                </div>
              ) : (
                <img
                  src={currentBanner.imageUrl || currentBanner.image}
                  alt={currentBanner.title || 'Banner'}
                  className="w-full h-full object-cover rounded-xl sm:rounded-2xl"
                />
              )}
              
              {/* Overlay - only for non-welcome message slides */}
              {!currentBanner.isWelcomeMessage && (
                <div 
                  className="absolute inset-0 rounded-xl sm:rounded-2xl"
                  style={{ 
                    backgroundColor: currentBanner.backgroundColor || 'rgba(0, 0, 0, 0.3)',
                    background: `linear-gradient(135deg, ${currentBanner.backgroundColor || 'rgba(0, 0, 0, 0.3)'}, ${currentBanner.backgroundColor || 'rgba(0, 0, 0, 0.1)'})`
                  }}
                />
              )}
            </div>

            {/* Simplified content with pure text styling */}
            <div className={`absolute inset-0 flex p-4 sm:p-6 md:p-8 lg:p-12 ${getPositionClasses(currentBanner.textPosition)}`}>
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.6 }}
                className="max-w-2xl"
              >
                {/* Title */}
                {currentBanner.title && (
                  <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                    className="text-2xl md:text-4xl lg:text-5xl font-bold mb-3 md:mb-4 leading-tight"
                    style={{ 
                      color: currentBanner.textColor || (currentBanner.isWelcomeMessage ? '#2ecc71' : '#ffffff'),
                      textShadow: currentBanner.isWelcomeMessage ? 'none' : '2px 2px 4px rgba(0,0,0,0.5)'
                    }}
                  >
                    {currentBanner.title}
                  </motion.h1>
                )}

                {/* Subtitle */}
                {currentBanner.subtitle && (
                  <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4, duration: 0.5 }}
                    className="text-base md:text-lg lg:text-xl mb-4 md:mb-6 leading-relaxed"
                    style={{ 
                      color: currentBanner.textColor || (currentBanner.isWelcomeMessage ? '#666666' : '#ffffff'),
                      textShadow: currentBanner.isWelcomeMessage ? 'none' : '1px 1px 2px rgba(0,0,0,0.4)'
                    }}
                  >
                    {currentBanner.subtitle}
                  </motion.p>
                )}

                {/* Description */}
                {currentBanner.description && (
                  <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5, duration: 0.5 }}
                    className="text-sm md:text-base mb-4 md:mb-6 leading-relaxed opacity-90"
                    style={{ 
                      color: currentBanner.textColor || (currentBanner.isWelcomeMessage ? '#888888' : '#ffffff'),
                      textShadow: currentBanner.isWelcomeMessage ? 'none' : '1px 1px 2px rgba(0,0,0,0.3)'
                    }}
                  >
                    {currentBanner.description}
                  </motion.p>
                )}

                {/* CTA Button - simplified styling */}
                {currentBanner.ctaText && currentBanner.ctaLink && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6, duration: 0.5 }}
                  >
                    <motion.button
                      onClick={(e) => handleButtonClick(currentBanner, { link: currentBanner.ctaLink, text: currentBanner.ctaText }, e)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="inline-flex items-center gap-2 px-6 md:px-8 py-3 md:py-4 bg-[#2ecc71] hover:bg-[#27ae60] text-white font-semibold rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl"
                    >
                      <FiShoppingBag className="w-4 h-4" />
                      {currentBanner.ctaText}
                      <FiArrowRight className="w-4 h-4" />
                    </motion.button>
                  </motion.div>
                )}

                {/* Additional buttons - simplified styling */}
                {currentBanner.buttons && currentBanner.buttons.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7, duration: 0.5 }}
                    className="flex flex-wrap gap-3 mt-4"
                  >
                    {currentBanner.buttons.map((button, index) => (
                      <motion.button
                        key={index}
                        onClick={(e) => handleButtonClick(currentBanner, button, e)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className={`px-4 md:px-6 py-2 md:py-3 rounded-lg font-medium transition-all duration-300 ${
                          button.type === 'primary' 
                            ? 'bg-[#2ecc71] hover:bg-[#27ae60] text-white shadow-lg'
                            : 'bg-white/30 hover:bg-white/40 text-white border border-white/50'
                        }`}
                      >
                        {button.text}
                      </motion.button>
                    ))}
                  </motion.div>
                )}
              </motion.div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Minimal Navigation Controls - only show if more than 1 banner */}
      {banners.length > 1 && (
        <>
          {/* Minimal Previous/Next Buttons */}
          <button
            onClick={prevSlide}
            className="absolute left-1 sm:left-2 md:left-4 top-1/2 transform -translate-y-1/2 p-1.5 sm:p-2 bg-black/30 text-white rounded-full hover:bg-black/50 transition-all duration-300 opacity-60 hover:opacity-90 z-10"
          >
            <FiChevronLeft className="w-3 h-3 sm:w-4 sm:h-4" />
          </button>
          
          <button
            onClick={nextSlide}
            className="absolute right-1 sm:right-2 md:right-4 top-1/2 transform -translate-y-1/2 p-1.5 sm:p-2 bg-black/30 text-white rounded-full hover:bg-black/50 transition-all duration-300 opacity-60 hover:opacity-90 z-10"
          >
            <FiChevronRight className="w-3 h-3 sm:w-4 sm:h-4" />
          </button>

          {/* Minimal Play/Pause Button */}
          <button
            onClick={togglePlayPause}
            className="absolute bottom-2 sm:bottom-4 right-2 sm:right-4 p-1.5 sm:p-2 bg-black/30 text-white rounded-full hover:bg-black/50 transition-all duration-300 opacity-60 hover:opacity-90 z-10"
          >
            {isPlaying ? <FiPause className="w-2.5 h-2.5 sm:w-3 sm:h-3" /> : <FiPlay className="w-2.5 h-2.5 sm:w-3 sm:h-3" />}
          </button>
        </>
      )}
    </section>
  );
};

export default DynamicHeroSection;
