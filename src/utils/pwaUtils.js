import { registerSW } from 'virtual:pwa-register'

export const registerServiceWorker = () => {
  if ('serviceWorker' in navigator) {
    const updateSW = registerSW({
      onNeedRefresh() {
        // Show update available notification
        if (window.toast) {
          window.toast.custom((t) => {
            const div = document.createElement('div')
            div.className = 'flex items-center space-x-3 bg-white p-4 rounded-lg shadow-lg'
            div.innerHTML = `
              <div>
                <p class="font-medium">App update available!</p>
                <p class="text-sm text-gray-600">Click to update and reload</p>
              </div>
              <button 
                onclick="window.updateApp()" 
                class="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
              >
                Update
              </button>
            `
            
            // Store update function globally
            window.updateApp = () => {
              updateSW(true)
              window.toast.dismiss(t.id)
            }
            
            return div
          }, { 
            duration: 10000,
            icon: '🔄'
          })
        } else {
          // Fallback notification
          if (confirm('App update available! Click OK to update.')) {
            updateSW(true)
          }
        }
      },
      onOfflineReady() {
        console.log('App ready to work offline')
        if (window.toast) {
          window.toast.success('App is ready to work offline!', {
            icon: '📱',
            duration: 4000
          })
        }
      },
      onRegisterError(error) {
        console.error('SW registration error', error)
      }
    })
  }
}

export const showNotification = (message, type = 'info') => {
  if (window.toast) {
    window.toast[type](message)
  }
}

// Check if app is running as PWA
export const isPWA = () => {
  return window.matchMedia('(display-mode: standalone)').matches ||
         window.navigator.standalone === true ||
         document.referrer.includes('android-app://')
}

// Get installation prompt
let deferredPrompt = null

export const initInstallPrompt = () => {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault()
    deferredPrompt = e
    
    // Show install button/banner
    showInstallPrompt()
  })

  // Track when app is installed
  window.addEventListener('appinstalled', () => {
    console.log('PWA was installed')
    toast.success('App installed successfully!', {
      icon: '🎉',
      duration: 3000
    })
    hideInstallPrompt()
  })
}

export const installApp = async () => {
  if (!deferredPrompt) {
    if (window.toast) {
      window.toast.error('Installation not available')
    }
    return false
  }

  try {
    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    
    if (outcome === 'accepted') {
      console.log('User accepted the install prompt')
      deferredPrompt = null
      return true
    } else {
      console.log('User dismissed the install prompt')
      return false
    }
  } catch (error) {
    console.error('Installation failed:', error)
    if (window.toast) {
      window.toast.error('Installation failed')
    }
    return false
  }
}

const showInstallPrompt = () => {
  // Dispatch custom event for components to listen to
  window.dispatchEvent(new CustomEvent('pwaInstallAvailable'))
}

const hideInstallPrompt = () => {
  // Dispatch custom event to hide install prompts
  window.dispatchEvent(new CustomEvent('pwaInstallCompleted'))
}

// Network status utilities
export const isOnline = () => {
  return navigator.onLine
}

export const getNetworkStatus = () => {
  return {
    online: navigator.onLine,
    effectiveType: navigator.connection?.effectiveType,
    downlink: navigator.connection?.downlink,
    rtt: navigator.connection?.rtt
  }
}

// Cache management utilities
export const clearCache = async () => {
  try {
    const cacheNames = await caches.keys()
    await Promise.all(
      cacheNames.map(cacheName => caches.delete(cacheName))
    )
    if (window.toast) {
      window.toast.success('Cache cleared successfully')
    }
  } catch (error) {
    console.error('Failed to clear cache:', error)
    if (window.toast) {
      window.toast.error('Failed to clear cache')
    }
  }
}

// Get cache storage info
export const getCacheInfo = async () => {
  try {
    const cacheNames = await caches.keys()
    const cacheInfo = await Promise.all(
      cacheNames.map(async (name) => {
        const cache = await caches.open(name)
        const keys = await cache.keys()
        return {
          name,
          entries: keys.length
        }
      })
    )
    return cacheInfo
  } catch (error) {
    console.error('Failed to get cache info:', error)
    return []
  }
}
