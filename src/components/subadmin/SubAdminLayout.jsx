import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import WarehouseManagerSidebar from './WarehouseManagerSidebar';

const SubAdminLayout = ({ children, userRole = 'warehouse_manager' }) => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const location = useLocation();

  // Update active tab based on current route
  useEffect(() => {
    const pathname = location.pathname;
    if (pathname.includes('/batches')) {
      setActiveTab('batches');
    } else if (pathname.includes('/warehouse_manager')) {
      setActiveTab('dashboard');
    }
  }, [location]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="flex">
        {/* Sidebar */}
        <WarehouseManagerSidebar activeTab={activeTab} setActiveTab={setActiveTab} />
        
        {/* Main Content */}
        <div className="flex-1 flex flex-col min-h-screen">
          {/* Content Area */}
          <main className="flex-1 overflow-auto">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
};

export default SubAdminLayout;
