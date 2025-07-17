import React from 'react';

const BannerPreview = ({
  imageUrl,
  title = '',
  subtitle = '',
  ctaText = '',
  textPosition = 'center',
  textColor = '#ffffff',
  backgroundColor = 'rgba(0, 0, 0, 0.4)'
}) => {
  // Safely handle position parameter
  const safeTextPosition = textPosition && typeof textPosition === 'string' ? textPosition : 'center';
  // Position mapping for CSS classes with safe fallback
  const positionClasses = {
    'top-left': 'items-start justify-start',
    'top-center': 'items-start justify-center',
    'top-right': 'items-start justify-end',
    'center-left': 'items-center justify-start',
    'center': 'items-center justify-center',
    'center-right': 'items-center justify-end',
    'bottom-left': 'items-end justify-start',
    'bottom-center': 'items-end justify-center',
    'bottom-right': 'items-end justify-end'
  };

  // Text alignment mapping with safe fallback
  const textAlignClasses = {
    'top-left': 'text-left',
    'top-center': 'text-center',
    'top-right': 'text-right',
    'center-left': 'text-left',
    'center': 'text-center',
    'center-right': 'text-right',
    'bottom-left': 'text-left',
    'bottom-center': 'text-center',
    'bottom-right': 'text-right'
  };

  // Get safe CSS classes with fallback
  const getPositionClass = () => {
    return positionClasses[safeTextPosition] || positionClasses['center'];
  };

  const getTextAlignClass = () => {
    return textAlignClasses[safeTextPosition] || textAlignClasses['center'];
  };

  return (
    <div className="banner-preview">
      {/* Desktop Preview */}
      <div className="mb-4">
        <h4 className="text-sm font-medium text-gray-600 mb-2">Desktop Preview (1920x600)</h4>
        <div className="relative w-full h-64 bg-gray-200 rounded-lg overflow-hidden border">
          {/* Background Image */}
          {imageUrl ? (
            <img
              src={imageUrl}
              alt="Banner preview"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-r from-gray-300 to-gray-400 flex items-center justify-center">
              <span className="text-gray-600 text-sm">No image selected</span>
            </div>
          )}

          {/* Text Overlay */}
          <div
            className={`absolute inset-0 flex ${getPositionClass()} p-8`}
            style={{ backgroundColor }}
          >
            <div className={`max-w-lg ${getTextAlignClass()}`}>
              {title && (
                <h1
                  className="text-3xl md:text-4xl font-bold mb-4 leading-tight"
                  style={{ color: textColor }}
                >
                  {title}
                </h1>
              )}
              {subtitle && (
                <p
                  className="text-lg md:text-xl mb-6 leading-relaxed"
                  style={{ color: textColor }}
                >
                  {subtitle}
                </p>
              )}
              {ctaText && (
                <button
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors duration-200 inline-block"
                  style={{
                    backgroundColor: textColor === '#ffffff' ? '#3B82F6' : textColor,
                    color: textColor === '#ffffff' ? '#ffffff' : '#ffffff'
                  }}
                >
                  {ctaText}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Preview */}
      <div className="mb-4">
        <h4 className="text-sm font-medium text-gray-600 mb-2">Mobile Preview (390x400)</h4>
        <div className="relative w-48 h-32 bg-gray-200 rounded-lg overflow-hidden border mx-auto">
          {/* Background Image */}
          {imageUrl ? (
            <img
              src={imageUrl}
              alt="Banner preview mobile"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-r from-gray-300 to-gray-400 flex items-center justify-center">
              <span className="text-gray-600 text-xs">No image</span>
            </div>
          )}

          {/* Text Overlay */}
          <div
            className={`absolute inset-0 flex ${getPositionClass()} p-3`}
            style={{ backgroundColor }}
          >
            <div className={`max-w-full ${getTextAlignClass()}`}>
              {title && (
                <h1
                  className="text-sm font-bold mb-1 leading-tight"
                  style={{ color: textColor }}
                >
                  {title.length > 20 ? title.substring(0, 20) + '...' : title}
                </h1>
              )}
              {subtitle && (
                <p
                  className="text-xs mb-2 leading-tight"
                  style={{ color: textColor }}
                >
                  {subtitle.length > 30 ? subtitle.substring(0, 30) + '...' : subtitle}
                </p>
              )}
              {ctaText && (
                <button
                  className="text-xs font-semibold py-1 px-2 rounded transition-colors duration-200 inline-block"
                  style={{
                    backgroundColor: textColor === '#ffffff' ? '#3B82F6' : textColor,
                    color: textColor === '#ffffff' ? '#ffffff' : '#ffffff'
                  }}
                >
                  {ctaText.length > 10 ? ctaText.substring(0, 10) + '...' : ctaText}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Preview Info */}
      <div className="text-xs text-gray-500 space-y-1">
        <div><strong>Position:</strong> {textPosition}</div>
        <div><strong>Text Color:</strong> {textColor}</div>
        <div><strong>Background:</strong> {backgroundColor}</div>
        {title && <div><strong>Title Length:</strong> {title.length}/100</div>}
        {subtitle && <div><strong>Subtitle Length:</strong> {subtitle.length}/200</div>}
        {ctaText && <div><strong>CTA Length:</strong> {ctaText.length}/50</div>}
      </div>
    </div>
  );
};

export default BannerPreview;
