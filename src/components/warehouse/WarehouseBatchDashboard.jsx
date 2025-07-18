import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Package2, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle,
  Clock,
  MapPin,
  Users,
  BarChart3,
  PieChart,
  RefreshCw,
  Search,
  Filter,
  Calendar,
  Eye,
  Edit,
  Download,
  ArrowUpRight,
  ArrowDownRight,
  Activity
} from 'lucide-react';

const WarehouseBatchDashboard = () => {
  const navigate = useNavigate();
  const [analytics, setAnalytics] = useState(null);
  const [batchGroups, setBatchGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    status: '',
    groupType: '',
    location: '',
    search: '',
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });

  // Fetch analytics data
  const fetchAnalytics = async () => {
    try {
      const token = localStorage.getItem('adminToken') || localStorage.getItem('subAdminToken');
      
      const response = await fetch('http://localhost:5001/api/batches/batch-groups/analytics', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch analytics');
      }

      const data = await response.json();
      setAnalytics(data.data);
    } catch (err) {
      console.error('Error fetching analytics:', err);
      setError('Failed to load analytics data');
    }
  };

  // Fetch batch groups
  const fetchBatchGroups = async () => {
    try {
      const token = localStorage.getItem('adminToken') || localStorage.getItem('subAdminToken');
      
      const queryParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) queryParams.append(key, value);
      });

      const response = await fetch(`http://localhost:5001/api/batches/batch-groups?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch batch groups');
      }

      const data = await response.json();
      setBatchGroups(data.data.batchGroups);
    } catch (err) {
      console.error('Error fetching batch groups:', err);
      setError('Failed to load batch groups');
    }
  };

  // Initial data fetch
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchAnalytics(), fetchBatchGroups()]);
      setLoading(false);
    };

    loadData();
  }, []);

  // Refetch batch groups when filters change
  useEffect(() => {
    if (!loading) {
      fetchBatchGroups();
    }
  }, [filters]);

  // Handle filter changes
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1 // Reset to first page when filtering
    }));
  };

  // Format numbers
  const formatNumber = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  // Get status badge color
  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'Active': return 'bg-green-100 text-green-800 border-green-200';
      case 'Expired': return 'bg-red-100 text-red-800 border-red-200';
      case 'Recalled': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'Depleted': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="p-4 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full inline-block mb-4">
            <RefreshCw className="h-8 w-8 animate-spin text-white" />
          </div>
          <p className="text-gray-700 font-semibold">Loading batch analytics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="p-4 bg-gradient-to-r from-red-500 to-pink-600 rounded-full inline-block mb-4">
            <AlertTriangle className="h-12 w-12 text-white" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">Error Loading Dashboard</h3>
          <p className="text-gray-600 mb-4 font-medium">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 transform hover:scale-105 transition-all duration-200"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="bg-white shadow-lg border-b border-indigo-100">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Batch Management Dashboard</h1>
                <p className="text-gray-600 mt-1 text-sm font-medium">Monitor and manage warehouse batch inventory</p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => window.location.reload()}
                  className="inline-flex items-center px-3 py-2 border border-indigo-300 rounded-lg shadow-sm text-sm font-medium text-indigo-700 bg-white hover:bg-indigo-50 transform hover:scale-105 transition-all duration-200"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </button>
                <button className="inline-flex items-center px-3 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 transform hover:scale-105 transition-all duration-200">
                  <Download className="h-4 w-4 mr-2" />
                  Export Report
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full px-4 sm:px-6 lg:px-8 py-6">
        {/* Analytics Overview */}
        {analytics && (
          <>
            {/* Key Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
              <div className="bg-white rounded-xl shadow-lg p-6 transform hover:scale-105 transition-all duration-300 border border-blue-100">
                <div className="flex items-center">
                  <div className="flex-shrink-0 p-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl shadow-lg">
                    <Package2 className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-semibold text-gray-600 uppercase tracking-wider">Total Batch Groups</p>
                    <p className="text-2xl font-bold text-gray-900">{formatNumber(analytics.overview.totalBatchGroups)}</p>
                    <p className="text-xs text-blue-600 flex items-center mt-1 font-medium">
                      <ArrowUpRight className="h-3 w-3 mr-1" />
                      {analytics.overview.recentBatchGroups} new this week
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6 transform hover:scale-105 transition-all duration-300 border border-green-100">
                <div className="flex items-center">
                  <div className="flex-shrink-0 p-3 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl shadow-lg">
                    <CheckCircle className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-semibold text-gray-600 uppercase tracking-wider">Available Items</p>
                    <p className="text-2xl font-bold text-gray-900">{formatNumber(analytics.overview.availableItems)}</p>
                    <p className="text-xs text-green-600 font-medium">
                      {analytics.overview.availabilityRate}% availability rate
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6 transform hover:scale-105 transition-all duration-300 border border-purple-100">
                <div className="flex items-center">
                  <div className="flex-shrink-0 p-3 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl shadow-lg">
                    <TrendingUp className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-semibold text-gray-600 uppercase tracking-wider">Utilization Rate</p>
                    <p className="text-2xl font-bold text-gray-900">{analytics.overview.utilizationRate}%</p>
                    <p className="text-xs text-purple-600 font-medium">
                      {formatNumber(analytics.overview.usedItems)} items used
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6 transform hover:scale-105 transition-all duration-300 border border-orange-100">
                <div className="flex items-center">
                  <div className="flex-shrink-0 p-3 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl shadow-lg">
                    <AlertTriangle className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-semibold text-gray-600 uppercase tracking-wider">Expiring Soon</p>
                    <p className="text-2xl font-bold text-gray-900">{analytics.overview.expiringSoon}</p>
                    <p className="text-xs text-orange-600 font-medium">
                      Next 30 days
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Status, Location, and Supplier Breakdowns - Single Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
              {/* Status Breakdown */}
              <div className="bg-white rounded-xl shadow-lg border border-indigo-100">
                <div className="px-4 py-3 border-b border-indigo-100 bg-gradient-to-r from-indigo-50 to-purple-50">
                  <div className="flex items-center">
                    <div className="p-2 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg mr-2">
                      <PieChart className="h-4 w-4 text-white" />
                    </div>
                    <h3 className="text-sm font-bold text-gray-900">Status Breakdown</h3>
                  </div>
                </div>
                <div className="p-4">
                  <div className="space-y-2">
                    {Object.entries(analytics.breakdowns.status).map(([status, count]) => (
                      <div key={status} className="flex items-center justify-between p-2 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg">
                        <div className="flex items-center">
                          <div className={`w-2 h-2 rounded-full mr-2 ${getStatusBadgeColor(status).split(' ')[0]}`}></div>
                          <span className="text-xs font-medium text-gray-700">{status}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-xs font-semibold text-gray-900">{count}</span>
                          <span className="text-xs text-gray-500 ml-1">
                            ({((count / analytics.overview.totalBatchGroups) * 100).toFixed(0)}%)
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Location Breakdown */}
              <div className="bg-white rounded-xl shadow-lg border border-green-100">
                <div className="px-4 py-3 border-b border-green-100 bg-gradient-to-r from-green-50 to-emerald-50">
                  <div className="flex items-center">
                    <div className="p-2 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg mr-2">
                      <MapPin className="h-4 w-4 text-white" />
                    </div>
                    <h3 className="text-sm font-bold text-gray-900">Location Distribution</h3>
                  </div>
                </div>
                <div className="p-4">
                  <div className="space-y-2">
                    {Object.entries(analytics.breakdowns.location).map(([location, count]) => (
                      <div key={location} className="flex items-center justify-between p-2 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg">
                        <div className="flex items-center">
                          <div className="p-1 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full mr-2">
                            <MapPin className="h-2 w-2 text-white" />
                          </div>
                          <span className="text-xs font-medium text-gray-700">{location}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-xs font-semibold text-gray-900">{count}</span>
                          <span className="text-xs text-gray-500 ml-1">batches</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Supplier Performance */}
              <div className="bg-white rounded-xl shadow-lg border border-purple-100">
                <div className="px-4 py-3 border-b border-purple-100 bg-gradient-to-r from-purple-50 to-pink-50">
                  <div className="flex items-center">
                    <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg mr-2">
                      <Users className="h-4 w-4 text-white" />
                    </div>
                    <h3 className="text-sm font-bold text-gray-900">Top Suppliers</h3>
                  </div>
                </div>
                <div className="p-4">
                  <div className="space-y-2">
                    {Object.entries(analytics.breakdowns.supplier)
                      .sort(([,a], [,b]) => b - a)
                      .slice(0, 4)
                      .map(([supplier, count]) => (
                      <div key={supplier} className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-2 border border-purple-100">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-xs font-medium text-gray-900 truncate">{supplier}</p>
                            <p className="text-xs text-purple-600 font-medium">Supplier</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-semibold text-purple-600">{count}</p>
                            <p className="text-xs text-gray-500">batches</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Batch Groups Table */}
        <div className="bg-white shadow-xl rounded-xl border border-indigo-100">
          <div className="px-6 py-4 border-b border-indigo-100 bg-gradient-to-r from-indigo-50 to-purple-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="p-2 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg mr-3">
                  <Package2 className="h-5 w-5 text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">Batch Groups</h3>
              </div>
              <div className="flex items-center gap-4">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-indigo-400" />
                  <input
                    type="text"
                    placeholder="Search batches..."
                    value={filters.search}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                    className="pl-10 pr-4 py-2 border border-indigo-200 rounded-lg text-sm focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                  />
                </div>

                {/* Status Filter */}
                <select
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  className="px-3 py-2 border border-indigo-200 rounded-lg text-sm focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                >
                  <option value="">All Statuses</option>
                  <option value="Active">Active</option>
                  <option value="Expired">Expired</option>
                  <option value="Recalled">Recalled</option>
                  <option value="Depleted">Depleted</option>
                </select>

                {/* Location Filter */}
                <select
                  value={filters.location}
                  onChange={(e) => handleFilterChange('location', e.target.value)}
                  className="px-3 py-2 border border-indigo-200 rounded-lg text-sm focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                >
                  <option value="">All Locations</option>
                  {analytics && Object.keys(analytics.breakdowns.location).map(location => (
                    <option key={location} value={location}>{location}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gradient-to-r from-indigo-50 to-purple-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Batch Group
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Products
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Stock Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Utilization
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Location
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {batchGroups.map((batchGroup) => (
                    <tr key={batchGroup._id} className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-200">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-bold text-gray-900">{batchGroup.batchGroupNumber}</div>
                          <div className="text-sm text-indigo-600 font-medium">{formatDate(batchGroup.createdAt)}</div>
                          <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full inline-block mt-1">
                            {batchGroup.groupType?.replace('_', ' ')}
                          </div>
                        </div>
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border ${getStatusBadgeColor(batchGroup.status)} shadow-sm`}>
                          {batchGroup.status}
                        </span>
                        {batchGroup.statistics.isExpired && (
                          <div className="text-xs text-red-600 mt-1 font-medium">Expired</div>
                        )}
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="flex items-center bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-2">
                          <div className="p-1 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg mr-2">
                            <Package2 className="h-3 w-3 text-white" />
                          </div>
                          <div>
                            <div className="text-sm font-bold text-gray-900">{batchGroup.statistics.totalProducts} products</div>
                            <div className="text-xs text-blue-600 font-medium">
                              {formatNumber(batchGroup.statistics.totalItems)} total items
                            </div>
                          </div>
                        </div>
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-2">
                          <div className="text-sm font-bold text-gray-900">
                            Available: {formatNumber(batchGroup.statistics.availableItems)}
                          </div>
                          <div className="text-xs text-green-600 font-medium">
                            Allocated: {formatNumber(batchGroup.statistics.allocatedItems)}
                          </div>
                          {batchGroup.statistics.isDepleted && (
                            <div className="text-xs text-red-600 font-medium">Depleted</div>
                          )}
                        </div>
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-2">
                          <div className="flex items-center">
                            <div className="text-sm font-bold text-gray-900">{batchGroup.statistics.utilizationRate}%</div>
                            <div className="ml-2 flex-1">
                              <div className="w-16 bg-gray-200 rounded-full h-2">
                                <div 
                                  className="bg-gradient-to-r from-purple-500 to-pink-600 h-2 rounded-full transition-all duration-300" 
                                  style={{ width: `${batchGroup.statistics.utilizationRate}%` }}
                                ></div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-900 bg-gradient-to-r from-orange-50 to-red-50 rounded-lg p-2">
                          <div className="p-1 bg-gradient-to-r from-orange-500 to-red-600 rounded-lg mr-2">
                            <MapPin className="h-3 w-3 text-white" />
                          </div>
                          <span className="font-medium">{batchGroup.location}</span>
                        </div>
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => navigate(`/sub-admin/warehouse_manager/batches/${batchGroup._id}`)}
                            className="p-2 text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 rounded-lg transition-all duration-200"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button className="p-2 text-purple-600 hover:text-purple-800 hover:bg-purple-50 rounded-lg transition-all duration-200">
                            <Edit className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {batchGroups.length === 0 && (
            <div className="text-center py-16">
              <div className="p-4 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full inline-block mb-4">
                <Package2 className="mx-auto h-12 w-12 text-white" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">No batch groups found</h3>
              <p className="text-gray-600 font-medium">
                {filters.search || filters.status || filters.location ? 
                  'Try adjusting your filters to see more results.' :
                  'No batch groups have been created yet.'
                }
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WarehouseBatchDashboard;
