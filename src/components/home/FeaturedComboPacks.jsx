import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { FiPackage, FiArrowRight } from 'react-icons/fi';
import ComboPackCard from '../ComboPackCard';

const FeaturedComboPacks = () => {
  const [comboPacks, setComboPacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchFeaturedComboPacks();
  }, []);

  const fetchFeaturedComboPacks = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5001/api/combo-packs/featured?limit=6');
      const data = await response.json();
      
      if (data.success) {
        setComboPacks(data.comboPacks || []);
      } else {
        setError('Failed to fetch combo packs');
      }
    } catch (error) {
      console.error('Error fetching featured combo packs:', error);
      setError('Failed to fetch combo packs');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <section className="py-16 bg-gradient-to-br from-purple-50 via-white to-pink-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading combo packs...</p>
          </div>
        </div>
      </section>
    );
  }

  if (error || comboPacks.length === 0) {
    return null; // Don't show section if no combo packs
  }

  return (
    <section className="py-16 bg-gradient-to-br from-purple-50 via-white to-pink-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center mb-4">
            <FiPackage className="w-8 h-8 text-purple-600 mr-3" />
            <h2 className="text-4xl font-bold text-gray-900">
              Featured Combo Packs
            </h2>
          </div>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Get more value with our carefully curated combo packs. Save money while getting all your essentials together.
          </p>
        </motion.div>

        {/* Combo Packs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {comboPacks.map((comboPack, index) => (
            <ComboPackCard
              key={comboPack._id}
              comboPack={comboPack}
              index={index}
            />
          ))}
        </div>

        {/* View All Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >          <button
            onClick={() => navigate('/products')}
            className="inline-flex items-center px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            View All Products & Combo Packs
            <FiArrowRight className="ml-2 w-5 h-5" />
          </button>
        </motion.div>
      </div>
    </section>
  );
};

export default FeaturedComboPacks;
