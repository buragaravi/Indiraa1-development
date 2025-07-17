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
    <div className="banner-form-container bg-[#f8faf8] min-h-screen">
      <div className="flex justify-between items-center mb-6 bg-white p-6 rounded-lg shadow-sm border">
        <h2 className="text-2xl font-bold text-gray-800">
          {banner ? 'Edit Banner' : 'Create New Banner'}
        </h2>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setShowPreview(!showPreview)}
            className="px-4 py-2 bg-[#2ecc71] text-white rounded-lg hover:bg-[#27ae60] transition-colors"
          >
            {showPreview ? 'Hide Preview' : 'Show Preview'}
          </button>
        </div>
      </div>

      <div className={`grid ${showPreview ? 'grid-cols-2' : 'grid-cols-1'} gap-6`}>
        {/* Form Section */}
        <div className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow-sm border">
            {/* Image Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Banner Image *
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 relative hover:border-[#2ecc71] transition-colors">
                {imagePreview ? (
                  <div className="relative">
                    <img
                      src={imagePreview}
                      alt="Banner preview"
                      className="w-full h-48 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setImageFile(null);
                        setImagePreview('');
                      }}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600 transition-colors"
                    >
                      ×
                    </button>
                  </div>
                ) : (
                  <label htmlFor="image-upload" className="cursor-pointer block">
                    <div className="text-center py-8">
                      <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                        <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      <p className="mt-2 text-sm text-gray-600">
                        <span className="font-medium text-[#2ecc71] hover:text-[#27ae60]">
                          Click to upload
                        </span>
                        {' '}or drag and drop
                      </p>
                      <p className="text-xs text-gray-500">PNG, JPG, GIF up to 5MB</p>
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
                <p className="mt-1 text-sm text-red-600">{errors.image}</p>
              )}
            </div>

            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Title *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Enter banner title"
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#2ecc71] focus:border-[#2ecc71] transition-colors ${
                  errors.title ? 'border-red-500' : 'border-gray-300'
                }`}
                maxLength={100}
              />
              <div className="flex justify-between mt-1">
                {errors.title && (
                  <p className="text-sm text-red-600">{errors.title}</p>
                )}
                <p className="text-xs text-gray-500 ml-auto">
                  {formData.title.length}/100
                </p>
              </div>
            </div>

            {/* Subtitle */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Subtitle
              </label>
              <textarea
                name="subtitle"
                value={formData.subtitle}
                onChange={handleInputChange}
                placeholder="Enter banner subtitle"
                rows={3}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#2ecc71] focus:border-[#2ecc71] transition-colors ${
                  errors.subtitle ? 'border-red-500' : 'border-gray-300'
                }`}
                maxLength={200}
              />
              <div className="flex justify-between mt-1">
                {errors.subtitle && (
                  <p className="text-sm text-red-600">{errors.subtitle}</p>
                )}
                <p className="text-xs text-gray-500 ml-auto">
                  {formData.subtitle.length}/200
                </p>
              </div>
            </div>

            {/* CTA Section */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  CTA Text
                </label>
                <input
                  type="text"
                  name="ctaText"
                  value={formData.ctaText}
                  onChange={handleInputChange}
                  placeholder="e.g., Shop Now"
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#2ecc71] focus:border-[#2ecc71] transition-colors ${
                    errors.ctaText ? 'border-red-500' : 'border-gray-300'
                  }`}
                  maxLength={50}
                />
                <div className="flex justify-between mt-1">
                  {errors.ctaText && (
                    <p className="text-sm text-red-600">{errors.ctaText}</p>
                  )}
                  <p className="text-xs text-gray-500 ml-auto">
                    {formData.ctaText.length}/50
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  CTA Link
                </label>
                <input
                  type="url"
                  name="ctaLink"
                  value={formData.ctaLink}
                  onChange={handleInputChange}
                  placeholder="https://example.com"
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#2ecc71] focus:border-[#2ecc71] transition-colors ${
                    errors.ctaLink ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.ctaLink && (
                  <p className="mt-1 text-sm text-red-600">{errors.ctaLink}</p>
                )}
              </div>
            </div>

            {/* Text Position */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Text Position
              </label>
              <PositionSelector
                selectedPosition={formData.textPosition}
                onPositionChange={handlePositionChange}
              />
            </div>

            {/* Color Settings */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Text Color
                </label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    name="textColor"
                    value={formData.textColor}
                    onChange={handleInputChange}
                    className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={formData.textColor}
                    onChange={(e) => setFormData(prev => ({ ...prev, textColor: e.target.value }))}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="#ffffff"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Background Overlay
                </label>
                <input
                  type="text"
                  name="backgroundColor"
                  value={formData.backgroundColor}
                  onChange={handleInputChange}
                  placeholder="rgba(0, 0, 0, 0.4)"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Settings */}
            <div className="space-y-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label className="ml-2 text-sm text-gray-700">
                  Active (visible on website)
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Priority (0 = highest)
                </label>
                <input
                  type="number"
                  name="priority"
                  value={formData.priority}
                  onChange={handleInputChange}
                  min="0"
                  max="100"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Scheduling */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Start Date (optional)
                  </label>
                  <input
                    type="date"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    End Date (optional)
                  </label>
                  <input
                    type="date"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.endDate ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.endDate && (
                    <p className="mt-1 text-sm text-red-600">{errors.endDate}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={onCancel}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading || isSubmitting}
                className="px-6 py-2 bg-[#2ecc71] text-white rounded-lg hover:bg-[#27ae60] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {(isLoading || isSubmitting) ? 'Saving...' : (banner ? 'Update Banner' : 'Create Banner')}
              </button>
            </div>
          </form>
        </div>

        {/* Preview Section */}
        {showPreview && (
          <div className="sticky top-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Live Preview</h3>
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
        )}
      </div>
    </div>
  );
};

export default BannerForm;
