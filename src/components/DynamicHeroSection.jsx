import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiChevronLeft, FiChevronRight, FiPlay, FiPause, FiShoppingBag, FiArrowRight, FiTruck, FiPackage, FiStar, FiDollarSign, FiUsers, FiGift } from 'react-icons/fi';

const DynamicHeroSection = () => {
  const [banners, setBanners] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const intervalRef = useRef(null);

  const API_BASE_URL = 'http://localhost:5001/api';

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

  // Position mapping for text alignment
  const getPositionClasses = (position) => {
    const positions = {
      'top-left': 'items-start justify-start text-left',
      'top-center': 'items-start justify-center text-center',
      'top-right': 'items-start justify-end text-right',
      'center-left': 'items-center justify-start text-left',
      'center': 'items-center justify-center text-center',
      'center-right': 'items-center justify-end text-right',
      'bottom-left': 'items-end justify-start text-left',
      'bottom-center': 'items-end justify-center text-center',
      'bottom-right': 'items-end justify-end text-right'
    };
    return positions[position] || positions['center'];
  };

  // Loading state with enhanced animation
  if (loading) {
    return (
      <section className="relative h-[60vh] md:h-[70vh] bg-gradient-to-br from-[#f8faf8] via-white to-[#e8eae8] flex items-center justify-center overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0">
          <motion.div
            animate={{
              scale: [1, 1.1, 1],
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="absolute top-20 left-20 w-32 h-32 bg-[#2ecc71]/20 rounded-full blur-xl"
          />
          <motion.div
            animate={{
              scale: [1.1, 1, 1.1],
              opacity: [0.4, 0.7, 0.4],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1
            }}
            className="absolute bottom-20 right-20 w-40 h-40 bg-[#27ae60]/20 rounded-full blur-xl"
          />
        </div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="text-center p-8 md:p-12 bg-white/80 backdrop-blur-xl rounded-3xl shadow-[25px_25px_50px_rgba(232,234,232,0.8),-25px_-25px_50px_rgba(255,255,255,0.9)] border border-white/50 relative z-10"
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
      <section className="relative h-[60vh] md:h-[70vh] overflow-hidden bg-gradient-to-br from-[#f8faf8] to-[#e8eae8]">
        {/* Show default banner when there's an error */}
        <div className="absolute inset-0">
          <div className="relative w-full h-full">
            {/* Default banner background with theme styling */}
            <div className="absolute inset-0 rounded-b-[3rem] overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.1)]">
              <div className="w-full h-full bg-gradient-to-br from-[#2ecc71] via-[#27ae60] to-[#2ecc71] relative">
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
                      className={`absolute ${i % 2 === 0 ? 'w-20 h-20' : 'w-16 h-16'} bg-white/20 ${i % 3 === 0 ? 'rounded-full' : 'rounded-2xl'} blur-sm`}
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
              
              <div className="absolute inset-0 bg-gradient-to-r from-[#2ecc71]/70 to-[#27ae60]/70" />
            </div>

            {/* Content with proper theme styling */}
            <div className="absolute inset-0 flex p-6 md:p-12 lg:p-16 items-center justify-start text-left">
              <motion.div
                initial={{ opacity: 0, y: 60, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: 0.2, duration: 0.8, type: "spring", stiffness: 100 }}
                className="max-w-2xl backdrop-blur-xl bg-white/20 p-8 md:p-10 rounded-3xl shadow-[25px_25px_50px_rgba(0,0,0,0.15),-25px_-25px_50px_rgba(255,255,255,0.15)] border border-white/30 relative"
              >
                <div className="absolute top-0 left-0 w-20 h-1 bg-gradient-to-r from-white to-white/50 rounded-full"></div>
                
                <motion.h1
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.6 }}
                  className="text-3xl md:text-5xl lg:text-6xl font-bold mb-4 md:mb-6 leading-tight text-white"
                  style={{ textShadow: '3px 3px 6px rgba(0,0,0,0.4), 1px 1px 2px rgba(0,0,0,0.2)' }}
                >
                  Welcome to Indiraa1
                </motion.h1>

                <motion.p
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5, duration: 0.6 }}
                  className="text-base md:text-xl lg:text-2xl mb-6 md:mb-8 leading-relaxed text-white"
                  style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.3)' }}
                >
                  Discover premium products with exceptional quality and unbeatable prices.
                </motion.p>

                <motion.p
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.55, duration: 0.6 }}
                  className="text-sm md:text-lg mb-6 leading-relaxed opacity-90 text-white"
                  style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.3)' }}
                >
                  Earn rewards with every purchase • Get exclusive referral bonuses • Premium quality guaranteed
                </motion.p>

                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6, duration: 0.6 }}
                >
                  <motion.a
                    href="/products"
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    className="inline-flex items-center gap-3 px-8 md:px-10 py-4 md:py-5 bg-white text-[#2ecc71] font-bold rounded-2xl shadow-[12px_12px_24px_rgba(0,0,0,0.2),-12px_-12px_24px_rgba(255,255,255,0.1)] hover:shadow-[16px_16px_32px_rgba(0,0,0,0.25),-16px_-16px_32px_rgba(255,255,255,0.15)] transition-all duration-300"
                  >
                    <FiShoppingBag className="w-5 h-5" />
                    Shop Now
                    <motion.div
                      animate={{ x: [0, 5, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      <FiArrowRight className="w-5 h-5" />
                    </motion.div>
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
    <section className="relative h-[60vh] md:h-[70vh] overflow-hidden bg-gradient-to-br from-[#f8faf8] to-[#e8eae8]">
      {/* Background Banners */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentSlide}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.7, ease: "easeInOut" }}
          className="absolute inset-0"
        >
          <div className="relative w-full h-full">
            {/* Background Image with overlay */}
            <div className="absolute inset-0 rounded-b-[3rem] overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.1)]">
              {/* Welcome message with white background or API banner image */}
              {currentBanner.isWelcomeMessage ? (
                <div className="w-full h-full bg-gradient-to-br from-white via-[#f8faf8] to-[#e8eae8] relative">
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
                <div className="w-full h-full bg-gradient-to-br from-[#2ecc71] via-[#27ae60] to-[#2ecc71] relative">
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
                        className={`absolute ${i % 2 === 0 ? 'w-20 h-20' : 'w-16 h-16'} bg-white/20 ${i % 3 === 0 ? 'rounded-full' : 'rounded-2xl'} blur-sm`}
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
                  className="w-full h-full object-cover"
                />
              )}
              
              {/* Overlay - only for non-welcome message slides */}
              {!currentBanner.isWelcomeMessage && (
                <div 
                  className="absolute inset-0"
                  style={{ 
                    backgroundColor: currentBanner.backgroundColor || 'rgba(0, 0, 0, 0.3)',
                    background: `linear-gradient(135deg, ${currentBanner.backgroundColor || 'rgba(0, 0, 0, 0.3)'}, ${currentBanner.backgroundColor || 'rgba(0, 0, 0, 0.1)'})`
                  }}
                />
              )}
            </div>

            {/* Content with enhanced neumorphic container */}
            <div className={`absolute inset-0 flex p-6 md:p-12 lg:p-16 ${getPositionClasses(currentBanner.textPosition)}`}>
              <motion.div
                initial={{ opacity: 0, y: 60, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: 0.2, duration: 0.8, type: "spring", stiffness: 100 }}
                className={`max-w-2xl rounded-3xl p-8 md:p-10 transition-all duration-500 ${
                  currentBanner.isWelcomeMessage 
                    ? 'bg-white/95 backdrop-blur-xl shadow-[25px_25px_50px_rgba(46,204,113,0.15),-25px_-25px_50px_rgba(255,255,255,0.9)] border border-[#2ecc71]/20 hover:shadow-[30px_30px_60px_rgba(46,204,113,0.2),-30px_-30px_60px_rgba(255,255,255,0.95)]'
                    : 'backdrop-blur-xl bg-white/20 shadow-[25px_25px_50px_rgba(0,0,0,0.15),-25px_-25px_50px_rgba(255,255,255,0.15)] border border-white/30 hover:shadow-[30px_30px_60px_rgba(0,0,0,0.2),-30px_-30px_60px_rgba(255,255,255,0.2)]'
                }`}
              >
                {/* Decorative gradient accent */}
                <div className={`absolute top-0 left-0 w-20 h-1 rounded-full ${
                  currentBanner.isWelcomeMessage 
                    ? 'bg-gradient-to-r from-[#2ecc71] to-[#27ae60]'
                    : 'bg-gradient-to-r from-[#2ecc71] to-[#27ae60]'
                }`}></div>
                
                {/* Title */}
                {currentBanner.title && (
                  <motion.h1
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4, duration: 0.6 }}
                    className="text-3xl md:text-5xl lg:text-6xl font-bold mb-4 md:mb-6 leading-tight"
                    style={{ 
                      color: currentBanner.textColor || '#ffffff',
                      textShadow: currentBanner.textShadow !== false ? '3px 3px 6px rgba(0,0,0,0.4), 1px 1px 2px rgba(0,0,0,0.2)' : 'none'
                    }}
                  >
                    {currentBanner.title}
                  </motion.h1>
                )}

                {/* Subtitle */}
                {currentBanner.subtitle && (
                  <motion.p
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5, duration: 0.6 }}
                    className="text-base md:text-xl lg:text-2xl mb-6 md:mb-8 leading-relaxed"
                    style={{ 
                      color: currentBanner.textColor || '#ffffff',
                      textShadow: currentBanner.textShadow !== false ? '2px 2px 4px rgba(0,0,0,0.3)' : 'none'
                    }}
                  >
                    {currentBanner.subtitle}
                  </motion.p>
                )}

                {/* Description */}
                {currentBanner.description && (
                  <motion.p
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.55, duration: 0.6 }}
                    className="text-sm md:text-lg mb-6 leading-relaxed opacity-90"
                    style={{ 
                      color: currentBanner.textColor || '#ffffff',
                      textShadow: currentBanner.textShadow !== false ? '1px 1px 2px rgba(0,0,0,0.3)' : 'none'
                    }}
                  >
                    {currentBanner.description}
                  </motion.p>
                )}

                {/* CTA Button with enhanced neumorphic design */}
                {currentBanner.ctaText && currentBanner.ctaLink && (
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6, duration: 0.6 }}
                  >
                    <motion.a
                      href={currentBanner.ctaLink}
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                      className={`inline-flex items-center gap-3 px-8 md:px-10 py-4 md:py-5 font-bold rounded-2xl transition-all duration-300 border backdrop-blur-sm ${
                        currentBanner.isWelcomeMessage
                          ? 'bg-gradient-to-r from-[#2ecc71] to-[#27ae60] text-white shadow-[12px_12px_24px_rgba(46,204,113,0.3),-12px_-12px_24px_rgba(255,255,255,0.9)] hover:shadow-[16px_16px_32px_rgba(46,204,113,0.4),-16px_-16px_32px_rgba(255,255,255,0.95)] border-[#2ecc71]/20'
                          : 'bg-gradient-to-r from-[#2ecc71] to-[#27ae60] text-white shadow-[12px_12px_24px_rgba(0,0,0,0.2),-12px_-12px_24px_rgba(255,255,255,0.1)] hover:shadow-[16px_16px_32px_rgba(0,0,0,0.25),-16px_-16px_32px_rgba(255,255,255,0.15)] border-white/20'
                      }`}
                    >
                      <FiShoppingBag className="w-5 h-5" />
                      {currentBanner.ctaText}
                      <motion.div
                        animate={{ x: [0, 5, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      >
                        <FiArrowRight className="w-5 h-5" />
                      </motion.div>
                    </motion.a>
                  </motion.div>
                )}

                {/* Additional buttons if available */}
                {currentBanner.buttons && currentBanner.buttons.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7, duration: 0.6 }}
                    className="flex flex-wrap gap-3 mt-4"
                  >
                    {currentBanner.buttons.map((button, index) => (
                      <motion.a
                        key={index}
                        href={button.link}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                          currentBanner.isWelcomeMessage
                            ? button.type === 'primary' 
                              ? 'bg-[#2ecc71] text-white shadow-[8px_8px_16px_rgba(46,204,113,0.3),-8px_-8px_16px_rgba(255,255,255,0.9)]'
                              : 'bg-white/70 text-[#2ecc71] border border-[#2ecc71]/20 shadow-[4px_4px_8px_rgba(46,204,113,0.1)]'
                            : button.type === 'primary' 
                              ? 'bg-white/90 text-[#2ecc71] shadow-[8px_8px_16px_rgba(0,0,0,0.1),-8px_-8px_16px_rgba(255,255,255,0.1)]' 
                              : 'bg-white/20 text-white border border-white/30 shadow-[4px_4px_8px_rgba(0,0,0,0.1)]'
                        }`}
                      >
                        {button.text}
                      </motion.a>
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
            className="absolute left-2 md:left-4 top-1/2 transform -translate-y-1/2 p-2 bg-black/20 backdrop-blur-sm text-white rounded-full hover:bg-black/30 transition-all duration-300 opacity-50 hover:opacity-80"
          >
            <FiChevronLeft className="w-4 h-4" />
          </button>
          
          <button
            onClick={nextSlide}
            className="absolute right-2 md:right-4 top-1/2 transform -translate-y-1/2 p-2 bg-black/20 backdrop-blur-sm text-white rounded-full hover:bg-black/30 transition-all duration-300 opacity-50 hover:opacity-80"
          >
            <FiChevronRight className="w-4 h-4" />
          </button>

          {/* Minimal Play/Pause Button */}
          <button
            onClick={togglePlayPause}
            className="absolute bottom-4 right-4 p-2 bg-black/20 backdrop-blur-sm text-white rounded-full hover:bg-black/30 transition-all duration-300 opacity-50 hover:opacity-80"
          >
            {isPlaying ? <FiPause className="w-3 h-3" /> : <FiPlay className="w-3 h-3" />}
          </button>
        </>
      )}
    </section>
  );
};

export default DynamicHeroSection;
