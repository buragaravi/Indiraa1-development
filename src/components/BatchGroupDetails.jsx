import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Package, 
  Calendar, 
  MapPin, 
  User, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle,
  Clock,
  Edit,
  Download,
  RefreshCw
} from 'lucide-react';

const BatchGroupDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [batchGroup, setBatchGroup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch batch group details
  const fetchBatchGroupDetails = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');
      
      const response = await fetch(`http://localhost:5001/api/batches/batch-groups/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch batch group details');
      }

      const data = await response.json();
      setBatchGroup(data.data);
    } catch (err) {
      console.error('Error fetching batch group details:', err);
      setError('Failed to load batch group details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchBatchGroupDetails();
    }
  }, [id]);

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Format short date
  const formatShortDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Get status badge color
  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'Active': return 'bg-green-100 text-green-800 border-green-200';
      case 'Expired': return 'bg-red-100 text-red-800 border-red-200';
      case 'Recalled': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'Depleted': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Calculate stock percentage
  const calculateStockPercentage = (available, total) => {
    if (total === 0) return 0;
    return Math.round((available / total) * 100);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading batch group details...</p>
        </div>
      </div>
    );
  }

  if (error || !batchGroup) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-red-600" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Batch Group</h3>
          <p className="text-gray-600 mb-4">{error || 'Batch group not found'}</p>
          <button
            onClick={() => navigate('/admin/batches')}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Batch Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <button
                  onClick={() => navigate('/admin/batches')}
                  className="mr-4 p-2 text-gray-400 hover:text-gray-600"
                >
                  <ArrowLeft className="h-5 w-5" />
                </button>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{batchGroup.batchGroupNumber}</h1>
                  <p className="text-gray-600 mt-1">Batch Group Details</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusBadgeColor(batchGroup.status)}`}>
                  {batchGroup.status}
                </span>
                <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </button>
                <button className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Package className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Products</p>
                <p className="text-2xl font-semibold text-gray-900">{batchGroup.statistics.totalProducts}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Available Items</p>
                <p className="text-2xl font-semibold text-gray-900">{batchGroup.statistics.availableItems}</p>
                <p className="text-xs text-gray-400">of {batchGroup.statistics.totalItems}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <TrendingUp className="h-8 w-8 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Utilization Rate</p>
                <p className="text-2xl font-semibold text-gray-900">{batchGroup.statistics.utilizationRate}%</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Clock className="h-8 w-8 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Orders Allocated</p>
                <p className="text-2xl font-semibold text-gray-900">{batchGroup.statistics.orderAllocationsCount}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Batch Group Information */}
          <div className="lg:col-span-1">
            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Batch Information</h3>
              </div>
              <div className="p-6 space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-500">Group Type</label>
                  <p className="mt-1 text-sm text-gray-900">{batchGroup.groupType?.replace('_', ' ')}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-500">Location</label>
                  <div className="mt-1 flex items-center text-sm text-gray-900">
                    <MapPin className="h-4 w-4 mr-1 text-gray-400" />
                    {batchGroup.location}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-500">Manufacturing Date</label>
                  <div className="mt-1 flex items-center text-sm text-gray-900">
                    <Calendar className="h-4 w-4 mr-1 text-gray-400" />
                    {formatShortDate(batchGroup.defaultManufacturingDate)}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-500">Expiry Date</label>
                  <div className={`mt-1 flex items-center text-sm ${batchGroup.statistics.isExpired ? 'text-red-600' : 'text-gray-900'}`}>
                    <Calendar className="h-4 w-4 mr-1 text-gray-400" />
                    {formatShortDate(batchGroup.defaultExpiryDate)}
                    {batchGroup.statistics.isExpired && (
                      <span className="ml-2 text-xs bg-red-100 text-red-800 px-2 py-1 rounded">Expired</span>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-500">Created By</label>
                  <div className="mt-1 flex items-center text-sm text-gray-900">
                    <User className="h-4 w-4 mr-1 text-gray-400" />
                    {batchGroup.createdBy?.name || 'System'}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-500">Created At</label>
                  <p className="mt-1 text-sm text-gray-900">{formatDate(batchGroup.createdAt)}</p>
                </div>
              </div>
            </div>

            {/* Supplier Information */}
            <div className="bg-white shadow rounded-lg mt-6">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Supplier Information</h3>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500">Supplier Name</label>
                  <p className="mt-1 text-sm text-gray-900">{batchGroup.supplierInfo?.supplierName || 'N/A'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Contact Info</label>
                  <p className="mt-1 text-sm text-gray-900">{batchGroup.supplierInfo?.contactInfo || 'N/A'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Received Date</label>
                  <p className="mt-1 text-sm text-gray-900">{formatShortDate(batchGroup.supplierInfo?.receivedDate)}</p>
                </div>
                {batchGroup.supplierInfo?.notes && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Notes</label>
                    <p className="mt-1 text-sm text-gray-900">{batchGroup.supplierInfo.notes}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Products List */}
          <div className="lg:col-span-2">
            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Products in this Batch Group</h3>
              </div>
              <div className="overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Product
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Stock Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Usage
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Current Stock
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {batchGroup.products.map((product, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <div className="flex items-center">
                              {product.productDetails?.images?.[0] && (
                                <img
                                  className="h-10 w-10 rounded object-cover mr-4"
                                  src={product.productDetails.images[0]}
                                  alt={product.productDetails.name}
                                />
                              )}
                              <div>
                                <div className="text-sm font-medium text-gray-900">
                                  {product.productDetails?.name || 'Unknown Product'}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {product.productDetails?.category}
                                </div>
                                {product.isProductDeleted && (
                                  <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">Deleted</span>
                                )}
                              </div>
                            </div>
                          </td>
                          
                          <td className="px-6 py-4 whitespace-nowrap">
                            {product.variantDetails && product.variantDetails.length > 0 ? (
                              <div className="space-y-1">
                                {product.variantDetails.map((variant, vIndex) => (
                                  <div key={vIndex} className="text-sm">
                                    <div className="font-medium text-gray-700">{variant.variantName}</div>
                                    <div className="text-gray-500">
                                      Available: {variant.availableQuantity}/{variant.quantity}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="text-sm text-gray-900">
                                Available: {product.availableQuantity || 0}/{product.quantity || 0}
                              </div>
                            )}
                          </td>
                          
                          <td className="px-6 py-4 whitespace-nowrap">
                            {product.variantDetails && product.variantDetails.length > 0 ? (
                              <div className="space-y-1">
                                {product.variantDetails.map((variant, vIndex) => {
                                  const utilizationRate = variant.quantity > 0 ? ((variant.usedQuantity / variant.quantity) * 100).toFixed(1) : 0;
                                  return (
                                    <div key={vIndex} className="text-sm text-gray-500">
                                      Used: {variant.usedQuantity} ({utilizationRate}%)
                                    </div>
                                  );
                                })}
                              </div>
                            ) : (
                              <div className="text-sm text-gray-500">
                                Used: {product.usedQuantity || 0} ({product.quantity > 0 ? ((product.usedQuantity || 0) / product.quantity * 100).toFixed(1) : 0}%)
                              </div>
                            )}
                          </td>
                          
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {product.currentStock || 0}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {batchGroup.products.length === 0 && (
                <div className="text-center py-12">
                  <Package className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No products found</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    This batch group doesn't contain any products.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BatchGroupDetails;
