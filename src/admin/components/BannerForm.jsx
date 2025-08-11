import React, { useState, useEffect } from 'react';
import PositionSelector from './PositionSelector';
import BannerPreview from './BannerPreview';

const BannerForm = ({ banner = null, onSubmit, onCancel, isLoading = false }) => {
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    ctaText: '',
    ctaLink: '',
    textPosition: 'center',
    textColor: '#ffffff',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    isActive: false,
    priority: 0,
    startDate: '',
    endDate: ''
  });

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [errors, setErrors] = useState({});
  const [showPreview, setShowPreview] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize form with banner data if editing
  useEffect(() => {
    if (banner) {
      setFormData({
        title: banner.title || '',
        subtitle: banner.subtitle || '',
        ctaText: banner.ctaText || '',
        ctaLink: banner.ctaLink || '',
        textPosition: banner.textPosition || 'center',
        textColor: banner.textColor || '#ffffff',
        backgroundColor: banner.backgroundColor || 'rgba(0, 0, 0, 0.4)',
        isActive: banner.isActive || false,
        priority: banner.priority || 0,
        startDate: banner.startDate ? new Date(banner.startDate).toISOString().split('T')[0] : '',
        endDate: banner.endDate ? new Date(banner.endDate).toISOString().split('T')[0] : ''
      });
      if (banner.imageUrl) {
        setImagePreview(banner.imageUrl);
      }
    }
  }, [banner]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;
    
    setFormData(prev => ({
      ...prev,
      [name]: newValue
    }));
    
    // Clear error when field is modified
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setErrors(prev => ({
          ...prev,
          image: 'Please select a valid image file'
        }));
        return;
      }

      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({
          ...prev,
          image: 'Image size must be less than 5MB'
        }));
        return;
      }

      setImageFile(file);
      
      // Create preview URL
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);

      // Clear error
      setErrors(prev => ({
        ...prev,
        image: ''
      }));
    }
  };

  // Handle position changes safely
  const handlePositionChange = (position) => {
    if (position !== formData.textPosition) {
      setFormData(prev => ({ ...prev, textPosition: position }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Title validation
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    } else if (formData.title.length > 100) {
      newErrors.title = 'Title must be less than 100 characters';
    }

    // Subtitle validation
    if (formData.subtitle && formData.subtitle.length > 200) {
      newErrors.subtitle = 'Subtitle must be less than 200 characters';
    }

    // CTA text validation
    if (formData.ctaText && formData.ctaText.length > 50) {
      newErrors.ctaText = 'CTA text must be less than 50 characters';
    }

    // CTA link validation
    if (formData.ctaText && !formData.ctaLink) {
      newErrors.ctaLink = 'CTA link is required when CTA text is provided';
    }

    // URL validation
    if (formData.ctaLink) {
      try {
        new URL(formData.ctaLink);
      } catch {
        newErrors.ctaLink = 'Please enter a valid URL';
      }
    }

    // Image validation (only for new banners)
    if (!banner && !imageFile) {
      newErrors.image = 'Banner image is required';
    }

    // Date validation
    if (formData.startDate && formData.endDate) {
      if (new Date(formData.startDate) >= new Date(formData.endDate)) {
        newErrors.endDate = 'End date must be after start date';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Prevent multiple submissions
    if (isSubmitting || isLoading) {
      return;
    }
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      const submitData = new FormData();
      
      // Add image file if selected
      if (imageFile) {
        submitData.append('image', imageFile);
      }

      // Add form data
      Object.keys(formData).forEach(key => {
        if (formData[key] !== '' && formData[key] !== null) {
          submitData.append(key, formData[key]);
        }
      });

      await onSubmit(submitData);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="banner-form-container bg-green-50 min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6 bg-white p-5 lg:p-6 rounded-2xl shadow-lg border border-green-100">
          <h2 className="text-2xl lg:text-3xl font-bold text-green-800 mb-3 lg:mb-0">
            {banner ? 'Edit Banner' : 'Create New Banner'}
          </h2>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setShowPreview(!showPreview)}
              className="px-5 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all duration-300 font-medium shadow-md hover:shadow-lg transform hover:scale-105"
            >
              {showPreview ? 'Hide Preview' : 'Show Preview'}
            </button>
          </div>
        </div>

        <div className={`grid ${showPreview ? 'lg:grid-cols-2' : 'lg:grid-cols-1'} gap-6`}>
          {/* Form Section */}
          <div className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-5 bg-white p-6 rounded-2xl shadow-lg border border-green-100">
              {/* Image Upload */}
              <div>
                <label className="block text-sm font-semibold text-green-800 mb-3">
                  Banner Image *
                </label>
                <div className="border-2 border-dashed border-green-200 rounded-xl p-6 relative hover:border-green-400 transition-all duration-300 bg-green-50">
                  {imagePreview ? (
                    <div className="relative">
                      <img
                        src={imagePreview}
                        alt="Banner preview"
                        className="w-full h-48 object-cover rounded-xl shadow-md"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setImageFile(null);
                          setImagePreview('');
                        }}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm hover:bg-red-600 transition-colors shadow-md"
                      >
                        ×
                      </button>
                    </div>
                  ) : (
                    <label htmlFor="image-upload" className="cursor-pointer block">
                      <div className="text-center py-8">
                        <svg className="mx-auto h-12 w-12 text-green-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                          <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        <p className="mt-3 text-sm text-green-700">
                          <span className="font-semibold text-green-600 hover:text-green-700">
                            Click to upload
                          </span>
                          {' '}or drag and drop
                        </p>
                        <p className="text-xs text-green-600">PNG, JPG, GIF up to 5MB</p>
                      </div>
                    </label>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                    id="image-upload"
                  />
                </div>
                {errors.image && (
                  <p className="mt-2 text-sm text-red-600 font-medium">{errors.image}</p>
                )}
              </div>

              {/* Title */}
              <div>
                <label className="block text-sm font-semibold text-green-800 mb-3">
                  Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="Enter banner title"
                  className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-300 bg-green-50 ${
                    errors.title ? 'border-red-400' : 'border-green-200'
                  }`}
                  maxLength={100}
                />
                <div className="flex justify-between mt-2">
                  {errors.title && (
                    <p className="text-sm text-red-600 font-medium">{errors.title}</p>
                  )}
                  <p className="text-xs text-green-600 ml-auto font-medium">
                    {formData.title.length}/100
                  </p>
                </div>
              </div>

              {/* Subtitle */}
              <div>
                <label className="block text-sm font-semibold text-green-800 mb-3">
                  Subtitle
                </label>
                <textarea
                  name="subtitle"
                  value={formData.subtitle}
                  onChange={handleInputChange}
                  placeholder="Enter banner subtitle"
                  rows={3}
                  className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-300 bg-green-50 ${
                    errors.subtitle ? 'border-red-400' : 'border-green-200'
                  }`}
                  maxLength={200}
                />
                <div className="flex justify-between mt-2">
                  {errors.subtitle && (
                    <p className="text-sm text-red-600 font-medium">{errors.subtitle}</p>
                  )}
                  <p className="text-xs text-green-600 ml-auto font-medium">
                    {formData.subtitle.length}/200
                  </p>
                </div>
              </div>

              {/* CTA Section */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-green-800 mb-3">
                    CTA Text
                  </label>
                  <input
                    type="text"
                    name="ctaText"
                    value={formData.ctaText}
                    onChange={handleInputChange}
                    placeholder="e.g., Shop Now"
                    className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-300 bg-green-50 ${
                      errors.ctaText ? 'border-red-400' : 'border-green-200'
                    }`}
                    maxLength={50}
                  />
                  <div className="flex justify-between mt-2">
                    {errors.ctaText && (
                      <p className="text-sm text-red-600 font-medium">{errors.ctaText}</p>
                    )}
                    <p className="text-xs text-green-600 ml-auto font-medium">
                      {formData.ctaText.length}/50
                    </p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-green-800 mb-3">
                    CTA Link
                  </label>
                  <input
                    type="url"
                    name="ctaLink"
                    value={formData.ctaLink}
                    onChange={handleInputChange}
                    placeholder="https://example.com"
                    className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-300 bg-green-50 ${
                      errors.ctaLink ? 'border-red-400' : 'border-green-200'
                    }`}
                  />
                  {errors.ctaLink && (
                    <p className="mt-2 text-sm text-red-600 font-medium">{errors.ctaLink}</p>
                  )}
                </div>
              </div>

              {/* Text Position */}
              <div>
                <label className="block text-sm font-semibold text-green-800 mb-3">
                  Text Position
                </label>
                <div className="bg-green-50 p-4 rounded-xl border border-green-200">
                  <PositionSelector
                    selectedPosition={formData.textPosition}
                    onPositionChange={handlePositionChange}
                  />
                </div>
              </div>

              {/* Color Settings */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-green-800 mb-3">
                    Text Color
                  </label>
                  <div className="flex gap-3">
                    <input
                      type="color"
                      name="textColor"
                      value={formData.textColor}
                      onChange={handleInputChange}
                      className="w-14 h-12 border-2 border-green-200 rounded-xl cursor-pointer bg-green-50"
                    />
                    <input
                      type="text"
                      value={formData.textColor}
                      onChange={(e) => setFormData(prev => ({ ...prev, textColor: e.target.value }))}
                      className="flex-1 px-4 py-3 border-2 border-green-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-green-50 transition-all duration-300"
                      placeholder="#ffffff"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-green-800 mb-3">
                    Background Overlay
                  </label>
                  <input
                    type="text"
                    name="backgroundColor"
                    value={formData.backgroundColor}
                    onChange={handleInputChange}
                    placeholder="rgba(0, 0, 0, 0.4)"
                    className="w-full px-4 py-3 border-2 border-green-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-green-50 transition-all duration-300"
                  />
                </div>
              </div>

              {/* Settings */}
              <div className="bg-green-50 p-5 rounded-xl border border-green-200 space-y-4">
                <h4 className="text-lg font-semibold text-green-800 mb-3">Banner Settings</h4>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleInputChange}
                    className="h-5 w-5 text-green-600 focus:ring-green-500 border-green-300 rounded"
                  />
                  <label className="ml-3 text-sm font-medium text-green-700">
                    Active (visible on website)
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-green-800 mb-3">
                    Priority (0 = highest)
                  </label>
                  <input
                    type="number"
                    name="priority"
                    value={formData.priority}
                    onChange={handleInputChange}
                    min="0"
                    max="100"
                    className="w-full px-4 py-3 border-2 border-green-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white transition-all duration-300"
                  />
                </div>

                {/* Scheduling */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-green-800 mb-3">
                      Start Date (optional)
                    </label>
                    <input
                      type="date"
                      name="startDate"
                      value={formData.startDate}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border-2 border-green-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white transition-all duration-300"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-green-800 mb-3">
                      End Date (optional)
                    </label>
                    <input
                      type="date"
                      name="endDate"
                      value={formData.endDate}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white transition-all duration-300 ${
                        errors.endDate ? 'border-red-400' : 'border-green-200'
                      }`}
                    />
                    {errors.endDate && (
                      <p className="mt-2 text-sm text-red-600 font-medium">{errors.endDate}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex flex-col sm:flex-row justify-end gap-3 pt-6 border-t border-green-200">
                <button
                  type="button"
                  onClick={onCancel}
                  className="px-6 py-3 border-2 border-green-200 text-green-700 rounded-xl hover:bg-green-50 transition-all duration-300 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading || isSubmitting}
                  className="px-8 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 font-semibold shadow-md hover:shadow-lg transform hover:scale-105"
                >
                  {(isLoading || isSubmitting) ? 'Saving...' : (banner ? 'Update Banner' : 'Create Banner')}
                </button>
              </div>
            </form>
          </div>

          {/* Preview Section */}
          {showPreview && (
            <div className="sticky top-4">
              <div className="bg-white p-6 rounded-2xl shadow-lg border border-green-100">
                <h3 className="text-xl font-bold text-green-800 mb-4">Live Preview</h3>
                <BannerPreview
                  imageUrl={imagePreview}
                  title={formData.title}
                  subtitle={formData.subtitle}
                  ctaText={formData.ctaText}
                  textPosition={formData.textPosition}
                  textColor={formData.textColor}
                  backgroundColor={formData.backgroundColor}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BannerForm;
