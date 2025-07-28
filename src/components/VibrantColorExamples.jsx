// Example usage of vibrant colors defined in index.css
// This ensures all colors work in production builds

import React from 'react';

const VibrantColorExamples = () => {
  return (
    <div className="p-8 bg-page-gradient min-h-screen">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* ProductList Page Examples */}
        <div className="bg-white rounded-2xl p-6 shadow-green-medium">
          <h2 className="text-2xl font-bold mb-6 text-gray-800">ProductList Page Colors</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Add to Cart Button */}
            <button className="btn-add-to-cart px-6 py-3 rounded-2xl font-semibold transition-all duration-300 hover-scale">
              🛒 Add to Cart
            </button>
            
            {/* In Cart State */}
            <button className="btn-add-to-cart-in-cart px-6 py-3 rounded-2xl font-semibold transition-all duration-300">
              ✅ In Cart
            </button>
            
            {/* Buy Now Button */}
            <button className="btn-buy-now px-6 py-3 rounded-2xl font-semibold transition-all duration-300 hover-scale">
              ⚡ Buy Now
            </button>
            
            {/* Navigation Button */}
            <button className="nav-button px-6 py-3 rounded-2xl font-semibold transition-all duration-300">
              <span className="nav-icon">🔙</span> Back
            </button>
          </div>
        </div>
        
        {/* Orders Page Examples */}
        <div className="bg-white rounded-2xl p-6 shadow-green-medium">
          <h2 className="text-2xl font-bold mb-6 text-gray-800">Orders Page Status Colors</h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Status Icons */}
            <div className="text-center">
              <div className="status-icon-delivered text-4xl mb-2">✅</div>
              <div className="status-badge-delivered px-3 py-1 rounded-full text-sm font-semibold">
                Delivered
              </div>
            </div>
            
            <div className="text-center">
              <div className="status-icon-shipped text-4xl mb-2">🚚</div>
              <div className="status-badge-shipped px-3 py-1 rounded-full text-sm font-semibold">
                Shipped
              </div>
            </div>
            
            <div className="text-center">
              <div className="status-icon-pending text-4xl mb-2">⏰</div>
              <div className="status-badge-pending px-3 py-1 rounded-full text-sm font-semibold">
                Pending
              </div>
            </div>
            
            <div className="text-center">
              <div className="status-icon-cancelled text-4xl mb-2">❌</div>
              <div className="status-badge-cancelled px-3 py-1 rounded-full text-sm font-semibold">
                Cancelled
              </div>
            </div>
          </div>
        </div>
        
        {/* Return Detail Page Examples */}
        <div className="bg-white rounded-2xl p-6 shadow-green-medium">
          <h2 className="text-2xl font-bold mb-6 text-gray-800">Return Detail Page Status Colors</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="return-status-requested px-4 py-3 rounded-lg border">
              📝 Return Requested
            </div>
            <div className="return-status-approved px-4 py-3 rounded-lg border">
              ✅ Return Approved
            </div>
            <div className="return-status-rejected px-4 py-3 rounded-lg border">
              ❌ Return Rejected
            </div>
            <div className="return-status-warehouse-assigned px-4 py-3 rounded-lg border">
              🏢 Warehouse Assigned
            </div>
            <div className="return-status-pickup-scheduled px-4 py-3 rounded-lg border">
              📅 Pickup Scheduled
            </div>
            <div className="return-status-picked-up px-4 py-3 rounded-lg border">
              📦 Picked Up
            </div>
            <div className="return-status-in-warehouse px-4 py-3 rounded-lg border">
              🏭 In Warehouse
            </div>
            <div className="return-status-quality-checked px-4 py-3 rounded-lg border">
              🔍 Quality Checked
            </div>
            <div className="return-status-refund-approved px-4 py-3 rounded-lg border">
              💰 Refund Approved
            </div>
            <div className="return-status-completed px-4 py-3 rounded-lg border">
              🎉 Completed
            </div>
          </div>
        </div>
        
        {/* Glass Morphism Examples */}
        <div className="bg-wishlist-gradient rounded-2xl p-6">
          <h2 className="text-2xl font-bold mb-6 text-gray-800">Glass Morphism Effects</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="glass-effect-light p-4 rounded-xl">
              <h3 className="font-semibold mb-2">Light Glass</h3>
              <p className="text-sm text-gray-600">Subtle transparency effect</p>
            </div>
            
            <div className="glass-effect-medium p-4 rounded-xl">
              <h3 className="font-semibold mb-2">Medium Glass</h3>
              <p className="text-sm text-gray-600">Balanced blur effect</p>
            </div>
            
            <div className="glass-effect-strong p-4 rounded-xl">
              <h3 className="font-semibold mb-2">Strong Glass</h3>
              <p className="text-sm text-gray-600">High transparency</p>
            </div>
          </div>
        </div>
        
        {/* Shadow Effects */}
        <div className="bg-white rounded-2xl p-6">
          <h2 className="text-2xl font-bold mb-6 text-gray-800">Vibrant Shadow Effects</h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="shadow-green-light p-4 rounded-xl bg-white border">
              Light Shadow
            </div>
            <div className="shadow-green-medium p-4 rounded-xl bg-white border">
              Medium Shadow
            </div>
            <div className="shadow-green-strong p-4 rounded-xl bg-white border">
              Strong Shadow
            </div>
            <div className="shadow-green-hover p-4 rounded-xl bg-white border">
              Hover Shadow
            </div>
          </div>
        </div>
        
        {/* Notifications */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-800">Notification Colors</h2>
          
          <div className="notification-success p-4 rounded-lg">
            ✅ Success notification with vibrant green accents
          </div>
          
          <div className="notification-error p-4 rounded-lg">
            ❌ Error notification with vibrant red accents
          </div>
          
          <div className="notification-warning p-4 rounded-lg">
            ⚠️ Warning notification with vibrant amber accents
          </div>
          
          <div className="notification-info p-4 rounded-lg">
            ℹ️ Info notification with vibrant blue accents
          </div>
        </div>
        
        {/* Rating Stars */}
        <div className="bg-white rounded-2xl p-6 shadow-green-medium">
          <h2 className="text-2xl font-bold mb-6 text-gray-800">Rating Stars</h2>
          
          <div className="flex items-center gap-2">
            <span className="star-filled text-2xl">⭐</span>
            <span className="star-filled text-2xl">⭐</span>
            <span className="star-filled text-2xl">⭐</span>
            <span className="star-filled text-2xl">⭐</span>
            <span className="star-empty text-2xl">⭐</span>
            <span className="ml-2 text-gray-600">(4.0)</span>
          </div>
        </div>
        
      </div>
    </div>
  );
};

export default VibrantColorExamples;
