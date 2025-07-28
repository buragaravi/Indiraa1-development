import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  FiPackage,
  FiUpload,
  FiList,
  FiGrid,
  FiUsers,
  FiTruck,
  FiBarChart,
  FiSettings
} from 'react-icons/fi';
import BulkUpload from '../components/admin/BulkUpload';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('bulk-upload');

  const tabs = [
    { id: 'bulk-upload', label: 'Bulk Upload', icon: FiUpload },
    { id: 'products', label: 'Products', icon: FiPackage },
    { id: 'orders', label: 'Orders', icon: FiList },
    { id: 'users', label: 'Users', icon: FiUsers },
    { id: 'delivery', label: 'Delivery', icon: FiTruck },
    { id: 'analytics', label: 'Analytics', icon: FiBarChart },
    { id: 'settings', label: 'Settings', icon: FiSettings }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'bulk-upload':
        return <BulkUpload />;
      case 'products':
        return (
          <div className="bg-white rounded-2xl p-8 shadow-lg">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Product Management</h2>
            <p className="text-gray-600">Product management features coming soon...</p>
          </div>
        );
      case 'orders':
        return (
          <div className="bg-white rounded-2xl p-8 shadow-lg">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Order Management</h2>
            <p className="text-gray-600">Order management features coming soon...</p>
          </div>
        );
      case 'users':
        return (
          <div className="bg-white rounded-2xl p-8 shadow-lg">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">User Management</h2>
            <p className="text-gray-600">User management features coming soon...</p>
          </div>
        );
      case 'delivery':
        return (
          <div className="bg-white rounded-2xl p-8 shadow-lg">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Delivery Management</h2>
            <p className="text-gray-600">Delivery management features coming soon...</p>
          </div>
        );
      case 'analytics':
        return (
          <div className="bg-white rounded-2xl p-8 shadow-lg">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Analytics Dashboard</h2>
            <p className="text-gray-600">Analytics features coming soon...</p>
          </div>
        );
      case 'settings':
        return (
          <div className="bg-white rounded-2xl p-8 shadow-lg">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Admin Settings</h2>
            <p className="text-gray-600">Settings features coming soon...</p>
          </div>
        );
      default:
        return <BulkUpload />;
    }
  };

  return (
    <div className="admin-dashboard-bg">
      {/* Header */}
      <div className="bg-white/90 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center gap-3">
              <div className="admin-dashboard-logo">
                <FiGrid className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Admin Dashboard</h1>
                <p className="text-gray-600 text-sm">Manage your store efficiently</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                <span className="text-gray-700 font-semibold">A</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex gap-8">
          {/* Sidebar */}
          <div className="w-80 flex-shrink-0">
            <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-6 shadow-xl border border-white/30 sticky top-24">
              <h2 className="text-lg font-bold text-gray-800 mb-6">Navigation</h2>
              <nav className="space-y-2">
                {tabs.map((tab) => (
                  <motion.button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all duration-200 ${
                      activeTab === tab.id
                        ? 'admin-dashboard-nav-active'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <tab.icon className="w-5 h-5" />
                    {tab.label}
                  </motion.button>
                ))}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {renderTabContent()}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
