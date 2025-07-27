import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { 
  FiArrowLeft, 
  FiHeart, 
  FiShoppingCart, 
  FiStar, 
  FiChevronLeft, 
  FiChevronRight, 
  FiMinus, 
  FiPlus,
  FiPackage,
  FiTag,
  FiTruck,
  FiShield
} from 'react-icons/fi';

const ComboPackDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [comboPack, setComboPack] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [showImageModal, setShowImageModal] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [wishlisted, setWishlisted] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [myRating, setMyRating] = useState(0);
  const [myComment, setMyComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [hoverRating, setHoverRating] = useState(0);
  const [allImages, setAllImages] = useState([]);

  useEffect(() => {
    window.scrollTo(0, 0);
    const token = localStorage.getItem('token');
    setIsAuthenticated(!!token);

    // Fetch combo pack details
    const fetchComboPackByIdOrSlug = async () => {
      try {
        setLoading(true);
        let response;
        
        // Try by ID first, then by slug if ID fails
        try {
          response = await fetch(`http://localhost:5001/api/combo-packs/id/${id}`);
        } catch (err) {
          response = await fetch(`http://localhost:5001/api/combo-packs/slug/${id}`);
        }

        if (!response.ok) {
          throw new Error('Combo pack not found');
        }

        const data = await response.json();
        setComboPack(data.comboPack);
        setReviews(data.comboPack?.reviews || []);
        
        // Collect all images for gallery
        const images = [];
        
        // Add main combo pack image if exists
        if (data.comboPack?.mainImage) {
          images.push({
            url: data.comboPack.mainImage,
            alt: `${data.comboPack.name} - Main Image`,
            source: 'combo'
          });
        }
        
        // Add product images
        data.comboPack?.products?.forEach((product, productIndex) => {
          product.images?.forEach((img, imgIndex) => {
            images.push({
              url: img.url,
              alt: img.alt || `${product.productName} - Image ${imgIndex + 1}`,
              source: 'product',
              productName: product.productName,
              variantName: product.variantName
            });
          });
        });
        
        setAllImages(images);
        setLoading(false);

        // Check if combo pack is in wishlist
        if (token && data.comboPack) {
          checkWishlistStatus(data.comboPack._id, token);
        }
      } catch (error) {
        setError('Failed to load combo pack.');
        setLoading(false);
        toast.error('Failed to load combo pack details');
      }
    };

    fetchComboPackByIdOrSlug();
  }, [id]);

  const checkWishlistStatus = async (comboPackId, token) => {
    try {
      const response = await fetch('http://localhost:5001/api/combo-packs/wishlist/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        const isInWishlist = data.wishlist?.some(item => item._id === comboPackId);
        setWishlisted(isInWishlist || false);
      }
    } catch (error) {
      console.error('Error checking wishlist status:', error);
    }
  };

  const handleWishlistToggle = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to add to wishlist');
      return;
    }
    
    try {
      const endpoint = wishlisted 
        ? 'http://localhost:5001/api/combo-packs/wishlist/remove'
        : 'http://localhost:5001/api/combo-packs/wishlist/add';
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ comboPackId: comboPack._id })
      });

      if (response.ok) {
        setWishlisted(!wishlisted);
        toast.success(wishlisted ? 'Removed from wishlist' : 'Added to wishlist');
      } else {
        throw new Error('Failed to update wishlist');
      }
    } catch (error) {
      toast.error('Error updating wishlist');
      console.error('Wishlist error:', error);
    }
  };

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to add to cart');
      return;
    }

    // Check stock
    if (comboPack.stock <= 0) {
      toast.error('Combo pack is out of stock');
      return;
    }
    
    try {
      const response = await fetch('http://localhost:5001/api/combo-packs/cart/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ 
          comboPackId: comboPack._id, 
          quantity 
        })
      });

      if (response.ok) {
        toast.success(`Added ${quantity} ${comboPack.name} to cart`);
      } else {
        throw new Error('Failed to add to cart');
      }
    } catch (error) {
      toast.error('Error adding to cart');
      console.error('Cart error:', error);
    }
  };

  const handleBuyNow = () => {
    if (!isAuthenticated) {
      toast.error('Please login to purchase');
      return;
    }

    if (comboPack.stock <= 0) {
      toast.error('Combo pack is out of stock');
      return;
    }

    // Add to cart first, then redirect to checkout
    handleAddToCart().then(() => {
      navigate('/checkout');
    });
  };

  const submitReview = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to submit a review');
      return;
    }

    if (myRating === 0 || !myComment.trim()) {
      toast.error('Please provide rating and comment');
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch(`http://localhost:5001/api/combo-packs/${comboPack._id}/review`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          rating: myRating,
          comment: myComment.trim()
        })
      });

      if (response.ok) {
        const data = await response.json();
        setComboPack(data.comboPack);
        setReviews(data.comboPack.reviews);
        setMyRating(0);
        setMyComment('');
        toast.success('Review submitted successfully');
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || 'Failed to submit review');
      }
    } catch (error) {
      toast.error('Error submitting review');
      console.error('Review error:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const nextImage = () => {
    setSelectedImageIndex((prev) => (prev + 1) % allImages.length);
  };

  const prevImage = () => {
    setSelectedImageIndex((prev) => (prev - 1 + allImages.length) % allImages.length);
  };

  const renderStars = (rating, interactive = false, onStarClick = null, onStarHover = null) => {
    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <FiStar
            key={star}
            className={`w-4 h-4 ${
              star <= rating
                ? 'text-yellow-400 fill-current'
                : 'text-gray-300'
            } ${interactive ? 'cursor-pointer hover:text-yellow-400' : ''}`}
            onClick={() => interactive && onStarClick && onStarClick(star)}
            onMouseEnter={() => interactive && onStarHover && onStarHover(star)}
            onMouseLeave={() => interactive && onStarHover && onStarHover(0)}
          />
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading combo pack details...</p>
        </div>
      </div>
    );
  }

  if (error || !comboPack) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <FiPackage className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Combo Pack Not Found</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => navigate('/products')}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Browse Products
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-md sticky top-0 z-40 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-600 hover:text-gray-800 transition-colors"
          >
            <FiArrowLeft className="w-5 h-5 mr-2" />
            Back
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Image Gallery */}
          <div className="space-y-4">
            {/* Main Image */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative bg-white rounded-2xl shadow-lg overflow-hidden aspect-square"
            >
              {allImages.length > 0 && (
                <>
                  <img
                    src={allImages[selectedImageIndex]?.url}
                    alt={allImages[selectedImageIndex]?.alt}
                    className="w-full h-full object-cover cursor-pointer"
                    onClick={() => setShowImageModal(true)}
                  />
                  
                  {/* Navigation Arrows */}
                  {allImages.length > 1 && (
                    <>
                      <button
                        onClick={prevImage}
                        className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/90 backdrop-blur-sm rounded-full p-2 shadow-lg hover:bg-white transition-all"
                      >
                        <FiChevronLeft className="w-5 h-5 text-gray-700" />
                      </button>
                      <button
                        onClick={nextImage}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/90 backdrop-blur-sm rounded-full p-2 shadow-lg hover:bg-white transition-all"
                      >
                        <FiChevronRight className="w-5 h-5 text-gray-700" />
                      </button>
                    </>
                  )}

                  {/* Image Source Badge */}
                  <div className="absolute top-4 left-4 bg-black/70 text-white px-3 py-1 rounded-full text-sm">
                    {allImages[selectedImageIndex]?.source === 'combo' 
                      ? 'Combo Pack' 
                      : allImages[selectedImageIndex]?.productName
                    }
                  </div>
                </>
              )}
            </motion.div>

            {/* Thumbnail Gallery */}
            {allImages.length > 1 && (
              <div className="flex space-x-2 overflow-x-auto pb-2">
                {allImages.map((image, index) => (
                  <motion.button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-all ${
                      selectedImageIndex === index 
                        ? 'border-blue-500 ring-2 ring-blue-200' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <img
                      src={image.url}
                      alt={image.alt}
                      className="w-full h-full object-cover"
                    />
                  </motion.button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            {/* Basic Info */}
            <div>
              {comboPack.badgeText && (
                <span className="inline-block bg-gradient-to-r from-purple-500 to-pink-500 text-white px-3 py-1 rounded-full text-sm font-medium mb-4">
                  {comboPack.badgeText}
                </span>
              )}
              
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                {comboPack.name}
              </h1>
              
              <p className="text-gray-600 text-lg leading-relaxed">
                {comboPack.description}
              </p>
            </div>

            {/* Rating */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                {renderStars(comboPack.averageRating || 0)}
                <span className="text-sm text-gray-600">
                  ({comboPack.totalReviews || 0} reviews)
                </span>
              </div>
            </div>

            {/* Pricing */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="flex items-center space-x-3">
                    <span className="text-3xl font-bold text-gray-900">
                      ₹{comboPack.comboPrice?.toLocaleString()}
                    </span>
                    {comboPack.originalTotalPrice > comboPack.comboPrice && (
                      <span className="text-xl text-gray-500 line-through">
                        ₹{comboPack.originalTotalPrice?.toLocaleString()}
                      </span>
                    )}
                  </div>
                  {comboPack.discountPercentage > 0 && (
                    <div className="flex items-center space-x-2 mt-2">
                      <span className="bg-green-100 text-green-800 px-2 py-1 rounded-lg text-sm font-medium">
                        {comboPack.discountPercentage}% OFF
                      </span>
                      <span className="text-sm text-gray-600">
                        Save ₹{comboPack.discountAmount?.toLocaleString()}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Stock Status */}
              <div className="mb-6">
                {comboPack.stock > 0 ? (
                  <div className="flex items-center text-green-600">
                    <FiShield className="w-4 h-4 mr-2" />
                    <span className="text-sm font-medium">
                      {comboPack.stock} units available
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center text-red-600">
                    <FiShield className="w-4 h-4 mr-2" />
                    <span className="text-sm font-medium">Out of stock</span>
                  </div>
                )}
              </div>

              {/* Quantity Selector */}
              <div className="flex items-center space-x-4 mb-6">
                <span className="text-sm font-medium text-gray-700">Quantity:</span>
                <div className="flex items-center bg-gray-50 rounded-lg">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-2 hover:bg-gray-200 rounded-l-lg transition-colors"
                    disabled={quantity <= 1}
                  >
                    <FiMinus className="w-4 h-4" />
                  </button>
                  <span className="px-4 py-2 min-w-[3rem] text-center font-medium">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(Math.min(comboPack.stock, quantity + 1))}
                    className="p-2 hover:bg-gray-200 rounded-r-lg transition-colors"
                    disabled={quantity >= comboPack.stock}
                  >
                    <FiPlus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-4">
                <motion.button
                  onClick={handleAddToCart}
                  disabled={comboPack.stock <= 0}
                  className="flex-1 flex items-center justify-center space-x-2 bg-blue-600 text-white py-3 px-6 rounded-xl font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                  whileHover={{ scale: comboPack.stock > 0 ? 1.02 : 1 }}
                  whileTap={{ scale: comboPack.stock > 0 ? 0.98 : 1 }}
                >
                  <FiShoppingCart className="w-5 h-5" />
                  <span>Add to Cart</span>
                </motion.button>

                <motion.button
                  onClick={handleBuyNow}
                  disabled={comboPack.stock <= 0}
                  className="flex-1 bg-green-600 text-white py-3 px-6 rounded-xl font-medium hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                  whileHover={{ scale: comboPack.stock > 0 ? 1.02 : 1 }}
                  whileTap={{ scale: comboPack.stock > 0 ? 0.98 : 1 }}
                >
                  Buy Now
                </motion.button>

                <motion.button
                  onClick={handleWishlistToggle}
                  className={`p-3 rounded-xl border-2 transition-colors ${
                    wishlisted
                      ? 'border-red-300 bg-red-50 text-red-600'
                      : 'border-gray-300 hover:border-gray-400 text-gray-600'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <FiHeart className={`w-5 h-5 ${wishlisted ? 'fill-current' : ''}`} />
                </motion.button>
              </div>
            </div>

            {/* Features */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Why Choose This Combo?</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <FiTag className="w-5 h-5 text-green-500" />
                  <span className="text-gray-700">Best value combo deal</span>
                </div>
                <div className="flex items-center space-x-3">
                  <FiTruck className="w-5 h-5 text-blue-500" />
                  <span className="text-gray-700">Free delivery on orders above ₹500</span>
                </div>
                <div className="flex items-center space-x-3">
                  <FiShield className="w-5 h-5 text-purple-500" />
                  <span className="text-gray-700">Quality guaranteed products</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Included Products Section */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">What's Included in This Combo</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {comboPack.products?.map((product, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
              >
                {/* Product Image */}
                {product.images && product.images.length > 0 && (
                  <div className="w-full h-48 bg-gray-100 rounded-xl mb-4 overflow-hidden">
                    <img
                      src={product.images[0].url}
                      alt={product.images[0].alt}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                
                {/* Product Details */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {product.productName}
                  </h3>
                  
                  {product.variantName && (
                    <p className="text-sm text-gray-600 mb-2">
                      Variant: {product.variantName}
                    </p>
                  )}
                  
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-gray-900">
                      ₹{product.originalPrice?.toLocaleString()}
                    </span>
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-lg text-sm font-medium">
                      Qty: {product.quantity}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Reviews Section */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Customer Reviews ({comboPack.totalReviews || 0})
          </h2>

          {/* Add Review */}
          {isAuthenticated && (
            <div className="mb-8 p-6 bg-gray-50 rounded-xl">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Write a Review</h3>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Rating
                </label>
                {renderStars(
                  hoverRating || myRating,
                  true,
                  setMyRating,
                  setHoverRating
                )}
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Review
                </label>
                <textarea
                  value={myComment}
                  onChange={(e) => setMyComment(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  placeholder="Share your experience with this combo pack..."
                />
              </div>

              <button
                onClick={submitReview}
                disabled={submitting || myRating === 0 || !myComment.trim()}
                className="px-6 py-2 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {submitting ? 'Submitting...' : 'Submit Review'}
              </button>
            </div>
          )}

          {/* Reviews List */}
          <div className="space-y-6">
            {reviews.length > 0 ? (
              reviews.map((review, index) => (
                <div key={review._id || index} className="border-b border-gray-200 pb-6 last:border-b-0">
                  <div className="flex items-start space-x-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 font-semibold">
                        {review.user?.charAt(0).toUpperCase() || 'U'}
                      </span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <span className="font-medium text-gray-900">
                            {review.user || 'Anonymous User'}
                          </span>
                          {review.verified && (
                            <span className="ml-2 bg-green-100 text-green-800 px-2 py-1 rounded text-xs">
                              Verified Purchase
                            </span>
                          )}
                        </div>
                        <span className="text-sm text-gray-500">
                          {new Date(review.date).toLocaleDateString()}
                        </span>
                      </div>
                      
                      <div className="mb-2">
                        {renderStars(review.rating)}
                      </div>
                      
                      <p className="text-gray-700 leading-relaxed">
                        {review.comment}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <FiStar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No reviews yet. Be the first to review this combo pack!</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Image Modal */}
      {showImageModal && allImages.length > 0 && (
        <div 
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setShowImageModal(false)}
        >
          <div className="relative max-w-4xl max-h-full">
            <img
              src={allImages[selectedImageIndex]?.url}
              alt={allImages[selectedImageIndex]?.alt}
              className="max-w-full max-h-full object-contain"
              onClick={(e) => e.stopPropagation()}
            />
            
            {/* Navigation */}
            {allImages.length > 1 && (
              <>
                <button
                  onClick={(e) => { e.stopPropagation(); prevImage(); }}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/20 backdrop-blur-sm rounded-full p-3 text-white hover:bg-white/30 transition-all"
                >
                  <FiChevronLeft className="w-6 h-6" />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); nextImage(); }}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/20 backdrop-blur-sm rounded-full p-3 text-white hover:bg-white/30 transition-all"
                >
                  <FiChevronRight className="w-6 h-6" />
                </button>
              </>
            )}
            
            {/* Close Button */}
            <button
              onClick={() => setShowImageModal(false)}
              className="absolute top-4 right-4 bg-white/20 backdrop-blur-sm rounded-full p-2 text-white hover:bg-white/30 transition-all"
            >
              ×
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ComboPackDetail;
