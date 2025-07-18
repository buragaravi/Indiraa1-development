import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useThemeContext } from '../../context/ThemeProvider';
import { classNames } from '../utils/classNames';
import { useAuth } from '../utils/useAuth';
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
      const response = await fetch('http://localhost:5001/api/products/orders/all', {
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100">
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
      <div className="max-w-7xl mx-auto w-full">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-3 text-gray-800 bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
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
              <div className="hidden lg:block overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-green-50 to-emerald-50">
                    <tr>
                      <th className="text-left p-6 font-semibold text-gray-700">Order ID</th>
                      <th className="text-left p-6 font-semibold text-gray-700">Customer</th>
                      <th className="text-left p-6 font-semibold text-gray-700">Items</th>
                      <th className="text-left p-6 font-semibold text-gray-700">Total</th>
                      <th className="text-left p-6 font-semibold text-gray-700">Status</th>
                      <th className="text-left p-6 font-semibold text-gray-700">Payment</th>
                      <th className="text-left p-6 font-semibold text-gray-700">Delivery Slot</th>
                      <th className="text-left p-6 font-semibold text-gray-700">Date</th>
                      <th className="text-left p-6 font-semibold text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order) => (
                      <tr key={order._id} className="border-b border-gray-100/50 hover:bg-white/30 transition-colors">
                        <td className="p-6">
                          <button
                            onClick={() => handleOrderClick(order._id)}
                            className="font-mono text-sm text-gray-600 bg-gray-50/50 rounded-xl px-3 py-2 hover:bg-gray-100/70 transition-colors cursor-pointer text-left w-full"
                          >
                            {order._id.slice(-8)}
                          </button>
                        </td>
                        <td className="p-6">
                          <button
                            onClick={() => handleOrderClick(order._id)}
                            className="text-left w-full hover:bg-gray-50/50 rounded-xl p-2 transition-colors"
                          >
                            <div>
                              <div className="font-semibold text-gray-800">{order.shipping?.name || 'N/A'}</div>
                              <div className="text-sm text-gray-500">{order.shipping?.phone || 'N/A'}</div>
                            </div>
                          </button>
                        </td>
                        <td className="p-6">
                          <button
                            onClick={() => handleOrderClick(order._id)}
                            className="text-left w-full hover:bg-gray-50/50 rounded-xl p-2 transition-colors"
                          >
                            <div className="text-sm text-gray-600 bg-blue-50/50 px-3 py-1 rounded-full inline-block">
                              {order.items?.length || 0} items
                            </div>
                          </button>
                        </td>
                        <td className="p-6">
                          <button
                            onClick={() => handleOrderClick(order._id)}
                            className="text-left w-full hover:bg-gray-50/50 rounded-xl p-2 transition-colors"
                          >
                            <div className="font-semibold text-green-600 text-lg">₹{order.totalAmount}</div>
                          </button>
                        </td>
                        <td className="p-6">
                          <button
                            onClick={() => handleOrderClick(order._id)}
                            className="text-left w-full hover:bg-gray-50/50 rounded-xl p-2 transition-colors"
                          >
                            <span className={classNames('px-4 py-2 rounded-full text-sm font-medium border flex items-center', getStatusColor(order.status))}>
                              {getStatusIcon(order.status)}
                              <span className="ml-1">{order.status}</span>
                            </span>
                          </button>
                        </td>
                        <td className="p-6">
                          <button
                            onClick={() => handleOrderClick(order._id)}
                            className="text-left w-full hover:bg-gray-50/50 rounded-xl p-2 transition-colors"
                          >
                            <span className={classNames('px-4 py-2 rounded-full text-sm font-medium border flex items-center', 
                              order.paymentStatus === 'Paid' ? 'bg-green-100 text-green-700 border-green-200' : 'bg-yellow-100 text-yellow-700 border-yellow-200')}>
                              {order.paymentStatus === 'Paid' && <PaidIcon className="w-4 h-4 mr-1" />}
                              {order.paymentStatus || 'Pending'}
                            </span>
                          </button>
                        </td>
                        <td className="p-6">
                          <button
                            onClick={() => handleOrderClick(order._id)}
                            className="text-left w-full hover:bg-gray-50/50 rounded-xl p-2 transition-colors"
                          >
                            <div className="space-y-1">
                              {order.deliverySlot?.date ? (
                                <>
                                  <div className="text-sm font-medium text-blue-600">
                                    📅 {new Date(order.deliverySlot.date).toLocaleDateString('en-IN', { 
                                      day: 'numeric', 
                                      month: 'short' 
                                    })}
                                  </div>
                                  {order.deliverySlot.timeSlot && (
                                    <div className="text-xs text-gray-600 bg-blue-50 px-2 py-1 rounded-lg">
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
                        <td className="p-6">
                          <button
                            onClick={() => handleOrderClick(order._id)}
                            className="text-left w-full hover:bg-gray-50/50 rounded-xl p-2 transition-colors"
                          >
                            <div className="text-sm text-gray-600">
                              {formatDate(order.placedAt || order.createdAt)}
                            </div>
                          </button>
                        </td>
                        <td className="p-6">
                          <button
                            onClick={() => handleOrderClick(order._id)}
                            className="neumorphic-button-small px-4 py-2 bg-blue-500 text-white rounded-xl text-sm font-medium hover:shadow-soft transition-all duration-300 flex items-center"
                          >
                            <ViewIcon className="w-4 h-4 mr-1" />
                            View Details
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card View */}
              <div className="lg:hidden">
                <div className="space-y-4 p-4">
                  {orders.map((order) => (
                    <div key={order._id} className="neumorphic-card p-4 rounded-2xl bg-white/40 backdrop-blur-sm border border-white/20">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="font-mono text-sm text-gray-600 bg-gray-50/50 rounded-lg px-2 py-1 inline-block mb-1">
                            #{order._id.slice(-8)}
                          </div>
                          <div className="font-semibold text-gray-800 text-sm">{order.shipping?.name || 'N/A'}</div>
                          <div className="text-xs text-gray-500">{order.shipping?.phone || 'N/A'}</div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-green-600 text-lg">₹{order.totalAmount}</div>
                          <div className="text-xs text-gray-500 bg-blue-50/50 px-2 py-1 rounded-full inline-block">
                            {order.items?.length || 0} items
                          </div>
                        </div>
                      </div>
                      
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
                      
                      <div className="text-xs text-gray-500 mb-3">
                        {formatDate(order.placedAt || order.createdAt)}
                      </div>
                      
                      <button
                        onClick={() => handleOrderClick(order._id)}
                        className="w-full neumorphic-button-small px-4 py-2 bg-blue-500 text-white rounded-xl text-sm font-medium hover:shadow-soft transition-all duration-300 flex items-center justify-center"
                      >
                        <ViewIcon className="w-4 h-4 mr-2" />
                        View Details
                      </button>
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