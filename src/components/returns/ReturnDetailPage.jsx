import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  FaArrowLeft, 
  FaBox, 
  FaUser, 
  FaCalendarAlt, 
  FaImage,
  FaSpinner,
  FaCheckCircle,
  FaTimesCircle,
  FaClock,
  FaWarehouse,
  FaTruck,
  FaCoins,
  FaExclamationTriangle,
  FaEye
} from 'react-icons/fa';

const ReturnDetailPage = () => {
  const { returnId } = useParams();
  const navigate = useNavigate();
  const [returnDetails, setReturnDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedImage, setSelectedImage] = useState('');
  const [showImageModal, setShowImageModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // Modal states for different actions
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showQualityModal, setShowQualityModal] = useState(false);
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [showProcessModal, setShowProcessModal] = useState(false);
  const [showPickupModal, setShowPickupModal] = useState(false);
  const [showReceiveModal, setShowReceiveModal] = useState(false);
  const [showChargeModal, setShowChargeModal] = useState(false);

  // Form states
  const [reviewForm, setReviewForm] = useState({
    decision: '',
    comments: '',
    pickupCharge: {
      isFree: true,
      amount: 50,
      reason: ''
    }
  });
  
  const [qualityForm, setQualityForm] = useState({
    qualityScore: 5,
    refundPercentage: 100,
    assessmentNotes: '',
    conditionPhotos: [],
    defectsFound: [],
    itemCondition: 'good'
  });

  const [refundForm, setRefundForm] = useState({
    decision: 'approved',
    refundType: 'full', // 'full' or 'partial'
    finalAmount: '',
    refundPercentage: 100,
    deductions: [],
    adminNotes: ''
  });

  const [pickupForm, setPickupForm] = useState({
    date: '',
    timeSlot: '',
    instructions: ''
  });

  const [chargeForm, setChargeForm] = useState({
    isFree: true,
    amount: 50,
    reason: 'Return pickup service'
  });

  // Receive items form
  const [receiveForm, setReceiveForm] = useState({
    condition: '',
    notes: '',
    receivedAt: new Date().toISOString().slice(0, 16)
  });

  const API_URL = import.meta.env.VITE_API_URL || 'https://indiraa1-backend.onrender.com';

  // Get auth token (works for admin, sub-admin, and warehouse)
  const getAuthToken = () => {
    // Try different token storage keys
    return localStorage.getItem('adminToken') || 
           localStorage.getItem('token') || 
           localStorage.getItem('subAdminToken');
  };

  useEffect(() => {
    fetchReturnDetails();
  }, [returnId]);

  const fetchReturnDetails = async () => {
    try {
      setLoading(true);
      const token = getAuthToken();
      
      if (!token) {
        throw new Error('Authentication required');
      }

      // Use admin endpoint for all roles since it has authenticateAdminOrSubAdmin
      const response = await fetch(`${API_URL}/api/admin/returns/${returnId}/details`, {
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
          throw new Error('Return request not found.');
        } else {
          throw new Error('Failed to fetch return details');
        }
      }

      const data = await response.json();
      setReturnDetails(data.data?.return || data.data || null);
    } catch (error) {
      console.error('Error fetching return details:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const statusColors = {
      requested: 'bg-amber-50 text-amber-700 border border-amber-200',
      admin_review: 'bg-blue-50 text-blue-700 border border-blue-200',
      approved: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
      rejected: 'bg-rose-50 text-rose-700 border border-rose-200',
      warehouse_assigned: 'bg-purple-50 text-purple-700 border border-purple-200',
      pickup_scheduled: 'bg-indigo-50 text-indigo-700 border border-indigo-200',
      picked_up: 'bg-orange-50 text-orange-700 border border-orange-200',
      in_warehouse: 'bg-teal-50 text-teal-700 border border-teal-200',
      quality_checked: 'bg-cyan-50 text-cyan-700 border border-cyan-200',
      refund_approved: 'bg-green-50 text-green-700 border border-green-200',
      refund_processed: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
      completed: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
      cancelled: 'bg-gray-50 text-gray-700 border border-gray-200'
    };
    return statusColors[status] || 'bg-gray-50 text-gray-700 border border-gray-200';
  };

  const getStatusIcon = (status) => {
    const statusIcons = {
      requested: <FaClock className="w-4 h-4 text-amber-500" />,
      admin_review: <FaEye className="w-4 h-4 text-blue-500" />,
      approved: <FaCheckCircle className="w-4 h-4 text-emerald-500" />,
      rejected: <FaTimesCircle className="w-4 h-4 text-rose-500" />,
      warehouse_assigned: <FaWarehouse className="w-4 h-4 text-purple-500" />,
      pickup_scheduled: <FaTruck className="w-4 h-4 text-indigo-500" />,
      picked_up: <FaTruck className="w-4 h-4 text-orange-500" />,
      in_warehouse: <FaWarehouse className="w-4 h-4 text-teal-500" />,
      quality_checked: <FaCheckCircle className="w-4 h-4 text-cyan-500" />,
      refund_approved: <FaCoins className="w-4 h-4 text-green-500" />,
      refund_processed: <FaCheckCircle className="w-4 h-4 text-emerald-500" />,
      completed: <FaCheckCircle className="w-4 h-4 text-emerald-500" />,
      cancelled: <FaTimesCircle className="w-4 h-4 text-gray-500" />
    };
    return statusIcons[status] || <FaClock className="w-4 h-4 text-gray-500" />;
  };

  const openImageModal = (imageUrl) => {
    setSelectedImage(imageUrl);
    setShowImageModal(true);
  };

  // Action functions
  const reviewReturnRequest = async (e) => {
    e.preventDefault();
    setActionLoading(true);

    try {
      const token = getAuthToken();
      const isAdmin = localStorage.getItem('adminToken');
      const endpoint = isAdmin ? 
        `${API_URL}/api/admin/returns/${returnId}/review` : 
        `${API_URL}/api/warehouse/returns/${returnId}/review`;

      const response = await fetch(endpoint, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          decision: reviewForm.decision,
          adminComments: reviewForm.comments,
          comments: reviewForm.comments
        })
      });

      if (!response.ok) {
        throw new Error('Failed to review return request');
      }

      alert(`Return request ${reviewForm.decision} successfully!`);
      setShowReviewModal(false);
      fetchReturnDetails();
      
    } catch (error) {
      console.error('Error reviewing return:', error);
      alert(`Failed to review return: ${error.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  const processQualityAssessment = async (e) => {
    e.preventDefault();
    setActionLoading(true);

    try {
      const token = getAuthToken();
      // Use warehouse endpoint for quality assessment for both admin and warehouse
      const endpoint = `${API_URL}/api/warehouse/returns/${returnId}/assess`;

      const response = await fetch(endpoint, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          itemCondition: qualityForm.itemCondition,
          refundEligibility: qualityForm.refundPercentage > 80 ? 'full' : 
                           qualityForm.refundPercentage > 50 ? 'partial' : 'none',
          refundPercentage: qualityForm.refundPercentage,
          warehouseNotes: qualityForm.assessmentNotes,
          conditionDetails: {
            packaging: qualityForm.packagingIntact ? 'intact' : 'damaged',
            productCondition: qualityForm.qualityScore >= 8 ? 'new' : qualityForm.qualityScore >= 5 ? 'used' : 'damaged',
            accessories: qualityForm.accessoriesComplete ? 'complete' : 'partial',
            functionality: qualityForm.qualityScore >= 6 ? 'working' : qualityForm.qualityScore >= 3 ? 'partial' : 'not_working'
          },
          restockDecision: {
            canRestock: qualityForm.qualityScore >= 7,
            restockCondition: qualityForm.qualityScore >= 7 ? 'good_condition' : 'poor_condition',
            restockValue: qualityForm.qualityScore >= 7 ? qualityForm.refundPercentage : 0,
            restockNotes: qualityForm.qualityScore >= 7 ? 'Item suitable for restocking' : 'Item not suitable for restocking due to condition'
          }
        })
      });

      if (!response.ok) {
        throw new Error('Failed to complete quality assessment');
      }

      alert('Quality assessment completed successfully!');
      setShowQualityModal(false);
      fetchReturnDetails();
      
    } catch (error) {
      console.error('Error completing quality assessment:', error);
      alert(`Failed to complete quality assessment: ${error.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  const makeFinalDecision = async (e) => {
    e.preventDefault();
    setActionLoading(true);

    try {
      const token = getAuthToken();
      // Use warehouse endpoint for final decision for both admin and warehouse  
      const endpoint = `${API_URL}/api/warehouse/returns/${returnId}/final-decision`;

      const response = await fetch(endpoint, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          decision: refundForm.decision,
          finalAmount: refundForm.finalAmount,
          deductions: refundForm.deductions,
          adminNotes: refundForm.adminNotes
        })
      });

      if (!response.ok) {
        throw new Error('Failed to make final decision');
      }

      alert('Final decision made successfully!');
      setShowRefundModal(false);
      fetchReturnDetails();
      
    } catch (error) {
      console.error('Error making final decision:', error);
      alert(`Failed to make final decision: ${error.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  const processRefund = async () => {
    setActionLoading(true);

    try {
      const token = getAuthToken();
      // Use warehouse endpoint for refund processing for both admin and warehouse
      const endpoint = `${API_URL}/api/warehouse/returns/${returnId}/process-refund`;

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to process refund');
      }

      alert('Refund processed successfully!');
      setShowProcessModal(false);
      fetchReturnDetails();
      
    } catch (error) {
      console.error('Error processing refund:', error);
      alert(`Failed to process refund: ${error.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  // Schedule Pickup (without delivery agent assignment)
  const schedulePickup = async () => {
    setActionLoading(true);

    try {
      const token = getAuthToken();
      const isAdmin = localStorage.getItem('adminToken');
      
      // Use warehouse endpoint for pickup scheduling
      const endpoint = `${API_URL}/api/warehouse/returns/${returnId}/schedule-pickup`;

      const response = await fetch(endpoint, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          method: 'direct_warehouse', // Remove agent assignment
          scheduledDate: pickupForm.date,
          scheduledSlot: pickupForm.timeSlot,
          notes: pickupForm.instructions
        })
      });

      if (!response.ok) {
        throw new Error('Failed to schedule pickup');
      }

      alert('Pickup scheduled successfully!');
      setShowPickupModal(false);
      fetchReturnDetails();
      
    } catch (error) {
      console.error('Error scheduling pickup:', error);
      alert(`Failed to schedule pickup: ${error.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  // Update Pickup Charges
  const updatePickupCharges = async () => {
    setActionLoading(true);

    try {
      const token = getAuthToken();
      
      // Use admin toggle pickup charge endpoint
      const endpoint = `${API_URL}/api/admin/returns/${returnId}/pickup-charge`;

      const response = await fetch(endpoint, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          isFree: chargeForm.isFree,
          reason: chargeForm.reason
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update pickup charges');
      }

      const result = await response.json();
      alert(result.data?.message || 'Pickup charges updated successfully!');
      setShowChargeModal(false);
      fetchReturnDetails();
      
    } catch (error) {
      console.error('Error updating pickup charges:', error);
      alert(`Failed to update pickup charges: ${error.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  // Update Return Status (for picked up)
  const updateReturnStatus = async (status, notes) => {
    setActionLoading(true);

    try {
      const token = getAuthToken();
      const endpoint = `${API_URL}/api/warehouse/returns/${returnId}/status`;

      const response = await fetch(endpoint, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          status: status,
          notes: notes,
          updateData: {}
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update status');
      }

      const result = await response.json();
      alert(`Status updated to ${status} successfully!`);
      fetchReturnDetails();
      
    } catch (error) {
      console.error('Error updating status:', error);
      alert(`Failed to update status: ${error.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  // Mark Items as Received at Warehouse
  const markItemsReceived = async () => {
    setActionLoading(true);

    try {
      const token = getAuthToken();
      const endpoint = `${API_URL}/api/warehouse/returns/${returnId}/receive`;

      const response = await fetch(endpoint, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          receivedAt: receiveForm.receivedAt,
          condition: receiveForm.condition,
          notes: receiveForm.notes,
          receivedImages: []
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to mark items as received');
      }

      alert('Items marked as received at warehouse successfully!');
      setShowReceiveModal(false);
      fetchReturnDetails();
      
    } catch (error) {
      console.error('Error marking items as received:', error);
      alert(`Failed to mark items as received: ${error.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="animate-spin h-8 w-8 text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading return details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FaExclamationTriangle className="h-8 w-8 text-red-600 mx-auto mb-4" />
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => navigate(-1)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!returnDetails) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FaBox className="h-8 w-8 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Return details not found</p>
          <button
            onClick={() => navigate(-1)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 mt-4"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="return-detail-page-bg">
      {/* Background decorative elements */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-emerald-100/30 rounded-full -translate-x-48 -translate-y-48"></div>
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-green-100/40 rounded-full translate-x-40 translate-y-40"></div>
      <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-teal-100/20 rounded-full transform -translate-x-1/2 -translate-y-1/2"></div>
      
      <div className="relative z-10 w-full px-4 sm:px-6 lg:px-8 xl:px-10 2xl:px-12 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-emerald-600 hover:text-emerald-700 mb-6 transition-all duration-200 group"
          >
            <FaArrowLeft className="mr-2 group-hover:-translate-x-1 transition-transform duration-200" />
            <span className="font-medium">Back to Returns</span>
          </button>
          
          <div className="return-detail-header-bg">
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-32 translate-x-32"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-24 -translate-x-24"></div>
            
            <div className="relative z-10 flex items-center justify-between">
              <div className="text-white">
                <h1 className="text-4xl font-bold mb-3 tracking-tight">
                  Return #{returnDetails.returnRequestId || 'N/A'}
                </h1>
                <p className="text-emerald-100 text-lg font-medium">
                  <FaCalendarAlt className="inline mr-2" />
                  Requested on {returnDetails.requestedAt ? new Date(returnDetails.requestedAt).toLocaleDateString() : 'N/A'}
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <div className={`inline-flex items-center px-6 py-3 rounded-2xl text-sm font-semibold bg-white/95 backdrop-blur-sm shadow-lg ${getStatusColor(returnDetails.status || 'unknown')}`}>
                  {getStatusIcon(returnDetails.status || 'unknown')}
                  <span className="ml-2 capitalize">{(returnDetails.status || 'unknown').replace('_', ' ')}</span>
                </div>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="relative z-10 mt-8 flex flex-wrap gap-4">
              {(returnDetails.status === 'requested' || returnDetails.status === 'admin_review') && (
                <button
                  onClick={() => setShowReviewModal(true)}
                  className="bg-white/20 backdrop-blur-sm border border-white/30 hover:bg-white/30 text-white px-8 py-3 rounded-xl transition-all duration-200 flex items-center shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 font-medium"
                >
                  <FaCheckCircle className="mr-3 text-emerald-200" />
                  Review Request
                </button>
              )}
              
              {(returnDetails.status === 'approved' || returnDetails.status === 'warehouse_assigned') && (
                <button
                  onClick={() => setShowPickupModal(true)}
                  className="bg-white/20 backdrop-blur-sm border border-white/30 hover:bg-white/30 text-white px-8 py-3 rounded-xl transition-all duration-200 flex items-center shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 font-medium"
                >
                  <FaTruck className="mr-3 text-blue-200" />
                  Schedule Pickup
                </button>
              )}

              {returnDetails.status === 'pickup_scheduled' && (
                <button
                  onClick={() => updateReturnStatus('picked_up', 'Items picked up from customer')}
                  className="bg-white/20 backdrop-blur-sm border border-white/30 hover:bg-white/30 text-white px-8 py-3 rounded-xl transition-all duration-200 flex items-center shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 font-medium"
                >
                  <FaTruck className="mr-3 text-orange-200" />
                  Mark as Picked Up
                </button>
              )}

              {returnDetails.status === 'picked_up' && (
                <button
                  onClick={() => setShowReceiveModal(true)}
                  className="bg-white/20 backdrop-blur-sm border border-white/30 hover:bg-white/30 text-white px-8 py-3 rounded-xl transition-all duration-200 flex items-center shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 font-medium"
                >
                  <FaWarehouse className="mr-3 text-teal-200" />
                  Mark as Received
                </button>
              )}
              
              {returnDetails.status === 'in_warehouse' && (
                <button
                  onClick={() => setShowQualityModal(true)}
                  className="bg-white/20 backdrop-blur-sm border border-white/30 hover:bg-white/30 text-white px-8 py-3 rounded-xl transition-all duration-200 flex items-center shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 font-medium"
                >
                  <FaEye className="mr-3 text-amber-200" />
                  Quality Check
                </button>
              )}
              
              {returnDetails.status === 'quality_checked' && (
                <button
                  onClick={() => setShowRefundModal(true)}
                  className="bg-white/20 backdrop-blur-sm border border-white/30 hover:bg-white/30 text-white px-8 py-3 rounded-xl transition-all duration-200 flex items-center shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 font-medium"
                >
                  <FaCoins className="mr-3 text-rose-200" />
                  Final Decision
                </button>
              )}
              
              {returnDetails.status === 'refund_approved' && (
                <button
                  onClick={() => setShowProcessModal(true)}
                  className="bg-white/20 backdrop-blur-sm border border-white/30 hover:bg-white/30 text-white px-8 py-3 rounded-xl transition-all duration-200 flex items-center shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 font-medium"
                >
                  <FaCoins className="mr-3 text-green-200" />
                  Process Refund
                </button>
              )}
              
              {/* Pickup Charge Management - Available for all statuses after approval */}
              {!['requested', 'admin_review', 'rejected', 'completed'].includes(returnDetails.status) && (
                <button
                  onClick={() => setShowChargeModal(true)}
                  className="bg-white/20 backdrop-blur-sm border border-white/30 hover:bg-white/30 text-white px-8 py-3 rounded-xl transition-all duration-200 flex items-center shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 font-medium"
                >
                  <FaCoins className="mr-3 text-purple-200" />
                  Pickup Charges
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Customer Information */}
            <div className="bg-white rounded-3xl shadow-2xl p-8 border border-emerald-100 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-emerald-50 to-green-50 rounded-full -translate-y-16 translate-x-16"></div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center relative z-10">
                <div className="bg-gradient-to-br from-emerald-500 to-green-600 p-3 rounded-2xl mr-4 shadow-lg">
                  <FaUser className="text-white text-xl" />
                </div>
                Customer Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
                <div className="bg-gradient-to-br from-emerald-50 to-green-50 p-6 rounded-2xl border border-emerald-100 shadow-sm hover:shadow-md transition-all duration-200">
                  <label className="block text-sm font-semibold text-emerald-700 mb-2">Name</label>
                  <p className="text-gray-900 font-bold text-lg">{returnDetails.customerId?.name || 'N/A'}</p>
                </div>
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-2xl border border-blue-100 shadow-sm hover:shadow-md transition-all duration-200">
                  <label className="block text-sm font-semibold text-blue-700 mb-2">Email</label>
                  <p className="text-gray-900 font-bold text-lg">{returnDetails.customerId?.email || 'N/A'}</p>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-violet-50 p-6 rounded-2xl border border-purple-100 shadow-sm hover:shadow-md transition-all duration-200">
                  <label className="block text-sm font-semibold text-purple-700 mb-2">Phone</label>
                  <p className="text-gray-900 font-bold text-lg">{returnDetails.customerId?.phone || 'N/A'}</p>
                </div>
                <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-6 rounded-2xl border border-amber-100 shadow-sm hover:shadow-md transition-all duration-200">
                  <label className="block text-sm font-semibold text-amber-700 mb-2">Order ID</label>
                  <p className="text-gray-900 font-bold text-lg">{returnDetails.orderId?._id || 'N/A'}</p>
                </div>
              </div>
            </div>

            {/* Return Items */}
            <div className="bg-white rounded-3xl shadow-2xl p-8 border border-emerald-100 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-24 h-24 bg-gradient-to-br from-green-50 to-emerald-50 rounded-full -translate-y-12 -translate-x-12"></div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center relative z-10">
                <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-3 rounded-2xl mr-4 shadow-lg">
                  <FaBox className="text-white text-xl" />
                </div>
                Return Items
              </h2>
              <div className="space-y-4 relative z-10">
                {returnDetails.items?.map((item, index) => (
                  <div key={index} className="bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-200">
                    <div className="flex justify-between items-start">
                      <div className="space-y-2">
                        <h3 className="font-bold text-gray-900 text-lg">{item.productName}</h3>
                        {item.variantName && (
                          <p className="text-emerald-700 font-medium">Variant: {item.variantName}</p>
                        )}
                        <div className="flex space-x-6">
                          <p className="text-gray-700 font-medium">Qty: <span className="text-gray-900 font-bold">{item.quantity}</span></p>
                          <p className="text-gray-700 font-medium">Price: <span className="text-gray-900 font-bold">₹{item.originalPrice}</span></p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Return Reason & Comments */}
            <div className="bg-white rounded-3xl shadow-2xl p-8 border border-blue-100 relative overflow-hidden">
              <div className="absolute bottom-0 right-0 w-28 h-28 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-full translate-y-14 translate-x-14"></div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6 relative z-10">Return Reason & Comments</h2>
              <div className="space-y-6 relative z-10">
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-2xl border border-blue-100">
                  <label className="block text-sm font-bold text-blue-700 mb-2">Reason</label>
                  <p className="text-gray-900 font-bold text-lg capitalize">{returnDetails.returnReason?.replace('_', ' ')}</p>
                </div>
                {returnDetails.customerComments && (
                  <div className="bg-gradient-to-r from-purple-50 to-violet-50 p-6 rounded-2xl border border-purple-100">
                    <label className="block text-sm font-bold text-purple-700 mb-2">Customer Comments</label>
                    <p className="text-gray-900 font-medium leading-relaxed">{returnDetails.customerComments}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Evidence Images */}
            {returnDetails.evidenceImages && returnDetails.evidenceImages.length > 0 && (
              <div className="bg-white rounded-3xl shadow-2xl p-8 border border-amber-100 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-amber-50 to-orange-50 rounded-full -translate-y-16 translate-x-16"></div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center relative z-10">
                  <div className="bg-gradient-to-br from-amber-500 to-orange-600 p-3 rounded-2xl mr-4 shadow-lg">
                    <FaImage className="text-white text-xl" />
                  </div>
                  Evidence Images
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {returnDetails.evidenceImages.map((imageUrl, index) => (
                    <div 
                      key={index} 
                      className="relative group cursor-pointer"
                      onClick={() => openImageModal(imageUrl)}
                    >
                      <img
                        src={imageUrl}
                        alt={`Evidence ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg border border-gray-200 hover:border-blue-500"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 rounded-lg flex items-center justify-center transition-all">
                        <FaEye className="text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Quality Assessment */}
            {returnDetails.warehouseManagement?.qualityAssessment && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Quality Assessment</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Quality Score</label>
                    <p className="text-gray-900">{returnDetails.warehouseManagement.qualityAssessment.qualityScore}/10</p>
                  </div>
                  {returnDetails.warehouseManagement.qualityAssessment.assessmentNotes && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Assessment Notes</label>
                      <p className="text-gray-900">{returnDetails.warehouseManagement.qualityAssessment.assessmentNotes}</p>
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Refund Percentage</label>
                    <p className="text-gray-900">{returnDetails.warehouseManagement.qualityAssessment.refundPercentage}%</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Status Timeline */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <FaCalendarAlt className="mr-2" />
                Status Timeline
              </h3>
              <div className="space-y-4">
                {returnDetails.warehouseManagement?.statusUpdates?.map((update, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className={`p-1 rounded-full ${getStatusColor(update.toStatus)}`}>
                      {getStatusIcon(update.toStatus)}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900 capitalize">
                        {(update.toStatus || '').replace('_', ' ')}
                      </p>
                      <p className="text-xs text-gray-600">
                        {update.updatedAt ? new Date(update.updatedAt).toLocaleString() : 'N/A'}
                      </p>
                      {update.notes && (
                        <p className="text-xs text-gray-600 mt-1">{update.notes}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Refund Information */}
            {returnDetails.refund && (
              <div className="bg-white rounded-2xl shadow-xl p-6 border border-emerald-100">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                  <div className="bg-gradient-to-br from-emerald-500 to-green-600 p-2 rounded-xl mr-3 shadow-md">
                    <FaCoins className="text-white" />
                  </div>
                  Refund Information
                </h3>
                <div className="space-y-4">
                  {returnDetails.refund.adminDecision?.finalCoins && (
                    <div className="bg-gradient-to-r from-emerald-50 to-green-50 p-4 rounded-xl border border-emerald-200">
                      <label className="block text-sm font-bold text-emerald-700 mb-1">Total Coins to Credit</label>
                      <p className="text-gray-900 font-bold text-2xl">{returnDetails.refund.adminDecision.finalCoins} coins</p>
                      <p className="text-emerald-600 text-sm">≈ ₹{(returnDetails.refund.adminDecision.finalCoins / 5).toFixed(2)}</p>
                    </div>
                  )}
                  {returnDetails.refund.processing?.coinsCredited && (
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-xl border border-green-200">
                      <label className="block text-sm font-bold text-green-700 mb-1">Coins Credited</label>
                      <p className="text-gray-900 font-bold text-2xl">{returnDetails.refund.processing.coinsCredited} coins</p>
                      <p className="text-green-600 text-sm">Successfully processed</p>
                    </div>
                  )}
                  {returnDetails.refund.adminDecision?.deductions && returnDetails.refund.adminDecision.deductions.length > 0 && (
                    <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-4 rounded-xl border border-amber-200">
                      <label className="block text-sm font-bold text-amber-700 mb-2">Deductions</label>
                      {returnDetails.refund.adminDecision.deductions.map((deduction, index) => (
                        <div key={index} className="flex justify-between items-center text-sm">
                          <span className="text-gray-700 capitalize">{deduction.type.replace('_', ' ')}</span>
                          <span className="text-gray-900 font-semibold">₹{deduction.amount}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  {returnDetails.refund.processing?.processedAt && (
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-200">
                      <label className="block text-sm font-bold text-blue-700 mb-1">Processed At</label>
                      <p className="text-gray-900 font-semibold">{new Date(returnDetails.refund.processing.processedAt).toLocaleString()}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Quality Assessment Information */}
            {returnDetails.warehouseManagement?.qualityAssessment?.assessedAt && (
              <div className="bg-white rounded-3xl shadow-2xl p-8 border border-purple-100 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-28 h-28 bg-gradient-to-br from-purple-50 to-violet-50 rounded-full -translate-y-14 -translate-x-14"></div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center relative z-10">
                  <div className="bg-gradient-to-br from-purple-500 to-violet-600 p-3 rounded-2xl mr-4 shadow-lg">
                    <FaEye className="text-white text-xl" />
                  </div>
                  Quality Assessment Results
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
                  <div className="bg-gradient-to-br from-purple-50 to-violet-50 p-6 rounded-2xl border border-purple-100">
                    <label className="block text-sm font-bold text-purple-700 mb-2">Item Condition</label>
                    <p className="text-gray-900 font-bold text-lg capitalize">{returnDetails.warehouseManagement.qualityAssessment.itemCondition || 'N/A'}</p>
                  </div>
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-2xl border border-green-100">
                    <label className="block text-sm font-bold text-green-700 mb-2">Refund Eligibility</label>
                    <p className="text-gray-900 font-bold text-lg capitalize">{returnDetails.warehouseManagement.qualityAssessment.refundEligibility || 'N/A'}</p>
                  </div>
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-2xl border border-blue-100">
                    <label className="block text-sm font-bold text-blue-700 mb-2">Refund Percentage</label>
                    <p className="text-gray-900 font-bold text-lg">{returnDetails.warehouseManagement.qualityAssessment.refundPercentage}%</p>
                  </div>
                  <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-6 rounded-2xl border border-amber-100">
                    <label className="block text-sm font-bold text-amber-700 mb-2">Assessed Date</label>
                    <p className="text-gray-900 font-bold text-lg">{new Date(returnDetails.warehouseManagement.qualityAssessment.assessedAt).toLocaleDateString()}</p>
                  </div>
                  {returnDetails.warehouseManagement.qualityAssessment.warehouseNotes && (
                    <div className="md:col-span-2 bg-gradient-to-r from-gray-50 to-slate-50 p-6 rounded-2xl border border-gray-100">
                      <label className="block text-sm font-bold text-gray-700 mb-2">Assessment Notes</label>
                      <p className="text-gray-900 font-medium leading-relaxed">{returnDetails.warehouseManagement.qualityAssessment.warehouseNotes}</p>
                    </div>
                  )}
                  {returnDetails.warehouseManagement.qualityAssessment.conditionDetails && (
                    <div className="md:col-span-2">
                      <h3 className="text-lg font-bold text-gray-900 mb-4">Condition Details</h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-gradient-to-br from-teal-50 to-cyan-50 p-4 rounded-xl border border-teal-100">
                          <label className="block text-xs font-bold text-teal-700 mb-1">Packaging</label>
                          <p className="text-gray-900 font-semibold capitalize">{returnDetails.warehouseManagement.qualityAssessment.conditionDetails.packaging || 'N/A'}</p>
                        </div>
                        <div className="bg-gradient-to-br from-rose-50 to-pink-50 p-4 rounded-xl border border-rose-100">
                          <label className="block text-xs font-bold text-rose-700 mb-1">Product Condition</label>
                          <p className="text-gray-900 font-semibold capitalize">{returnDetails.warehouseManagement.qualityAssessment.conditionDetails.productCondition || 'N/A'}</p>
                        </div>
                        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-4 rounded-xl border border-indigo-100">
                          <label className="block text-xs font-bold text-indigo-700 mb-1">Accessories</label>
                          <p className="text-gray-900 font-semibold capitalize">{returnDetails.warehouseManagement.qualityAssessment.conditionDetails.accessories || 'N/A'}</p>
                        </div>
                        <div className="bg-gradient-to-br from-emerald-50 to-green-50 p-4 rounded-xl border border-emerald-100">
                          <label className="block text-xs font-bold text-emerald-700 mb-1">Functionality</label>
                          <p className="text-gray-900 font-semibold capitalize">{returnDetails.warehouseManagement.qualityAssessment.conditionDetails.functionality || 'N/A'}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Admin Review */}
            {returnDetails.adminReview && returnDetails.adminReview.reviewedAt && (
              <div className="bg-white rounded-3xl shadow-2xl p-8 border border-indigo-100 relative overflow-hidden">
                <div className="absolute bottom-0 right-0 w-24 h-24 bg-gradient-to-br from-indigo-50 to-blue-50 rounded-full translate-y-12 translate-x-12"></div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center relative z-10">
                  <div className="bg-gradient-to-br from-indigo-500 to-blue-600 p-3 rounded-2xl mr-4 shadow-lg">
                    <FaCheckCircle className="text-white text-xl" />
                  </div>
                  Admin Review
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
                  <div className="bg-gradient-to-br from-indigo-50 to-blue-50 p-6 rounded-2xl border border-indigo-100">
                    <label className="block text-sm font-bold text-indigo-700 mb-2">Decision</label>
                    <p className="text-gray-900 font-bold text-lg capitalize">{returnDetails.adminReview.approved ? 'Approved' : 'Pending Review'}</p>
                  </div>
                  <div className="bg-gradient-to-br from-purple-50 to-violet-50 p-6 rounded-2xl border border-purple-100">
                    <label className="block text-sm font-bold text-purple-700 mb-2">Reviewed Date</label>
                    <p className="text-gray-900 font-bold text-lg">{new Date(returnDetails.adminReview.reviewedAt).toLocaleDateString()}</p>
                  </div>
                  <div className="bg-gradient-to-br from-emerald-50 to-green-50 p-6 rounded-2xl border border-emerald-100">
                    <label className="block text-sm font-bold text-emerald-700 mb-2">Pickup Charge</label>
                    <p className="text-gray-900 font-bold text-lg">
                      {returnDetails.adminReview.pickupCharge?.isFree ? 'Free' : `₹${returnDetails.adminReview.pickupCharge?.amount || 50}`}
                    </p>
                  </div>
                  {returnDetails.adminReview.adminComments && (
                    <div className="bg-gradient-to-br from-gray-50 to-slate-50 p-6 rounded-2xl border border-gray-100">
                      <label className="block text-sm font-bold text-gray-700 mb-2">Admin Comments</label>
                      <p className="text-gray-900 font-medium leading-relaxed">{returnDetails.adminReview.adminComments}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Review Modal */}
      {showReviewModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-2xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Review Return Request
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
                    {actionLoading ? 'Processing...' : 'Submit Review'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Quality Assessment Modal */}
      {showQualityModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-6">
                Comprehensive Quality Assessment
              </h3>
              
              <form onSubmit={processQualityAssessment} className="space-y-6">
                {/* Quality Score Section */}
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-3">Quality Evaluation</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Overall Quality Score (1-10) *
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="10"
                        required
                        value={qualityForm.qualityScore}
                        onChange={(e) => setQualityForm(prev => ({ 
                          ...prev, 
                          qualityScore: parseInt(e.target.value),
                          refundPercentage: Math.min(100, parseInt(e.target.value) * 10)
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        1-3: Poor, 4-6: Fair, 7-8: Good, 9-10: Excellent
                      </p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Item Condition *
                      </label>
                      <select
                        required
                        value={qualityForm.itemCondition}
                        onChange={(e) => setQualityForm(prev => ({ ...prev, itemCondition: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Select condition</option>
                        <option value="like_new">Like New</option>
                        <option value="good">Good</option>
                        <option value="fair">Fair</option>
                        <option value="poor">Poor</option>
                        <option value="damaged">Damaged</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Refund Percentage Section */}
                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="font-medium text-green-900 mb-3">Refund Calculation</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Refund Percentage (%) *
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        required
                        value={qualityForm.refundPercentage}
                        onChange={(e) => setQualityForm(prev => ({ ...prev, refundPercentage: parseInt(e.target.value) }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Calculated refund: ₹{((returnDetails.orderItem?.price || 0) * (qualityForm.refundPercentage / 100)).toFixed(2)}
                      </p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Deduction Reason
                      </label>
                      <select
                        value={qualityForm.deductionReason}
                        onChange={(e) => setQualityForm(prev => ({ ...prev, deductionReason: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      >
                        <option value="">No deduction</option>
                        <option value="wear_tear">Normal wear and tear</option>
                        <option value="minor_damage">Minor damage</option>
                        <option value="major_damage">Major damage</option>
                        <option value="missing_parts">Missing parts/accessories</option>
                        <option value="hygiene_issues">Hygiene concerns</option>
                        <option value="policy_violation">Policy violation</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Assessment Details Section */}
                <div className="bg-amber-50 p-4 rounded-lg">
                  <h4 className="font-medium text-amber-900 mb-3">Detailed Assessment</h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Physical Inspection Notes *
                      </label>
                      <textarea
                        required
                        value={qualityForm.assessmentNotes}
                        onChange={(e) => setQualityForm(prev => ({ ...prev, assessmentNotes: e.target.value }))}
                        placeholder="Detailed physical inspection findings..."
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="packaging_intact"
                          checked={qualityForm.packagingIntact}
                          onChange={(e) => setQualityForm(prev => ({ ...prev, packagingIntact: e.target.checked }))}
                          className="h-4 w-4 text-amber-600 focus:ring-amber-500 border-gray-300 rounded"
                        />
                        <label htmlFor="packaging_intact" className="ml-2 text-sm text-gray-700">
                          Original packaging intact
                        </label>
                      </div>
                      
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="tags_attached"
                          checked={qualityForm.tagsAttached}
                          onChange={(e) => setQualityForm(prev => ({ ...prev, tagsAttached: e.target.checked }))}
                          className="h-4 w-4 text-amber-600 focus:ring-amber-500 border-gray-300 rounded"
                        />
                        <label htmlFor="tags_attached" className="ml-2 text-sm text-gray-700">
                          Tags/labels attached
                        </label>
                      </div>
                      
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="accessories_complete"
                          checked={qualityForm.accessoriesComplete}
                          onChange={(e) => setQualityForm(prev => ({ ...prev, accessoriesComplete: e.target.checked }))}
                          className="h-4 w-4 text-amber-600 focus:ring-amber-500 border-gray-300 rounded"
                        />
                        <label htmlFor="accessories_complete" className="ml-2 text-sm text-gray-700">
                          All accessories included
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Inspector Information */}
                <div className="bg-purple-50 p-4 rounded-lg">
                  <h4 className="font-medium text-purple-900 mb-3">Inspector Details</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Inspector Name
                      </label>
                      <input
                        type="text"
                        value={qualityForm.inspectorName}
                        onChange={(e) => setQualityForm(prev => ({ ...prev, inspectorName: e.target.value }))}
                        placeholder="Quality inspector name"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Inspection Date
                      </label>
                      <input
                        type="datetime-local"
                        value={qualityForm.inspectionDate}
                        onChange={(e) => setQualityForm(prev => ({ ...prev, inspectionDate: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-4 border-t">
                  <button
                    type="button"
                    onClick={() => setShowQualityModal(false)}
                    className="px-6 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="px-6 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-md disabled:opacity-50 flex items-center"
                  >
                    {actionLoading ? (
                      <>
                        <FaSpinner className="animate-spin mr-2" />
                        Processing...
                      </>
                    ) : (
                      'Complete Quality Assessment'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Final Decision Modal */}
      {showRefundModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-2xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Final Refund Decision
              </h3>
              
              <form onSubmit={makeFinalDecision} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Decision *
                  </label>
                  <select
                    required
                    value={refundForm.decision}
                    onChange={(e) => setRefundForm(prev => ({ ...prev, decision: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="approved">Approve Refund</option>
                    <option value="rejected">Reject Refund</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Final Amount (Optional)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={refundForm.finalAmount}
                    onChange={(e) => setRefundForm(prev => ({ ...prev, finalAmount: e.target.value }))}
                    placeholder="Leave blank for auto calculation"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notes
                  </label>
                  <textarea
                    value={refundForm.adminNotes}
                    onChange={(e) => setRefundForm(prev => ({ ...prev, adminNotes: e.target.value }))}
                    placeholder="Add decision notes..."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowRefundModal(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md disabled:opacity-50 flex items-center"
                  >
                    {actionLoading ? 'Processing...' : 'Make Decision'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Process Refund Modal */}
      {showProcessModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-md shadow-lg rounded-md bg-white">
            <div className="mt-3 text-center">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Process Refund
              </h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to process this refund? This action cannot be undone.
              </p>
              
              <div className="flex justify-center space-x-3">
                <button
                  onClick={() => setShowProcessModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
                >
                  Cancel
                </button>
                <button
                  onClick={processRefund}
                  disabled={actionLoading}
                  className="px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-md disabled:opacity-50 flex items-center"
                >
                  {actionLoading ? 'Processing...' : 'Process Refund'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Pickup Scheduling Modal */}
      {showPickupModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full mx-4 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Schedule Pickup
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Pickup Date
                </label>
                <input
                  type="date"
                  value={pickupForm.date}
                  onChange={(e) => setPickupForm({...pickupForm, date: e.target.value})}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Time Slot
                </label>
                <select
                  value={pickupForm.timeSlot}
                  onChange={(e) => setPickupForm({...pickupForm, timeSlot: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select time slot</option>
                  <option value="9:00 AM - 12:00 PM">9:00 AM - 12:00 PM</option>
                  <option value="12:00 PM - 3:00 PM">12:00 PM - 3:00 PM</option>
                  <option value="3:00 PM - 6:00 PM">3:00 PM - 6:00 PM</option>
                  <option value="6:00 PM - 9:00 PM">6:00 PM - 9:00 PM</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Special Instructions
                </label>
                <textarea
                  value={pickupForm.instructions}
                  onChange={(e) => setPickupForm({...pickupForm, instructions: e.target.value})}
                  placeholder="Any special pickup instructions..."
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            
            <div className="flex justify-center space-x-3 mt-6">
              <button
                onClick={() => setShowPickupModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
              >
                Cancel
              </button>
              <button
                onClick={schedulePickup}
                disabled={!pickupForm.date || !pickupForm.timeSlot || actionLoading}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md disabled:opacity-50 flex items-center"
              >
                {actionLoading ? (
                  <>
                    <FaSpinner className="animate-spin mr-2" />
                    Scheduling...
                  </>
                ) : (
                  'Schedule Pickup'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pickup Charge Management Modal */}
      {showChargeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full mx-4 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Pickup Charge Management
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm font-medium text-gray-700">Free Pickup</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={chargeForm.isFree}
                    onChange={(e) => setChargeForm({
                      ...chargeForm, 
                      isFree: e.target.checked,
                      amount: e.target.checked ? 0 : 50
                    })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                </label>
              </div>
              
              {!chargeForm.isFree && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Pickup Charge (₹)
                  </label>
                  <input
                    type="number"
                    value={chargeForm.amount}
                    onChange={(e) => setChargeForm({...chargeForm, amount: parseFloat(e.target.value) || 0})}
                    min="0"
                    step="0.01"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Equivalent to {Math.floor(chargeForm.amount * 5)} coins
                  </p>
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Reason for Charge Adjustment
                </label>
                <textarea
                  value={chargeForm.reason}
                  onChange={(e) => setChargeForm({...chargeForm, reason: e.target.value})}
                  placeholder="Explain why charges are being modified..."
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>
            
            <div className="flex justify-center space-x-3 mt-6">
              <button
                onClick={() => setShowChargeModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
              >
                Cancel
              </button>
              <button
                onClick={updatePickupCharges}
                disabled={actionLoading}
                className="px-4 py-2 text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 rounded-md disabled:opacity-50 flex items-center"
              >
                {actionLoading ? (
                  <>
                    <FaSpinner className="animate-spin mr-2" />
                    Updating...
                  </>
                ) : (
                  'Update Charges'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mark Items as Received Modal */}
      {showReceiveModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full mx-4 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Mark Items as Received
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Received Date & Time
                </label>
                <input
                  type="datetime-local"
                  value={receiveForm.receivedAt}
                  onChange={(e) => setReceiveForm({...receiveForm, receivedAt: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Initial Condition
                </label>
                <select
                  value={receiveForm.condition}
                  onChange={(e) => setReceiveForm({...receiveForm, condition: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="">Select initial condition</option>
                  <option value="excellent">Excellent</option>
                  <option value="good">Good</option>
                  <option value="fair">Fair</option>
                  <option value="poor">Poor</option>
                  <option value="damaged">Damaged</option>
                  <option value="unusable">Unusable</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Reception Notes
                </label>
                <textarea
                  value={receiveForm.notes}
                  onChange={(e) => setReceiveForm({...receiveForm, notes: e.target.value})}
                  placeholder="Notes about the received items..."
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
            </div>
            
            <div className="flex justify-center space-x-3 mt-6">
              <button
                onClick={() => setShowReceiveModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
              >
                Cancel
              </button>
              <button
                onClick={markItemsReceived}
                disabled={!receiveForm.condition || actionLoading}
                className="px-4 py-2 text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 rounded-md disabled:opacity-50 flex items-center"
              >
                {actionLoading ? (
                  <>
                    <FaSpinner className="animate-spin mr-2" />
                    Marking...
                  </>
                ) : (
                  'Mark as Received'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Image Modal */}
      {showImageModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="relative max-w-4xl max-h-full">
            <button
              onClick={() => setShowImageModal(false)}
              className="absolute top-4 right-4 text-white bg-black bg-opacity-50 rounded-full p-2 hover:bg-opacity-75"
            >
              <FaTimesCircle className="w-6 h-6" />
            </button>
            <img
              src={selectedImage}
              alt="Evidence"
              className="max-w-full max-h-full object-contain rounded-lg"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ReturnDetailPage;
