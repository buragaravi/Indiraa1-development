// EditAdminModal - Modal for editing existing admin accounts
import React, { useState, useEffect } from 'react';
import ModulePermissionSelector from './ModulePermissionSelector';
import toast from 'react-hot-toast';

const EditAdminModal = ({ admin, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    username: '',
    name: '',
    email: '',
    isSuperAdmin: false,
    isActive: true,
    permissions: {}
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [activeTab, setActiveTab] = useState('basic');

  // Initialize form data when admin prop changes
  useEffect(() => {
    if (admin) {
      setFormData({
        username: admin.username || '',
        name: admin.name || '',
        email: admin.email || '',
        isSuperAdmin: admin.isSuperAdmin || false,
        isActive: admin.isActive !== false,
        permissions: admin.permissions || {}
      });
    }
  }, [admin]);

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
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
      
      const response = await fetch(`http://localhost:5001/api/admin/${admin._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          username: formData.username.trim(),
          name: formData.name.trim(),
          email: formData.email.trim(),
          isSuperAdmin: formData.isSuperAdmin,
          isActive: formData.isActive,
          permissions: formData.isSuperAdmin ? getSuperAdminPermissions() : formData.permissions
        })
      });

      const data = await response.json();
      
      if (data.success) {
        toast.success('Admin updated successfully!');
        onSuccess();
      } else {
        if (data.message.includes('Username already exists')) {
          setErrors({ username: 'Username already exists' });
        } else if (data.message.includes('Email already exists')) {
          setErrors({ email: 'Email already exists' });
        } else {
          toast.error(data.message || 'Failed to update admin');
        }
      }
    } catch (error) {
      console.error('Error updating admin:', error);
      toast.error('Error updating admin');
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

  if (!admin) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-800">Edit Admin</h2>
                <p className="text-gray-600 text-sm">Update administrator details and permissions</p>
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

          {/* Tabs */}
          <div className="flex gap-1 mt-4">
            <button
              type="button"
              onClick={() => setActiveTab('basic')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'basic'
                  ? 'bg-blue-100 text-blue-700 border border-blue-200'
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
              }`}
            >
              Basic Info
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('permissions')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'permissions'
                  ? 'bg-blue-100 text-blue-700 border border-blue-200'
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
              }`}
            >
              Permissions
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('status')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'status'
                  ? 'bg-blue-100 text-blue-700 border border-blue-200'
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
              }`}
            >
              Status & Type
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          {/* Basic Information Tab */}
          {activeTab === 'basic' && (
            <div className="space-y-4">
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

              {/* Account Info */}
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <h3 className="font-medium text-gray-800">Account Information</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Created:</span>
                    <span className="ml-2 font-medium">
                      {new Date(admin.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Last Login:</span>
                    <span className="ml-2 font-medium">
                      {admin.lastLogin ? new Date(admin.lastLogin).toLocaleDateString() : 'Never'}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Created By:</span>
                    <span className="ml-2 font-medium">
                      {admin.createdByName || 'System'}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Admin ID:</span>
                    <span className="ml-2 font-mono text-xs bg-white px-2 py-1 rounded">
                      {admin._id}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Permissions Tab */}
          {activeTab === 'permissions' && (
            <div className="space-y-4">
              {formData.isSuperAdmin ? (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-yellow-700 mb-2">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 10a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1v-1a1 1 0 011-1zM12 2a1 1 0 01.894.553l2.991 5.982a.869.869 0 010 .775l-2.991 5.982A1 1 0 0112 16H9a1 1 0 01-.894-.553L5.115 9.465a.869.869 0 010-.775l2.991-5.982A1 1 0 019 2h3z" clipRule="evenodd" />
                    </svg>
                    <span className="font-medium">Super Administrator</span>
                  </div>
                  <p className="text-yellow-600 text-sm">
                    This admin has full access to all modules and features. Individual permissions cannot be modified for super administrators.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-800">Module Permissions</h3>
                    <span className="text-sm text-gray-600">Configure access for each module</span>
                  </div>
                  <ModulePermissionSelector
                    permissions={formData.permissions}
                    onChange={(permissions) => setFormData(prev => ({ ...prev, permissions }))}
                  />
                </div>
              )}
            </div>
          )}

          {/* Status & Type Tab */}
          {activeTab === 'status' && (
            <div className="space-y-6">
              {/* Account Status */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Account Status</h3>
                
                <div className="space-y-3">
                  <label className="flex items-start gap-3 p-4 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                    <input
                      type="radio"
                      name="accountStatus"
                      checked={formData.isActive}
                      onChange={() => setFormData(prev => ({ ...prev, isActive: true }))}
                      className="mt-1"
                    />
                    <div>
                      <div className="font-medium text-gray-800 flex items-center gap-2">
                        <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        Active
                      </div>
                      <p className="text-sm text-gray-600">
                        Admin can log in and access assigned modules
                      </p>
                    </div>
                  </label>

                  <label className="flex items-start gap-3 p-4 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                    <input
                      type="radio"
                      name="accountStatus"
                      checked={!formData.isActive}
                      onChange={() => setFormData(prev => ({ ...prev, isActive: false }))}
                      className="mt-1"
                    />
                    <div>
                      <div className="font-medium text-gray-800 flex items-center gap-2">
                        <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M13.477 14.89A6 6 0 015.11 6.524l8.367 8.368zm1.414-1.414L6.524 5.11a6 6 0 018.367 8.367zM18 10a8 8 0 11-16 0 8 8 0 0116 0z" clipRule="evenodd" />
                        </svg>
                        Suspended
                      </div>
                      <p className="text-sm text-gray-600">
                        Admin cannot log in or access any modules
                      </p>
                    </div>
                  </label>
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

              {/* Warning for type change */}
              {admin.isSuperAdmin !== formData.isSuperAdmin && (
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-orange-700 mb-2">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <span className="font-medium">Admin Type Change</span>
                  </div>
                  <p className="text-orange-600 text-sm">
                    {formData.isSuperAdmin 
                      ? 'Promoting this admin to Super Administrator will grant full system access.'
                      : 'Demoting this Super Administrator will remove their admin management privileges and apply custom permissions.'
                    }
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-6 mt-6 border-t border-gray-200">
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
              className="px-6 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                  Updating...
                </>
              ) : (
                <>
                  <span>💾</span> Update Admin
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Helper function to get super admin permissions
const getSuperAdminPermissions = () => {
  return {
    modules: {
      products: {
        enabled: true,
        features: {
          view_products: 'write',
          create_product: 'write',
          edit_product: 'write',
          delete_product: 'write',
          bulk_upload: 'write',
          export_products: 'write',
          manage_categories: 'write'
        }
      },
      orders: {
        enabled: true,
        features: {
          view_orders: 'write',
          update_status: 'write',
          cancel_order: 'write',
          refund_order: 'write',
          export_orders: 'write',
          view_details: 'write'
        }
      },
      users: {
        enabled: true,
        features: {
          view_users: 'write',
          edit_user: 'write',
          suspend_user: 'write',
          user_activity: 'write',
          export_users: 'write'
        }
      },
      combopacks: {
        enabled: true,
        features: {
          view_combos: 'write',
          create_combo: 'write',
          edit_combo: 'write',
          delete_combo: 'write',
          manage_offers: 'write'
        }
      },
      inventory: {
        enabled: true,
        features: {
          view_stock: 'write',
          update_stock: 'write',
          batch_management: 'write',
          stock_alerts: 'write',
          inventory_reports: 'write'
        }
      },
      analytics: {
        enabled: true,
        features: {
          view_dashboard: 'write',
          sales_reports: 'write',
          user_analytics: 'write',
          export_reports: 'write',
          revenue_analysis: 'write'
        }
      },
      returns: {
        enabled: true,
        features: {
          view_returns: 'write',
          process_return: 'write',
          approve_refund: 'write',
          return_analytics: 'write'
        }
      },
      settings: {
        enabled: true,
        features: {
          view_settings: 'write',
          update_settings: 'write',
          system_config: 'write',
          backup_restore: 'write'
        }
      },
      banners: {
        enabled: true,
        features: {
          view_banners: 'write',
          create_banner: 'write',
          edit_banner: 'write',
          delete_banner: 'write'
        }
      },
      coupons: {
        enabled: true,
        features: {
          view_coupons: 'write',
          create_coupon: 'write',
          edit_coupon: 'write',
          delete_coupon: 'write'
        }
      },
      sub_admins: {
        enabled: true,
        features: {
          view_sub_admins: 'write',
          create_sub_admin: 'write',
          edit_sub_admin: 'write',
          delete_sub_admin: 'write'
        }
      },
      admin_management: {
        enabled: true,
        features: {
          view_admins: 'write',
          create_admin: 'write',
          edit_admin: 'write',
          delete_admin: 'write',
          manage_permissions: 'write',
          view_activity_logs: 'write'
        }
      }
    }
  };
};

export default EditAdminModal;
