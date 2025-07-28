import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  PackageIcon, 
  OrdersIcon, 
  PeopleIcon, 
  TicketIcon, 
  LoadingIcon, 
  EmptyIcon,
  MoneyIcon,
  PendingIcon,
  DashboardIcon
} from '../../admin/components/AdminIcons';
import {
  FiPackage,
  FiUpload,
  FiList,
  FiGrid,
  FiUsers,
  FiTruck,
  FiBarChart,
  FiSettings,
  FiLayers,
  FiImage,
  FiHome,
  FiLock,
  FiEye
} from 'react-icons/fi';
import WarehouseManagerSidebar from './WarehouseManagerSidebar';
import SubAdminProducts from '../../pages/subadmin/SubAdminProducts';
import SubAdminOrders from '../../pages/subadmin/SubAdminOrders';
import SubAdminComboPacks from '../../pages/subadmin/SubAdminComboPacks';
import SubAdminBanners from '../../pages/subadmin/SubAdminBanners';
import { useWarehousePermissions } from '../../hooks/useWarehousePermissions';
import toast from 'react-hot-toast';

const WarehouseManagerDashboard = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const navigate = useNavigate();
  const {
    isReadOnly,
    isReadWrite,
    isAdmin,
    role,
    canPerformAction,
    showAccessDeniedMessage,
    getAccessLevelDisplay
  } = useWarehousePermissions();

  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalUsers: 0,
    totalCoupons: 0,
    totalComboPacks: 0,
    pendingOrders: 0,
    recentOrders: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Add debugging for initial load
    console.log('[WAREHOUSE DASHBOARD] Component mounted');
    console.log('[WAREHOUSE DASHBOARD] Initial storage check:', {
      localStorage_token: localStorage.getItem('subAdminToken'),
      sessionStorage_token: sessionStorage.getItem('subAdminToken'),
      localStorage_data: localStorage.getItem('subAdminData'),
      sessionStorage_data: sessionStorage.getItem('subAdminData')
    });
    
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      
      // Check both localStorage and sessionStorage for token
      const token = localStorage.getItem('subAdminToken') || sessionStorage.getItem('subAdminToken');
      const subAdminDataStr = localStorage.getItem('subAdminData') || sessionStorage.getItem('subAdminData');
      const subAdminData = JSON.parse(subAdminDataStr || '{}');
      
      console.log('[WAREHOUSE DASHBOARD] Token check:', {
        hasLocalStorageToken: !!localStorage.getItem('subAdminToken'),
        hasSessionStorageToken: !!sessionStorage.getItem('subAdminToken'),
        finalToken: !!token,
        subAdminData: subAdminData
      });
      
      if (!token) {
        toast.error('Please login to access warehouse dashboard');
        navigate('/sub-admin/login');
        return;
      }

      // Allow both read_only and read_write access for warehouse and logistics managers
      const allowedRoles = ['warehouse_manager', 'logistics_manager'];
      const allowedAccess = ['read', 'read_write'];
      
      // Handle both 'permissions' (from model) and 'access_level' (legacy) field names
      const accessLevel = subAdminData.permissions || subAdminData.access_level;
      
      console.log('[WAREHOUSE DASHBOARD] Permission check:', {
        role: subAdminData.role,
        permissions: subAdminData.permissions,
        access_level: subAdminData.access_level,
        finalAccessLevel: accessLevel,
        allowedRoles,
        allowedAccess
      });
      
      if (!allowedRoles.includes(subAdminData.role) || !allowedAccess.includes(accessLevel)) {
        console.log('[WAREHOUSE DASHBOARD] Access denied:', {
          role: subAdminData.role,
          access_level: accessLevel,
          allowedRoles,
          allowedAccess
        });
        toast.error('Access denied. Insufficient permissions.');
        navigate('/sub-admin/login');
        return;
      }

      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      // Fetch all data in parallel
      const [productsRes, ordersRes, usersRes, couponsRes, comboPacksRes] = await Promise.allSettled([
        fetch('https://indiraa1-backend.onrender.com/api/products/', { headers }),
        fetch('https://indiraa1-backend.onrender.com/api/products/orders/all', { headers }),
        fetch('https://indiraa1-backend.onrender.com/api/products/users/all', { headers }),
        fetch('https://indiraa1-backend.onrender.com/api/coupons/', { headers }),
        fetch('https://indiraa1-backend.onrender.com/api/combo-packs/all', { headers })
      ]);

      // Process products
      let totalProducts = 0;
      if (productsRes.status === 'fulfilled' && productsRes.value.ok) {
        const productsData = await productsRes.value.json();
        totalProducts = productsData.products?.length || 0;
      }

      // Process orders
      let totalOrders = 0;
      let pendingOrders = 0;
      let recentOrders = [];
      if (ordersRes.status === 'fulfilled' && ordersRes.value.ok) {
        const ordersData = await ordersRes.value.json();
        const orders = ordersData.orders || [];
        totalOrders = orders.length;
        pendingOrders = orders.filter(order => order.status === 'Pending').length;
        recentOrders = orders.slice(0, 5);
      }

      // Process users
      let totalUsers = 0;
      if (usersRes.status === 'fulfilled' && usersRes.value.ok) {
        const usersData = await usersRes.value.json();
        totalUsers = usersData.users?.length || 0;
      }

      // Process coupons
      let totalCoupons = 0;
      if (couponsRes.status === 'fulfilled' && couponsRes.value.ok) {
        const couponsData = await couponsRes.value.json();
        totalCoupons = couponsData.coupons?.length || 0;
      }

      // Process combo packs
      let totalComboPacks = 0;
      if (comboPacksRes.status === 'fulfilled' && comboPacksRes.value.ok) {
        const comboPacksData = await comboPacksRes.value.json();
        totalComboPacks = comboPacksData.comboPacks?.length || 0;
      }

      setStats({
        totalProducts,
        totalOrders,
        totalUsers,
        totalCoupons,
        totalComboPacks,
        pendingOrders,
        recentOrders
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const classNames = (...classes) => {
    return classes.filter(Boolean).join(' ');
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        if (loading) {
          return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 to-green-100">
              <div className="text-center p-8 rounded-3xl shadow-soft bg-white/70 backdrop-blur-sm">
                <LoadingIcon className="w-12 h-12 text-emerald-500 mx-auto mb-4" />
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
                    <h1 className="text-3xl md:text-4xl font-bold mb-3 text-gray-800 bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
                      Warehouse Manager Dashboard
                    </h1>
                    <p className="text-gray-600 text-base md:text-lg">
                      Welcome back! Here's what's happening with your warehouse operations.
                    </p>
                  </div>
                  
                  {/* Access Level Badge */}
                  <div className="flex items-center gap-2">
                    <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${
                      isReadOnly 
                        ? 'bg-yellow-100 text-yellow-800 border border-yellow-200' 
                        : 'bg-green-100 text-green-800 border border-green-200'
                    }`}>
                      {isReadOnly ? <FiLock className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
                      {getAccessLevelDisplay()}
                    </div>
                  </div>
                </div>
                
                {/* Read-Only Warning Banner */}
                {isReadOnly && (
                  <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-center">
                      <FiLock className="w-5 h-5 text-yellow-600 mr-3" />
                      <div>
                        <h3 className="text-sm font-medium text-yellow-800">Read-Only Access</h3>
                        <p className="text-sm text-yellow-700 mt-1">
                          You can view all data and reports, but cannot make changes or perform actions that modify data.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 lg:gap-6 mb-8">
                <div className="neumorphic-card p-3 lg:p-6 rounded-2xl bg-white/60 backdrop-blur-sm border border-white/20 hover:shadow-soft-lg transition-all duration-300">
                  <div className="flex items-center">
                    <div className="neumorphic-icon p-2 lg:p-4 rounded-xl bg-gradient-to-br from-emerald-400 to-green-500 shadow-soft">
                      <PackageIcon className="w-4 h-4 lg:w-6 lg:h-6 text-white" />
                    </div>
                    <div className="ml-2 lg:ml-4 min-w-0">
                      <p className="text-xs lg:text-sm text-gray-600 font-medium">Total Products</p>
                      <p className="text-lg lg:text-3xl font-bold text-gray-800 truncate">{stats.totalProducts}</p>
                    </div>
                  </div>
                </div>

                <div className="neumorphic-card p-3 lg:p-6 rounded-2xl bg-white/60 backdrop-blur-sm border border-white/20 hover:shadow-soft-lg transition-all duration-300">
                  <div className="flex items-center">
                    <div className="neumorphic-icon p-2 lg:p-4 rounded-xl bg-gradient-to-br from-purple-400 to-pink-500 shadow-soft">
                      <PackageIcon className="w-4 h-4 lg:w-6 lg:h-6 text-white" />
                    </div>
                    <div className="ml-2 lg:ml-4 min-w-0">
                      <p className="text-xs lg:text-sm text-gray-600 font-medium">Combo Packs</p>
                      <p className="text-lg lg:text-3xl font-bold text-gray-800 truncate">{stats.totalComboPacks}</p>
                    </div>
                  </div>
                </div>

                <div className="neumorphic-card p-3 lg:p-6 rounded-2xl bg-white/60 backdrop-blur-sm border border-white/20 hover:shadow-soft-lg transition-all duration-300">
                  <div className="flex items-center">
                    <div className="neumorphic-icon p-2 lg:p-4 rounded-xl bg-gradient-to-br from-blue-400 to-cyan-500 shadow-soft">
                      <OrdersIcon className="w-4 h-4 lg:w-6 lg:h-6 text-white" />
                    </div>
                    <div className="ml-2 lg:ml-4 min-w-0">
                      <p className="text-xs lg:text-sm text-gray-600 font-medium">Total Orders</p>
                      <p className="text-lg lg:text-3xl font-bold text-gray-800 truncate">{stats.totalOrders}</p>
                    </div>
                  </div>
                </div>

                <div className="neumorphic-card p-3 lg:p-6 rounded-2xl bg-white/60 backdrop-blur-sm border border-white/20 hover:shadow-soft-lg transition-all duration-300">
                  <div className="flex items-center">
                    <div className="neumorphic-icon p-2 lg:p-4 rounded-xl bg-gradient-to-br from-purple-400 to-violet-500 shadow-soft">
                      <PeopleIcon className="w-4 h-4 lg:w-6 lg:h-6 text-white" />
                    </div>
                    <div className="ml-2 lg:ml-4 min-w-0">
                      <p className="text-xs lg:text-sm text-gray-600 font-medium">Total Users</p>
                      <p className="text-lg lg:text-3xl font-bold text-gray-800 truncate">{stats.totalUsers}</p>
                    </div>
                  </div>
                </div>

                <div className="neumorphic-card p-3 lg:p-6 rounded-2xl bg-white/60 backdrop-blur-sm border border-white/20 hover:shadow-soft-lg transition-all duration-300">
                  <div className="flex items-center">
                    <div className="neumorphic-icon p-2 lg:p-4 rounded-xl bg-gradient-to-br from-orange-400 to-red-500 shadow-soft">
                      <TicketIcon className="w-4 h-4 lg:w-6 lg:h-6 text-white" />
                    </div>
                    <div className="ml-2 lg:ml-4 min-w-0">
                      <p className="text-xs lg:text-sm text-gray-600 font-medium">Active Coupons</p>
                      <p className="text-lg lg:text-3xl font-bold text-gray-800 truncate">{stats.totalCoupons}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Orders */}
              <div className="neumorphic-card p-4 lg:p-6 rounded-2xl bg-white/60 backdrop-blur-sm border border-white/20 mb-8">
                <h2 className="text-xl lg:text-2xl font-bold mb-4 lg:mb-6 text-gray-800 flex items-center">
                  <span className="w-2 h-6 lg:h-8 bg-gradient-to-b from-emerald-400 to-green-500 rounded-full mr-2 lg:mr-3"></span>
                  Recent Orders
                </h2>
                {stats.recentOrders.length > 0 ? (
                  <>
                    {/* Desktop Table View */}
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
                                  {order.status === 'Pending' && <PendingIcon className="w-3 h-3 mr-1" />}
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

                    {/* Mobile Card View */}
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
                            {order.status === 'Pending' && <PendingIcon className="w-3 h-3 mr-1" />}
                            {order.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="text-center py-12">
                    <EmptyIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 text-lg">No recent orders</p>
                  </div>
                )}
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
                <div 
                  className={`neumorphic-card p-4 lg:p-6 rounded-2xl bg-white/60 backdrop-blur-sm border border-white/20 text-center transition-all duration-300 ${
                    isReadOnly ? 'opacity-75' : 'hover:shadow-soft-lg cursor-pointer'
                  }`} 
                  onClick={() => {
                    if (!canPerformAction('navigate to orders')) {
                      showAccessDeniedMessage('view orders in detail');
                      return;
                    }
                    setActiveTab('orders');
                  }}
                >
                  <div className="w-14 h-14 lg:w-16 lg:h-16 mx-auto mb-3 lg:mb-4 rounded-2xl bg-gradient-to-br from-yellow-400 to-orange-500 shadow-soft flex items-center justify-center">
                    <PendingIcon className="w-7 h-7 lg:w-8 lg:h-8 text-white" />
                  </div>
                  <h3 className="text-lg lg:text-xl font-bold mb-2 text-gray-800">Pending Orders</h3>
                  <p className="text-3xl lg:text-4xl font-bold mb-3 lg:mb-4 text-emerald-600">{stats.pendingOrders}</p>
                  <button 
                    className={`neumorphic-button px-4 lg:px-6 py-2 lg:py-3 rounded-xl text-white font-semibold transition-all duration-300 text-sm lg:text-base ${
                      isReadOnly 
                        ? 'bg-gray-400 cursor-not-allowed' 
                        : 'bg-gradient-to-r from-emerald-500 to-green-600 hover:shadow-soft-lg'
                    }`}
                    disabled={isReadOnly}
                  >
                    {isReadOnly ? 'View Orders (Read-Only)' : 'View All Orders'}
                  </button>
                </div>

                <div 
                  className={`neumorphic-card p-4 lg:p-6 rounded-2xl bg-white/60 backdrop-blur-sm border border-white/20 text-center transition-all duration-300 ${
                    isReadOnly ? 'opacity-75' : 'hover:shadow-soft-lg cursor-pointer'
                  }`} 
                  onClick={() => {
                    if (!canPerformAction('navigate to products')) {
                      showAccessDeniedMessage('manage products');
                      return;
                    }
                    setActiveTab('products');
                  }}
                >
                  <div className="w-14 h-14 lg:w-16 lg:h-16 mx-auto mb-3 lg:mb-4 rounded-2xl bg-gradient-to-br from-emerald-400 to-green-500 shadow-soft flex items-center justify-center">
                    <PackageIcon className="w-7 h-7 lg:w-8 lg:h-8 text-white" />
                  </div>
                  <h3 className="text-lg lg:text-xl font-bold mb-2 text-gray-800">
                    {isReadOnly ? 'View Products' : 'Manage Products'}
                  </h3>
                  <p className="text-gray-600 mb-3 lg:mb-4 text-sm lg:text-base">
                    {isReadOnly ? 'View product catalog' : 'Add, edit, or remove products'}
                  </p>
                  <button 
                    className={`neumorphic-button px-4 lg:px-6 py-2 lg:py-3 rounded-xl text-white font-semibold transition-all duration-300 text-sm lg:text-base ${
                      isReadOnly 
                        ? 'bg-gray-400 cursor-not-allowed' 
                        : 'bg-gradient-to-r from-emerald-500 to-green-600 hover:shadow-soft-lg'
                    }`}
                    disabled={isReadOnly}
                  >
                    {isReadOnly ? 'View Products' : 'Manage Products'}
                  </button>
                </div>

                <div 
                  className={`neumorphic-card p-4 lg:p-6 rounded-2xl bg-white/60 backdrop-blur-sm border border-white/20 text-center transition-all duration-300 ${
                    isReadOnly ? 'opacity-75' : 'hover:shadow-soft-lg cursor-pointer'
                  }`} 
                  onClick={() => {
                    if (!canPerformAction('navigate to combo packs')) {
                      showAccessDeniedMessage('manage combo packs');
                      return;
                    }
                    setActiveTab('combo-packs');
                  }}
                >
                  <div className="w-14 h-14 lg:w-16 lg:h-16 mx-auto mb-3 lg:mb-4 rounded-2xl bg-gradient-to-br from-purple-400 to-violet-500 shadow-soft flex items-center justify-center">
                    <TicketIcon className="w-7 h-7 lg:w-8 lg:h-8 text-white" />
                  </div>
                  <h3 className="text-lg lg:text-xl font-bold mb-2 text-gray-800">
                    {isReadOnly ? 'View Combo Packs' : 'Combo Packs'}
                  </h3>
                  <p className="text-gray-600 mb-3 lg:mb-4 text-sm lg:text-base">
                    {isReadOnly ? 'View product bundles' : 'Manage product bundles'}
                  </p>
                  <button 
                    className={`neumorphic-button px-4 lg:px-6 py-2 lg:py-3 rounded-xl text-white font-semibold transition-all duration-300 text-sm lg:text-base ${
                      isReadOnly 
                        ? 'bg-gray-400 cursor-not-allowed' 
                        : 'bg-gradient-to-r from-emerald-500 to-green-600 hover:shadow-soft-lg'
                    }`}
                    disabled={isReadOnly}
                  >
                    {isReadOnly ? 'View Combo Packs' : 'Manage Combo Packs'}
                  </button>
                </div>
              </div>
            </div>

            <style jsx>{`
              .neumorphic-card {
                box-shadow: 
                  20px 20px 60px rgba(0, 0, 0, 0.05),
                  -20px -20px 60px rgba(255, 255, 255, 0.8);
              }
              .shadow-soft {
                box-shadow: 
                  8px 8px 16px rgba(0, 0, 0, 0.1),
                  -8px -8px 16px rgba(255, 255, 255, 0.8);
              }
              .shadow-soft-lg {
                box-shadow: 
                  12px 12px 24px rgba(0, 0, 0, 0.1),
                  -12px -12px 24px rgba(255, 255, 255, 0.8);
              }
              .neumorphic-button {
                box-shadow: 
                  6px 6px 12px rgba(0, 0, 0, 0.2),
                  -6px -6px 12px rgba(255, 255, 255, 0.1);
              }
              .neumorphic-icon {
                box-shadow: 
                  4px 4px 8px rgba(0, 0, 0, 0.2),
                  -4px -4px 8px rgba(255, 255, 255, 0.1);
              }
            `}</style>
          </>
        );
      case 'products':
        return <SubAdminProducts />;
      case 'orders':
        return <SubAdminOrders />;
      case 'combo-packs':
        return <SubAdminComboPacks />;
      case 'banners':
        return <SubAdminBanners />;
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
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Warehouse Settings</h2>
            <p className="text-gray-600">Settings features coming soon...</p>
          </div>
        );
      default:
        return (
          <div className="bg-white rounded-2xl p-8 shadow-lg">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Warehouse Overview</h2>
            <p className="text-gray-600">Welcome to the warehouse management dashboard.</p>
          </div>
        );
    }
  };

  return (
    <>
      <WarehouseManagerSidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-emerald-50" style={{ marginLeft: 'var(--sidebar-width, 0px)' }}>
        <div className="container mx-auto px-4 py-8">
          <div className="flex gap-8">
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
    </>
  );
};

export default WarehouseManagerDashboard;
