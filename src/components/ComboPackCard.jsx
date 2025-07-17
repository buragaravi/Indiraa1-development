import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { FiStar, FiTag, FiPackage } from 'react-icons/fi';

const ComboPackCard = ({ comboPack, index = 0, viewMode = 'grid' }) => {
  const navigate = useNavigate();
  const handleClick = () => {
    navigate(`/combo-packs/${comboPack._id}`);
  };

  const getDisplayImage = () => {
    // Show main image if available
    if (comboPack.mainImage) {
      return comboPack.mainImage;
    }
    
    // Otherwise, show first product image
    if (comboPack.products && comboPack.products.length > 0) {
      const firstProduct = comboPack.products[0];
      if (firstProduct.images && firstProduct.images.length > 0) {
        return firstProduct.images[0].url;
      }
    }
    
    // Fallback image
    return '/api/placeholder/300/300';
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      onClick={handleClick}
      className={`bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer group overflow-hidden border border-gray-100 ${
        viewMode === 'list' ? 'flex' : ''
      }`}
    >
      {/* Image Section */}
      <div className={`relative bg-gray-100 overflow-hidden ${
        viewMode === 'list' ? 'w-48 h-48 flex-shrink-0' : 'h-48'
      }`}>
        <img
          src={getDisplayImage()}
          alt={comboPack.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        
        {/* Badge */}
        <div className="absolute top-3 left-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-3 py-1 rounded-full text-sm font-medium">
          <FiPackage className="w-4 h-4 inline mr-1" />
          Combo
        </div>
        
        {/* Discount Badge */}
        {comboPack.discountPercentage > 0 && (
          <div className="absolute top-3 right-3 bg-red-500 text-white px-2 py-1 rounded-lg text-sm font-bold">
            {comboPack.discountPercentage}% OFF
          </div>
        )}

        {/* Custom Badge */}
        {comboPack.badgeText && (
          <div className="absolute bottom-3 left-3 bg-black/70 text-white px-2 py-1 rounded text-xs">
            {comboPack.badgeText}
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="p-4 flex-1">
        {/* Title */}
        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
          {comboPack.name}
        </h3>

        {/* Description */}
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
          {comboPack.description}
        </p>

        {/* Products Count */}
        <div className="flex items-center mb-3 text-sm text-gray-500">
          <FiTag className="w-4 h-4 mr-1" />
          <span>{comboPack.products?.length || 0} items included</span>
        </div>

        {/* Rating */}
        {comboPack.averageRating > 0 && (
          <div className="flex items-center mb-3">
            <div className="flex items-center">
              {[1, 2, 3, 4, 5].map((star) => (
                <FiStar
                  key={star}
                  className={`w-4 h-4 ${
                    star <= comboPack.averageRating
                      ? 'text-yellow-400 fill-current'
                      : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            <span className="text-sm text-gray-600 ml-2">
              ({comboPack.totalReviews || 0})
            </span>
          </div>
        )}

        {/* Pricing */}
        <div className={`flex items-center ${viewMode === 'list' ? 'justify-between' : 'justify-between'}`}>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xl font-bold text-gray-900">
                {formatPrice(comboPack.comboPrice)}
              </span>
              {comboPack.originalTotalPrice > comboPack.comboPrice && (
                <span className="text-sm text-gray-500 line-through">
                  {formatPrice(comboPack.originalTotalPrice)}
                </span>
              )}
            </div>
            {comboPack.discountAmount > 0 && (
              <div className="text-sm text-green-600 font-medium">
                Save {formatPrice(comboPack.discountAmount)}
              </div>
            )}
          </div>

          {/* Stock Status */}
          <div className="text-right">
            {comboPack.stock > 0 ? (
              <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded">
                In Stock
              </span>
            ) : (
              <span className="text-xs text-red-600 bg-red-50 px-2 py-1 rounded">
                Out of Stock
              </span>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ComboPackCard;
