// Push Notification Service for PWA Phase 3
class NotificationService {
  constructor() {
    this.vapidPublicKey = 'BG3Gx8HYNaOQfMnT...'; // Replace with your VAPID public key
    this.subscription = null
    this.permission = 'default'
    this.notificationQueue = []
    this.maxQueueSize = 50
  }

  // Initialize notification service
  async init() {
    try {
      // Check if notifications are supported
      if (!('Notification' in window)) {
        console.log('⚠️ This browser does not support notifications')
        return false
      }

      if (!('serviceWorker' in navigator)) {
        console.log('⚠️ Service workers not supported')
        return false
      }

      if (!('PushManager' in window)) {
        console.log('⚠️ Push messaging not supported')
        return false
      }

      // Get current permission
      this.permission = Notification.permission
      console.log(`📱 Notification permission: ${this.permission}`)

      // If already granted, set up subscription
      if (this.permission === 'granted') {
        await this.setupPushSubscription()
      }

      return true
    } catch (error) {
      console.error('❌ Failed to initialize notification service:', error)
      return false
    }
  }

  // Request notification permission
  async requestPermission() {
    try {
      if (this.permission === 'granted') {
        return true
      }

      const permission = await Notification.requestPermission()
      this.permission = permission

      if (permission === 'granted') {
        console.log('✅ Notification permission granted')
        await this.setupPushSubscription()
        return true
      } else {
        console.log('❌ Notification permission denied')
        return false
      }
    } catch (error) {
      console.error('❌ Error requesting notification permission:', error)
      return false
    }
  }

  // Set up push subscription
  async setupPushSubscription() {
    try {
      const registration = await navigator.serviceWorker.ready
      
      // Check if already subscribed
      const existingSubscription = await registration.pushManager.getSubscription()
      
      if (existingSubscription) {
        this.subscription = existingSubscription
        console.log('✅ Using existing push subscription')
        return this.subscription
      }

      // Create new subscription
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(this.vapidPublicKey)
      })

      this.subscription = subscription
      console.log('✅ New push subscription created')

      // Send subscription to server
      await this.sendSubscriptionToServer(subscription)

      return subscription
    } catch (error) {
      console.error('❌ Failed to set up push subscription:', error)
      return null
    }
  }

  // Send subscription to server
  async sendSubscriptionToServer(subscription) {
    try {
      const response = await fetch('http://localhost:5001/api/notifications/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          subscription: subscription.toJSON(),
          userAgent: navigator.userAgent,
          timestamp: Date.now()
        })
      })

      if (response.ok) {
        console.log('✅ Subscription sent to server')
      } else {
        console.error('❌ Failed to send subscription to server')
      }
    } catch (error) {
      console.error('❌ Error sending subscription to server:', error)
    }
  }

  // Show local notification
  async showNotification(title, options = {}) {
    try {
      if (this.permission !== 'granted') {
        console.log('⚠️ Cannot show notification - permission not granted')
        return false
      }

      const defaultOptions = {
        icon: '/icon-192.png',
        badge: '/badge-72.png',
        vibrate: [200, 100, 200],
        requireInteraction: false,
        renotify: false,
        silent: false,
        ...options
      }

      // Use service worker if available
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.ready
        await registration.showNotification(title, defaultOptions)
      } else {
        // Fallback to regular notification
        new Notification(title, defaultOptions)
      }

      console.log(`📱 Notification shown: ${title}`)
      return true
    } catch (error) {
      console.error('❌ Error showing notification:', error)
      return false
    }
  }

  // Queue notification for offline
  queueNotification(title, options) {
    if (this.notificationQueue.length >= this.maxQueueSize) {
      this.notificationQueue.shift() // Remove oldest
    }

    this.notificationQueue.push({
      title,
      options,
      timestamp: Date.now()
    })

    console.log(`📝 Notification queued: ${title}`)
  }

  // Process queued notifications
  async processQueuedNotifications() {
    if (this.permission !== 'granted' || this.notificationQueue.length === 0) {
      return
    }

    const notifications = [...this.notificationQueue]
    this.notificationQueue = []

    for (const notification of notifications) {
      await this.showNotification(notification.title, notification.options)
      // Small delay to prevent spam
      await new Promise(resolve => setTimeout(resolve, 500))
    }

    console.log(`📱 Processed ${notifications.length} queued notifications`)
  }

  // Predefined notification types
  async showOrderNotification(orderData) {
    const title = 'Order Update'
    const options = {
      body: `Order #${orderData.orderId} ${orderData.status}`,
      icon: '/icon-192.png',
      tag: `order-${orderData.orderId}`,
      data: {
        type: 'order',
        orderId: orderData.orderId,
        url: `/orders/${orderData.orderId}`
      },
      actions: [
        {
          action: 'view',
          title: 'View Order',
          icon: '/view-icon.png'
        },
        {
          action: 'track',
          title: 'Track Package',
          icon: '/track-icon.png'
        }
      ]
    }

    return await this.showNotification(title, options)
  }

  async showPromoNotification(promoData) {
    const title = promoData.title || 'Special Offer!'
    const options = {
      body: promoData.message,
      icon: '/promo-icon.png',
      tag: 'promotion',
      data: {
        type: 'promotion',
        promoId: promoData.id,
        url: promoData.url || '/products'
      },
      actions: [
        {
          action: 'shop',
          title: 'Shop Now',
          icon: '/shop-icon.png'
        },
        {
          action: 'save',
          title: 'Save for Later',
          icon: '/save-icon.png'
        }
      ]
    }

    return await this.showNotification(title, options)
  }

  async showWishlistNotification(productData) {
    const title = 'Price Drop Alert!'
    const options = {
      body: `${productData.name} is now ${productData.discountPercentage}% off!`,
      icon: '/wishlist-icon.png',
      tag: `wishlist-${productData.id}`,
      data: {
        type: 'wishlist',
        productId: productData.id,
        url: `/products/${productData.id}`
      },
      actions: [
        {
          action: 'view',
          title: 'View Product',
          icon: '/view-icon.png'
        },
        {
          action: 'buy',
          title: 'Buy Now',
          icon: '/cart-icon.png'
        }
      ]
    }

    return await this.showNotification(title, options)
  }

  async showCartReminderNotification(cartData) {
    const title = 'Don\'t forget your cart!'
    const options = {
      body: `You have ${cartData.itemCount} items waiting for you`,
      icon: '/cart-icon.png',
      tag: 'cart-reminder',
      data: {
        type: 'cart',
        url: '/cart'
      },
      actions: [
        {
          action: 'view-cart',
          title: 'View Cart',
          icon: '/cart-icon.png'
        },
        {
          action: 'checkout',
          title: 'Checkout',
          icon: '/checkout-icon.png'
        }
      ]
    }

    return await this.showNotification(title, options)
  }

  // Notification scheduling
  scheduleNotification(title, options, delay) {
    setTimeout(() => {
      if (navigator.onLine && this.permission === 'granted') {
        this.showNotification(title, options)
      } else {
        this.queueNotification(title, options)
      }
    }, delay)
  }

  // Periodic notifications (for cart reminders, etc.)
  startPeriodicNotifications() {
    // Cart reminder every 24 hours
    setInterval(async () => {
      try {
        const cartData = await this.getCartData()
        if (cartData && cartData.itemCount > 0) {
          await this.showCartReminderNotification(cartData)
        }
      } catch (error) {
        console.error('Error in periodic cart reminder:', error)
      }
    }, 24 * 60 * 60 * 1000) // 24 hours

    // Check for promotions every 6 hours
    setInterval(async () => {
      try {
        await this.checkForPromotions()
      } catch (error) {
        console.error('Error checking promotions:', error)
      }
    }, 6 * 60 * 60 * 1000) // 6 hours
  }

  // Helper methods
  async getCartData() {
    try {
      const response = await fetch('http://localhost:5001/api/cart', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      return await response.json()
    } catch (error) {
      return null
    }
  }

  async checkForPromotions() {
    try {
      const response = await fetch('http://localhost:5001/api/promotions/active', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      const promotions = await response.json()
      
      for (const promo of promotions) {
        if (promo.sendNotification) {
          await this.showPromoNotification(promo)
        }
      }
    } catch (error) {
      console.error('Error checking promotions:', error)
    }
  }

  urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4)
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/')

    const rawData = window.atob(base64)
    const outputArray = new Uint8Array(rawData.length)

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i)
    }
    return outputArray
  }

  // Unsubscribe from push notifications
  async unsubscribe() {
    try {
      if (this.subscription) {
        await this.subscription.unsubscribe()
        this.subscription = null
        console.log('✅ Unsubscribed from push notifications')
      }
    } catch (error) {
      console.error('❌ Error unsubscribing:', error)
    }
  }

  // Get subscription status
  getStatus() {
    return {
      permission: this.permission,
      subscribed: !!this.subscription,
      queuedNotifications: this.notificationQueue.length
    }
  }
}

// Export singleton instance
export const notificationService = new NotificationService()
export default notificationService
