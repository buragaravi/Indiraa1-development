import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import RevenueAnalyticsDashboard from '../components/RevenueAnalyticsDashboard';

const AdminRevenueAnalytics = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Revenue Analytics Dashboard */}
      <RevenueAnalyticsDashboard />
    </div>
  );
};

export default AdminRevenueAnalytics;
