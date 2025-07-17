import React, { useState, useEffect } from 'react';
import { useThemeContext } from '../../context/ThemeProvider';
import { classNames } from '../utils/classNames';
import { useAuth } from '../utils/useAuth';
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

  useEffect(() => {
    fetchCoupons();
  }, []);
  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5001/api/coupons/', {
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
      const response = await fetch('http://localhost:5001/api/coupons/', {
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
        const response = await fetch(`http://localhost:5001/api/coupons/${couponId}`, {
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
      <div className="w-full">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 md:mb-8 space-y-4 md:space-y-0">
          <div>
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-2 md:mb-3 text-gray-800 bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
              Coupon Management
            </h1>
            <p className="text-gray-600 text-sm md:text-base lg:text-lg">
              Create and manage discount coupons for your customers
            </p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="neumorphic-button w-full md:w-auto px-6 md:px-8 py-3 md:py-4 rounded-2xl bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold hover:shadow-soft-lg transition-all duration-300 flex items-center justify-center"
          >
              <AddIcon className="w-5 h-5 mr-2" />
              Create Coupon
            </button>
          </div>

          {/* Coupon Form */}
          {showForm && (
            <div className="neumorphic-card mb-8 p-8 rounded-3xl bg-white/60 backdrop-blur-sm border border-white/20">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                  <span className="w-2 h-8 bg-gradient-to-b from-green-400 to-emerald-500 rounded-full mr-3"></span>
                  Create New Coupon
                </h2>
                <button
                  onClick={resetForm}
                  className="neumorphic-button-small w-10 h-10 rounded-full bg-gray-500 text-white flex items-center justify-center hover:shadow-soft transition-all duration-300"
                >
                  <CloseIcon className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold mb-3 text-gray-700">Coupon Code</label>
                    <input
                      type="text"
                      name="code"
                      value={formData.code}
                      onChange={handleInputChange}
                      className="neumorphic-input w-full p-4 rounded-2xl bg-white/60 backdrop-blur-sm border border-white/20 focus:outline-none focus:ring-2 focus:ring-green-500/50"
                      required
                      placeholder="e.g., SAVE20"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-3 text-gray-700">Discount Type</label>
                    <select
                      name="type"
                      value={formData.type}
                      onChange={handleInputChange}
                      className="neumorphic-input w-full p-4 rounded-2xl bg-white/60 backdrop-blur-sm border border-white/20 focus:outline-none focus:ring-2 focus:ring-green-500/50"
                    >
                      <option value="percent">Percentage</option>
                      <option value="fixed">Fixed Amount</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-3 text-gray-700">
                      {formData.type === 'percent' ? 'Discount Percentage' : 'Discount Amount (₹)'}
                    </label>
                    <input
                      type="number"
                      name="amount"
                      value={formData.amount}
                      onChange={handleInputChange}
                      className="neumorphic-input w-full p-4 rounded-2xl bg-white/60 backdrop-blur-sm border border-white/20 focus:outline-none focus:ring-2 focus:ring-green-500/50"
                      required
                      min="0"
                      max={formData.type === 'percent' ? "100" : undefined}
                      step={formData.type === 'percent' ? "1" : "0.01"}
                    />
                  </div>
                  {formData.type === 'percent' && (
                    <div>
                      <label className="block text-sm font-semibold mb-3 text-gray-700">Maximum Discount (₹)</label>
                      <input
                        type="number"
                        name="maxDiscount"
                        value={formData.maxDiscount}
                        onChange={handleInputChange}
                        className="neumorphic-input w-full p-4 rounded-2xl bg-white/60 backdrop-blur-sm border border-white/20 focus:outline-none focus:ring-2 focus:ring-green-500/50"
                        min="0"
                        step="0.01"
                      />
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-semibold mb-3 text-gray-700">Minimum Order Amount (₹)</label>
                    <input
                      type="number"
                      name="minAmount"
                      value={formData.minAmount}
                      onChange={handleInputChange}
                      className="neumorphic-input w-full p-4 rounded-2xl bg-white/60 backdrop-blur-sm border border-white/20 focus:outline-none focus:ring-2 focus:ring-green-500/50"
                      min="0"
                      step="0.01"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-3 text-gray-700">Maximum Uses</label>
                    <input
                      type="number"
                      name="maxUses"
                      value={formData.maxUses}
                      onChange={handleInputChange}
                      className="neumorphic-input w-full p-4 rounded-2xl bg-white/60 backdrop-blur-sm border border-white/20 focus:outline-none focus:ring-2 focus:ring-green-500/50"
                      min="1"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-3 text-gray-700">Valid From</label>
                    <input
                      type="datetime-local"
                      name="validFrom"
                      value={formData.validFrom}
                      onChange={handleInputChange}
                      className="neumorphic-input w-full p-4 rounded-2xl bg-white/60 backdrop-blur-sm border border-white/20 focus:outline-none focus:ring-2 focus:ring-green-500/50"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-3 text-gray-700">Valid Until</label>
                    <input
                      type="datetime-local"
                      name="validUntil"
                      value={formData.validUntil}
                      onChange={handleInputChange}
                      className="neumorphic-input w-full p-4 rounded-2xl bg-white/60 backdrop-blur-sm border border-white/20 focus:outline-none focus:ring-2 focus:ring-green-500/50"
                      required
                    />
                  </div>
                </div>
                <div className="flex gap-4">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="neumorphic-button px-8 py-4 rounded-2xl bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold hover:shadow-soft-lg transition-all duration-300 disabled:opacity-50 flex items-center"
                  >
                    {submitting ? (
                      <>
                        <LoadingIcon className="w-5 h-5 mr-2" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <SaveIcon className="w-5 h-5 mr-2" />
                        Create Coupon
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    disabled={submitting}
                    onClick={resetForm}
                    className="neumorphic-button px-8 py-4 rounded-2xl bg-gray-500 text-white font-semibold hover:shadow-soft-lg transition-all duration-300 disabled:opacity-50"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Coupons List */}          {loading ? (
            <div className="text-center py-12">
              <LoadingIcon className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <p className="text-gray-600 text-lg">Loading coupons...</p>
            </div>
          ) : (
            <div className="neumorphic-card rounded-3xl bg-white/60 backdrop-blur-sm border border-white/20 overflow-hidden">
              {/* Desktop Table View */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-green-50 to-emerald-50">
                    <tr>
                      <th className="text-left p-6 font-semibold text-gray-700">Code</th>
                      <th className="text-left p-6 font-semibold text-gray-700">Type</th>
                      <th className="text-left p-6 font-semibold text-gray-700">Discount</th>
                      <th className="text-left p-6 font-semibold text-gray-700">Usage</th>
                      <th className="text-left p-6 font-semibold text-gray-700">Valid Period</th>
                      <th className="text-left p-6 font-semibold text-gray-700">Status</th>
                      <th className="text-left p-6 font-semibold text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody>                    {coupons.map((coupon) => {
                      const displayData = getDisplayValues(coupon);
                      const statusInfo = getCouponStatus(coupon);
                      
                      return (
                        <tr key={coupon._id} className="border-b border-gray-100/50 hover:bg-white/30 transition-colors">
                          <td className="p-6">
                            <div className="flex items-center">
                              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-purple-400 to-violet-500 shadow-soft flex items-center justify-center mr-3">
                                <TicketIcon className="w-5 h-5 text-white" />
                              </div>
                              <div>
                                <div className="font-mono font-semibold text-gray-800">{coupon.code}</div>
                                <div className="text-sm text-gray-500">Min: ₹{displayData.minOrder}</div>
                              </div>
                            </div>
                          </td>
                          <td className="p-6">
                            <div className="flex items-center">
                              {coupon.type === 'percent' ? (
                                <PercentIcon className="w-4 h-4 text-blue-500 mr-2" />
                              ) : (
                                <MoneyIcon className="w-4 h-4 text-green-500 mr-2" />
                              )}
                              <span className="capitalize text-gray-700">{coupon.type}</span>
                            </div>
                          </td>
                          <td className="p-6">
                            <div className="font-semibold text-green-600">
                              {coupon.type === 'percent' ? `${coupon.amount}%` : `₹${coupon.amount}`}
                            </div>
                            {coupon.maxDiscount && (
                              <div className="text-sm text-gray-500">Max: ₹{coupon.maxDiscount}</div>
                            )}
                          </td>
                          <td className="p-6">
                            <div className="text-sm text-gray-700">
                              {displayData.usedCount} / {displayData.maxUses}
                            </div>
                          </td>
                          <td className="p-6">
                            <div className="flex items-center">
                              <CalendarIcon className="w-4 h-4 text-gray-400 mr-2" />
                              <div className="text-sm text-gray-700">
                                <div>Created: {formatDate(displayData.createdAt)}</div>
                                <div>Expires: {formatDate(displayData.expiry)}</div>
                              </div>
                            </div>
                          </td>
                          <td className="p-6">
                            <span className={classNames(
                              'px-3 py-1 rounded-full text-xs font-medium',
                              statusInfo.color
                            )}>
                              {statusInfo.status}
                            </span>
                          </td>
                          <td className="p-6">
                            <button
                              onClick={() => handleDelete(coupon._id)}
                              className="neumorphic-button-small px-4 py-2 bg-red-500 text-white rounded-xl text-sm font-medium hover:shadow-soft transition-all duration-300 flex items-center"
                            >
                              <DeleteIcon className="w-4 h-4 mr-1" />
                              Delete
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card View */}
              <div className="md:hidden space-y-4 p-4">
                {coupons.map((coupon) => {
                  const displayData = getDisplayValues(coupon);
                  const statusInfo = getCouponStatus(coupon);
                  
                  return (
                    <div key={coupon._id} className="bg-white/70 rounded-2xl p-4 border border-white/30 shadow-lg">
                      {/* Header */}
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center">
                          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-purple-400 to-violet-500 shadow-soft flex items-center justify-center mr-2">
                            <TicketIcon className="w-4 h-4 text-white" />
                          </div>
                          <div>
                            <div className="font-mono font-semibold text-gray-800 text-sm">{coupon.code}</div>
                            <div className="text-xs text-gray-500">Min: ₹{displayData.minOrder}</div>
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
                          <div className="text-xs text-gray-500 mb-1">Type</div>
                          <div className="flex items-center text-sm">
                            {coupon.type === 'percent' ? (
                              <PercentIcon className="w-3 h-3 text-blue-500 mr-1" />
                            ) : (
                              <MoneyIcon className="w-3 h-3 text-green-500 mr-1" />
                            )}
                            <span className="capitalize text-gray-700">{coupon.type}</span>
                          </div>
                        </div>
                        
                        <div>
                          <div className="text-xs text-gray-500 mb-1">Discount</div>
                          <div className="font-semibold text-green-600 text-sm">
                            {coupon.type === 'percent' ? `${coupon.amount}%` : `₹${coupon.amount}`}
                          </div>
                          {coupon.maxDiscount && (
                            <div className="text-xs text-gray-500">Max: ₹{coupon.maxDiscount}</div>
                          )}
                        </div>

                        <div>
                          <div className="text-xs text-gray-500 mb-1">Usage</div>
                          <div className="text-sm text-gray-700">
                            {displayData.usedCount} / {displayData.maxUses}
                          </div>
                        </div>

                        <div>
                          <div className="text-xs text-gray-500 mb-1">Expires</div>
                          <div className="text-xs text-gray-700">
                            {formatDate(displayData.expiry)}
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <button
                        onClick={() => handleDelete(coupon._id)}
                        className="w-full neumorphic-button-small px-3 py-2 bg-red-500 text-white rounded-lg text-sm font-medium hover:shadow-soft transition-all duration-300 flex items-center justify-center"
                      >
                        <DeleteIcon className="w-4 h-4 mr-1" />
                        Delete
                      </button>
                    </div>
                  );
                })}
              </div>

              {coupons.length === 0 && (
                <div className="text-center py-16">
                  <EmptyIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 text-xl mb-4">No coupons found</p>
                  <p className="text-gray-400">Create your first coupon to get started!</p>                </div>
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

export default AdminCoupons; 