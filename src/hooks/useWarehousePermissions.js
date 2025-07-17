import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

export const useWarehousePermissions = () => {
  const [permissions, setPermissions] = useState({
    isReadOnly: false,
    isReadWrite: false,
    role: null,
    isAdmin: false,
    canPerformAction: true
  });

  useEffect(() => {
    const checkPermissions = () => {
      // Check if user is admin first
      const adminToken = localStorage.getItem('token');
      const adminData = JSON.parse(localStorage.getItem('adminData') || '{}');
      
      if (adminToken && adminData.isAdmin) {
        // Admin always has full access
        setPermissions({
          isReadOnly: false,
          isReadWrite: true,
          role: 'admin',
          isAdmin: true,
          canPerformAction: true
        });
        return;
      }

      // Check sub-admin permissions
      const subAdminDataStr = localStorage.getItem('subAdminData') || sessionStorage.getItem('subAdminData');
      const subAdminData = JSON.parse(subAdminDataStr || '{}');
      const role = subAdminData.role;
      // Handle both 'permissions' (from model) and 'access_level' (legacy) field names
      const accessLevel = subAdminData.permissions || subAdminData.access_level;

      console.log('[WAREHOUSE PERMISSIONS] Raw sub-admin data:', {
        role,
        permissions: subAdminData.permissions,
        access_level: subAdminData.access_level,
        finalAccessLevel: accessLevel
      });

      // Only apply access restrictions to warehouse_manager and logistics_manager
      if (['warehouse_manager', 'logistics_manager'].includes(role)) {
        // Handle both 'read' and 'read_only' for backward compatibility
        const isReadOnly = accessLevel === 'read' || accessLevel === 'read_only';
        const isReadWrite = accessLevel === 'read_write';

        console.log('[WAREHOUSE PERMISSIONS] Permission check:', {
          role,
          accessLevel,
          isReadOnly,
          isReadWrite
        });

        setPermissions({
          isReadOnly,
          isReadWrite,
          role,
          isAdmin: false,
          canPerformAction: isReadWrite
        });
      } else {
        // For other roles, default to read-write
        setPermissions({
          isReadOnly: false,
          isReadWrite: true,
          role,
          isAdmin: false,
          canPerformAction: true
        });
      }
    };

    checkPermissions();
  }, []);

  const canPerformAction = (action) => {
    // Admin can always perform actions
    if (permissions.isAdmin) return true;
    
    // For warehouse/logistics managers, check access level
    if (['warehouse_manager', 'logistics_manager'].includes(permissions.role)) {
      return permissions.isReadWrite;
    }
    
    // For other roles, allow actions
    return true;
  };

  const showAccessDeniedMessage = (action = 'perform this action') => {
    toast.error(`Access denied. You have read-only permissions and cannot ${action}.`);
  };

  const getAccessLevelDisplay = () => {
    if (permissions.isAdmin) return 'Full Access';
    if (permissions.isReadOnly) return 'Read Only Access';
    if (permissions.isReadWrite) return 'Read & Write Access';
    return 'Access Level Unknown';
  };

  return {
    ...permissions,
    canPerformAction,
    showAccessDeniedMessage,
    getAccessLevelDisplay
  };
};
