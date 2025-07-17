import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FiDollarSign, FiUsers, FiTrendingUp, FiGift, FiList, FiSettings } from 'react-icons/fi';

// Import all the wallet and referral components
import WalletBalance from './WalletBalance';
import TransactionHistory from './TransactionHistory';
import CoinAnimation from './CoinAnimation';
import ReferralLink from '../Referral/ReferralLink';
import ReferralStats from '../Referral/ReferralStats';
import ReferralLeaderboard from '../Referral/ReferralLeaderboard';

const WalletDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');

  const tabs = [
    { id: 'overview', label: 'Overview', icon: FiDollarSign },
    { id: 'transactions', label: 'Transactions', icon: FiList },
    { id: 'referrals', label: 'Referrals', icon: FiUsers },
    { id: 'leaderboard', label: 'Leaderboard', icon: FiTrendingUp },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-6">
            {/* Main Wallet Balance */}
            <WalletBalance />
            
            {/* Referral Quick Actions */}
            <ReferralLink />
            
            {/* Recent Activity Preview */}
            <div className="bg-white rounded-3xl p-6 shadow-xl border border-gray-100">
              <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <FiList className="w-5 h-5 text-gray-500" />
                Recent Activity
              </h3>
              <TransactionHistory limit={5} compact={true} />
              <div className="mt-4 text-center">
                <button
                  onClick={() => setActiveTab('transactions')}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  View All Transactions →
                </button>
              </div>
            </div>
          </div>
        );

      case 'transactions':
        return (
          <div className="space-y-6">
            <TransactionHistory />
          </div>
        );

      case 'referrals':
        return (
          <div className="space-y-6">
            <ReferralLink />
            <ReferralStats />
          </div>
        );

      case 'leaderboard':
        return (
          <div className="space-y-6">
            <ReferralLeaderboard />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div 
          className="text-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Indira Coins Wallet
          </h1>
          <p className="text-gray-600">
            Manage your rewards, track transactions, and grow your referral network
          </p>
        </motion.div>

        {/* Tab Navigation */}
        <motion.div 
          className="flex flex-wrap justify-center gap-2 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <motion.button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-semibold transition-all ${
                  activeTab === tab.id
                    ? 'bg-white text-blue-600 shadow-lg border border-blue-100'
                    : 'bg-white/50 text-gray-600 hover:bg-white hover:shadow-md'
                }`}
                whileTap={{ scale: 0.98 }}
              >
                <Icon className="w-5 h-5" />
                {tab.label}
              </motion.button>
            );
          })}
        </motion.div>

        {/* Tab Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          {renderTabContent()}
        </motion.div>

        {/* Floating Action Button for Quick Share */}
        {activeTab !== 'referrals' && (
          <motion.div
            className="fixed bottom-8 right-8"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 1, type: 'spring', stiffness: 260, damping: 20 }}
          >
            <button
              onClick={() => setActiveTab('referrals')}
              className="w-14 h-14 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all flex items-center justify-center group"
              title="Share & Earn"
            >
              <FiGift className="w-6 h-6 group-hover:scale-110 transition-transform" />
            </button>
          </motion.div>
        )}

        {/* Coin Animation Component */}
        <CoinAnimation />
      </div>
    </div>
  );
};

export default WalletDashboard;
