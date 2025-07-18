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
  RefreshCw,
  Eye,
  BarChart3,
  Activity,
  Truck
} from 'lucide-react';

const WarehouseBatchDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [batchGroup, setBatchGroup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch batch group details
  const fetchBatchGroupDetails = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken') || localStorage.getItem('subAdminToken');
      
      console.log('[FRONTEND] Fetching batch group details for ID:', id);
      
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
      console.log('[FRONTEND] Raw batch group response:', JSON.stringify(data, null, 2));
      console.log('[FRONTEND] Setting batch group to data.data:', data.data);
      
      setBatchGroup(data.data);
    } catch (err) {
      console.error('[FRONTEND] Error fetching batch group details:', err);
      setError('Failed to load batch group details');
    } finally {
      setLoading(false);
    }
  };

  // Calculate utilization rate if not provided by backend
  const calculateUtilizationRate = () => {
    if (batchGroup?.statistics?.utilizationRate) {
      return batchGroup.statistics.utilizationRate;
    }
    
    // Fallback calculation
    if (batchGroup?.products && batchGroup.products.length > 0) {
      let totalQuantity = 0;
      let totalUsed = 0;
      
      batchGroup.products.forEach(product => {
        if (product.variantDetails && product.variantDetails.length > 0) {
          product.variantDetails.forEach(variant => {
            totalQuantity += variant.quantity || 0;
            totalUsed += variant.usedQuantity || 0;
          });
        } else {
          totalQuantity += product.quantity || 0;
          totalUsed += product.usedQuantity || 0;
        }
      });
      
      return totalQuantity > 0 ? ((totalUsed / totalQuantity) * 100).toFixed(1) : 0;
    }
    
    return 0;
  };

  // Calculate total used items if not provided by backend
  const calculateUsedItems = () => {
    if (batchGroup?.statistics?.usedItems) {
      return batchGroup.statistics.usedItems;
    }
    
    // Fallback calculation
    if (batchGroup?.products && batchGroup.products.length > 0) {
      let totalUsed = 0;
      
      batchGroup.products.forEach(product => {
        if (product.variantDetails && product.variantDetails.length > 0) {
          product.variantDetails.forEach(variant => {
            totalUsed += variant.usedQuantity || 0;
          });
        } else {
          totalUsed += product.usedQuantity || 0;
        }
      });
      
      return totalUsed;
    }
    
    return 0;
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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="p-4 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full inline-block mb-4">
            <RefreshCw className="h-12 w-12 animate-spin text-white" />
          </div>
          <p className="text-gray-700 font-semibold text-lg">Loading batch details...</p>
        </div>
      </div>
    );
  }

  if (error || !batchGroup) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="p-4 bg-gradient-to-r from-red-500 to-pink-600 rounded-full inline-block mb-4">
            <AlertTriangle className="h-12 w-12 text-white" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Error Loading Batch Details</h3>
          <p className="text-gray-600 mb-6 font-medium">{error || 'Batch group not found'}</p>
          <button
            onClick={() => navigate('/sub-admin/warehouse_manager/batches')}
            className="inline-flex items-center px-6 py-3 border border-transparent rounded-lg shadow-sm text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 transform hover:scale-105 transition-all duration-200"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="bg-white shadow-lg border-b border-indigo-100">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <button
                  onClick={() => navigate('/sub-admin/warehouse_manager/batches')}
                  className="mr-4 p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-all duration-200"
                >
                  <ArrowLeft className="h-5 w-5" />
                </button>
                <div>
                  <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                    {batchGroup.batchGroupNumber}
                  </h1>
                  <p className="text-gray-600 mt-1 text-sm font-medium">Warehouse Batch Details</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold border-2 ${getStatusBadgeColor(batchGroup.status)} shadow-sm`}>
                  {batchGroup.status}
                </span>
                {/* Quality Status */}
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold shadow-sm ${
                  batchGroup.qualityChecked 
                    ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white' 
                    : 'bg-gradient-to-r from-yellow-500 to-orange-600 text-white'
                }`}>
                  <CheckCircle className="h-3 w-3 mr-1" />
                  {batchGroup.qualityChecked ? 'Quality Verified' : 'Quality Pending'}
                </span>
                <button className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 transform hover:scale-105 transition-all duration-200">
                  <Download className="h-4 w-4 mr-2" />
                  Export Report
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full px-4 sm:px-6 lg:px-8 py-6">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-xl shadow-lg p-6 transform hover:scale-105 transition-all duration-300 border border-blue-100">
            <div className="flex items-center">
              <div className="flex-shrink-0 p-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl shadow-lg">
                <Package className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-semibold text-gray-600 uppercase tracking-wider">Total Products</p>
                <p className="text-2xl font-bold text-gray-900">{batchGroup.statistics?.totalProducts || 0}</p>
                <p className="text-sm text-blue-600 font-medium">{batchGroup.statistics?.totalItems || 0} total items</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 transform hover:scale-105 transition-all duration-300 border border-green-100">
            <div className="flex items-center">
              <div className="flex-shrink-0 p-3 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl shadow-lg">
                <CheckCircle className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-semibold text-gray-600 uppercase tracking-wider">Available Stock</p>
                <p className="text-2xl font-bold text-gray-900">{batchGroup.statistics?.availableItems || 0}</p>
                <p className="text-sm text-green-600 font-medium">{batchGroup.statistics?.availabilityRate || 0}% available</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 transform hover:scale-105 transition-all duration-300 border border-purple-100">
            <div className="flex items-center">
              <div className="flex-shrink-0 p-3 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl shadow-lg">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-semibold text-gray-600 uppercase tracking-wider">Utilization Rate</p>
                <p className="text-2xl font-bold text-gray-900">{calculateUtilizationRate()}%</p>
                <p className="text-sm text-purple-600 font-medium">{calculateUsedItems()} items used</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 transform hover:scale-105 transition-all duration-300 border border-orange-100">
            <div className="flex items-center">
              <div className="flex-shrink-0 p-3 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl shadow-lg">
                <Truck className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-semibold text-gray-600 uppercase tracking-wider">Orders Served</p>
                <p className="text-2xl font-bold text-gray-900">{batchGroup.statistics?.orderAllocationsCount || 0}</p>
                <p className="text-sm text-orange-600 font-medium">Total allocations</p>
              </div>
            </div>
          </div>
        </div>

        {/* Batch Information and Supplier Information - Single Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Batch Information */}
          <div className="bg-white shadow-lg rounded-xl border border-indigo-100">
            <div className="px-4 py-3 border-b border-indigo-100 bg-gradient-to-r from-indigo-50 to-purple-50">
              <div className="flex items-center">
                <div className="p-2 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg mr-2">
                  <Package className="h-4 w-4 text-white" />
                </div>
                <h3 className="text-sm font-bold text-gray-900">Batch Information</h3>
              </div>
            </div>
            <div className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-3">
                  <label className="block text-xs font-semibold text-indigo-700 mb-1">Batch Group Number</label>
                  <p className="text-sm font-mono font-bold text-gray-900 bg-white px-2 py-1 rounded border border-indigo-200">
                    {batchGroup.batchGroupNumber}
                  </p>
                </div>

                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-3">
                  <label className="block text-xs font-semibold text-green-700 mb-1">Group Type</label>
                  <p className="text-sm font-medium text-gray-900 bg-white px-2 py-1 rounded border border-green-200">
                    {batchGroup.groupType?.replace('_', ' ')}
                  </p>
                </div>

                <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-3">
                  <label className="block text-xs font-semibold text-purple-700 mb-1">Location</label>
                  <div className="flex items-center text-sm font-medium text-gray-900 bg-white px-2 py-1 rounded border border-purple-200">
                    <MapPin className="h-3 w-3 mr-1 text-purple-600" />
                    {batchGroup.location}
                  </div>
                </div>

                <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-lg p-3">
                  <label className="block text-xs font-semibold text-orange-700 mb-1">Manufacturing Date</label>
                  <div className="flex items-center text-sm font-medium text-gray-900 bg-white px-2 py-1 rounded border border-orange-200">
                    <Calendar className="h-3 w-3 mr-1 text-orange-600" />
                    {formatShortDate(batchGroup.defaultManufacturingDate)}
                  </div>
                </div>

                <div className="bg-gradient-to-r from-red-50 to-pink-50 rounded-lg p-3">
                  <label className="block text-xs font-semibold text-red-700 mb-1">Expiry Date</label>
                  <div className={`flex items-center text-sm font-medium bg-white px-2 py-1 rounded border ${batchGroup.statistics?.isExpired ? 'border-red-300 text-red-700' : 'border-red-200 text-gray-900'}`}>
                    <Calendar className="h-3 w-3 mr-1 text-red-600" />
                    {formatShortDate(batchGroup.defaultExpiryDate)}
                    {batchGroup.statistics?.isExpired && (
                      <span className="ml-2 text-xs bg-red-100 text-red-800 px-1 py-0.5 rounded-full font-semibold">Expired</span>
                    )}
                  </div>
                </div>

                <div className="bg-gradient-to-r from-cyan-50 to-blue-50 rounded-lg p-3">
                  <label className="block text-xs font-semibold text-cyan-700 mb-1">Created By</label>
                  <div className="flex items-center text-sm font-medium text-gray-900 bg-white px-2 py-1 rounded border border-cyan-200">
                    <User className="h-3 w-3 mr-1 text-cyan-600" />
                    {batchGroup.createdBy?.name || 'System'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Supplier Information */}
          <div className="bg-white shadow-lg rounded-xl border border-green-100">
            <div className="px-4 py-3 border-b border-green-100 bg-gradient-to-r from-green-50 to-emerald-50">
              <div className="flex items-center">
                <div className="p-2 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg mr-2">
                  <Truck className="h-4 w-4 text-white" />
                </div>
                <h3 className="text-sm font-bold text-gray-900">Supplier Information</h3>
              </div>
            </div>
            <div className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-3">
                  <label className="block text-xs font-semibold text-blue-700 mb-1">Supplier Name</label>
                  <p className="text-sm font-medium text-gray-900 bg-white px-2 py-1 rounded border border-blue-200">
                    {batchGroup.supplierInfo?.supplierName || 'N/A'}
                  </p>
                </div>
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-3">
                  <label className="block text-xs font-semibold text-purple-700 mb-1">Contact Info</label>
                  <p className="text-sm font-medium text-gray-900 bg-white px-2 py-1 rounded border border-purple-200">
                    {batchGroup.supplierInfo?.contactInfo || 'N/A'}
                  </p>
                </div>
                <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-lg p-3">
                  <label className="block text-xs font-semibold text-orange-700 mb-1">Received Date</label>
                  <p className="text-sm font-medium text-gray-900 bg-white px-2 py-1 rounded border border-orange-200">
                    {formatShortDate(batchGroup.supplierInfo?.receivedDate)}
                  </p>
                </div>
                <div className="bg-gradient-to-r from-teal-50 to-green-50 rounded-lg p-3">
                  <label className="block text-xs font-semibold text-teal-700 mb-1">Created At</label>
                  <p className="text-sm font-medium text-gray-900 bg-white px-2 py-1 rounded border border-teal-200">
                    {formatDate(batchGroup.createdAt)}
                  </p>
                </div>
                {batchGroup.supplierInfo?.notes && (
                  <div className="md:col-span-2 bg-gradient-to-r from-cyan-50 to-blue-50 rounded-lg p-3">
                    <label className="block text-xs font-semibold text-cyan-700 mb-1">Notes</label>
                    <p className="text-sm font-medium text-gray-900 bg-white px-2 py-1 rounded border border-cyan-200">
                      {batchGroup.supplierInfo.notes}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6">
          {/* Products List */}
          <div className="bg-white shadow-xl rounded-xl border border-indigo-100">
            <div className="px-6 py-4 border-b border-indigo-100 bg-gradient-to-r from-indigo-50 to-purple-50">
              <div className="flex items-center">
                <div className="p-2 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg mr-3">
                  <Package className="h-5 w-5 text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">Products in this Batch</h3>
              </div>
            </div>
            <div className="overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Product
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Stock Status
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Usage Stats
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Current Stock
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {batchGroup.products?.map((product, index) => (
                      <tr key={index} className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-200">
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            {product.productDetails?.images?.[0] && (
                              <img
                                className="h-14 w-14 rounded-xl object-cover mr-4 shadow-md border border-gray-200"
                                src={product.productDetails.images[0]}
                                alt={product.productDetails.name}
                              />
                            )}
                            <div>
                              <div className="text-sm font-bold text-gray-900">
                                {product.productDetails?.name || 'Unknown Product'}
                              </div>
                              <div className="text-sm text-gray-600 font-medium">
                                {product.productDetails?.category}
                              </div>
                              {product.isProductDeleted && (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-bold bg-red-100 text-red-800 border border-red-200">
                                  Deleted
                                </span>
                              )}
                            </div>
                          </div>
                        </td>
                        
                        <td className="px-6 py-4">
                          {product.variantDetails && product.variantDetails.length > 0 ? (
                            <div className="space-y-3">
                              {product.variantDetails.map((variant, vIndex) => {
                                const stockPercentage = calculateStockPercentage(variant.availableQuantity, variant.quantity);
                                return (
                                  <div key={vIndex} className="border border-gray-200 rounded-lg p-3 bg-gradient-to-r from-gray-50 to-gray-100">
                                    <div className="text-sm font-bold text-gray-800 mb-1">{variant.variantName}</div>
                                    <div className="text-xs text-gray-600 mb-2 font-medium">
                                      Available: {variant.availableQuantity}/{variant.quantity}
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2 shadow-inner">
                                      <div 
                                        className={`h-2 rounded-full transition-all duration-300 ${stockPercentage > 50 ? 'bg-gradient-to-r from-green-500 to-emerald-500' : stockPercentage > 20 ? 'bg-gradient-to-r from-yellow-500 to-orange-500' : 'bg-gradient-to-r from-red-500 to-pink-500'}`}
                                        style={{ width: `${stockPercentage}%` }}
                                      ></div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          ) : (
                            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-3">
                              <div className="text-sm font-bold text-gray-900 mb-2">
                                Available: {product.availableQuantity || 0}/{product.quantity || 0}
                              </div>
                              <div className="w-24 bg-gray-200 rounded-full h-2 shadow-inner">
                                <div 
                                  className={`h-2 rounded-full transition-all duration-300 ${calculateStockPercentage(product.availableQuantity, product.quantity) > 50 ? 'bg-gradient-to-r from-green-500 to-emerald-500' : 'bg-gradient-to-r from-yellow-500 to-orange-500'}`}
                                  style={{ width: `${calculateStockPercentage(product.availableQuantity, product.quantity)}%` }}
                                ></div>
                              </div>
                            </div>
                          )}
                        </td>
                        
                        <td className="px-6 py-4">
                          {product.variantDetails && product.variantDetails.length > 0 ? (
                            <div className="space-y-2">
                              {product.variantDetails.map((variant, vIndex) => {
                                const availableQty = variant.availableQuantity || 0;
                                const totalQty = variant.quantity || 0;
                                const usedQty = variant.usedQuantity || 0;
                                const allocatedQty = variant.allocatedQuantity || 0;
                                
                                // Calculate utilization rate based on used vs total
                                const utilizationRate = totalQty > 0 ? ((usedQty / totalQty) * 100).toFixed(1) : 0;
                                
                                // Calculate availability rate
                                const availabilityRate = totalQty > 0 ? ((availableQty / totalQty) * 100).toFixed(1) : 0;
                                
                                return (
                                  <div key={vIndex} className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-2">
                                    <div className="text-xs font-bold text-gray-800">
                                      Used: {usedQty} / {totalQty}
                                    </div>
                                    <div className="text-xs text-purple-600 font-medium">
                                      Utilization: {utilizationRate}%
                                    </div>
                                    <div className="text-xs text-green-600 font-medium">
                                      Available: {availableQty} ({availabilityRate}%)
                                    </div>
                                    <div className="text-xs text-orange-600 font-medium">
                                      Allocated: {allocatedQty}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          ) : (
                            <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-lg p-3">
                              <div className="text-sm font-bold text-gray-800">
                                Used: {product.usedQuantity || 0} / {product.quantity || 0}
                              </div>
                              <div className="text-xs text-orange-600 font-medium">
                                Utilization: {product.quantity > 0 ? (((product.usedQuantity || 0) / product.quantity) * 100).toFixed(1) : 0}%
                              </div>
                              <div className="text-xs text-green-600 font-medium">
                                Available: {product.availableQuantity || 0} ({product.quantity > 0 ? (((product.availableQuantity || 0) / product.quantity) * 100).toFixed(1) : 0}%)
                              </div>
                              <div className="text-xs text-purple-600 font-medium">
                                Allocated: {product.allocatedQuantity || 0}
                              </div>
                            </div>
                          )}
                        </td>
                        
                        <td className="px-6 py-4 whitespace-nowrap">
                          {product.variantDetails && product.variantDetails.length > 0 ? (
                            <div className="space-y-2">
                              {product.variantDetails.map((variant, vIndex) => (
                                <div key={vIndex} className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-3">
                                  <div className="text-sm font-bold text-gray-900">{variant.availableQuantity || 0}</div>
                                  <div className="text-xs text-green-600 font-medium">
                                    ₹{variant.price || product.productDetails?.price || 0}
                                  </div>
                                  {variant.variantName && (
                                    <div className="text-xs text-gray-500 font-medium">{variant.variantName}</div>
                                  )}
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-3">
                              <div className="text-sm font-bold text-gray-900">{product.currentStock || 0}</div>
                              <div className="text-xs text-green-600 font-medium">
                                ₹{product.productDetails?.price || 0}
                              </div>
                            </div>
                          )}
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap">
                          <button
                            onClick={() => navigate(`/admin/products`)}
                            className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-all duration-200"
                          >
                            <Eye className="h-5 w-5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {(!batchGroup.products || batchGroup.products.length === 0) && (
              <div className="text-center py-16">
                <div className="p-4 bg-gradient-to-r from-gray-500 to-gray-600 rounded-full inline-block mb-4">
                  <Package className="mx-auto h-12 w-12 text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">No products found</h3>
                <p className="text-gray-600 font-medium">
                  This batch group doesn't contain any products.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WarehouseBatchDetails;