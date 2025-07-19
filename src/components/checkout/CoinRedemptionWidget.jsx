import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiDollarSign, FiInfo, FiLoader, FiCheckCircle, FiX, FiCircle } from 'react-icons/fi';
import toast from 'react-hot-toast';

const CoinRedemptionWidget = ({ orderValue, onDiscountApply, appliedCoinDiscount = null }) => {
  const [availableCoins, setAvailableCoins] = useState(0);
  const [coinsToUse, setCoinsToUse] = useState(0);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [suggestions, setSuggestions] = useState(null);
  const [loading, setLoading] = useState(false);
  const [calculating, setCalculating] = useState(false);

  // Fetch user's coin balance on component mount
  useEffect(() => {
    fetchCoinBalance();
  }, []);

  // Calculate discount when coins change
  useEffect(() => {
    if (coinsToUse > 0 && orderValue > 0) {
      calculateDiscount();
    } else {
      setDiscountAmount(0);
    }
  }, [coinsToUse, orderValue]);

  const fetchCoinBalance = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch('http://localhost:5001/api/wallet/balance', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setAvailableCoins(data.wallet.balance);
        
        // Get suggestions for this order value
        if (orderValue > 0) {
          getSuggestions();
        }
      }
    } catch (error) {
      console.error('Error fetching coin balance:', error);
    }
  };

  const getSuggestions = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5001/api/wallet/calculate-discount', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ orderValue })
      });

      if (response.ok) {
        const data = await response.json();
        setSuggestions(data.data);
      }
    } catch (error) {
      console.error('Error getting suggestions:', error);
    }
  };

  const calculateDiscount = async () => {
    if (calculating) return;
    
    setCalculating(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5001/api/wallet/calculate-discount', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ orderValue, coinsToUse })
      });

      if (response.ok) {
        const data = await response.json();
        setDiscountAmount(data.data.discountAmount);
      } else {
        const error = await response.json();
        toast.error(error.message || 'Invalid coin amount');
        setDiscountAmount(0);
      }
    } catch (error) {
      console.error('Error calculating discount:', error);
      toast.error('Error calculating discount');
    } finally {
      setCalculating(false);
    }
  };

  const applyDiscount = () => {
    if (discountAmount > 0 && onDiscountApply) {
      setLoading(true);
      const discountData = {
        coinsUsed: coinsToUse,
        discountAmount: discountAmount,
        type: 'coins'
      };
      console.log('[COIN REDEMPTION WIDGET] Applying discount:', discountData);
      onDiscountApply(discountData);
      setTimeout(() => setLoading(false), 500);
      toast.success(`₹${discountAmount} discount applied using ${coinsToUse} coins!`);
    }
  };

  const removeDiscount = () => {
    setCoinsToUse(0);
    setDiscountAmount(0);
    if (onDiscountApply) {
      onDiscountApply(null);
    }
    toast.success('Coin discount removed');
  };

  const applySuggestion = (suggestionCoins) => {
    setCoinsToUse(suggestionCoins);
  };

  if (availableCoins === 0) {
    return (
      <div className="border border-gray-200 rounded-xl p-4 bg-gray-50">
        <div className="text-center text-gray-500">
          <FiCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No coins available for redemption</p>
          <p className="text-xs mt-1">Complete orders to earn Indira Coins!</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="border border-gray-200 rounded-xl p-6 bg-gradient-to-br from-green-50 to-emerald-50"
    >
      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
        <FiCircle className="w-5 h-5 text-green-600" />
        Use Indira Coins
      </h3>

      {/* Available Balance */}
      <div className="mb-4 p-3 bg-white rounded-lg border">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Available Balance:</span>
          <span className="font-bold text-green-600 flex items-center gap-1">
            <FiCircle className="w-4 h-4" />
            {availableCoins} coins
          </span>
        </div>
      </div>

      {/* Suggestions */}
      {suggestions && !appliedCoinDiscount && (
        <div className="mb-4 space-y-2">
          <p className="text-sm font-medium text-gray-700">Quick Suggestions:</p>
          <div className="space-y-2">
            {suggestions.suggestions.optimal && (
              <button
                onClick={() => applySuggestion(suggestions.suggestions.optimal.coins)}
                className="w-full text-left p-3 bg-white border border-green-200 rounded-lg hover:bg-green-50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-green-700">
                      Use {suggestions.suggestions.optimal.coins} coins
                    </p>
                    <p className="text-sm text-gray-600">
                      {suggestions.suggestions.optimal.description}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-600">
                      ₹{suggestions.suggestions.optimal.discount} off
                    </p>
                  </div>
                </div>
              </button>
            )}
            
            {suggestions.suggestions.alternative && (
              <button
                onClick={() => applySuggestion(suggestions.suggestions.alternative.coins)}
                className="w-full text-left p-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-700">
                      Use {suggestions.suggestions.alternative.coins} coins
                    </p>
                    <p className="text-sm text-gray-600">
                      {suggestions.suggestions.alternative.description}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-600">
                      ₹{suggestions.suggestions.alternative.discount} off
                    </p>
                  </div>
                </div>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Applied Discount Display */}
      {appliedCoinDiscount ? (
        <div className="p-4 bg-green-100 border border-green-200 rounded-lg mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FiCheckCircle className="w-5 h-5 text-green-600" />
              <div>
                <p className="font-semibold text-green-800">
                  {appliedCoinDiscount.coinsUsed} coins applied
                </p>
                <p className="text-sm text-green-600">
                  You saved ₹{appliedCoinDiscount.discountAmount}
                </p>
              </div>
            </div>
            <button
              onClick={removeDiscount}
              className="text-red-500 hover:text-red-700 transition-colors p-1"
            >
              <FiX className="w-5 h-5" />
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Coin Input */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Coins to use (5 coins = ₹1 discount)
            </label>
            <div className="relative">
              <input
                type="number"
                value={coinsToUse}
                onChange={(e) => setCoinsToUse(Math.max(0, Math.min(availableCoins, parseInt(e.target.value) || 0)))}
                max={availableCoins}
                min="0"
                step="5"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="Enter coins to use"
              />
              {calculating && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <FiLoader className="w-4 h-4 animate-spin text-green-600" />
                </div>
              )}
            </div>
            
            {/* Coin Slider */}
            <div className="mt-3">
              <input
                type="range"
                value={coinsToUse}
                onChange={(e) => setCoinsToUse(parseInt(e.target.value))}
                max={Math.min(availableCoins, suggestions?.limits?.maxCoins || availableCoins)}
                min="0"
                step="5"
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider-green"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>0</span>
                <span>{Math.min(availableCoins, suggestions?.limits?.maxCoins || availableCoins)}</span>
              </div>
            </div>
          </div>

          {/* Discount Preview */}
          {coinsToUse > 0 && (
            <div className="mb-4 p-3 bg-white border border-green-200 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Discount Amount:</span>
                <span className="font-bold text-green-600 flex items-center gap-1">
                  <FiDollarSign className="w-4 h-4" />
                  ₹{discountAmount}
                </span>
              </div>
              <div className="flex items-center justify-between mt-1">
                <span className="text-sm text-gray-600">Remaining Coins:</span>
                <span className="text-sm font-medium text-gray-700">
                  {availableCoins - coinsToUse} coins
                </span>
              </div>
            </div>
          )}

          {/* Apply Button */}
          {coinsToUse > 0 && discountAmount > 0 && (
            <button
              onClick={applyDiscount}
              disabled={loading || calculating}
              className="w-full py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all duration-200 shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <FiLoader className="w-4 h-4 animate-spin" />
              ) : (
                <FiCircle className="w-4 h-4" />
              )}
              Apply {coinsToUse} Coins (₹{discountAmount} off)
            </button>
          )}
        </>
      )}

      {/* Info */}
      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-start gap-2">
          <FiInfo className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="text-xs text-blue-700">
            <p>• 5 coins = ₹1 discount</p>
            <p>• Maximum 10% discount on order value</p>
            <p>• Coins will be deducted after order confirmation</p>
          </div>
        </div>
      </div>

      <style jsx>{`
        .slider-green::-webkit-slider-thumb {
          appearance: none;
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #10b981;
          cursor: pointer;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }
        
        .slider-green::-moz-range-thumb {
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #10b981;
          cursor: pointer;
          border: none;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }
      `}</style>
    </motion.div>
  );
};

export default CoinRedemptionWidget;
