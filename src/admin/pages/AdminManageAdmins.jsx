// AdminManageAdmins - Main page for super admins to manage other admins
import React, { useState, useEffect } from 'react';
import { useAdminPermission } from '../context/AdminPermissionContext';
import { PermissionGate, SuperAdminOnly } from '../components/PermissionGate';
import CreateAdminModal from '../components/CreateAdminModal';
import EditAdminModal from '../components/EditAdminModal';
import AdminActivityLogs from '../components/AdminActivityLogs';
import toast from 'react-hot-toast';

const AdminManageAdmins = () => {
  const { isSuperAdmin } = useAdminPermission();
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState(null);
  const [showActivityLogs, setShowActivityLogs] = useState(false);
  const [selectedAdminForLogs, setSelectedAdminForLogs] = useState(null);

  // Fetch all admins
  const fetchAdmins = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
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
        toast.error(data.message || 'Failed to fetch admins');
      }
    } catch (error) {
      console.error('Error fetching admins:', error);
      toast.error('Error fetching admins');
    } finally {
      setLoading(false);
    }
  };

  // Delete admin
  const handleDeleteAdmin = async (adminId, adminName) => {
    if (!confirm(`Are you sure you want to delete admin "${adminName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`https://indiraa1-backend.onrender.com/api/admin/${adminId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      if (data.success) {
        toast.success('Admin deleted successfully');
        fetchAdmins(); // Refresh list
      } else {
        toast.error(data.message || 'Failed to delete admin');
      }
    } catch (error) {
      console.error('Error deleting admin:', error);
      toast.error('Error deleting admin');
    }
  };

  // Toggle admin status
  const handleToggleStatus = async (adminId, currentStatus, adminName) => {
    const newStatus = !currentStatus;
    const action = newStatus ? 'activate' : 'deactivate';

    if (!confirm(`Are you sure you want to ${action} admin "${adminName}"?`)) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`https://indiraa1-backend.onrender.com/api/admin/${adminId}/permissions`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          isActive: newStatus
        })
      });

      const data = await response.json();
      if (data.success) {
        toast.success(`Admin ${action}d successfully`);
        fetchAdmins(); // Refresh list
      } else {
        toast.error(data.message || `Failed to ${action} admin`);
      }
    } catch (error) {
      console.error(`Error ${action}ing admin:`, error);
      toast.error(`Error ${action}ing admin`);
    }
  };

  useEffect(() => {
    if (isSuperAdmin) {
      fetchAdmins();
    }
  }, [isSuperAdmin]);

  // Only super admins can access this page
  if (!isSuperAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🚫</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Access Denied</h1>
          <p className="text-gray-600">Super Admin privileges required to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <SuperAdminOnly>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                  </svg>
                </div>
                Admin Management
              </h1>
              <p className="text-gray-600 mt-1">
                Manage admin accounts, permissions, and monitor activities
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => setShowActivityLogs(true)}
                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors flex items-center gap-2"
              >
                <span>📊</span> Activity Logs
              </button>
              
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-6 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:shadow-lg transition-all flex items-center gap-2"
              >
                <span>➕</span> Create New Admin
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <span className="text-blue-600 text-xl">👤</span>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800">Total Admins</h3>
                <p className="text-2xl font-bold text-blue-600">{admins.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <span className="text-green-600 text-xl">✅</span>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800">Active Admins</h3>
                <p className="text-2xl font-bold text-green-600">
                  {admins.filter(admin => admin.isActive).length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <span className="text-purple-600 text-xl">👑</span>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800">Super Admins</h3>
                <p className="text-2xl font-bold text-purple-600">
                  {admins.filter(admin => admin.isSuperAdmin).length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Admins Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800">All Administrators</h2>
            <p className="text-gray-600 text-sm mt-1">Manage admin accounts and their permissions</p>
          </div>

          {loading ? (
            <div className="p-12 text-center">
              <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-gray-600">Loading admins...</p>
            </div>
          ) : admins.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">No Admins Found</h3>
              <p className="text-gray-600 mb-4">Create your first admin to get started</p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                Create Admin
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Admin Details
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type & Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Last Login
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {admins.map((admin) => (
                    <AdminRow
                      key={admin._id}
                      admin={admin}
                      onEdit={setEditingAdmin}
                      onDelete={handleDeleteAdmin}
                      onToggleStatus={handleToggleStatus}
                      onViewLogs={(admin) => {
                        setSelectedAdminForLogs(admin);
                        setShowActivityLogs(true);
                      }}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Modals */}
        {showCreateModal && (
          <CreateAdminModal
            onClose={() => setShowCreateModal(false)}
            onSuccess={() => {
              setShowCreateModal(false);
              fetchAdmins();
            }}
          />
        )}

        {editingAdmin && (
          <EditAdminModal
            admin={editingAdmin}
            onClose={() => setEditingAdmin(null)}
            onSuccess={() => {
              setEditingAdmin(null);
              fetchAdmins();
            }}
          />
        )}

        {showActivityLogs && (
          <AdminActivityLogs
            adminFilter={selectedAdminForLogs}
            onClose={() => {
              setShowActivityLogs(false);
              setSelectedAdminForLogs(null);
            }}
          />
        )}
      </div>
    </SuperAdminOnly>
  );
};

// Admin Row Component
const AdminRow = ({ admin, onEdit, onDelete, onToggleStatus, onViewLogs }) => {
  const formatDate = (date) => {
    if (!date) return 'Never';
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(date));
  };

  const getPermissionSummary = (permissions) => {
    if (!permissions || !permissions.modules) return 'No permissions';
    
    const moduleCount = permissions.modules instanceof Map 
      ? permissions.modules.size 
      : Object.keys(permissions.modules).length;
    
    return `${moduleCount} modules`;
  };

  return (
    <tr className="hover:bg-gray-50 transition-colors">
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mr-4">
            <span className="text-white font-semibold">
              {admin.name.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <div className="text-sm font-medium text-gray-900 flex items-center gap-2">
              {admin.name}
              {admin.isSuperAdmin && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                  👑 Super Admin
                </span>
              )}
            </div>
            <div className="text-sm text-gray-500">@{admin.username}</div>
            <div className="text-sm text-gray-500">{admin.email}</div>
          </div>
        </div>
      </td>
      
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="space-y-1">
          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
            admin.isActive 
              ? 'bg-green-100 text-green-800' 
              : 'bg-red-100 text-red-800'
          }`}>
            {admin.isActive ? '✅ Active' : '❌ Inactive'}
          </span>
          {!admin.isSuperAdmin && (
            <div className="text-xs text-gray-500">
              {getPermissionSummary(admin.permissions)}
            </div>
          )}
        </div>
      </td>
      
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        <div>
          <div>{formatDate(admin.createdAt)}</div>
          {admin.createdBy && (
            <div className="text-xs text-gray-400">
              by {admin.createdBy.name || admin.createdBy.username}
            </div>
          )}
        </div>
      </td>
      
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {formatDate(admin.lastLogin)}
      </td>
      
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        <div className="flex items-center justify-end gap-2">
          <button
            onClick={() => onViewLogs(admin)}
            className="text-blue-600 hover:text-blue-900 p-1 rounded"
            title="View Activity"
          >
            📊
          </button>
          
          <button
            onClick={() => onEdit(admin)}
            className="text-indigo-600 hover:text-indigo-900 p-1 rounded"
            title="Edit Permissions"
          >
            ✏️
          </button>
          
          <button
            onClick={() => onToggleStatus(admin._id, admin.isActive, admin.name)}
            className={`p-1 rounded ${
              admin.isActive 
                ? 'text-orange-600 hover:text-orange-900' 
                : 'text-green-600 hover:text-green-900'
            }`}
            title={admin.isActive ? 'Deactivate' : 'Activate'}
          >
            {admin.isActive ? '⏸️' : '▶️'}
          </button>
          
          <button
            onClick={() => onDelete(admin._id, admin.name)}
            className="text-red-600 hover:text-red-900 p-1 rounded"
            title="Delete Admin"
          >
            🗑️
          </button>
        </div>
      </td>
    </tr>
  );
};

export default AdminManageAdmins;
