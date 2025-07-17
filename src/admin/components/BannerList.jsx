import React, { useState } from 'react';

const BannerList = ({ 
  banners = [], 
  onEdit, 
  onDelete, 
  onToggleStatus, 
  onReorder, 
  onBulkDelete,
  onBulkToggleStatus,
  loading = false 
}) => {
  const [selectedBanners, setSelectedBanners] = useState(new Set());
  const [draggedItem, setDraggedItem] = useState(null);
  const [showBulkActions, setShowBulkActions] = useState(false);

  // Handle select all checkbox
  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedBanners(new Set(banners.map(banner => banner._id)));
    } else {
      setSelectedBanners(new Set());
    }
  };

  // Handle individual checkbox
  const handleSelectBanner = (bannerId, checked) => {
    const newSelected = new Set(selectedBanners);
    if (checked) {
      newSelected.add(bannerId);
    } else {
      newSelected.delete(bannerId);
    }
    setSelectedBanners(newSelected);
  };

  // Show/hide bulk actions based on selection
  React.useEffect(() => {
    setShowBulkActions(selectedBanners.size > 0);
  }, [selectedBanners]);

  // Drag and drop handlers
  const handleDragStart = (e, banner, index) => {
    setDraggedItem({ banner, index });
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e, targetIndex) => {
    e.preventDefault();
    if (draggedItem && draggedItem.index !== targetIndex) {
      onReorder(draggedItem.index, targetIndex);
    }
    setDraggedItem(null);
  };

  // Bulk actions
  const handleBulkAction = async (action) => {
    const selectedIds = Array.from(selectedBanners);
    
    if (action === 'delete') {
      if (window.confirm(`Are you sure you want to delete ${selectedIds.length} banner(s)?`)) {
        await onBulkDelete(selectedIds);
        setSelectedBanners(new Set());
      }
    } else if (action === 'activate' || action === 'deactivate') {
      await onBulkToggleStatus(selectedIds, action === 'activate');
      setSelectedBanners(new Set());
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  const getStatusBadge = (banner) => {
    const now = new Date();
    const startDate = banner.startDate ? new Date(banner.startDate) : null;
    const endDate = banner.endDate ? new Date(banner.endDate) : null;

    if (!banner.isActive) {
      return <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">Inactive</span>;
    }

    if (startDate && now < startDate) {
      return <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">Scheduled</span>;
    }

    if (endDate && now > endDate) {
      return <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">Expired</span>;
    }

    return <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">Active</span>;
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="animate-pulse bg-gray-200 h-24 rounded-lg"></div>
        ))}
      </div>
    );
  }

  if (banners.length === 0) {
    return (
      <div className="text-center py-12">
        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <h3 className="mt-2 text-sm font-medium text-gray-900">No banners</h3>
        <p className="mt-1 text-sm text-gray-500">Get started by creating a new banner.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Bulk Actions Bar */}
      {showBulkActions && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-blue-700">
              {selectedBanners.size} banner(s) selected
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => handleBulkAction('activate')}
                className="px-3 py-1 text-xs bg-green-100 text-green-800 rounded hover:bg-green-200 transition-colors"
              >
                Activate
              </button>
              <button
                onClick={() => handleBulkAction('deactivate')}
                className="px-3 py-1 text-xs bg-yellow-100 text-yellow-800 rounded hover:bg-yellow-200 transition-colors"
              >
                Deactivate
              </button>
              <button
                onClick={() => handleBulkAction('delete')}
                className="px-3 py-1 text-xs bg-red-100 text-red-800 rounded hover:bg-red-200 transition-colors"
              >
                Delete
              </button>
              <button
                onClick={() => setSelectedBanners(new Set())}
                className="px-3 py-1 text-xs bg-gray-100 text-gray-800 rounded hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Table Header */}
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="flex items-center gap-4">
          <input
            type="checkbox"
            checked={selectedBanners.size === banners.length && banners.length > 0}
            onChange={(e) => handleSelectAll(e.target.checked)}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <div className="flex-1 grid grid-cols-12 gap-4 text-sm font-medium text-gray-700">
            <div className="col-span-1">Order</div>
            <div className="col-span-3">Banner</div>
            <div className="col-span-2">Title</div>
            <div className="col-span-2">Status</div>
            <div className="col-span-2">Analytics</div>
            <div className="col-span-1">Schedule</div>
            <div className="col-span-1">Actions</div>
          </div>
        </div>
      </div>

      {/* Banner List */}
      <div className="space-y-2">
        {banners.map((banner, index) => (
          <div
            key={banner._id}
            draggable
            onDragStart={(e) => handleDragStart(e, banner, index)}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, index)}
            className={`bg-white border rounded-lg p-4 hover:shadow-md transition-shadow ${
              draggedItem?.banner._id === banner._id ? 'opacity-50' : ''
            } ${selectedBanners.has(banner._id) ? 'ring-2 ring-blue-500' : ''}`}
          >
            <div className="flex items-center gap-4">
              {/* Checkbox */}
              <input
                type="checkbox"
                checked={selectedBanners.has(banner._id)}
                onChange={(e) => handleSelectBanner(banner._id, e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />

              <div className="flex-1 grid grid-cols-12 gap-4 items-center">
                {/* Order/Priority */}
                <div className="col-span-1">
                  <div className="flex items-center gap-2">
                    <svg className="h-4 w-4 text-gray-400 cursor-move" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
                    </svg>
                    <span className="text-sm font-medium">{banner.priority}</span>
                  </div>
                </div>

                {/* Banner Image & Info */}
                <div className="col-span-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={banner.imageUrl || '/api/placeholder/60/40'}
                      alt={banner.title}
                      className="w-15 h-10 object-cover rounded border"
                    />
                    <div>
                      <div className="font-medium text-sm">{banner.title}</div>
                      {banner.subtitle && (
                        <div className="text-xs text-gray-500 truncate max-w-32">
                          {banner.subtitle}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Title & CTA */}
                <div className="col-span-2">
                  <div className="text-sm">{banner.title}</div>
                  {banner.ctaText && (
                    <div className="text-xs text-blue-600">{banner.ctaText}</div>
                  )}
                </div>

                {/* Status */}
                <div className="col-span-2">
                  <div className="space-y-1">
                    {getStatusBadge(banner)}
                    <div className="text-xs text-gray-500">
                      Position: {banner.textPosition}
                    </div>
                  </div>
                </div>

                {/* Analytics */}
                <div className="col-span-2">
                  <div className="text-sm space-y-1">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Views:</span>
                      <span className="font-medium">{banner.viewCount || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Clicks:</span>
                      <span className="font-medium">{banner.clickCount || 0}</span>
                    </div>
                    {banner.viewCount > 0 && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">CTR:</span>
                        <span className="font-medium">
                          {((banner.clickCount || 0) / banner.viewCount * 100).toFixed(1)}%
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Schedule */}
                <div className="col-span-1">
                  <div className="text-xs space-y-1">
                    <div>Start: {formatDate(banner.startDate)}</div>
                    <div>End: {formatDate(banner.endDate)}</div>
                  </div>
                </div>

                {/* Actions */}
                <div className="col-span-1">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onToggleStatus(banner._id, !banner.isActive)}
                      className={`p-1 rounded ${
                        banner.isActive 
                          ? 'text-green-600 hover:bg-green-100' 
                          : 'text-gray-400 hover:bg-gray-100'
                      }`}
                      title={banner.isActive ? 'Deactivate' : 'Activate'}
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </button>

                    <button
                      onClick={() => onEdit(banner)}
                      className="p-1 text-blue-600 hover:bg-blue-100 rounded"
                      title="Edit"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>

                    <button
                      onClick={() => {
                        if (window.confirm('Are you sure you want to delete this banner?')) {
                          onDelete(banner._id);
                        }
                      }}
                      className="p-1 text-red-600 hover:bg-red-100 rounded"
                      title="Delete"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Drag and Drop Instructions */}
      <div className="text-xs text-gray-500 text-center mt-4">
        💡 Drag banners to reorder their priority. Lower priority numbers are displayed first.
      </div>
    </div>
  );
};

export default BannerList;
