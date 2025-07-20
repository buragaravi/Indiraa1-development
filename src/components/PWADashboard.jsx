// Simplified PWA Dashboard Component (Notifications Only)
import React, { useState, useEffect } from 'react'
import { 
  FiWifi, FiWifiOff, FiBell, FiSettings,
  FiActivity, FiCheck, FiX
} from 'react-icons/fi'
import { notificationService } from '../services/notificationService'

const PWADashboard = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [notificationStatus, setNotificationStatus] = useState({})

  useEffect(() => {
    // Network status listeners
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)
    
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    
    // Load initial data
    loadDashboardData()
    
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  const loadDashboardData = async () => {
    try {
      const notification = await notificationService.getStatus()
      setNotificationStatus(notification)
    } catch (error) {
      console.error('Error loading PWA dashboard data:', error)
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">PWA Dashboard</h1>
        <p className="text-gray-600">Manage your Progressive Web App features</p>
      </div>

      {/* Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        
        {/* Network Status */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Network Status</h3>
            {isOnline ? (
              <FiWifi className="w-5 h-5 text-green-500" />
            ) : (
              <FiWifiOff className="w-5 h-5 text-red-500" />
            )}
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Connection</span>
              <span className={`text-sm font-medium ${isOnline ? 'text-green-600' : 'text-red-600'}`}>
                {isOnline ? 'Online' : 'Offline'}
              </span>
            </div>
          </div>
        </div>

        {/* Notification Status */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Notifications</h3>
            <FiBell className="w-5 h-5 text-blue-500" />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Permission</span>
              <span className={`text-sm font-medium ${
                notificationStatus.permission === 'granted' ? 'text-green-600' : 'text-red-600'
              }`}>
                {notificationStatus.permission || 'Not Available'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Service Worker</span>
              <span className={`text-sm font-medium ${
                notificationStatus.serviceWorkerReady ? 'text-green-600' : 'text-red-600'
              }`}>
                {notificationStatus.serviceWorkerReady ? 'Ready' : 'Not Ready'}
              </span>
            </div>
          </div>
        </div>

      </div>

      {/* Notification Controls */}
      {notificationStatus.permission === 'granted' && (
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Notification Controls</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={() => notificationService.sendTestNotification()}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Send Test Notification
            </button>
            <button
              onClick={() => loadDashboardData()}
              className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              Refresh Status
            </button>
          </div>
        </div>
      )}

    </div>
  )
}

export default PWADashboard
