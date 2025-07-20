import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiDollarSign } from 'react-icons/fi';
import { Link } from 'react-router-dom';

const NavbarWalletBalance = () => {
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(true);

  // Fetch wallet balance
  const fetchBalance = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch('http://localhost:5001/api/wallet/balance', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setBalance(data.wallet.balance);
        }
      }
    } catch (error) {
      console.error('Error fetching wallet balance:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetchBalance();
    } else {
      setLoading(false);
    }
  }, []);

  // Don't show anything if not logged in
  if (!localStorage.getItem('token')) {
    return null;
  }

  return (
    <Link to="/wallet">
      <motion.div 
        className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-amber-500 to-orange-600 rounded-full text-white text-sm font-medium hover:from-amber-600 hover:to-orange-700 transition-all cursor-pointer"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        title="View Wallet"
      >
        <FiDollarSign className="w-4 h-4" />
        <span className="hidden sm:inline">
          {loading ? '...' : balance.toLocaleString()}
        </span>
        <span className="hidden sm:inline text-xs opacity-90">coins</span>
      </motion.div>
    </Link>
  );
};

export default NavbarWalletBalance;
