import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FaHome, 
  FaArrowLeft, 
  FaSearch,
  FaCloud,
  FaStar,
  FaHeart,
  FaLeaf,
  FaGem,
  FaFeather,
  FaMagic,
  FaSnowflake,
  FaSun
} from 'react-icons/fa';
import { 
  HiOutlineEmojiSad,
  HiOutlineSparkles,
  HiOutlineLightBulb,
  HiOutlineCube,
  HiOutlineGlobe,
  HiOutlinePuzzle
} from 'react-icons/hi';
import '../styles/elegant-404.css';

const NotFound = () => {
  const navigate = useNavigate();
  const [showContent, setShowContent] = useState(false);
  const [particles, setParticles] = useState([]);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const cursorDotRef = useRef(null);
  const cursorOutlineRef = useRef(null);

  useEffect(() => {
    // Trigger animations after component mounts
    setTimeout(() => setShowContent(true), 300);
    
    // Generate more random particles for enhanced background animation
    const newParticles = Array.from({ length: 20 }, (_, index) => ({
      id: index,
      left: Math.random() * 100,
      delay: Math.random() * 4,
      size: Math.random() * 12 + 6,
      opacity: Math.random() * 0.4 + 0.1,
    }));
    setParticles(newParticles);

    // Custom cursor tracking
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
      
      if (cursorDotRef.current) {
        cursorDotRef.current.style.left = e.clientX + 'px';
        cursorDotRef.current.style.top = e.clientY + 'px';
      }
      
      if (cursorOutlineRef.current) {
        cursorOutlineRef.current.style.left = e.clientX + 'px';
        cursorOutlineRef.current.style.top = e.clientY + 'px';
      }
    };

    document.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  const handleGoHome = () => {
    navigate('/');
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleMouseEnter = () => setIsHovering(true);
  const handleMouseLeave = () => setIsHovering(false);

  return (
    <div className="min-h-screen notfound-bg flex items-center justify-center p-6 overflow-hidden relative custom-cursor">
      {/* Custom cursor elements */}
      <div ref={cursorDotRef} className="cursor-dot"></div>
      <div 
        ref={cursorOutlineRef} 
        className={`cursor-outline ${isHovering ? 'cursor-hover' : ''}`}
      ></div>

      {/* Enhanced animated particles background */}
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute particle"
          style={{
            left: `${particle.left}%`,
            animationDelay: `${particle.delay}s`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            backgroundColor: `rgba(46, 204, 113, ${particle.opacity})`,
            borderRadius: '50%',
            top: '100%',
          }}
        />
      ))}

      {/* More floating decorative elements with spacious layout */}
      <div className="absolute top-16 left-16 soft-float">
        <div className="w-24 h-24 notfound-decorative-bg rounded-full shadow-lg elegant-glow opacity-60 morph-shape magnetic-hover"></div>
      </div>
      
      <div className="absolute top-1/4 right-1/5 soft-float-delayed">
        <div className="orbit">
          <FaLeaf className="text-7xl text-green-400 icon-float opacity-30" />
        </div>
      </div>
      
      <div className="absolute bottom-1/3 left-1/5 soft-float-slow">
        <div className="w-20 h-20 notfound-decorative-bg rounded-full shadow-md gentle-pulse opacity-50 magnetic-hover"></div>
      </div>
      
      <div className="absolute top-1/3 right-16 soft-float-extra">
        <div className="orbit-reverse">
          <FaGem className="text-5xl text-emerald-500 icon-float-delayed opacity-25" />
        </div>
      </div>

      {/* Additional floating elements for spacious feel */}
      <div className="absolute top-20 right-1/3 soft-float">
        <FaMagic className="text-4xl text-green-500 icon-float-slow opacity-40" />
      </div>
      
      <div className="absolute bottom-20 right-20 soft-float-delayed">
        <div className="w-16 h-16 notfound-decorative-bg rounded-full shadow-lg gentle-pulse-delayed opacity-45 morph-shape"></div>
      </div>
      
      <div className="absolute top-1/2 left-16 soft-float-slow">
        <HiOutlineCube className="text-6xl text-emerald-400 icon-float opacity-35" />
      </div>

      <div className="absolute bottom-1/4 left-1/3 soft-float-extra">
        <FaSnowflake className="text-5xl text-green-400 icon-float-delayed opacity-30" />
      </div>

      {/* Main content container with enhanced spacing */}
      <div className="max-w-6xl mx-auto text-center px-8">
        
        {/* Main illustration area with more space */}
        <div className="relative mb-20 text-reveal">
          {/* Central elegant circle with enhanced size and breathing effect */}
          <div className="relative mx-auto w-96 h-96 notfound-central-circle rounded-full shadow-2xl elegant-glow elegant-backdrop border border-green-100 breathe">
            
            {/* Enhanced inner decorative rings */}
            <div className="absolute inset-6 border-2 border-green-200 rounded-full opacity-30 soft-float"></div>
            <div className="absolute inset-12 border border-emerald-200 rounded-full opacity-40 soft-float-delayed"></div>
            <div className="absolute inset-16 border-2 border-green-100 rounded-full opacity-25 soft-float-slow"></div>
            
            {/* Central 404 with enhanced typography */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="text-10xl font-light notfound-404-text mb-6 breathe">
                  404
                </div>
                <div className="text-xl text-green-600 font-light tracking-widest uppercase">
                  Page Not Found
                </div>
              </div>
            </div>

            {/* Enhanced floating vector icons around the circle */}
            <HiOutlineEmojiSad 
              className="absolute -top-12 left-1/2 transform -translate-x-1/2 text-6xl text-green-500 icon-float opacity-60 magnetic-hover" 
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            />
            <FaSearch 
              className="absolute top-1/4 -right-12 text-5xl text-emerald-500 icon-float-delayed opacity-50 magnetic-hover"
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            />
            <HiOutlineSparkles 
              className="absolute bottom-1/4 -left-12 text-5xl text-green-400 icon-float opacity-55 magnetic-hover"
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            />
            <HiOutlineLightBulb 
              className="absolute -bottom-12 right-1/3 text-5xl text-emerald-600 icon-float-delayed opacity-45 magnetic-hover"
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            />
            <HiOutlineGlobe 
              className="absolute top-1/6 -left-8 text-4xl text-green-600 icon-float-slow opacity-40 magnetic-hover"
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            />
            <HiOutlinePuzzle 
              className="absolute bottom-1/6 -right-8 text-4xl text-emerald-400 icon-float opacity-45 magnetic-hover"
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            />
          </div>

          {/* Enhanced elegant shadow */}
          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-80 h-8 notfound-shadow-gradient opacity-20 blur-xl rounded-full"></div>
        </div>

        {/* Enhanced elegant text content with more spacing */}
        <div className="space-y-10">
          <h1 className="text-5xl md:text-6xl font-light text-gray-800 text-reveal-delay-1 leading-relaxed">
            <span className="notfound-title-text">Oops!</span> Something went wrong
          </h1>

          <p className="text-2xl text-gray-600 font-light max-w-3xl mx-auto leading-relaxed text-reveal-delay-2">
            The page you're looking for seems to have wandered off into the digital wilderness. 
            <br />
            <span className="text-green-600">Don't worry, we'll help you find your way back home.</span>
          </p>

          <div className="text-lg text-green-600 font-medium text-reveal-delay-3 flex items-center justify-center space-x-2">
            <HiOutlineSparkles className="text-green-500" />
            <span>Let's get you back on track</span>
            <HiOutlineSparkles className="text-green-500" />
          </div>
        </div>

        {/* Enhanced elegant action buttons with more spacing */}
        <div className="flex flex-col sm:flex-row gap-8 justify-center items-center mt-16 text-reveal-delay-4">
          <button
            onClick={handleGoHome}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            className="group px-12 py-5 notfound-home-btn text-white font-medium rounded-full shadow-lg hover:shadow-2xl transform transition-all duration-500 flex items-center space-x-4 elegant-button text-lg"
          >
            <FaHome className="text-xl icon-float" />
            <span>Return Home</span>
          </button>

          <button
            onClick={handleGoBack}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            className="group px-12 py-5 bg-white text-green-600 font-medium rounded-full border-2 border-green-200 hover:border-green-300 shadow-lg hover:shadow-xl transform transition-all duration-500 flex items-center space-x-4 elegant-button elegant-backdrop text-lg"
          >
            <FaArrowLeft className="text-xl icon-float-delayed" />
            <span>Go Back</span>
          </button>
        </div>

        {/* Enhanced elegant bottom decorative section with more animations */}
        <div className="mt-24 text-reveal-delay-5">
          <div className="relative p-10 elegant-backdrop rounded-3xl border border-green-100 shadow-xl max-w-4xl mx-auto">
            {/* Enhanced animated decorative elements at bottom */}
            <div className="flex justify-center items-center space-x-12 mb-8">
              <FaStar 
                className="text-3xl text-green-400 wave-animation magnetic-hover" 
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
              />
              <FaHeart 
                className="text-3xl text-emerald-400 wave-delayed-1 magnetic-hover"
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
              />
              <FaCloud 
                className="text-3xl text-green-500 wave-delayed-2 magnetic-hover"
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
              />
              <FaFeather 
                className="text-3xl text-emerald-500 wave-delayed-3 magnetic-hover"
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
              />
              <FaSun 
                className="text-3xl text-green-600 wave-delayed-4 magnetic-hover"
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
              />
            </div>
            
            <p className="text-xl text-gray-700 font-light leading-relaxed">
              <HiOutlineSparkles className="inline text-green-500 mr-3" />
              Still exploring? Discover amazing products in our store and enjoy a seamless shopping experience!
              <HiOutlineSparkles className="inline text-green-500 ml-3" />
            </p>
            
            {/* Enhanced bottom wave animation */}
            <div className="absolute bottom-0 left-0 right-0 h-3 notfound-bottom-wave rounded-b-3xl wave-animation"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
