// CreateAdminModal - Modal for creating new admin accounts
import React, { useState } from 'react';
import ModulePermissionSelector from './ModulePermissionSelector';
import toast from 'react-hot-toast';

const CreateAdminModal = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    name: '',
    email: '',
    isSuperAdmin: false,
    permissions: getDefaultPermissions()
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (!formData.name.trim()) {
      newErrors.name = 'Full name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await fetch('https://indiraa1-backend.onrender.com/api/admin/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          username: formData.username.trim(),
          password: formData.password,
          name: formData.name.trim(),
          email: formData.email.trim(),
          isSuperAdmin: formData.isSuperAdmin,
          permissions: formData.isSuperAdmin ? getSuperAdminPermissions() : formData.permissions
        })
      });

      const data = await response.json();
      
      if (data.success) {
        toast.success('Admin created successfully!');
        onSuccess();
      } else {
        if (data.message.includes('Username already exists')) {
          setErrors({ username: 'Username already exists' });
        } else if (data.message.includes('Email already exists')) {
          setErrors({ email: 'Email already exists' });
        } else {
          toast.error(data.message || 'Failed to create admin');
        }
      }
    } catch (error) {
      console.error('Error creating admin:', error);
      toast.error('Error creating admin');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-800">Create New Admin</h2>
                <p className="text-gray-600 text-sm">Add a new administrator to the system</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Basic Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Username *
                </label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => handleInputChange('username', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.username ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter username"
                />
                {errors.username && (
                  <p className="text-red-500 text-sm mt-1">{errors.username}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.name ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter full name"
                />
                {errors.name && (
                  <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address *
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.email ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter email address"
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">{errors.email}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password *
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.password ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter password"
                />
                {errors.password && (
                  <p className="text-red-500 text-sm mt-1">{errors.password}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm Password *
                </label>
                <input
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Confirm password"
                />
                {errors.confirmPassword && (
                  <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>
                )}
              </div>
            </div>
          </div>

          {/* Admin Type */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Admin Type</h3>
            
            <div className="space-y-3">
              <label className="flex items-start gap-3 p-4 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                <input
                  type="radio"
                  name="adminType"
                  checked={formData.isSuperAdmin}
                  onChange={() => setFormData(prev => ({ ...prev, isSuperAdmin: true }))}
                  className="mt-1"
                />
                <div>
                  <div className="font-medium text-gray-800 flex items-center gap-2">
                    <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 10a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1v-1a1 1 0 011-1zM12 2a1 1 0 01.894.553l2.991 5.982a.869.869 0 010 .775l-2.991 5.982A1 1 0 0112 16H9a1 1 0 01-.894-.553L5.115 9.465a.869.869 0 010-.775l2.991-5.982A1 1 0 019 2h3z" clipRule="evenodd" />
                    </svg>
                    Super Administrator
                  </div>
                  <p className="text-sm text-gray-600">
                    Full access to all modules and admin management capabilities
                  </p>
                </div>
              </label>

              <label className="flex items-start gap-3 p-4 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                <input
                  type="radio"
                  name="adminType"
                  checked={!formData.isSuperAdmin}
                  onChange={() => setFormData(prev => ({ ...prev, isSuperAdmin: false }))}
                  className="mt-1"
                />
                <div>
                  <div className="font-medium text-gray-800 flex items-center gap-2">
                    <svg className="w-5 h-5 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                    </svg>
                    Limited Administrator
                  </div>
                  <p className="text-sm text-gray-600">
                    Custom permissions for specific modules and features
                  </p>
                </div>
              </label>
            </div>
          </div>

          {/* Permissions (only for limited admin) */}
          {!formData.isSuperAdmin && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Permissions</h3>
              <ModulePermissionSelector
                permissions={formData.permissions}
                onChange={(permissions) => setFormData(prev => ({ ...prev, permissions }))}
              />
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                  Creating...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Create Admin
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Helper function to get default permissions for new admin
const getDefaultPermissions = () => {
  return {
    modules: {
      products: {
        enabled: true,
        actions: {
          view_products: true,
          create_product: false,
          edit_product: false,
          delete_product: false,
          bulk_upload: false,
          export_products: true,
          manage_categories: false
        }
      },
      orders: {
        enabled: true,
        actions: {
          view_orders: true,
          update_status: false,
          cancel_order: false,
          refund_order: false,
          export_orders: true,
          view_order_details: true
        }
      },
      users: {
        enabled: false,
        actions: {
          view_users: false,
          edit_user: false,
          suspend_user: false,
          view_user_activity: false,
          export_users: false
        }
      },
      banners: {
        enabled: false,
        actions: {
          view_banners: false,
          create_banner: false,
          edit_banner: false,
          delete_banner: false
        }
      },
      coupons: {
        enabled: false,
        actions: {
          view_coupons: false,
          create_coupon: false,
          edit_coupon: false,
          delete_coupon: false
        }
      },
      sub_admins: {
        enabled: false,
        actions: {
          view_sub_admins: false,
          create_sub_admin: false,
          edit_sub_admin: false,
          delete_sub_admin: false
        }
      },
      combopacks: {
        enabled: false,
        actions: {
          view_combos: false,
          create_combo: false,
          edit_combo: false,
          delete_combo: false,
          manage_offers: false
        }
      },
      inventory: {
        enabled: false,
        actions: {
          view_stock: false,
          update_stock: false,
          batch_management: false,
          stock_alerts: false,
          inventory_reports: false
        }
      },
      analytics: {
        enabled: false,
        actions: {
          view_dashboard: false,
          sales_reports: false,
          user_analytics: false,
          export_reports: false,
          revenue_analysis: false
        }
      },
      returns: {
        enabled: false,
        actions: {
          view_returns: false,
          process_return: false,
          approve_refund: false,
          return_analytics: false
        }
      },
      settings: {
        enabled: false,
        actions: {
          view_settings: false,
          update_settings: false,
          system_config: false,
          backup_restore: false
        }
      },
      admin_management: {
        enabled: false,
        actions: {
          view_admins: false,
          create_admin: false,
          edit_admin: false,
          delete_admin: false,
          manage_permissions: false,
          view_activity_logs: false
        }
      }
    }
  };
};

// Helper function to get super admin permissions
const getSuperAdminPermissions = () => {
  return {
    modules: {
      products: {
        enabled: true,
        actions: {
          view_products: true,
          create_product: true,
          edit_product: true,
          delete_product: true,
          bulk_upload: true,
          export_products: true,
          manage_categories: true
        }
      },
      orders: {
        enabled: true,
        actions: {
          view_orders: true,
          update_status: true,
          cancel_order: true,
          refund_order: true,
          export_orders: true,
          view_order_details: true
        }
      },
      users: {
        enabled: true,
        actions: {
          view_users: true,
          edit_user: true,
          suspend_user: true,
          view_user_activity: true,
          export_users: true
        }
      },
      banners: {
        enabled: true,
        actions: {
          view_banners: true,
          create_banner: true,
          edit_banner: true,
          delete_banner: true
        }
      },
      coupons: {
        enabled: true,
        actions: {
          view_coupons: true,
          create_coupon: true,
          edit_coupon: true,
          delete_coupon: true
        }
      },
      sub_admins: {
        enabled: true,
        actions: {
          view_sub_admins: true,
          create_sub_admin: true,
          edit_sub_admin: true,
          delete_sub_admin: true
        }
      },
      combopacks: {
        enabled: true,
        actions: {
          view_combos: true,
          create_combo: true,
          edit_combo: true,
          delete_combo: true,
          manage_offers: true
        }
      },
      inventory: {
        enabled: true,
        actions: {
          view_stock: true,
          update_stock: true,
          batch_management: true,
          stock_alerts: true,
          inventory_reports: true
        }
      },
      analytics: {
        enabled: true,
        actions: {
          view_dashboard: true,
          sales_reports: true,
          user_analytics: true,
          export_reports: true,
          revenue_analysis: true
        }
      },
      returns: {
        enabled: true,
        actions: {
          view_returns: true,
          process_return: true,
          approve_refund: true,
          return_analytics: true
        }
      },
      settings: {
        enabled: true,
        actions: {
          view_settings: true,
          update_settings: true,
          system_config: true,
          backup_restore: true
        }
      },
      admin_management: {
        enabled: true,
        actions: {
          view_admins: true,
          create_admin: true,
          edit_admin: true,
          delete_admin: true,
          manage_permissions: true,
          view_activity_logs: true
        }
      }
    }
  };
};

export default CreateAdminModal;
