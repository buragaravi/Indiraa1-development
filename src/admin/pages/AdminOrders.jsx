import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useThemeContext } from '../../context/ThemeProvider';
import { classNames } from '../utils/classNames';
import { useAuth } from '../utils/useAuth';
import { useAdminPermission } from '../context/AdminPermissionContext';
import { 
  LoadingIcon, 
  EmptyIcon, 
  ViewIcon,
  PendingIcon,
  ShippedIcon,
  DeliveredIcon,
  CancelledIcon,
  PaidIcon
} from '../components/AdminIcons';
import toast from 'react-hot-toast';

const AdminOrders = () => {
  const { primary, mode } = useThemeContext();
  const { isAdmin } = useAuth();
  const { hasModuleAccess } = useAdminPermission();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch('https://indiraa1-backend.onrender.com/api/products/orders/all', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setOrders(data.orders || []);
      } else {
        toast.error('Failed to fetch orders');
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Error loading orders');
    } finally {
      setLoading(false);
    }
  };

  // Check access permissions after all hooks
  if (!hasModuleAccess('orders')) {
    return (
      <div className="admin-orders-bg">
        <div className="text-center p-8 rounded-3xl shadow-soft bg-white/70 backdrop-blur-sm">
          <EmptyIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-4 text-gray-800">Access Denied</h1>
          <p className="text-gray-600">You don't have permission to access order management.</p>
        </div>
      </div>
    );
  }

  const handleOrderClick = (orderId) => {
    navigate(`/admin/orders/${orderId}`);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Pending': return <PendingIcon className="w-4 h-4" />;
      case 'Shipped': return <ShippedIcon className="w-4 h-4" />;
      case 'Delivered': return <DeliveredIcon className="w-4 h-4" />;
      case 'Cancelled': return <CancelledIcon className="w-4 h-4" />;
      default: return null;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'Shipped': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'Delivered': return 'bg-green-100 text-green-700 border-green-200';
      case 'Cancelled': return 'bg-red-100 text-red-700 border-red-200';
      case 'Paid': return 'bg-green-100 text-green-700 border-green-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!isAdmin) {
    return (
      <div className="admin-orders-bg">
        <div className="text-center p-8 rounded-3xl shadow-soft bg-white/70 backdrop-blur-sm">
          <EmptyIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-4 text-gray-800">Access Denied</h1>
          <p className="text-gray-600">You need admin privileges to access this page.</p>
        </div>
      </div>
    );
  }
  return (
    <>
      <div className="w-full px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="admin-orders-title">
            Order Management
          </h1>
            <p className="text-gray-600 text-lg">
              Manage and track all customer orders with precision
            </p>
          </div>          {/* Orders List */}
          {loading ? (
            <div className="text-center py-12">
              <LoadingIcon className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <p className="text-gray-600 text-lg">Loading orders...</p>
            </div>
          ) : (
            <div className="neumorphic-card rounded-3xl bg-white/60 backdrop-blur-sm border border-white/20 overflow-hidden">
              {/* Desktop Table View */}
              <div className="hidden xl:block overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50/50">
                    <tr>
                      <th className="text-left p-4 font-semibold text-gray-700 text-sm">Order ID</th>
                      <th className="text-left p-4 font-semibold text-gray-700 text-sm">Customer</th>
                      <th className="text-left p-4 font-semibold text-gray-700 text-sm">Items</th>
                      <th className="text-left p-4 font-semibold text-gray-700 text-sm">Total</th>
                      <th className="text-left p-4 font-semibold text-gray-700 text-sm">Status</th>
                      <th className="text-left p-4 font-semibold text-gray-700 text-sm">Payment</th>
                      <th className="text-left p-4 font-semibold text-gray-700 text-sm">Delivery</th>
                      <th className="text-left p-4 font-semibold text-gray-700 text-sm">Date</th>
                      <th className="text-left p-4 font-semibold text-gray-700 text-sm">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order) => (
                      <tr key={order._id} className="border-b border-gray-100/50 hover:bg-white/30 transition-colors">
                        <td className="p-4">
                          <button
                            onClick={() => handleOrderClick(order._id)}
                            className="font-mono text-xs text-gray-600 bg-gray-50/50 rounded-lg px-2 py-1 hover:bg-gray-100/70 transition-colors cursor-pointer text-left w-full"
                          >
                            {order._id.slice(-8)}
                          </button>
                        </td>
                        <td className="p-4">
                          <button
                            onClick={() => handleOrderClick(order._id)}
                            className="text-left w-full hover:bg-gray-50/50 rounded-lg p-2 transition-colors"
                          >
                            <div>
                              <div className="font-semibold text-gray-800 text-sm">{order.shipping?.name || 'N/A'}</div>
                              <div className="text-xs text-gray-500">{order.shipping?.phone || 'N/A'}</div>
                            </div>
                          </button>
                        </td>
                        <td className="p-4">
                          <button
                            onClick={() => handleOrderClick(order._id)}
                            className="text-left w-full hover:bg-gray-50/50 rounded-lg p-2 transition-colors"
                          >
                            <div className="text-xs text-gray-600 bg-blue-50/50 px-2 py-1 rounded-full inline-block">
                              {order.items?.length || 0} items
                            </div>
                          </button>
                        </td>
                        <td className="p-4">
                          <button
                            onClick={() => handleOrderClick(order._id)}
                            className="text-left w-full hover:bg-gray-50/50 rounded-lg p-2 transition-colors"
                          >
                            <div className="font-semibold text-green-600">₹{order.totalAmount}</div>
                          </button>
                        </td>
                        <td className="p-4">
                          <button
                            onClick={() => handleOrderClick(order._id)}
                            className="text-left w-full hover:bg-gray-50/50 rounded-lg p-2 transition-colors"
                          >
                            <span className={classNames('px-3 py-1 rounded-full text-xs font-medium border flex items-center', getStatusColor(order.status))}>
                              {getStatusIcon(order.status)}
                              <span className="ml-1">{order.status}</span>
                            </span>
                          </button>
                        </td>
                        <td className="p-4">
                          <button
                            onClick={() => handleOrderClick(order._id)}
                            className="text-left w-full hover:bg-gray-50/50 rounded-lg p-2 transition-colors"
                          >
                            <span className={classNames('px-3 py-1 rounded-full text-xs font-medium border flex items-center', 
                              order.paymentStatus === 'Paid' ? 'bg-green-100 text-green-700 border-green-200' : 'bg-yellow-100 text-yellow-700 border-yellow-200')}>
                              {order.paymentStatus === 'Paid' && <PaidIcon className="w-3 h-3 mr-1" />}
                              {order.paymentStatus || 'Pending'}
                            </span>
                          </button>
                        </td>
                        <td className="p-4">
                          <button
                            onClick={() => handleOrderClick(order._id)}
                            className="text-left w-full hover:bg-gray-50/50 rounded-lg p-2 transition-colors"
                          >
                            <div className="space-y-1">
                              {order.deliverySlot?.date ? (
                                <>
                                  <div className="text-xs font-medium text-blue-600">
                                    📅 {new Date(order.deliverySlot.date).toLocaleDateString('en-IN', { 
                                      day: 'numeric', 
                                      month: 'short' 
                                    })}
                                  </div>
                                  {order.deliverySlot.timeSlot && (
                                    <div className="text-xs text-gray-600 bg-blue-50 px-1 py-0.5 rounded">
                                      🕐 {order.deliverySlot.timeSlot.split(' - ')[0]}
                                    </div>
                                  )}
                                </>
                              ) : (
                                <div className="text-xs text-gray-400 italic">
                                  No preference
                                </div>
                              )}
                            </div>
                          </button>
                        </td>
                        <td className="p-4">
                          <button
                            onClick={() => handleOrderClick(order._id)}
                            className="text-left w-full hover:bg-gray-50/50 rounded-lg p-2 transition-colors"
                          >
                            <div className="text-xs text-gray-600">
                              {formatDate(order.placedAt || order.createdAt)}
                            </div>
                          </button>
                        </td>
                        <td className="p-4">
                          <button
                            onClick={() => handleOrderClick(order._id)}
                            className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-medium shadow-md hover:shadow-lg transition-all duration-300 flex items-center"
                          >
                            <ViewIcon className="w-3 h-3 mr-1" />
                            View
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Tablet Compact Table View */}
              <div className="hidden lg:block xl:hidden overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50/50">
                    <tr>
                      <th className="text-left p-3 font-semibold text-gray-700 text-sm">Order</th>
                      <th className="text-left p-3 font-semibold text-gray-700 text-sm">Customer</th>
                      <th className="text-left p-3 font-semibold text-gray-700 text-sm">Total</th>
                      <th className="text-left p-3 font-semibold text-gray-700 text-sm">Status</th>
                      <th className="text-left p-3 font-semibold text-gray-700 text-sm">Payment</th>
                      <th className="text-left p-3 font-semibold text-gray-700 text-sm">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order) => (
                      <tr key={order._id} className="border-b border-gray-100/50 hover:bg-white/30 transition-colors">
                        <td className="p-3">
                          <div>
                            <div className="font-mono text-xs text-gray-600 bg-gray-50/50 rounded px-2 py-1 inline-block mb-1">
                              #{order._id.slice(-8)}
                            </div>
                            <div className="text-xs text-gray-500 bg-blue-50/50 px-2 py-1 rounded-full inline-block">
                              {order.items?.length || 0} items
                            </div>
                          </div>
                        </td>
                        <td className="p-3">
                          <div>
                            <div className="font-semibold text-gray-800 text-sm">{order.shipping?.name || 'N/A'}</div>
                            <div className="text-xs text-gray-500">{order.shipping?.phone || 'N/A'}</div>
                          </div>
                        </td>
                        <td className="p-3">
                          <div className="font-semibold text-green-600">₹{order.totalAmount}</div>
                        </td>
                        <td className="p-3">
                          <span className={classNames('px-2 py-1 rounded-full text-xs font-medium border flex items-center w-fit', getStatusColor(order.status))}>
                            {getStatusIcon(order.status)}
                            <span className="ml-1">{order.status}</span>
                          </span>
                        </td>
                        <td className="p-3">
                          <span className={classNames('px-2 py-1 rounded-full text-xs font-medium border flex items-center w-fit', 
                            order.paymentStatus === 'Paid' ? 'bg-green-100 text-green-700 border-green-200' : 'bg-yellow-100 text-yellow-700 border-yellow-200')}>
                            {order.paymentStatus === 'Paid' && <PaidIcon className="w-3 h-3 mr-1" />}
                            {order.paymentStatus || 'Pending'}
                          </span>
                        </td>
                        <td className="p-3">
                          <button
                            onClick={() => handleOrderClick(order._id)}
                            className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-medium shadow-md hover:shadow-lg transition-all duration-300 flex items-center"
                          >
                            <ViewIcon className="w-3 h-3 mr-1" />
                            View
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card View */}
              <div className="lg:hidden">
                <div className="space-y-3 p-4">
                  {orders.map((order) => (
                    <div key={order._id} className="bg-white/80 backdrop-blur-sm p-4 rounded-2xl border border-white/20 shadow-md">
                      {/* Header Row */}
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="font-mono text-xs text-gray-600 bg-gray-50 rounded-lg px-2 py-1 inline-block mb-1">
                            #{order._id.slice(-8)}
                          </div>
                          <div className="font-semibold text-gray-800 text-sm">{order.shipping?.name || 'N/A'}</div>
                          <div className="text-xs text-gray-500">{order.shipping?.phone || 'N/A'}</div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-green-600 text-lg">₹{order.totalAmount}</div>
                          <div className="text-xs text-gray-500 bg-blue-50 px-2 py-1 rounded-full inline-block">
                            {order.items?.length || 0} items
                          </div>
                        </div>
                      </div>
                      
                      {/* Status Row */}
                      <div className="flex flex-wrap gap-2 mb-3">
                        <span className={classNames('px-3 py-1 rounded-full text-xs font-medium border flex items-center', getStatusColor(order.status))}>
                          {getStatusIcon(order.status)}
                          <span className="ml-1">{order.status}</span>
                        </span>
                        <span className={classNames('px-3 py-1 rounded-full text-xs font-medium border flex items-center', 
                          order.paymentStatus === 'Paid' ? 'bg-green-100 text-green-700 border-green-200' : 'bg-yellow-100 text-yellow-700 border-yellow-200')}>
                          {order.paymentStatus === 'Paid' && <PaidIcon className="w-3 h-3 mr-1" />}
                          {order.paymentStatus || 'Pending'}
                        </span>
                      </div>
                      
                      {/* Delivery Info */}
                      {order.deliverySlot?.date && (
                        <div className="mb-3 p-2 bg-blue-50/50 rounded-lg">
                          <div className="text-xs font-medium text-blue-600 mb-1">
                            📅 Delivery: {new Date(order.deliverySlot.date).toLocaleDateString('en-IN', { 
                              day: 'numeric', 
                              month: 'short',
                              year: 'numeric'
                            })}
                          </div>
                          {order.deliverySlot.timeSlot && (
                            <div className="text-xs text-gray-600">
                              🕐 {order.deliverySlot.timeSlot}
                            </div>
                          )}
                        </div>
                      )}
                      
                      {/* Date and Action Row */}
                      <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                        <div className="text-xs text-gray-500">
                          {formatDate(order.placedAt || order.createdAt)}
                        </div>
                        <button
                          onClick={() => handleOrderClick(order._id)}
                          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium shadow-md hover:shadow-lg transition-all duration-300 flex items-center"
                        >
                          <ViewIcon className="w-4 h-4 mr-2" />
                          View Details
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {orders.length === 0 && (
                <div className="text-center py-16">
                  <EmptyIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 text-xl mb-4">No orders found</p>
                  <p className="text-gray-400">Orders will appear here once customers start shopping!</p>
                </div>
              )}
            </div>
          )}</div>

      <style jsx>{`
        .neumorphic-card {
          box-shadow: 
            20px 20px 60px rgba(0, 0, 0, 0.05),
            -20px -20px 60px rgba(255, 255, 255, 0.8);
        }
        .neumorphic-button-small {
          box-shadow: 
            4px 4px 8px rgba(0, 0, 0, 0.2),
            -4px -4px 8px rgba(255, 255, 255, 0.1);
        }
        .shadow-soft {
          box-shadow: 
            8px 8px 16px rgba(0, 0, 0, 0.1),
            -8px -8px 16px rgba(255, 255, 255, 0.8);        }
      `}</style>
    </>
  );
};

export default AdminOrders; 