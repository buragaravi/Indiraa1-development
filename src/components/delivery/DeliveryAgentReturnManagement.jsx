import React, { useState, useEffect } from 'react';
import { 
  FaTruck, 
  FaMapMarkerAlt, 
  FaPhone,
  FaClock,
  FaBoxOpen,
  FaSpinner,
  FaSearch,
  FaCamera,
  FaCheckCircle,
  FaTimesCircle,
  FaRoute,
  FaUser,
  FaCalendarAlt,
  FaUpload
} from 'react-icons/fa';

const DeliveryAgentReturnManagement = () => {
  const [assignedPickups, setAssignedPickups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    status: 'all',
    date: '',
    page: 1,
    limit: 20
  });

  // Modal states
  const [selectedPickup, setSelectedPickup] = useState(null);
  const [showPickupModal, setShowPickupModal] = useState(false);
  const [showDeliveryModal, setShowDeliveryModal] = useState(false);

  // Form states
  const [pickupForm, setPickupForm] = useState({
    otp: '',
    customerPresent: true,
    alternateReceiver: '',
    pickupPhotos: [],
    notes: ''
  });

  const [deliveryForm, setDeliveryForm] = useState({
    warehouseNotes: '',
    conditionNotes: '',
    deliveryPhotos: []
  });

  const [actionLoading, setActionLoading] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [pickupImages, setPickupImages] = useState([]);
  const [deliveryImages, setDeliveryImages] = useState([]);

  const API_URL = 'http://localhost:5001';

  // Get delivery agent token
  const getToken = () => {
    return localStorage.getItem('deliveryToken') || localStorage.getItem('token');
  };

  // Fetch assigned pickups
  const fetchAssignedPickups = async () => {
    try {
      setLoading(true);
      const token = getToken();
      
      if (!token) {
        throw new Error('Delivery agent authentication required');
      }

      const queryParams = new URLSearchParams(filters);
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
    } catch (error) {
      console.error('Error fetching assigned pickups:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle image upload for pickup
  const handlePickupImageUpload = async (files) => {
    setUploadingImages(true);
    const uploadedFiles = [];

    try {
      for (const file of files) {
        if (!file.type.startsWith('image/')) {
          throw new Error('Please upload only image files');
        }

        if (file.size > 5 * 1024 * 1024) {
          throw new Error('Image size should be less than 5MB');
        }

        const reader = new FileReader();
        reader.onload = (e) => {
          uploadedFiles.push({
            file: file,
            preview: e.target.result,
            name: file.name
          });
          
          if (uploadedFiles.length === files.length) {
            setPickupImages(prev => [...prev, ...uploadedFiles]);
          }
        };
        reader.readAsDataURL(file);
      }
    } catch (error) {
      alert(error.message);
    } finally {
      setUploadingImages(false);
    }
  };

  // Handle image upload for delivery
  const handleDeliveryImageUpload = async (files) => {
    setUploadingImages(true);
    const uploadedFiles = [];

    try {
      for (const file of files) {
        if (!file.type.startsWith('image/')) {
          throw new Error('Please upload only image files');
        }

        if (file.size > 5 * 1024 * 1024) {
          throw new Error('Image size should be less than 5MB');
        }

        const reader = new FileReader();
        reader.onload = (e) => {
          uploadedFiles.push({
            file: file,
            preview: e.target.result,
            name: file.name
          });
          
          if (uploadedFiles.length === files.length) {
            setDeliveryImages(prev => [...prev, ...uploadedFiles]);
          }
        };
        reader.readAsDataURL(file);
      }
    } catch (error) {
      alert(error.message);
    } finally {
      setUploadingImages(false);
    }
  };

  // Complete pickup
  const completePickup = async (e) => {
    e.preventDefault();
    setActionLoading(true);

    try {
      const token = getToken();
      
      // Create form data for file upload
      const formData = new FormData();
      formData.append('otp', pickupForm.otp);
      formData.append('customerPresent', pickupForm.customerPresent);
      formData.append('alternateReceiver', pickupForm.alternateReceiver);
      formData.append('notes', pickupForm.notes);

      // Add pickup photos
      pickupImages.forEach((imageData) => {
        formData.append('pickupPhotos', imageData.file);
      });

      const response = await fetch(`${API_URL}/api/delivery/returns/${selectedPickup._id}/pickup`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to complete pickup');
      }

      alert('Pickup completed successfully!');
      setShowPickupModal(false);
      setPickupImages([]);
      fetchAssignedPickups();
      
    } catch (error) {
      console.error('Error completing pickup:', error);
      alert(`Failed to complete pickup: ${error.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  // Complete delivery to warehouse
  const completeDelivery = async (e) => {
    e.preventDefault();
    setActionLoading(true);

    try {
      const token = getToken();
      
      // Create form data for file upload
      const formData = new FormData();
      formData.append('warehouseNotes', deliveryForm.warehouseNotes);
      formData.append('conditionNotes', deliveryForm.conditionNotes);

      // Add delivery photos
      deliveryImages.forEach((imageData) => {
        formData.append('deliveryPhotos', imageData.file);
      });

      const response = await fetch(`${API_URL}/api/delivery/returns/${selectedPickup._id}/deliver`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to complete delivery');
      }

      alert('Delivery to warehouse completed successfully!');
      setShowDeliveryModal(false);
      setDeliveryImages([]);
      fetchAssignedPickups();
      
    } catch (error) {
      console.error('Error completing delivery:', error);
      alert(`Failed to complete delivery: ${error.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  // Open pickup modal
  const openPickupModal = (pickup) => {
    setSelectedPickup(pickup);
    setPickupForm({
      otp: '',
      customerPresent: true,
      alternateReceiver: '',
      pickupPhotos: [],
      notes: ''
    });
    setPickupImages([]);
    setShowPickupModal(true);
  };

  // Open delivery modal
  const openDeliveryModal = (pickup) => {
    setSelectedPickup(pickup);
    setDeliveryForm({
      warehouseNotes: '',
      conditionNotes: '',
      deliveryPhotos: []
    });
    setDeliveryImages([]);
    setShowDeliveryModal(true);
  };

  // Remove uploaded image
  const removePickupImage = (index) => {
    setPickupImages(prev => prev.filter((_, i) => i !== index));
  };

  const removeDeliveryImage = (index) => {
    setDeliveryImages(prev => prev.filter((_, i) => i !== index));
  };

  // Get status badge color
  const getStatusBadgeColor = (status) => {
    const colors = {
      'pickup_scheduled': 'bg-blue-100 text-blue-800',
      'picked_up': 'bg-green-100 text-green-800',
      'in_transit': 'bg-yellow-100 text-yellow-800',
      'delivered_to_warehouse': 'bg-purple-100 text-purple-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  // Format time slot
  const formatTimeSlot = (slot) => {
    const slots = {
      '9-12': '9:00 AM - 12:00 PM',
      '12-15': '12:00 PM - 3:00 PM',
      '15-18': '3:00 PM - 6:00 PM',
      '18-21': '6:00 PM - 9:00 PM'
    };
    return slots[slot] || slot;
  };

  // Get priority color
  const getPriorityColor = (priority) => {
    const colors = {
      'high': 'text-red-600',
      'medium': 'text-yellow-600',
      'low': 'text-green-600'
    };
    return colors[priority] || 'text-gray-600';
  };

  useEffect(() => {
    fetchAssignedPickups();
  }, [filters]);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center">
          <FaTruck className="mr-3 text-green-600" />
          Pickup & Delivery Management
        </h1>
        <p className="mt-1 text-gray-600">
          Manage return pickups and warehouse deliveries
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <select
            value={filters.status}
            onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value, page: 1 }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="pickup_scheduled">Pickup Scheduled</option>
            <option value="picked_up">Picked Up</option>
            <option value="in_transit">In Transit</option>
            <option value="delivered_to_warehouse">Delivered</option>
          </select>

          <input
            type="date"
            value={filters.date}
            onChange={(e) => setFilters(prev => ({ ...prev, date: e.target.value, page: 1 }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />

          <select
            value={filters.limit}
            onChange={(e) => setFilters(prev => ({ ...prev, limit: parseInt(e.target.value), page: 1 }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option value="10">10 per page</option>
            <option value="20">20 per page</option>
            <option value="50">50 per page</option>
          </select>

          <button
            onClick={fetchAssignedPickups}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center"
          >
            <FaSearch className="mr-2" />
            Refresh
          </button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-800">{error}</p>
          <button 
            onClick={() => {
              setError('');
              fetchAssignedPickups();
            }}
            className="mt-2 text-red-600 hover:text-red-800 underline"
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {assignedPickups.map((pickup) => {
            const totalAmount = pickup.items.reduce((sum, item) => 
              sum + (item.originalPrice * item.quantity), 0);
            const pickupDate = pickup.warehouseManagement?.pickup?.scheduledDate;
            const timeSlot = pickup.warehouseManagement?.pickup?.timeSlot;
            
            return (
              <div key={pickup._id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                {/* Header */}
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      #{pickup.returnRequestId}
                    </h3>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeColor(pickup.status)}`}>
                      {pickup.status.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>
                  <div className={`text-sm font-medium ${getPriorityColor(pickup.priority)}`}>
                    {pickup.priority?.toUpperCase()} PRIORITY
                  </div>
                </div>

                {/* Customer Info */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm">
                    <FaUser className="mr-2 text-gray-400" />
                    <span className="font-medium">{pickup.customerId?.name || 'N/A'}</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <FaPhone className="mr-2 text-gray-400" />
                    <span>{pickup.customerId?.phone}</span>
                  </div>
                  <div className="flex items-start text-sm">
                    <FaMapMarkerAlt className="mr-2 text-gray-400 mt-1" />
                    <span className="text-gray-700">
                      {pickup.pickupAddress?.fullAddress || 'Address not available'}
                    </span>
                  </div>
                </div>

                {/* Schedule Info */}
                {pickupDate && (
                  <div className="bg-blue-50 rounded-lg p-3 mb-4">
                    <div className="flex items-center text-sm">
                      <FaCalendarAlt className="mr-2 text-blue-500" />
                      <span className="font-medium">
                        {new Date(pickupDate).toLocaleDateString()}
                      </span>
                    </div>
                    {timeSlot && (
                      <div className="flex items-center text-sm mt-1">
                        <FaClock className="mr-2 text-blue-500" />
                        <span>{formatTimeSlot(timeSlot)}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Items Info */}
                <div className="bg-gray-50 rounded-lg p-3 mb-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{pickup.items.length} item(s)</span>
                    <span className="font-bold">₹{totalAmount}</span>
                  </div>
                  <div className="text-xs text-gray-600 mt-1">
                    Reason: {pickup.returnReason}
                  </div>
                </div>

                {/* Actions */}
                <div className="space-y-2">
                  {pickup.status === 'pickup_scheduled' && (
                    <button
                      onClick={() => openPickupModal(pickup)}
                      className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors flex items-center justify-center"
                    >
                      <FaBoxOpen className="mr-2" />
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
              
              <form onSubmit={completePickup} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Customer OTP *
                  </label>
                  <input
                    type="text"
                    required
                    maxLength="6"
                    value={pickupForm.otp}
                    onChange={(e) => setPickupForm(prev => ({ ...prev, otp: e.target.value }))}
                    placeholder="Enter 6-digit OTP from customer"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Customer Presence
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        checked={pickupForm.customerPresent === true}
                        onChange={() => setPickupForm(prev => ({ ...prev, customerPresent: true }))}
                        className="mr-2"
                      />
                      Customer was present
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        checked={pickupForm.customerPresent === false}
                        onChange={() => setPickupForm(prev => ({ ...prev, customerPresent: false }))}
                        className="mr-2"
                      />
                      Items received by alternate person
                    </label>
                  </div>
                </div>

                {!pickupForm.customerPresent && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Alternate Receiver Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={pickupForm.alternateReceiver}
                      onChange={(e) => setPickupForm(prev => ({ ...prev, alternateReceiver: e.target.value }))}
                      placeholder="Name of person who gave the items"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Pickup Photos
                  </label>
                  
                  {/* Upload Area */}
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={(e) => handlePickupImageUpload(Array.from(e.target.files))}
                      className="hidden"
                      id="pickup-upload"
                      disabled={uploadingImages}
                    />
                    <label
                      htmlFor="pickup-upload"
                      className="cursor-pointer flex flex-col items-center"
                    >
                      <FaCamera className="text-gray-400 text-2xl mb-2" />
                      <span className="text-sm text-gray-600">
                        Upload pickup photos
                      </span>
                    </label>
                  </div>

                  {/* Uploaded Images Preview */}
                  {pickupImages.length > 0 && (
                    <div className="mt-4 grid grid-cols-3 gap-4">
                      {pickupImages.map((image, index) => (
                        <div key={index} className="relative">
                          <img
                            src={image.preview}
                            alt={image.name}
                            className="w-full h-24 object-cover rounded-lg"
                          />
                          <button
                            type="button"
                            onClick={() => removePickupImage(index)}
                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 text-xs hover:bg-red-600"
                          >
                            <FaTimesCircle />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Pickup Notes
                  </label>
                  <textarea
                    value={pickupForm.notes}
                    onChange={(e) => setPickupForm(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Any additional notes about the pickup..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    rows="3"
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowPickupModal(false);
                      setPickupImages([]);
                    }}
                    className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={actionLoading || uploadingImages}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 flex items-center"
                  >
                    {actionLoading ? (
                      <>
                        <FaSpinner className="animate-spin mr-2" />
                        Completing...
                      </>
                    ) : (
                      <>
                        <FaCheckCircle className="mr-2" />
                        Complete Pickup
                      </>
                    )}
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
                Deliver to Warehouse - #{selectedPickup.returnRequestId}
              </h3>
              
              <form onSubmit={completeDelivery} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Warehouse Delivery Notes
                  </label>
                  <textarea
                    value={deliveryForm.warehouseNotes}
                    onChange={(e) => setDeliveryForm(prev => ({ ...prev, warehouseNotes: e.target.value }))}
                    placeholder="Notes for warehouse team..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows="3"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Item Condition Notes
                  </label>
                  <textarea
                    value={deliveryForm.conditionNotes}
                    onChange={(e) => setDeliveryForm(prev => ({ ...prev, conditionNotes: e.target.value }))}
                    placeholder="Current condition of items being delivered..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows="3"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Delivery Photos
                  </label>
                  
                  {/* Upload Area */}
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={(e) => handleDeliveryImageUpload(Array.from(e.target.files))}
                      className="hidden"
                      id="delivery-upload"
                      disabled={uploadingImages}
                    />
                    <label
                      htmlFor="delivery-upload"
                      className="cursor-pointer flex flex-col items-center"
                    >
                      <FaCamera className="text-gray-400 text-2xl mb-2" />
                      <span className="text-sm text-gray-600">
                        Upload delivery photos
                      </span>
                    </label>
                  </div>

                  {/* Uploaded Images Preview */}
                  {deliveryImages.length > 0 && (
                    <div className="mt-4 grid grid-cols-3 gap-4">
                      {deliveryImages.map((image, index) => (
                        <div key={index} className="relative">
                          <img
                            src={image.preview}
                            alt={image.name}
                            className="w-full h-24 object-cover rounded-lg"
                          />
                          <button
                            type="button"
                            onClick={() => removeDeliveryImage(index)}
                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 text-xs hover:bg-red-600"
                          >
                            <FaTimesCircle />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowDeliveryModal(false);
                      setDeliveryImages([]);
                    }}
                    className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={actionLoading || uploadingImages}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center"
                  >
                    {actionLoading ? (
                      <>
                        <FaSpinner className="animate-spin mr-2" />
                        Delivering...
                      </>
                    ) : (
                      <>
                        <FaTruck className="mr-2" />
                        Complete Delivery
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeliveryAgentReturnManagement;
