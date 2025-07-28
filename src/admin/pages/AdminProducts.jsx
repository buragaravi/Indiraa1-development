import React, { useState, useEffect } from 'react';
import { useThemeContext } from '../../context/ThemeProvider';
import { classNames } from '../utils/classNames';
import { useAuth } from '../utils/useAuth';
import { useAdminPermission } from '../context/AdminPermissionContext';
import PermissionButton from '../components/PermissionButton';
import { 
  AddIcon, 
  EditIcon, 
  DeleteIcon, 
  LoadingIcon, 
  EmptyIcon, 
  ImageIcon,
  SaveIcon,
  UpdateIcon,
  CloseIcon,
  CheckIcon,
  ProductsIcon
} from '../components/AdminIcons';
import BulkUpload from '../../components/admin/BulkUpload';
import toast from 'react-hot-toast';

const AdminProducts = ({ isReadOnly = false, onAccessDenied = () => {} }) => {
  const { primary, mode } = useThemeContext();
  const { isAdmin } = useAuth();
  const { 
    hasModuleAccess, 
    canCreateProduct, 
    canEditProduct, 
    canDeleteProduct, 
    canBulkUpload 
  } = useAdminPermission();  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [showBulkUpload, setShowBulkUpload] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);  const [expandedProduct, setExpandedProduct] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    stock: '',
    images: [],
    hasVariants: false,
    variants: []
  });

  // Helper function to get cumulative stock for products with variants
  const getCumulativeStock = (product) => {
    if (!product.hasVariants || !product.variants) {
      return product.stock || 0;
    }
    return product.variants.reduce((total, variant) => total + (variant.stock || 0), 0);
  };

  // Helper function to toggle expanded product
  const toggleExpandedProduct = (productId) => {
    setExpandedProduct(expandedProduct === productId ? null : productId);
  };

  useEffect(() => {
    // Only fetch products if admin has module access
    if (hasModuleAccess('products')) {
      fetchProducts();
    }
  }, [hasModuleAccess]);
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch('https://indiraa1-backend.onrender.com/api/products/', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setProducts(data.products || []);
      } else {
        toast.error('Failed to fetch products');
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Error loading products');
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

  const handleImageChange = (e) => {
    setFormData(prev => ({
      ...prev,
      images: Array.from(e.target.files)
    }));
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Check permissions for warehouse managers/logistics managers
    if (isReadOnly && !isAdmin) {
      onAccessDenied('add or edit products');
      return;
    }
    
    setSubmitting(true);
    
    try {
      const token = localStorage.getItem('token');
      const formDataToSend = new FormData();
        // Append all form fields
      Object.keys(formData).forEach(key => {
        if (key === 'images' && formData.images.length > 0) {
          formData.images.forEach(image => {
            formDataToSend.append('images', image);
          });
        } else if (key === 'variants') {
          // Serialize variants array as JSON
          formDataToSend.append('variants', JSON.stringify(formData.variants));
        } else if (key !== 'images') {
          formDataToSend.append(key, formData[key]);
        }
      });

      let response;
      if (editingProduct) {
        response = await fetch(`https://indiraa1-backend.onrender.com/api/products/${editingProduct._id}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: formDataToSend
        });
      } else {
        response = await fetch('https://indiraa1-backend.onrender.com/api/products/', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: formDataToSend
        });
      }

      if (response.ok) {
        toast.success(editingProduct ? 'Product updated successfully!' : 'Product created successfully!');
        await fetchProducts();
        resetForm();
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || 'Failed to save product');
      }    } catch (error) {
      console.error('Error saving product:', error);
      toast.error('Error saving product');
    } finally {
      setSubmitting(false);
    }
  };
  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name || '',
      description: product.description || '',
      price: product.price || '',
      category: product.category || '',
      stock: product.stock || '',
      images: [],
      hasVariants: product.hasVariants || false,
      variants: product.variants ? product.variants.map(v => ({
        id: v.id || Date.now().toString(),
        label: v.label || '',
        name: v.name || '',        price: v.price || '',
        stock: v.stock || '',
        isDefault: v.isDefault || false
      })) : []
    });
    setShowForm(true);
  };
  const handleDelete = async (productId) => {
    // Check permissions for warehouse managers/logistics managers
    if (isReadOnly && !isAdmin) {
      onAccessDenied('delete products');
      return;
    }
    
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`https://indiraa1-backend.onrender.com/api/products/${productId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (response.ok) {
          fetchProducts();
          toast.success('Product deleted successfully');
        } else {
          const errorData = await response.json();
          toast.error(errorData.message || 'Failed to delete product');
        }
      } catch (error) {
        console.error('Error deleting product:', error);
        toast.error('Error deleting product');
      }
    }
  };
  const resetForm = () => {
    setShowForm(false);
    setEditingProduct(null);
    setFormData({
      name: '',
      description: '',
      price: '',
      category: '',
      stock: '',
      images: [],
      hasVariants: false,
      variants: []
    });
  };

  // Variant management functions
  const handleVariantToggle = (e) => {
    const hasVariants = e.target.checked;
    setFormData(prev => ({
      ...prev,
      hasVariants,
      variants: hasVariants ? [{ id: Date.now().toString(), label: '', name: '', price: '', stock: '', isDefault: false }] : []
    }));
  };

  const addVariant = () => {
    setFormData(prev => ({
      ...prev,
      variants: [...prev.variants, { 
        id: Date.now().toString(), 
        label: '', 
        name: '', 
        price: '', 
        stock: '', 
        isDefault: false 
      }]
    }));
  };

  const removeVariant = (index) => {
    setFormData(prev => ({
      ...prev,
      variants: prev.variants.filter((_, i) => i !== index)
    }));
  };

  const updateVariant = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      variants: prev.variants.map((variant, i) => 
        i === index ? { ...variant, [field]: value } : variant
      )
    }));
  };

  const setDefaultVariant = (index) => {
    setFormData(prev => ({
      ...prev,
      variants: prev.variants.map((variant, i) => 
        ({ ...variant, isDefault: i === index })
      )
    }));
  };

  // Helper function to calculate total stock
  const getTotalStock = (product) => {
    if (product.hasVariants && product.variants?.length > 0) {
      return product.variants.reduce((total, variant) => total + (variant.stock || 0), 0);
    }
    return product.stock || 0;
  };

  // Toggle product details
  const toggleProductDetails = (productId) => {
    setExpandedProduct(expandedProduct === productId ? null : productId);
  };

  // Check if current admin has access to products module
  if (!hasModuleAccess('products')) {
    return (
      <div className="admin-products-bg">
        <div className="text-center p-8 rounded-3xl shadow-soft bg-white/70 backdrop-blur-sm">
          <EmptyIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-4 text-gray-800">Access Denied</h1>
          <p className="text-gray-600">You don't have permission to access Product Management.</p>
        </div>
      </div>
    );
  }  return (
    <>
      <div className="max-w-7xl mx-auto w-full">        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center mb-8 space-y-4 lg:space-y-0">
          <div>
            <h1 className="admin-products-title">
              Product Management
            </h1>
            <p className="text-gray-600 text-base lg:text-lg">
              Manage your store's products with ease
            </p>
            
            {/* Limited Access Info */}
            {(!canCreateProduct && !canEditProduct && !canDeleteProduct && !canBulkUpload) && (
              <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-blue-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <h3 className="text-sm font-medium text-blue-800">View-Only Access</h3>
                    <p className="text-sm text-blue-700 mt-1">
                      You can view products but cannot create, edit, or delete them.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Action Buttons - Permission-based visibility */}
          <div className="flex flex-col sm:flex-row gap-3">
            <PermissionButton
              module="products"
              action="bulk_upload"
              onClick={() => setShowBulkUpload(true)}
              className="admin-products-blue-button"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              Bulk Upload
            </PermissionButton>
            
            <PermissionButton
              module="products"
              action="create_product"
              onClick={() => setShowForm(true)}
              className="admin-products-green-button"
            >
              <AddIcon className="w-5 h-5 mr-2" />
              Add New Product
            </PermissionButton>
          </div>
        </div>

        {/* Bulk Upload Section */}
        {showBulkUpload && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl max-w-7xl w-full max-h-[90vh] overflow-auto relative">
              <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-800">Bulk Product Upload</h2>
                <button
                  onClick={() => setShowBulkUpload(false)}
                  className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                >
                  <CloseIcon className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6">
                <BulkUpload 
                  onSuccess={() => {
                    setShowBulkUpload(false);
                    fetchProducts(); // Refresh the products list
                    toast.success('Products uploaded successfully!');
                  }}
                  onClose={() => setShowBulkUpload(false)}
                />
              </div>
            </div>
          </div>
        )}

          {/* Product Form */}
          {showForm && (
            <div className="neumorphic-card mb-8 p-4 lg:p-8 rounded-3xl bg-white/60 backdrop-blur-sm border border-white/20">
              <div className="flex justify-between items-center mb-4 lg:mb-6">
                <h2 className="text-xl lg:text-2xl font-bold text-gray-800 flex items-center">
                  <span className="admin-products-section-indicator"></span>
                  <span className="truncate">{editingProduct ? 'Edit Product' : 'Add New Product'}</span>
                </h2>
                <button
                  onClick={resetForm}
                  className="neumorphic-button-small w-8 h-8 lg:w-10 lg:h-10 rounded-full bg-gray-500 text-white flex items-center justify-center hover:shadow-soft transition-all duration-300 flex-shrink-0"
                >
                  <CloseIcon className="w-4 h-4 lg:w-5 lg:h-5" />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4 lg:space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
                  <div>
                    <label className="block text-sm font-semibold mb-2 lg:mb-3 text-gray-700">Product Name</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="neumorphic-input w-full p-3 lg:p-4 rounded-2xl bg-white/60 backdrop-blur-sm border border-white/20 focus:outline-none focus:ring-2 focus:ring-green-500/50"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2 lg:mb-3 text-gray-700">Category</label>
                    <input
                      type="text"
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      className="neumorphic-input w-full p-3 lg:p-4 rounded-2xl bg-white/60 backdrop-blur-sm border border-white/20 focus:outline-none focus:ring-2 focus:ring-green-500/50"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2 lg:mb-3 text-gray-700">Price (₹)</label>
                    <input
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleInputChange}
                      className="neumorphic-input w-full p-3 lg:p-4 rounded-2xl bg-white/60 backdrop-blur-sm border border-white/20 focus:outline-none focus:ring-2 focus:ring-green-500/50"
                      required
                      min="0"
                      step="0.01"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2 lg:mb-3 text-gray-700">Stock</label>
                    <input
                      type="number"
                      name="stock"
                      value={formData.stock}
                      onChange={handleInputChange}
                      className="neumorphic-input w-full p-3 lg:p-4 rounded-2xl bg-white/60 backdrop-blur-sm border border-white/20 focus:outline-none focus:ring-2 focus:ring-green-500/50"
                      required
                      min="0"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2 lg:mb-3 text-gray-700">Description</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows="4"
                    className="neumorphic-input w-full p-3 lg:p-4 rounded-2xl bg-white/60 backdrop-blur-sm border border-white/20 focus:outline-none focus:ring-2 focus:ring-green-500/50"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2 lg:mb-3 text-gray-700 flex items-center">
                    <ImageIcon className="w-4 h-4 mr-2" />
                    Product Images
                  </label>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageChange}
                    className="neumorphic-input w-full p-3 lg:p-4 rounded-2xl bg-white/60 backdrop-blur-sm border border-white/20 focus:outline-none focus:ring-2 focus:ring-green-500/50"
                  />
                  {formData.images.length > 0 && (
                    <p className="text-sm text-gray-600 mt-2">
                      {formData.images.length} image(s) selected
                    </p>
                  )}
                </div>
                {/* Variants Section */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <label className="block text-sm font-semibold mb-2 lg:mb-3 text-gray-700 flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.hasVariants}
                        onChange={handleVariantToggle}
                        className="form-checkbox h-5 w-5 text-green-600 rounded-full border-gray-300 focus:ring-2 focus:ring-green-500/50"
                      />
                      <span className="ml-2">Enable Variants</span>
                    </label>
                    {formData.hasVariants && (
                      <button
                        type="button"
                        onClick={addVariant}
                        className="neumorphic-button-small px-4 py-2 bg-green-500 text-white rounded-xl text-sm font-medium hover:shadow-soft transition-all duration-300 flex items-center"
                      >
                        <AddIcon className="w-4 h-4 mr-1" />
                        Add Variant
                      </button>
                    )}
                  </div>
                  {formData.hasVariants && formData.variants.length > 0 && (
                    <div className="space-y-4">
                      {formData.variants.map((variant, index) => (
                        <div key={variant.id} className="p-4 rounded-2xl bg-white/60 backdrop-blur-sm border border-white/20">
                          <div className="flex items-center justify-between mb-3">
                            <h3 className="font-semibold text-gray-800 text-sm truncate">
                              Variant {index + 1}
                            </h3>
                            <button
                              onClick={() => removeVariant(index)}
                              className="text-red-500 hover:text-red-700 transition-colors"
                              type="button"
                            >
                              <DeleteIcon className="w-4 h-4" />
                            </button>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-xs font-semibold mb-2 text-gray-700">Variant Name</label>
                              <input
                                type="text"
                                value={variant.name}
                                onChange={(e) => updateVariant(index, 'name', e.target.value)}
                                className="neumorphic-input w-full p-3 rounded-2xl bg-white/60 backdrop-blur-sm border border-white/20 focus:outline-none focus:ring-2 focus:ring-green-500/50"
                                required
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-semibold mb-2 text-gray-700">Variant Label</label>
                              <input
                                type="text"
                                value={variant.label}
                                onChange={(e) => updateVariant(index, 'label', e.target.value)}
                                className="neumorphic-input w-full p-3 rounded-2xl bg-white/60 backdrop-blur-sm border border-white/20 focus:outline-none focus:ring-2 focus:ring-green-500/50"
                                required
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-semibold mb-2 text-gray-700">Price (₹)</label>
                              <input
                                type="number"
                                value={variant.price}
                                onChange={(e) => updateVariant(index, 'price', e.target.value)}
                                className="neumorphic-input w-full p-3 rounded-2xl bg-white/60 backdrop-blur-sm border border-white/20 focus:outline-none focus:ring-2 focus:ring-green-500/50"
                                required
                                min="0"
                                step="0.01"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-semibold mb-2 text-gray-700">Stock</label>
                              <input
                                type="number"
                                value={variant.stock}
                                onChange={(e) => updateVariant(index, 'stock', e.target.value)}
                                className="neumorphic-input w-full p-3 rounded-2xl bg-white/60 backdrop-blur-sm border border-white/20 focus:outline-none focus:ring-2 focus:ring-green-500/50"
                                required
                                min="0"
                              />
                            </div>
                          </div>
                          <div className="mt-4">
                            <label className="block text-xs font-semibold mb-2 text-gray-700">Set as Default Variant</label>
                            <div className="flex gap-2">
                              {formData.variants.map((_, i) => (
                                <button
                                  key={i}
                                  onClick={() => setDefaultVariant(i)}
                                  className={classNames(
                                    'flex-1 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 flex items-center justify-center',
                                    i === index ? 'bg-green-500 text-white shadow-soft' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                  )}
                                  type="button"
                                >
                                  {i === index ? (
                                    <>
                                      <CheckIcon className="w-4 h-4 mr-2" />
                                      Default
                                    </>
                                  ) : (
                                    'Set as Default'
                                  )}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex flex-col sm:flex-row gap-3 lg:gap-4">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="admin-products-green-button"
                  >
                    {submitting ? (
                      <>
                        <LoadingIcon className="w-5 h-5 mr-2" />
                        Saving...
                      </>
                    ) : (
                      <>
                        {editingProduct ? <UpdateIcon className="w-5 h-5 mr-2" /> : <SaveIcon className="w-5 h-5 mr-2" />}
                        {editingProduct ? 'Update Product' : 'Add Product'}
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    disabled={submitting}
                    onClick={resetForm}
                    className="neumorphic-button px-6 lg:px-8 py-3 lg:py-4 rounded-2xl bg-gray-500 text-white font-semibold hover:shadow-soft-lg transition-all duration-300 disabled:opacity-50"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}          {/* Products List */}
          {loading ? (
            <div className="text-center py-12">
              <LoadingIcon className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <p className="text-gray-600 text-lg">Loading products...</p>
            </div>
          ) : (
            <div className="neumorphic-card rounded-3xl bg-white/60 backdrop-blur-sm border border-white/20 overflow-hidden">              {/* Desktop Table View */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="w-full">
                  <thead className="admin-products-table-header">
                    <tr>                      <th className="text-left p-3 font-semibold text-gray-700 text-sm">Product</th>
                      <th className="text-left p-3 font-semibold text-gray-700 text-sm">Category</th>
                      <th className="text-left p-3 font-semibold text-gray-700 text-sm">Price</th>
                      <th className="text-left p-3 font-semibold text-gray-700 text-sm">Variants</th>
                      <th className="text-left p-3 font-semibold text-gray-700 text-sm">Total Stock</th>
                      <th className="text-left p-3 font-semibold text-gray-700 text-sm w-20">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((product) => (
                      <React.Fragment key={product._id}>                        <tr 
                          className="border-b border-gray-100/50 hover:bg-white/30 transition-colors cursor-pointer"
                          onClick={() => toggleExpandedProduct(product._id)}
                        >
                          <td className="p-3">
                            <div className="flex items-center space-x-3">
                              {product.images && product.images[0] && (
                                <img
                                  src={product.images[0]}
                                  alt={product.name}
                                  className="w-12 h-12 object-cover rounded-lg shadow-soft flex-shrink-0"
                                />
                              )}                              <div className="min-w-0">
                                <div className="font-semibold text-gray-800 text-sm truncate">{product.name}</div>
                              </div>
                            </div>
                          </td>
                          <td className="p-3 text-sm text-gray-600">{product.category}</td>
                          <td className="p-3 font-semibold text-green-600 text-sm">
                            {product.hasVariants ? (
                              <span className="text-xs text-gray-500">Multiple</span>
                            ) : (
                              `₹${product.price}`
                            )}
                          </td>
                          <td className="p-3 text-sm">
                            {product.hasVariants ? (
                              <span className="text-xs text-emerald-600 font-medium bg-emerald-50 px-2 py-1 rounded-full">
                                {product.variants?.length || 0} variants
                              </span>
                            ) : (
                              <span className="text-xs text-gray-500">No variants</span>
                            )}
                          </td>
                          <td className="p-3">
                            <span className={classNames(
                              'px-2 py-1 rounded-full text-xs font-medium',
                              getCumulativeStock(product) > 10 ? 'bg-green-100 text-green-700' :
                              getCumulativeStock(product) > 0 ? 'bg-yellow-100 text-yellow-700' :
                              'bg-red-100 text-red-700'
                            )}>
                              {getCumulativeStock(product)} total
                            </span>
                          </td>
                          <td className="p-3" onClick={(e) => e.stopPropagation()}>
                            <div className="flex gap-1">
                              <PermissionButton
                                module="products"
                                action="edit_product"
                                onClick={() => handleEdit(product)}
                                size="sm"
                                className="neumorphic-button-small p-2 bg-blue-500 text-white rounded-lg hover:shadow-soft transition-all duration-300 flex items-center justify-center"
                                title="Edit Product"
                              >
                                <EditIcon className="w-4 h-4" />
                              </PermissionButton>
                              
                              <PermissionButton
                                module="products"
                                action="delete_product"
                                onClick={() => handleDelete(product._id)}
                                size="sm"
                                variant="danger"
                                className="neumorphic-button-small p-2 bg-red-500 text-white rounded-lg hover:shadow-soft transition-all duration-300 flex items-center justify-center"
                                title="Delete Product"
                              >
                                <DeleteIcon className="w-4 h-4" />
                              </PermissionButton>
                            </div>
                          </td>
                        </tr>                        {/* Expandable Details Row */}
                        {expandedProduct === product._id && (
                          <tr className="bg-white/80">
                            <td colSpan="6" className="p-4 border-l-4 border-green-400">
                              <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                  <h4 className="font-semibold text-gray-800">Product Details</h4>
                                  <button
                                    onClick={() => setExpandedProduct(null)}
                                    className="text-gray-400 hover:text-gray-600"
                                  >
                                    <CloseIcon className="w-4 h-4" />
                                  </button>
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div>
                                    <h5 className="font-medium text-gray-700 mb-2">Basic Information</h5>
                                    <div className="space-y-2 text-sm">
                                      <div><span className="text-gray-500">Description:</span> {product.description}</div>
                                      {!product.hasVariants && (
                                        <>
                                          <div><span className="text-gray-500">Price:</span> ₹{product.price}</div>
                                          <div><span className="text-gray-500">Stock:</span> {product.stock}</div>
                                        </>
                                      )}
                                    </div>
                                  </div>
                                  
                                  {product.hasVariants && product.variants && (
                                    <div>
                                      <h5 className="font-medium text-gray-700 mb-2">Variants ({product.variants.length})</h5>
                                      <div className="space-y-2 max-h-40 overflow-y-auto">
                                        {product.variants.map((variant, idx) => (
                                          <div key={idx} className="bg-gray-50 p-3 rounded-lg">
                                            <div className="flex items-center justify-between">
                                              <div>
                                                <span className="font-medium text-sm">{variant.label}</span>
                                                {variant.isDefault && (
                                                  <span className="ml-2 px-2 py-1 bg-green-100 text-green-700 text-xs rounded">
                                                    Default
                                                  </span>
                                                )}
                                              </div>
                                              <div className="text-right">
                                                <div className="font-semibold text-green-600 text-sm">₹{variant.price}</div>
                                                <div className="text-xs text-gray-500">{variant.stock} stock</div>
                                              </div>
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              </div>              {/* Mobile Card View */}
              <div className="lg:hidden">
                <div className="space-y-3 p-4">
                  {products.map((product) => (
                    <div key={product._id} className="neumorphic-card p-4 rounded-2xl bg-white/40 backdrop-blur-sm border border-white/20">
                      <div className="flex items-start space-x-3 mb-3">
                        {product.images && product.images[0] && (
                          <img
                            src={product.images[0]}
                            alt={product.name}
                            className="w-12 h-12 object-cover rounded-lg shadow-soft flex-shrink-0"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-800 text-sm truncate">{product.name}</h3>
                          <p className="text-xs text-gray-600 mb-1">{product.category}</p>
                          
                          <div className="flex items-center justify-between mb-2">
                            {product.hasVariants ? (
                              <div className="flex items-center space-x-2">
                                <span className="text-xs text-emerald-600 font-medium bg-emerald-50 px-2 py-1 rounded-full">
                                  {product.variants?.length || 0} variants
                                </span>
                                <span className={classNames(
                                  'px-2 py-1 rounded-full text-xs font-medium',
                                  getCumulativeStock(product) > 10 ? 'bg-green-100 text-green-700' :
                                  getCumulativeStock(product) > 0 ? 'bg-yellow-100 text-yellow-700' :
                                  'bg-red-100 text-red-700'
                                )}>
                                  {getCumulativeStock(product)} total
                                </span>
                              </div>
                            ) : (
                              <>
                                <span className="font-semibold text-green-600 text-sm">₹{product.price}</span>
                                <span className={classNames(
                                  'px-2 py-1 rounded-full text-xs font-medium',
                                  product.stock > 10 ? 'bg-green-100 text-green-700' :
                                  product.stock > 0 ? 'bg-yellow-100 text-yellow-700' :
                                  'bg-red-100 text-red-700'
                                )}>
                                  {product.stock} stock
                                </span>
                              </>
                            )}
                          </div>                            {/* Expand/Collapse Button */}
                          {product.hasVariants && (
                            <button
                              onClick={() => toggleExpandedProduct(product._id)}
                              className="text-xs text-green-600 hover:text-green-800 font-medium mt-1"
                            >
                              {expandedProduct === product._id ? 'Hide variants' : 'Show variants'}
                            </button>
                          )}
                        </div>
                      </div>                      {/* Expandable Variants Section for Mobile */}
                      {expandedProduct === product._id && product.hasVariants && product.variants && (
                        <div className="mb-3 pt-3 border-t border-gray-200">
                          <div className="space-y-2 max-h-32 overflow-y-auto">
                            {product.variants.map((variant, idx) => (
                              <div key={idx} className="bg-gray-50 p-2 rounded-lg">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <span className="font-medium text-xs">{variant.label}</span>
                                    {variant.isDefault && (
                                      <span className="ml-1 px-1 py-0.5 bg-green-100 text-green-700 text-xs rounded">
                                        Default
                                      </span>
                                    )}
                                  </div>
                                  <div className="text-right">
                                    <div className="font-semibold text-green-600 text-xs">₹{variant.price}</div>
                                    <div className="text-xs text-gray-500">{variant.stock} stock</div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      <div className="flex gap-2">
                        <PermissionButton
                          module="products"
                          action="edit_product"
                          onClick={() => handleEdit(product)}
                          size="sm"
                          className="flex-1 neumorphic-button-small px-3 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium hover:shadow-soft transition-all duration-300 flex items-center justify-center"
                        >
                          <EditIcon className="w-3 h-3 mr-1" />
                          Edit
                        </PermissionButton>
                        
                        <PermissionButton
                          module="products"
                          action="delete_product"
                          onClick={() => handleDelete(product._id)}
                          size="sm"
                          variant="danger"
                          className="flex-1 neumorphic-button-small px-3 py-2 bg-red-500 text-white rounded-lg text-sm font-medium hover:shadow-soft transition-all duration-300 flex items-center justify-center"
                        >
                          <DeleteIcon className="w-3 h-3 mr-1" />
                          Delete
                        </PermissionButton>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {products.length === 0 && (
                <div className="text-center py-16">
                  <EmptyIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 text-xl mb-4">No products found</p>
                  <p className="text-gray-400">Add your first product to get started!</p>
                </div>
              )}
            </div>
          )}
        </div>

      <style jsx>{`
        .neumorphic-card {
          box-shadow: 
            20px 20px 60px rgba(0, 0, 0, 0.05),
            -20px -20px 60px rgba(255, 255, 255, 0.8);
        }
        .neumorphic-button {
          box-shadow: 
            8px 8px 16px rgba(0, 0, 0, 0.2),
            -8px -8px 16px rgba(255, 255, 255, 0.1);
        }
        .neumorphic-button-small {
          box-shadow: 
            4px 4px 8px rgba(0, 0, 0, 0.2),
            -4px -4px 8px rgba(255, 255, 255, 0.1);
        }
        .neumorphic-input {
          box-shadow: 
            inset 4px 4px 8px rgba(0, 0, 0, 0.05),
            inset -4px -4px 8px rgba(255, 255, 255, 0.8);
        }
        .shadow-soft {
          box-shadow: 
            8px 8px 16px rgba(0, 0, 0, 0.1),
            -8px -8px 16px rgba(255, 255, 255, 0.8);
        }
        .shadow-soft-lg {
          box-shadow: 
            12px 12px 24px rgba(0, 0, 0, 0.1),
            -12px -12px 24px rgba(255, 255, 255, 0.8);        }
      `}</style>
    </>
  );
};

export default AdminProducts;