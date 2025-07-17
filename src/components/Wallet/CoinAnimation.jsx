import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiDollarSign } from 'react-icons/fi';

const CoinAnimation = ({ amount, show, onComplete }) => {
  const [coins, setCoins] = useState([]);

  useEffect(() => {
    if (show && amount > 0) {
      // Create multiple coin animations based on amount
      const coinCount = Math.min(Math.max(Math.floor(amount / 5), 1), 10); // 1-10 coins
      const newCoins = Array.from({ length: coinCount }, (_, i) => ({
        id: Date.now() + i,
        delay: i * 0.1,
        x: Math.random() * 100 - 50, // Random horizontal spread
        rotation: Math.random() * 360
      }));
      setCoins(newCoins);

      // Auto complete after animation
      const timer = setTimeout(() => {
        onComplete && onComplete();
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [show, amount, onComplete]);

  if (!show) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center">
      <AnimatePresence>
        {coins.map((coin) => (
          <motion.div
            key={coin.id}
            className="absolute"
            initial={{ 
              scale: 0, 
              y: 50, 
              x: 0, 
              rotate: 0,
              opacity: 1 
            }}
            animate={{ 
              scale: [0, 1.2, 1, 0.8, 0], 
              y: [-100, -150, -200], 
              x: coin.x,
              rotate: coin.rotation,
              opacity: [0, 1, 1, 1, 0]
            }}
            transition={{ 
              duration: 1.5, 
              delay: coin.delay,
              ease: "easeOut"
            }}
          >
            <div className="w-8 h-8 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg">
              <FiDollarSign className="w-5 h-5 text-white" />
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Amount Text */}
      <motion.div
        className="absolute bg-white rounded-2xl px-4 py-2 shadow-xl border border-gray-200"
        initial={{ scale: 0, y: 0, opacity: 0 }}
        animate={{ scale: 1, y: -50, opacity: 1 }}
        exit={{ scale: 0, opacity: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <div className="flex items-center gap-2">
          <FiDollarSign className="w-5 h-5 text-amber-500" />
          <span className="font-bold text-lg text-gray-800">+{amount}</span>
          <span className="text-sm text-gray-600">Indira Coins</span>
        </div>
      </motion.div>
    </div>
  );
};

// Toast notification for coin rewards
export const CoinToast = ({ message, amount, show, onClose }) => {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => {
        onClose && onClose();
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [show, onClose]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed top-4 right-4 z-50 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-2xl p-4 shadow-xl max-w-sm"
          initial={{ x: 300, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 300, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          <div className="flex items-center gap-3">
            <motion.div
              className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center"
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            >
              <FiDollarSign className="w-6 h-6" />
            </motion.div>
            <div className="flex-1">
              <h4 className="font-semibold text-sm">Coins Earned!</h4>
              <p className="text-xs opacity-90">{message}</p>
              <div className="flex items-center gap-1 mt-1">
                <span className="font-bold">+{amount}</span>
                <span className="text-xs">Indira Coins</span>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="text-white/80 hover:text-white transition-colors"
            >
              ×
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CoinAnimation;
