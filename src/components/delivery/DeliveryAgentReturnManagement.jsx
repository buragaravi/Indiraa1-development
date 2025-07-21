import React, { useState, useEffect } from 'react';
import { FaTruck, FaSpinner, FaCalendarAlt, FaClock, FaMapMarkerAlt, FaBox, FaRoute, FaCheckCircle, FaExclamationTriangle, FaWarehouse, FaPhone, FaEnvelope, FaClipboardCheck, FaCommentDots } from 'react-icons/fa';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const DeliveryAgentReturnManagement = () => {
  const [assignedPickups, setAssignedPickups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    status: '',
    date: '',
    limit: 10,
    page: 1
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalReturns: 0,
    hasNextPage: false,
    hasPrevPage: false
  });

  // Modal states
  const [showPickupModal, setShowPickupModal] = useState(false);
  const [showDeliveryModal, setShowDeliveryModal] = useState(false);
  const [selectedPickup, setSelectedPickup] = useState(null);
  
  // Form states
  const [pickupNote, setPickupNote] = useState('');
  const [deliveryNote, setDeliveryNote] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [customerSignature, setCustomerSignature] = useState('');
  const [actualPackages, setActualPackages] = useState(1);
  const [pickupCondition, setPickupCondition] = useState('good');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch assigned pickups
  const fetchAssignedPickups = async () => {
    try {
      setLoading(true);
      setError('');
      
      const token = localStorage.getItem('deliveryToken');
      const queryParams = new URLSearchParams();
      
      if (filters.status) queryParams.append('status', filters.status);
      if (filters.date) queryParams.append('date', filters.date);
      queryParams.append('limit', filters.limit);
      queryParams.append('page', filters.page);

      const response = await fetch(`${API_URL}/api/delivery/returns/assigned?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch assigned pickups');
      }

      const data = await response.json();
      setAssignedPickups(data.data || []);
      setPagination(data.pagination || {});
      
    } catch (error) {
      console.error('Error fetching assigned pickups:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignedPickups();
  }, [filters]);

  // Modal handlers
  const openPickupModal = (pickup) => {
    setSelectedPickup(pickup);
    setShowPickupModal(true);
    setPickupNote('');
    setVerificationCode('');
    setCustomerSignature('');
    setActualPackages(pickup.items.length);
    setPickupCondition('good');
  };

  const openDeliveryModal = (pickup) => {
    setSelectedPickup(pickup);
    setShowDeliveryModal(true);
    setDeliveryNote('');
  };

  const closeModals = () => {
    setShowPickupModal(false);
    setShowDeliveryModal(false);
    setSelectedPickup(null);
    setIsSubmitting(false);
  };

  // Complete pickup
  const handleCompletePickup = async (e) => {
    e.preventDefault();
    if (!selectedPickup) return;

    try {
      setIsSubmitting(true);
      const token = localStorage.getItem('deliveryToken');
      
      const pickupData = {
        note: pickupNote,
        verificationCode,
        customerSignature,
        actualPackages: parseInt(actualPackages),
        condition: pickupCondition,
        completedAt: new Date().toISOString()
      };

      const response = await fetch(`${API_URL}/api/delivery/returns/${selectedPickup._id}/pickup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(pickupData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to complete pickup');
      }

      // Refresh the list
      await fetchAssignedPickups();
      closeModals();
      alert('Pickup completed successfully!');
      
    } catch (error) {
      console.error('Error completing pickup:', error);
      alert(`Failed to complete pickup: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Complete delivery
  const handleCompleteDelivery = async (e) => {
    e.preventDefault();
    if (!selectedPickup) return;

    try {
      setIsSubmitting(true);
      const token = localStorage.getItem('deliveryToken');
      
      const deliveryData = {
        note: deliveryNote,
        deliveredAt: new Date().toISOString()
      };

      const response = await fetch(`${API_URL}/api/delivery/returns/${selectedPickup._id}/deliver`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(deliveryData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to complete delivery');
      }

      // Refresh the list
      await fetchAssignedPickups();
      closeModals();
      alert('Delivery completed successfully!');
      
    } catch (error) {
      console.error('Error completing delivery:', error);
      alert(`Failed to complete delivery: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Pagination handlers
  const goToPage = (page) => {
    setFilters(prev => ({ ...prev, page }));
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not scheduled';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'assigned': return 'bg-blue-100 text-blue-800';
      case 'picked_up': return 'bg-yellow-100 text-yellow-800';
      case 'in_transit': return 'bg-orange-100 text-orange-800';
      case 'delivered_to_warehouse': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'assigned': return 'Assigned for Pickup';
      case 'picked_up': return 'Picked Up';
      case 'in_transit': return 'In Transit';
      case 'delivered_to_warehouse': return 'Delivered to Warehouse';
      default: return status;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 py-4 sm:py-6 lg:py-8">
      <div className="w-full max-w-none px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16">
        {/* Header */}
        <div className="mb-4 sm:mb-6 lg:mb-8">
          <h1 className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-bold text-gray-800 flex items-center">
            <div className="w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 xl:w-16 xl:h-16 bg-gradient-to-br from-emerald-500 via-green-500 to-teal-500 rounded-2xl flex items-center justify-center shadow-xl shadow-emerald-200 mr-3 sm:mr-4">
              <FaTruck className="text-white text-sm sm:text-base lg:text-lg xl:text-xl" />
            </div>
            Pickup & Delivery Management
          </h1>
          <p className="mt-1 sm:mt-2 text-sm sm:text-base lg:text-lg text-gray-600">
            Manage return pickups and warehouse deliveries
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl sm:rounded-3xl shadow-xl shadow-emerald-100/50 border border-white/50 p-4 sm:p-6 lg:p-8 mb-4 sm:mb-6 lg:mb-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
            <select
              className="px-3 sm:px-4 py-2 sm:py-3 border border-emerald-200 rounded-xl sm:rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-xs sm:text-sm lg:text-base"
              value={filters.status}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value, page: 1 }))}
            >
              <option value="">All Statuses</option>
              <option value="assigned">Assigned</option>
              <option value="picked_up">Picked Up</option>
              <option value="in_transit">In Transit</option>
              <option value="delivered_to_warehouse">Delivered</option>
            </select>
            
            <input
              type="date"
              className="px-3 sm:px-4 py-2 sm:py-3 border border-emerald-200 rounded-xl sm:rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-xs sm:text-sm lg:text-base"
              value={filters.date}
              onChange={(e) => setFilters(prev => ({ ...prev, date: e.target.value, page: 1 }))}
            />
            
            <select
              className="px-3 sm:px-4 py-2 sm:py-3 border border-emerald-200 rounded-xl sm:rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-xs sm:text-sm lg:text-base"
              value={filters.limit}
              onChange={(e) => setFilters(prev => ({ ...prev, limit: parseInt(e.target.value), page: 1 }))}
            >
              <option value={5}>5 per page</option>
              <option value={10}>10 per page</option>
              <option value={20}>20 per page</option>
            </select>
            
            <button
              className="px-3 sm:px-4 py-2 sm:py-3 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-xl sm:rounded-2xl hover:from-emerald-600 hover:to-green-700 transition-all duration-300 text-xs sm:text-sm lg:text-base font-medium"
              onClick={fetchAssignedPickups}
            >
              Refresh
            </button>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800">{error}</p>
            <button
              className="mt-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              onClick={fetchAssignedPickups}
            >
              Try again
            </button>
          </div>
        )}

        {/* Pickups Grid */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <FaSpinner className="animate-spin text-2xl text-gray-400 mr-2" />
            <span className="text-gray-600">Loading assigned pickups...</span>
          </div>
        ) : assignedPickups.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <FaTruck className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-600">No assigned pickups found</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:gap-6 lg:gap-8">
            {assignedPickups.map((pickup) => {
              const totalAmount = pickup.items.reduce((sum, item) => 
                sum + (item.originalPrice * item.quantity), 0);
              const pickupDate = pickup.warehouseManagement?.pickup?.scheduledDate;
              const timeSlot = pickup.warehouseManagement?.pickup?.timeSlot;
              
              return (
                <div 
                  key={pickup._id} 
                  className="bg-white/80 backdrop-blur-sm rounded-2xl sm:rounded-3xl shadow-xl shadow-emerald-100/50 border border-white/50 p-4 sm:p-6 lg:p-8 hover:shadow-2xl hover:shadow-emerald-200/70 transition-all duration-300 hover:scale-[1.01] group"
                >
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 sm:gap-6">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 bg-gradient-to-br from-emerald-500 via-green-500 to-teal-500 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-200 group-hover:shadow-emerald-300 transition-all duration-300">
                          <FaTruck className="text-white text-sm sm:text-base lg:text-lg" />
                        </div>
                        <div>
                          <h3 className="text-base sm:text-lg lg:text-xl font-bold text-gray-800">
                            Return #{pickup.returnRequestId}
                          </h3>
                          <p className="text-xs sm:text-sm lg:text-base text-gray-600">
                            Order: {pickup.orderId}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-6">
                        <div className="flex items-center gap-2 sm:gap-3">
                          <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center">
                            <FaMapMarkerAlt className="text-white text-xs sm:text-sm" />
                          </div>
                          <div>
                            <p className="text-xs sm:text-sm text-gray-500">Customer</p>
                            <p className="text-xs sm:text-sm lg:text-base font-medium text-gray-800 truncate">
                              {pickup.userInfo?.name || 'N/A'}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 sm:gap-3">
                          <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                            <FaCalendarAlt className="text-white text-xs sm:text-sm" />
                          </div>
                          <div>
                            <p className="text-xs sm:text-sm text-gray-500">Pickup Date</p>
                            <p className="text-xs sm:text-sm lg:text-base font-medium text-gray-800">
                              {formatDate(pickupDate)}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 sm:gap-3">
                          <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                            <FaClock className="text-white text-xs sm:text-sm" />
                          </div>
                          <div>
                            <p className="text-xs sm:text-sm text-gray-500">Time Slot</p>
                            <p className="text-xs sm:text-sm lg:text-base font-medium text-gray-800">
                              {timeSlot || 'Not specified'}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 sm:gap-3">
                          <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-green-500 to-teal-500 rounded-lg flex items-center justify-center">
                            <FaBox className="text-white text-xs sm:text-sm" />
                          </div>
                          <div>
                            <p className="text-xs sm:text-sm text-gray-500">Items</p>
                            <p className="text-xs sm:text-sm lg:text-base font-medium text-gray-800">
                              {pickup.items.length} item(s)
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 sm:gap-3">
                          <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-lg flex items-center justify-center">
                            <FaPhone className="text-white text-xs sm:text-sm" />
                          </div>
                          <div>
                            <p className="text-xs sm:text-sm text-gray-500">Contact</p>
                            <p className="text-xs sm:text-sm lg:text-base font-medium text-gray-800">
                              {pickup.userInfo?.phone || 'N/A'}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 sm:gap-3">
                          <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center">
                            <span className="text-white text-xs sm:text-sm font-bold">₹</span>
                          </div>
                          <div>
                            <p className="text-xs sm:text-sm text-gray-500">Total Value</p>
                            <p className="text-xs sm:text-sm lg:text-base font-medium text-gray-800">
                              ₹{totalAmount.toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="mb-3 sm:mb-4">
                        <span className={`inline-flex items-center px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium ${getStatusColor(pickup.status)}`}>
                          {getStatusText(pickup.status)}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 sm:gap-3 lg:w-48">
                      {pickup.status === 'assigned' && (
                        <button
                          onClick={() => openPickupModal(pickup)}
                          className="w-full bg-gradient-to-r from-emerald-600 to-green-600 text-white py-2 px-4 rounded-md hover:from-emerald-700 hover:to-green-700 transition-colors flex items-center justify-center"
                        >
                          <FaClipboardCheck className="mr-2" />
                          Complete Pickup
                        </button>
                      )}
                      
                      {pickup.status === 'picked_up' && (
                        <button
                          onClick={() => openDeliveryModal(pickup)}
                          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center"
                        >
                          <FaTruck className="mr-2" />
                          Deliver to Warehouse
                        </button>
                      )}
                      
                      {pickup.status === 'in_transit' && (
                        <div className="w-full bg-yellow-100 text-yellow-800 py-2 px-4 rounded-md text-center">
                          <FaRoute className="inline mr-2" />
                          In Transit to Warehouse
                        </div>
                      )}
                      
                      {pickup.status === 'delivered_to_warehouse' && (
                        <div className="w-full bg-green-100 text-green-800 py-2 px-4 rounded-md text-center">
                          <FaCheckCircle className="inline mr-2" />
                          Delivered Successfully
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pickup Modal */}
        {showPickupModal && selectedPickup && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-2xl shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Complete Pickup - #{selectedPickup.returnRequestId}
                </h3>
                
                <form onSubmit={handleCompletePickup} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Verification Code (if provided by customer)
                    </label>
                    <input
                      type="text"
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter verification code"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Customer Name/Signature
                    </label>
                    <input
                      type="text"
                      value={customerSignature}
                      onChange={(e) => setCustomerSignature(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Customer name or digital signature"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Number of Packages
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={actualPackages}
                        onChange={(e) => setActualPackages(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Package Condition
                      </label>
                      <select
                        value={pickupCondition}
                        onChange={(e) => setPickupCondition(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      >
                        <option value="good">Good</option>
                        <option value="damaged">Damaged</option>
                        <option value="incomplete">Incomplete</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Pickup Notes
                    </label>
                    <textarea
                      value={pickupNote}
                      onChange={(e) => setPickupNote(e.target.value)}
                      rows="3"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Any additional notes about the pickup..."
                    />
                  </div>

                  <div className="flex justify-end space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={closeModals}
                      className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                      disabled={isSubmitting}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                    >
                      {isSubmitting ? 'Completing...' : 'Complete Pickup'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Delivery Modal */}
        {showDeliveryModal && selectedPickup && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-2xl shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Complete Warehouse Delivery - #{selectedPickup.returnRequestId}
                </h3>
                
                <form onSubmit={handleCompleteDelivery} className="space-y-4">
                  <div className="bg-gray-50 p-4 rounded-md mb-4">
                    <h4 className="font-medium text-gray-900 mb-2">Delivery Information</h4>
                    <p className="text-sm text-gray-600">
                      Delivering return items to the warehouse for processing.
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Delivery Notes
                    </label>
                    <textarea
                      value={deliveryNote}
                      onChange={(e) => setDeliveryNote(e.target.value)}
                      rows="3"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Any notes about the delivery to warehouse..."
                      required
                    />
                  </div>

                  <div className="flex justify-end space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={closeModals}
                      className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                      disabled={isSubmitting}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                    >
                      {isSubmitting ? 'Completing...' : 'Complete Delivery'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="mt-8 flex justify-center items-center space-x-2">
            <button
              onClick={() => goToPage(pagination.currentPage - 1)}
              disabled={!pagination.hasPrevPage}
              className="px-3 py-2 bg-gray-200 text-gray-600 rounded-md hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            
            <span className="px-4 py-2 text-sm text-gray-600">
              Page {pagination.currentPage} of {pagination.totalPages}
            </span>
            
            <button
              onClick={() => goToPage(pagination.currentPage + 1)}
              disabled={!pagination.hasNextPage}
              className="px-3 py-2 bg-gray-200 text-gray-600 rounded-md hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default DeliveryAgentReturnManagement;
