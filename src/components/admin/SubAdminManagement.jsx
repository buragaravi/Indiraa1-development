import React, { useState, useEffect } from 'react';
import { 
  FaPlus, 
  FaEdit, 
  FaTrash, 
  FaEye, 
  FaEyeSlash,
  FaUserShield,
  FaSearch,
  FaFilter,
  FaCheckCircle,
  FaTimesCircle,
  FaCog,
  FaWarehouse,
  FaTruck
} from 'react-icons/fa';

const SubAdminManagement = () => {
  // Helper function to get admin token from either storage location
  const getAdminToken = () => {
    return localStorage.getItem('adminToken') || localStorage.getItem('token');
  };

  // Check admin authentication on component mount
  useEffect(() => {
    const verifyAdminAuth = () => {
      const token = localStorage.getItem('token');
      if (!token) {
        console.warn('[SUB ADMIN MANAGEMENT] No admin token found');
        setError('Admin authentication required. Please login as admin first.');
        return;
      }
      
      try {
        // Basic token format check
        const parts = token.split('.');
        if (parts.length !== 3) {
          throw new Error('Invalid token format');
        }
        
        // Decode token payload (without verification - just for debugging)
        const payload = JSON.parse(atob(parts[1]));
        console.log('[SUB ADMIN MANAGEMENT] Token payload:', payload);
        
        // Check if token has required admin properties
        if (!payload.isAdmin || !payload.adminId) {
          throw new Error('Token missing admin properties');
        }
        
        console.log('[SUB ADMIN MANAGEMENT] Admin token validation passed');
      } catch (error) {
        console.error('[SUB ADMIN MANAGEMENT] Invalid admin token:', error);
        localStorage.removeItem('adminToken');
        setError('Invalid admin token. Please login again as admin.');
      }
    };
    
    verifyAdminAuth();
  }, []);

  const [subAdmins, setSubAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingSubAdmin, setEditingSubAdmin] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [filterPermissions, setFilterPermissions] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterVerification, setFilterVerification] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({});

  // Form state for creating/editing sub admin
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    role: '',
    permissions: '',
    isActive: true
  });
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Fetch sub admins
  const fetchSubAdmins = async (page = 1) => {
    try {
      setLoading(true);
      const token = getAdminToken();
      const apiUrl ='http://localhost:5001';
      
      if (!token) {
        throw new Error('Admin authentication required. Please login as admin first.');
      }

      console.log('[SUB ADMIN MANAGEMENT] Fetching with admin token:', token ? 'Token present' : 'No token');
      
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: '10'
      });

      if (filterRole) queryParams.append('role', filterRole);
      if (filterPermissions) queryParams.append('permissions', filterPermissions);
      if (filterStatus !== '') queryParams.append('isActive', filterStatus);
      if (filterVerification !== '') queryParams.append('isEmailVerified', filterVerification);

      const response = await fetch(
        `${apiUrl}/api/sub-admin/all?${queryParams}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const data = await response.json();

      console.log('[SUB ADMIN MANAGEMENT] Response status:', response.status);
      console.log('[SUB ADMIN MANAGEMENT] Response data:', data);

      if (!response.ok) {
        if (response.status === 401) {
          // Clear invalid admin token
          localStorage.removeItem('adminToken');
          throw new Error('Admin authentication failed. Please login again.');
        }
        if (response.status === 403) {
          throw new Error('Access denied. Admin privileges required.');
        }
        throw new Error(data.message || `Request failed with status ${response.status}`);
      }

      setSubAdmins(data.subAdmins || []);
      setPagination(data.pagination || {});
    } catch (error) {
      console.error('[SUB ADMIN MANAGEMENT] Fetch error:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubAdmins(currentPage);
  }, [currentPage, filterRole, filterPermissions, filterStatus, filterVerification]);

  // Reset form
  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      password: '',
      role: '',
      permissions: '',
      isActive: true
    });
    setFormError('');
    setShowPassword(false);
  };

  // Handle create sub admin
  const handleCreate = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    setFormError('');

    try {
      const token = getAdminToken();
      const apiUrl = 'http://localhost:5001';
      
      if (!token) {
        throw new Error('Admin authentication required. Please login as admin first.');
      }

      console.log('[SUB ADMIN MANAGEMENT] Creating sub admin with admin token:', token ? 'Token present' : 'No token');
      
      const response = await fetch(`${apiUrl}/api/sub-admin/create`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      console.log('[SUB ADMIN MANAGEMENT] Create response status:', response.status);
      console.log('[SUB ADMIN MANAGEMENT] Create response data:', data);

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('adminToken');
          throw new Error('Admin authentication failed. Please login again.');
        }
        if (response.status === 403) {
          throw new Error('Access denied. Admin privileges required.');
        }
        throw new Error(data.message || `Failed to create sub admin (Status: ${response.status})`);
      }

      setShowCreateModal(false);
      resetForm();
      fetchSubAdmins(currentPage);
      
      // Show success message
      alert('Sub admin created successfully! Verification email sent.');
    } catch (error) {
      console.error('[SUB ADMIN MANAGEMENT] Create error:', error);
      setFormError(error.message);
    } finally {
      setFormLoading(false);
    }
  };

  // Handle edit sub admin
  const handleEdit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    setFormError('');

    try {
      const token = getAdminToken();
      const apiUrl = 'http://localhost:5001';
      
      if (!token) {
        throw new Error('Admin authentication required. Please login as admin first.');
      }
      
      const updateData = { ...formData };
      delete updateData.password; // Don't update password through edit

      const response = await fetch(
        `${apiUrl}/api/sub-admin/${editingSubAdmin._id}`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(updateData)
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update sub admin');
      }

      setShowEditModal(false);
      setEditingSubAdmin(null);
      resetForm();
      fetchSubAdmins(currentPage);
      
      alert('Sub admin updated successfully!');
    } catch (error) {
      console.error('[SUB ADMIN MANAGEMENT] Update error:', error);
      setFormError(error.message);
    } finally {
      setFormLoading(false);
    }
  };

  // Handle delete sub admin
  const handleDelete = async (subAdmin) => {
    if (!confirm(`Are you sure you want to delete ${subAdmin.name}? This action cannot be undone.`)) {
      return;
    }

    try {
      const token = getAdminToken();
      const apiUrl = 'http://localhost:5001';
      
      if (!token) {
        throw new Error('Admin authentication required. Please login as admin first.');
      }
      
      const response = await fetch(
        `${apiUrl}/api/sub-admin/${subAdmin._id}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to delete sub admin');
      }

      fetchSubAdmins(currentPage);
      alert('Sub admin deleted successfully!');
    } catch (error) {
      console.error('[SUB ADMIN MANAGEMENT] Delete error:', error);
      alert(`Failed to delete sub admin: ${error.message}`);
    }
  };

  // Open edit modal
  const openEditModal = (subAdmin) => {
    setEditingSubAdmin(subAdmin);
    setFormData({
      name: subAdmin.name,
      email: subAdmin.email,
      phone: subAdmin.phone,
      password: '', // Don't pre-fill password
      role: subAdmin.role,
      permissions: subAdmin.permissions,
      isActive: subAdmin.isActive
    });
    setShowEditModal(true);
  };

  // Filter sub admins based on search
  const filteredSubAdmins = subAdmins.filter(subAdmin =>
    subAdmin.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    subAdmin.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    subAdmin.phone.includes(searchTerm)
  );

  // Role icon helper
  const getRoleIcon = (role) => {
    switch (role) {
      case 'warehouse_manager':
        return <FaWarehouse className="text-blue-500" />;
      case 'logistics_manager':
        return <FaTruck className="text-green-500" />;
      default:
        return <FaUserShield className="text-gray-500" />;
    }
  };

  // Test admin token function for debugging
  const testAdminToken = () => {
    const adminToken = localStorage.getItem('adminToken');
    const regularToken = localStorage.getItem('token');
    const userType = localStorage.getItem('userType');
    
    console.log('[DEBUG] Admin token:', adminToken);
    console.log('[DEBUG] Regular token:', regularToken);
    console.log('[DEBUG] User type:', userType);
    
    const token = getAdminToken();
    
    if (token) {
      try {
        const parts = token.split('.');
        const payload = JSON.parse(atob(parts[1]));
        console.log('[DEBUG] Decoded token payload:', payload);
        alert(`Token Info:\n${JSON.stringify(payload, null, 2)}\n\nUser Type: ${userType}\nToken Source: ${adminToken ? 'adminToken' : 'token'}`);
      } catch (error) {
        console.error('[DEBUG] Token decode error:', error);
        alert('Invalid token format');
      }
    } else {
      alert('No admin token found');
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
              <FaUserShield className="mr-3 text-blue-600" />
              Sub Admin Management
            </h1>
            <p className="mt-1 text-gray-600">Manage warehouse and logistics managers</p>
          </div>
          <button
            onClick={() => {
              resetForm();
              setShowCreateModal(true);
            }}
            className="mt-4 sm:mt-0 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
          >
            <FaPlus className="mr-2" />
            Add Sub Admin
          </button>
          
          {/* Debug Token Button */}
          <button
            onClick={testAdminToken}
            className="mt-4 sm:mt-0 ml-2 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors text-sm"
          >
            Debug Token
          </button>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {/* Search */}
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search name, email, phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Role Filter */}
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Roles</option>
            <option value="warehouse_manager">Warehouse Manager</option>
            <option value="logistics_manager">Logistics Manager</option>
          </select>

          {/* Permissions Filter */}
          <select
            value={filterPermissions}
            onChange={(e) => setFilterPermissions(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Permissions</option>
            <option value="read">Read Only</option>
            <option value="read_write">Read & Write</option>
          </select>

          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Status</option>
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>

          {/* Email Verification Filter */}
          <select
            value={filterVerification}
            onChange={(e) => setFilterVerification(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Verification</option>
            <option value="true">Email Verified</option>
            <option value="false">Email Unverified</option>
          </select>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-800">{error}</p>
          <button 
            onClick={() => fetchSubAdmins(currentPage)}
            className="mt-2 text-red-600 hover:text-red-800 underline"
          >
            Try again
          </button>
        </div>
      )}

      {/* Sub Admins Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading sub admins...</p>
          </div>
        ) : filteredSubAdmins.length === 0 ? (
          <div className="p-8 text-center">
            <FaUserShield className="mx-auto h-12 w-12 text-gray-400" />
            <p className="mt-2 text-gray-600">No sub admins found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Sub Admin
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role & Permissions
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
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
                {filteredSubAdmins.map((subAdmin) => (
                  <tr key={subAdmin._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                          <span className="text-white font-medium text-sm">
                            {subAdmin.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {subAdmin.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {subAdmin.email}
                          </div>
                          <div className="text-sm text-gray-500">
                            {subAdmin.phone}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {getRoleIcon(subAdmin.role)}
                        <div className="ml-2">
                          <div className="text-sm font-medium text-gray-900">
                            {subAdmin.roleDisplayName}
                          </div>
                          <div className="text-sm text-gray-500">
                            {subAdmin.permissionsDisplayName}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          subAdmin.isActive 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {subAdmin.isActive ? (
                            <>
                              <FaCheckCircle className="mr-1" />
                              Active
                            </>
                          ) : (
                            <>
                              <FaTimesCircle className="mr-1" />
                              Inactive
                            </>
                          )}
                        </span>
                        {subAdmin.isEmailVerified && (
                          <span className="mt-1 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            Email Verified
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {subAdmin.lastLogin 
                        ? new Date(subAdmin.lastLogin).toLocaleDateString()
                        : 'Never'
                      }
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => openEditModal(subAdmin)}
                          className="text-blue-600 hover:text-blue-900 p-1"
                          title="Edit"
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={() => handleDelete(subAdmin)}
                          className="text-red-600 hover:text-red-900 p-1"
                          title="Delete"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, pagination.pages))}
                disabled={currentPage === pagination.pages}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing{' '}
                  <span className="font-medium">{((currentPage - 1) * 10) + 1}</span>
                  {' '}to{' '}
                  <span className="font-medium">
                    {Math.min(currentPage * 10, pagination.total)}
                  </span>
                  {' '}of{' '}
                  <span className="font-medium">{pagination.total}</span>
                  {' '}results
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                  {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                        page === currentPage
                          ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                          : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Create New Sub Admin</h3>
              
              {formError && (
                <div className="bg-red-50 border border-red-200 rounded p-3 mb-4">
                  <p className="text-red-800 text-sm">{formError}</p>
                </div>
              )}

              <form onSubmit={handleCreate} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={formData.password}
                      onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                      className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      {showPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                  <select
                    required
                    value={formData.role}
                    onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select Role</option>
                    <option value="warehouse_manager">Warehouse Manager</option>
                    <option value="logistics_manager">Logistics Manager</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Permissions</label>
                  <select
                    required
                    value={formData.permissions}
                    onChange={(e) => setFormData(prev => ({ ...prev, permissions: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select Permissions</option>
                    <option value="read">Read Only</option>
                    <option value="read_write">Read & Write</option>
                  </select>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={formData.isActive}
                    onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                  />
                  <label htmlFor="isActive" className="ml-2 text-sm text-gray-700">
                    Active Account
                  </label>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateModal(false);
                      resetForm();
                    }}
                    className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={formLoading}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                  >
                    {formLoading ? 'Creating...' : 'Create Sub Admin'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && editingSubAdmin && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Edit Sub Admin: {editingSubAdmin.name}
              </h3>
              
              {formError && (
                <div className="bg-red-50 border border-red-200 rounded p-3 mb-4">
                  <p className="text-red-800 text-sm">{formError}</p>
                </div>
              )}

              <form onSubmit={handleEdit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                  <select
                    required
                    value={formData.role}
                    onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="warehouse_manager">Warehouse Manager</option>
                    <option value="logistics_manager">Logistics Manager</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Permissions</label>
                  <select
                    required
                    value={formData.permissions}
                    onChange={(e) => setFormData(prev => ({ ...prev, permissions: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="read">Read Only</option>
                    <option value="read_write">Read & Write</option>
                  </select>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isActiveEdit"
                    checked={formData.isActive}
                    onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                  />
                  <label htmlFor="isActiveEdit" className="ml-2 text-sm text-gray-700">
                    Active Account
                  </label>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowEditModal(false);
                      setEditingSubAdmin(null);
                      resetForm();
                    }}
                    className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={formLoading}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                  >
                    {formLoading ? 'Updating...' : 'Update Sub Admin'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubAdminManagement;
