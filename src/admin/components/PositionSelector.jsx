import React, { useState } from 'react';

const PositionSelector = ({ selectedPosition, onPositionChange, className = '' }) => {
  const [hoveredPosition, setHoveredPosition] = useState(null);

  const positions = [
    { value: 'top-left', label: 'Top Left', grid: 'row-start-1 col-start-1' },
    { value: 'top-center', label: 'Top Center', grid: 'row-start-1 col-start-2' },
    { value: 'top-right', label: 'Top Right', grid: 'row-start-1 col-start-3' },
    { value: 'center-left', label: 'Center Left', grid: 'row-start-2 col-start-1' },
    { value: 'center', label: 'Center', grid: 'row-start-2 col-start-2' },
    { value: 'center-right', label: 'Center Right', grid: 'row-start-2 col-start-3' },
    { value: 'bottom-left', label: 'Bottom Left', grid: 'row-start-3 col-start-1' },
    { value: 'bottom-center', label: 'Bottom Center', grid: 'row-start-3 col-start-2' },
    { value: 'bottom-right', label: 'Bottom Right', grid: 'row-start-3 col-start-3' }
  ];

  const handlePositionClick = (position) => {
    try {
      if (onPositionChange && typeof onPositionChange === 'function') {
        onPositionChange(position.value);
      }
    } catch (error) {
      console.error('Error in position change handler:', error);
    }
  };

  const handlePresetClick = (positionValue) => {
    try {
      if (onPositionChange && typeof onPositionChange === 'function') {
        onPositionChange(positionValue);
      }
    } catch (error) {
      console.error('Error in preset position change handler:', error);
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center gap-2 mb-4">
        <svg className="w-5 h-5 text-[#2ecc71]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h3 className="text-lg font-semibold text-gray-800">Text Position</h3>
      </div>
      
      <div className="bg-white rounded-lg shadow-sm border p-6">
        {/* Position Grid */}
        <div className="grid grid-rows-3 grid-cols-3 gap-3 aspect-video bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl p-4 relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="w-full h-full bg-gradient-to-r from-[#2ecc71] to-[#27ae60] rounded-xl"></div>
          </div>
          
          {/* Position Buttons */}
          {positions.map((position) => (
            <button
              key={position.value}
              type="button"
              onClick={() => handlePositionClick(position)}
              onMouseEnter={() => setHoveredPosition(position.value)}
              onMouseLeave={() => setHoveredPosition(null)}
              className={`${position.grid} relative z-10 w-8 h-8 rounded-lg border-2 transition-all duration-300 hover:scale-110 active:scale-95 ${
                selectedPosition === position.value
                  ? 'bg-[#2ecc71] border-[#2ecc71] text-white shadow-lg'
                  : 'bg-white border-gray-300 hover:border-[#2ecc71] hover:bg-[#2ecc71] hover:text-white'
              }`}
              title={position.label}
            >
              <svg className="w-4 h-4 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>
          ))}
        </div>
        
        {/* Position Labels */}
        <div className="mt-4 grid grid-cols-3 gap-2 text-xs text-center text-gray-600">
          {positions.map((position) => (
            <div
              key={position.value}
              className={`py-2 px-3 rounded-lg transition-all ${
                selectedPosition === position.value
                  ? 'bg-[#2ecc71] text-white'
                  : hoveredPosition === position.value
                  ? 'bg-gray-100'
                  : ''
              }`}
            >
              {position.label}
            </div>
          ))}
        </div>
        
        {/* Selected Position Info */}
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-700">
            <span className="font-medium">Selected Position:</span>{' '}
            {positions.find(p => p.value === selectedPosition)?.label || 'None'}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            This determines where your text will appear on the banner image.
          </p>
        </div>
      </div>
      
      {/* Quick Presets */}
      <div className="bg-white rounded-lg shadow-sm border p-4">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Quick Presets</h4>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => handlePresetClick('center')}
            className={`p-3 text-left rounded-lg border transition-all ${
              selectedPosition === 'center'
                ? 'border-[#2ecc71] bg-[#2ecc71]/10 text-[#2ecc71]'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="font-medium text-sm">Center Focus</div>
            <div className="text-xs text-gray-500">Main attention</div>
          </button>
          
          <button
            type="button"
            onClick={() => handlePresetClick('bottom-left')}
            className={`p-3 text-left rounded-lg border transition-all ${
              selectedPosition === 'bottom-left'
                ? 'border-[#2ecc71] bg-[#2ecc71]/10 text-[#2ecc71]'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="font-medium text-sm">Professional look</div>
            <div className="text-xs text-gray-500">Bottom left</div>
          </button>
          
          <button
            type="button"
            onClick={() => handlePresetClick('top-right')}
            className={`p-3 text-left rounded-lg border transition-all ${
              selectedPosition === 'top-right'
                ? 'border-[#2ecc71] bg-[#2ecc71]/10 text-[#2ecc71]'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="font-medium text-sm">Modern style</div>
            <div className="text-xs text-gray-500">Top right</div>
          </button>
          
          <button
            type="button"
            onClick={() => handlePresetClick('bottom-center')}
            className={`p-3 text-left rounded-lg border transition-all ${
              selectedPosition === 'bottom-center'
                ? 'border-[#2ecc71] bg-[#2ecc71]/10 text-[#2ecc71]'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="font-medium text-sm">Call-to-action</div>
            <div className="text-xs text-gray-500">Bottom center</div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default PositionSelector;
