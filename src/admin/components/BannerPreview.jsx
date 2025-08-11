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
    <div className="banner-preview bg-green-50 p-4 rounded-2xl border border-green-200">
      {/* Desktop Preview */}
      <div className="mb-6">
        <h4 className="text-sm font-bold text-green-800 mb-3 flex items-center">
          <svg className="w-4 h-4 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          Desktop Preview (1920x600)
        </h4>
        <div className="relative w-full h-56 bg-gray-100 rounded-xl overflow-hidden border-2 border-green-200 shadow-md">
          {/* Background Image */}
          {imageUrl ? (
            <img
              src={imageUrl}
              alt="Banner preview"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-green-100 flex items-center justify-center">
              <div className="text-center">
                <svg className="w-12 h-12 text-green-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="text-green-600 text-sm font-medium">No image selected</span>
              </div>
            </div>
          )}

          {/* Text Overlay */}
          <div
            className={`absolute inset-0 flex ${getPositionClass()} p-6 lg:p-8`}
            style={{ backgroundColor }}
          >
            <div className={`max-w-lg ${getTextAlignClass()}`}>
              {title && (
                <h1
                  className="text-2xl lg:text-3xl font-bold mb-3 leading-tight"
                  style={{ color: textColor }}
                >
                  {title}
                </h1>
              )}
              {subtitle && (
                <p
                  className="text-base lg:text-lg mb-4 leading-relaxed"
                  style={{ color: textColor }}
                >
                  {subtitle}
                </p>
              )}
              {ctaText && (
                <button
                  className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-6 rounded-xl transition-all duration-300 inline-block shadow-md hover:shadow-lg transform hover:scale-105"
                  style={{
                    backgroundColor: textColor === '#ffffff' ? '#16a34a' : textColor,
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
      <div className="mb-6">
        <h4 className="text-sm font-bold text-green-800 mb-3 flex items-center">
          <svg className="w-4 h-4 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a1 1 0 001-1V4a1 1 0 00-1-1H8a1 1 0 00-1 1v16a1 1 0 001 1z" />
          </svg>
          Mobile Preview (390x400)
        </h4>
        <div className="relative w-48 h-32 bg-gray-100 rounded-xl overflow-hidden border-2 border-green-200 mx-auto shadow-md">
          {/* Background Image */}
          {imageUrl ? (
            <img
              src={imageUrl}
              alt="Banner preview mobile"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-green-100 flex items-center justify-center">
              <span className="text-green-600 text-xs font-medium">No image</span>
            </div>
          )}

          {/* Text Overlay */}
          <div
            className={`absolute inset-0 flex ${getPositionClass()} p-2`}
            style={{ backgroundColor }}
          >
            <div className={`max-w-full ${getTextAlignClass()}`}>
              {title && (
                <h1
                  className="text-xs font-bold mb-1 leading-tight"
                  style={{ color: textColor }}
                >
                  {title.length > 20 ? title.substring(0, 20) + '...' : title}
                </h1>
              )}
              {subtitle && (
                <p
                  className="text-xs mb-1 leading-tight opacity-90"
                  style={{ color: textColor }}
                >
                  {subtitle.length > 30 ? subtitle.substring(0, 30) + '...' : subtitle}
                </p>
              )}
              {ctaText && (
                <button
                  className="text-xs font-semibold py-1 px-2 rounded-lg transition-all duration-200 inline-block shadow-sm"
                  style={{
                    backgroundColor: textColor === '#ffffff' ? '#16a34a' : textColor,
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
      <div className="bg-white p-4 rounded-xl border border-green-200 shadow-sm">
        <h5 className="text-sm font-bold text-green-800 mb-3">Preview Details</h5>
        <div className="text-xs text-green-700 space-y-2 grid grid-cols-1 lg:grid-cols-2 gap-2">
          <div className="bg-green-50 p-2 rounded-lg">
            <strong className="text-green-800">Position:</strong> 
            <span className="ml-1 text-green-600">{textPosition}</span>
          </div>
          <div className="bg-green-50 p-2 rounded-lg">
            <strong className="text-green-800">Text Color:</strong> 
            <span className="ml-1 text-green-600">{textColor}</span>
          </div>
          <div className="bg-green-50 p-2 rounded-lg lg:col-span-2">
            <strong className="text-green-800">Background:</strong> 
            <span className="ml-1 text-green-600">{backgroundColor}</span>
          </div>
          {title && (
            <div className="bg-green-50 p-2 rounded-lg">
              <strong className="text-green-800">Title Length:</strong> 
              <span className="ml-1 text-green-600">{title.length}/100</span>
            </div>
          )}
          {subtitle && (
            <div className="bg-green-50 p-2 rounded-lg">
              <strong className="text-green-800">Subtitle Length:</strong> 
              <span className="ml-1 text-green-600">{subtitle.length}/200</span>
            </div>
          )}
          {ctaText && (
            <div className="bg-green-50 p-2 rounded-lg">
              <strong className="text-green-800">CTA Length:</strong> 
              <span className="ml-1 text-green-600">{ctaText.length}/50</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BannerPreview;
