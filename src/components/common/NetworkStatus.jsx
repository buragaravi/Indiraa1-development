import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiWifi, FiWifiOff, FiDatabase, FiRefreshCw, FiX } from 'react-icons/fi'

const NetworkStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [showStatus, setShowStatus] = useState(false)

  useEffect(() => {
    const handleOnline = async () => {
      setIsOnline(true)
      setShowStatus(true)
      
      // Hide the "back online" message after 4 seconds
      setTimeout(() => setShowStatus(false), 4000)
    }

    const handleOffline = async () => {
      setIsOnline(false)
      setShowStatus(true)
      // Don't auto-hide offline message
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    // Show initial status if offline
    if (!navigator.onLine) {
      handleOffline()
    }

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  return (
    <AnimatePresence>
      {showStatus && (
        <motion.div
          initial={{ x: -400, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -400, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className={`fixed bottom-6 left-6 z-[60] px-6 py-4 rounded-2xl shadow-2xl backdrop-blur-lg border max-w-sm ${
            isOnline 
              ? 'bg-green-500/95 text-white border-green-400/50 shadow-green-500/25' 
              : 'bg-gray-800/95 text-white border-gray-700/50 shadow-gray-800/25'
          }`}
        >
          <div className="flex items-start space-x-3">
            {isOnline ? (
              <>
                <div className="flex-shrink-0 mt-0.5">
                  <FiWifi className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold">Back online!</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs opacity-90 mt-1">
                    <FiRefreshCw className="w-3 h-3 animate-spin" />
                    <span>Syncing your data...</span>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="flex-shrink-0 mt-0.5">
                  <FiWifiOff className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold">You're offline</span>
                    <button
                      onClick={() => setShowStatus(false)}
                      className="flex-shrink-0 text-white/60 hover:text-white transition-colors p-1 rounded hover:bg-white/10"
                      title="Dismiss"
                    >
                      <FiX className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-xs opacity-80 mt-1">
                    You can still browse cached products and manage your cart
                  </p>
                </div>
              </>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default NetworkStatus
