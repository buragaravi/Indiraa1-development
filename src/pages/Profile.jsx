import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  FiUser, 
  FiMail, 
  FiPhone, 
  FiMapPin, 
  FiEdit3, 
  FiSave, 
  FiX, 
  FiPlus,
  FiHome,
  FiCheckCircle,
  FiAlertCircle,
  FiShoppingBag,
  FiPackage,
  FiTruck,
  FiClock,
  FiEye,
  FiChevronRight
} from 'react-icons/fi';

const Profile = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
  });  const [newAddress, setNewAddress] = useState({
    name: '',
    address: '',
    phone: '',
  });
  const [loading, setLoading] = useState(true);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [addressLoading, setAddressLoading] = useState(false);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [profileData, setProfileData] = useState(null);  const [recentOrders, setRecentOrders] = useState([]);
  const [allOrders, setAllOrders] = useState([]);
  const [totalOrders, setTotalOrders] = useState(0);
  const [showAllOrders, setShowAllOrders] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;    }
    fetchUserProfile();
    fetchRecentOrders();
  }, [navigate]);
  const fetchRecentOrders = async () => {
    setOrdersLoading(true);
    try {
      const response = await fetch('http://localhost:5001/api/products/orders/user', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });      if (response.ok) {
        const data = await response.json();
        const orders = data.orders || [];
        setTotalOrders(orders.length);
        // Sort by creation date (newest first)
        const sortedOrders = orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setAllOrders(sortedOrders);
        setRecentOrders(sortedOrders.slice(0, 5));
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setOrdersLoading(false);
    }
  };

  const fetchUserProfile = async () => {
    try {
      const response = await fetch('http://localhost:5001/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setProfileData(data.user);
        setFormData({
          name: data.user.name || '',
          phone: data.user.phone || '',
        });
      } else {
        if (response.status === 401) {
          localStorage.removeItem('token');
          navigate('/login');
        } else {
          setError('Failed to fetch profile data');
        }
      }
    } catch (error) {
      setError('Error fetching profile data');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    setNewAddress(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const updateProfile = async (e) => {
    e.preventDefault();
    setUpdateLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch('http://localhost:5001/api/auth/me', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        const data = await response.json();
        setProfileData(data.user);
        setSuccess('Profile updated successfully');
        setIsEditing(false);
        setTimeout(() => setSuccess(null), 3000);
      } else {
        const data = await response.json();
        setError(data.message || 'Error updating profile');
      }
    } catch (error) {
      setError('Error updating profile');
    } finally {
      setUpdateLoading(false);
    }
  };

  const addAddress = async (e) => {
    e.preventDefault();
    setAddressLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch('http://localhost:5001/api/auth/address/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(newAddress)
      });      if (response.ok) {
        await fetchUserProfile();
        setSuccess('Address added successfully');
        setNewAddress({ name: '', address: '', phone: '' });
        setShowAddAddress(false);
        setTimeout(() => setSuccess(null), 3000);
      } else {
        const data = await response.json();
        setError(data.message || 'Error adding address');
      }
    } catch (error) {
      setError('Error adding address');
    } finally {
      setAddressLoading(false);
    }
  };
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#f8faf8] to-white flex justify-center items-center">
        <motion.div 
          className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-2xl"
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        >
          <div className="w-8 h-8 border-4 border-[#2ecc71] border-t-transparent rounded-full"></div>
        </motion.div>
      </div>
    );
  }
  if (!profileData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#f8faf8] to-white flex justify-center items-center">
        <motion.div 
          className="text-center bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-2xl"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <FiUser className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 text-lg">Please log in to view your profile.</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f8faf8] to-white py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <motion.div 
          className="text-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-4xl font-bold text-gray-800 mb-2">My Profile</h1>
          <p className="text-gray-600">Manage your account information and preferences</p>
        </motion.div>

        {/* Status Messages */}
        {error && (
          <motion.div 
            className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-2xl flex items-center gap-3"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <FiAlertCircle className="w-5 h-5 flex-shrink-0" />
            {error}
          </motion.div>
        )}
        
        {success && (
          <motion.div 
            className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-2xl flex items-center gap-3"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <FiCheckCircle className="w-5 h-5 flex-shrink-0" />
            {success}
          </motion.div>
        )}        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 mb-6 md:mb-8">
          {/* Profile Information */}
          <motion.div 
            className="bg-white/80 backdrop-blur-sm rounded-2xl md:rounded-3xl p-6 md:p-8 shadow-lg border border-white/20"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 md:mb-6 gap-3">
              <div className="flex items-center gap-3">                <div className="w-10 h-10 md:w-12 md:h-12 bg-[#2ecc71] rounded-xl md:rounded-2xl flex items-center justify-center">
                  <FiUser className="w-5 h-5 md:w-6 md:h-6 text-white" />
                </div>
                <h2 className="text-xl md:text-2xl font-bold text-gray-800">Personal Information</h2>
              </div>
              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-3 md:px-4 py-2 bg-[#2ecc71] text-white rounded-lg md:rounded-xl hover:bg-[#27ae60] transition-all duration-200 shadow-lg text-sm md:text-base"
                >
                  <FiEdit3 className="w-4 h-4" />
                  Edit
                </button>
              )}
            </div>
            
            {isEditing ? (
              <form onSubmit={updateProfile} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <FiUser className="w-4 h-4" />
                    Username
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={profileData?.username || ''}
                      disabled
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-500 cursor-not-allowed"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <FiUser className="w-4 h-4" />
                    Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-white/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2ecc71] focus:border-transparent transition-all duration-200"
                    placeholder="Enter your full name"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <FiPhone className="w-4 h-4" />
                    Phone
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-white/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2ecc71] focus:border-transparent transition-all duration-200"
                    placeholder="Enter your phone number"
                  />
                </div>
                
                <div className="flex gap-4">
                  <button
                    type="submit"
                    disabled={updateLoading}
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-[#2ecc71] text-white rounded-xl hover:bg-[#27ae60] transition-all duration-200 shadow-lg disabled:opacity-50"
                  >
                    <FiSave className="w-4 h-4" />
                    {updateLoading ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditing(false);
                      setFormData({
                        name: profileData.name || '',
                        phone: profileData.phone || '',
                      });
                    }}
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all duration-200"
                  >
                    <FiX className="w-4 h-4" />
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <FiUser className="w-4 h-4" />
                    Username
                  </label>
                  <div className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800">
                    {profileData?.username}
                  </div>
                </div>
                  <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <FiUser className="w-4 h-4" />
                    Name
                  </label>
                  <div className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800">
                    {profileData?.name || 'Not set'}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <FiMail className="w-4 h-4" />
                    Email
                  </label>
                  <div className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800">
                    {profileData?.email || 'Not set'}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <FiPhone className="w-4 h-4" />
                    Phone
                  </label>
                  <div className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800">
                    {profileData?.phone || 'Not set'}
                  </div>
                </div>
              </div>
            )}
          </motion.div>

          {/* Addresses */}
          <motion.div 
            className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-lg border border-white/20"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
                  <FiMapPin className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800">Addresses</h2>
              </div>
              <button
                onClick={() => setShowAddAddress(!showAddAddress)}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-lg"
              >
                <FiPlus className="w-4 h-4" />
                Add Address
              </button>
            </div>
            
            {/* Existing Addresses */}
            <div className={`${showAddAddress ? 'mb-6' : ''}`}>
              {profileData?.addresses && profileData.addresses.length > 0 ? (
                <div className="space-y-4">
                  {profileData.addresses.map((address, index) => (
                    <motion.div 
                      key={index} 
                      className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <h4 className="font-semibold text-gray-800 flex items-center gap-2">
                        <FiMapPin className="w-4 h-4 text-blue-500" />
                        {address.name}
                      </h4>
                      <p className="text-gray-600 mt-1">{address.address}</p>
                      <p className="text-gray-600 flex items-center gap-2 mt-1">
                        <FiPhone className="w-4 h-4" />
                        {address.phone}
                      </p>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <FiMapPin className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>No addresses added yet.</p>
                </div>
              )}
            </div>

            {/* Add New Address Form */}
            {showAddAddress && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="border-t border-gray-200 pt-6"
              >
                <h3 className="text-lg font-medium text-gray-700 mb-4 flex items-center gap-2">
                  <FiPlus className="w-5 h-5" />
                  Add New Address
                </h3>
                <form onSubmit={addAddress} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Address Name</label>
                    <input
                      type="text"
                      name="name"
                      value={newAddress.name}
                      onChange={handleAddressChange}
                      placeholder="e.g., Home, Office"
                      className="w-full px-4 py-3 bg-white/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Full Address</label>
                    <textarea
                      name="address"
                      value={newAddress.address}
                      onChange={handleAddressChange}
                      rows="3"
                      placeholder="Enter your complete address"
                      className="w-full px-4 py-3 bg-white/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                    <input
                      type="tel"
                      name="phone"
                      value={newAddress.phone}
                      onChange={handleAddressChange}
                      placeholder="Contact number for this address"
                      className="w-full px-4 py-3 bg-white/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      required
                    />
                  </div>
                  
                  <div className="flex gap-4">
                    <button
                      type="submit"
                      disabled={addressLoading}
                      className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-lg disabled:opacity-50"
                    >
                      <FiPlus className="w-4 h-4" />
                      {addressLoading ? 'Adding...' : 'Add Address'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowAddAddress(false);
                        setNewAddress({ name: '', address: '', phone: '' });
                      }}
                      className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all duration-200"
                    >
                      <FiX className="w-4 h-4" />
                      Cancel
                    </button>
                  </div>
                </form>
              </motion.div>
            )}
          </motion.div>
        </div>        {/* Recent Orders Section */}
        <motion.div 
          id="orders-section"
          className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-lg border border-white/20"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-600 rounded-2xl flex items-center justify-center">
                <FiShoppingBag className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-800">Recent Orders</h2>
                <p className="text-gray-600 text-sm">Your latest purchases</p>
              </div>
            </div>            {totalOrders > 5 && (
              <button
                onClick={() => navigate('/orders')}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-xl hover:from-orange-600 hover:to-red-700 transition-all duration-200 shadow-lg"
              >
                <FiEye className="w-4 h-4" />
                View All ({totalOrders})
              </button>
            )}
          </div>
          
          {ordersLoading ? (
            <div className="flex justify-center py-8">
              <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
            </div>          ) : recentOrders.length > 0 ? (
            <div className="space-y-4 relative">
              {(showAllOrders ? allOrders : recentOrders).map((order, index) => (
                <motion.div
                  key={order._id}
                  className="p-4 bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 rounded-xl cursor-pointer hover:shadow-md transition-all duration-200"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}                  onClick={() => navigate(`/orders/${order._id}`)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm">
                        {order.status === 'delivered' ? (
                          <FiPackage className="w-5 h-5 text-green-500" />
                        ) : order.status === 'shipped' ? (
                          <FiTruck className="w-5 h-5 text-blue-500" />
                        ) : (
                          <FiClock className="w-5 h-5 text-orange-500" />
                        )}
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-800">Order #{order._id.slice(-8)}</h4>
                        <p className="text-sm text-gray-600">
                          {new Date(order.createdAt).toLocaleDateString()} • 
                          <span className={`ml-1 capitalize ${
                            order.status === 'delivered' ? 'text-green-600' :
                            order.status === 'shipped' ? 'text-blue-600' :
                            'text-orange-600'
                          }`}>
                            {order.status}
                          </span>
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="font-bold text-gray-800">₹{order.total}</p>
                        <p className="text-sm text-gray-600">{order.items?.length || 0} items</p>
                      </div>
                      <FiChevronRight className="w-5 h-5 text-gray-400" />
                    </div>
                  </div>
                </motion.div>
              ))}
                {/* Blur effect for "see more" when orders > 5 */}              {totalOrders > 5 && !showAllOrders && (
                <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-white/90 to-transparent rounded-b-3xl flex items-end justify-center pb-4">
                  <button
                    onClick={() => navigate('/orders')}
                    className="px-6 py-2 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl hover:bg-white/90 transition-all duration-200 shadow-lg"
                  >
                    View all {totalOrders} orders
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <FiShoppingBag className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>No orders yet.</p>
              <button
                onClick={() => navigate('/products')}
                className="mt-4 px-6 py-2 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-xl hover:from-orange-600 hover:to-red-700 transition-all duration-200 shadow-lg"
              >
                Start Shopping
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default Profile;
