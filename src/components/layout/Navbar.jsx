import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiShoppingCart, FiHeart, FiUser, FiMenu, FiX, FiHome, FiGrid, FiLogOut, FiShoppingBag, FiSettings } from 'react-icons/fi';
import toast from 'react-hot-toast';
import NavbarWalletBalance from '../Wallet/NavbarWalletBalance';

const Navbar = () => {
  const [user, setUser] = useState(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    checkAuthStatus();
    if (user) {
      fetchCounts();
    }
  }, [location]);

  const checkAuthStatus = async () => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        // Decode token to get user info (basic JWT decode)
        const payload = JSON.parse(atob(token.split('.')[1]));
        setUser({ name: payload.name || payload.email, email: payload.email });
        fetchCounts();
      } catch (error) {
        localStorage.removeItem('token');
        setUser(null);
      }
    } else {
      setUser(null);
    }
  };

  const fetchCounts = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      // Fetch cart count
      const cartResponse = await fetch('https://indiraa1-backend.onrender.com/api/products/cart/me', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (cartResponse.ok) {
        const cartData = await cartResponse.json();
        setCartCount(cartData.cart?.length || 0);
      }

      // Fetch wishlist count
      const wishlistResponse = await fetch('https://indiraa1-backend.onrender.com/api/products/wishlist/me', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (wishlistResponse.ok) {
        const wishlistData = await wishlistResponse.json();
        setWishlistCount(wishlistData.wishlist?.length || 0);
      }
    } catch (error) {
      console.error('Error fetching counts:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setCartCount(0);
    setWishlistCount(0);
    toast.success('Logged out successfully');
    navigate('/');
    setIsProfileOpen(false);
  };
  const navItems = [
    { path: '/', label: 'Home', icon: FiHome },
    { path: '/products', label: 'Products', icon: FiGrid },
    { path: '/orders', label: 'Orders', icon: FiShoppingBag, protected: true },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-white shadow-[0_4px_12px_rgba(0,0,0,0.05)] backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex-shrink-0"
          >
            <Link to="/" className="flex items-center gap-2">
              <div className="w-10 h-10 bg-[#2ecc71] rounded-xl flex items-center justify-center shadow-[4px_4px_8px_#e8eae8,-4px_-4px_8px_#ffffff]">
                <FiShoppingCart className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-800">EcoShop</span>
            </Link>
          </motion.div>

          {/* Desktop Navigation */}          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => {
              // Skip protected routes if user is not logged in
              if (item.protected && !user) return null;
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
                    location.pathname === item.path
                      ? 'bg-[#2ecc71] text-white shadow-[0_4px_12px_rgba(46,204,113,0.2)]'
                      : 'text-gray-600 hover:text-[#2ecc71] hover:bg-[#f8faf8]'
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </Link>
              );
            })}
          </div>            {/* Right Side Icons */}
          <div className="flex items-center space-x-2 lg:space-x-4">
            {user && (
              <>
                {/* Wishlist */}
                <Link
                  to="/wishlist"
                  className="relative p-2 lg:p-3 text-gray-600 hover:text-[#2ecc71] bg-[#f8faf8] rounded-xl hover:bg-white hover:shadow-[4px_4px_8px_#e8eae8,-4px_-4px_8px_#ffffff] transition-all"
                >
                  <FiHeart className="w-4 h-4 lg:w-5 lg:h-5" />
                  {wishlistCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 lg:w-5 lg:h-5 flex items-center justify-center text-[10px] lg:text-xs">
                      {wishlistCount}
                    </span>
                  )}
                </Link>

                {/* Wallet Balance */}
                <NavbarWalletBalance />

                {/* Cart */}
                <Link
                  to="/cart"
                  className="relative p-2 lg:p-3 text-gray-600 hover:text-[#2ecc71] bg-[#f8faf8] rounded-xl hover:bg-white hover:shadow-[4px_4px_8px_#e8eae8,-4px_-4px_8px_#ffffff] transition-all"
                >
                  <FiShoppingCart className="w-4 h-4 lg:w-5 lg:h-5" />
                  {cartCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-[#2ecc71] text-white text-xs rounded-full w-4 h-4 lg:w-5 lg:h-5 flex items-center justify-center text-[10px] lg:text-xs">
                      {cartCount}
                    </span>
                  )}
                </Link>
              </>
            )}            {/* User Menu */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center gap-1 lg:gap-2 p-2 text-gray-600 hover:text-[#2ecc71] bg-[#f8faf8] rounded-xl hover:bg-white hover:shadow-[4px_4px_8px_#e8eae8,-4px_-4px_8px_#ffffff] transition-all"
                >
                  <div className="w-7 h-7 lg:w-8 lg:h-8 bg-[#2ecc71] rounded-full flex items-center justify-center">
                    <FiUser className="w-3 h-3 lg:w-4 lg:h-4 text-white" />
                  </div>
                  <span className="hidden sm:block font-medium text-sm lg:text-base truncate max-w-20 lg:max-w-none">{user.name}</span>
                </button>

                <AnimatePresence>
                  {isProfileOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-[8px_8px_16px_#e8eae8,-8px_-8px_16px_#ffffff] overflow-hidden"
                    >
                      <div className="p-4 border-b border-gray-100">
                        <p className="font-medium text-gray-800">{user.name}</p>
                        <p className="text-sm text-gray-500">{user.email}</p>
                      </div>
                      <div className="py-2">
                        <Link
                          to="/profile"
                          className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-[#f8faf8] transition-colors"
                          onClick={() => setIsProfileOpen(false)}
                        >
                          <FiUser className="w-4 h-4" />
                          Your Profile
                        </Link>
                        <Link
                          to="/wallet"
                          className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-[#f8faf8] transition-colors"
                          onClick={() => setIsProfileOpen(false)}
                        >
                          <FiShoppingBag className="w-4 h-4" />
                          Indira Coins Wallet
                        </Link>
                        <Link
                          to="/pwa-dashboard"
                          className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-[#f8faf8] transition-colors"
                          onClick={() => setIsProfileOpen(false)}
                        >
                          <FiSettings className="w-4 h-4" />
                          PWA Dashboard
                        </Link>
                        <button
                          onClick={handleLogout}
                          className="flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 transition-colors w-full text-left"
                        >
                          <FiLogOut className="w-4 h-4" />
                          Sign out
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>            ) : (
              <div className="flex items-center gap-1 lg:gap-2">
                <Link
                  to="/login"
                  className="px-3 lg:px-4 py-2 text-gray-600 hover:text-[#2ecc71] font-medium transition-colors text-sm lg:text-base"
                >
                  Sign in
                </Link>
                <Link
                  to="/register"
                  className="px-3 lg:px-4 py-2 bg-[#2ecc71] text-white rounded-xl font-medium shadow-[0_4px_12px_rgba(46,204,113,0.2)] hover:shadow-[0_6px_16px_rgba(46,204,113,0.3)] hover:bg-[#27ae60] transition-all text-sm lg:text-base"
                >
                  Sign up
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 text-gray-600 hover:text-[#2ecc71] transition-colors"
            >
              {isMobileMenuOpen ? <FiX className="w-6 h-6" /> : <FiMenu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-t border-gray-100 py-4"
            >              <div className="space-y-2">
                {navItems.map((item) => {
                  // Skip protected routes if user is not logged in
                  if (item.protected && !user) return null;
                  
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                        location.pathname === item.path
                          ? 'bg-[#2ecc71] text-white'
                          : 'text-gray-600 hover:bg-[#f8faf8]'
                      }`}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <item.icon className="w-5 h-5" />
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
};

export default Navbar;
