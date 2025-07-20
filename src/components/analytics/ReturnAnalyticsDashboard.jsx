import React, { useState, useEffect } from 'react';
import { 
  FaChartBar, 
  FaChartLine, 
  FaChartPie,
  FaDownload,
  FaFilter,
  FaSpinner,
  FaBoxOpen,
  FaMoneyBill,
  FaPercent,
  FaClock,
  FaUsers,
  FaArrowUp,
  FaArrowDown,
  FaEquals
} from 'react-icons/fa';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Area,
  AreaChart
} from 'recharts';

const ReturnAnalyticsDashboard = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Last 30 days
    endDate: new Date().toISOString().split('T')[0],
    period: 'daily',
    category: 'all'
  });

  const API_URL = 'http://localhost:5001';

  // Get admin token
  const getToken = () => {
    return localStorage.getItem('adminToken') || localStorage.getItem('subAdminToken') || localStorage.getItem('token');
  };

  // Fetch analytics data
  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const token = getToken();
      
      if (!token) {
        throw new Error('Admin authentication required');
      }

      const queryParams = new URLSearchParams(filters);
      const response = await fetch(`${API_URL}/api/return-analytics/overview?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch analytics data');
      }

      const data = await response.json();
      setAnalytics(data.data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Download report
  const downloadReport = async (format = 'pdf') => {
    try {
      const token = getToken();
      const queryParams = new URLSearchParams({ ...filters, format });
      
      const response = await fetch(`${API_URL}/api/return-analytics/report?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to download report');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `return-analytics-${new Date().toISOString().split('T')[0]}.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      alert(`Failed to download report: ${error.message}`);
    }
  };

  // Chart colors
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  // Format percentage
  const formatPercent = (value) => {
    return `${value.toFixed(1)}%`;
  };

  // Get trend icon
  const getTrendIcon = (current, previous) => {
    if (current > previous) return <FaArrowUp className="text-green-500" />;
    if (current < previous) return <FaArrowDown className="text-red-500" />;
    return <FaEquals className="text-gray-500" />;
  };

  // Get trend color
  const getTrendColor = (current, previous) => {
    if (current > previous) return 'text-green-600';
    if (current < previous) return 'text-red-600';
    return 'text-gray-600';
  };

  useEffect(() => {
    fetchAnalytics();
  }, [filters]);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center">
          <FaChartBar className="mr-3 text-blue-600" />
          Return Analytics Dashboard
        </h1>
        <p className="mt-1 text-gray-600">
          Comprehensive insights into return and refund patterns
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Start Date
            </label>
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => setFilters(prev => ({ ...prev, startDate: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              End Date
            </label>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => setFilters(prev => ({ ...prev, endDate: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Period
            </label>
            <select
              value={filters.period}
              onChange={(e) => setFilters(prev => ({ ...prev, period: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            <select
              value={filters.category}
              onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Categories</option>
              <option value="electronics">Electronics</option>
              <option value="clothing">Clothing</option>
              <option value="home">Home & Garden</option>
              <option value="books">Books</option>
            </select>
          </div>

          <div className="flex items-end space-x-2">
            <button
              onClick={fetchAnalytics}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center"
            >
              <FaFilter className="mr-2" />
              Apply
            </button>
            <button
              onClick={() => downloadReport('pdf')}
              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 flex items-center"
            >
              <FaDownload className="mr-2" />
              PDF
            </button>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-800">{error}</p>
          <button 
            onClick={() => {
              setError('');
              fetchAnalytics();
            }}
            className="mt-2 text-red-600 hover:text-red-800 underline"
          >
            Try again
          </button>
        </div>
      )}

      {/* Loading State */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <FaSpinner className="animate-spin text-2xl text-gray-400 mr-2" />
          <span className="text-gray-600">Loading analytics data...</span>
        </div>
      ) : analytics ? (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Total Returns */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Returns</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {analytics.summary?.totalReturns || 0}
                  </p>
                  {analytics.summary?.previousPeriod && (
                    <div className="flex items-center mt-1">
                      {getTrendIcon(analytics.summary.totalReturns, analytics.summary.previousPeriod.totalReturns)}
                      <span className={`ml-1 text-sm ${getTrendColor(analytics.summary.totalReturns, analytics.summary.previousPeriod.totalReturns)}`}>
                        {Math.abs(((analytics.summary.totalReturns - analytics.summary.previousPeriod.totalReturns) / analytics.summary.previousPeriod.totalReturns) * 100).toFixed(1)}%
                      </span>
                    </div>
                  )}
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <FaBoxOpen className="text-blue-600 text-xl" />
                </div>
              </div>
            </div>

            {/* Total Refund Amount */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Refunds</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(analytics.summary?.totalRefundAmount || 0)}
                  </p>
                  {analytics.summary?.previousPeriod && (
                    <div className="flex items-center mt-1">
                      {getTrendIcon(analytics.summary.totalRefundAmount, analytics.summary.previousPeriod.totalRefundAmount)}
                      <span className={`ml-1 text-sm ${getTrendColor(analytics.summary.totalRefundAmount, analytics.summary.previousPeriod.totalRefundAmount)}`}>
                        {Math.abs(((analytics.summary.totalRefundAmount - analytics.summary.previousPeriod.totalRefundAmount) / analytics.summary.previousPeriod.totalRefundAmount) * 100).toFixed(1)}%
                      </span>
                    </div>
                  )}
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <FaMoneyBill className="text-green-600 text-xl" />
                </div>
              </div>
            </div>

            {/* Return Rate */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Return Rate</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatPercent(analytics.summary?.returnRate || 0)}
                  </p>
                  {analytics.summary?.previousPeriod && (
                    <div className="flex items-center mt-1">
                      {getTrendIcon(analytics.summary.returnRate, analytics.summary.previousPeriod.returnRate)}
                      <span className={`ml-1 text-sm ${getTrendColor(analytics.summary.returnRate, analytics.summary.previousPeriod.returnRate)}`}>
                        {Math.abs(analytics.summary.returnRate - analytics.summary.previousPeriod.returnRate).toFixed(1)}pp
                      </span>
                    </div>
                  )}
                </div>
                <div className="p-3 bg-yellow-100 rounded-full">
                  <FaPercent className="text-yellow-600 text-xl" />
                </div>
              </div>
            </div>

            {/* Avg Processing Time */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Avg Processing</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {analytics.summary?.avgProcessingTime || 0}d
                  </p>
                  {analytics.summary?.previousPeriod && (
                    <div className="flex items-center mt-1">
                      {getTrendIcon(analytics.summary.previousPeriod.avgProcessingTime, analytics.summary.avgProcessingTime)}
                      <span className={`ml-1 text-sm ${getTrendColor(analytics.summary.previousPeriod.avgProcessingTime, analytics.summary.avgProcessingTime)}`}>
                        {Math.abs(analytics.summary.avgProcessingTime - analytics.summary.previousPeriod.avgProcessingTime).toFixed(1)}d
                      </span>
                    </div>
                  )}
                </div>
                <div className="p-3 bg-purple-100 rounded-full">
                  <FaClock className="text-purple-600 text-xl" />
                </div>
              </div>
            </div>
          </div>

          {/* Charts Row 1 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Returns Trend Chart */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <FaChartLine className="mr-2 text-blue-600" />
                Returns Trend
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={analytics.trends?.daily || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value, name) => [
                      name === 'returns' ? value : formatCurrency(value),
                      name === 'returns' ? 'Returns' : 'Refund Amount'
                    ]}
                  />
                  <Legend />
                  <Area type="monotone" dataKey="returns" stackId="1" stroke="#0088FE" fill="#0088FE" />
                  <Area type="monotone" dataKey="refundAmount" stackId="2" stroke="#00C49F" fill="#00C49F" />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Return Reasons Pie Chart */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <FaChartPie className="mr-2 text-green-600" />
                Return Reasons
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={analytics.returnReasons || []}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {(analytics.returnReasons || []).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Charts Row 2 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Status Distribution */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <FaChartBar className="mr-2 text-purple-600" />
                Return Status Distribution
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analytics.statusDistribution || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="status" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Refund Amount by Category */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <FaChartBar className="mr-2 text-orange-600" />
                Refunds by Category
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analytics.categoryBreakdown || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="category" />
                  <YAxis />
                  <Tooltip formatter={(value) => formatCurrency(value)} />
                  <Bar dataKey="refundAmount" fill="#FF8042" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Performance Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Processing Efficiency */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Processing Efficiency</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Within 24h</span>
                  <span className="font-semibold text-green-600">
                    {analytics.efficiency?.within24h || 0}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Within 48h</span>
                  <span className="font-semibold text-yellow-600">
                    {analytics.efficiency?.within48h || 0}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Over 48h</span>
                  <span className="font-semibold text-red-600">
                    {analytics.efficiency?.over48h || 0}%
                  </span>
                </div>
              </div>
            </div>

            {/* Customer Satisfaction */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Customer Satisfaction</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Satisfied</span>
                  <span className="font-semibold text-green-600">
                    {analytics.satisfaction?.satisfied || 0}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Neutral</span>
                  <span className="font-semibold text-yellow-600">
                    {analytics.satisfaction?.neutral || 0}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Dissatisfied</span>
                  <span className="font-semibold text-red-600">
                    {analytics.satisfaction?.dissatisfied || 0}%
                  </span>
                </div>
              </div>
            </div>

            {/* Top Return Products */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Return Products</h3>
              <div className="space-y-3">
                {(analytics.topReturnProducts || []).slice(0, 5).map((product, index) => (
                  <div key={index} className="flex justify-between">
                    <span className="text-gray-600 truncate">{product.name}</span>
                    <span className="font-semibold text-blue-600">
                      {product.returnCount}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Additional Insights */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Key Insights</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Trends</h4>
                <ul className="space-y-1 text-sm text-gray-600">
                  <li>• Return rate has {analytics.insights?.returnTrend || 'remained stable'} compared to last period</li>
                  <li>• Most returns are due to {analytics.insights?.topReason || 'quality issues'}</li>
                  <li>• Average processing time is {analytics.insights?.processingTrend || 'improving'}</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Recommendations</h4>
                <ul className="space-y-1 text-sm text-gray-600">
                  <li>• Focus on improving {analytics.insights?.improvementArea || 'product quality'}</li>
                  <li>• Consider automated processing for {analytics.insights?.automationOpportunity || 'simple returns'}</li>
                  <li>• Enhance customer communication during {analytics.insights?.communicationArea || 'processing'}</li>
                </ul>
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <FaChartBar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <p className="text-gray-600">No analytics data available</p>
        </div>
      )}
    </div>
  );
};

export default ReturnAnalyticsDashboard;
