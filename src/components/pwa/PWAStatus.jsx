import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { FiWifi, FiDownload, FiSmartphone, FiSettings } from 'react-icons/fi'
import { isPWA, getNetworkStatus, getCacheInfo, clearCache } from '../../utils/pwaUtils'

const PWAStatus = () => {
  const [pwaInfo, setPwaInfo] = useState({
    isPWA: false,
    isOnline: true,
    cacheInfo: []
  })
  const [showDetails, setShowDetails] = useState(false)

  useEffect(() => {
    const updatePwaInfo = async () => {
      const cacheInfo = await getCacheInfo()
      setPwaInfo({
        isPWA: isPWA(),
        isOnline: navigator.onLine,
        cacheInfo
      })
    }

    updatePwaInfo()

    // Listen for network changes
    const handleOnline = () => setPwaInfo(prev => ({ ...prev, isOnline: true }))
    const handleOffline = () => setPwaInfo(prev => ({ ...prev, isOnline: false }))

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  const handleClearCache = async () => {
    await clearCache()
    const cacheInfo = await getCacheInfo()
    setPwaInfo(prev => ({ ...prev, cacheInfo }))
  }

  if (!showDetails) {
    return (
      <motion.button
        onClick={() => setShowDetails(true)}
        className="fixed bottom-20 left-4 bg-primary text-white p-3 rounded-full shadow-lg hover:bg-primary-dark transition-colors z-40"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <FiSettings className="w-5 h-5" />
      </motion.button>
    )
  }

  return (
    <motion.div
      initial={{ x: -300, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: -300, opacity: 0 }}
      className="fixed bottom-20 left-4 bg-white rounded-lg shadow-lg p-4 z-50 border border-gray-200 max-w-sm"
    >
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-medium text-gray-800">PWA Status</h4>
        <button
          onClick={() => setShowDetails(false)}
          className="text-gray-400 hover:text-gray-600"
        >
          ×
        </button>
      </div>

      <div className="space-y-2">
        {/* PWA Status */}
        <div className="flex items-center space-x-2">
          <FiSmartphone className={`w-4 h-4 ${pwaInfo.isPWA ? 'text-green-500' : 'text-gray-400'}`} />
          <span className="text-sm">
            {pwaInfo.isPWA ? 'Running as PWA' : 'Browser mode'}
          </span>
        </div>

        {/* Network Status */}
        <div className="flex items-center space-x-2">
          <FiWifi className={`w-4 h-4 ${pwaInfo.isOnline ? 'text-green-500' : 'text-red-500'}`} />
          <span className="text-sm">
            {pwaInfo.isOnline ? 'Online' : 'Offline'}
          </span>
        </div>

        {/* Cache Info */}
        <div className="mt-3">
          <p className="text-xs text-gray-600 mb-1">Cache Status:</p>
          {pwaInfo.cacheInfo.length > 0 ? (
            <div className="space-y-1">
              {pwaInfo.cacheInfo.map((cache) => (
                <div key={cache.name} className="text-xs text-gray-500">
                  {cache.name}: {cache.entries} items
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-gray-500">No cache data</p>
          )}
        </div>

        {/* Actions */}
        <div className="mt-3 pt-3 border-t border-gray-200">
          <button
            onClick={handleClearCache}
            className="w-full px-3 py-1 bg-gray-100 text-gray-700 text-xs rounded hover:bg-gray-200 transition-colors"
          >
            Clear Cache
          </button>
        </div>
      </div>
    </motion.div>
  )
}

export default PWAStatus
