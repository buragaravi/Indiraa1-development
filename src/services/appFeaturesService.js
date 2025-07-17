// Advanced App Features Service for PWA Phase 3
class AppFeaturesService {
  constructor() {
    this.shareSupported = false
    this.installPrompt = null
    this.mediaCache = new Map()
    this.periodicSyncSupported = false
  }

  // Initialize advanced app features
  async init() {
    try {
      // Check feature support
      this.checkFeatureSupport()
      
      // Set up install prompt handling
      this.setupInstallPrompt()
      
      // Set up app shortcuts
      await this.setupAppShortcuts()
      
      // Initialize media caching
      this.initializeMediaCache()
      
      // Set up periodic background sync
      await this.setupPeriodicSync()
      
      console.log('✅ Advanced app features initialized')
      
    } catch (error) {
      console.error('❌ Failed to initialize app features:', error)
    }
  }

  // Check what features are supported
  checkFeatureSupport() {
    // Web Share API
    this.shareSupported = 'share' in navigator

    // Periodic Background Sync
    this.periodicSyncSupported = 'serviceWorker' in navigator && 
      'sync' in window.ServiceWorkerRegistration.prototype

    console.log('📱 Feature Support:', {
      share: this.shareSupported,
      periodicSync: this.periodicSyncSupported,
      installPrompt: 'BeforeInstallPromptEvent' in window
    })
  }

  // Set up install prompt handling
  setupInstallPrompt() {
    window.addEventListener('beforeinstallprompt', (e) => {
      console.log('📱 Install prompt available')
      
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault()
      
      // Save the event so it can be triggered later
      this.installPrompt = e
      
      // Show custom install UI
      this.showInstallButton()
    })

    // Listen for app installation
    window.addEventListener('appinstalled', () => {
      console.log('✅ PWA was installed')
      this.hideInstallButton()
      this.installPrompt = null
      
      // Track installation
      this.trackEvent('pwa_installed')
    })
  }

  // Show custom install button
  showInstallButton() {
    // Create install button if it doesn't exist
    let installButton = document.getElementById('pwa-install-button')
    
    if (!installButton) {
      installButton = document.createElement('button')
      installButton.id = 'pwa-install-button'
      installButton.innerHTML = `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/>
        </svg>
        Install App
      `
      installButton.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: #007bff;
        color: white;
        border: none;
        border-radius: 25px;
        padding: 12px 20px;
        font-size: 14px;
        font-weight: 600;
        display: flex;
        align-items: center;
        gap: 8px;
        box-shadow: 0 4px 12px rgba(0,123,255,0.3);
        cursor: pointer;
        z-index: 1000;
        transition: transform 0.2s ease;
      `
      
      installButton.addEventListener('mouseover', () => {
        installButton.style.transform = 'scale(1.05)'
      })
      
      installButton.addEventListener('mouseout', () => {
        installButton.style.transform = 'scale(1)'
      })
      
      installButton.addEventListener('click', () => {
        this.promptInstall()
      })
      
      document.body.appendChild(installButton)
    }
    
    installButton.style.display = 'flex'
  }

  // Hide install button
  hideInstallButton() {
    const installButton = document.getElementById('pwa-install-button')
    if (installButton) {
      installButton.style.display = 'none'
    }
  }

  // Prompt user to install the app
  async promptInstall() {
    if (!this.installPrompt) {
      console.log('⚠️ No install prompt available')
      return false
    }

    try {
      // Show the install prompt
      this.installPrompt.prompt()
      
      // Wait for the user to respond to the prompt
      const result = await this.installPrompt.userChoice
      
      console.log(`📱 User response to install prompt: ${result.outcome}`)
      
      if (result.outcome === 'accepted') {
        this.trackEvent('pwa_install_accepted')
      } else {
        this.trackEvent('pwa_install_dismissed')
      }
      
      // Clear the saved prompt
      this.installPrompt = null
      this.hideInstallButton()
      
      return result.outcome === 'accepted'
      
    } catch (error) {
      console.error('❌ Error prompting install:', error)
      return false
    }
  }

  // Set up app shortcuts
  async setupAppShortcuts() {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.ready
        
        // App shortcuts are defined in the web app manifest
        // But we can dynamically add context menu items
        this.setupContextMenuShortcuts()
        
      } catch (error) {
        console.error('Error setting up app shortcuts:', error)
      }
    }
  }

  // Set up context menu shortcuts
  setupContextMenuShortcuts() {
    // Add right-click context menu for quick actions
    document.addEventListener('contextmenu', (e) => {
      // Only on product elements
      const productElement = e.target.closest('[data-product-id]')
      if (productElement) {
        e.preventDefault()
        this.showProductContextMenu(e, productElement)
      }
    })
  }

  // Show product context menu
  showProductContextMenu(event, productElement) {
    const productId = productElement.dataset.productId
    
    // Remove existing context menu
    const existingMenu = document.getElementById('product-context-menu')
    if (existingMenu) {
      existingMenu.remove()
    }
    
    // Create context menu
    const menu = document.createElement('div')
    menu.id = 'product-context-menu'
    menu.style.cssText = `
      position: fixed;
      top: ${event.clientY}px;
      left: ${event.clientX}px;
      background: white;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      z-index: 10000;
      min-width: 150px;
      overflow: hidden;
    `
    
    const menuItems = [
      { label: 'Add to Cart', icon: '🛒', action: () => this.quickAddToCart(productId) },
      { label: 'Add to Wishlist', icon: '❤️', action: () => this.quickAddToWishlist(productId) },
      { label: 'Share Product', icon: '📤', action: () => this.shareProduct(productId) },
      { label: 'View Details', icon: '👁️', action: () => this.viewProduct(productId) }
    ]
    
    menuItems.forEach(item => {
      const menuItem = document.createElement('div')
      menuItem.style.cssText = `
        padding: 12px 16px;
        cursor: pointer;
        border-bottom: 1px solid #f0f0f0;
        display: flex;
        align-items: center;
        gap: 8px;
        transition: background-color 0.2s;
      `
      menuItem.innerHTML = `${item.icon} ${item.label}`
      
      menuItem.addEventListener('mouseover', () => {
        menuItem.style.backgroundColor = '#f8f9fa'
      })
      
      menuItem.addEventListener('mouseout', () => {
        menuItem.style.backgroundColor = 'transparent'
      })
      
      menuItem.addEventListener('click', () => {
        item.action()
        menu.remove()
      })
      
      menu.appendChild(menuItem)
    })
    
    document.body.appendChild(menu)
    
    // Remove menu when clicking elsewhere
    setTimeout(() => {
      document.addEventListener('click', () => {
        menu.remove()
      }, { once: true })
    }, 100)
  }

  // Web Share API integration
  async shareProduct(productId) {
    if (!this.shareSupported) {
      this.fallbackShare(productId)
      return
    }

    try {
      const product = await this.getProductDetails(productId)
      
      await navigator.share({
        title: product.name,
        text: `Check out this amazing product: ${product.name}`,
        url: `${window.location.origin}/products/${productId}`
      })
      
      console.log('✅ Product shared successfully')
      this.trackEvent('product_shared', { productId })
      
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('❌ Error sharing product:', error)
        this.fallbackShare(productId)
      }
    }
  }

  // Fallback share for browsers without Web Share API
  fallbackShare(productId) {
    const shareUrl = `${window.location.origin}/products/${productId}`
    
    // Create share modal
    const modal = document.createElement('div')
    modal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0,0,0,0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10000;
    `
    
    const content = document.createElement('div')
    content.style.cssText = `
      background: white;
      border-radius: 12px;
      padding: 24px;
      max-width: 400px;
      width: 90%;
    `
    
    content.innerHTML = `
      <h3 style="margin: 0 0 16px; font-size: 18px;">Share this product</h3>
      <input type="text" value="${shareUrl}" readonly style="
        width: 100%;
        padding: 12px;
        border: 1px solid #ddd;
        border-radius: 6px;
        margin-bottom: 16px;
        font-family: monospace;
      ">
      <div style="display: flex; gap: 12px;">
        <button onclick="navigator.clipboard.writeText('${shareUrl}'); this.textContent='Copied!'" style="
          flex: 1;
          padding: 12px;
          background: #007bff;
          color: white;
          border: none;
          border-radius: 6px;
          cursor: pointer;
        ">Copy Link</button>
        <button onclick="this.closest('[style*=fixed]').remove()" style="
          flex: 1;
          padding: 12px;
          background: #6c757d;
          color: white;
          border: none;
          border-radius: 6px;
          cursor: pointer;
        ">Close</button>
      </div>
    `
    
    modal.appendChild(content)
    document.body.appendChild(modal)
    
    // Remove modal when clicking outside
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.remove()
      }
    })
  }

  // Initialize media caching
  initializeMediaCache() {
    // Intercept image loading and cache them
    this.setupImageCaching()
    
    // Preload critical images
    this.preloadCriticalImages()
  }

  // Set up image caching
  setupImageCaching() {
    // Use Intersection Observer to cache images as they come into view
    const imageObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target
          const src = img.dataset.src || img.src
          
          if (src && !this.mediaCache.has(src)) {
            this.cacheImage(src)
          }
        }
      })
    }, {
      rootMargin: '50px' // Start caching 50px before image is visible
    })

    // Observe all images
    document.querySelectorAll('img').forEach(img => {
      imageObserver.observe(img)
    })

    // Set up mutation observer for dynamically added images
    const mutationObserver = new MutationObserver((mutations) => {
      mutations.forEach(mutation => {
        mutation.addedNodes.forEach(node => {
          if (node.nodeType === 1) { // Element node
            const images = node.tagName === 'IMG' 
              ? [node] 
              : node.querySelectorAll('img')
            
            images.forEach(img => imageObserver.observe(img))
          }
        })
      })
    })

    mutationObserver.observe(document.body, {
      childList: true,
      subtree: true
    })
  }

  // Cache individual image
  async cacheImage(src) {
    try {
      const cache = await caches.open('indiraa1-media-v1')
      
      // Check if already cached
      const cachedResponse = await cache.match(src)
      if (cachedResponse) {
        this.mediaCache.set(src, 'cached')
        return
      }

      // Fetch and cache
      const response = await fetch(src)
      if (response.ok) {
        await cache.put(src, response.clone())
        this.mediaCache.set(src, 'cached')
        console.log(`📸 Cached image: ${src}`)
      }
    } catch (error) {
      console.error(`❌ Failed to cache image ${src}:`, error)
    }
  }

  // Preload critical images
  async preloadCriticalImages() {
    const criticalImages = [
      '/banner1.jpg',
      '/banner2.jpg',
      '/banner3.jpg',
      '/icon-192.png',
      '/icon-512.png'
    ]

    for (const src of criticalImages) {
      await this.cacheImage(src)
    }
  }

  // Set up periodic background sync
  async setupPeriodicSync() {
    if (!this.periodicSyncSupported) {
      console.log('⚠️ Periodic background sync not supported')
      return
    }

    try {
      const registration = await navigator.serviceWorker.ready
      
      // Register periodic sync for different tasks
      await registration.periodicSync.register('sync-cart', {
        minInterval: 24 * 60 * 60 * 1000 // 24 hours
      })
      
      await registration.periodicSync.register('update-prices', {
        minInterval: 6 * 60 * 60 * 1000 // 6 hours
      })
      
      await registration.periodicSync.register('sync-wishlist', {
        minInterval: 12 * 60 * 60 * 1000 // 12 hours
      })
      
      console.log('✅ Periodic background sync registered')
      
    } catch (error) {
      console.error('❌ Failed to register periodic sync:', error)
    }
  }

  // Quick action methods
  async quickAddToCart(productId) {
    try {
      // Import the API function dynamically to avoid circular dependencies
      const { addToCartWithSync } = await import('./apiWithOffline.js')
      const result = await addToCartWithSync(productId, 1)
      
      this.showToast(
        result.success ? 'Added to cart!' : 'Failed to add to cart',
        result.success ? 'success' : 'error'
      )
      
      this.trackEvent('quick_add_to_cart', { productId })
      
    } catch (error) {
      console.error('Error adding to cart:', error)
      this.showToast('Failed to add to cart', 'error')
    }
  }

  async quickAddToWishlist(productId) {
    try {
      const { addToWishlistWithSync } = await import('./apiWithOffline.js')
      const result = await addToWishlistWithSync(productId)
      
      this.showToast(
        result.success ? 'Added to wishlist!' : 'Failed to add to wishlist',
        result.success ? 'success' : 'error'
      )
      
      this.trackEvent('quick_add_to_wishlist', { productId })
      
    } catch (error) {
      console.error('Error adding to wishlist:', error)
      this.showToast('Failed to add to wishlist', 'error')
    }
  }

  viewProduct(productId) {
    window.location.href = `/products/${productId}`
  }

  // Helper methods
  async getProductDetails(productId) {
    try {
      const { getProductWithOffline } = await import('./apiWithOffline.js')
      const result = await getProductWithOffline(productId)
      return result.data.product
    } catch (error) {
      console.error('Error getting product details:', error)
      return { name: 'Product', id: productId }
    }
  }

  showToast(message, type = 'info') {
    const toast = document.createElement('div')
    toast.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: ${type === 'success' ? '#28a745' : type === 'error' ? '#dc3545' : '#007bff'};
      color: white;
      padding: 12px 20px;
      border-radius: 6px;
      z-index: 10000;
      font-weight: 500;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      animation: slideIn 0.3s ease;
    `
    
    toast.textContent = message
    document.body.appendChild(toast)
    
    // Auto remove after 3 seconds
    setTimeout(() => {
      toast.style.animation = 'slideOut 0.3s ease'
      setTimeout(() => toast.remove(), 300)
    }, 3000)
  }

  trackEvent(eventName, data = {}) {
    // Simple event tracking - in production, integrate with analytics
    console.log(`📊 Event: ${eventName}`, data)
    
    // Could send to analytics service
    // gtag('event', eventName, data)
    // analytics.track(eventName, data)
  }

  // Public API methods
  getFeatureSupport() {
    return {
      share: this.shareSupported,
      periodicSync: this.periodicSyncSupported,
      installPrompt: !!this.installPrompt
    }
  }

  async getCacheStats() {
    try {
      const cache = await caches.open('indiraa1-media-v1')
      const keys = await cache.keys()
      
      return {
        cachedImages: keys.length,
        memoryCache: this.mediaCache.size,
        supportedFeatures: this.getFeatureSupport()
      }
    } catch (error) {
      return {
        cachedImages: 0,
        memoryCache: this.mediaCache.size,
        supportedFeatures: this.getFeatureSupport()
      }
    }
  }

  async clearMediaCache() {
    try {
      await caches.delete('indiraa1-media-v1')
      this.mediaCache.clear()
      console.log('🗑️ Media cache cleared')
    } catch (error) {
      console.error('❌ Failed to clear media cache:', error)
    }
  }
}

// Export singleton instance
export const appFeaturesService = new AppFeaturesService()
export default appFeaturesService
