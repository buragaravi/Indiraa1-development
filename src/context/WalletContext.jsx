import React, { createContext, useContext, useState, useEffect } from 'react';

const WalletContext = createContext();

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};

export const WalletProvider = ({ children }) => {
  const [wallet, setWallet] = useState({
    balance: 0,
    totalEarned: 0,
    totalSpent: 0,
    recentTransactionsCount: 0,
    transactionStats: []
  });
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch wallet balance
  const fetchWalletBalance = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch('http://localhost:5001/api/wallet/balance', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (data.success) {
        setWallet(data.wallet);
      } else {
        throw new Error(data.message || 'Failed to fetch wallet balance');
      }
    } catch (error) {
      console.error('Fetch wallet balance error:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch transaction history
  const fetchTransactions = async (page = 1, limit = 20, type = null) => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const params = new URLSearchParams({ page: page.toString(), limit: limit.toString() });
      if (type) params.append('type', type);

      const response = await fetch(`http://localhost:5001/api/wallet/transactions?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (data.success) {
        if (page === 1) {
          setTransactions(data.transactions);
        } else {
          setTransactions(prev => [...prev, ...data.transactions]);
        }
        return data.pagination;
      } else {
        throw new Error(data.message || 'Failed to fetch transactions');
      }
    } catch (error) {
      console.error('Fetch transactions error:', error);
      setError(error.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Refresh wallet data
  const refreshWallet = async () => {
    await fetchWalletBalance();
    await fetchTransactions(1, 10); // Get latest 10 transactions
  };

  // Update wallet balance optimistically
  const updateBalance = (amount) => {
    setWallet(prev => ({
      ...prev,
      balance: prev.balance + amount,
      totalEarned: amount > 0 ? prev.totalEarned + amount : prev.totalEarned,
      totalSpent: amount < 0 ? prev.totalSpent + Math.abs(amount) : prev.totalSpent
    }));
  };

  // Add new transaction to the list
  const addTransaction = (transaction) => {
    setTransactions(prev => [transaction, ...prev]);
  };

  // Initialize wallet data on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      refreshWallet();
    }
  }, []);

  const value = {
    wallet,
    transactions,
    loading,
    error,
    fetchWalletBalance,
    fetchTransactions,
    refreshWallet,
    updateBalance,
    addTransaction,
    setError
  };

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
};

export default WalletContext;
