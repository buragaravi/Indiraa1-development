import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiPackage, FiSearch, FiFilter, FiGrid, FiList } from 'react-icons/fi';
import ComboPackCard from '../components/ComboPackCard';

const ComboPackList = () => {
  const [comboPacks, setComboPacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [viewMode, setViewMode] = useState('grid');
  const [filterOpen, setFilterOpen] = useState(false);

  useEffect(() => {
    fetchComboPacks();
  }, []);

  const fetchComboPacks = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5001/api/combo-packs/all');
      const data = await response.json();
      
      if (data.success) {
        setComboPacks(data.comboPacks || []);
      } else {
        setError('Failed to fetch combo packs');
      }
    } catch (error) {
      console.error('Error fetching combo packs:', error);
      setError('Failed to fetch combo packs');
    } finally {
      setLoading(false);
    }
  };

  const filteredAndSortedComboPacks = React.useMemo(() => {
    let filtered = comboPacks.filter(comboPack =>
      comboPack.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      comboPack.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Sort combo packs
    switch (sortBy) {
      case 'price-low':
        filtered.sort((a, b) => a.comboPrice - b.comboPrice);
        break;
      case 'price-high':
        filtered.sort((a, b) => b.comboPrice - a.comboPrice);
        break;
      case 'discount':
        filtered.sort((a, b) => b.discountPercentage - a.discountPercentage);
        break;
      case 'rating':
        filtered.sort((a, b) => (b.averageRating || 0) - (a.averageRating || 0));
        break;
      case 'popular':
        filtered.sort((a, b) => (b.purchaseCount || 0) - (a.purchaseCount || 0));
        break;
      case 'newest':
      default:
        filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
    }

    return filtered;
  }, [comboPacks, searchTerm, sortBy]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading combo packs...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <FiPackage className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Unable to Load Combo Packs</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchComboPacks}
            className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-md border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="flex items-center justify-center mb-4">
              <FiPackage className="w-8 h-8 text-purple-600 mr-3" />
              <h1 className="text-4xl font-bold text-gray-900">Combo Packs</h1>
            </div>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Discover our amazing combo pack deals and save more on your favorite products
            </p>
            <div className="mt-4 text-sm text-gray-500">
              {comboPacks.length} combo pack{comboPacks.length !== 1 ? 's' : ''} available
            </div>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filter Bar */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search combo packs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            {/* Sort and View Controls */}
            <div className="flex items-center gap-4">
              {/* Sort Dropdown */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="newest">Newest First</option>
                <option value="popular">Most Popular</option>
                <option value="rating">Highest Rated</option>
                <option value="discount">Best Discount</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>

              {/* View Mode Toggle */}
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg transition-colors ${
                    viewMode === 'grid'
                      ? 'bg-white text-purple-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  <FiGrid className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg transition-colors ${
                    viewMode === 'list'
                      ? 'bg-white text-purple-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  <FiList className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Results */}
        {filteredAndSortedComboPacks.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16"
          >
            <FiPackage className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No Combo Packs Found</h3>
            <p className="text-gray-600">
              {searchTerm
                ? `No combo packs match your search for "${searchTerm}"`
                : 'No combo packs are currently available'
              }
            </p>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="mt-4 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                Clear Search
              </button>
            )}
          </motion.div>
        ) : (
          <div className={`${
            viewMode === 'grid'
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'
              : 'space-y-6'
          }`}>
            {filteredAndSortedComboPacks.map((comboPack, index) => (
              <div key={comboPack._id}>
                {viewMode === 'grid' ? (
                  <ComboPackCard comboPack={comboPack} index={index} />
                ) : (
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300"
                  >
                    <div className="flex flex-col md:flex-row gap-6">
                      {/* Image */}
                      <div className="w-full md:w-48 h-48 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0">
                        <img
                          src={comboPack.mainImage || (comboPack.products?.[0]?.images?.[0]?.url) || '/api/placeholder/300/300'}
                          alt={comboPack.name}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      {/* Content */}
                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-4">
                          <h3 className="text-xl font-semibold text-gray-900">
                            {comboPack.name}
                          </h3>
                          {comboPack.discountPercentage > 0 && (
                            <span className="bg-red-500 text-white px-2 py-1 rounded text-sm font-bold">
                              {comboPack.discountPercentage}% OFF
                            </span>
                          )}
                        </div>

                        <p className="text-gray-600 mb-4 line-clamp-2">
                          {comboPack.description}
                        </p>

                        <div className="flex items-center justify-between">
                          <div>
                            <div className="flex items-center space-x-2">
                              <span className="text-2xl font-bold text-gray-900">
                                ₹{comboPack.comboPrice?.toLocaleString()}
                              </span>
                              {comboPack.originalTotalPrice > comboPack.comboPrice && (
                                <span className="text-lg text-gray-500 line-through">
                                  ₹{comboPack.originalTotalPrice?.toLocaleString()}
                                </span>
                              )}
                            </div>
                            <div className="text-sm text-gray-500">
                              {comboPack.products?.length || 0} items included
                            </div>
                          </div>                          <button
                            onClick={() => window.location.href = `/combo-packs/${comboPack._id}`}
                            className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                          >
                            View Details
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ComboPackList;
