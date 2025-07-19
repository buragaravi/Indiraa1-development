import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  CreditCard,
  Wallet,
  Package,
  AlertTriangle,
  CheckCircle,
  Clock,
  PieChart,
  BarChart3,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  Download,
  Eye,
  Filter,
  Calendar,
  Users,
  ShoppingCart,
  Target,
  Zap
} from 'lucide-react';

const RevenueAnalyticsDashboard = () => {
  const navigate = useNavigate();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [timeFilter, setTimeFilter] = useState('all'); // all, today, week, month, year
  const [selectedCategory, setSelectedCategory] = useState(null);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError('');
      
      const token = localStorage.getItem('adminToken');
      const response = await fetch('http://localhost:5001/api/revenue-analytics', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch revenue analytics');
      }

      const result = await response.json();
      setAnalytics(result.data);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchAnalytics();
    setRefreshing(false);
  };

  const handleCategoryClick = async (category, filter) => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`http://localhost:5001/api/revenue-analytics/details?category=${category}&filter=${filter}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch category details');
      }

      const result = await response.json();
      setSelectedCategory({ category, filter, data: result.data });
    } catch (err) {
      console.error('Error fetching category details:', err);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount || 0);
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat('en-IN').format(num || 0);
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'delivered': return 'bg-green-100 text-green-800 border-green-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'shipped': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      case 'returned': return 'bg-orange-100 text-orange-800 border-orange-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPercentageChange = (current, previous) => {
    if (!previous) return { value: 0, isPositive: true };
    const change = ((current - previous) / previous) * 100;
    return { value: Math.abs(change).toFixed(1), isPositive: change >= 0 };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="p-4 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full inline-block mb-4">
            <RefreshCw className="h-8 w-8 text-white animate-spin" />
          </div>
          <p className="text-lg text-gray-600 font-medium">Loading Revenue Analytics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="p-4 bg-gradient-to-r from-red-500 to-red-600 rounded-full inline-block mb-4">
            <AlertTriangle className="h-8 w-8 text-white" />
          </div>
          <p className="text-lg text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchAnalytics}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transform hover:scale-105 transition-all duration-200"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Header */}
      <div className="bg-white/90 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl">
                <BarChart3 className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Revenue Analytics Dashboard
                </h1>
                <p className="text-sm text-gray-500">
                  Last updated: {analytics?.lastUpdated ? new Date(analytics.lastUpdated).toLocaleString() : 'Unknown'}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="inline-flex items-center px-3 py-2 border border-blue-300 rounded-lg shadow-sm text-sm font-medium text-blue-700 bg-white hover:bg-blue-50 transform hover:scale-105 transition-all duration-200"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh
              </button>
              <button className="inline-flex items-center px-3 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transform hover:scale-105 transition-all duration-200">
                <Download className="h-4 w-4 mr-2" />
                Export
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Revenue */}
          <div className="bg-white rounded-xl shadow-lg p-6 transform hover:scale-105 transition-all duration-300 border border-blue-100">
            <div className="flex items-center justify-between">
              <div className="flex-shrink-0 p-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl shadow-lg">
                <DollarSign className="h-6 w-6 text-white" />
              </div>
              <div className="flex items-center text-green-600">
                <ArrowUpRight className="h-4 w-4" />
                <span className="text-sm font-medium ml-1">12.5%</span>
              </div>
            </div>
            <div className="mt-4">
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(analytics?.revenue?.summary?.totalRevenue)}
              </p>
              <p className="text-sm font-medium text-gray-500 mt-1">Total Revenue</p>
              <p className="text-xs text-gray-400 mt-1">
                {formatNumber(analytics?.revenue?.summary?.totalOrders)} orders
              </p>
            </div>
          </div>

          {/* Received Revenue */}
          <div className="bg-white rounded-xl shadow-lg p-6 transform hover:scale-105 transition-all duration-300 border border-green-100">
            <div className="flex items-center justify-between">
              <div className="flex-shrink-0 p-3 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl shadow-lg">
                <CheckCircle className="h-6 w-6 text-white" />
              </div>
              <div className="flex items-center text-green-600">
                <ArrowUpRight className="h-4 w-4" />
                <span className="text-sm font-medium ml-1">8.2%</span>
              </div>
            </div>
            <div className="mt-4">
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(analytics?.revenue?.summary?.receivedRevenue)}
              </p>
              <p className="text-sm font-medium text-gray-500 mt-1">Received Revenue</p>
              <p className="text-xs text-gray-400 mt-1">
                {analytics?.revenue?.summary?.totalRevenue > 0 ? 
                  ((analytics.revenue.summary.receivedRevenue / analytics.revenue.summary.totalRevenue) * 100).toFixed(1) 
                  : 0}% of total
              </p>
            </div>
          </div>

          {/* Pending Revenue */}
          <div 
            className="bg-white rounded-xl shadow-lg p-6 transform hover:scale-105 transition-all duration-300 border border-yellow-100 cursor-pointer"
            onClick={() => handleCategoryClick('pending-revenue', '')}
          >
            <div className="flex items-center justify-between">
              <div className="flex-shrink-0 p-3 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-xl shadow-lg">
                <Clock className="h-6 w-6 text-white" />
              </div>
              <div className="flex items-center text-yellow-600">
                <Eye className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-4">
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(analytics?.revenue?.summary?.pendingRevenue)}
              </p>
              <p className="text-sm font-medium text-gray-500 mt-1">Pending Revenue</p>
              <p className="text-xs text-gray-400 mt-1">Requires attention</p>
            </div>
          </div>

          {/* Inventory Value */}
          <div className="bg-white rounded-xl shadow-lg p-6 transform hover:scale-105 transition-all duration-300 border border-purple-100">
            <div className="flex items-center justify-between">
              <div className="flex-shrink-0 p-3 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl shadow-lg">
                <Package className="h-6 w-6 text-white" />
              </div>
              <div className="flex items-center text-purple-600">
                <Activity className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-4">
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(analytics?.inventory?.totalValue)}
              </p>
              <p className="text-sm font-medium text-gray-500 mt-1">Inventory Value</p>
              <p className="text-xs text-gray-400 mt-1">
                {formatNumber(analytics?.inventory?.summary?.totalProducts)} products
              </p>
            </div>
          </div>
        </div>

        {/* Payment Method Analysis */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Payment Method Breakdown */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Payment Methods</h3>
              <div className="p-2 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg">
                <CreditCard className="h-5 w-5 text-white" />
              </div>
            </div>
            
            <div className="space-y-4">
              {/* UPI */}
              <div className="border border-blue-100 rounded-lg p-4 bg-blue-50">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-blue-900">UPI Payments</span>
                  <span className="text-sm font-semibold text-blue-700">
                    {formatCurrency(analytics?.revenue?.byPaymentMethod?.UPI?.total)}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div 
                    className="cursor-pointer hover:bg-blue-100 p-2 rounded"
                    onClick={() => handleCategoryClick('payment', 'UPI')}
                  >
                    <span className="text-green-600 font-medium">
                      Received: {formatCurrency(analytics?.revenue?.byPaymentMethod?.UPI?.received)}
                    </span>
                  </div>
                  <div className="cursor-pointer hover:bg-blue-100 p-2 rounded">
                    <span className="text-yellow-600 font-medium">
                      Pending: {formatCurrency(analytics?.revenue?.byPaymentMethod?.UPI?.pending)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Cash */}
              <div className="border border-green-100 rounded-lg p-4 bg-green-50">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-green-900">Cash Payments</span>
                  <span className="text-sm font-semibold text-green-700">
                    {formatCurrency(analytics?.revenue?.byPaymentMethod?.CASH?.total)}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div 
                    className="cursor-pointer hover:bg-green-100 p-2 rounded"
                    onClick={() => handleCategoryClick('payment', 'CASH')}
                  >
                    <span className="text-green-600 font-medium">
                      Collected: {formatCurrency(analytics?.revenue?.byPaymentMethod?.CASH?.received)}
                    </span>
                  </div>
                  <div className="cursor-pointer hover:bg-green-100 p-2 rounded">
                    <span className="text-yellow-600 font-medium">
                      Pending: {formatCurrency(analytics?.revenue?.byPaymentMethod?.CASH?.pending)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Order Status Breakdown */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Order Status</h3>
              <div className="p-2 bg-gradient-to-r from-green-500 to-blue-600 rounded-lg">
                <ShoppingCart className="h-5 w-5 text-white" />
              </div>
            </div>
            
            <div className="space-y-3">
              {Object.entries(analytics?.revenue?.byStatus || {}).map(([status, data]) => {
                if (data.count === 0) return null;
                return (
                  <div
                    key={status}
                    className="flex items-center justify-between p-3 border border-gray-100 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => handleCategoryClick('status', status)}
                  >
                    <div className="flex items-center space-x-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(status)}`}>
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </span>
                      <span className="text-sm text-gray-600">{data.count} orders</span>
                    </div>
                    <span className="font-semibold text-gray-900">
                      {formatCurrency(data.amount)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Timeline and Profitability */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Timeline Breakdown */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Revenue Timeline</h3>
              <div className="p-2 bg-gradient-to-r from-orange-500 to-red-600 rounded-lg">
                <Calendar className="h-5 w-5 text-white" />
              </div>
            </div>
            
            <div className="space-y-4">
              {[
                { key: 'today', label: 'Today', color: 'blue' },
                { key: 'thisWeek', label: 'This Week', color: 'green' },
                { key: 'thisMonth', label: 'This Month', color: 'purple' },
                { key: 'thisYear', label: 'This Year', color: 'indigo' }
              ].map(({ key, label, color }) => (
                <div key={key} className={`border border-${color}-100 rounded-lg p-4 bg-${color}-50`}>
                  <div className="flex items-center justify-between">
                    <span className={`font-medium text-${color}-900`}>{label}</span>
                    <span className={`text-sm font-semibold text-${color}-700`}>
                      {formatCurrency(analytics?.revenue?.timeline?.[key]?.revenue)}
                    </span>
                  </div>
                  <p className={`text-xs text-${color}-600 mt-1`}>
                    {analytics?.revenue?.timeline?.[key]?.orders} orders
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Profitability Analysis */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Profitability</h3>
              <div className="p-2 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-lg">
                <Target className="h-5 w-5 text-white" />
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 border border-green-100 rounded-lg bg-green-50">
                <span className="font-medium text-green-900">Gross Profit</span>
                <span className="text-lg font-bold text-green-700">
                  {formatCurrency(analytics?.profitability?.grossProfit)}
                </span>
              </div>
              
              <div className="flex items-center justify-between p-3 border border-blue-100 rounded-lg bg-blue-50">
                <span className="font-medium text-blue-900">Profit Margin</span>
                <span className="text-lg font-bold text-blue-700">
                  {analytics?.profitability?.grossProfitMargin}%
                </span>
              </div>
              
              <div className="flex items-center justify-between p-3 border border-purple-100 rounded-lg bg-purple-50">
                <span className="font-medium text-purple-900">Avg Order Value</span>
                <span className="text-lg font-bold text-purple-700">
                  {formatCurrency(analytics?.profitability?.averageOrderValue)}
                </span>
              </div>
              
              <div className="flex items-center justify-between p-3 border border-orange-100 rounded-lg bg-orange-50">
                <span className="font-medium text-orange-900">Products Sold</span>
                <span className="text-lg font-bold text-orange-700">
                  {formatNumber(analytics?.profitability?.totalProductsSold)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Inventory Analysis */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Inventory Analysis</h3>
            <div className="p-2 bg-gradient-to-r from-pink-500 to-rose-600 rounded-lg">
              <Package className="h-5 w-5 text-white" />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="text-center p-4 border border-blue-100 rounded-lg bg-blue-50">
              <p className="text-2xl font-bold text-blue-700">
                {formatCurrency(analytics?.inventory?.availableValue)}
              </p>
              <p className="text-sm text-blue-600 mt-1">Available Stock Value</p>
            </div>
            
            <div className="text-center p-4 border border-yellow-100 rounded-lg bg-yellow-50">
              <p className="text-2xl font-bold text-yellow-700">
                {formatCurrency(analytics?.inventory?.allocatedValue)}
              </p>
              <p className="text-sm text-yellow-600 mt-1">Allocated Stock Value</p>
            </div>
            
            <div className="text-center p-4 border border-green-100 rounded-lg bg-green-50">
              <p className="text-2xl font-bold text-green-700">
                {formatCurrency(analytics?.inventory?.usedValue)}
              </p>
              <p className="text-sm text-green-600 mt-1">Used Stock Value</p>
            </div>
            
            <div className="text-center p-4 border border-purple-100 rounded-lg bg-purple-50">
              <p className="text-2xl font-bold text-purple-700">
                {formatCurrency(analytics?.inventory?.comboPackValue)}
              </p>
              <p className="text-sm text-purple-600 mt-1">Combo Pack Value</p>
            </div>
          </div>

          {/* Low Stock Alerts */}
          {analytics?.inventory?.lowStockAlerts?.length > 0 && (
            <div className="border border-red-100 rounded-lg p-4 bg-red-50">
              <div className="flex items-center mb-3">
                <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
                <h4 className="font-medium text-red-800">Low Stock Alerts</h4>
              </div>
              <div className="space-y-2">
                {analytics.inventory.lowStockAlerts.slice(0, 3).map((alert, index) => (
                  <div key={index} className="flex items-center justify-between text-sm">
                    <span className="text-red-700">{alert.productName}</span>
                    <span className="text-red-600 font-medium">
                      {alert.availableQuantity} left ({formatCurrency(alert.availableValue)})
                    </span>
                  </div>
                ))}
                {analytics.inventory.lowStockAlerts.length > 3 && (
                  <p className="text-xs text-red-600 text-center mt-2">
                    +{analytics.inventory.lowStockAlerts.length - 3} more alerts
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Action Items */}
        {analytics?.actionItems?.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Action Items</h3>
              <div className="p-2 bg-gradient-to-r from-red-500 to-pink-600 rounded-lg">
                <Zap className="h-5 w-5 text-white" />
              </div>
            </div>
            
            <div className="space-y-3">
              {analytics.actionItems.map((item, index) => (
                <div
                  key={index}
                  className={`border rounded-lg p-4 ${
                    item.priority === 'high' ? 'border-red-200 bg-red-50' :
                    item.priority === 'medium' ? 'border-yellow-200 bg-yellow-50' :
                    'border-blue-200 bg-blue-50'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className={`font-medium ${
                        item.priority === 'high' ? 'text-red-800' :
                        item.priority === 'medium' ? 'text-yellow-800' :
                        'text-blue-800'
                      }`}>
                        {item.title}
                      </h4>
                      <p className={`text-sm mt-1 ${
                        item.priority === 'high' ? 'text-red-600' :
                        item.priority === 'medium' ? 'text-yellow-600' :
                        'text-blue-600'
                      }`}>
                        {item.description}
                      </p>
                      <p className={`text-xs mt-2 font-medium ${
                        item.priority === 'high' ? 'text-red-700' :
                        item.priority === 'medium' ? 'text-yellow-700' :
                        'text-blue-700'
                      }`}>
                        Action: {item.action}
                      </p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      item.priority === 'high' ? 'bg-red-100 text-red-800' :
                      item.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {item.priority.toUpperCase()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Drill-down Modal */}
      {selectedCategory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full mx-4 max-h-[80vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-indigo-500 to-purple-600">
              <h3 className="text-lg font-semibold text-white">
                {selectedCategory.category.replace('-', ' ').toUpperCase()} Details
                {selectedCategory.filter && ` - ${selectedCategory.filter}`}
              </h3>
              <button
                onClick={() => setSelectedCategory(null)}
                className="text-white hover:text-gray-200 transition-colors"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[calc(80vh-100px)]">
              {selectedCategory.data?.orders?.length > 0 ? (
                <div className="space-y-4">
                  {selectedCategory.data.orders.map((order) => (
                    <div key={order._id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-gray-900">Order #{order._id.slice(-8).toUpperCase()}</span>
                        <span className="font-bold text-gray-900">{formatCurrency(order.totalAmount)}</span>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                        <div>Status: <span className={`px-2 py-1 rounded text-xs ${getStatusColor(order.status)}`}>{order.status}</span></div>
                        <div>Payment: {order.paymentMethod}</div>
                        <div>Customer: {order.user?.name || 'N/A'}</div>
                        <div>Date: {new Date(order.createdAt).toLocaleDateString()}</div>
                      </div>
                    </div>
                  ))}
                  
                  {/* Summary */}
                  <div className="border-t border-gray-200 pt-4 mt-6">
                    <div className="bg-indigo-50 rounded-lg p-4">
                      <h4 className="font-medium text-indigo-900 mb-2">Summary</h4>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-indigo-600">Total Orders:</span>
                          <span className="font-medium text-indigo-800 ml-2">{selectedCategory.data.summary.totalOrders}</span>
                        </div>
                        <div>
                          <span className="text-indigo-600">Total Amount:</span>
                          <span className="font-medium text-indigo-800 ml-2">{formatCurrency(selectedCategory.data.summary.totalAmount)}</span>
                        </div>
                        <div>
                          <span className="text-indigo-600">Avg Order Value:</span>
                          <span className="font-medium text-indigo-800 ml-2">{formatCurrency(selectedCategory.data.summary.averageOrderValue)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">No orders found for this category.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RevenueAnalyticsDashboard;
