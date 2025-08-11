import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { 
  FiPlus, 
  FiEdit, 
  FiTrash2, 
  FiPackage, 
  FiStar, 
  FiEye, 
  FiEyeOff,
  FiSearch,
  FiFilter,
  FiDollarSign,
  FiBox
} from 'react-icons/fi';

const AdminComboPacks = () => {
  const [comboPacks, setComboPacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBy, setFilterBy] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingComboPack, setEditingComboPack] = useState(null);

  useEffect(() => {
    fetchComboPacks();
  }, []);

  const fetchComboPacks = async () => {
    try {
      setLoading(true);
      const response = await fetch('https://indiraa1-backend.onrender.com/api/combo-packs/all', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      
      if (data.success) {
        setComboPacks(data.comboPacks || []);
      } else {
        toast.error('Failed to fetch combo packs');
      }
    } catch (error) {
      console.error('Error fetching combo packs:', error);
      toast.error('Failed to fetch combo packs');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (comboPackId) => {
    if (!window.confirm('Are you sure you want to delete this combo pack?')) {
      return;
    }

    try {
      const response = await fetch(`https://indiraa1-backend.onrender.com/api/combo-packs/${comboPackId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        toast.success('Combo pack deleted successfully');
        fetchComboPacks();
      } else {
        throw new Error('Failed to delete combo pack');
      }
    } catch (error) {
      console.error('Error deleting combo pack:', error);
      toast.error('Failed to delete combo pack');
    }
  };

  const toggleVisibility = async (comboPackId, currentVisibility) => {
    try {
      const response = await fetch(`https://indiraa1-backend.onrender.com/api/combo-packs/${comboPackId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          isVisible: !currentVisibility
        })
      });

      if (response.ok) {
        toast.success(`Combo pack ${!currentVisibility ? 'shown' : 'hidden'} successfully`);
        fetchComboPacks();
      } else {
        throw new Error('Failed to update combo pack visibility');
      }
    } catch (error) {
      console.error('Error updating combo pack visibility:', error);
      toast.error('Failed to update combo pack visibility');
    }
  };

  const filteredComboPacks = comboPacks.filter(comboPack => {
    const matchesSearch = comboPack.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         comboPack.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filterBy === 'all') return matchesSearch;
    if (filterBy === 'active') return matchesSearch && comboPack.isActive;
    if (filterBy === 'inactive') return matchesSearch && !comboPack.isActive;
    if (filterBy === 'visible') return matchesSearch && comboPack.isVisible;
    if (filterBy === 'hidden') return matchesSearch && !comboPack.isVisible;
    if (filterBy === 'outOfStock') return matchesSearch && comboPack.stock <= 0;
    
    return matchesSearch;
  });

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading combo packs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full  p-4 sm:p-6 lg:p-8">
      <div className="mx-auto">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6 bg-white p-5 lg:p-6 rounded-2xl shadow-lg border border-green-100">
          <div className="mb-4 lg:mb-0">
            <h1 className="text-xl lg:text-2xl font-bold text-green-800 mb-2 flex items-center">
              <FiPackage className="mr-3 text-green-600" />
              Combo Packs Management
            </h1>
            <p className="text-green-600 text-sm font-medium">Create and manage irresistible combo pack deals</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="group bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl transition-all duration-300 font-semibold flex items-center gap-3 shadow-md hover:shadow-lg transform hover:scale-105"
          >
            <FiPlus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
            <span>Create Combo Pack</span>
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-5 rounded-xl shadow-md border border-green-100 hover:shadow-lg transition-all duration-300 transform hover:scale-105">
            <div className="flex items-center">
              <div className="p-3 bg-green-500 rounded-xl shadow-md">
                <FiPackage className="w-5 h-5 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-xs font-semibold text-green-600 uppercase tracking-wide">Total Combo Packs</p>
                <p className="text-lg font-bold text-green-800">{comboPacks.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl shadow-md border border-green-100 hover:shadow-lg transition-all duration-300 transform hover:scale-105">
            <div className="flex items-center">
              <div className="p-3 bg-green-600 rounded-xl shadow-md">
                <FiEye className="w-5 h-5 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-xs font-semibold text-green-600 uppercase tracking-wide">Active & Visible</p>
                <p className="text-lg font-bold text-green-800">
                  {comboPacks.filter(cp => cp.isActive && cp.isVisible).length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl shadow-md border border-green-100 hover:shadow-lg transition-all duration-300 transform hover:scale-105">
            <div className="flex items-center">
              <div className="p-3 bg-green-700 rounded-xl shadow-md">
                <FiBox className="w-5 h-5 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-xs font-semibold text-green-600 uppercase tracking-wide">Out of Stock</p>
                <p className="text-lg font-bold text-green-800">
                  {comboPacks.filter(cp => cp.stock <= 0).length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl shadow-md border border-green-100 hover:shadow-lg transition-all duration-300 transform hover:scale-105">
            <div className="flex items-center">
              <div className="p-3 bg-green-800 rounded-xl shadow-md">
                <FiDollarSign className="w-5 h-5 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-xs font-semibold text-green-600 uppercase tracking-wide">Avg. Discount</p>
                <p className="text-lg font-bold text-green-800">
                  {comboPacks.length > 0 
                    ? Math.round(comboPacks.reduce((sum, cp) => sum + (cp.discountPercentage || 0), 0) / comboPacks.length)
                    : 0
                  }%
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/30 p-6 lg:p-8 mb-8">
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="flex-1 relative group">
              <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-purple-500 transition-colors duration-300" />
              <input
                type="text"
                placeholder="Search combo packs by name, description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-4 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white/70 backdrop-blur-sm placeholder-gray-500 font-medium transition-all duration-300 hover:shadow-md"
              />
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3 bg-white/70 backdrop-blur-sm px-4 py-3 rounded-2xl border border-gray-200 shadow-md">
                <FiFilter className="text-purple-500 w-5 h-5" />
                <select
                  value={filterBy}
                  onChange={(e) => setFilterBy(e.target.value)}
                  className="bg-transparent border-none focus:ring-0 focus:outline-none font-medium text-gray-700 cursor-pointer"
                >
                  <option value="all">All Packs</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="visible">Visible</option>
                  <option value="hidden">Hidden</option>
                  <option value="outOfStock">Out of Stock</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Combo Packs Table */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/30 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-purple-50 to-violet-50 border-b border-gray-200">
                <tr>
                  <th className="text-left py-6 px-8 font-bold text-gray-800 text-sm uppercase tracking-wide">Combo Pack</th>
                  <th className="text-left py-6 px-8 font-bold text-gray-800 text-sm uppercase tracking-wide">Products</th>
                  <th className="text-left py-6 px-8 font-bold text-gray-800 text-sm uppercase tracking-wide">Pricing</th>
                  <th className="text-left py-6 px-8 font-bold text-gray-800 text-sm uppercase tracking-wide">Stock</th>
                  <th className="text-left py-6 px-8 font-bold text-gray-800 text-sm uppercase tracking-wide">Status</th>
                  <th className="text-left py-6 px-8 font-bold text-gray-800 text-sm uppercase tracking-wide">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredComboPacks.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-16 text-center">
                      <div className="flex flex-col items-center">
                        <div className="p-6 bg-gradient-to-br from-purple-100 to-violet-100 rounded-full mb-4">
                          <FiPackage className="w-12 h-12 text-purple-500" />
                        </div>
                        <p className="text-xl font-semibold text-gray-600 mb-2">No combo packs found</p>
                        <p className="text-gray-500">Create your first combo pack to get started</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                filteredComboPacks.map((comboPack) => (
                  <motion.tr
                    key={comboPack._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="hover:bg-gradient-to-r hover:from-purple-50/50 hover:to-violet-50/50 transition-all duration-300 group"
                  >
                    <td className="py-6 px-8">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-violet-100 rounded-2xl overflow-hidden flex-shrink-0 shadow-md group-hover:shadow-lg transition-shadow duration-300">
                          {comboPack.mainImage ? (
                            <img
                              src={comboPack.mainImage}
                              alt={comboPack.name}
                              className="w-full h-full object-cover"
                            />
                          ) : comboPack.products?.[0]?.images?.[0] ? (
                            <img
                              src={comboPack.products[0].images[0].url}
                              alt={comboPack.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <FiPackage className="w-8 h-8 text-purple-400" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="font-bold text-gray-800 text-lg mb-1 group-hover:text-purple-700 transition-colors duration-300">{comboPack.name}</p>
                          <p className="text-gray-600 line-clamp-2 mb-2">{comboPack.description}</p>
                          {comboPack.badgeText && (
                            <span className="inline-flex items-center bg-gradient-to-r from-purple-500 to-violet-600 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-md">
                              {comboPack.badgeText}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="py-6 px-8">
                      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
                        <p className="font-bold text-blue-800 text-lg mb-1">
                          {comboPack.products?.length || 0} items
                        </p>
                        <p className="text-blue-600 text-sm leading-relaxed">
                          {comboPack.products?.slice(0, 2).map(p => p.productName).join(', ')}
                          {comboPack.products?.length > 2 && (
                            <span className="text-blue-500 font-medium"> +{comboPack.products.length - 2} more</span>
                          )}
                        </p>
                      </div>
                    </td>

                    <td className="py-6 px-8">
                      <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border border-green-100">
                        <p className="font-bold text-green-800 text-xl mb-1">
                          {formatPrice(comboPack.comboPrice)}
                        </p>
                        {comboPack.originalTotalPrice > comboPack.comboPrice && (
                          <p className="text-gray-500 line-through text-sm mb-2">
                            {formatPrice(comboPack.originalTotalPrice)}
                          </p>
                        )}
                        {comboPack.discountPercentage > 0 && (
                          <span className="inline-flex items-center bg-gradient-to-r from-green-500 to-emerald-600 text-white px-3 py-1 rounded-full text-xs font-bold shadow-md">
                            {comboPack.discountPercentage}% OFF
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="py-6 px-8">
                      <div className="flex justify-center">
                        <span className={`inline-flex items-center px-4 py-2 rounded-2xl text-sm font-bold shadow-md ${
                          comboPack.stock > 10
                            ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white'
                            : comboPack.stock > 0
                            ? 'bg-gradient-to-r from-yellow-500 to-orange-600 text-white'
                            : 'bg-gradient-to-r from-red-500 to-rose-600 text-white'
                        }`}>
                          <FiBox className="w-4 h-4 mr-2" />
                          {comboPack.stock} units
                        </span>
                      </div>
                    </td>

                    <td className="py-6 px-8">
                      <div className="flex flex-col gap-2">
                        <span className={`inline-flex items-center px-3 py-2 rounded-xl text-xs font-bold shadow-md ${
                          comboPack.isActive
                            ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white'
                            : 'bg-gradient-to-r from-red-500 to-rose-600 text-white'
                        }`}>
                          <div className={`w-2 h-2 rounded-full mr-2 ${comboPack.isActive ? 'bg-white' : 'bg-white'}`}></div>
                          {comboPack.isActive ? 'Active' : 'Inactive'}
                        </span>
                        <span className={`inline-flex items-center px-3 py-2 rounded-xl text-xs font-bold shadow-md ${
                          comboPack.isVisible
                            ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white'
                            : 'bg-gradient-to-r from-gray-500 to-gray-600 text-white'
                        }`}>
                          <div className={`w-2 h-2 rounded-full mr-2 ${comboPack.isVisible ? 'bg-white' : 'bg-white'}`}></div>
                          {comboPack.isVisible ? 'Visible' : 'Hidden'}
                        </span>
                      </div>
                    </td>

                    <td className="py-6 px-8">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => setEditingComboPack(comboPack)}
                          className="group p-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-105"
                          title="Edit Combo Pack"
                        >
                          <FiEdit className="w-4 h-4 group-hover:rotate-12 transition-transform duration-300" />
                        </button>
                        
                        <button
                          onClick={() => toggleVisibility(comboPack._id, comboPack.isVisible)}
                          className={`group p-3 rounded-xl transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-105 ${
                            comboPack.isVisible
                              ? 'bg-yellow-500 hover:bg-yellow-600 text-white'
                              : 'bg-green-500 hover:bg-green-600 text-white'
                          }`}
                          title={comboPack.isVisible ? 'Hide Combo Pack' : 'Show Combo Pack'}
                        >
                          {comboPack.isVisible 
                            ? <FiEyeOff className="w-4 h-4 group-hover:scale-110 transition-transform duration-300" /> 
                            : <FiEye className="w-4 h-4 group-hover:scale-110 transition-transform duration-300" />
                          }
                        </button>
                        
                        <button
                          onClick={() => handleDelete(comboPack._id)}
                          className="group p-3 bg-red-500 hover:bg-red-600 text-white rounded-xl transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-105"
                          title="Delete Combo Pack"
                        >
                          <FiTrash2 className="w-4 h-4 group-hover:rotate-12 transition-transform duration-300" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create/Edit Modal */}
      {(showCreateModal || editingComboPack) && (
        <ComboPackModal
          comboPack={editingComboPack}
          onClose={() => {
            setShowCreateModal(false);
            setEditingComboPack(null);
          }}
          onSuccess={() => {
            setShowCreateModal(false);
            setEditingComboPack(null);
            fetchComboPacks();
          }}
        />
      )}
    </div>
    </div>
  );
};

// Combo Pack Modal Component
const ComboPackModal = ({ comboPack, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState([]);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: comboPack?.name || '',
    description: comboPack?.description || '',
    mainImage: comboPack?.mainImage || '',
    products: comboPack?.products || [],
    comboPrice: comboPack?.comboPrice || '',
    stock: comboPack?.stock || '',
    category: comboPack?.category || 'Combo Pack',
    tags: comboPack?.tags || [],
    featured: comboPack?.featured || false,
    badgeText: comboPack?.badgeText || '',
    isActive: comboPack?.isActive !== undefined ? comboPack.isActive : true,
    isVisible: comboPack?.isVisible !== undefined ? comboPack.isVisible : true
  });
  const [selectedProducts, setSelectedProducts] = useState([]);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch('https://indiraa1-backend.onrender.com/api/products');
      const data = await response.json();
      if (data.products) {
        setProducts(data.products);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Failed to fetch products');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (selectedProducts.length === 0) {
      toast.error('Please select at least one product');
      return;
    }

    setLoading(true);
    
    try {
      const submitData = {
        ...formData,
        products: selectedProducts,
        comboPrice: parseFloat(formData.comboPrice),
        stock: parseInt(formData.stock)
      };

      const url = comboPack 
        ? `https://indiraa1-backend.onrender.com/api/combo-packs/${comboPack._id}`
        : 'https://indiraa1-backend.onrender.com/api/combo-packs/create';
      
      const method = comboPack ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(submitData)
      });

      if (response.ok) {
        toast.success(`Combo pack ${comboPack ? 'updated' : 'created'} successfully`);
        onSuccess();
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || `Failed to ${comboPack ? 'update' : 'create'} combo pack`);
      }
    } catch (error) {
      console.error('Error saving combo pack:', error);
      toast.error(`Failed to ${comboPack ? 'update' : 'create'} combo pack`);
    } finally {
      setLoading(false);
    }
  };

  const addProductToCombo = (product, variant = null) => {
    const productData = {
      productId: product._id,
      variantId: variant?.id || null,
      quantity: 1,
      productName: product.name,
      variantName: variant?.name || null,
      originalPrice: variant?.price || product.price
    };

    setSelectedProducts([...selectedProducts, productData]);
  };

  const removeProductFromCombo = (index) => {
    setSelectedProducts(selectedProducts.filter((_, i) => i !== index));
  };

  const updateProductQuantity = (index, quantity) => {
    const updated = [...selectedProducts];
    updated[index].quantity = Math.max(1, quantity);
    setSelectedProducts(updated);
  };

  const calculateOriginalTotal = () => {
    return selectedProducts.reduce((total, product) => {
      return total + (product.originalPrice * product.quantity);
    }, 0);
  };

  return (
    <div className="fixed inset-0 bg-white bg-opacity-20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white bg-opacity-20 rounded-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              {comboPack ? 'Edit Combo Pack' : 'Create New Combo Pack'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              ×
            </button>
          </div>

          {/* Step Indicator */}
          <div className="mb-8">
            <div className="flex items-center">
              <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                step >= 1 ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-600'
              }`}>
                1
              </div>
              <div className={`flex-1 h-1 mx-4 ${step >= 2 ? 'bg-purple-600' : 'bg-gray-200'}`}></div>
              <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                step >= 2 ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-600'
              }`}>
                2
              </div>
              <div className={`flex-1 h-1 mx-4 ${step >= 3 ? 'bg-purple-600' : 'bg-gray-200'}`}></div>
              <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                step >= 3 ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-600'
              }`}>
                3
              </div>
            </div>
            <div className="flex justify-between mt-2 text-sm text-gray-600">
              <span>Basic Info</span>
              <span>Select Products</span>
              <span>Pricing & Settings</span>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Step 1: Basic Information */}
            {step === 1 && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Combo Pack Name *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Main Image URL
                    </label>
                    <input
                      type="url"
                      value={formData.mainImage}
                      onChange={(e) => setFormData({...formData, mainImage: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description *
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category
                    </label>
                    <input
                      type="text"
                      value={formData.category}
                      onChange={(e) => setFormData({...formData, category: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Badge Text
                    </label>
                    <input
                      type="text"
                      value={formData.badgeText}
                      onChange={(e) => setFormData({...formData, badgeText: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="e.g., Best Seller, Limited Time"
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    Next: Select Products
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Product Selection */}
            {step === 2 && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Available Products */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Available Products</h3>
                    <div className="max-h-96 overflow-y-auto border border-gray-200 rounded-lg">
                      {products.map((product) => (
                        <div key={product._id} className="p-4 border-b border-gray-100 last:border-b-0">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium text-gray-900">{product.name}</h4>
                            <span className="text-sm text-gray-500">₹{product.price}</span>
                          </div>
                          
                          <div className="flex flex-wrap gap-2">
                            <button
                              type="button"
                              onClick={() => addProductToCombo(product)}
                              className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded hover:bg-purple-200 transition-colors"
                            >
                              Add Main Product
                            </button>
                            
                            {product.hasVariants && product.variants?.map((variant) => (
                              <button
                                key={variant.id}
                                type="button"
                                onClick={() => addProductToCombo(product, variant)}
                                className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded hover:bg-blue-200 transition-colors"
                              >
                                Add {variant.label} (₹{variant.price})
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Selected Products */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                      Selected Products ({selectedProducts.length})
                    </h3>
                    <div className="max-h-96 overflow-y-auto border border-gray-200 rounded-lg">
                      {selectedProducts.length === 0 ? (
                        <div className="p-8 text-center text-gray-500">
                          <FiPackage className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                          <p>No products selected yet</p>
                        </div>
                      ) : (
                        selectedProducts.map((product, index) => (
                          <div key={index} className="p-4 border-b border-gray-100 last:border-b-0">
                            <div className="flex items-center justify-between">
                              <div>
                                <h4 className="font-medium text-gray-900">{product.productName}</h4>
                                {product.variantName && (
                                  <p className="text-sm text-gray-500">Variant: {product.variantName}</p>
                                )}
                                <p className="text-sm text-gray-600">₹{product.originalPrice} each</p>
                              </div>
                              
                              <div className="flex items-center space-x-2">
                                <div className="flex items-center space-x-1">
                                  <button
                                    type="button"
                                    onClick={() => updateProductQuantity(index, product.quantity - 1)}
                                    className="w-6 h-6 rounded bg-gray-100 flex items-center justify-center"
                                  >
                                    -
                                  </button>
                                  <span className="w-8 text-center">{product.quantity}</span>
                                  <button
                                    type="button"
                                    onClick={() => updateProductQuantity(index, product.quantity + 1)}
                                    className="w-6 h-6 rounded bg-gray-100 flex items-center justify-center"
                                  >
                                    +
                                  </button>
                                </div>
                                
                                <button
                                  type="button"
                                  onClick={() => removeProductFromCombo(index)}
                                  className="text-red-600 hover:text-red-800"
                                >
                                  <FiTrash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                    
                    {selectedProducts.length > 0 && (
                      <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                        <p className="font-medium text-gray-900">
                          Original Total: ₹{calculateOriginalTotal().toLocaleString()}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex justify-between">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="border border-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Previous
                  </button>
                  <button
                    type="button"
                    onClick={() => setStep(3)}
                    disabled={selectedProducts.length === 0}
                    className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors disabled:bg-gray-400"
                  >
                    Next: Pricing & Settings
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Pricing and Settings */}
            {step === 3 && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Combo Price *
                    </label>
                    <input
                      type="number"
                      value={formData.comboPrice}
                      onChange={(e) => setFormData({...formData, comboPrice: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      required
                      min="0"
                      step="0.01"
                    />
                    {selectedProducts.length > 0 && formData.comboPrice && (
                      <p className="text-sm text-gray-600 mt-1">
                        Discount: ₹{(calculateOriginalTotal() - parseFloat(formData.comboPrice)).toLocaleString()} 
                        ({Math.round(((calculateOriginalTotal() - parseFloat(formData.comboPrice)) / calculateOriginalTotal()) * 100)}%)
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Stock Quantity *
                    </label>
                    <input
                      type="number"
                      value={formData.stock}
                      onChange={(e) => setFormData({...formData, stock: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      required
                      min="0"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="isActive"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                      className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                    />
                    <label htmlFor="isActive" className="ml-2 text-sm text-gray-700">
                      Active
                    </label>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="isVisible"
                      checked={formData.isVisible}
                      onChange={(e) => setFormData({...formData, isVisible: e.target.checked})}
                      className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                    />
                    <label htmlFor="isVisible" className="ml-2 text-sm text-gray-700">
                      Visible to customers
                    </label>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="featured"
                      checked={formData.featured}
                      onChange={(e) => setFormData({...formData, featured: e.target.checked})}
                      className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                    />
                    <label htmlFor="featured" className="ml-2 text-sm text-gray-700">
                      Featured
                    </label>
                  </div>
                </div>

                {/* Summary */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <h4 className="font-medium text-gray-900 mb-4">Summary</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p><span className="font-medium">Name:</span> {formData.name}</p>
                      <p><span className="font-medium">Products:</span> {selectedProducts.length} items</p>
                      <p><span className="font-medium">Stock:</span> {formData.stock} units</p>
                    </div>
                    <div>
                      <p><span className="font-medium">Original Total:</span> ₹{calculateOriginalTotal().toLocaleString()}</p>
                      <p><span className="font-medium">Combo Price:</span> ₹{parseFloat(formData.comboPrice || 0).toLocaleString()}</p>
                      <p><span className="font-medium">Savings:</span> ₹{(calculateOriginalTotal() - parseFloat(formData.comboPrice || 0)).toLocaleString()}</p>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="border border-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Previous
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors disabled:bg-gray-400"
                  >
                    {loading ? 'Saving...' : (comboPack ? 'Update Combo Pack' : 'Create Combo Pack')}
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminComboPacks;
