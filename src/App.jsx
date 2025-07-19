import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster, toast } from 'react-hot-toast';
import { ThemeProvider } from './context/ThemeProvider';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
// PWA Components
import NetworkStatus from './components/common/NetworkStatus';
import PWAInstallPrompt from './components/pwa/PWAInstallPrompt';
import PWAStatus from './components/pwa/PWAStatus';
// Advanced PWA Services
import { initializeOfflineStorage } from './services/apiWithOffline';
import { syncManager } from './services/syncManager';
import { cacheManager } from './services/cacheManager';
import { notificationService } from './services/notificationService';
import { appFeaturesService } from './services/appFeaturesService';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ProductList from './pages/ProductList';
import ProductDetail from './pages/ProductDetail';
import ComboPackDetail from './pages/ComboPackDetail';
import Cart from './pages/Cart';
import Wishlist from './pages/Wishlist';
import Checkout from './pages/Checkout';
import Profile from './pages/Profile';
import Orders from './pages/Orders';
import OrderDetail from './pages/OrderDetail';
import WalletDashboard from './components/Wallet/WalletDashboard';
import ReferralVisitTracker from './components/Referral/ReferralVisitTracker';
import PWADashboard from './components/PWADashboard';
import * as walletNotifications from './utils/walletNotifications';
// Admin Components
import Admin from './admin/pages/Admin';
import AdminProducts from './admin/pages/AdminProducts';
import AdminOrders from './admin/pages/AdminOrders';
import AdminOrderDetail from './admin/pages/AdminOrderDetail';
import AdminUsers from './admin/pages/AdminUsers';
import AdminCoupons from './admin/pages/AdminCoupons';
import AdminComboPacks from './admin/pages/AdminComboPacks';
import AdminBanners from './admin/pages/AdminBanners';
import AdminRevenueAnalytics from './admin/pages/AdminRevenueAnalytics';
import AdminSidebar from './admin/components/AdminSidebar';
import AdminDashboard from './pages/AdminDashboard';
import BulkUploadHome from './pages/BulkUploadHome';
// Batch Management Components
import BatchDashboard from './components/BatchDashboard';
import BatchGroupDetails from './components/BatchGroupDetails';
// Warehouse Batch Components
import WarehouseBatchDashboard from './components/warehouse/WarehouseBatchDashboard';
import WarehouseBatchDetails from './components/warehouse/WarehouseBatchDetails';
// Sub Admin Components
import SubAdminLogin from './components/SubAdminLogin';
import SubAdminEmailVerification from './components/SubAdminEmailVerification';
import SubAdminManagement from './components/admin/SubAdminManagement';
import WarehouseManagerDashboard from './components/subadmin/WarehouseManagerDashboard';
import LogisticsManagerDashboard from './components/subadmin/LogisticsManagerDashboard';
import SubAdminRouteGuard from './components/auth/SubAdminRouteGuard';
import SubAdminOrderDetail from './pages/subadmin/SubAdminOrderDetail';
import SubAdminRevenueAnalyticsPage from './pages/subadmin/SubAdminRevenueAnalytics';
import SubAdminLayout from './components/subadmin/SubAdminLayout';
// 404 Page
import NotFound from './pages/NotFound';

import './App.css';

// Admin Layout Component
const AdminLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 admin-layout">
      <AdminSidebar />
      <div 
        className="transition-all duration-300 ease-in-out"
        style={{ 
          marginLeft: 'var(--sidebar-width, 0px)',
          width: 'calc(100% - var(--sidebar-width, 0px))'
        }}
      >
        <main className="min-h-screen p-4 md:p-6 lg:p-8">
          <div className="max-w-full mx-auto">
            {children}
          </div>
        </main>
      </div>
      
      <style>{`
        @media (max-width: 768px) {
          .admin-layout > div {
            margin-left: 0 !important;
            width: 100% !important;
          }
        }
      `}</style>
    </div>
  );
};

// Check if user is admin
const isAdmin = () => {
  const userType = localStorage.getItem('userType');
  return userType === 'admin';
};

function App() {
  // Initialize all PWA services
  useEffect(() => {
    const initializePWAServices = async () => {
      try {
        console.log('🚀 Initializing Advanced PWA Services...')
        
        // Initialize in order of dependency
        await initializeOfflineStorage()
        await syncManager.init()
        await cacheManager.init()
        await notificationService.init()
        await appFeaturesService.init()
        
        console.log('✅ All PWA services initialized successfully')
        
        // Set up global error handling for PWA services
        window.addEventListener('unhandledrejection', (event) => {
          console.error('❌ Unhandled PWA service error:', event.reason)
        })
        
      } catch (error) {
        console.error('❌ Failed to initialize PWA services:', error)
      }
    }
    
    initializePWAServices()
  }, [])

  // Make wallet notifications available globally
  useEffect(() => {
    window.walletNotifications = walletNotifications;
  }, []);

  // Add online/offline event handlers for automatic sync
  useEffect(() => {
    const handleOnline = async () => {
      console.log('🌐 Device came back online - triggering sync...')
      try {
        await syncManager.processQueue()
        toast.success('✅ Synced offline changes!', { 
          icon: '🔄',
          duration: 3000 
        })
      } catch (error) {
        console.error('❌ Failed to sync on coming online:', error)
        toast.error('Failed to sync some changes', { icon: '⚠️' })
      }
    }

    const handleOffline = () => {
      console.log('📱 Device went offline - entering offline mode...')
      toast('📱 You\'re now offline. Changes will sync when you\'re back online.', { 
        icon: '📡',
        duration: 4000 
      })
    }

    // Add event listeners
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    // Check initial state
    if (navigator.onLine) {
      // If already online, trigger a sync after a short delay
      setTimeout(handleOnline, 2000)
    }

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  return (
    <ThemeProvider>
      <Router>
        <div className="min-h-screen flex flex-col bg-[#f8faf8]">
          <Toaster position="top-right" />
          <ReferralVisitTracker />
          
          {/* PWA Components */}
          <NetworkStatus />
          <PWAInstallPrompt />
          <PWAStatus />
          
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            
            {/* Admin Routes */}
            <Route path="/admin" element={
              <AdminLayout>
                <Admin />
              </AdminLayout>
            } />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/products" element={
              <AdminLayout>
                <AdminProducts />
              </AdminLayout>
            } />
            <Route path="/admin/orders" element={
              <AdminLayout>
                <AdminOrders />
              </AdminLayout>
            } />
            <Route path="/admin/orders/:orderId" element={
              <AdminLayout>
                <AdminOrderDetail />
              </AdminLayout>
            } />
            <Route path="/admin/users" element={
              <AdminLayout>
                <AdminUsers />
              </AdminLayout>
            } />
            <Route path="/admin/coupons" element={
              <AdminLayout>
                <AdminCoupons />
              </AdminLayout>
            } />
            <Route path="/admin/combo-packs" element={
              <AdminLayout>
                <AdminComboPacks />
              </AdminLayout>
            } />
            <Route path="/admin/banners" element={
              <AdminLayout>
                <AdminBanners />
              </AdminLayout>
            } />
            <Route path="/admin/revenue-analytics" element={
              <AdminLayout>
                <AdminRevenueAnalytics />
              </AdminLayout>
            } />
            <Route path="/admin/sub-admins" element={
              <AdminLayout>
                <SubAdminManagement />
              </AdminLayout>
            } />
            <Route path="/admin/batches" element={
              <AdminLayout>
                <BatchDashboard />
              </AdminLayout>
            } />
            <Route path="/admin/batches/:id" element={
              <AdminLayout>
                <BatchGroupDetails />
              </AdminLayout>
            } />
            
            {/* Sub Admin Routes - Must be before user routes */}
            <Route path="/sub-admin/login" element={<SubAdminLogin />} />
            <Route path="/sub-admin/verify-email" element={<SubAdminEmailVerification />} />
            <Route path="/sub-admin/warehouse_manager" element={<WarehouseManagerDashboard />} />
            <Route path="/sub-admin/warehouse_manager/batches" element={
              <SubAdminLayout>
                <WarehouseBatchDashboard />
              </SubAdminLayout>
            } />
            <Route path="/sub-admin/warehouse_manager/batches/:id" element={
              <SubAdminLayout>
                <WarehouseBatchDetails />
              </SubAdminLayout>
            } />
            <Route path="/sub-admin/logistics_manager" element={<LogisticsManagerDashboard />} />
            <Route path="/sub-admin/revenue-analytics" element={<SubAdminRevenueAnalyticsPage />} />
            <Route path="/sub-admin/dashboard" element={<SubAdminLogin />} /> {/* Redirect to login if no specific role */}
            <Route path="/dashboard/orders/:orderId" element={<SubAdminOrderDetail />} />
            
            {/* User Routes - More specific paths */}
            <Route path="/" element={
              <>
                <Navbar />
                <main className="flex-grow">
                  <Home />
                </main>
                <Footer />
              </>
            } />
            <Route path="/products" element={
              <>
                <Navbar />
                <main className="flex-grow">
                  <ProductList />
                </main>
                <Footer />
              </>
            } />
            <Route path="/products/:id" element={
              <>
                <Navbar />
                <main className="flex-grow">
                  <ProductDetail />
                </main>
                <Footer />
              </>
            } />
            <Route path="/combo-packs/:id" element={
              <>
                <Navbar />
                <main className="flex-grow">
                  <ComboPackDetail />
                </main>
                <Footer />
              </>
            } />
            <Route path="/cart" element={
              <>
                <Navbar />
                <main className="flex-grow">
                  <Cart />
                </main>
                <Footer />
              </>
            } />
            <Route path="/wishlist" element={
              <>
                <Navbar />
                <main className="flex-grow">
                  <Wishlist />
                </main>
                <Footer />
              </>
            } />
            <Route path="/checkout" element={
              <>
                <Navbar />
                <main className="flex-grow">
                  <Checkout />
                </main>
                <Footer />
              </>
            } />
            <Route path="/profile" element={
              <>
                <Navbar />
                <main className="flex-grow">
                  <Profile />
                </main>
                <Footer />
              </>
            } />
            <Route path="/orders" element={
              <>
                <Navbar />
                <main className="flex-grow">
                  <Orders />
                </main>
                <Footer />
              </>
            } />
            <Route path="/orders/:orderId" element={
              <>
                <Navbar />
                <main className="flex-grow">
                  <OrderDetail />
                </main>
                <Footer />
              </>
            } />
            <Route path="/wallet" element={
              <>
                <Navbar />
                <main className="flex-grow">
                  <WalletDashboard />
                </main>
                <Footer />
              </>
            } />
            <Route path="/pwa-dashboard" element={
              <>
                <Navbar />
                <main className="flex-grow">
                  <PWADashboard />
                </main>
                <Footer />
              </>
            } />
            <Route path="/bulk-upload" element={
              <>
                <Navbar />
                <main className="flex-grow">
                  <BulkUploadHome />
                </main>
                <Footer />
              </>
            } />
            
            {/* 404 Not Found Route - Must be last */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;
