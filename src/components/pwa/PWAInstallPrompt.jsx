import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiDownload, FiX, FiSmartphone } from 'react-icons/fi'
import { installApp, isPWA } from '../../utils/pwaUtils'

const PWAInstallPrompt = () => {
  const [showPrompt, setShowPrompt] = useState(false)
  const [isInstalling, setIsInstalling] = useState(false)

  useEffect(() => {
    // Don't show if already installed as PWA
    if (isPWA()) {
      return
    }

    // Listen for install availability
    const handleInstallAvailable = () => {
      setShowPrompt(true)
    }

    const handleInstallCompleted = () => {
      setShowPrompt(false)
    }

    window.addEventListener('pwaInstallAvailable', handleInstallAvailable)
    window.addEventListener('pwaInstallCompleted', handleInstallCompleted)

    return () => {
      window.removeEventListener('pwaInstallAvailable', handleInstallAvailable)
      window.removeEventListener('pwaInstallCompleted', handleInstallCompleted)
    }
  }, [])

  const handleInstall = async () => {
    setIsInstalling(true)
    try {
      const installed = await installApp()
      if (installed) {
        setShowPrompt(false)
      }
    } catch (error) {
      console.error('Installation failed:', error)
    } finally {
      setIsInstalling(false)
    }
  }

  const handleDismiss = () => {
    setShowPrompt(false)
    // Don't show again for this session
    sessionStorage.setItem('pwaInstallPromptDismissed', 'true')
  }

  if (!showPrompt || sessionStorage.getItem('pwaInstallPromptDismissed')) {
    return null
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-sm bg-white rounded-lg shadow-lg p-4 z-50 border border-gray-200"
      >
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <FiSmartphone className="w-6 h-6 text-primary" />
          </div>
          
          <div className="flex-1">
            <h4 className="text-sm font-medium text-gray-800 mb-1">
              Install Indiraa1 App
            </h4>
            <p className="text-xs text-gray-600 mb-3">
              Get faster access, offline browsing, and notifications. Install our app for the best experience!
            </p>
            
            <div className="flex space-x-2">
              <button
                onClick={handleInstall}
                disabled={isInstalling}
                className="flex items-center space-x-1 px-3 py-1 bg-primary text-white text-xs rounded-md hover:bg-primary-dark transition-colors disabled:opacity-50"
              >
                {isInstalling ? (
                  <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <FiDownload className="w-3 h-3" />
                )}
                <span>{isInstalling ? 'Installing...' : 'Install'}</span>
              </button>
              <button
                onClick={handleDismiss}
                className="px-3 py-1 bg-gray-200 text-gray-600 text-xs rounded-md hover:bg-gray-300 transition-colors"
              >
                Later
              </button>
            </div>
          </div>
          
          <button
            onClick={handleDismiss}
            className="flex-shrink-0 text-gray-400 hover:text-gray-600"
          >
            <FiX className="w-4 h-4" />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}

export default PWAInstallPrompt
