import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiChevronDown, FiCheck, FiDollarSign, FiPackage } from 'react-icons/fi';

const VariantSelector = ({ 
  product, 
  selectedVariant, 
  onVariantChange, 
  className = "",
  size = "default" // "small", "default", "large"
}) => {
  const [isOpen, setIsOpen] = useState(false);

  // Get available variants (only show variants with stock > 0)
  const availableVariants = product?.hasVariants && product?.variants 
    ? product.variants.filter(variant => variant.stock > 0)
    : [];

  // Get default variant if none selected
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

  // Set default variant on component mount
  useEffect(() => {
    if (!selectedVariant && availableVariants.length > 0) {
      const defaultVariant = getDefaultVariant();
      if (defaultVariant && onVariantChange) {
        onVariantChange(defaultVariant);
      }
    }
  }, [product, availableVariants.length]);

  // Don't render if product has no variants or no available variants
  if (!product?.hasVariants || !availableVariants.length) {
    return null;
  }

  const handleVariantSelect = (variant) => {
    setIsOpen(false);
    if (onVariantChange) {
      onVariantChange(variant);
    }
  };

  const sizeClasses = {
    small: {
      container: "text-xs",
      button: "px-2 py-1.5 text-xs",
      dropdown: "text-xs",
      option: "px-2 py-1.5"
    },
    default: {
      container: "text-sm",
      button: "px-3 py-2 text-sm",
      dropdown: "text-sm", 
      option: "px-3 py-2"
    },
    large: {
      container: "text-base",
      button: "px-4 py-3 text-base",
      dropdown: "text-base",
      option: "px-4 py-3"
    }
  };

  const classes = sizeClasses[size];
  const currentVariant = selectedVariant || getDefaultVariant();

  return (
    <div className={`relative ${classes.container} ${className}`}>
      {/* Dropdown Button */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setIsOpen(!isOpen)}
        className={`
          w-full bg-white border border-gray-200 rounded-xl 
          flex items-center justify-between gap-2
          hover:border-[#2ecc71] hover:shadow-md
          transition-all duration-200
          ${classes.button}
          ${isOpen ? 'border-[#2ecc71] shadow-md' : ''}
        `}
      >
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <FiPackage className="w-4 h-4 text-gray-500 flex-shrink-0" />
          <div className="flex flex-col items-start min-w-0">
            <span className="font-medium text-gray-800 truncate">
              {currentVariant?.label || currentVariant?.name || 'Select Variant'}
            </span>
            {currentVariant && (
              <span className="text-[#2ecc71] font-semibold">
                ₹{currentVariant.price.toLocaleString()}
                {currentVariant.originalPrice && (
                  <span className="text-gray-400 line-through ml-1 text-xs">
                    ₹{currentVariant.originalPrice.toLocaleString()}
                  </span>
                )}
              </span>
            )}
          </div>
        </div>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="flex-shrink-0"
        >
          <FiChevronDown className="w-4 h-4 text-gray-500" />
        </motion.div>
      </motion.button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <div 
              className="fixed inset-0 z-10"
              onClick={() => setIsOpen(false)}
            />
            
            {/* Dropdown Content */}
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className={`
                absolute top-full left-0 right-0 mt-2 z-20
                bg-white border border-gray-200 rounded-xl shadow-xl
                max-h-64 overflow-y-auto
                ${classes.dropdown}
              `}
            >
              {availableVariants.map((variant) => {
                const isSelected = currentVariant?.id === variant.id;
                const hasDiscount = variant.originalPrice && variant.originalPrice > variant.price;
                const discountPercent = hasDiscount 
                  ? Math.round(((variant.originalPrice - variant.price) / variant.originalPrice) * 100)
                  : 0;

                return (
                  <motion.button
                    key={variant.id}
                    whileHover={{ backgroundColor: '#f8faf8' }}
                    onClick={() => handleVariantSelect(variant)}
                    className={`
                      w-full flex items-center justify-between gap-3
                      hover:bg-gray-50 transition-colors duration-200
                      border-b border-gray-100 last:border-b-0
                      ${classes.option}
                      ${isSelected ? 'bg-[#2ecc71]/5 border-[#2ecc71]/20' : ''}
                    `}
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      {/* Selection Indicator */}
                      <div className={`
                        w-4 h-4 rounded-full border-2 flex items-center justify-center
                        transition-colors duration-200
                        ${isSelected 
                          ? 'border-[#2ecc71] bg-[#2ecc71]' 
                          : 'border-gray-300'
                        }
                      `}>
                        {isSelected && (
                          <FiCheck className="w-2.5 h-2.5 text-white" />
                        )}
                      </div>

                      {/* Variant Info */}
                      <div className="flex flex-col items-start min-w-0">
                        <div className="flex items-center gap-2">
                          <span className={`font-medium truncate ${
                            isSelected ? 'text-[#2ecc71]' : 'text-gray-800'
                          }`}>
                            {variant.label}
                          </span>
                          {variant.isDefault && (
                            <span className="px-1.5 py-0.5 bg-blue-100 text-blue-600 text-xs rounded font-medium">
                              Default
                            </span>
                          )}
                          {hasDiscount && (
                            <span className="px-1.5 py-0.5 bg-red-100 text-red-600 text-xs rounded font-medium">
                              {discountPercent}% OFF
                            </span>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <span>{variant.stock} in stock</span>
                          {variant.sku && (
                            <span>• SKU: {variant.sku}</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Price Info */}
                    <div className="flex flex-col items-end">
                      <div className="flex items-center gap-1">
                        <FiDollarSign className="w-3 h-3 text-[#2ecc71]" />
                        <span className="font-semibold text-[#2ecc71]">
                          ₹{variant.price.toLocaleString()}
                        </span>
                      </div>
                      {variant.originalPrice && variant.originalPrice > variant.price && (
                        <span className="text-xs text-gray-400 line-through">
                          ₹{variant.originalPrice.toLocaleString()}
                        </span>
                      )}
                    </div>
                  </motion.button>
                );
              })}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default VariantSelector;
