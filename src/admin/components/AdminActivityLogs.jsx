// AdminActivityLogs - Enhanced modal component for viewing admin activity logs
import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

const AdminActivityLogs = ({ admin, onClose }) => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [dateRange, setDateRange] = useState('7d');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedLogDetails, setSelectedLogDetails] = useState(null);
  const logsPerPage = 10;

  // Fetch activity logs
  useEffect(() => {
    if (admin) {
      fetchActivityLogs();
    }
  }, [admin, filter, dateRange]);

  const fetchActivityLogs = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
      
      const params = new URLSearchParams({
        adminId: admin._id,
        ...(filter !== 'all' && { action: filter }),
        dateRange
      });
      
      const response = await fetch(`https://indiraa1-backend.onrender.com/api/admin/activity-logs?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      
      if (data.success) {
        setLogs(data.logs || []);
      } else {
        toast.error('Failed to fetch activity logs');
      }
    } catch (error) {
      console.error('Error fetching activity logs:', error);
      toast.error('Error fetching activity logs');
    } finally {
      setLoading(false);
    }
  };

  // Enhanced activity type configurations with more detailed info
  const activityTypes = {
    'admin_login': { 
      icon: <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M3 3a1 1 0 011 1v12a1 1 0 11-2 0V4a1 1 0 011-1zm7.707 3.293a1 1 0 010 1.414L9.414 9H17a1 1 0 110 2H9.414l1.293 1.293a1 1 0 01-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0z" clipRule="evenodd" /></svg>, 
      color: 'text-emerald-700 bg-emerald-50 border-emerald-200', 
      label: 'Admin Login',
      description: 'Administrator logged into the system',
      severity: 'info'
    },
    'admin_logout': { 
      icon: <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" /></svg>, 
      color: 'text-gray-700 bg-gray-50 border-gray-200', 
      label: 'Admin Logout',
      description: 'Administrator logged out of the system',
      severity: 'info'
    },
    'create_admin': { 
      icon: <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 7a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V7z" /></svg>, 
      color: 'text-blue-700 bg-blue-50 border-blue-200', 
      label: 'Admin Created',
      description: 'New administrator account was created',
      severity: 'important'
    },
    'update_admin': { 
      icon: <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" /></svg>, 
      color: 'text-amber-700 bg-amber-50 border-amber-200', 
      label: 'Admin Modified',
      description: 'Administrator account was updated',
      severity: 'warning'
    },
    'delete_admin': { 
      icon: <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" clipRule="evenodd" /><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>, 
      color: 'text-red-700 bg-red-50 border-red-200', 
      label: 'Admin Deleted',
      description: 'Administrator account was removed',
      severity: 'critical'
    },
    'update_permissions': { 
      icon: <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 8a6 6 0 01-7.743 5.743L10 14l-1 1-1 1H6v2H2v-4l4.257-4.257A6 6 0 1118 8zm-6-2a1 1 0 11-2 0 1 1 0 012 0z" clipRule="evenodd" /></svg>, 
      color: 'text-purple-700 bg-purple-50 border-purple-200', 
      label: 'Permissions Updated',
      description: 'Administrator permissions were modified',
      severity: 'important'
    },
    'create_product': { 
      icon: <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 2L3 7v11a1 1 0 001 1h12a1 1 0 001-1V7l-7-5zM10 18v-6h4v6h-4z" clipRule="evenodd" /></svg>, 
      color: 'text-green-700 bg-green-50 border-green-200', 
      label: 'Product Created',
      description: 'New product was added to catalog',
      severity: 'info'
    },
    'update_product': { 
      icon: <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" /></svg>, 
      color: 'text-blue-700 bg-blue-50 border-blue-200', 
      label: 'Product Updated',
      description: 'Product information was modified',
      severity: 'info'
    },
    'delete_product': { 
      icon: <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" clipRule="evenodd" /><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>, 
      color: 'text-red-700 bg-red-50 border-red-200', 
      label: 'Product Deleted',
      description: 'Product was removed from catalog',
      severity: 'warning'
    },
    'update_order': { 
      icon: <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" /></svg>, 
      color: 'text-indigo-700 bg-indigo-50 border-indigo-200', 
      label: 'Order Updated',
      description: 'Order status or details were modified',
      severity: 'info'
    },
    'cancel_order': { 
      icon: <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M13.477 14.89A6 6 0 015.11 6.524l8.367 8.368zm1.414-1.414L6.524 5.11a6 6 0 018.367 8.367zM18 10a8 8 0 11-16 0 8 8 0 0116 0z" clipRule="evenodd" /></svg>, 
      color: 'text-red-700 bg-red-50 border-red-200', 
      label: 'Order Cancelled',
      description: 'Order was cancelled',
      severity: 'warning'
    },
    'create_banner': { 
      icon: <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" /></svg>, 
      color: 'text-pink-700 bg-pink-50 border-pink-200', 
      label: 'Banner Created',
      description: 'New banner was added',
      severity: 'info'
    },
    'update_banner': { 
      icon: <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" /></svg>, 
      color: 'text-pink-700 bg-pink-50 border-pink-200', 
      label: 'Banner Updated',
      description: 'Banner was modified',
      severity: 'info'
    }
  };

  // Filter and search functionality
  const filteredLogs = logs.filter(log => {
    const matchesSearch = searchTerm === '' || 
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (log.details && log.details.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (log.adminName && log.adminName.toLowerCase().includes(searchTerm.toLowerCase()));
    
    return matchesSearch;
  });

  // Pagination
  const totalPages = Math.ceil(filteredLogs.length / logsPerPage);
  const startIndex = (currentPage - 1) * logsPerPage;
  const paginatedLogs = filteredLogs.slice(startIndex, startIndex + logsPerPage);

  // Helper functions
  const formatRelativeTime = (timestamp) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMinutes = Math.floor((now - time) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    if (diffInMinutes < 10080) return `${Math.floor(diffInMinutes / 1440)}d ago`;
    return time.toLocaleDateString();
  };

  const formatDateTime = (timestamp) => {
    return new Date(timestamp).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const getActivityConfig = (action) => {
    return activityTypes[action] || {
      icon: <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" /></svg>,
      color: 'text-gray-700 bg-gray-50 border-gray-200',
      label: action.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      description: 'System activity',
      severity: 'info'
    }
  };

  // Date range options
  const dateRangeOptions = [
    { value: '1d', label: 'Last 24 hours' },
    { value: '7d', label: 'Last 7 days' },
    { value: '30d', label: 'Last 30 days' },
    { value: '90d', label: 'Last 90 days' },
    { value: 'all', label: 'All time' }
  ];

  // Filter options
  const filterOptions = [
    { value: 'all', label: 'All Activities' },
    { value: 'admin_login', label: 'Logins' },
    { value: 'admin_logout', label: 'Logouts' },
    { value: 'create_admin', label: 'Admin Creation' },
    { value: 'update_admin', label: 'Admin Updates' },
    { value: 'delete_admin', label: 'Admin Deletions' },
    { value: 'product_create', label: 'Product Creation' },
    { value: 'product_update', label: 'Product Updates' },
    { value: 'order_update', label: 'Order Updates' }
  ];

  if (!admin) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-800">Activity Logs</h2>
                <p className="text-gray-600 text-sm">
                  Activity history for {admin.name} ({admin.username})
                </p>
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

          {/* Filters */}
          <div className="flex flex-wrap gap-4 mt-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Time Period
              </label>
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {dateRangeOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Activity Type
              </label>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {filterOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={fetchActivityLogs}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
              <span className="ml-3 text-gray-600">Loading activity logs...</span>
            </div>
          ) : logs.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-800 mb-2">No Activity Found</h3>
              <p className="text-gray-600">
                No activity logs found for the selected time period and filters.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Summary Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                    </svg>
                    <span className="text-sm font-medium text-blue-600">Total Activities</span>
                  </div>
                  <div className="text-2xl font-bold text-blue-700 mt-1">{logs.length}</div>
                </div>
                
                <div className="bg-green-50 rounded-lg p-4">
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M3 3a1 1 0 011 1v12a1 1 0 11-2 0V4a1 1 0 011-1zm7.707 3.293a1 1 0 010 1.414L9.414 9H17a1 1 0 110 2H9.414l1.293 1.293a1 1 0 01-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm font-medium text-green-600">Logins</span>
                  </div>
                  <div className="text-2xl font-bold text-green-700 mt-1">
                    {logs.filter(log => log.action === 'admin_login').length}
                  </div>
                </div>
                
                <div className="bg-purple-50 rounded-lg p-4">
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                    </svg>
                    <span className="text-sm font-medium text-purple-600">Updates</span>
                  </div>
                  <div className="text-2xl font-bold text-purple-700 mt-1">
                    {logs.filter(log => log.action.includes('update') || log.action.includes('edit')).length}
                  </div>
                </div>
                
                <div className="bg-orange-50 rounded-lg p-4">
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm font-medium text-orange-600">Last Activity</span>
                  </div>
                  <div className="text-sm font-medium text-orange-700 mt-1">
                    {logs.length > 0 ? formatRelativeTime(logs[0].timestamp) : 'N/A'}
                  </div>
                </div>
              </div>

              {/* Activity Timeline */}
              <div className="space-y-3">
                {logs.map((log, index) => {
                  // Debug logging to catch object rendering issues
                  console.log('Rendering log:', index, 'log object:', log);
                  if (log.details && typeof log.details === 'object') {
                    console.warn('Object details detected:', log.details);
                  }
                  
                  const activityConfig = activityTypes[log.action] || {
                    icon: <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" /></svg>,
                    color: 'text-gray-600 bg-gray-50',
                    label: log.action
                  };

                  return (
                    <div key={index} className="flex gap-4 p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${activityConfig.color}`}>
                        {activityConfig.icon}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-medium text-gray-800">
                              {activityConfig.label}
                            </h3>
                            {log.details && (
                              <p className="text-sm text-gray-600 mt-1">
                                {typeof log.details === 'object' && log.details !== null 
                                  ? JSON.stringify(log.details) 
                                  : String(log.details)}
                              </p>
                            )}
                            {log.metadata && Object.keys(log.metadata).length > 0 && (
                              <div className="mt-2 text-xs text-gray-500">
                                {Object.entries(log.metadata).map(([key, value]) => {
                                  // Debug logging to catch object rendering issues
                                  if (typeof value === 'object' && value !== null) {
                                    console.warn(`[ACTIVITY LOGS] Object value detected for key "${key}":`, value);
                                  }
                                  
                                  return (
                                    <span key={key} className="inline-block mr-3">
                                      <span className="font-medium">{key}:</span> {
                                        typeof value === 'object' && value !== null 
                                          ? JSON.stringify(value)
                                          : String(value)
                                      }
                                    </span>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                          
                          <div className="text-right text-sm text-gray-500 ml-4">
                            <div>{formatRelativeTime(log.timestamp)}</div>
                            <div className="text-xs">
                              {new Date(log.timestamp).toLocaleString()}
                            </div>
                            {log.ipAddress && (
                              <div className="text-xs font-mono">
                                {log.ipAddress}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-4 bg-gray-50">
          <div className="flex justify-between items-center text-sm text-gray-600">
            <span>
              {logs.length > 0 && `Showing ${logs.length} activities`}
            </span>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminActivityLogs;
