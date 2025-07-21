import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FaWarehouse, 
  FaTruck, 
  FaClipboardCheck, 
  FaCamera,
  FaSpinner,
  FaSearch,
  FaFilter,
  FaStar,
  FaUser,
  FaCalendarAlt,
  FaUpload,
  FaTrash,
  FaEye,
  FaPaperPlane
} from 'react-icons/fa';

const WarehouseReturnManagement = () => {
  const navigate = useNavigate();
  const [assignedReturns, setAssignedReturns] = useState([]);
  const [unassignedReturns, setUnassignedReturns] = useState([]);
  const [deliveryAgents, setDeliveryAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('assigned'); // 'assigned' or 'unassigned'
  const [filters, setFilters] = useState({
    status: 'all',
    page: 1,
    limit: 20
  });

  // Modal states
  const [selectedReturn, setSelectedReturn] = useState(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showQualityModal, setShowQualityModal] = useState(false);
  const [showRecommendationModal, setShowRecommendationModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);

  // Form states
  const [assignForm, setAssignForm] = useState({
    agentId: '',
    pickupDate: '',
    pickupTimeSlot: '',
    specialInstructions: ''
  });

  const [qualityForm, setQualityForm] = useState({
    qualityScore: 5,
    assessmentNotes: '',
    conditionPhotos: [],
    defectsFound: []
  });

  const [recommendationForm, setRecommendationForm] = useState({
    refundPercentage: 100,
    recommendation: '',
    justification: ''
  });

  const [reviewForm, setReviewForm] = useState({
    decision: '',
    comments: ''
  });

  const [actionLoading, setActionLoading] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [conditionImages, setConditionImages] = useState([]);

  const API_URL = import.meta.env.VITE_API_URL || 'https://indiraa1-backend.onrender.com';

  // Get warehouse manager token
  const getToken = () => {
    return localStorage.getItem('adminToken') || localStorage.getItem('subAdminToken');
  };

  // Fetch assigned returns
  const fetchAssignedReturns = async () => {
    try {
      setLoading(true);
      const token = getToken();
      
      if (!token) {
        throw new Error('Warehouse manager authentication required');
      }

      const queryParams = new URLSearchParams(filters);
      const response = await fetch(`${API_URL}/api/warehouse/returns/assigned?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Authentication failed. Please log in again.');
        } else if (response.status === 403) {
          throw new Error('Access denied. Insufficient permissions.');
        } else if (response.status === 404) {
          throw new Error('Return management service not found.');
        } else if (response.status >= 500) {
          throw new Error('Server error. Please try again later.');
        } else {
          throw new Error(`Failed to fetch assigned returns (${response.status})`);
        }
      }

      const data = await response.json();
      setAssignedReturns(Array.isArray(data.data?.returns) ? data.data.returns : []);
      setError(''); // Clear any previous errors
    } catch (error) {
      console.error('Error fetching assigned returns:', error);
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        setError('Network error. Please check your connection and try again.');
      } else {
        setError(error.message);
      }
      setAssignedReturns([]); // Ensure array on error
    } finally {
      setLoading(false);
    }
  };

  // Fetch available delivery agents
  const fetchDeliveryAgents = async () => {
    try {
      const token = getToken();
      const response = await fetch(`${API_URL}/api/delivery/agents`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setDeliveryAgents(data.agents || []);
      }
    } catch (error) {
      console.error('Error fetching delivery agents:', error);
    }
  };

  // Review return request (approve/reject)
  const reviewReturnRequest = async (e) => {
    e.preventDefault();
    setActionLoading(true);

    try {
      const token = getToken();
      const response = await fetch(`${API_URL}/api/warehouse/returns/${selectedReturn._id}/review`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          decision: reviewForm.decision,
          comments: reviewForm.comments
        })
      });

      if (!response.ok) {
        throw new Error('Failed to review return request');
      }

      alert(`Return request ${reviewForm.decision} successfully!`);
      setShowReviewModal(false);
      fetchAssignedReturns();
      
    } catch (error) {
      console.error('Error reviewing return:', error);
      alert(`Failed to review return: ${error.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  // Assign agent for pickup
  const assignAgentForPickup = async (e) => {
    e.preventDefault();
    setActionLoading(true);

    try {
      const token = getToken();
      const response = await fetch(`${API_URL}/api/warehouse/returns/${selectedReturn?._id}/assign-agent`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          agentId: assignForm.agentId,
          pickupDate: assignForm.pickupDate,
          pickupTimeSlot: assignForm.pickupTimeSlot,
          specialInstructions: assignForm.specialInstructions
        })
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Authentication failed. Please log in again.');
        } else if (response.status === 403) {
          throw new Error('Access denied. You do not have permission to assign agents.');
        } else if (response.status === 404) {
          throw new Error('Return request not found.');
        } else if (response.status === 409) {
          throw new Error('Agent is already assigned to this return.');
        } else if (response.status >= 500) {
          throw new Error('Server error. Please try again later.');
        } else {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || `Failed to assign agent (${response.status})`);
        }
      }

      // Success feedback with elegant notification
      setError(''); // Clear any previous errors
      setShowAssignModal(false);
      fetchAssignedReturns();
      
      // You could add a success notification state here instead of alert
      // For now, clearing error serves as success indication
      
    } catch (error) {
      console.error('Error assigning agent:', error);
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        setError('Network error. Please check your connection and try again.');
      } else {
        setError(`Agent Assignment Failed: ${error.message}`);
      }
    } finally {
      setActionLoading(false);
    }
  };

  // Handle image upload for quality assessment
  const handleImageUpload = async (files) => {
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
            setConditionImages(prev => [...prev, ...uploadedFiles]);
          }
        };
        reader.readAsDataURL(file);
      }
    } catch (error) {
      setError(`Image Upload Failed: ${error.message}`);
    } finally {
      setUploadingImages(false);
    }
  };

  // Complete quality assessment
  const completeQualityAssessment = async (e) => {
    e.preventDefault();
    setActionLoading(true);

    try {
      const token = getToken();
      
      // Create form data for file upload
      const formData = new FormData();
      formData.append('qualityScore', qualityForm.qualityScore);
      formData.append('assessmentNotes', qualityForm.assessmentNotes);
      formData.append('defectsFound', JSON.stringify(qualityForm.defectsFound));

      // Add condition photos
      conditionImages.forEach((imageData) => {
        formData.append('conditionPhotos', imageData.file);
      });

      const response = await fetch(`${API_URL}/api/warehouse/returns/${selectedReturn?._id}/quality-assessment`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error('Failed to complete quality assessment');
      }

      // Success - clear modal and refresh data
      setShowQualityModal(false);
      setConditionImages([]);
      fetchAssignedReturns();
      setError('Quality assessment completed successfully!'); // Use error state for success message temporarily
      
    } catch (error) {
      console.error('Error completing quality assessment:', error);
      setError(`Quality Assessment Failed: ${error.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  // Submit refund recommendation
  const submitRefundRecommendation = async (e) => {
    e.preventDefault();
    setActionLoading(true);

    try {
      const token = getToken();
      const response = await fetch(`${API_URL}/api/warehouse/returns/${selectedReturn?._id}/refund-recommendation`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          refundPercentage: recommendationForm.refundPercentage,
          recommendation: recommendationForm.recommendation,
          justification: recommendationForm.justification
        })
      });

      if (!response.ok) {
        throw new Error('Failed to submit recommendation');
      }

      // Success - clear modal and refresh data
      setShowRecommendationModal(false);
      fetchAssignedReturns();
      setError('Refund recommendation submitted successfully!'); // Use error state for success message temporarily
      
    } catch (error) {
      console.error('Error submitting recommendation:', error);
      setError(`Recommendation Submission Failed: ${error.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  // Open assign modal
  const openAssignModal = (returnRequest) => {
    setSelectedReturn(returnRequest);
    setAssignForm({
      agentId: '',
      pickupDate: '',
      pickupTimeSlot: '',
      specialInstructions: ''
    });
    setShowAssignModal(true);
  };

  // Open quality assessment modal
  const openQualityModal = (returnRequest) => {
    setSelectedReturn(returnRequest);
    setQualityForm({
      qualityScore: 5,
      assessmentNotes: '',
      conditionPhotos: [],
      defectsFound: []
    });
    setConditionImages([]);
    setShowQualityModal(true);
  };

  // Open recommendation modal
  const openRecommendationModal = (returnRequest) => {
    setSelectedReturn(returnRequest);
    const qualityScore = returnRequest.warehouseManagement?.qualityAssessment?.qualityScore || 5;
    const defaultPercentage = qualityScore >= 8 ? 100 : qualityScore >= 6 ? 75 : qualityScore >= 4 ? 50 : 25;
    
    setRecommendationForm({
      refundPercentage: defaultPercentage,
      recommendation: qualityScore >= 8 ? 'full_refund' : qualityScore >= 6 ? 'partial_refund' : 'minimal_refund',
      justification: ''
    });
    setShowRecommendationModal(true);
  };

  // Open review modal
  const openReviewModal = (returnRequest) => {
    setSelectedReturn(returnRequest);
    setReviewForm({
      decision: '',
      comments: ''
    });
    setShowReviewModal(true);
  };

  // Remove uploaded image
  const removeImage = (index) => {
    setConditionImages(prev => prev.filter((_, i) => i !== index));
  };

  // Get status badge color
  const getStatusBadgeColor = (status) => {
    const colors = {
      'warehouse_assigned': 'bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800 border border-purple-200',
      'pickup_scheduled': 'bg-gradient-to-r from-indigo-100 to-blue-100 text-indigo-800 border border-indigo-200',
      'picked_up': 'bg-gradient-to-r from-cyan-100 to-teal-100 text-cyan-800 border border-cyan-200',
      'in_warehouse': 'bg-gradient-to-r from-gray-100 to-slate-100 text-gray-800 border border-gray-200',
      'quality_checked': 'bg-gradient-to-r from-orange-100 to-amber-100 text-orange-800 border border-orange-200'
    };
    return colors[status] || 'bg-gradient-to-r from-gray-100 to-slate-100 text-gray-800 border border-gray-200';
  };

  // Calculate refund amount
  const calculateRefundAmount = (returnRequest, percentage) => {
    const originalAmount = returnRequest.items.reduce((sum, item) => 
      sum + (item.originalPrice * item.quantity), 0);
    return originalAmount * percentage / 100;
  };

  useEffect(() => {
    fetchAssignedReturns();
    fetchDeliveryAgents();
  }, [filters]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 py-4 sm:py-6 lg:py-8">
      <div className="w-full max-w-none px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16">
        {/* Header */}
        <div className="mb-4 sm:mb-6 lg:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-bold text-gray-800 flex items-center">
                <div className="w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 xl:w-16 xl:h-16 bg-gradient-to-br from-emerald-500 via-green-500 to-teal-500 rounded-2xl flex items-center justify-center shadow-xl shadow-emerald-200 mr-3 sm:mr-4">
                  <FaWarehouse className="text-white text-sm sm:text-base lg:text-lg xl:text-xl" />
                </div>
                Warehouse Return Management
              </h1>
              <p className="mt-1 sm:mt-2 text-sm sm:text-base lg:text-lg text-gray-600">
                Manage assigned return requests and quality assessments
              </p>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="px-3 sm:px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full shadow-lg border border-white/20">
                <span className="text-xs sm:text-sm font-medium text-gray-700">
                  Total Returns: <span className="text-emerald-600 font-semibold">{assignedReturns.length}</span>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Error/Success Display */}
        {error && (
          <div className={`mb-6 p-4 ${error.includes('successfully') 
            ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-l-4 border-green-400' 
            : 'bg-gradient-to-r from-red-50 to-pink-50 border-l-4 border-red-400'
            } rounded-lg shadow-lg`}>
            <div className="flex items-center">
              <div className="flex-shrink-0">
                {error.includes('successfully') ? (
                  <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
              <div className="ml-3">
                <p className={`text-sm font-medium ${error.includes('successfully') ? 'text-green-700' : 'text-red-700'}`}>
                  {error}
                </p>
              </div>
              <div className="ml-auto">
                <button
                  onClick={() => setError('')}
                  className={`${error.includes('successfully') ? 'text-green-400 hover:text-green-600' : 'text-red-400 hover:text-red-600'} transition-colors`}
                >
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-2">Status Filter</label>
              <select
                value={filters.status}
                onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value, page: 1 }))}
                className="w-full px-4 py-3 bg-white/80 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 shadow-sm"
              >
                <option value="all">All Status</option>
                <option value="warehouse_assigned">Newly Assigned</option>
                <option value="pickup_scheduled">Pickup Scheduled</option>
                <option value="picked_up">Picked Up</option>
                <option value="in_warehouse">In Warehouse</option>
                <option value="quality_checked">Quality Checked</option>
              </select>
            </div>

            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-2">Items per Page</label>
              <select
                value={filters.limit}
                onChange={(e) => setFilters(prev => ({ ...prev, limit: parseInt(e.target.value), page: 1 }))}
                className="w-full px-4 py-3 bg-white/80 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 shadow-sm"
              >
                <option value="10">10 per page</option>
                <option value="20">20 per page</option>
                <option value="50">50 per page</option>
              </select>
            </div>

            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-2">Actions</label>
              <button
                onClick={fetchAssignedReturns}
                disabled={loading}
                className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-4 py-3 rounded-xl hover:from-indigo-600 hover:to-purple-700 transition-all duration-200 flex items-center justify-center shadow-lg hover:shadow-xl disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <FaSpinner className="animate-spin mr-2" />
                    Loading...
                  </>
                ) : (
                  <>
                    <FaSearch className="mr-2" />
                    Refresh
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
        {/* Returns Content */}
        {loading ? (
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-12 text-center">
            <div className="flex flex-col items-center space-y-4">
              <div className="relative">
                <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <FaWarehouse className="text-indigo-600 text-xl" />
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-1">Loading Returns</h3>
                <p className="text-gray-600">Fetching assigned return requests...</p>
              </div>
            </div>
          </div>
        ) : !Array.isArray(assignedReturns) || assignedReturns.length === 0 ? (
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-12 text-center">
            <div className="flex flex-col items-center space-y-4">
              <div className="w-20 h-20 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center">
                <FaWarehouse className="text-3xl text-indigo-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-1">No Returns Assigned</h3>
                <p className="text-gray-600">No return requests are currently assigned to your warehouse</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200/50">
                <thead className="bg-gradient-to-r from-indigo-50 to-purple-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Return Details
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Customer & Items
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Status & Progress
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Quality Score
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {assignedReturns.map((returnRequest) => {
                  const totalAmount = returnRequest.items.reduce((sum, item) => 
                    sum + (item.originalPrice * item.quantity), 0);
                  const qualityScore = returnRequest.warehouseManagement?.qualityAssessment?.qualityScore;
                  
                  return (
                    <tr key={returnRequest._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            #{returnRequest.returnRequestId}
                          </div>
                          <div className="text-sm text-gray-500">
                            Reason: {returnRequest.returnReason}
                          </div>
                          <div className="text-sm text-gray-500">
                            {new Date(returnRequest.requestedAt).toLocaleDateString()}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {returnRequest.customerId?.name || 'N/A'}
                          </div>
                          <div className="text-sm text-gray-500">
                            {returnRequest.items.length} item(s) • ₹{totalAmount}
                          </div>
                          <div className="text-sm text-gray-500">
                            {returnRequest.customerId?.phone}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeColor(returnRequest.status)}`}>
                          {returnRequest.status.replace('_', ' ').toUpperCase()}
                        </span>
                        {returnRequest.warehouseManagement?.pickup?.assignedAgent && (
                          <div className="text-xs text-gray-500 mt-1">
                            Agent: {returnRequest.warehouseManagement.pickup.assignedAgent}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {qualityScore ? (
                          <div className="flex items-center">
                            <div className="flex items-center">
                              {[...Array(10)].map((_, i) => (
                                <FaStar
                                  key={i}
                                  className={`h-3 w-3 ${
                                    i < qualityScore ? 'text-yellow-400' : 'text-gray-300'
                                  }`}
                                />
                              ))}
                            </div>
                            <span className="ml-2 text-sm text-gray-600">{qualityScore}/10</span>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-500">Not assessed</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          {(returnRequest.status === 'requested' || returnRequest.status === 'admin_review') && (
                            <button
                              onClick={() => openReviewModal(returnRequest)}
                              className="text-purple-600 hover:text-purple-900 p-1"
                              title="Approve/Reject Return"
                            >
                              <FaCheck />
                            </button>
                          )}

                          {returnRequest.status === 'warehouse_assigned' && (
                            <button
                              onClick={() => openAssignModal(returnRequest)}
                              className="text-blue-600 hover:text-blue-900 p-1"
                              title="Assign Agent"
                            >
                              <FaTruck />
                            </button>
                          )}
                          
                          {returnRequest.status === 'in_warehouse' && (
                            <button
                              onClick={() => openQualityModal(returnRequest)}
                              className="text-green-600 hover:text-green-900 p-1"
                              title="Quality Assessment"
                            >
                              <FaClipboardCheck />
                            </button>
                          )}
                          
                          {returnRequest.status === 'quality_checked' && (
                            <button
                              onClick={() => openRecommendationModal(returnRequest)}
                              className="text-yellow-600 hover:text-yellow-900 p-1"
                              title="Submit Recommendation"
                            >
                              <FaPaperPlane />
                            </button>
                          )}
                          
                          <button
                            onClick={() => navigate(`/sub-admin/warehouse/returns/${returnRequest._id}`)}
                            className="text-gray-600 hover:text-gray-900 p-1"
                            title="View Details"
                          >
                            <FaEye />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          </div>
        )}

      {/* Assign Agent Modal */}
      {showAssignModal && selectedReturn && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-2xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Assign Delivery Agent - #{selectedReturn?.returnRequestId}
              </h3>
              
              <form onSubmit={assignAgentForPickup} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Delivery Agent *
                  </label>
                  <select
                    required
                    value={assignForm.agentId}
                    onChange={(e) => setAssignForm(prev => ({ ...prev, agentId: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select delivery agent</option>
                    {deliveryAgents.map((agent) => (
                      <option key={agent._id} value={agent._id}>
                        {agent.name} - {agent.phone}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Pickup Date *
                    </label>
                    <input
                      type="date"
                      required
                      value={assignForm.pickupDate}
                      onChange={(e) => setAssignForm(prev => ({ ...prev, pickupDate: e.target.value }))}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Time Slot *
                    </label>
                    <select
                      required
                      value={assignForm.pickupTimeSlot}
                      onChange={(e) => setAssignForm(prev => ({ ...prev, pickupTimeSlot: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select time slot</option>
                      <option value="9-12">9:00 AM - 12:00 PM</option>
                      <option value="12-15">12:00 PM - 3:00 PM</option>
                      <option value="15-18">3:00 PM - 6:00 PM</option>
                      <option value="18-21">6:00 PM - 9:00 PM</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Special Instructions
                  </label>
                  <textarea
                    value={assignForm.specialInstructions}
                    onChange={(e) => setAssignForm(prev => ({ ...prev, specialInstructions: e.target.value }))}
                    placeholder="Any special instructions for the pickup..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows="3"
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowAssignModal(false)}
                    className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center"
                  >
                    {actionLoading ? (
                      <>
                        <FaSpinner className="animate-spin mr-2" />
                        Assigning...
                      </>
                    ) : (
                      <>
                        <FaTruck className="mr-2" />
                        Assign Agent
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Review Return Modal */}
      {showReviewModal && selectedReturn && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-2xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Review Return Request - #{selectedReturn.returnRequestId}
              </h3>
              
              <form onSubmit={reviewReturnRequest} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Decision *
                  </label>
                  <select
                    required
                    value={reviewForm.decision}
                    onChange={(e) => setReviewForm(prev => ({ ...prev, decision: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select decision</option>
                    <option value="approve">Approve</option>
                    <option value="reject">Reject</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Comments
                  </label>
                  <textarea
                    value={reviewForm.comments}
                    onChange={(e) => setReviewForm(prev => ({ ...prev, comments: e.target.value }))}
                    placeholder="Add your comments here..."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowReviewModal(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md disabled:opacity-50 flex items-center"
                  >
                    {actionLoading ? (
                      <>
                        <FaSpinner className="animate-spin mr-2" />
                        Processing...
                      </>
                    ) : (
                      'Submit Review'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Quality Assessment Modal */}
      {showQualityModal && selectedReturn && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-3xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Quality Assessment - #{selectedReturn?.returnRequestId}
              </h3>
              
              <form onSubmit={completeQualityAssessment} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quality Score (1-10) *
                  </label>
                  <div className="flex items-center space-x-4">
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={qualityForm.qualityScore}
                      onChange={(e) => setQualityForm(prev => ({ ...prev, qualityScore: parseInt(e.target.value) }))}
                      className="flex-1"
                    />
                    <span className="text-lg font-bold text-blue-600 w-8">
                      {qualityForm.qualityScore}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    1 = Poor condition, 10 = Excellent condition
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Assessment Notes *
                  </label>
                  <textarea
                    required
                    value={qualityForm.assessmentNotes}
                    onChange={(e) => setQualityForm(prev => ({ ...prev, assessmentNotes: e.target.value }))}
                    placeholder="Detailed assessment of item condition, defects found, etc..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows="4"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Condition Photos
                  </label>
                  
                  {/* Upload Area */}
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={(e) => handleImageUpload(Array.from(e.target.files))}
                      className="hidden"
                      id="condition-upload"
                      disabled={uploadingImages}
                    />
                    <label
                      htmlFor="condition-upload"
                      className="cursor-pointer flex flex-col items-center"
                    >
                      <FaCamera className="text-gray-400 text-2xl mb-2" />
                      <span className="text-sm text-gray-600">
                        Upload condition photos
                      </span>
                    </label>
                  </div>

                  {/* Uploaded Images Preview */}
                  {conditionImages.length > 0 && (
                    <div className="mt-4 grid grid-cols-3 gap-4">
                      {conditionImages.map((image, index) => (
                        <div key={index} className="relative">
                          <img
                            src={image.preview}
                            alt={image.name}
                            className="w-full h-24 object-cover rounded-lg"
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 text-xs hover:bg-red-600"
                          >
                            <FaTrash />
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
                      setShowQualityModal(false);
                      setConditionImages([]);
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
                        Saving...
                      </>
                    ) : (
                      <>
                        <FaClipboardCheck className="mr-2" />
                        Complete Assessment
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Refund Recommendation Modal */}
      {showRecommendationModal && selectedReturn && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-2xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Refund Recommendation - #{selectedReturn?.returnRequestId}
              </h3>
              
              <form onSubmit={submitRefundRecommendation} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quality Score: {selectedReturn?.warehouseManagement?.qualityAssessment?.qualityScore || 'N/A'}/10
                  </label>
                  <div className="bg-gray-50 p-3 rounded text-sm">
                    {selectedReturn?.warehouseManagement?.qualityAssessment?.assessmentNotes || 'No assessment notes'}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Refund Percentage *
                  </label>
                  <div className="flex items-center space-x-4">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      step="5"
                      value={recommendationForm.refundPercentage}
                      onChange={(e) => setRecommendationForm(prev => ({ 
                        ...prev, 
                        refundPercentage: parseInt(e.target.value) 
                      }))}
                      className="flex-1"
                    />
                    <span className="text-lg font-bold text-blue-600 w-12">
                      {recommendationForm.refundPercentage}%
                    </span>
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    Recommended refund: ₹{calculateRefundAmount(selectedReturn, recommendationForm.refundPercentage).toFixed(2)}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Recommendation Type *
                  </label>
                  <select
                    required
                    value={recommendationForm.recommendation}
                    onChange={(e) => setRecommendationForm(prev => ({ ...prev, recommendation: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select recommendation</option>
                    <option value="full_refund">Full Refund (100%)</option>
                    <option value="partial_refund">Partial Refund</option>
                    <option value="minimal_refund">Minimal Refund</option>
                    <option value="no_refund">No Refund</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Justification *
                  </label>
                  <textarea
                    required
                    value={recommendationForm.justification}
                    onChange={(e) => setRecommendationForm(prev => ({ ...prev, justification: e.target.value }))}
                    placeholder="Explain the reasoning for this refund recommendation..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows="4"
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowRecommendationModal(false)}
                    className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 disabled:opacity-50 flex items-center"
                  >
                    {actionLoading ? (
                      <>
                        <FaSpinner className="animate-spin mr-2" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <FaPaperPlane className="mr-2" />
                        Submit Recommendation
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
    </div>
  );
};

export default WarehouseReturnManagement;
