import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiShoppingCart, FiZap, FiCheck, FiPackage, FiDollarSign } from 'react-icons/fi';

const VariantPopup = ({ 
  isOpen, 
  onClose, 
  product, 
  onAddToCart, 
  onBuyNow, 
  actionType // 'cart' or 'buy'
}) => {
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);

  // Get available variants (only show variants with stock > 0)
  const availableVariants = product?.hasVariants && product?.variants 
    ? product.variants.filter(variant => variant.stock > 0)
    : [];

  // Get default variant
  const getDefaultVariant = () => {
    if (!availableVariants.length) return null;
    
    // Find explicitly marked default variant
    const defaultVariant = availableVariants.find(v => v.isDefault);
    if (defaultVariant) return defaultVariant;
    
    // Return cheapest variant as default
    return availableVariants.reduce((cheapest, current) => 
      current.price < cheapest.price ? current : cheapest
    );
  };

  // Set default variant when popup opens
  useEffect(() => {
    if (isOpen && availableVariants.length > 0) {
      const defaultVariant = getDefaultVariant();
      setSelectedVariant(defaultVariant);
      setQuantity(1);
    }
  }, [isOpen, product]);

  // Reset state when popup closes
  useEffect(() => {
    if (!isOpen) {
      setSelectedVariant(null);
      setQuantity(1);
      setLoading(false);
    }
  }, [isOpen]);

  const handleAction = async () => {
    if (!selectedVariant) return;
    
    setLoading(true);
    try {
      if (actionType === 'cart') {
        await onAddToCart(product._id, quantity, selectedVariant);
      } else {
        await onBuyNow(product._id, quantity, selectedVariant);
      }
      onClose();
    } catch (error) {
      console.error('Action failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleQuantityChange = (newQuantity) => {
    if (selectedVariant && newQuantity <= selectedVariant.stock && newQuantity >= 1) {
      setQuantity(newQuantity);
    }
  };

  if (!product?.hasVariants || !availableVariants.length) {
    return null;
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          {/* Popup */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
              {/* Header */}
              <div className="sticky top-0 bg-white rounded-t-3xl border-b border-gray-100 p-6 flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-gray-800">Select Variant</h3>
                  <p className="text-sm text-gray-600 mt-1">{product.name}</p>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 rounded-xl hover:bg-gray-100 transition-colors"
                >
                  <FiX className="w-5 h-5 text-gray-600" />
                </button>
              </div>

              {/* Product Image */}
              <div className="px-6 pt-4">
                <div className="aspect-square bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl overflow-hidden">
                  <img 
                    src={product.images?.[0] || '/placeholder.png'} 
                    alt={product.name}
                    className="w-full h-full object-contain p-4"
                  />
                </div>
              </div>

              {/* Variant Selection */}
              <div className="p-6 space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <FiPackage className="w-4 h-4 text-[#2ecc71]" />
                    Choose Size/Option
                  </h4>
                  <div className="grid grid-cols-1 gap-2">
                    {availableVariants.map((variant) => {
                      const isSelected = selectedVariant?.id === variant.id;
                      const hasDiscount = variant.originalPrice && variant.originalPrice > variant.price;
                      const discountPercent = hasDiscount 
                        ? Math.round(((variant.originalPrice - variant.price) / variant.originalPrice) * 100)
                        : 0;

                      return (
                        <motion.button
                          key={variant.id}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => setSelectedVariant(variant)}
                          className={`
                            w-full p-4 rounded-2xl border-2 transition-all duration-200
                            flex items-center justify-between
                            ${isSelected 
                              ? 'border-[#2ecc71] bg-[#2ecc71]/5 shadow-lg shadow-[#2ecc71]/10' 
                              : 'border-gray-200 hover:border-[#2ecc71]/50 hover:bg-gray-50'
                            }
                          `}
                        >
                          <div className="flex items-center gap-3">
                            {/* Selection Indicator */}
                            <div className={`
                              w-5 h-5 rounded-full border-2 flex items-center justify-center
                              transition-colors duration-200
                              ${isSelected 
                                ? 'border-[#2ecc71] bg-[#2ecc71]' 
                                : 'border-gray-300'
                              }
                            `}>
                              {isSelected && (
                                <FiCheck className="w-3 h-3 text-white" />
                              )}
                            </div>

                            {/* Variant Info */}
                            <div className="text-left">
                              <div className="flex items-center gap-2">
                                <span className={`font-semibold ${
                                  isSelected ? 'text-[#2ecc71]' : 'text-gray-800'
                                }`}>
                                  {variant.label}
                                </span>
                                {variant.isDefault && (
                                  <span className="px-2 py-0.5 bg-blue-100 text-blue-600 text-xs rounded-full font-medium">
                                    Default
                                  </span>
                                )}
                                {hasDiscount && (
                                  <span className="px-2 py-0.5 bg-red-100 text-red-600 text-xs rounded-full font-medium">
                                    {discountPercent}% OFF
                                  </span>
                                )}
                              </div>
                              <div className="text-xs text-gray-500 mt-1">
                                {variant.stock} in stock
                                {variant.sku && ` • SKU: ${variant.sku}`}
                              </div>
                            </div>
                          </div>

                          {/* Price */}
                          <div className="text-right">
                            <div className="flex items-center gap-1">
                              <FiDollarSign className="w-3 h-3 text-[#2ecc71]" />
                              <span className="font-bold text-[#2ecc71]">
                                ₹{variant.price.toLocaleString()}
                              </span>
                            </div>
                            {hasDiscount && (
                              <span className="text-xs text-gray-400 line-through">
                                ₹{variant.originalPrice.toLocaleString()}
                              </span>
                            )}
                          </div>
                        </motion.button>
                      );
                    })}
                  </div>
                </div>

                {/* Quantity Selection */}
                {selectedVariant && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="space-y-3"
                  >
                    <h4 className="font-semibold text-gray-800 flex items-center gap-2">
                      <FiPackage className="w-4 h-4 text-[#2ecc71]" />
                      Quantity
                    </h4>
                    <div className="flex items-center justify-between bg-gray-50 rounded-2xl p-4">
                      <span className="text-gray-700 font-medium">Select Quantity:</span>
                      <div className="flex items-center bg-white rounded-xl shadow-sm">
                        <button
                          onClick={() => handleQuantityChange(quantity - 1)}
                          disabled={quantity <= 1}
                          className="w-10 h-10 flex items-center justify-center text-gray-600 hover:text-[#2ecc71] transition-colors rounded-l-xl hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <span className="text-lg font-semibold">−</span>
                        </button>
                        <span className="w-12 text-center font-bold text-gray-800">{quantity}</span>
                        <button
                          onClick={() => handleQuantityChange(quantity + 1)}
                          disabled={quantity >= selectedVariant.stock}
                          className="w-10 h-10 flex items-center justify-center text-gray-600 hover:text-[#2ecc71] transition-colors rounded-r-xl hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <span className="text-lg font-semibold">+</span>
                        </button>
                      </div>
                    </div>
                    
                    {/* Stock Warning */}
                    {selectedVariant.stock <= 10 && (
                      <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
                        <p className="text-amber-700 text-sm font-medium">
                          Only {selectedVariant.stock} left in stock
                        </p>
                      </div>
                    )}
                  </motion.div>
                )}

                {/* Total Price */}
                {selectedVariant && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="bg-gradient-to-r from-[#2ecc71]/10 to-[#27ae60]/10 rounded-2xl p-4 border border-[#2ecc71]/20"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-gray-700 font-medium">Total Price:</span>
                      <div className="text-right">
                        <span className="text-2xl font-bold text-[#2ecc71]">
                          ₹{(selectedVariant.price * quantity).toLocaleString()}
                        </span>
                        {selectedVariant.originalPrice && selectedVariant.originalPrice > selectedVariant.price && (
                          <div className="text-sm text-gray-400 line-through">
                            ₹{(selectedVariant.originalPrice * quantity).toLocaleString()}
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="sticky bottom-0 bg-white rounded-b-3xl border-t border-gray-100 p-6">
                <div className="flex gap-3">
                  <button
                    onClick={onClose}
                    className="flex-1 px-6 py-3 border-2 border-gray-200 text-gray-700 rounded-2xl font-semibold hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleAction}
                    disabled={!selectedVariant || loading}
                    className={`flex-1 px-6 py-3 rounded-2xl font-semibold transition-all duration-300 shadow-lg flex items-center justify-center gap-2 ${
                      actionType === 'cart'
                        ? 'bg-gradient-to-r from-[#2ecc71] to-[#27ae60] text-white hover:shadow-[#2ecc71]/25 hover:shadow-xl'
                        : 'bg-gradient-to-r from-amber-500 to-orange-600 text-white hover:shadow-amber-500/25 hover:shadow-xl'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {loading ? (
                      <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        {actionType === 'cart' ? <FiShoppingCart className="w-5 h-5" /> : <FiZap className="w-5 h-5" />}
                        {actionType === 'cart' ? 'Add to Cart' : 'Buy Now'}
                      </>
                    )}
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default VariantPopup;
