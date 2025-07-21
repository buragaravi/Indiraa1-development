import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  DollarSign, 
  TrendingUp,
  CreditCard,
  Package,
  AlertTriangle,
  CheckCircle,
  Clock,
  BarChart3,
  Activity,
  ArrowUpRight,
  RefreshCw,
  Download,
  Eye,
  Calendar,
  ShoppingCart,
  Target,
  Zap
} from 'lucide-react';

const SubAdminRevenueAnalytics = () => {
  const navigate = useNavigate();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Check for both admin and sub-admin tokens (same pattern as other working components)
      const adminToken = localStorage.getItem('adminToken');
      const subAdminToken = localStorage.getItem('subAdminToken') || sessionStorage.getItem('subAdminToken');
      const token = adminToken || subAdminToken;
      
      console.log('SubAdminRevenueAnalytics - Admin Token:', adminToken ? 'exists' : 'null');
      console.log('SubAdminRevenueAnalytics - SubAdmin Token:', subAdminToken ? 'exists' : 'null');
      console.log('SubAdminRevenueAnalytics - Using token:', token ? 'exists' : 'null');
      
      if (!token) {
        throw new Error('No authentication token found');
      }
      
      const response = await fetch('https://indiraa1-backend.onrender.com/api/revenue-analytics', {
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

  // Drill-down functionality for revenue analytics
  const handleDrillDown = async (endpoint, title) => {
    try {
      console.log(`Drilling down to: ${title}`);
      
      // Get token for authentication
      const adminToken = localStorage.getItem('adminToken');
      const subAdminToken = localStorage.getItem('subAdminToken') || sessionStorage.getItem('subAdminToken');
      const token = adminToken || subAdminToken;
      
      if (!token) {
        alert('Authentication required');
        return;
      }
      
      // Fetch data from the endpoint
      const response = await fetch(endpoint, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch ${title}`);
      }
      
      const result = await response.json();
      
      // For now, log the results (you can later show in a modal or navigate to a detailed page)
      console.log(`${title} Data:`, result);
      
      // Show a simple alert with the count (you can enhance this with a modal later)
      const orderCount = result.orders?.length || 0;
      const totalAmount = result.orders?.reduce((sum, order) => sum + (order.totalAmount || 0), 0) || 0;
      
      alert(`${title}:\n${orderCount} orders\nTotal Amount: ₹${totalAmount.toLocaleString('en-IN')}`);
      
    } catch (error) {
      console.error('Drill-down error:', error);
      alert(`Failed to load ${title}: ${error.message}`);
    }
  };

  // Drill-down endpoints configuration
  const drillDownEndpoints = {
    pendingOrders: 'https://indiraa1-backend.onrender.com/api/admin/orders?status=pending',
    upiPendingOrders: 'https://indiraa1-backend.onrender.com/api/admin/orders?status=pending&payment=upi',
    deliveredCashOrders: 'https://indiraa1-backend.onrender.com/api/admin/orders?status=delivered&payment=cash',
    allPendingRevenue: 'https://indiraa1-backend.onrender.com/api/admin/orders?status=pending',
    cashPayments: 'https://indiraa1-backend.onrender.com/api/admin/orders?payment=cash',
    upiPayments: 'https://indiraa1-backend.onrender.com/api/admin/orders?payment=upi'
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
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 py-4 sm:py-6 lg:py-8">
      <div className="w-full max-w-none px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16">
        {/* Quick Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Revenue */}
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 transform hover:scale-105 transition-all duration-300 shadow-[0_8px_32px_0_rgba(31,38,135,0.37)] border border-white/20 hover:shadow-[0_12px_40px_0_rgba(34,197,94,0.3)]">
            <div className="flex items-center justify-between">
              <div className="flex-shrink-0 p-3 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl shadow-lg">
                <DollarSign className="h-6 w-6 text-white" />
              </div>
              <div className="flex items-center text-green-600">
                <ArrowUpRight className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-4">
              <p className="text-2xl font-bold text-gray-800">
                {formatCurrency(analytics?.revenue?.summary?.totalRevenue)}
              </p>
              <p className="text-sm font-medium text-gray-600 mt-1">Total Revenue</p>
              <p className="text-xs text-gray-500 mt-1">
                {formatNumber(analytics?.revenue?.summary?.totalOrders)} orders
              </p>
            </div>
          </div>

          {/* Received Revenue */}
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 transform hover:scale-105 transition-all duration-300 shadow-[0_8px_32px_0_rgba(31,38,135,0.37)] border border-white/20 hover:shadow-[0_12px_40px_0_rgba(34,197,94,0.3)]">
            <div className="flex items-center justify-between">
              <div className="flex-shrink-0 p-3 bg-gradient-to-r from-emerald-500 to-green-600 rounded-2xl shadow-lg">
                <CheckCircle className="h-6 w-6 text-white" />
              </div>
              <div className="flex items-center text-green-600">
                <Activity className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-4">
              <p className="text-2xl font-bold text-gray-800">
                {formatCurrency(analytics?.revenue?.summary?.receivedRevenue)}
              </p>
              <p className="text-sm font-medium text-gray-600 mt-1">Received Revenue</p>
              <p className="text-xs text-gray-500 mt-1">
                {analytics?.revenue?.summary?.totalRevenue > 0 ? 
                  ((analytics.revenue.summary.receivedRevenue / analytics.revenue.summary.totalRevenue) * 100).toFixed(1) 
                  : 0}% of total
              </p>
            </div>
          </div>

          {/* Pending Revenue - Clickable for drill-down */}
          <div 
            className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 transform hover:scale-105 transition-all duration-300 shadow-[0_8px_32px_0_rgba(31,38,135,0.37)] border border-white/20 hover:shadow-[0_12px_40px_0_rgba(251,191,36,0.3)] cursor-pointer"
            onClick={() => handleDrillDown(drillDownEndpoints.pendingOrders, 'Pending Orders')}
            title="Click to view pending orders"
          >
            <div className="flex items-center justify-between">
              <div className="flex-shrink-0 p-3 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-2xl shadow-lg">
                <Clock className="h-6 w-6 text-white" />
              </div>
              <div className="flex items-center text-yellow-600">
                <Eye className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-4">
              <p className="text-2xl font-bold text-gray-800">
                {formatCurrency(analytics?.revenue?.summary?.pendingRevenue)}
              </p>
              <p className="text-sm font-medium text-gray-600 mt-1">Pending Revenue</p>
              <p className="text-xs text-gray-500 mt-1">Click to view details</p>
            </div>
          </div>

          {/* Inventory Value */}
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 transform hover:scale-105 transition-all duration-300 shadow-[0_8px_32px_0_rgba(31,38,135,0.37)] border border-white/20 hover:shadow-[0_12px_40px_0_rgba(168,85,247,0.3)]">
            <div className="flex items-center justify-between">
              <div className="flex-shrink-0 p-3 bg-gradient-to-r from-emerald-500 to-green-600 rounded-2xl shadow-lg">
                <Package className="h-6 w-6 text-white" />
              </div>
              <div className="flex items-center text-green-600">
                <TrendingUp className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-4">
              <p className="text-2xl font-bold text-gray-800">
                {formatCurrency(analytics?.inventory?.totalValue)}
              </p>
              <p className="text-sm font-medium text-gray-600 mt-1">Inventory Value</p>
              <p className="text-xs text-gray-500 mt-1">
                {formatNumber(analytics?.inventory?.summary?.totalProducts)} products
              </p>
            </div>
          </div>
        </div>

        {/* Payment & Status Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Payment Method Summary */}
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-[0_8px_32px_0_rgba(31,38,135,0.37)] border border-white/20">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-800">Payment Overview</h3>
              <div className="p-2 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg">
                <CreditCard className="h-5 w-5 text-white" />
              </div>
            </div>
            <div className="space-y-4">
              {/* UPI Summary - Clickable for drill-down */}
              <div 
                className="border border-green-200 rounded-xl p-4 bg-emerald-50/50 cursor-pointer hover:bg-emerald-100/50 transition-colors"
                onClick={() => handleDrillDown(drillDownEndpoints.upiPayments, 'UPI Payments')}
                title="Click to view UPI payment orders"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-green-800">UPI Payments</span>
                  <span className="text-sm font-semibold text-green-700">
                    {formatCurrency(analytics?.revenue?.byPaymentMethod?.UPI?.total)}
                  </span>
                </div>
                <div className="text-sm text-green-600">
                  Received: {formatCurrency(analytics?.revenue?.byPaymentMethod?.UPI?.received)} | 
                  Pending: {formatCurrency(analytics?.revenue?.byPaymentMethod?.UPI?.pending)}
                </div>
                <div className="text-xs text-green-500 mt-1">Click for UPI pending orders</div>
              </div>

              {/* Cash Summary - Clickable for drill-down */}
              <div 
                className="border border-emerald-200 rounded-xl p-4 bg-green-50/50 cursor-pointer hover:bg-green-100/50 transition-colors"
                onClick={() => handleDrillDown(drillDownEndpoints.cashPayments, 'Cash Payments')}
                title="Click to view cash payment orders"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-emerald-800">Cash Payments</span>
                  <span className="text-sm font-semibold text-emerald-700">
                    {formatCurrency(analytics?.revenue?.byPaymentMethod?.CASH?.total)}
                  </span>
                </div>
                <div className="text-sm text-emerald-600">
                  Collected: {formatCurrency(analytics?.revenue?.byPaymentMethod?.CASH?.received)} | 
                  Pending: {formatCurrency(analytics?.revenue?.byPaymentMethod?.CASH?.pending)}
                </div>
                <div className="text-xs text-green-500 mt-1">Click for delivered cash orders</div>
              </div>
            </div>
          </div>

          {/* Order Status Summary */}
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-[0_8px_32px_0_rgba(31,38,135,0.37)] border border-white/20">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-800">Order Status</h3>
              <div className="p-2 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg">
                <ShoppingCart className="h-5 w-5 text-white" />
              </div>
            </div>
            <div className="space-y-3">
              {Object.entries(analytics?.revenue?.byStatus || {}).map(([status, data]) => {
                if (data.count === 0) return null;
                return (
                  <div key={status} className="flex items-center justify-between p-3 border border-green-100 rounded-xl bg-emerald-50/30">
                    <div className="flex items-center space-x-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(status)}`}>
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </span>
                      <span className="text-sm text-gray-600">{data.count} orders</span>
                    </div>
                    <span className="font-semibold text-gray-800">
                      {formatCurrency(data.amount)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Timeline Overview */}
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-[0_8px_32px_0_rgba(31,38,135,0.37)] border border-white/20 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-800">Revenue Timeline</h3>
            <div className="p-2 bg-gradient-to-r from-emerald-500 to-green-600 rounded-lg">
              <Calendar className="h-5 w-5 text-white" />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { key: 'today', label: 'Today', color: 'blue' },
              { key: 'thisWeek', label: 'This Week', color: 'green' },
              { key: 'thisMonth', label: 'This Month', color: 'purple' },
              { key: 'thisYear', label: 'This Year', color: 'indigo' }
            ].map(({ key, label, color }) => (
              <div key={key} className={`border border-${color}-100 rounded-xl p-4 bg-${color}-50/50`}>
                <div className="text-center">
                  <p className={`text-lg font-bold text-${color}-700`}>
                    {formatCurrency(analytics?.revenue?.timeline?.[key]?.revenue)}
                  </p>
                  <p className={`text-sm font-medium text-${color}-600 mt-1`}>{label}</p>
                  <p className={`text-xs text-${color}-500 mt-1`}>
                    {analytics?.revenue?.timeline?.[key]?.orders} orders
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Business Metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Performance Metrics */}
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-[0_8px_32px_0_rgba(31,38,135,0.37)] border border-white/20">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-800">Performance Metrics</h3>
              <div className="p-2 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-lg">
                <Target className="h-5 w-5 text-white" />
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 border border-emerald-100 rounded-xl bg-emerald-50/50">
                <span className="font-medium text-emerald-800">Profit Margin</span>
                <span className="text-lg font-bold text-emerald-700">
                  {analytics?.profitability?.grossProfitMargin}%
                </span>
              </div>
              
              <div className="flex items-center justify-between p-3 border border-green-100 rounded-xl bg-green-50/50">
                <span className="font-medium text-green-800">Avg Order Value</span>
                <span className="text-lg font-bold text-green-700">
                  {formatCurrency(analytics?.profitability?.averageOrderValue)}
                </span>
              </div>
              
              <div className="flex items-center justify-between p-3 border border-teal-100 rounded-xl bg-teal-50/50">
                <span className="font-medium text-teal-800">Products Sold</span>
                <span className="text-lg font-bold text-teal-700">
                  {formatNumber(analytics?.profitability?.totalProductsSold)}
                </span>
              </div>
            </div>
          </div>

          {/* Inventory Health */}
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-[0_8px_32px_0_rgba(31,38,135,0.37)] border border-white/20">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-800">Inventory Health</h3>
              <div className="p-2 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg">
                <Package className="h-5 w-5 text-white" />
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 border border-emerald-100 rounded-xl bg-emerald-50/50">
                <span className="font-medium text-emerald-800">Available Stock</span>
                <span className="text-lg font-bold text-emerald-700">
                  {formatCurrency(analytics?.inventory?.availableValue)}
                </span>
              </div>
              
              <div className="flex items-center justify-between p-3 border border-green-100 rounded-xl bg-green-50/50">
                <span className="font-medium text-green-800">Allocated Stock</span>
                <span className="text-lg font-bold text-green-700">
                  {formatCurrency(analytics?.inventory?.allocatedValue)}
                </span>
              </div>
              
              <div className="flex items-center justify-between p-3 border border-teal-100 rounded-lg bg-teal-50">
                <span className="font-medium text-teal-800">Combo Pack Value</span>
                <span className="text-lg font-bold text-teal-700">
                  {formatCurrency(analytics?.inventory?.comboPackValue)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Items for Sub-Admin */}
        {analytics?.actionItems?.length > 0 && (
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-[0_8px_32px_0_rgba(31,38,135,0.37)] border border-white/20">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-800">Important Alerts</h3>
              <div className="p-2 bg-gradient-to-r from-orange-500 to-red-600 rounded-lg">
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
    </div>
  );
};

export default SubAdminRevenueAnalytics;
