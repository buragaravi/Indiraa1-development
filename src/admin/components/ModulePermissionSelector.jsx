// ModulePermissionSelector - Component for selecting module and feature permissions
import React, { useState } from 'react';

const ModulePermissionSelector = ({ permissions, onChange }) => {
  const [expandedModules, setExpandedModules] = useState(new Set());

  // Module definitions with their actions
  const moduleDefinitions = {
    products: {
      name: 'Product Management',
      icon: <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 2L3 7v11a1 1 0 001 1h12a1 1 0 001-1V7l-7-5zM10 18v-6h4v6h-4z" clipRule="evenodd" /></svg>,
      description: 'Manage products, categories, and inventory',
      actions: {
        view: 'View Products List',
        create: 'Create New Products',
        edit: 'Edit Product Details',
        delete: 'Delete Products',
        bulk_upload: 'Bulk Upload Products',
        activate: 'Activate Products',
        deactivate: 'Deactivate Products',
        export: 'Export Products Data'
      }
    },
    orders: {
      name: 'Order Management',
      icon: <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" /></svg>,
      description: 'Handle orders, status updates, and tracking',
      actions: {
        view: 'View Orders List',
        edit: 'Edit Order Details',
        delete: 'Delete Orders',
        export: 'Export Order Data',
        mark_paid: 'Mark Orders as Paid',
        update_status: 'Update Order Status',
        cancel: 'Cancel Orders',
      }
    },
    users: {
      name: 'User Management',
      icon: <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" /></svg>,
      description: 'Manage user accounts and activity',
      actions: {
        view: 'View Users List',
        create: 'Create New Users',
        edit: 'Edit User Details',
        delete: 'Delete Users',
        activate: 'Activate Users',
        deactivate: 'Deactivate Users',
        export: 'Export User Data'
      }
    },
    banners: {
      name: 'Banner Management',
      icon: <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" /></svg>,
      description: 'Manage promotional banners and hero images',
      actions: {
        view: 'View Banners List',
        create: 'Create New Banners',
        edit: 'Edit Banner Details',
        delete: 'Delete Banners',
        activate: 'Activate Banners',
        deactivate: 'Deactivate Banners',
        reorder: 'Reorder Banner Priority',
        schedule: 'Schedule Banner Display'
      }
    },
    coupons: {
      name: 'Coupon Management',
      icon: <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M17.707 9.293a1 1 0 010 1.414l-7 7a1 1 0 01-1.414 0l-7-7A.997.997 0 012 10V5a3 3 0 013-3h5c.256 0 .512.098.707.293l7 7zM5 6a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" /></svg>,
      description: 'Manage discount coupons and promotional codes',
      actions: {
        view: 'View Coupons List',
        create: 'Create New Coupons',
        edit: 'Edit Coupon Details',
        delete: 'Delete Coupons',
        activate: 'Activate Coupons',
        deactivate: 'Deactivate Coupons',
        export: 'Export Coupon Data'
      }
    },
    sub_admins: {
      name: 'Sub-Admin Management',
      icon: <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" /></svg>,
      description: 'Manage sub-administrators and warehouse staff',
      actions: {
        view: 'View Sub-Admins List',
        create: 'Create New Sub-Admins',
        edit: 'Edit Sub-Admin Details',
        delete: 'Delete Sub-Admins',
        activate: 'Activate Sub-Admins',
        deactivate: 'Deactivate Sub-Admins'
      }
    },
    combopacks: {
      name: 'Combo Packs',
      icon: <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" /></svg>,
      description: 'Manage combo offers and pack deals',
      actions: {
        view_combos: 'View Combo Packs List',
        create_combo: 'Create New Combo Pack',
        edit_combo: 'Edit Combo Pack Details',
        delete_combo: 'Delete Combo Packs',
        toggle_visibility: 'Toggle Combo Pack Visibility',
        manage_offers: 'Manage Special Offers'
      }
    },
    inventory: {
      name: 'Inventory Management',
      icon: <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" /></svg>,
      description: 'View stock levels and batch tracking',
      actions: {
        view: 'View Stock Levels and Batches'
      }
    },
    analytics: {
      name: 'Analytics & Reports',
      icon: <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" /></svg>,
      description: 'Sales analytics and reporting',
      actions: {
        view: 'View Analytics Dashboard'
      }
    },
    returns: {
      name: 'Returns & Refunds',
      icon: <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" /></svg>,
      description: 'Handle returns and refund processing',
      actions: {
        view: 'View Returns List',
        return_review: 'Return Review',
        pickup_charges: 'Pickup Charges',
        pickup_schedule: 'Pickup Schedule',
        received_actions: 'Received Actions',
        quality_check: 'Quality Check',
        final_decision: 'Final Decision',
        refund_approving: 'Refund Approving'
      }
    }
  };

  // Permission levels for actions
  const permissionLevels = {
    disabled: { 
      label: 'Disabled', 
      color: 'text-red-600 bg-red-50', 
      icon: <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M13.477 14.89A6 6 0 015.11 6.524l8.367 8.368zm1.414-1.414L6.524 5.11a6 6 0 018.367 8.367zM18 10a8 8 0 11-16 0 8 8 0 0116 0z" clipRule="evenodd" /></svg>
    },
    enabled: { 
      label: 'Enabled', 
      color: 'text-green-600 bg-green-50', 
      icon: <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
    }
  };

  // Toggle module expansion
  const toggleModule = (moduleKey) => {
    const newExpanded = new Set(expandedModules);
    if (newExpanded.has(moduleKey)) {
      newExpanded.delete(moduleKey);
    } else {
      newExpanded.add(moduleKey);
    }
    setExpandedModules(newExpanded);
  };

  // Handle module enable/disable
  const handleModuleToggle = (moduleKey) => {
    const newPermissions = { ...permissions };
    if (!newPermissions.modules) newPermissions.modules = {};
    
    if (newPermissions.modules[moduleKey]?.enabled) {
      // Disable module
      newPermissions.modules[moduleKey] = {
        enabled: false,
        actions: newPermissions.modules[moduleKey].actions || {} // Preserve actions
      };
    } else {
      // Enable module - preserve existing actions if they exist, otherwise use defaults
      const existingActions = newPermissions.modules[moduleKey]?.actions || {};
      const hasExistingActions = Object.keys(existingActions).length > 0;
      
      let actions = {};
      
      if (hasExistingActions) {
        // Preserve existing action selections
        actions = { ...existingActions };
      } else {
        // Set default actions for new modules
        const defaultActions = ['view_products', 'view_orders', 'view_users', 'view_banners', 'view_coupons', 'view_sub_admins', 'view_combos', 'view_stock', 'view_dashboard', 'view_returns', 'view_settings', 'view_admins'];
        Object.keys(moduleDefinitions[moduleKey].actions).forEach(action => {
          // Only enable view actions by default for new modules
          actions[action] = defaultActions.includes(action);
        });
      }
      
      newPermissions.modules[moduleKey] = {
        enabled: true,
        actions
      };
    }
    
    onChange(newPermissions);
  };

  // Handle action permission change
  const handleActionPermission = (moduleKey, actionKey, enabled) => {
    const newPermissions = { ...permissions };
    if (!newPermissions.modules) newPermissions.modules = {};
    if (!newPermissions.modules[moduleKey]) {
      newPermissions.modules[moduleKey] = { enabled: true, actions: {} };
    }
    
    newPermissions.modules[moduleKey].actions[actionKey] = enabled;
    onChange(newPermissions);
  };

  // Set all actions to same permission level
  const setAllActions = (moduleKey, level) => {
    const newPermissions = { ...permissions };
    if (!newPermissions.modules) newPermissions.modules = {};
    if (!newPermissions.modules[moduleKey]) {
      newPermissions.modules[moduleKey] = { enabled: true, actions: {} };
    }
    
    const actions = {};
    Object.keys(moduleDefinitions[moduleKey].actions).forEach(action => {
      actions[action] = level === 'enabled';
    });
    
    newPermissions.modules[moduleKey].actions = actions;
    onChange(newPermissions);
  };

  return (
    <div className="space-y-4">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center gap-2 text-blue-700 mb-2">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          <span className="font-medium">Permission Levels</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
          {Object.entries(permissionLevels).map(([key, config]) => (
            <div key={key} className={`flex items-center gap-2 ${config.color} px-3 py-2 rounded-lg`}>
              {config.icon}
              <span className="font-medium">{config.label}</span>
            </div>
          ))}
        </div>
      </div>

      {Object.entries(moduleDefinitions).map(([moduleKey, module]) => {
        const modulePermissions = permissions?.modules?.[moduleKey];
        const isEnabled = modulePermissions?.enabled || false;
        const isExpanded = expandedModules.has(moduleKey);

        return (
          <div key={moduleKey} className="border border-gray-200 rounded-lg overflow-hidden">
            {/* Module Header */}
            <div className="p-4 bg-gray-50 border-b">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={isEnabled}
                    onChange={() => handleModuleToggle(moduleKey)}
                    className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <div className="flex items-center gap-3">
                    <div className="text-blue-600">{module.icon}</div>
                    <div>
                      <h3 className="font-semibold text-gray-800">{module.name}</h3>
                      <p className="text-sm text-gray-600">{module.description}</p>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  {isEnabled && (
                    <div className="flex gap-1">
                      <button
                        type="button"
                        onClick={() => setAllActions(moduleKey, 'enabled')}
                        className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors"
                      >
                        Enable All
                      </button>
                      <button
                        type="button"
                        onClick={() => setAllActions(moduleKey, 'disabled')}
                        className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
                      >
                        Disable All
                      </button>
                    </div>
                  )}
                  
                  {isEnabled && (
                    <button
                      type="button"
                      onClick={() => toggleModule(moduleKey)}
                      className="text-gray-500 hover:text-gray-700 transition-colors"
                    >
                      <svg 
                        className={`w-5 h-5 transform transition-transform ${isExpanded ? 'rotate-180' : ''}`} 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Action Permissions */}
            {isEnabled && isExpanded && (
              <div className="p-4 space-y-3">
                {Object.entries(module.actions).map(([actionKey, actionName]) => {
                  const currentPermission = modulePermissions?.actions?.[actionKey] || false;
                  
                  return (
                    <div key={actionKey} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                      <span className="text-gray-700 font-medium">{actionName}</span>
                      
                      <div className="flex gap-2">
                        {Object.entries(permissionLevels).map(([level, config]) => {
                          const isEnabled = level === 'enabled';
                          const isSelected = currentPermission === isEnabled;
                          
                          return (
                            <label key={level} className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="radio"
                                name={`${moduleKey}-${actionKey}`}
                                value={level}
                                checked={isSelected}
                                onChange={() => handleActionPermission(moduleKey, actionKey, isEnabled)}
                                className="sr-only"
                              />
                              <div className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                                isSelected 
                                  ? config.color + ' ring-2 ring-blue-500' 
                                  : 'text-gray-500 bg-gray-100 hover:bg-gray-200'
                              }`}>
                                <span className="mr-1">{config.icon}</span>
                                {config.label}
                              </div>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default ModulePermissionSelector;
