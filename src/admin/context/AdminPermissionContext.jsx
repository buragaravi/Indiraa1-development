// AdminPermissionContext - Centralized permission management for the entire admin app
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from '../utils/useAuth';

const AdminPermissionContext = createContext();

export const AdminPermissionProvider = ({ children }) => {
  const { 
    admin, 
    isAdmin, 
    isSuperAdmin, 
    adminPermissions, 
    permissionsLoading,
    loadAdminPermissions 
  } = useAuth();

  const [contextLoading, setContextLoading] = useState(false);

  // Load permissions when admin context changes
  useEffect(() => {
    if (isAdmin && admin && !adminPermissions && !permissionsLoading) {
      setContextLoading(true);
      loadAdminPermissions().finally(() => {
        setContextLoading(false);
      });
    }
  }, [isAdmin, admin, adminPermissions, permissionsLoading, loadAdminPermissions]);

  // Enhanced permission checking with context awareness
  const hasModuleAccess = (module) => {
    if (!isAdmin || !admin) return false;
    if (isSuperAdmin) return true;
    return adminPermissions?.modules?.[module]?.enabled === true;
  };

  const hasActionPermission = (module, action) => {
    if (!isAdmin || !admin) return false;
    if (isSuperAdmin) return true;
    
    const modulePerms = adminPermissions?.modules?.[module];
    if (!modulePerms?.enabled) return false;
    
    return modulePerms.actions?.[action] === true;
  };

  // Legacy support for feature permission (maps to action permission)
  const hasFeaturePermission = (module, feature, requiredLevel = 'read') => {
    return hasActionPermission(module, feature);
  };

  // Check if admin can perform administrative actions
  const canManageAdmins = () => {
    return isSuperAdmin || hasModuleAccess('admin_management');
  };

  // Get list of accessible modules for current admin (only enabled ones)
  const getAccessibleModules = () => {
    if (!adminPermissions) return [];
    
    if (isSuperAdmin) {
      // Super admin has access to all modules, but only count enabled ones
      return Object.entries(adminPermissions.modules || {})
        .filter(([, moduleData]) => moduleData.enabled)
        .map(([moduleName]) => moduleName);
    }

    // Regular admin - only enabled modules
    return Object.entries(adminPermissions.modules || {})
      .filter(([, moduleData]) => moduleData.enabled)
      .map(([moduleName]) => moduleName);
  };

  // Count enabled modules
  const getEnabledModulesCount = () => {
    if (!adminPermissions) return 0;
    
    return Object.values(adminPermissions.modules || {})
      .filter(moduleData => moduleData.enabled).length;
  };

  // Get accessible actions for a specific module
  const getModuleActions = (module) => {
    if (!adminPermissions || !hasModuleAccess(module)) return [];

    if (isSuperAdmin) {
      // Return all possible actions for super admin
      return getDefaultModuleActions(module);
    }

    const modulePerms = adminPermissions.modules?.[module];
    if (!modulePerms) return [];

    const actions = [];
    Object.entries(modulePerms.actions || {}).forEach(([actionKey, enabled]) => {
      if (enabled) {
        actions.push(actionKey);
      }
    });

    return actions;
  };

  // Check if admin can access specific admin management functions
  const canCreateAdmin = () => hasActionPermission('admin_management', 'create_admin');
  const canEditAdmin = () => hasActionPermission('admin_management', 'edit_admin');
  const canDeleteAdmin = () => hasActionPermission('admin_management', 'delete_admin');
  const canViewActivityLogs = () => hasActionPermission('admin_management', 'view_activity_logs');

  // Permission checking for common actions
  const canCreateProduct = () => hasActionPermission('products', 'create_product');
  const canEditProduct = () => hasActionPermission('products', 'edit_product');
  const canDeleteProduct = () => hasActionPermission('products', 'delete_product');
  const canBulkUpload = () => hasActionPermission('products', 'bulk_upload');

  const canUpdateOrderStatus = () => hasActionPermission('orders', 'update_status');
  const canCancelOrder = () => hasActionPermission('orders', 'cancel_order');
  const canRefundOrder = () => hasActionPermission('orders', 'refund_order');

  const canEditUser = () => hasActionPermission('users', 'edit_user');
  const canSuspendUser = () => hasActionPermission('users', 'suspend_user');

  const canCreateBanner = () => hasActionPermission('banners', 'create_banner');
  const canEditBanner = () => hasActionPermission('banners', 'edit_banner');
  const canDeleteBanner = () => hasActionPermission('banners', 'delete_banner');

  const canCreateCoupon = () => hasActionPermission('coupons', 'create_coupon');
  const canEditCoupon = () => hasActionPermission('coupons', 'edit_coupon');
  const canDeleteCoupon = () => hasActionPermission('coupons', 'delete_coupon');

  // Context value
  const contextValue = {
    // Basic permission info
    isAdmin,
    isSuperAdmin,
    admin,
    adminPermissions,
    loading: permissionsLoading || contextLoading,

    // Core permission functions
    hasModuleAccess,
    hasActionPermission,
    hasFeaturePermission, // Legacy support
    
    // Module and action utilities
    getAccessibleModules,
    getEnabledModulesCount,
    getModuleActions,
    canManageAdmins,

    // Admin management permissions
    canCreateAdmin,
    canEditAdmin,
    canDeleteAdmin,
    canViewActivityLogs,

    // Product permissions
    canCreateProduct,
    canEditProduct,
    canDeleteProduct,
    canBulkUpload,

    // Order permissions
    canUpdateOrderStatus,
    canCancelOrder,
    canRefundOrder,

    // User permissions
    canEditUser,
    canSuspendUser,

    // Banner permissions
    canCreateBanner,
    canEditBanner,
    canDeleteBanner,

    // Coupon permissions
    canCreateCoupon,
    canEditCoupon,
    canDeleteCoupon
  };

  return (
    <AdminPermissionContext.Provider value={contextValue}>
      {children}
    </AdminPermissionContext.Provider>
  );
};

// Helper function to get default actions for each module
const getDefaultModuleActions = (module) => {
  const moduleActions = {
    products: ['view_products', 'create_product', 'edit_product', 'delete_product', 'bulk_upload', 'export_products', 'manage_categories'],
    orders: ['view_orders', 'update_status', 'cancel_order', 'refund_order', 'export_orders', 'view_order_details'],
    users: ['view_users', 'edit_user', 'suspend_user', 'view_user_activity', 'export_users'],
    banners: ['view_banners', 'create_banner', 'edit_banner', 'delete_banner'],
    coupons: ['view_coupons', 'create_coupon', 'edit_coupon', 'delete_coupon'],
    sub_admins: ['view_sub_admins', 'create_sub_admin', 'edit_sub_admin', 'delete_sub_admin'],
    combopacks: ['view_combos', 'create_combo', 'edit_combo', 'delete_combo', 'manage_offers'],
    inventory: ['view_stock', 'update_stock', 'batch_management', 'stock_alerts', 'inventory_reports'],
    analytics: ['view_dashboard', 'sales_reports', 'user_analytics', 'export_reports', 'revenue_analysis'],
    returns: ['view_returns', 'process_return', 'approve_refund', 'return_analytics'],
    settings: ['view_settings', 'update_settings', 'system_config', 'backup_restore'],
    admin_management: ['view_admins', 'create_admin', 'edit_admin', 'delete_admin', 'manage_permissions', 'view_activity_logs']
  };
  
  return moduleActions[module] || [];
};

// Custom hook to use the permission context
export const useAdminPermission = () => {
  const context = useContext(AdminPermissionContext);
  if (!context) {
    throw new Error('useAdminPermission must be used within AdminPermissionProvider');
  }
  return context;
};
