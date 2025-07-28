
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { FiList, FiLock, FiEye } from 'react-icons/fi';
import LogisticsManagerSidebar from './LogisticsManagerSidebar';
import SubAdminOrders from '../../pages/subadmin/SubAdminOrders';
import toast from 'react-hot-toast';

const LogisticsManagerDashboard = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    deliveredOrders: 0,
    shippedOrders: 0,
    recentOrders: [],
    averageDeliveryRating: null,
    totalReviews: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('subAdminToken') || sessionStorage.getItem('subAdminToken');
      if (!token) {
        toast.error('Please login to access logistics dashboard');
        navigate('/sub-admin/login');
        return;
      }
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };
      // Fetch orders and average rating
      const [ordersRes, ratingRes] = await Promise.allSettled([
        fetch('https://indiraa1-backend.onrender.com/api/products/orders/all', { headers }),
        fetch('https://indiraa1-backend.onrender.com/api/products/orders/ratings/average', { headers })
      ]);
      let totalOrders = 0, pendingOrders = 0, deliveredOrders = 0, shippedOrders = 0, recentOrders = [];
      if (ordersRes.status === 'fulfilled' && ordersRes.value.ok) {
        const ordersData = await ordersRes.value.json();
        const orders = ordersData.orders || [];
        totalOrders = orders.length;
        pendingOrders = orders.filter(order => order.status === 'Pending').length;
        deliveredOrders = orders.filter(order => order.status === 'Delivered').length;
        shippedOrders = orders.filter(order => order.status === 'Shipped').length;
        recentOrders = orders.slice(0, 5);
      }
      let averageDeliveryRating = null, totalReviews = 0;
      if (ratingRes.status === 'fulfilled' && ratingRes.value.ok) {
        const ratingData = await ratingRes.value.json();
        averageDeliveryRating = ratingData.averageRating;
        totalReviews = ratingData.totalReviews;
      }
      setStats({
        totalOrders,
        pendingOrders,
        deliveredOrders,
        shippedOrders,
        recentOrders,
        averageDeliveryRating,
        totalReviews
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const classNames = (...classes) => classes.filter(Boolean).join(' ');

  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        if (loading) {
          return (
            <div className="logistics-manager-bg">
              <div className="text-center p-8 rounded-3xl shadow-soft bg-white/70 backdrop-blur-sm">
                <div className="w-12 h-12 mx-auto mb-4 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
                <p className="text-gray-600">Loading dashboard...</p>
              </div>
            </div>
          );
        }
        return (
          <>
            <div className="w-full">
              {/* Header */}
              <div className="mb-6 md:mb-8">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="logistics-manager-title">
                      Logistics Manager Dashboard
                    </h1>
                    <p className="text-gray-600 text-base md:text-lg">
                      Welcome! Here are your order analytics.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium bg-blue-100 text-blue-800 border border-blue-200">
                      <FiEye className="w-4 h-4" />
                      Analytics Access
                    </div>
                  </div>
                </div>
              </div>
              {/* Stats Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-6 mb-8">
                <div className="neumorphic-card p-3 lg:p-6 rounded-2xl bg-white/60 backdrop-blur-sm border border-white/20 hover:shadow-soft-lg transition-all duration-300">
                  <div className="flex items-center">
                    <div className="neumorphic-icon p-2 lg:p-4 rounded-xl bg-gradient-to-br from-blue-400 to-cyan-500 shadow-soft">
                      <FiList className="w-4 h-4 lg:w-6 lg:h-6 text-white" />
                    </div>
                    <div className="ml-2 lg:ml-4 min-w-0">
                      <p className="text-xs lg:text-sm text-gray-600 font-medium">Total Orders</p>
                      <p className="text-lg lg:text-3xl font-bold text-gray-800 truncate">{stats.totalOrders}</p>
                    </div>
                  </div>
                </div>
                <div className="neumorphic-card p-3 lg:p-6 rounded-2xl bg-white/60 backdrop-blur-sm border border-white/20 hover:shadow-soft-lg transition-all duration-300">
                  <div className="flex items-center">
                    <div className="neumorphic-icon p-2 lg:p-4 rounded-xl bg-gradient-to-br from-yellow-400 to-orange-500 shadow-soft">
                      <FiList className="w-4 h-4 lg:w-6 lg:h-6 text-white" />
                    </div>
                    <div className="ml-2 lg:ml-4 min-w-0">
                      <p className="text-xs lg:text-sm text-gray-600 font-medium">Pending Orders</p>
                      <p className="text-lg lg:text-3xl font-bold text-gray-800 truncate">{stats.pendingOrders}</p>
                    </div>
                  </div>
                </div>
                <div className="neumorphic-card p-3 lg:p-6 rounded-2xl bg-white/60 backdrop-blur-sm border border-white/20 hover:shadow-soft-lg transition-all duration-300">
                  <div className="flex items-center">
                    <div className="neumorphic-icon p-2 lg:p-4 rounded-xl bg-gradient-to-br from-green-400 to-emerald-500 shadow-soft">
                      <FiList className="w-4 h-4 lg:w-6 lg:h-6 text-white" />
                    </div>
                    <div className="ml-2 lg:ml-4 min-w-0">
                      <p className="text-xs lg:text-sm text-gray-600 font-medium">Delivered Orders</p>
                      <p className="text-lg lg:text-3xl font-bold text-gray-800 truncate">{stats.deliveredOrders}</p>
                    </div>
                  </div>
                </div>
                <div className="neumorphic-card p-3 lg:p-6 rounded-2xl bg-white/60 backdrop-blur-sm border border-white/20 hover:shadow-soft-lg transition-all duration-300">
                  <div className="flex items-center">
                    <div className="neumorphic-icon p-2 lg:p-4 rounded-xl bg-gradient-to-br from-purple-400 to-violet-500 shadow-soft">
                      <FiList className="w-4 h-4 lg:w-6 lg:h-6 text-white" />
                    </div>
                    <div className="ml-2 lg:ml-4 min-w-0">
                      <p className="text-xs lg:text-sm text-gray-600 font-medium">Average Delivery Rating</p>
                      <p className="text-lg lg:text-3xl font-bold text-yellow-700 truncate">
                        {stats.averageDeliveryRating !== null ? `${stats.averageDeliveryRating} / 5` : '--'}
                      </p>
                      <p className="text-xs text-gray-500">{stats.totalReviews} reviews</p>
                    </div>
                  </div>
                </div>
              </div>
              {/* Recent Orders */}
              <div className="neumorphic-card p-4 lg:p-6 rounded-2xl bg-white/60 backdrop-blur-sm border border-white/20 mb-8">
                <h2 className="text-xl lg:text-2xl font-bold mb-4 lg:mb-6 text-gray-800 flex items-center">
                  <span className="w-2 h-6 lg:h-8 bg-gradient-to-b from-blue-400 to-cyan-500 rounded-full mr-2 lg:mr-3"></span>
                  Recent Orders
                </h2>
                {stats.recentOrders.length > 0 ? (
                  <>
                    <div className="hidden lg:block overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-gray-200/50">
                            <th className="text-left py-3 px-4 font-semibold text-gray-700">Order ID</th>
                            <th className="text-left py-3 px-4 font-semibold text-gray-700">Customer</th>
                            <th className="text-left py-3 px-4 font-semibold text-gray-700">Amount</th>
                            <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                            <th className="text-left py-3 px-4 font-semibold text-gray-700">Date</th>
                          </tr>
                        </thead>
                        <tbody>
                          {stats.recentOrders.map((order) => (
                            <tr key={order._id} className="border-b border-gray-100/50 hover:bg-white/30 transition-colors">
                              <td className="py-3 px-4 font-mono text-sm text-gray-600">{order._id.slice(-8)}</td>
                              <td className="py-3 px-4">
                                <div className="font-medium text-gray-800">{order.shipping?.name || 'N/A'}</div>
                              </td>
                              <td className="py-3 px-4 font-semibold text-gray-800">₹{order.totalAmount}</td>
                              <td className="py-3 px-4">
                                <span className={classNames(
                                  'px-3 py-1 rounded-full text-xs font-medium flex items-center',
                                  order.status === 'Delivered' ? 'bg-green-100 text-green-700' :
                                  order.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' :
                                  order.status === 'Shipped' ? 'bg-blue-100 text-blue-700' :
                                  'bg-gray-100 text-gray-700'
                                )}>
                                  {order.status === 'Pending' && <FiLock className="w-3 h-3 mr-1" />}
                                  {order.status}
                                </span>
                              </td>
                              <td className="py-3 px-4 text-sm text-gray-600">
                                {new Date(order.placedAt || order.createdAt).toLocaleDateString()}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <div className="lg:hidden space-y-3">
                      {stats.recentOrders.map((order) => (
                        <div key={order._id} className="neumorphic-card p-3 rounded-xl bg-white/40 backdrop-blur-sm border border-white/20">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <div className="font-mono text-xs text-gray-600 bg-gray-50/50 rounded px-2 py-1 inline-block mb-1">
                                #{order._id.slice(-8)}
                              </div>
                              <div className="font-medium text-gray-800 text-sm">{order.shipping?.name || 'N/A'}</div>
                            </div>
                            <div className="text-right">
                              <div className="font-semibold text-gray-800">₹{order.totalAmount}</div>
                              <div className="text-xs text-gray-500">
                                {new Date(order.placedAt || order.createdAt).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                          <span className={classNames(
                            'px-2 py-1 rounded-full text-xs font-medium inline-flex items-center',
                            order.status === 'Delivered' ? 'bg-green-100 text-green-700' :
                            order.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' :
                            order.status === 'Shipped' ? 'bg-blue-100 text-blue-700' :
                            'bg-gray-100 text-gray-700'
                          )}>
                            {order.status === 'Pending' && <FiLock className="w-3 h-3 mr-1" />}
                            {order.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 mx-auto mb-4 animate-spin rounded-full border-4 border-blue-400 border-t-transparent"></div>
                    <p className="text-gray-500 text-lg">No recent orders</p>
                  </div>
                )}
              </div>
            </div>
            <style jsx>{`
              .neumorphic-card {
                box-shadow: 20px 20px 60px rgba(0, 0, 0, 0.05), -20px -20px 60px rgba(255, 255, 255, 0.8);
              }
              .shadow-soft {
                box-shadow: 8px 8px 16px rgba(0, 0, 0, 0.1), -8px -8px 16px rgba(255, 255, 255, 0.8);
              }
              .shadow-soft-lg {
                box-shadow: 12px 12px 24px rgba(0, 0, 0, 0.1), -12px -12px 24px rgba(255, 255, 255, 0.8);
              }
              .neumorphic-button {
                box-shadow: 6px 6px 12px rgba(0, 0, 0, 0.2), -6px -6px 12px rgba(255, 255, 255, 0.1);
              }
              .neumorphic-icon {
                box-shadow: 4px 4px 8px rgba(0, 0, 0, 0.2), -4px -4px 8px rgba(255, 255, 255, 0.1);
              }
            `}</style>
          </>
        );
      case 'orders':
        return <SubAdminOrders />;
      default:
        return (
          <div className="bg-white rounded-2xl p-8 shadow-lg">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Logistics Overview</h2>
            <p className="text-gray-600">Welcome to the logistics management dashboard.</p>
          </div>
        );
    }
  };

  return (
    <>
      <LogisticsManagerSidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50" style={{ marginLeft: 'var(--sidebar-width, 0px)' }}>
        <div className="container mx-auto px-4 py-8">
          <div className="flex gap-8">
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
    </>
  );
};

export default LogisticsManagerDashboard;
