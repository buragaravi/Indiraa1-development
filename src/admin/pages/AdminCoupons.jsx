import React, { useState, useEffect } from 'react';
import { useThemeContext } from '../../context/ThemeProvider';
import { classNames } from '../utils/classNames';
import { useAuth } from '../utils/useAuth';
import { useAdminPermission } from '../context/AdminPermissionContext';
import PermissionButton from '../components/PermissionButton';
import { 
  LoadingIcon, 
  EmptyIcon, 
  AddIcon,
  DeleteIcon,
  SaveIcon,
  CloseIcon,
  TicketIcon,
  CalendarIcon,
  MoneyIcon,
  PercentIcon
} from '../components/AdminIcons';
import toast from 'react-hot-toast';

const AdminCoupons = () => {
  const { primary, mode } = useThemeContext();
  const { isAdmin } = useAuth();
  const { hasModuleAccess } = useAdminPermission();
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    code: '',
    type: 'percent',
    amount: '',
    maxDiscount: '',
    minAmount: '',
    maxUses: '',
    validFrom: '',
    validUntil: ''
  });

  // Check module access after all hooks
  if (!hasModuleAccess('coupons')) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100">
        <div className="text-center p-8 rounded-3xl shadow-soft bg-white/70 backdrop-blur-sm">
          <EmptyIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-4 text-gray-800">Access Denied</h1>
          <p className="text-gray-600">You don't have permission to access coupon management.</p>
        </div>
      </div>
    );
  }

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch('https://indiraa1-backend.onrender.com/api/coupons/', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log(data);
        setCoupons(data.coupons || []);
      } else {
        toast.error('Failed to fetch coupons');
      }
    } catch (error) {
      console.error('Error fetching coupons:', error);
      toast.error('Error loading coupons');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://indiraa1-backend.onrender.com/api/coupons/', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          code: formData.code,
          type: formData.type,
          amount: parseFloat(formData.amount),
          maxDiscount: formData.maxDiscount ? parseFloat(formData.maxDiscount) : undefined,
          minOrder: formData.minAmount ? parseFloat(formData.minAmount) : undefined,
          usageLimit: formData.maxUses ? parseInt(formData.maxUses) : undefined,
          expiry: formData.validUntil || undefined,
          active: true
        })
      });
      
      if (response.ok) {
        setShowForm(false);
        setFormData({
          code: '',
          type: 'percent',
          amount: '',
          maxDiscount: '',
          minAmount: '',
          maxUses: '',
          validFrom: '',
          validUntil: ''
        });
        fetchCoupons();
        toast.success('Coupon created successfully');
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || 'Failed to create coupon');
      }
    } catch (error) {
      console.error('Error creating coupon:', error);
      toast.error('Error creating coupon');
    } finally {
      setSubmitting(false);
    }
  };
  const handleDelete = async (couponId) => {
    if (window.confirm('Are you sure you want to delete this coupon?')) {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`https://indiraa1-backend.onrender.com/api/coupons/${couponId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (response.ok) {
          fetchCoupons();
          toast.success('Coupon deleted successfully');
        } else {
          const errorData = await response.json();
          toast.error(errorData.message || 'Failed to delete coupon');
        }
      } catch (error) {
        console.error('Error deleting coupon:', error);
        toast.error('Error deleting coupon');
      }
    }
  };

  const resetForm = () => {
    setShowForm(false);
    setFormData({
      code: '',
      type: 'percent',
      amount: '',
      maxDiscount: '',
      minAmount: '',
      maxUses: '',
      validFrom: '',
      validUntil: ''
    });
  };
  const formatDate = (dateString) => {
    if (!dateString) return 'No date';
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getCouponStatus = (coupon) => {
    const now = new Date();
    const expiryDate = new Date(coupon.expiry);
    const createdDate = new Date(coupon.createdAt);
    
    // Check if coupon is not active in database
    if (!coupon.active) {
      return { status: 'Inactive', color: 'bg-gray-100 text-gray-700' };
    }
    
    // Check if coupon is expired
    if (expiryDate < now) {
      return { status: 'Expired', color: 'bg-red-100 text-red-700' };
    }
    
    // Check if coupon has reached usage limit
    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      return { status: 'Used Up', color: 'bg-orange-100 text-orange-700' };
    }
    
    // Coupon is active and valid
    return { status: 'Active', color: 'bg-green-100 text-green-700' };
  };

  // Helper function to get the correct field names from backend
  const getDisplayValues = (coupon) => {
    return {
      minOrder: coupon.minOrder || coupon.minAmount || 0,
      maxUses: coupon.usageLimit || coupon.maxUses || '∞',
      usedCount: coupon.usedCount || 0,
      expiry: coupon.expiry || coupon.validUntil,
      createdAt: coupon.createdAt || coupon.validFrom
    };
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100">
        <div className="text-center p-8 rounded-3xl shadow-soft bg-white/70 backdrop-blur-sm">
          <EmptyIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-4 text-gray-800">Access Denied</h1>
          <p className="text-gray-600">You need admin privileges to access this page.</p>
        </div>
      </div>
    );
  }  return (
    <>
      <div className="w-full min-h-screen p-4">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-4 space-y-3 md:space-y-0">
          <div>
            <h1 className="text-xl md:text-2xl font-bold mb-1 text-green-800">
              Coupon Management
            </h1>
            <p className="text-green-600 text-sm">
              Create and manage discount coupons for your customers
            </p>
          </div>
          <PermissionButton
            module="coupons"
            action="create"
            onClick={() => setShowForm(true)}
            className="w-full md:w-auto px-4 py-2 rounded-lg bg-green-600 text-white font-medium hover:bg-green-700 transition-all duration-200 flex items-center justify-center shadow-md"
            disabledTooltip="You don't have permission to create coupons"
          >
              <AddIcon className="w-4 h-4 mr-2" />
              Create Coupon
            </PermissionButton>
          </div>

          {/* Coupon Form */}
          {showForm && (
            <div className="bg-white rounded-xl shadow-md border border-green-100 mb-4 p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold text-green-800 flex items-center">
                  <span className="w-1 h-6 bg-green-600 rounded-full mr-2"></span>
                  Create New Coupon
                </h2>
                <button
                  onClick={resetForm}
                  className="w-8 h-8 rounded-lg bg-gray-500 text-white flex items-center justify-center hover:bg-gray-600 transition-colors duration-200"
                >
                  <CloseIcon className="w-4 h-4" />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-green-700">Coupon Code</label>
                    <input
                      type="text"
                      name="code"
                      value={formData.code}
                      onChange={handleInputChange}
                      className="w-full p-3 rounded-lg bg-green-50 border border-green-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      required
                      placeholder="e.g., SAVE20"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 text-green-700">Discount Type</label>
                    <select
                      name="type"
                      value={formData.type}
                      onChange={handleInputChange}
                      className="w-full p-3 rounded-lg bg-green-50 border border-green-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    >
                      <option value="percent">Percentage</option>
                      <option value="flat">Fixed Amount</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 text-green-700">
                      {formData.type === 'percent' ? 'Discount Percent' : 'Discount Amount (₹)'}
                    </label>
                    <input
                      type="number"
                      name="amount"
                      value={formData.amount}
                      onChange={handleInputChange}
                      className="w-full p-3 rounded-lg bg-green-50 border border-green-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      required
                      min="0"
                      max={formData.type === 'percent' ? "100" : undefined}
                      step={formData.type === 'percent' ? "1" : "0.01"}
                    />
                  </div>
                  {formData.type === 'percent' && (
                    <div>
                      <label className="block text-sm font-medium mb-2 text-green-700">Maximum Discount (₹)</label>
                      <input
                        type="number"
                        name="maxDiscount"
                        value={formData.maxDiscount}
                        onChange={handleInputChange}
                        className="w-full p-3 rounded-lg bg-green-50 border border-green-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        min="0"
                        step="0.01"
                      />
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-medium mb-2 text-green-700">Minimum Order Amount (₹)</label>
                    <input
                      type="number"
                      name="minAmount"
                      value={formData.minAmount}
                      onChange={handleInputChange}
                      className="w-full p-3 rounded-lg bg-green-50 border border-green-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      min="0"
                      step="0.01"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 text-green-700">Maximum Uses</label>
                    <input
                      type="number"
                      name="maxUses"
                      value={formData.maxUses}
                      onChange={handleInputChange}
                      className="w-full p-3 rounded-lg bg-green-50 border border-green-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      min="1"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 text-green-700">Valid From</label>
                    <input
                      type="datetime-local"
                      name="validFrom"
                      value={formData.validFrom}
                      onChange={handleInputChange}
                      className="w-full p-3 rounded-lg bg-green-50 border border-green-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 text-green-700">Valid Until</label>
                    <input
                      type="datetime-local"
                      name="validUntil"
                      value={formData.validUntil}
                      onChange={handleInputChange}
                      className="w-full p-3 rounded-lg bg-green-50 border border-green-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      required
                    />
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-6 py-2 rounded-lg bg-green-600 text-white font-medium hover:bg-green-700 transition-colors duration-200 disabled:opacity-50 flex items-center justify-center"
                  >
                    {submitting ? (
                      <>
                        <LoadingIcon className="w-4 h-4 mr-2" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <SaveIcon className="w-4 h-4 mr-2" />
                        Create Coupon
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    disabled={submitting}
                    onClick={resetForm}
                    className="px-6 py-2 rounded-lg bg-gray-500 text-white font-medium hover:bg-gray-600 transition-colors duration-200 disabled:opacity-50"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Coupons List */}
          {loading ? (
            <div className="text-center py-8">
              <LoadingIcon className="w-12 h-12 text-green-500 mx-auto mb-3" />
              <p className="text-green-600 text-sm">Loading coupons...</p>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-md border border-green-100 overflow-hidden">
              {/* Desktop Table View */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-green-50">
                    <tr>
                      <th className="text-left p-4 text-sm font-medium text-green-700">Code</th>
                      <th className="text-left p-4 text-sm font-medium text-green-700">Type</th>
                      <th className="text-left p-4 text-sm font-medium text-green-700">Discount</th>
                      <th className="text-left p-4 text-sm font-medium text-green-700">Usage</th>
                      <th className="text-left p-4 text-sm font-medium text-green-700">Valid Period</th>
                      <th className="text-left p-4 text-sm font-medium text-green-700">Status</th>
                      <th className="text-left p-4 text-sm font-medium text-green-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody>                    {coupons.map((coupon) => {
                      const displayData = getDisplayValues(coupon);
                      const statusInfo = getCouponStatus(coupon);
                      
                      return (
                        <tr key={coupon._id} className="border-b border-green-100 hover:bg-green-50 transition-colors">
                          <td className="p-4">
                            <div className="flex items-center">
                              <div className="w-8 h-8 rounded-lg bg-green-600 flex items-center justify-center mr-3">
                                <TicketIcon className="w-4 h-4 text-white" />
                              </div>
                              <div>
                                <div className="font-mono font-medium text-green-800 text-sm">{coupon.code}</div>
                                <div className="text-xs text-green-600">Min: ₹{displayData.minOrder}</div>
                              </div>
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center">
                              {(coupon.type === 'percent' || coupon.type === 'percent') ? (
                                <PercentIcon className="w-4 h-4 text-blue-500 mr-2" />
                              ) : (
                                <MoneyIcon className="w-4 h-4 text-green-500 mr-2" />
                              )}
                              <span className="text-sm text-green-700">
                                {(coupon.type === 'percent' || coupon.type === 'percent') ? 'Percent' : 'Fixed Amount'}
                              </span>
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="font-medium text-green-600 text-sm">
                              {(coupon.type === 'percent' || coupon.type === 'percent') ? `${coupon.amount}%` : `₹${coupon.amount}`}
                            </div>
                            {coupon.maxDiscount && (
                              <div className="text-xs text-green-500">Max: ₹{coupon.maxDiscount}</div>
                            )}
                          </td>
                          <td className="p-4">
                            <div className="text-sm text-green-700">
                              {displayData.usedCount} / {displayData.maxUses}
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center">
                              <CalendarIcon className="w-4 h-4 text-green-400 mr-2" />
                              <div className="text-xs text-green-700">
                                <div>Created: {formatDate(displayData.createdAt)}</div>
                                <div>Expires: {formatDate(displayData.expiry)}</div>
                              </div>
                            </div>
                          </td>
                          <td className="p-4">
                            <span className={classNames(
                              'px-2 py-1 rounded-full text-xs font-medium',
                              statusInfo.color
                            )}>
                              {statusInfo.status}
                            </span>
                          </td>
                          <td className="p-4">
                            <PermissionButton
                              module="coupons"
                              action="delete"
                              onClick={() => handleDelete(coupon._id)}
                              className="px-3 py-1 bg-red-500 text-white rounded-lg text-xs font-medium hover:bg-red-600 transition-colors duration-200 flex items-center"
                              disabledTooltip="You don't have permission to delete coupons"
                            >
                              <DeleteIcon className="w-3 h-3 mr-1" />
                              Delete
                            </PermissionButton>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card View */}
              <div className="md:hidden space-y-3 p-3">
                {coupons.map((coupon) => {
                  const displayData = getDisplayValues(coupon);
                  const statusInfo = getCouponStatus(coupon);
                  
                  return (
                    <div key={coupon._id} className="bg-green-50 rounded-lg p-4 border border-green-200">
                      {/* Header */}
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center">
                          <div className="w-6 h-6 rounded-md bg-green-600 flex items-center justify-center mr-2">
                            <TicketIcon className="w-3 h-3 text-white" />
                          </div>
                          <div>
                            <div className="font-mono font-medium text-green-800 text-sm">{coupon.code}</div>
                            <div className="text-xs text-green-600">Min: ₹{displayData.minOrder}</div>
                          </div>
                        </div>
                        <span className={classNames(
                          'px-2 py-1 rounded-full text-xs font-medium',
                          statusInfo.color
                        )}>
                          {statusInfo.status}
                        </span>
                      </div>

                      {/* Content */}
                      <div className="grid grid-cols-2 gap-3 mb-3">
                        <div>
                          <div className="text-xs text-green-500 mb-1">Type</div>
                          <div className="flex items-center text-sm">
                            {(coupon.type === 'percent' || coupon.type === 'percent') ? (
                              <PercentIcon className="w-3 h-3 text-blue-500 mr-1" />
                            ) : (
                              <MoneyIcon className="w-3 h-3 text-green-500 mr-1" />
                            )}
                            <span className="text-green-700 text-xs">
                              {(coupon.type === 'percent' || coupon.type === 'percent') ? 'Percent' : 'Fixed Amount'}
                            </span>
                          </div>
                        </div>
                        
                        <div>
                          <div className="text-xs text-green-500 mb-1">Discount</div>
                          <div className="font-medium text-green-600 text-sm">
                            {(coupon.type === 'percent' || coupon.type === 'percent') ? `${coupon.amount}%` : `₹${coupon.amount}`}
                          </div>
                          {coupon.maxDiscount && (
                            <div className="text-xs text-green-500">Max: ₹{coupon.maxDiscount}</div>
                          )}
                        </div>

                        <div>
                          <div className="text-xs text-green-500 mb-1">Usage</div>
                          <div className="text-sm text-green-700">
                            {displayData.usedCount} / {displayData.maxUses}
                          </div>
                        </div>

                        <div>
                          <div className="text-xs text-green-500 mb-1">Expires</div>
                          <div className="text-xs text-green-700">
                            {formatDate(displayData.expiry)}
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <PermissionButton
                        module="coupons"
                        action="delete"
                        onClick={() => handleDelete(coupon._id)}
                        className="w-full px-3 py-2 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600 transition-colors duration-200 flex items-center justify-center"
                        disabledTooltip="You don't have permission to delete coupons"
                      >
                        <DeleteIcon className="w-4 h-4 mr-1" />
                        Delete
                      </PermissionButton>
                    </div>
                  );
                })}
              </div>

              {coupons.length === 0 && (
                <div className="text-center py-12">
                  <EmptyIcon className="w-12 h-12 text-green-400 mx-auto mb-3" />
                  <p className="text-green-500 text-lg mb-2">No coupons found</p>
                  <p className="text-green-400 text-sm">Create your first coupon to get started!</p>
                </div>
              )}
            </div>
          )}
        </div>
    </>
  );
};

export default AdminCoupons; 