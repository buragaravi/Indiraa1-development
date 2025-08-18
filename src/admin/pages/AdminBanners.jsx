import React, { useState, useEffect } from 'react';
import { useAdminPermission } from '../context/AdminPermissionContext';
import PermissionButton from '../components/PermissionButton';
import { EmptyIcon } from '../components/AdminIcons';
import BannerForm from '../components/BannerForm';
import BannerList from '../components/BannerList';

const AdminBanners = () => {
  const { hasModuleAccess } = useAdminPermission();
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('priority');
  const [showForm, setShowForm] = useState(false);
  const [selectedBanner, setSelectedBanner] = useState(null);
  const [formLoading, setFormLoading] = useState(false);

  // API Base URL - using the correct backend port
  const API_BASE_URL = 'https://indiraa1-backend.onrender.com/api';

  // Check module access after all hooks
  if (!hasModuleAccess('banners')) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100">
        <div className="text-center p-8 rounded-3xl shadow-soft bg-white/70 backdrop-blur-sm">
          <EmptyIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-4 text-gray-800">Access Denied</h1>
          <p className="text-gray-600">You don't have permission to access banner management.</p>
        </div>
      </div>
    );
  }

  // Helper function for authenticated requests
  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found');
    }
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  };

  const getAuthHeadersForFormData = () => {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found');
    }
    return {
      'Authorization': `Bearer ${token}`
      // Don't set Content-Type for FormData, let browser set it
    };
  };

  // Fetch banners from API
  const fetchBanners = async () => {
    try {
      setLoading(true);
      setError(''); // Clear previous errors
      
      // Get auth token
      const token = localStorage.getItem('token');
      if (!token) {
        setError('❌ Authentication required. Please login again.');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/banners`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.status === 401) {
        setError('❌ Authentication expired. Please login again.');
        // Clear invalid token
        localStorage.removeItem('token');
        return;
      }
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: Failed to fetch banners`);
      }
      
      const data = await response.json();
      console.log('API Response:', data); // Debug log
      
      // Ensure data is in the expected format
      if (Array.isArray(data)) {
        setBanners(data);
      } else if (data && Array.isArray(data.banners)) {
        // Handle case where data is wrapped in an object
        setBanners(data.banners);
      } else if (data && data.success && Array.isArray(data.data)) {
        // Handle case where data is in success response format
        setBanners(data.data);
      } else {
        console.warn('Unexpected API response format:', data);
        setBanners([]); // Default to empty array
      }
    } catch (err) {
      console.error('Error fetching banners:', err);
      
      // Provide more user-friendly error messages
      if (err.message.includes('Failed to fetch') || err.name === 'TypeError') {
        setError('❌ Cannot connect to server. Please ensure the backend is running on port 5001.');
      } else if (err.message.includes('HTTP 404')) {
        setError('❌ Banner API endpoint not found. Please check the server configuration.');
      } else if (err.message.includes('HTTP 500')) {
        setError('❌ Server error occurred. Please check the backend logs.');
      } else {
        setError(`❌ Error: ${err.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  // Create or update banner
  const handleSubmitBanner = async (formData) => {
    try {
      setFormLoading(true);
      const url = selectedBanner 
        ? `${API_BASE_URL}/banners/${selectedBanner._id}`
        : `${API_BASE_URL}/banners`;
      
      const method = selectedBanner ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: getAuthHeadersForFormData(),
        body: formData, // FormData object with image and other fields
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save banner');
      }

      const savedBanner = await response.json();
      
      if (selectedBanner) {
        setBanners(prev => prev.map(b => 
          b._id === selectedBanner._id ? savedBanner : b
        ));
      } else {
        setBanners(prev => [...prev, savedBanner]);
      }

      setShowForm(false);
      setSelectedBanner(null);
    } catch (err) {
      setError('Failed to save banner: ' + err.message);
      console.error('Error saving banner:', err);
    } finally {
      setFormLoading(false);
    }
  };

  // Delete banner
  const handleDeleteBanner = async (bannerId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/banners/${bannerId}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Failed to delete banner');
      }

      setBanners(prev => prev.filter(b => b._id !== bannerId));
    } catch (err) {
      setError('Failed to delete banner: ' + err.message);
      console.error('Error deleting banner:', err);
    }
  };

  // Toggle banner status
  const handleToggleStatus = async (bannerId, isActive) => {
    try {
      const response = await fetch(`${API_BASE_URL}/banners/${bannerId}/status`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({ isActive }),
      });

      if (!response.ok) {
        throw new Error('Failed to update banner status');
      }

      const updatedBanner = await response.json();
      setBanners(prev => prev.map(b => 
        b._id === bannerId ? updatedBanner : b
      ));
    } catch (err) {
      setError('Failed to update banner status: ' + err.message);
      console.error('Error updating banner status:', err);
    }
  };

  // Reorder banners
  const handleReorder = async (fromIndex, toIndex) => {
    try {
      // Optimistically update UI
      const newBanners = [...banners];
      const [movedBanner] = newBanners.splice(fromIndex, 1);
      newBanners.splice(toIndex, 0, movedBanner);
      
      // Update priorities
      const updatedBanners = newBanners.map((banner, index) => ({
        ...banner,
        priority: index
      }));
      
      setBanners(updatedBanners);

      // Send to API
      const response = await fetch(`${API_BASE_URL}/banners/reorder`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          bannerIds: updatedBanners.map(b => b._id)
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to reorder banners');
        // Revert on error
        fetchBanners();
      }
    } catch (err) {
      setError('Failed to reorder banners: ' + err.message);
      console.error('Error reordering banners:', err);
      // Revert changes
      fetchBanners();
    }
  };

  // Bulk operations
  const handleBulkDelete = async (bannerIds) => {
    try {
      const response = await fetch(`${API_BASE_URL}/banners/bulk`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
        body: JSON.stringify({ bannerIds }),
      });

      if (!response.ok) {
        throw new Error('Failed to delete banners');
      }

      setBanners(prev => prev.filter(b => !bannerIds.includes(b._id)));
    } catch (err) {
      setError('Failed to delete banners: ' + err.message);
      console.error('Error bulk deleting banners:', err);
    }
  };

  const handleBulkToggleStatus = async (bannerIds, isActive) => {
    try {
      const response = await fetch(`${API_BASE_URL}/banners/bulk-status`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({ bannerIds, isActive }),
      });

      if (!response.ok) {
        throw new Error('Failed to update banner status');
      }

      const updatedBanners = await response.json();
      setBanners(prev => prev.map(banner => {
        const updated = updatedBanners.find(u => u._id === banner._id);
        return updated || banner;
      }));
    } catch (err) {
      setError('Failed to update banner status: ' + err.message);
      console.error('Error bulk updating banner status:', err);
    }
  };

  // Edit banner
  const handleEditBanner = (banner) => {
    setSelectedBanner(banner);
    setShowForm(true);
  };

  // Filter and sort banners - ensure banners is always an array
  const filteredBanners = (Array.isArray(banners) ? banners : []).filter(banner => {
    // Safely handle potential undefined values
    const title = banner?.title || '';
    const subtitle = banner?.subtitle || '';
    
    const matchesSearch = title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         subtitle.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'active' && banner?.isActive) ||
                         (statusFilter === 'inactive' && !banner?.isActive);
    return matchesSearch && matchesStatus;
  });

  const sortedBanners = [...filteredBanners].sort((a, b) => {
    switch (sortBy) {
      case 'priority':
        return a.priority - b.priority;
      case 'title':
        return a.title.localeCompare(b.title);
      case 'views':
        return (b.viewCount || 0) - (a.viewCount || 0);
      case 'created':
        return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
      default:
        return 0;
    }
  });

  if (showForm) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <BannerForm
          banner={selectedBanner}
          onSubmit={handleSubmitBanner}
          onCancel={() => {
            setShowForm(false);
            setSelectedBanner(null);
          }}
          isLoading={formLoading}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full p-4 sm:p-6 lg:p-8">
      <div className=" mx-auto">
        {/* Error Display */}
        {error && (
          <div className="mb-6 bg-red-50/80 backdrop-blur-sm border border-red-200/50 rounded-2xl p-4 shadow-lg shadow-red-100/50">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-3 flex-1">
                <p className="text-sm text-red-700 font-medium">{error}</p>
              </div>
              <button
                onClick={() => setError('')}
                className="ml-auto flex-shrink-0 text-red-400 hover:text-red-600 transition-colors duration-200"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center mb-6 bg-white p-5 lg:p-6 rounded-2xl shadow-lg border border-green-100">
          <div className="mb-4 lg:mb-0">
            <h1 className="text-xl lg:text-2xl font-bold text-green-800 mb-2">
              Banner Management
            </h1>
            <p className="text-green-600 text-sm font-medium">Create stunning hero banners for your homepage</p>
          </div>
          <PermissionButton
            module="banners"
            action="create"
            onClick={() => {
              setSelectedBanner(null);
              setShowForm(true);
            }}
            className="group bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl transition-all duration-300 font-semibold flex items-center gap-3 shadow-md hover:shadow-lg transform hover:scale-105"
            disabledTooltip="You don't have permission to create banners"
          >
            <svg className="h-5 w-5 group-hover:rotate-90 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Create Banner
          </PermissionButton>
        </div>

        {/* Analytics Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="group bg-white p-5 rounded-xl shadow-md border border-green-100 hover:shadow-lg hover:bg-green-50 transition-all duration-300 transform hover:scale-105">
            <div className="flex items-center">
              <div className="p-3 bg-green-500 rounded-xl shadow-md group-hover:shadow-lg transition-all duration-300">
                <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-xs font-semibold text-green-600 mb-1">Total Banners</p>
                <p className="text-lg font-bold text-green-800">
                  {Array.isArray(banners) ? banners.length : 0}
                </p>
              </div>
            </div>
          </div>

          <div className="group bg-white p-5 rounded-xl shadow-md border border-green-100 hover:shadow-lg hover:bg-green-50 transition-all duration-300 transform hover:scale-105">
            <div className="flex items-center">
              <div className="p-3 bg-green-600 rounded-xl shadow-md group-hover:shadow-lg transition-all duration-300">
                <svg className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-xs font-semibold text-green-600 mb-1">Active Banners</p>
                <p className="text-lg font-bold text-green-800">
                  {Array.isArray(banners) ? banners.filter(b => b.isActive).length : 0}
                </p>
              </div>
            </div>
          </div>

          <div className="group bg-white p-5 rounded-xl shadow-md border border-green-100 hover:shadow-lg hover:bg-green-50 transition-all duration-300 transform hover:scale-105">
            <div className="flex items-center">
              <div className="p-3 bg-green-700 rounded-xl shadow-md group-hover:shadow-lg transition-all duration-300">
                <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-xs font-semibold text-green-600 mb-1">Total Views</p>
                <p className="text-lg font-bold text-green-800">
                  {Array.isArray(banners) ? banners.reduce((sum, b) => sum + (b.viewCount || 0), 0).toLocaleString() : 0}
                </p>
              </div>
            </div>
          </div>

          <div className="group bg-white p-5 rounded-xl shadow-md border border-green-100 hover:shadow-lg hover:bg-green-50 transition-all duration-300 transform hover:scale-105">
            <div className="flex items-center">
              <div className="p-3 bg-green-800 rounded-xl shadow-md group-hover:shadow-lg transition-all duration-300">
                <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-xs font-semibold text-green-600 mb-1">Total Clicks</p>
                <p className="text-lg font-bold text-green-800">
                  {Array.isArray(banners) ? banners.reduce((sum, b) => sum + (b.clickCount || 0), 0).toLocaleString() : 0}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white/60 backdrop-blur-md p-6 rounded-2xl shadow-lg border border-white/20 mb-8">
          <div className="flex flex-wrap gap-4 items-center">
            {/* Search */}
            <div className="flex-1 min-w-64">
              <div className="relative group">
                <input
                  type="text"
                  placeholder="Search banners..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-gray-200/50 rounded-2xl focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all duration-300 bg-white/50 backdrop-blur-sm group-hover:bg-white/80"
                />
                <svg className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 group-hover:text-emerald-500 transition-colors duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>

            {/* Status Filter */}
            <div className="flex gap-2">
              {['all', 'active', 'inactive'].map(status => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-6 py-3 rounded-2xl text-sm font-semibold transition-all duration-300 transform hover:scale-105 ${
                    statusFilter === status
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg'
                      : 'bg-white/50 text-gray-600 hover:bg-white/80 hover:shadow-md'
                  }`}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </button>
              ))}
            </div>

            {/* Sort By */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-6 py-3 border border-gray-200/50 rounded-2xl focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all duration-300 bg-white/50 backdrop-blur-sm hover:bg-white/80"
            >
              <option value="priority">Sort by Priority</option>
              <option value="title">Sort by Title</option>
              <option value="views">Sort by Views</option>
              <option value="created">Sort by Created Date</option>
            </select>
          </div>
        </div>

        {/* Banners List */}
        <div className="bg-white/60 backdrop-blur-md rounded-2xl shadow-lg border border-white/20 overflow-hidden">
          <div className="p-6">
            <BannerList
              banners={sortedBanners}
              onEdit={handleEditBanner}
              onDelete={handleDeleteBanner}
              onToggleStatus={handleToggleStatus}
              onReorder={handleReorder}
              onBulkDelete={handleBulkDelete}
              onBulkToggleStatus={handleBulkToggleStatus}
              loading={loading}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminBanners;
