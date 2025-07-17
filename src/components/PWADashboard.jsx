// PWA Management Dashboard Component
import React, { useState, useEffect } from 'react'
import { 
  FiWifi, FiWifiOff, FiDownload, FiRefreshCw, FiSettings,
  FiDatabase, FiHardDrive, FiBell, FiShare2, FiTrash2,
  FiActivity, FiBarChart, FiClock, FiCheck, FiX
} from 'react-icons/fi'
import { syncManager } from '../services/syncManager'
import { cacheManager } from '../services/cacheManager'
import { notificationService } from '../services/notificationService'
import { appFeaturesService } from '../services/appFeaturesService'

const PWADashboard = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [syncStatus, setSyncStatus] = useState({})
  const [cacheStats, setCacheStats] = useState({})
  const [notificationStatus, setNotificationStatus] = useState({})
  const [appFeatures, setAppFeatures] = useState({})
  const [activeTab, setActiveTab] = useState('overview')
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    // Network status listeners
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)
    
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    
    // Load initial data
    loadDashboardData()
    
    // Set up periodic updates
    const interval = setInterval(loadDashboardData, 30000) // Every 30 seconds
    
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
      clearInterval(interval)
    }
  }, [])

  const loadDashboardData = async () => {
    try {
      const [sync, cache, notification, features] = await Promise.all([
        syncManager.getSyncStatus(),
        cacheManager.getCacheStats(),
        notificationService.getStatus(),
        appFeaturesService.getCacheStats()
      ])
      
      setSyncStatus(sync)
      setCacheStats(cache)
      setNotificationStatus(notification)
      setAppFeatures(features)
    } catch (error) {
      console.error('Failed to load dashboard data:', error)
    }
  }

  const handleForceSync = async () => {
    setIsLoading(true)
    try {
      await syncManager.forceSyncNow()
      await loadDashboardData()
    } catch (error) {
      console.error('Force sync failed:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleClearCache = async (category = null) => {
    setIsLoading(true)
    try {
      await cacheManager.clearCache(category)
      await loadDashboardData()
    } catch (error) {
      console.error('Clear cache failed:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleRequestNotifications = async () => {
    setIsLoading(true)
    try {
      await notificationService.requestPermission()
      await loadDashboardData()
    } catch (error) {
      console.error('Notification permission failed:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const OverviewTab = () => (
    <div className="space-y-6">
      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Network Status</p>
              <p className={`text-2xl font-bold ${isOnline ? 'text-green-600' : 'text-red-600'}`}>
                {isOnline ? 'Online' : 'Offline'}
              </p>
            </div>
            {isOnline ? (
              <FiWifi className="h-8 w-8 text-green-600" />
            ) : (
              <FiWifiOff className="h-8 w-8 text-red-600" />
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Sync Queue</p>
              <p className="text-2xl font-bold text-blue-600">
                {syncStatus.pending || 0}
              </p>
            </div>
            <FiRefreshCw className={`h-8 w-8 text-blue-600 ${syncStatus.syncInProgress ? 'animate-spin' : ''}`} />
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Cache Items</p>
              <p className="text-2xl font-bold text-purple-600">
                {cacheStats.itemCount || 0}
              </p>
            </div>
            <FiDatabase className="h-8 w-8 text-purple-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Notifications</p>
              <p className={`text-2xl font-bold ${notificationStatus.permission === 'granted' ? 'text-green-600' : 'text-orange-600'}`}>
                {notificationStatus.permission === 'granted' ? 'Enabled' : 'Disabled'}
              </p>
            </div>
            <FiBell className={`h-8 w-8 ${notificationStatus.permission === 'granted' ? 'text-green-600' : 'text-orange-600'}`} />
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg p-6 border border-gray-200">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button
            onClick={handleForceSync}
            disabled={!isOnline || isLoading}
            className="flex flex-col items-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <FiRefreshCw className={`h-6 w-6 text-blue-600 mb-2 ${isLoading ? 'animate-spin' : ''}`} />
            <span className="text-sm font-medium text-blue-600">Force Sync</span>
          </button>

          <button
            onClick={() => handleClearCache()}
            disabled={isLoading}
            className="flex flex-col items-center p-4 bg-red-50 rounded-lg hover:bg-red-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <FiTrash2 className="h-6 w-6 text-red-600 mb-2" />
            <span className="text-sm font-medium text-red-600">Clear Cache</span>
          </button>

          <button
            onClick={handleRequestNotifications}
            disabled={notificationStatus.permission === 'granted' || isLoading}
            className="flex flex-col items-center p-4 bg-green-50 rounded-lg hover:bg-green-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <FiBell className="h-6 w-6 text-green-600 mb-2" />
            <span className="text-sm font-medium text-green-600">Enable Notifications</span>
          </button>

          <button
            onClick={() => appFeaturesService.promptInstall()}
            disabled={!appFeatures.supportedFeatures?.installPrompt || isLoading}
            className="flex flex-col items-center p-4 bg-purple-50 rounded-lg hover:bg-purple-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <FiDownload className="h-6 w-6 text-purple-600 mb-2" />
            <span className="text-sm font-medium text-purple-600">Install App</span>
          </button>
        </div>
      </div>
    </div>
  )

  const SyncTab = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg p-6 border border-gray-200">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Synchronization Status</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{syncStatus.pending || 0}</div>
            <div className="text-sm text-gray-600">Pending</div>
          </div>
          <div className="text-center p-4 bg-orange-50 rounded-lg">
            <div className="text-2xl font-bold text-orange-600">{syncStatus.processing || 0}</div>
            <div className="text-sm text-gray-600">Processing</div>
          </div>
          <div className="text-center p-4 bg-red-50 rounded-lg">
            <div className="text-2xl font-bold text-red-600">{syncStatus.failed || 0}</div>
            <div className="text-sm text-gray-600">Failed</div>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${isOnline ? 'bg-green-400' : 'bg-red-400'}`}></div>
            <span className="text-sm text-gray-600">
              {isOnline ? 'Online - Auto sync enabled' : 'Offline - Queuing actions'}
            </span>
          </div>
          <button
            onClick={handleForceSync}
            disabled={!isOnline || isLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            <FiRefreshCw className={isLoading ? 'animate-spin' : ''} />
            <span>Sync Now</span>
          </button>
        </div>
      </div>

      <SyncHistory />
    </div>
  )

  const SyncHistory = () => {
    const [history, setHistory] = useState([])

    useEffect(() => {
      loadSyncHistory()
    }, [])

    const loadSyncHistory = async () => {
      try {
        const syncHistory = await syncManager.getSyncHistory(20)
        setHistory(syncHistory)
      } catch (error) {
        console.error('Failed to load sync history:', error)
      }
    }

    return (
      <div className="bg-white rounded-lg p-6 border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">Recent Sync Activity</h3>
          <button
            onClick={loadSyncHistory}
            className="text-sm text-blue-600 hover:text-blue-700"
          >
            Refresh
          </button>
        </div>

        <div className="space-y-3">
          {history.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No sync activity yet</p>
          ) : (
            history.map((item, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  {item.success ? (
                    <FiCheck className="h-5 w-5 text-green-600" />
                  ) : (
                    <FiX className="h-5 w-5 text-red-600" />
                  )}
                  <div>
                    <p className="text-sm font-medium text-gray-900">{item.type}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(item.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">
                    {item.duration ? `${item.duration}ms` : '-'}
                  </p>
                  <p className={`text-xs ${item.success ? 'text-green-600' : 'text-red-600'}`}>
                    {item.success ? 'Success' : 'Failed'}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    )
  }

  const CacheTab = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg p-6 border border-gray-200">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Cache Statistics</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">{cacheStats.itemCount || 0}</div>
            <div className="text-sm text-gray-600">Total Items</div>
          </div>
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{cacheStats.memoryCount || 0}</div>
            <div className="text-sm text-gray-600">Memory Cache</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              {cacheStats.hitRate ? `${cacheStats.hitRate.toFixed(1)}%` : '0%'}
            </div>
            <div className="text-sm text-gray-600">Hit Rate</div>
          </div>
          <div className="text-center p-4 bg-orange-50 rounded-lg">
            <div className="text-2xl font-bold text-orange-600">
              {formatBytes(cacheStats.totalSize || 0)}
            </div>
            <div className="text-sm text-gray-600">Total Size</div>
          </div>
        </div>

        {/* Cache Categories */}
        {cacheStats.categories && Object.keys(cacheStats.categories).length > 0 && (
          <div>
            <h4 className="text-md font-medium text-gray-900 mb-3">Cache by Category</h4>
            <div className="space-y-2">
              {Object.entries(cacheStats.categories).map(([category, stats]) => (
                <div key={category} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-gray-900 capitalize">{category}</p>
                    <p className="text-xs text-gray-500">{stats.count} items</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">{formatBytes(stats.size)}</p>
                    <button
                      onClick={() => handleClearCache(category)}
                      className="text-xs text-red-600 hover:text-red-700"
                    >
                      Clear
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )

  const tabs = [
    { id: 'overview', name: 'Overview', icon: FiActivity },
    { id: 'sync', name: 'Sync', icon: FiRefreshCw },
    { id: 'cache', name: 'Cache', icon: FiDatabase },
    { id: 'features', name: 'Features', icon: FiSettings }
  ]

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">PWA Dashboard</h1>
        <p className="text-gray-600 mt-2">Monitor and manage your Progressive Web App features</p>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span>{tab.name}</span>
              </button>
            )
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'overview' && <OverviewTab />}
        {activeTab === 'sync' && <SyncTab />}
        {activeTab === 'cache' && <CacheTab />}
        {activeTab === 'features' && (
          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 mb-4">App Features</h3>
            <div className="space-y-4">
              {appFeatures.supportedFeatures && Object.entries(appFeatures.supportedFeatures).map(([feature, supported]) => (
                <div key={feature} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-900 capitalize">
                    {feature.replace(/([A-Z])/g, ' $1').trim()}
                  </span>
                  <span className={`text-sm ${supported ? 'text-green-600' : 'text-red-600'}`}>
                    {supported ? 'Supported' : 'Not Supported'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default PWADashboard
