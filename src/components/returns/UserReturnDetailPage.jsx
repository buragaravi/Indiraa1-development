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
  FaEye,
  FaMapMarkerAlt,
  FaPhone,
  FaEnvelope
} from 'react-icons/fa';

const UserReturnDetailPage = () => {
  const { returnId } = useParams();
  const navigate = useNavigate();
  const [returnDetails, setReturnDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedImage, setSelectedImage] = useState('');
  const [showImageModal, setShowImageModal] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

  // Get user auth token
  const getUserAuthToken = () => {
    return localStorage.getItem('userToken') || localStorage.getItem('token');
  };

  useEffect(() => {
    fetchReturnDetails();
  }, [returnId]);

  const fetchReturnDetails = async () => {
    try {
      setLoading(true);
      const token = getUserAuthToken();
      
      if (!token) {
        throw new Error('Please log in to view your return details');
      }

      // Use user-specific endpoint for returns
      const response = await fetch(`${API_URL}/api/returns/${returnId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Please log in to view your return details');
        } else if (response.status === 403) {
          throw new Error('You can only view your own returns');
        } else if (response.status === 404) {
          throw new Error('Return request not found');
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

  const getStatusDescription = (status) => {
    const descriptions = {
      requested: 'Your return request has been submitted and is awaiting review.',
      admin_review: 'Our team is currently reviewing your return request.',
      approved: 'Your return has been approved! We will schedule a pickup soon.',
      rejected: 'Your return request has been rejected. Please contact support for more details.',
      warehouse_assigned: 'Your return has been assigned to our warehouse team.',
      pickup_scheduled: 'Pickup has been scheduled. Please be available at the scheduled time.',
      picked_up: 'Your items have been picked up and are on their way to our warehouse.',
      in_warehouse: 'Your items have been received at our warehouse and will undergo quality check.',
      quality_checked: 'Quality assessment completed. Final refund decision is being processed.',
      refund_approved: 'Your refund has been approved and will be processed shortly.',
      refund_processed: 'Refund completed! Coins have been credited to your wallet.',
      completed: 'Your return process is complete. Thank you for choosing us!',
      cancelled: 'This return request has been cancelled.'
    };
    return descriptions[status] || 'Status update in progress.';
  };

  const openImageModal = (imageUrl) => {
    setSelectedImage(imageUrl);
    setShowImageModal(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-teal-100 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl p-8 flex flex-col items-center">
          <FaSpinner className="animate-spin text-emerald-500 text-4xl mb-4" />
          <p className="text-gray-600 text-lg">Loading your return details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-red-50 to-pink-100 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <FaTimesCircle className="text-rose-500 text-6xl mb-4 mx-auto" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Oops!</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={() => navigate('/returns')}
              className="bg-emerald-600 text-white px-6 py-3 rounded-lg hover:bg-emerald-700 transition-colors duration-200 font-medium"
            >
              Go Back to Returns
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!returnDetails) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-slate-50 to-gray-100 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <FaBox className="text-gray-400 text-6xl mb-4 mx-auto" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Return Not Found</h2>
            <p className="text-gray-600 mb-6">The return request you're looking for doesn't exist or has been removed.</p>
            <button
              onClick={() => navigate('/returns')}
              className="bg-emerald-600 text-white px-6 py-3 rounded-lg hover:bg-emerald-700 transition-colors duration-200 font-medium"
            >
              Go Back to Returns
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-teal-100 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-emerald-100/30 rounded-full -translate-x-48 -translate-y-48"></div>
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-green-100/40 rounded-full translate-x-40 translate-y-40"></div>
      <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-teal-100/20 rounded-full transform -translate-x-1/2 -translate-y-1/2"></div>
      
      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/returns')}
            className="flex items-center text-emerald-600 hover:text-emerald-700 mb-6 transition-all duration-200 group"
          >
            <FaArrowLeft className="mr-2 group-hover:-translate-x-1 transition-transform duration-200" />
            <span className="font-medium">Back to My Returns</span>
          </button>
          
          <div className="bg-gradient-to-br from-emerald-500 via-green-500 to-teal-600 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-32 translate-x-32"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-24 -translate-x-24"></div>
            
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-6">
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
              
              {/* Status Description */}
              <div className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-2xl p-6">
                <p className="text-white text-lg font-medium leading-relaxed">
                  {getStatusDescription(returnDetails.status)}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
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
                          <p className="text-gray-700 font-medium">Total: <span className="text-gray-900 font-bold">₹{(item.originalPrice * item.quantity).toFixed(2)}</span></p>
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
                    <label className="block text-sm font-bold text-purple-700 mb-2">Your Comments</label>
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
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 relative z-10">
                  {returnDetails.evidenceImages.map((image, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={image}
                        alt={`Evidence ${index + 1}`}
                        className="w-full h-32 object-cover rounded-2xl border border-amber-200 shadow-sm cursor-pointer group-hover:shadow-lg transition-all duration-200"
                        onClick={() => openImageModal(image)}
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 rounded-2xl transition-all duration-200 flex items-center justify-center">
                        <FaEye className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Refund Information */}
            {returnDetails.refund && (
              <div className="bg-white rounded-2xl shadow-xl p-6 border border-emerald-100">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                  <div className="bg-gradient-to-br from-emerald-500 to-green-600 p-2 rounded-xl mr-3 shadow-md">
                    <FaCoins className="text-white" />
                  </div>
                  Refund Status
                </h3>
                <div className="space-y-4">
                  {returnDetails.refund.processing?.coinsCredited && (
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-xl border border-green-200">
                      <label className="block text-sm font-bold text-green-700 mb-1">Coins Credited</label>
                      <p className="text-gray-900 font-bold text-2xl">{returnDetails.refund.processing.coinsCredited} coins</p>
                      <p className="text-green-600 text-sm">≈ ₹{(returnDetails.refund.processing.coinsCredited / 5).toFixed(2)}</p>
                    </div>
                  )}
                  {returnDetails.refund.adminDecision?.finalCoins && !returnDetails.refund.processing?.coinsCredited && (
                    <div className="bg-gradient-to-r from-emerald-50 to-green-50 p-4 rounded-xl border border-emerald-200">
                      <label className="block text-sm font-bold text-emerald-700 mb-1">Approved Refund</label>
                      <p className="text-gray-900 font-bold text-2xl">{returnDetails.refund.adminDecision.finalCoins} coins</p>
                      <p className="text-emerald-600 text-sm">≈ ₹{(returnDetails.refund.adminDecision.finalCoins / 5).toFixed(2)}</p>
                      <p className="text-amber-600 text-sm mt-1">Processing...</p>
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

            {/* Status Timeline */}
            <div className="bg-white rounded-2xl shadow-xl p-6 border border-blue-100">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-2 rounded-xl mr-3 shadow-md">
                  <FaCalendarAlt className="text-white" />
                </div>
                Status Timeline
              </h3>
              <div className="space-y-4">
                {returnDetails.warehouseManagement?.statusUpdates?.map((update, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className={`p-2 rounded-full ${getStatusColor(update.toStatus)} min-w-fit`}>
                      {getStatusIcon(update.toStatus)}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gray-900 capitalize">
                        {(update.toStatus || '').replace('_', ' ')}
                      </p>
                      <p className="text-xs text-gray-600">
                        {update.updatedAt ? new Date(update.updatedAt).toLocaleString() : 'N/A'}
                      </p>
                      {update.notes && (
                        <p className="text-xs text-gray-600 mt-1 italic">{update.notes}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Contact Support */}
            <div className="bg-white rounded-2xl shadow-xl p-6 border border-purple-100">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Need Help?</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3 text-purple-600">
                  <FaPhone className="text-purple-500" />
                  <span className="font-medium">+91 1234567890</span>
                </div>
                <div className="flex items-center space-x-3 text-purple-600">
                  <FaEnvelope className="text-purple-500" />
                  <span className="font-medium">support@indiraa.com</span>
                </div>
                <p className="text-gray-600 text-sm mt-4">
                  Have questions about your return? Our support team is here to help!
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Image Modal */}
      {showImageModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="relative max-w-4xl max-h-full">
            <img
              src={selectedImage}
              alt="Evidence"
              className="max-w-full max-h-full object-contain rounded-2xl"
            />
            <button
              onClick={() => setShowImageModal(false)}
              className="absolute top-4 right-4 bg-white/20 backdrop-blur-sm text-white p-2 rounded-full hover:bg-white/30 transition-colors duration-200"
            >
              <FaTimesCircle className="text-xl" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserReturnDetailPage;
