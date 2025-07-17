import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FiShoppingCart, FiCreditCard, FiCheckCircle } from 'react-icons/fi';
import CoinRedemptionWidget from '../components/Checkout/CoinRedemptionWidget';
import toast from 'react-hot-toast';

const CheckoutTest = () => {
  const [orderValue] = useState(1000); // Test order value
  const [discount, setDiscount] = useState(null);
  const [finalAmount, setFinalAmount] = useState(1000);

  const handleDiscountApply = (discountData) => {
    if (discountData) {
      setDiscount(discountData);
      setFinalAmount(discountData.finalAmount);
    }
  };

  const handleDiscountRemove = () => {
    setDiscount(null);
    setFinalAmount(orderValue);
  };

  const handlePayment = () => {
    toast.success(`Payment of ₹${finalAmount} processed successfully!`);
  };

  return (
    <div className="min-h-screen bg-[#f8faf8] py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Checkout - Phase 1 Test</h1>
          <p className="text-gray-600">Test the coins redemption system</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Order Summary */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-3xl p-6 shadow-[8px_8px_16px_#e8eae8,-8px_-8px_16px_#ffffff]"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-blue-100 rounded-2xl">
                <FiShoppingCart className="w-6 h-6 text-blue-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-800">Order Summary</h2>
            </div>

            {/* Sample Order Items */}
            <div className="space-y-4 mb-6">
              <div className="flex justify-between items-center p-4 bg-gray-50 rounded-2xl">
                <div>
                  <h3 className="font-medium text-gray-800">Sample Product 1</h3>
                  <p className="text-sm text-gray-600">Quantity: 2</p>
                </div>
                <span className="font-semibold text-gray-800">₹600</span>
              </div>
              
              <div className="flex justify-between items-center p-4 bg-gray-50 rounded-2xl">
                <div>
                  <h3 className="font-medium text-gray-800">Sample Product 2</h3>
                  <p className="text-sm text-gray-600">Quantity: 1</p>
                </div>
                <span className="font-semibold text-gray-800">₹400</span>
              </div>
            </div>

            {/* Order Totals */}
            <div className="border-t pt-4 space-y-3">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal:</span>
                <span>₹{orderValue}</span>
              </div>
              
              {discount && (
                <div className="flex justify-between text-green-600">
                  <span>Coin Discount ({discount.coinsUsed} coins):</span>
                  <span>-₹{discount.discountAmount}</span>
                </div>
              )}
              
              <div className="border-t pt-3 flex justify-between text-lg font-bold text-gray-800">
                <span>Total:</span>
                <span>₹{finalAmount}</span>
              </div>
            </div>
          </motion.div>

          {/* Payment Section */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            {/* Coin Redemption Widget */}
            <CoinRedemptionWidget
              orderValue={orderValue}
              onDiscountApply={handleDiscountApply}
              onDiscountRemove={handleDiscountRemove}
            />

            {/* Payment Button */}
            <motion.div
              className="bg-white rounded-3xl p-6 shadow-[8px_8px_16px_#e8eae8,-8px_-8px_16px_#ffffff]"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-green-100 rounded-2xl">
                  <FiCreditCard className="w-6 h-6 text-green-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-800">Payment</h2>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handlePayment}
                className="w-full py-4 bg-gradient-to-r from-[#2ecc71] to-[#27ae60] text-white rounded-2xl font-semibold text-lg shadow-[0_8px_24px_rgba(46,204,113,0.2)] hover:shadow-[0_12px_32px_rgba(46,204,113,0.3)] transition-all flex items-center justify-center gap-3"
              >
                <FiCheckCircle className="w-6 h-6" />
                Pay ₹{finalAmount}
              </motion.button>

              <p className="text-xs text-gray-500 text-center mt-3">
                This is a test payment button for Phase 1 implementation
              </p>
            </motion.div>

            {/* Discount Summary */}
            {discount && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-green-50 rounded-2xl p-4 border border-green-200"
              >
                <h3 className="font-semibold text-green-800 mb-2">Savings Applied!</h3>
                <div className="text-sm text-green-700">
                  <p>• Coins Used: {discount.coinsUsed}</p>
                  <p>• Discount: ₹{discount.discountAmount}</p>
                  <p>• You Saved: ₹{orderValue - finalAmount}</p>
                </div>
              </motion.div>
            )}
          </motion.div>
        </div>

        {/* Phase 1 Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-8 bg-blue-50 rounded-2xl p-6 border border-blue-200"
        >
          <h3 className="font-semibold text-blue-800 mb-2">Phase 1 Implementation Complete</h3>
          <div className="text-sm text-blue-700">
            <p className="mb-2">✅ Backend APIs: Discount calculation and validation</p>
            <p className="mb-2">✅ Frontend Widget: Smart suggestions and coin input</p>
            <p className="mb-2">✅ Real-time Integration: Live discount calculations</p>
            <p>🚀 Ready for testing with real user accounts and wallet balances!</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default CheckoutTest;
