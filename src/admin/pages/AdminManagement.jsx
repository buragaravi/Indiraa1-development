import React, { useState, useEffect } from 'react';
import { useAdminPermission } from '../context/AdminPermissionContext';
import CreateAdminModal from '../components/CreateAdminModal';
import EditAdminModal from '../components/EditAdminModal';
import PermissionButton from '../components/PermissionButton';

// SVG Icons
const PlusIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
  </svg>
);

const EditIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
  </svg>
);

const DeleteIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);

const LogsIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);

const AdminIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

const SuperAdminIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
  </svg>
);

const AdminManagement = () => {
  const { 
    isSuperAdmin, 
    hasModuleAccess, 
    canCreateAdmin, 
    canEditAdmin, 
    canDeleteAdmin, 
    canViewActivityLogs,
    getEnabledModulesCount 
  } = useAdminPermission();

  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [activityLogs, setActivityLogs] = useState([]);
  const [showLogs, setShowLogs] = useState(false);
  const [expandedAdminId, setExpandedAdminId] = useState(null);

  // All hooks must be called before any conditional returns
  useEffect(() => {
    if (hasModuleAccess('admin_management')) {
      fetchAdmins();
    }
  }, [hasModuleAccess]);

  // Check if current admin has access to this module (after all hooks)
  if (!hasModuleAccess('admin_management')) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 text-gray-400">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m0 0v2m0-2h2m-2 0H10m9-7a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">You don't have permission to access Admin Management.</p>
        </div>
      </div>
    );
  }

  const fetchAdmins = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');
      const response = await fetch('https://indiraa1-backend.onrender.com/api/admin/list', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      if (data.success) {
        setAdmins(data.admins);
      } else {
        setError(data.message || 'Failed to fetch admins');
      }
    } catch (error) {
      console.error('Error fetching admins:', error);
      setError('Failed to fetch admins');
    } finally {
      setLoading(false);
    }
  };

  const fetchActivityLogs = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch('https://indiraa1-backend.onrender.com/api/admin/activity-logs', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      if (data.success) {
        setActivityLogs(data.logs);
        setShowLogs(true);
      } else {
        setError(data.message || 'Failed to fetch activity logs');
      }
    } catch (error) {
      console.error('Error fetching activity logs:', error);
      setError('Failed to fetch activity logs');
    }
  };

  const handleEditAdmin = (admin) => {
    setSelectedAdmin(admin);
    setShowEditModal(true);
  };

  const handleDeleteAdmin = async (adminId) => {
    if (!window.confirm('Are you sure you want to delete this admin?')) {
      return;
    }

    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`https://indiraa1-backend.onrender.com/api/admin/${adminId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      if (data.success) {
        fetchAdmins(); // Refresh the list
      } else {
        setError(data.message || 'Failed to delete admin');
      }
    } catch (error) {
      console.error('Error deleting admin:', error);
      setError('Failed to delete admin');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const getStatusBadge = (isActive) => {
    return isActive ? (
      <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">Active</span>
    ) : (
      <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800">Inactive</span>
    );
  };

  const getRoleBadge = (admin) => {
    if (admin.isSuperAdmin) {
      return (
        <span className="inline-flex items-center px-2 py-1 text-xs rounded-full bg-purple-100 text-purple-800">
          <SuperAdminIcon />
          <span className="ml-1">Super Admin</span>
        </span>
      );
    }

    // Count enabled modules for this specific admin
    let moduleCount = 0;
    if (admin.permissions && admin.permissions.modules) {
      moduleCount = Object.keys(admin.permissions.modules).filter(
        module => admin.permissions.modules[module]?.enabled === true
      ).length;
    }

    return (
      <span className="inline-flex items-center px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
        <AdminIcon />
        <span className="ml-1">Admin ({moduleCount} module{moduleCount !== 1 ? 's' : ''})</span>
      </span>
    );
  };

  const getPermissionsDisplay = (admin) => {
    if (admin.isSuperAdmin) {
      return (
        <div className="flex items-center gap-2">
          <span className="admin-management-status-badge">
            <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            Full Access
          </span>
        </div>
      );
    }

    // Check if permissions exist and have modules
    if (!admin.permissions || !admin.permissions.modules || Object.keys(admin.permissions.modules).length === 0) {
      return (
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center px-3 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-600 border border-gray-200">
            <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M13.477 14.89A6 6 0 015.11 6.524l8.367 8.368zm1.414-1.414L6.524 5.11a6 6 0 018.367 8.367zM18 10a8 8 0 11-16 0 8 8 0 0116 0z" clipRule="evenodd" />
            </svg>
            No Access
          </span>
        </div>
      );
    }

    // Get enabled modules from the correct path: permissions.modules.{moduleName}.enabled
    const enabledModules = Object.keys(admin.permissions.modules).filter(
      module => admin.permissions.modules[module]?.enabled === true
    );

    // Calculate total enabled actions across all enabled modules
    const totalEnabledActions = enabledModules.reduce((total, module) => {
      const modulePerms = admin.permissions.modules[module];
      if (modulePerms && modulePerms.actions) {
        const enabledActionsCount = Object.keys(modulePerms.actions).filter(
          action => modulePerms.actions[action] === true
        ).length;
        console.log(`Module ${module}: ${enabledActionsCount} enabled actions out of ${Object.keys(modulePerms.actions).length} total actions`);
        return total + enabledActionsCount;
      }
      return total;
    }, 0);

    console.log(`Total enabled actions for ${admin.name}: ${totalEnabledActions}`);

    // If no modules are enabled
    if (enabledModules.length === 0) {
      return (
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center px-3 py-1 text-xs font-medium rounded-full bg-amber-100 text-amber-800 border border-amber-200">
            <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            Limited Access
          </span>
        </div>
      );
    }

    const isExpanded = expandedAdminId === admin._id;

    return (
      <div className="flex items-center gap-2">
        <div className="flex flex-wrap gap-1">
          <span className="inline-flex items-center px-3 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-700 border border-blue-200">
            {enabledModules.length} module{enabledModules.length !== 1 ? 's' : ''}
          </span>
          <span className="inline-flex items-center px-3 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-700 border border-purple-200">
            {totalEnabledActions} action{totalEnabledActions !== 1 ? 's' : ''}
          </span>
        </div>
        <button
          onClick={() => setExpandedAdminId(isExpanded ? null : admin._id)}
          className="inline-flex items-center px-2 py-1 text-xs font-medium text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 rounded-md transition-all duration-200"
        >
          <svg 
            className={`w-4 h-4 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
          <span className="ml-1">{isExpanded ? 'Less' : 'Details'}</span>
        </button>
      </div>
    );
  };

  const renderExpandedPermissions = (admin) => {
    if (!admin.permissions?.modules) return null;

    // Module name mapping for better display
    const moduleDisplayNames = {
      'products': 'Products',
      'orders': 'Orders', 
      'users': 'Users',
      'banners': 'Banners',
      'coupons': 'Coupons',
      'sub_admins': 'Sub Admins',
      'combopacks': 'Combo Packs',
      'inventory': 'Inventory',
      'analytics': 'Analytics',
      'returns': 'Returns',
      'settings': 'Settings',
      'admin_management': 'Admin Management'
    };

    // Action name mapping for better display
    const actionDisplayNames = {
      'view_products': 'View Products',
      'create_product': 'Create Products',
      'edit_product': 'Edit Products',
      'delete_product': 'Delete Products',
      'bulk_upload': 'Bulk Upload',
      'export_products': 'Export Products',
      'manage_categories': 'Manage Categories',
      'view_orders': 'View Orders',
      'update_status': 'Update Status',
      'cancel_order': 'Cancel Orders',
      'refund_order': 'Process Refunds',
      'export_orders': 'Export Orders',
      'view_order_details': 'View Order Details',
      'mark_paid': 'Mark as Paid',
      'view_users': 'View Users',
      'edit_user': 'Edit Users',
      'suspend_user': 'Suspend Users',
      'view_user_activity': 'View User Activity',
      'export_users': 'Export Users',
      'view_banners': 'View Banners',
      'create_banner': 'Create Banners',
      'edit_banner': 'Edit Banners',
      'delete_banner': 'Delete Banners',
      'activate': 'Activate/Deactivate',
      'reorder': 'Reorder Items',
      'create_admin': 'Create Admins',
      'edit_admin': 'Edit Admins',
      'delete_admin': 'Delete Admins'
    };

    const enabledModules = Object.keys(admin.permissions.modules)
      .filter(module => admin.permissions.modules[module]?.enabled === true)
      .map(module => {
        const moduleActions = admin.permissions.modules[module].actions || {};
        const enabledActions = Object.keys(moduleActions).filter(
          action => moduleActions[action] === true
        );
        
        console.log(`Filtering actions for module ${module}:`, {
          allActions: Object.keys(moduleActions),
          enabledActions: enabledActions,
          actionValues: moduleActions
        });
        
        return {
          name: module,
          displayName: moduleDisplayNames[module] || module.charAt(0).toUpperCase() + module.slice(1),
          enabledActions: enabledActions
        };
      });

    return (
      <div className="admin-management-card">
        <div className="flex items-center mb-4">
          <div className="flex-shrink-0 w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
            <svg className="w-4 h-4 text-indigo-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 8a6 6 0 01-7.743 5.743L10 14l-1 1-1 1H6v2H2v-4l4.257-4.257A6 6 0 1118 8zm-6-2a1 1 0 100 2 2 2 0 012 2 1 1 0 102 0 4 4 0 00-4-4z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h4 className="text-lg font-semibold text-gray-900">
              Permission Details for {admin.name}
            </h4>
            <p className="text-sm text-gray-600">
              {enabledModules.length} enabled module{enabledModules.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>

        {enabledModules.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M13.477 14.89A6 6 0 015.11 6.524l8.367 8.368zm1.414-1.414L6.524 5.11a6 6 0 018.367 8.367zM18 10a8 8 0 11-16 0 8 8 0 0116 0z" clipRule="evenodd" />
              </svg>
            </div>
            <p className="text-gray-500">No modules are enabled for this admin.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {enabledModules.map((module, index) => (
              <div 
                key={index} 
                className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200"
              >
                <div className="flex items-center mb-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-md flex items-center justify-center">
                    <svg className="w-3 h-3 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm0 4a1 1 0 011-1h12a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1V8z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <h5 className="ml-2 text-sm font-semibold text-gray-900">
                    {module.displayName}
                  </h5>
                </div>
                
                {module.enabledActions.length === 0 ? (
                  <p className="text-xs text-gray-500 italic">No specific actions enabled</p>
                ) : (
                  <div className="space-y-1">
                    {module.enabledActions.map((action, actionIndex) => (
                      <div 
                        key={actionIndex}
                        className="inline-flex items-center px-2 py-1 text-xs rounded-md bg-green-50 text-green-700 border border-green-200 mr-1 mb-1"
                      >
                        <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        {actionDisplayNames[action] || action.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="admin-management-bg">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex justify-between items-start">
              <div>
                <div className="flex items-center mb-2">
                  <div className="admin-management-header-icon">
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <h1 className="admin-management-title">
                    Admin Management
                  </h1>
                </div>
                <p className="text-gray-600 ml-11">Manage administrator accounts, permissions, and access controls</p>
                
                {/* Stats Row */}
                <div className="flex items-center space-x-6 mt-4 ml-11">
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                    <span className="text-sm text-gray-600">
                      {admins.length} Total Admin{admins.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                    <span className="text-sm text-gray-600">
                      {admins.filter(admin => admin.isActive).length} Active
                    </span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-purple-500 rounded-full mr-2"></div>
                    <span className="text-sm text-gray-600">
                      {admins.filter(admin => admin.isSuperAdmin).length} Super Admin{admins.filter(admin => admin.isSuperAdmin).length !== 1 ? 's' : ''}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3">
                {/* View Activity Logs Button */}
                <PermissionButton
                  module="admin_management"
                  action="view_activity_logs"
                  onClick={fetchActivityLogs}
                  variant="secondary"
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 shadow-sm"
                >
                  <LogsIcon />
                  <span className="ml-2">Activity Logs</span>
                </PermissionButton>

                {/* Create Admin Button */}
                <PermissionButton
                  module="admin_management"
                  action="create_admin"
                  onClick={() => setShowCreateModal(true)}
                  className="admin-management-add-btn"
                >
                  <PlusIcon />
                  <span className="ml-2">Create Admin</span>
                </PermissionButton>
              </div>
            </div>
          </div>
        </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 border border-red-300 rounded-md bg-red-50">
          <p className="text-red-700">{error}</p>
          <button 
            onClick={() => setError('')}
            className="mt-2 text-sm text-red-600 hover:text-red-500"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Admin Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <AdminIcon />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Admins</p>
              <p className="text-2xl font-bold text-gray-900">{admins.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <SuperAdminIcon />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Admins</p>
              <p className="text-2xl font-bold text-gray-900">
                {admins.filter(admin => admin.isActive).length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <SuperAdminIcon />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Super Admins</p>
              <p className="text-2xl font-bold text-gray-900">
                {admins.filter(admin => admin.isSuperAdmin).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Admins Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="admin-management-table-header">
          <h3 className="text-lg font-semibold text-gray-900">Administrator Accounts</h3>
          <p className="text-sm text-gray-600 mt-1">Click "Details" to view specific permissions for each admin</p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="admin-management-table-head">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Administrator
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Permissions
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Created Date
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {admins.map((admin) => (
                <React.Fragment key={admin._id}>
                  {/* Main Admin Row */}
                  <tr className="hover:bg-gray-50 transition-colors duration-150 border-b border-gray-200">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-12 w-12">
                          <div className="admin-management-avatar">
                            {admin.isSuperAdmin ? <SuperAdminIcon /> : <AdminIcon />}
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-semibold text-gray-900">{admin.name}</div>
                          <div className="text-sm text-gray-600">{admin.email}</div>
                          <div className="text-xs text-gray-500">@{admin.username}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {getRoleBadge(admin)}
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(admin.isActive)}
                    </td>
                    <td className="px-6 py-4">
                      {getPermissionsDisplay(admin)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {formatDate(admin.createdAt)}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        {/* Edit Admin Button */}
                        <PermissionButton
                          module="admin_management"
                          action="edit_admin"
                          onClick={() => handleEditAdmin(admin)}
                          variant="secondary"
                          size="sm"
                          className="inline-flex items-center px-3 py-1.5 border border-gray-300 rounded-lg text-sm text-gray-700 bg-white hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 shadow-sm"
                        >
                          <EditIcon />
                          <span className="ml-1.5">Edit</span>
                        </PermissionButton>

                        {/* Delete Admin Button */}
                        {!admin.isSuperAdmin && (
                          <PermissionButton
                            module="admin_management"
                            action="delete_admin"
                            onClick={() => handleDeleteAdmin(admin._id)}
                            variant="danger"
                            size="sm"
                            className="inline-flex items-center px-3 py-1.5 border border-red-300 rounded-lg text-sm text-red-700 bg-white hover:bg-red-50 hover:border-red-400 transition-all duration-200 shadow-sm"
                          >
                            <DeleteIcon />
                            <span className="ml-1.5">Delete</span>
                          </PermissionButton>
                        )}
                      </div>
                    </td>
                  </tr>
                  
                  {/* Expanded Permission Details Row */}
                  {expandedAdminId === admin._id && (
                    <tr className="bg-gray-50">
                      <td colSpan="6" className="px-6 py-6">
                        <div className="transform transition-all duration-300 ease-in-out animate-fade-in">
                          {renderExpandedPermissions(admin)}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      {showCreateModal && (
        <CreateAdminModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            fetchAdmins();
          }}
        />
      )}

      {showEditModal && selectedAdmin && (
        <EditAdminModal
          isOpen={showEditModal}
          admin={selectedAdmin}
          onClose={() => {
            setShowEditModal(false);
            setSelectedAdmin(null);
          }}
          onSuccess={() => {
            setShowEditModal(false);
            setSelectedAdmin(null);
            fetchAdmins();
          }}
        />
      )}

      {/* Activity Logs Modal */}
      {showLogs && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Activity Logs</h3>
              <button
                onClick={() => setShowLogs(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="max-h-96 overflow-y-auto">
              {activityLogs.length > 0 ? (
                <div className="space-y-3">
                  {activityLogs.map((log, index) => (
                    <div key={index} className="p-3 border rounded-lg">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {typeof log.action === 'object' && log.action !== null 
                              ? JSON.stringify(log.action) 
                              : String(log.action)}
                          </p>
                          <p className="text-sm text-gray-600">
                            {typeof log.adminName === 'object' && log.adminName !== null 
                              ? JSON.stringify(log.adminName) 
                              : String(log.adminName)}
                          </p>
                          {log.details && (
                            <p className="text-sm text-gray-500 mt-1">
                              {typeof log.details === 'object' && log.details !== null 
                                ? JSON.stringify(log.details) 
                                : String(log.details)}
                            </p>
                          )}
                        </div>
                        <span className="text-xs text-gray-400">
                          {formatDate(log.timestamp)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-500 py-8">No activity logs found</p>
              )}
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
};

export default AdminManagement;
