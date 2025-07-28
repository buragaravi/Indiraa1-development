import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, BarChart3 } from 'lucide-react';
import SubAdminRevenueAnalytics from '../../components/subadmin/SubAdminRevenueAnalytics';

const SubAdminRevenueAnalyticsPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen revenue-analytics-gradient">
      {/* Navigation Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <button
              onClick={() => navigate('/sub-admin/dashboard')}
              className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              <span className="font-medium">Back to Dashboard</span>
            </button>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <BarChart3 className="h-5 w-5 text-indigo-600" />
                <span className="text-sm font-medium text-gray-700">Revenue Analytics</span>
              </div>
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Sub-Admin Revenue Analytics Dashboard */}
      <SubAdminRevenueAnalytics />
    </div>
  );
};

export default SubAdminRevenueAnalyticsPage;
