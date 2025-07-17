import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { FiArrowLeft, FiHeart, FiShoppingCart, FiStar, FiChevronLeft, FiChevronRight, FiMinus, FiPlus } from 'react-icons/fi';
import VariantSelector from '../components/VariantSelector';
import VariantPopup from '../components/VariantPopup';
// PWA Services
import { 
  getProductWithOffline, 
  addToCartWithSync, 
  addToWishlistWithSync,
  getWishlistWithOffline,
  removeFromWishlistWithSync
} from '../services/apiWithOffline';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedImage, setSelectedImage] = useState(0);
  const [showImageModal, setShowImageModal] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [wishlisted, setWishlisted] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [myRating, setMyRating] = useState(0);
  const [myComment, setMyComment] = useState('');  const [submitting, setSubmitting] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);  const [hoverRating, setHoverRating] = useState(0);
  const [showVariantPopup, setShowVariantPopup] = useState(false);
  const [popupAction, setPopupAction] = useState('cart'); // 'cart' or 'buy'
  const [selectedVariant, setSelectedVariant] = useState(null);
  useEffect(() => {
    window.scrollTo(0, 0);
    const token = localStorage.getItem('token');
    setIsAuthenticated(!!token);

    const timeout = setTimeout(() => {      setLoading(true);
      // Fetch product details using PWA service
      getProductWithOffline(id)
        .then(response => {
          const data = response.data;
          setProduct(data.product || null);
          setReviews(data.product?.reviews || []);
          setLoading(false);
          
          // Show offline indicator if data is from cache
          if (response.source === 'offline') {
            toast('Product loaded from offline storage', { icon: '📦' });
          }
          
          // Auto-select default variant if product has variants
          if (data.product?.hasVariants && data.product?.variants?.length > 0) {
            const availableVariants = data.product.variants.filter(v => v.stock > 0);
            if (availableVariants.length > 0) {
              const defaultVariant = availableVariants.find(v => v.isDefault) || 
                                   availableVariants.reduce((cheapest, current) => 
                                     current.price < cheapest.price ? current : cheapest
                                   );
              setSelectedVariant(defaultVariant);
            }
          }
          
          // Check if product is in wishlist
          if (token && data.product) {
            checkWishlistStatus(data.product._id, token);
          }
        })
        .catch(() => {
          setError('Failed to load product.');
          setLoading(false);
          toast.error('Failed to load product details');
        });
    }, 400);

    return () => clearTimeout(timeout);
  }, [id]);

  const checkWishlistStatus = async (productId, token) => {
    try {
      // Use PWA-enabled wishlist service
      const response = await getWishlistWithOffline();
      const isInWishlist = response.data?.some(item => item._id === productId);
      setWishlisted(isInWishlist || false);
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
      let result;
      if (wishlisted) {
        result = await removeFromWishlistWithSync(id);
      } else {
        result = await addToWishlistWithSync(id);
      }
      
      if (result.success) {
        setWishlisted(!wishlisted);
        const message = result.queued ? result.message : 
          (wishlisted ? 'Removed from wishlist' : 'Added to wishlist!');
        toast.success(message);
      } else {
        throw new Error('Failed to update wishlist');
      }
    } catch (error) {
      toast.error('Error updating wishlist');
      console.error('Wishlist error:', error);
    }
  };  // Variant helper functions
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
  const getDisplayStock = (product) => {
    if (selectedVariant) return selectedVariant.stock;
    
    if (product.hasVariants && product.variants?.length > 0) {
      const defaultVariant = getDefaultVariant(product);
      return defaultVariant ? defaultVariant.stock : 0;
    }
    return product.stock;
  };

  const getDisplayPrice = (product) => {
    if (selectedVariant) return selectedVariant.price;
    
    if (product.hasVariants && product.variants?.length > 0) {
      const defaultVariant = getDefaultVariant(product);
      return defaultVariant ? defaultVariant.price : product.price;
    }
    return product.price;
  };

  const getDisplayOriginalPrice = (product) => {
    if (selectedVariant) return selectedVariant.originalPrice;
    
    if (product.hasVariants && product.variants?.length > 0) {
      const defaultVariant = getDefaultVariant(product);
      return defaultVariant ? defaultVariant.originalPrice : product.originalPrice;
    }
    return product.originalPrice;
  };
  const handleAddToCart = async (productId = id, qty = quantity, variantFromPopup = null) => {
    if (!isAuthenticated) {
      toast.error('Please login to add to cart');
      return;
    }

    // Use variant from popup, selected variant, or check if product has variants
    const variantToUse = variantFromPopup || selectedVariant;
    
    // If product has variants and no variant is selected, show error
    if (product?.hasVariants && !variantToUse) {
      toast.error('Please select a variant first');
      return;
    }

    // Check stock
    const stockToCheck = variantToUse ? variantToUse.stock : product.stock;
    if (stockToCheck <= 0) {
      toast.error('Product is out of stock');
      return;
    }
    
    try {
      const requestBody = { 
        productId, 
        quantity: qty 
      };
      
      if (variantToUse) {
        requestBody.variantId = variantToUse.id;
      }

      // Use PWA-enabled cart service
      const result = await addToCartWithSync(productId, qty);

      if (result.success) {
        const variantText = variantToUse ? ` (${variantToUse.label})` : '';
        toast.success(result.queued ? result.message : `Added ${qty} ${product.name}${variantText} to cart`);
      } else {
        throw new Error('Failed to add to cart');
      }
    } catch (error) {
      toast.error('Error adding to cart');
      console.error('Cart error:', error);
    }
  };  const handleBuyNow = (productId = id, qty = quantity, variantFromPopup = null) => {
    if (!isAuthenticated) {
      toast.error('Please login to purchase');
      return;
    }

    // Use variant from popup, selected variant, or check if product has variants
    const variantToUse = variantFromPopup || selectedVariant;
    
    // If product has variants and no variant is selected, show error
    if (product?.hasVariants && !variantToUse) {
      toast.error('Please select a variant first');
      return;
    }

    // Check stock
    const stockToCheck = variantToUse ? variantToUse.stock : product.stock;
    if (stockToCheck <= 0) {
      toast.error('Product is out of stock');
      return;
    }
    
    // Navigate to checkout with variant info if available
    let url = `/checkout?product=${productId}&quantity=${qty}`;
    if (variantToUse) {
      url += `&variantId=${variantToUse.id}`;
    }
    navigate(url);
  };

  const handleSubmitReview = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to submit a review');
      return;
    }
    if (!myRating) {
      toast.error('Please select a rating');
      return;
    }    if (!myComment.trim()) {
      toast.error('Please write a review');
      return;
    }
    if (myComment.trim().length < 10) {
      toast.error('Review must be at least 10 characters long');
      return;
    }

    setSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5001/api/products/${id}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ rating: myRating, comment: myComment.trim() })
      });

      const data = await res.json();      if (res.ok) {
        // Refresh product data using PWA service
        const updatedProductResponse = await getProductWithOffline(id);
        setReviews(updatedProductResponse.data.product?.reviews || []);
        setMyRating(0);
        setMyComment('');
        toast.success('Review submitted successfully!');
      } else {
        toast.error(data.message || 'Failed to submit review');
      }    } catch (err) {
      console.error('Review submission error:', err);
      toast.error('Something went wrong');
    }finally {
      setSubmitting(false);
    }
  };

  // Reset quantity when variant changes
  useEffect(() => {
    setQuantity(1);
  }, [selectedVariant]);

  const images = product?.images?.length ? product.images : [product?.image || '/placeholder.png'];

  if (error) return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-[#f8faf8] flex items-center justify-center p-8"
    >
      <div className="bg-white rounded-3xl p-8 shadow-[8px_8px_16px_#e8eae8,-8px_-8px_16px_#ffffff] text-red-500">
        {error}
      </div>
    </motion.div>
  );

  if (!product && !loading) return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-[#f8faf8] flex items-center justify-center p-8"
    >
      <div className="bg-white rounded-3xl p-8 shadow-[8px_8px_16px_#e8eae8,-8px_-8px_16px_#ffffff] text-gray-500">
        Product not found.
      </div>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-[#f8faf8]">
      {/* Header */}
      <motion.div 
        initial={{ y: -20 }}
        animate={{ y: 0 }}
        className="flex items-center px-6 py-4 bg-white sticky top-0 z-10 shadow-[0_4px_12px_rgba(0,0,0,0.03)]"
      >
        <button 
          onClick={() => navigate(-1)} 
          className="mr-4 p-3 rounded-xl hover:bg-[#f8faf8] transition-all"
          aria-label="Go back"
        >
          <FiArrowLeft className="w-6 h-6 text-gray-700" />
        </button>
        <h1 className="text-xl font-semibold text-gray-800 flex-1">Product Details</h1>
      </motion.div>

      {loading ? (
        <div className="max-w-7xl mx-auto p-8">
          <div className="bg-white rounded-3xl p-8 shadow-[8px_8px_16px_#e8eae8,-8px_-8px_16px_#ffffff] animate-pulse">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div className="space-y-6">
                <div className="h-[500px] bg-[#f8faf8] rounded-2xl shadow-inner"></div>
                <div className="flex gap-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="w-20 h-20 bg-[#f8faf8] rounded-xl shadow-inner"></div>
                  ))}
                </div>
              </div>
              <div className="space-y-6">
                <div className="h-10 bg-[#f8faf8] rounded-xl shadow-inner w-3/4"></div>
                <div className="h-8 bg-[#f8faf8] rounded-xl shadow-inner w-1/3"></div>
                <div className="h-6 bg-[#f8faf8] rounded-xl shadow-inner w-1/4"></div>
                <div className="h-32 bg-[#f8faf8] rounded-xl shadow-inner"></div>
                <div className="h-14 bg-[#f8faf8] rounded-xl shadow-inner w-1/2"></div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
          {/* Product Details Card */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl p-8 shadow-[8px_8px_16px_#e8eae8,-8px_-8px_16px_#ffffff]"
          >            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-12">
              {/* Left Column - Images */}
              <div className="space-y-4 lg:space-y-6">
                <div className="relative rounded-2xl bg-[#f8faf8] shadow-inner p-2 lg:p-4">
                  <img
                    src={images[selectedImage]}
                    alt={product.name}
                    className="w-full h-[300px] lg:h-[500px] object-contain cursor-pointer hover:scale-105 transition-transform"
                    onClick={() => setShowImageModal(true)}
                  />                  {getDisplayStock(product) <= 0 && (
                    <div className="absolute top-4 right-4 lg:top-6 lg:right-6 bg-red-500 text-white px-3 py-1 lg:px-4 lg:py-2 rounded-xl font-medium shadow-lg text-sm lg:text-base">
                      Out of Stock
                    </div>
                  )}
                </div>
                <div className="flex gap-2 lg:gap-4 overflow-x-auto py-2">
                  {images.map((img, idx) => (
                    <button
                      key={idx}
                      className={`flex-shrink-0 w-16 h-16 lg:w-20 lg:h-20 rounded-xl ${
                        selectedImage === idx 
                          ? 'ring-2 ring-[#2ecc71] shadow-[4px_4px_8px_#e8eae8,-4px_-4px_8px_#ffffff]' 
                          : 'shadow-inner bg-[#f8faf8]'
                      } overflow-hidden focus:outline-none transition-all`}
                      onClick={() => setSelectedImage(idx)}
                      aria-label={`View image ${idx + 1}`}
                    >
                      <img src={img} alt={`${product.name} thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Right Column - Product Info */}
              <div className="space-y-4 lg:space-y-6">
                <div className="flex items-start justify-between">
                  <h2 className="text-2xl lg:text-3xl font-bold text-gray-800 pr-4">{product.name}</h2>
                  <button 
                    className={`p-2 lg:p-3 rounded-xl transition-all flex-shrink-0 ${
                      wishlisted 
                        ? 'bg-red-50 text-red-500 shadow-[4px_4px_8px_#e8eae8,-4px_-4px_8px_#ffffff]' 
                        : 'bg-[#f8faf8] text-gray-400 shadow-inner'
                    }`}
                    onClick={handleWishlistToggle}
                    aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
                  >
                    <FiHeart className="w-6 h-6" fill={wishlisted ? 'currentColor' : 'none'} />
                  </button>
                </div>                <div className="flex items-center gap-4">
                  <span className="text-[#2ecc71] font-bold text-3xl">₹{getDisplayPrice(product).toLocaleString()}</span>
                  {getDisplayOriginalPrice(product) && getDisplayOriginalPrice(product) > getDisplayPrice(product) && (
                    <span className="text-gray-400 line-through text-xl">₹{getDisplayOriginalPrice(product).toLocaleString()}</span>
                  )}
                </div>

                <div className="flex items-center gap-3 bg-[#f8faf8] p-3 rounded-xl shadow-inner">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <FiStar
                        key={star}
                        className={`h-5 w-5 ${
                          star <= Math.round(reviews.reduce((a, b) => a + (b.rating || 0), 0) / (reviews.length || 1)) 
                            ? 'text-yellow-400 fill-current' 
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-gray-600">
                    ({reviews.length} {reviews.length === 1 ? 'review' : 'reviews'})
                  </span>
                </div>                <div className="bg-[#f8faf8] p-4 rounded-xl shadow-inner">
                  <span className="text-gray-500 text-sm font-medium uppercase">{product.category}</span>
                  <p className="mt-2 text-gray-700 leading-relaxed">{product.description}</p>
                </div>

                {/* Variant Selector */}
                {product.hasVariants && (
                  <div className="space-y-3">
                    <h4 className="font-semibold text-gray-800">Choose Variant:</h4>
                    <VariantSelector
                      product={product}
                      selectedVariant={selectedVariant}
                      onVariantChange={setSelectedVariant}
                      size="default"
                    />
                  </div>
                )}

                <div className="flex items-center gap-3 bg-[#f8faf8] p-4 rounded-xl shadow-inner">
                  <span className={`w-3 h-3 rounded-full ${getDisplayStock(product) > 0 ? 'bg-[#2ecc71]' : 'bg-red-400'}`}></span>
                  <span className="font-medium text-gray-700">
                    {getDisplayStock(product) > 0 ? `${getDisplayStock(product)} units available` : 'Out of Stock'}
                  </span>
                </div>

                <div className="flex items-center gap-4 bg-[#f8faf8] p-4 rounded-xl shadow-inner">
                  <span className="font-medium text-gray-700">Quantity:</span>                  <div className="flex items-center bg-white rounded-xl shadow-[4px_4px_8px_#e8eae8,-4px_-4px_8px_#ffffff]">
                    <button
                      onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                      className="p-2 text-gray-600 hover:text-[#2ecc71] transition-colors"
                    >
                      <FiMinus />
                    </button>
                    <input 
                      type="number" 
                      min={1} 
                      max={getDisplayStock(product)}
                      value={quantity} 
                      onChange={e => setQuantity(Math.min(Number(e.target.value), getDisplayStock(product)))} 
                      className="w-16 text-center border-none focus:ring-0 bg-transparent font-medium" 
                    />
                    <button
                      onClick={() => setQuantity(prev => Math.min(prev + 1, getDisplayStock(product)))}
                      className="p-2 text-gray-600 hover:text-[#2ecc71] transition-colors"
                    >
                      <FiPlus />
                    </button>
                  </div>
                </div>                <div className="flex gap-4 pt-4">
                  <button 
                    onClick={() => handleAddToCart()}
                    disabled={getDisplayStock(product) <= 0} 
                    className={`flex-1 px-6 py-4 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${
                      getDisplayStock(product) > 0 
                        ? 'bg-[#2ecc71] text-white shadow-[0_4px_12px_rgba(46,204,113,0.2)] hover:shadow-[0_6px_16px_rgba(46,204,113,0.3)] hover:bg-[#27ae60]' 
                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    <FiShoppingCart className="w-5 h-5" />
                    {product.hasVariants ? 'Select & Add' : 'Add to Cart'}
                  </button>
                  <button 
                    onClick={() => handleBuyNow()}
                    disabled={getDisplayStock(product) <= 0} 
                    className={`flex-1 px-6 py-4 rounded-xl font-medium transition-all ${
                      getDisplayStock(product) > 0 
                        ? 'bg-[#27ae60] text-white shadow-[0_4px_12px_rgba(39,174,96,0.2)] hover:shadow-[0_6px_16px_rgba(39,174,96,0.3)] hover:bg-[#219a52]' 
                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    {product.hasVariants ? 'Select & Buy' : 'Buy Now'}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Reviews Section */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-3xl p-8 shadow-[8px_8px_16px_#e8eae8,-8px_-8px_16px_#ffffff]"
          >
            <h3 className="text-2xl font-bold text-gray-800 mb-8">Customer Reviews</h3>
            
            {reviews.length > 0 ? (
              <div className="space-y-6 mb-8">
                {reviews.map((review, index) => (
                  <motion.div 
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-[#f8faf8] rounded-2xl p-6 shadow-inner"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[#2ecc71] bg-opacity-10 flex items-center justify-center text-[#2ecc71] font-medium shadow-inner">
                          {review.user?.charAt(0) || 'A'}
                        </div>
                        <div>
                          <div className="font-medium text-gray-800">{review.user || 'Anonymous'}</div>
                          <div className="text-sm text-gray-500">{new Date(review.createdAt || Date.now()).toLocaleDateString()}</div>
                        </div>
                      </div>
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <FiStar
                            key={star}
                            className={`h-4 w-4 ${star <= (review.rating || 0) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-gray-700 leading-relaxed">{review.comment}</p>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-gray-500 italic mb-8 text-center py-8 bg-[#f8faf8] rounded-2xl shadow-inner">
                No reviews yet. Be the first to review this product!
              </div>
            )}

            {/* Add Review Form */}
            <div className="bg-[#f8faf8] rounded-2xl p-6 shadow-inner">
              <h4 className="text-xl font-semibold text-gray-800 mb-6">Write a Review</h4>
              {isAuthenticated ? (
                <form onSubmit={(e) => { e.preventDefault(); handleSubmitReview(); }}>
                  <div className="mb-6">
                    <label className="block text-gray-700 mb-2 font-medium">Your Rating</label>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setMyRating(star)}
                          onMouseEnter={() => setHoverRating(star)}
                          onMouseLeave={() => setHoverRating(0)}
                          className="focus:outline-none transition-transform hover:scale-110"
                        >
                          <FiStar
                            className={`h-8 w-8 ${
                              star <= (hoverRating || myRating) 
                                ? 'text-yellow-400 fill-current' 
                                : 'text-gray-300'
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>                  <div className="mb-6">
                    <label htmlFor="comment" className="block text-gray-700 mb-2 font-medium">Your Review</label>
                    <textarea
                      id="comment"
                      rows="4"
                      className="w-full bg-white rounded-xl px-4 py-3 shadow-[4px_4px_8px_#e8eae8,-4px_-4px_8px_#ffffff] border-none focus:ring-2 focus:ring-[#2ecc71]"
                      value={myComment}
                      onChange={(e) => setMyComment(e.target.value)}
                      placeholder="Share your thoughts about this product... (minimum 10 characters)"
                    ></textarea>
                    <div className="mt-2 text-sm text-gray-500">
                      {myComment.trim().length}/10 characters minimum
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-6 py-3 bg-[#2ecc71] text-white rounded-xl font-medium transition-all disabled:opacity-50 shadow-[0_4px_12px_rgba(46,204,113,0.2)] hover:shadow-[0_6px_16px_rgba(46,204,113,0.3)] hover:bg-[#27ae60] flex items-center justify-center gap-2"
                  >
                    {submitting ? (
                      <>
                        <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                        </svg>
                        Submitting...
                      </>
                    ) : 'Submit Review'}
                  </button>
                </form>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-600 mb-4">Please login to share your review</p>
                  <button
                    onClick={() => navigate('/login')}
                    className="px-6 py-3 bg-[#2ecc71] text-white rounded-xl font-medium transition-all shadow-[0_4px_12px_rgba(46,204,113,0.2)] hover:shadow-[0_6px_16px_rgba(46,204,113,0.3)] hover:bg-[#27ae60]"
                  >
                    Login to Review
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}

      {/* Image Modal */}
      {showImageModal && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90 backdrop-blur-sm"
          onClick={() => setShowImageModal(false)}
        >
          <button 
            className="absolute top-6 right-6 text-white text-4xl transition-transform hover:scale-110 focus:outline-none"
            onClick={(e) => {
              e.stopPropagation();
              setShowImageModal(false);
            }}
            aria-label="Close image modal"
          >
            &times;
          </button>
          <div className="relative max-h-[90vh] max-w-[90vw]">            <img 
              src={images[selectedImage]}
              alt={product?.name || 'Product image'}
              className="max-h-[90vh] max-w-[90vw] object-contain rounded-3xl" 
              onClick={e => e.stopPropagation()}
            />
            {/* Navigation buttons */}
            {images.length > 1 && (
              <>
                <button 
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-white bg-opacity-20 p-3 rounded-xl backdrop-blur-sm text-white hover:bg-opacity-30 transition-all"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedImage(prev => (prev - 1 + images.length) % images.length);
                  }}
                  aria-label="Previous image"
                >
                  <FiChevronLeft className="h-6 w-6" />
                </button>
                <button 
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-white bg-opacity-20 p-3 rounded-xl backdrop-blur-sm text-white hover:bg-opacity-30 transition-all"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedImage(prev => (prev + 1) % images.length);
                  }}
                  aria-label="Next image"
                >
                  <FiChevronRight className="h-6 w-6" />
                </button>
              </>
            )}
          </div>        </motion.div>
      )}

      {/* Variant Selection Popup */}
      <VariantPopup
        isOpen={showVariantPopup}
        onClose={() => {
          setShowVariantPopup(false);
          setPopupAction('cart');
        }}
        product={product}
        onAddToCart={handleAddToCart}
        onBuyNow={handleBuyNow}
        actionType={popupAction}
      />
    </div>
  );
};

export default ProductDetail;