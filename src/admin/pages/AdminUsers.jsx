import React, { useState, useEffect } from 'react';
import { useThemeContext } from '../../context/ThemeProvider';
import { classNames } from '../utils/classNames';
import { useAuth } from '../utils/useAuth';
import { 
  LoadingIcon, 
  EmptyIcon, 
  ViewIcon,
  PeopleIcon,
  EmailIcon,
  PhoneIcon,
  CalendarIcon,
  OrdersIcon
} from '../components/AdminIcons';
import toast from 'react-hot-toast';

const AdminUsers = () => {
  const { primary, mode } = useThemeContext();
  const { isAdmin } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userOrders, setUserOrders] = useState([]);
  const [showUserOrders, setShowUserOrders] = useState(false);
  const [loadingOrders, setLoadingOrders] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5001/api/products/users/all', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setUsers(data.users || []);
      } else {
        toast.error('Failed to fetch users');
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Error loading users');
    } finally {
      setLoading(false);
    }
  };  const handleViewOrders = async (userId) => {
    setSelectedUser(users.find(user => user._id === userId));
    setLoadingOrders(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5001/api/products/orders/user/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setUserOrders(data.orders || []);
        setShowUserOrders(true);
      } else {
        toast.error('Failed to fetch user orders');
      }
    } catch (error) {
      console.error('Error fetching user orders:', error);
      toast.error('Error loading user orders');
    } finally {
      setLoadingOrders(false);
    }
  };
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'Shipped': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'Delivered': return 'bg-green-100 text-green-700 border-green-200';
      case 'Cancelled': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
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

  return (    <>
      <div className="max-w-7xl mx-auto w-full">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-3 text-gray-800 bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
            User Management
          </h1>
          <p className="text-gray-600 text-lg">
              Manage and monitor all registered users
            </p>
          </div>          {/* Users List */}
          {loading ? (
            <div className="text-center py-12">
              <LoadingIcon className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <p className="text-gray-600 text-lg">Loading users...</p>
            </div>
          ) : (
            <div className="neumorphic-card rounded-3xl bg-white/60 backdrop-blur-sm border border-white/20 overflow-hidden">
              {/* Desktop Table View */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-green-50 to-emerald-50">
                    <tr>
                      <th className="text-left p-6 font-semibold text-gray-700">User</th>
                      <th className="text-left p-6 font-semibold text-gray-700">Email</th>
                      <th className="text-left p-6 font-semibold text-gray-700">Phone</th>
                      <th className="text-left p-6 font-semibold text-gray-700">Role</th>
                      <th className="text-left p-6 font-semibold text-gray-700">Joined</th>
                      <th className="text-left p-6 font-semibold text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user._id} className="border-b border-gray-100/50 hover:bg-white/30 transition-colors">
                        <td className="p-6">
                          <div className="flex items-center">
                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-green-400 to-emerald-500 shadow-soft flex items-center justify-center mr-4">
                              <PeopleIcon className="w-6 h-6 text-white" />
                            </div>
                            <div>
                              <div className="font-semibold text-gray-800">{user.name || 'N/A'}</div>
                              <div className="text-sm text-gray-500">ID: {user._id.slice(-8)}</div>
                            </div>
                          </div>
                        </td>
                        <td className="p-6">
                          <div className="flex items-center">
                            <EmailIcon className="w-4 h-4 text-gray-400 mr-2" />
                            <span className="text-gray-700">{user.email}</span>
                          </div>
                        </td>
                        <td className="p-6">
                          <div className="flex items-center">
                            <PhoneIcon className="w-4 h-4 text-gray-400 mr-2" />
                            <span className="text-gray-700">{user.phone || 'N/A'}</span>
                          </div>
                        </td>
                        <td className="p-6">
                          <span className={classNames(
                            'px-3 py-1 rounded-full text-xs font-medium',
                            user.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                          )}>
                            {user.role || 'user'}
                          </span>
                        </td>
                        <td className="p-6">
                          <div className="flex items-center">
                            <CalendarIcon className="w-4 h-4 text-gray-400 mr-2" />
                            <span className="text-gray-700">{formatDate(user.createdAt)}</span>
                          </div>
                        </td>
                        <td className="p-6">
                          <button
                            onClick={() => handleViewOrders(user._id)}
                            className="neumorphic-button-small px-4 py-2 bg-blue-500 text-white rounded-xl text-sm font-medium hover:shadow-soft transition-all duration-300 flex items-center"
                          >
                            <ViewIcon className="w-4 h-4 mr-1" />
                            View Orders
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
                  {users.map((user) => (
                    <div key={user._id} className="neumorphic-card p-4 rounded-2xl bg-white/40 backdrop-blur-sm border border-white/20">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-400 to-emerald-500 shadow-soft flex items-center justify-center mr-3">
                            <PeopleIcon className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <div className="font-semibold text-gray-800 text-sm">{user.name || 'N/A'}</div>
                            <div className="text-xs text-gray-500">ID: {user._id.slice(-8)}</div>
                          </div>
                        </div>
                        <span className={classNames(
                          'px-2 py-1 rounded-full text-xs font-medium',
                          user.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                        )}>
                          {user.role || 'user'}
                        </span>
                      </div>
                      
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center text-sm">
                          <EmailIcon className="w-4 h-4 text-gray-400 mr-2 flex-shrink-0" />
                          <span className="text-gray-700 truncate">{user.email}</span>
                        </div>
                        <div className="flex items-center text-sm">
                          <PhoneIcon className="w-4 h-4 text-gray-400 mr-2 flex-shrink-0" />
                          <span className="text-gray-700">{user.phone || 'N/A'}</span>
                        </div>
                        <div className="flex items-center text-sm">
                          <CalendarIcon className="w-4 h-4 text-gray-400 mr-2 flex-shrink-0" />
                          <span className="text-gray-700">{formatDate(user.createdAt)}</span>
                        </div>
                      </div>
                      
                      <button
                        onClick={() => handleViewOrders(user._id)}
                        className="w-full neumorphic-button-small px-4 py-2 bg-blue-500 text-white rounded-xl text-sm font-medium hover:shadow-soft transition-all duration-300 flex items-center justify-center"
                      >
                        <ViewIcon className="w-4 h-4 mr-2" />
                        View Orders
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {users.length === 0 && (
                <div className="text-center py-16">
                  <EmptyIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 text-xl mb-4">No users found</p>
                  <p className="text-gray-400">Users will appear here once they register!</p>
                </div>
              )}
            </div>
          )}          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6 mt-8">
            <div className="neumorphic-card p-4 lg:p-6 rounded-2xl bg-white/60 backdrop-blur-sm border border-white/20">
              <div className="flex items-center">
                <div className="neumorphic-icon p-3 lg:p-4 rounded-xl bg-gradient-to-br from-blue-400 to-cyan-500 shadow-soft">
                  <PeopleIcon className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
                </div>
                <div className="ml-3 lg:ml-4">
                  <p className="text-xs lg:text-sm text-gray-600 font-medium">Total Users</p>
                  <p className="text-2xl lg:text-3xl font-bold text-gray-800">{users.length}</p>
                </div>
              </div>
            </div>

            <div className="neumorphic-card p-4 lg:p-6 rounded-2xl bg-white/60 backdrop-blur-sm border border-white/20">
              <div className="flex items-center">
                <div className="neumorphic-icon p-3 lg:p-4 rounded-xl bg-gradient-to-br from-purple-400 to-violet-500 shadow-soft">
                  <PeopleIcon className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
                </div>
                <div className="ml-3 lg:ml-4">
                  <p className="text-xs lg:text-sm text-gray-600 font-medium">Admins</p>
                  <p className="text-2xl lg:text-3xl font-bold text-gray-800">
                    {users.filter(user => user.role === 'admin').length}
                  </p>
                </div>
              </div>
            </div>

            <div className="neumorphic-card p-4 lg:p-6 rounded-2xl bg-white/60 backdrop-blur-sm border border-white/20 sm:col-span-2 lg:col-span-1">
              <div className="flex items-center">
                <div className="neumorphic-icon p-3 lg:p-4 rounded-xl bg-gradient-to-br from-green-400 to-emerald-500 shadow-soft">
                  <PeopleIcon className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
                </div>
                <div className="ml-3 lg:ml-4">
                  <p className="text-xs lg:text-sm text-gray-600 font-medium">Regular Users</p>
                  <p className="text-2xl lg:text-3xl font-bold text-gray-800">
                    {users.filter(user => user.role !== 'admin').length}
                  </p>
                </div>
              </div>
            </div>
          </div>          {/* User Orders Modal */}
          {showUserOrders && selectedUser && (
            <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
              <div className="neumorphic-card max-w-5xl w-full mx-auto p-4 lg:p-8 rounded-3xl max-h-[90vh] overflow-y-auto bg-white/80 backdrop-blur-sm">
                <div className="flex justify-between items-center mb-4 lg:mb-6">
                  <h2 className="text-xl lg:text-2xl font-bold text-gray-800 flex items-center">
                    <span className="w-2 h-6 lg:h-8 bg-gradient-to-b from-green-400 to-emerald-500 rounded-full mr-2 lg:mr-3"></span>
                    <span className="truncate">Orders for {selectedUser.name}</span>
                  </h2>
                  <button
                    onClick={() => setShowUserOrders(false)}
                    className="neumorphic-button-small w-8 h-8 lg:w-10 lg:h-10 rounded-full bg-gray-500 text-white flex items-center justify-center hover:shadow-soft transition-all duration-300 flex-shrink-0"
                  >
                    ✕
                  </button>
                </div>
                
                {loadingOrders ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading orders...</p>
                  </div>
                ) : (
                  <div>
                    {userOrders.length > 0 ? (
                      <div className="space-y-4">
                        {userOrders.map((order) => (
                          <div key={order._id} className="neumorphic-card p-4 lg:p-6 rounded-2xl bg-white/60 backdrop-blur-sm border border-white/20">
                            <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start mb-4 space-y-2 lg:space-y-0">
                              <div className="flex-1">
                                <div className="font-semibold text-gray-800 text-base lg:text-lg">Order #{order._id.slice(-8)}</div>
                                <div className="text-sm text-gray-500">
                                  {formatDate(order.placedAt || order.createdAt)}
                                </div>
                              </div>
                              <div className="flex flex-row lg:flex-col lg:text-right space-x-4 lg:space-x-0 lg:space-y-2 items-center lg:items-end">
                                <div className="font-bold text-green-600 text-lg lg:text-xl">₹{order.totalAmount}</div>
                                <span className={classNames('px-3 py-1 rounded-full text-xs font-medium border', getStatusColor(order.status))}>
                                  {order.status}
                                </span>
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 text-sm">
                              <div><span className="text-gray-500">Items:</span> <span className="text-gray-800 font-medium">{order.items?.length || 0}</span></div>
                              <div><span className="text-gray-500">Payment:</span> <span className="text-gray-800 font-medium">{order.paymentMethod}</span></div>
                              {order.shipping && (
                                <div className="sm:col-span-2 lg:col-span-1"><span className="text-gray-500">Address:</span> <span className="text-gray-800 font-medium truncate">{order.shipping.address}</span></div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <div className="text-4xl lg:text-6xl mb-4">📦</div>
                        <p className="text-gray-500 text-lg">No orders found for this user</p>
                        <p className="text-gray-400">This user hasn't placed any orders yet</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

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
        .neumorphic-icon {
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

export default AdminUsers; 