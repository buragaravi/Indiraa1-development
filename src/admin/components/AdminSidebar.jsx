import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../utils/useAuth';
import { PermissionGate, SuperAdminOnly } from './PermissionGate';
import { 
  DashboardIcon, 
  ProductsIcon, 
  OrdersIcon, 
  UsersIcon, 
  CouponsIcon,
  PackageIcon,
  BannersIcon,
  SubAdminIcon,
  BatchIcon,
  RevenueAnalyticsIcon,
  ReturnIcon,
  AnalyticsIcon
} from './AdminIcons';

const AdminSidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Track screen size
  React.useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    handleResize(); // Initial check
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);  // Update CSS custom property to reflect sidebar state
  React.useEffect(() => {
    const updateSidebarWidth = () => {
      if (isMobile) {
        // Mobile: sidebar is always overlay, doesn't affect layout
        document.documentElement.style.setProperty('--sidebar-width', '0px');
      } else {
        // Desktop/Tablet: sidebar affects layout based on collapsed state
        document.documentElement.style.setProperty(
          '--sidebar-width', 
          isCollapsed ? '0px' : '256px'
        );
      }
    };

    updateSidebarWidth();
  }, [isCollapsed, isMobile]); // Update when either state changes
  const menuItems = [
    {
      path: '/admin',
      name: 'Dashboard',
      icon: DashboardIcon,
      module: null // Dashboard is always accessible
    },
    {
      path: '/admin/products',
      name: 'Products',
      icon: ProductsIcon,
      module: 'products'
    },
    {
      path: '/admin/combo-packs',
      name: 'Combo Packs',
      icon: PackageIcon,
      module: 'combopacks'
    },
    {
      path: '/admin/banners',
      name: 'Banners',
      icon: BannersIcon,
      module: 'banners'
    },
    {
      path: '/admin/batches',
      name: 'Batch Management',
      icon: BatchIcon,
      module: 'inventory'
    },
    {
      path: '/admin/orders',
      name: 'Orders',
      icon: OrdersIcon,
      module: 'orders'
    },
    {
      path: '/admin/returns',
      name: 'Return Management',
      icon: ReturnIcon,
      module: 'returns'
    },
    {
      path: '/admin/users',
      name: 'Users',
      icon: UsersIcon,
      module: 'users'
    },
    {
      path: '/admin/sub-admins',
      name: 'Sub Admins',
      icon: SubAdminIcon,
      module: 'sub_admins'
    },
    {
      path: '/admin/coupons',
      name: 'Coupons',
      icon: CouponsIcon,
      module: 'coupons'
    },
    {
      path: '/admin/revenue-analytics',
      name: 'Revenue Analytics',
      icon: RevenueAnalyticsIcon,
      module: 'analytics'
    },
    // NEW: Admin Management (Super Admin Only)
    {
      path: '/admin/manage-admins',
      name: 'Admin Management',
      icon: SubAdminIcon,
      module: 'admin_management',
      superAdminOnly: true
    }
  ];

  const isActive = (path) => {
    if (path === '/admin') {
      return location.pathname === '/admin';
    }
    return location.pathname.startsWith(path);  };

  return (
    <>      {/* Collapsible Arrow Button - Always visible, positioned at left center */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="sidebar-arrow fixed top-1/2 transform -translate-y-1/2 z-50 bg-white/95 backdrop-blur-sm rounded-r-xl shadow-lg border border-gray-200 hover:bg-white hover:shadow-xl transition-all duration-300"
        style={{ 
          left: isMobile ? '1rem' : (isCollapsed ? '0px' : '256px'),
          marginLeft: !isMobile ? (isCollapsed ? '0' : '-2px') : '0'
        }}
        aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        <div className="p-3">
          <svg 
            className={`w-5 h-5 text-gray-700 transition-transform duration-300 ${
              isCollapsed ? 'rotate-0' : 'rotate-180'
            }`} 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>        </div>
      </button>

      {/* Mobile Overlay - Outside sidebar, lower z-index */}
      {!isCollapsed && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 md:hidden" 
          onClick={() => setIsCollapsed(true)}
        />
      )}      {/* Main Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full bg-white/95 backdrop-blur-sm border-r border-gray-200 shadow-xl transition-all duration-300 ease-in-out z-40 ${
          isCollapsed ? 'w-0 -translate-x-full' : 'w-64 translate-x-0'
        }`}
        aria-label="Admin sidebar"
        style={{ zIndex: 40 }}
      >
        <div className={`h-full overflow-hidden transition-opacity duration-300 ${
          isCollapsed ? 'opacity-0' : 'opacity-100'
        }`}>
          <div className="p-6 h-full overflow-y-auto">
            {/* Logo/Header */}
            <div className="flex items-center mb-8">
              <div className="w-12 h-12 rounded-2xl bg-blue-600 shadow-lg flex items-center justify-center mr-4">
                <DashboardIcon className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-800 leading-tight">Admin Panel</h1>
                <p className="text-xs text-gray-600">Management Console</p>
              </div>
            </div>

            {/* Navigation Menu */}
            <nav className="space-y-3">
              {menuItems.map((item) => {
                const IconComponent = item.icon;
                
                // Render menu item with appropriate permission gate
                const menuItem = (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => {
                      // Close sidebar on mobile after navigation
                      if (isMobile) {
                        setIsCollapsed(true);
                      }
                    }}
                    className={`flex items-center px-4 py-3 rounded-xl transition-all duration-300 group relative ${
                      isActive(item.path)
                        ? 'bg-blue-600 text-white shadow-lg transform scale-105'
                        : 'text-gray-700 hover:bg-gray-100 hover:shadow-md hover:scale-102'
                    }`}
                  >
                    <IconComponent
                      className={`w-5 h-5 mr-3 transition-all duration-300 ${
                        isActive(item.path)
                          ? 'text-white'
                          : 'text-gray-500 group-hover:text-blue-600 group-hover:scale-110'
                      }`}
                    />
                    <span className="font-medium text-sm flex-1">{item.name}</span>
                    {isActive(item.path) && (
                      <div className="active-indicator bg-white animate-pulse"></div>
                    )}
                  </Link>
                );

                // Super Admin Only items
                if (item.superAdminOnly) {
                  return (
                    <SuperAdminOnly key={item.path}>
                      {menuItem}
                    </SuperAdminOnly>
                  );
                }

                // Items that should always show (like sub-admins, dashboard)
                if (item.showAlways || !item.module) {
                  return menuItem;
                }

                // Module-based permission items
                return (
                  <PermissionGate 
                    key={item.path}
                    module={item.module}
                    fallback={null}
                  >
                    {menuItem}
                  </PermissionGate>
                );
              })}
            </nav>

            {/* Logout Button */}
            <div className="absolute bottom-6 left-6 right-6">
              <div className="border-t border-gray-200 pt-6">
                <button
                  onClick={() => {
                    try {
                      // Show logout toast
                      toast.success('Logging out...', { duration: 1000 });
                      
                      // Perform logout
                      logout();
                      
                      // Small delay to ensure logout completes
                      setTimeout(() => {
                        // Navigate to login page
                        navigate('/login', { replace: true });
                        toast.success('Successfully logged out!');
                      }, 100);
                      
                      // Close sidebar on mobile
                      if (isMobile) {
                        setIsCollapsed(true);
                      }
                    } catch (error) {
                      console.error('Logout error:', error);
                      toast.error('Error during logout. Please try again.');
                    }
                  }}
                  className="w-full flex items-center px-4 py-3 rounded-xl text-gray-700 hover:bg-red-50 hover:text-red-600 transition-all duration-300 group hover:scale-102"
                >
                  <svg className="w-5 h-5 mr-3 text-gray-500 group-hover:text-red-600 transition-all duration-300 group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  <span className="font-medium text-sm">Logout</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </aside>
      
      {/* CSS Styles - Moving away from styled-jsx to regular CSS */}
      <style dangerouslySetInnerHTML={{
        __html: `
          :root {
            --sidebar-width: 256px;
          }
          
          /* Z-index hierarchy: Arrow (50) > Sidebar (40) > Overlay (30) */
          .sidebar-arrow {
            z-index: 50;
          }
          
          .scale-102 {
            transform: scale(1.02);
          }
          .scale-105 {
            transform: scale(1.05);
          }
          .scale-110 {
            transform: scale(1.1);
          }
          @keyframes pulse {
            0%, 100% {
              opacity: 1;
            }
            50% {
              opacity: 0.5;
            }
          }
          .animate-pulse {
            animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
          }
          
          /* Ensure active indicator stays circular on all screen sizes */
          .active-indicator {
            width: 8px !important;
            height: 8px !important;
            min-width: 8px;
            min-height: 8px;
            max-width: 8px;
            max-height: 8px;
            border-radius: 50%;
            flex-shrink: 0;
            flex-grow: 0;
            margin-left: auto;
            margin-right: 12px;
          }
          
          /* Responsive behavior */
          @media (max-width: 768px) {
            .sidebar-arrow {
              left: 1rem !important;
            }
            
            .active-indicator {
              width: 6px !important;
              height: 6px !important;
              min-width: 6px !important;
              min-height: 6px !important;
              max-width: 6px !important;
              max-height: 6px !important;
              margin-right: 8px;
            }
          }
          
          @media (min-width: 769px) {
            .sidebar-arrow {
              transition: left 0.3s ease-in-out;
            }
          }
        `
      }} />
    </>
  );
};

export default AdminSidebar;