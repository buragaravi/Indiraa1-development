import React, { useState, useEffect } from 'react';
import { 
  FaChartBar, 
  FaSpinner, 
  FaDownload, 
  FaFilter,
  FaBoxOpen,
  FaDollarSign,
  FaClock,
  FaPercentage,
  FaArrowUp,
  FaArrowDown,
  FaMinus
} from 'react-icons/fa';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const ReturnAnalyticsDashboard = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    period: 'month',
    category: '',
    status: ''
  });

  // Fetch analytics data
  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError('');
      
      const token = localStorage.getItem('adminToken');
      const queryParams = new URLSearchParams(filters);

      const response = await fetch(`${API_URL}/api/admin/analytics/returns?${queryParams}`, {
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

  useEffect(() => {
    fetchAnalytics();
  }, [filters]);

  // Helper functions
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const formatPercent = (value) => {
    return `${Math.round(value * 100)}%`;
  };

  const getTrendIcon = (current, previous) => {
    if (current > previous) return <FaArrowUp className="text-green-500" />;
    if (current < previous) return <FaArrowDown className="text-red-500" />;
    return <FaMinus className="text-gray-500" />;
  };

  const getTrendColor = (current, previous) => {
    if (current > previous) return 'text-green-600';
    if (current < previous) return 'text-red-600';
    return 'text-gray-600';
  };

  // Export functionality
  const exportData = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const queryParams = new URLSearchParams(filters);

      const response = await fetch(`${API_URL}/api/admin/analytics/returns/export?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to export data');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `return-analytics-${filters.startDate}-to-${filters.endDate}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
    } catch (error) {
      console.error('Error exporting data:', error);
      alert(`Failed to export data: ${error.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 py-4 sm:py-6 lg:py-8">
      <div className="w-full max-w-none px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16">
        {/* Header */}
        <div className="mb-4 sm:mb-6 lg:mb-8">
          <h1 className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-bold text-gray-800 flex items-center">
            <div className="w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 xl:w-16 xl:h-16 bg-gradient-to-br from-emerald-500 via-green-500 to-teal-500 rounded-2xl flex items-center justify-center shadow-xl shadow-emerald-200 mr-3 sm:mr-4">
              <FaChartBar className="text-white text-sm sm:text-base lg:text-lg xl:text-xl" />
            </div>
            Return Analytics Dashboard
          </h1>
          <p className="mt-1 sm:mt-2 text-sm sm:text-base lg:text-lg text-gray-600">
            Comprehensive insights into return and refund patterns
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl sm:rounded-3xl shadow-xl shadow-emerald-100/50 border border-white/50 p-4 sm:p-6 mb-4 sm:mb-6 lg:mb-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                Start Date
              </label>
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) => setFilters(prev => ({ ...prev, startDate: e.target.value }))}
                className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-emerald-200 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm sm:text-base bg-white/80 backdrop-blur-sm shadow-md"
              />
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                End Date
              </label>
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) => setFilters(prev => ({ ...prev, endDate: e.target.value }))}
                className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-emerald-200 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm sm:text-base bg-white/80 backdrop-blur-sm shadow-md"
              />
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                Period
              </label>
              <select
                value={filters.period}
                onChange={(e) => setFilters(prev => ({ ...prev, period: e.target.value }))}
                className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-emerald-200 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm sm:text-base bg-white/80 backdrop-blur-sm shadow-md"
              >
                <option value="day">Daily</option>
                <option value="week">Weekly</option>
                <option value="month">Monthly</option>
                <option value="quarter">Quarterly</option>
                <option value="year">Yearly</option>
              </select>
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                Status
              </label>
              <select
                value={filters.status}
                onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-emerald-200 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm sm:text-base bg-white/80 backdrop-blur-sm shadow-md"
              >
                <option value="">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
                <option value="processed">Processed</option>
                <option value="refunded">Refunded</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={exportData}
                className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-lg sm:rounded-xl hover:from-emerald-600 hover:to-green-700 transition-all duration-300 flex items-center justify-center text-sm sm:text-base font-medium"
              >
                <FaDownload className="mr-2" />
                Export
              </button>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800">{error}</p>
            <button
              className="mt-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              onClick={fetchAnalytics}
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
          <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Total Returns */}
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl sm:rounded-3xl shadow-xl shadow-emerald-100/50 border border-white/50 p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-gray-600">Total Returns</p>
                    <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">
                      {analytics.summary?.totalReturns || 0}
                    </p>
                    {analytics.summary?.previousPeriod && (
                      <div className="flex items-center mt-1">
                        {getTrendIcon(analytics.summary.totalReturns, analytics.summary.previousPeriod.totalReturns)}
                        <span className={`ml-1 text-xs sm:text-sm ${getTrendColor(analytics.summary.totalReturns, analytics.summary.previousPeriod.totalReturns)}`}>
                          {Math.abs(((analytics.summary.totalReturns - analytics.summary.previousPeriod.totalReturns) / analytics.summary.previousPeriod.totalReturns) * 100).toFixed(1)}%
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg shadow-blue-200">
                    <FaBoxOpen className="text-white text-sm sm:text-base" />
                  </div>
                </div>
              </div>

              {/* Total Refund Amount */}
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl sm:rounded-3xl shadow-xl shadow-emerald-100/50 border border-white/50 p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-gray-600">Total Refunds</p>
                    <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">
                      {formatCurrency(analytics.summary?.totalRefundAmount || 0)}
                    </p>
                    {analytics.summary?.previousPeriod && (
                      <div className="flex items-center mt-1">
                        {getTrendIcon(analytics.summary.totalRefundAmount, analytics.summary.previousPeriod.totalRefundAmount)}
                        <span className={`ml-1 text-xs sm:text-sm ${getTrendColor(analytics.summary.totalRefundAmount, analytics.summary.previousPeriod.totalRefundAmount)}`}>
                          {Math.abs(((analytics.summary.totalRefundAmount - analytics.summary.previousPeriod.totalRefundAmount) / analytics.summary.previousPeriod.totalRefundAmount) * 100).toFixed(1)}%
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-green-500 to-teal-500 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg shadow-green-200">
                    <FaDollarSign className="text-white text-sm sm:text-base" />
                  </div>
                </div>
              </div>

              {/* Average Processing Time */}
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl sm:rounded-3xl shadow-xl shadow-emerald-100/50 border border-white/50 p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-gray-600">Avg Processing Time</p>
                    <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">
                      {analytics.summary?.averageProcessingTime || 0} days
                    </p>
                    {analytics.summary?.previousPeriod && (
                      <div className="flex items-center mt-1">
                        {getTrendIcon(analytics.summary.averageProcessingTime, analytics.summary.previousPeriod.averageProcessingTime)}
                        <span className={`ml-1 text-xs sm:text-sm ${getTrendColor(analytics.summary.averageProcessingTime, analytics.summary.previousPeriod.averageProcessingTime)}`}>
                          {Math.abs(((analytics.summary.averageProcessingTime - analytics.summary.previousPeriod.averageProcessingTime) / analytics.summary.previousPeriod.averageProcessingTime) * 100).toFixed(1)}%
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg shadow-yellow-200">
                    <FaClock className="text-white text-sm sm:text-base" />
                  </div>
                </div>
              </div>

              {/* Return Rate */}
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl sm:rounded-3xl shadow-xl shadow-emerald-100/50 border border-white/50 p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-gray-600">Return Rate</p>
                    <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">
                      {formatPercent(analytics.summary?.returnRate || 0)}
                    </p>
                    {analytics.summary?.previousPeriod && (
                      <div className="flex items-center mt-1">
                        {getTrendIcon(analytics.summary.returnRate, analytics.summary.previousPeriod.returnRate)}
                        <span className={`ml-1 text-xs sm:text-sm ${getTrendColor(analytics.summary.returnRate, analytics.summary.previousPeriod.returnRate)}`}>
                          {Math.abs(((analytics.summary.returnRate - analytics.summary.previousPeriod.returnRate) / analytics.summary.previousPeriod.returnRate) * 100).toFixed(1)}%
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg shadow-purple-200">
                    <FaPercentage className="text-white text-sm sm:text-base" />
                  </div>
                </div>
              </div>
            </div>

            {/* Charts and Detailed Analytics */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Return Reasons */}
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl sm:rounded-3xl shadow-xl shadow-emerald-100/50 border border-white/50 p-4 sm:p-6">
                <h3 className="text-base sm:text-lg lg:text-xl font-semibold text-gray-900 mb-4">Top Return Reasons</h3>
                <div className="space-y-4">
                  {analytics.returnReasons?.map((reason, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <span className="text-xs sm:text-sm text-gray-600 capitalize">{reason.reason}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-gradient-to-r from-emerald-500 to-green-600 h-2 rounded-full" 
                            style={{ width: `${(reason.count / analytics.summary.totalReturns) * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-xs sm:text-sm font-medium text-gray-900">{reason.count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Status Distribution */}
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl sm:rounded-3xl shadow-xl shadow-emerald-100/50 border border-white/50 p-4 sm:p-6">
                <h3 className="text-base sm:text-lg lg:text-xl font-semibold text-gray-900 mb-4">Status Distribution</h3>
                <div className="space-y-4">
                  {analytics.statusDistribution?.map((status, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <span className="text-xs sm:text-sm text-gray-600 capitalize">{status.status}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2 rounded-full" 
                            style={{ width: `${(status.count / analytics.summary.totalReturns) * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-xs sm:text-sm font-medium text-gray-900">{status.count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Additional Insights */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl sm:rounded-3xl shadow-xl shadow-emerald-100/50 border border-white/50 p-4 sm:p-6">
              <h3 className="text-base sm:text-lg lg:text-xl font-semibold text-gray-900 mb-4">Key Insights</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-sm sm:text-base font-medium text-gray-900 mb-2">Trends</h4>
                  <ul className="space-y-1 text-xs sm:text-sm text-gray-600">
                    <li>• Return rate has {analytics.insights?.returnTrend || 'remained stable'} compared to last period</li>
                    <li>• Most returns are due to {analytics.insights?.topReason || 'quality issues'}</li>
                    <li>• Average processing time is {analytics.insights?.processingTrend || 'improving'}</li>
                  </ul>
                </div>
                <div>
                  <h4 className="text-sm sm:text-base font-medium text-gray-900 mb-2">Recommendations</h4>
                  <ul className="space-y-1 text-xs sm:text-sm text-gray-600">
                    <li>• Focus on improving {analytics.insights?.improvementArea || 'product quality'}</li>
                    <li>• Consider automated processing for {analytics.insights?.automationOpportunity || 'simple returns'}</li>
                    <li>• Enhance customer communication during {analytics.insights?.communicationArea || 'processing'}</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl sm:rounded-3xl shadow-xl shadow-emerald-100/50 border border-white/50 p-8 text-center">
            <FaChartBar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-600">No analytics data available</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReturnAnalyticsDashboard;
