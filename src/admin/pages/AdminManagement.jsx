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
      const response = await fetch('http://localhost:5001/api/admin/list', {
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
      const response = await fetch('http://localhost:5001/api/admin/activity-logs', {
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
      const response = await fetch(`http://localhost:5001/api/admin/${adminId}`, {
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

    const moduleCount = getEnabledModulesCount();
    return (
      <span className="inline-flex items-center px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
        <AdminIcon />
        <span className="ml-1">Admin ({moduleCount} modules)</span>
      </span>
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
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Admin Management</h1>
            <p className="text-gray-600 mt-2">Manage administrator accounts and permissions</p>
          </div>
          <div className="flex space-x-3">
            {/* View Activity Logs Button */}
            <PermissionButton
              module="admin_management"
              action="view_activity_logs"
              onClick={fetchActivityLogs}
              variant="secondary"
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              <LogsIcon />
              <span className="ml-2">Activity Logs</span>
            </PermissionButton>

            {/* Create Admin Button */}
            <PermissionButton
              module="admin_management"
              action="create_admin"
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm bg-blue-600 text-sm font-medium text-white hover:bg-blue-700"
            >
              <PlusIcon />
              <span className="ml-2">Create Admin</span>
            </PermissionButton>
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
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Administrator Accounts</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Admin
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {admins.map((admin) => (
                <tr key={admin._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                          <AdminIcon />
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{admin.name}</div>
                        <div className="text-sm text-gray-500">{admin.email}</div>
                        <div className="text-sm text-gray-500">@{admin.username}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getRoleBadge(admin)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(admin.isActive)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(admin.createdAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    {/* Edit Admin Button */}
                    <PermissionButton
                      module="admin_management"
                      action="edit_admin"
                      onClick={() => handleEditAdmin(admin)}
                      variant="secondary"
                      size="sm"
                      className="inline-flex items-center px-3 py-1 border border-gray-300 rounded text-sm text-gray-700 bg-white hover:bg-gray-50"
                    >
                      <EditIcon />
                      <span className="ml-1">Edit</span>
                    </PermissionButton>

                    {/* Delete Admin Button */}
                    {!admin.isSuperAdmin && (
                      <PermissionButton
                        module="admin_management"
                        action="delete_admin"
                        onClick={() => handleDeleteAdmin(admin._id)}
                        variant="danger"
                        size="sm"
                        className="inline-flex items-center px-3 py-1 border border-red-300 rounded text-sm text-red-700 bg-white hover:bg-red-50"
                      >
                        <DeleteIcon />
                        <span className="ml-1">Delete</span>
                      </PermissionButton>
                    )}
                  </td>
                </tr>
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
                          <p className="text-sm font-medium text-gray-900">{log.action}</p>
                          <p className="text-sm text-gray-600">{log.adminName}</p>
                          {log.details && (
                            <p className="text-sm text-gray-500 mt-1">{log.details}</p>
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
  );
};

export default AdminManagement;
