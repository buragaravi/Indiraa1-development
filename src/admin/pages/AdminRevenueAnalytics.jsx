import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import RevenueAnalyticsDashboard from '../components/RevenueAnalyticsDashboard';

const AdminRevenueAnalytics = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Navigation Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <button
              onClick={() => navigate('/admin')}
              className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              <span className="font-medium">Back to Admin Dashboard</span>
            </button>
            
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">Admin Panel</span>
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Revenue Analytics Dashboard */}
      <RevenueAnalyticsDashboard />
    </div>
  );
};

export default AdminRevenueAnalytics;
