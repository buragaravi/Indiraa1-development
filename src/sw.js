// Minimal Service Worker for PWA (No Offline Features)
import { precacheAndRoute, cleanupOutdatedCaches } from 'workbox-precaching'
import { registerRoute } from 'workbox-routing'
import { CacheFirst } from 'workbox-strategies'
import { ExpirationPlugin } from 'workbox-expiration'

// Precache and route static assets
precacheAndRoute(self.__WB_MANIFEST)
cleanupOutdatedCaches()

// Minimal caching - only essential images
registerRoute(
  ({ request, url }) => 
    request.destination === 'image' || 
    /\.(png|gif|jpg|jpeg|svg|webp)$/i.test(url.pathname),
  new CacheFirst({
    cacheName: 'images-cache-v4',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 50,
        maxAgeSeconds: 60 * 60 * 24 * 3, // 3 days only
        purgeOnQuotaError: true
      })
    ]
  })
)

// Push Notification Handling (PWA Core Feature)
self.addEventListener('push', (event) => {
  console.log('📱 Push notification received:', event)
  
  if (!event.data) {
    return
  }

  try {
    const data = event.data.json()
    const { title, body, icon, badge, tag, data: notificationData, actions } = data

    const options = {
      body,
      icon: icon || '/pwa-192x192.png',
      badge: badge || '/pwa-192x192.png',
      tag: tag || 'default',
      data: notificationData,
      actions: actions || [],
      requireInteraction: data.requireInteraction || false,
      vibrate: [200, 100, 200],
      timestamp: Date.now()
    }

    event.waitUntil(
      self.registration.showNotification(title, options)
    )
  } catch (error) {
    console.error('❌ Error handling push notification:', error)
    
    // Fallback notification
    event.waitUntil(
      self.registration.showNotification('Indiraa1 Notification', {
        body: 'You have a new update!',
        icon: '/pwa-192x192.png',
        badge: '/pwa-192x192.png'
      })
    )
  }
})

// Notification Click Handling (PWA Core Feature)
self.addEventListener('notificationclick', (event) => {
  console.log('📱 Notification clicked:', event)
  
  event.notification.close()

  const { action, notification } = event
  const data = notification.data || {}

  let url = '/'

  // Handle different notification actions
  switch (action) {
    case 'view':
    case 'view-order':
      url = data.url || `/orders/${data.orderId || ''}`
      break
    case 'track':
      url = `/orders/${data.orderId}/track`
      break
    case 'shop':
      url = data.url || '/products'
      break
    case 'view-cart':
      url = '/cart'
      break
    case 'checkout':
      url = '/checkout'
      break
    default:
      url = data.url || '/'
  }

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Check if there's already a window/tab open with the target URL
      for (const client of clientList) {
        if (client.url === url && 'focus' in client) {
          return client.focus()
        }
      }
      
      // If no existing window, open a new one
      if (clients.openWindow) {
        return clients.openWindow(url)
      }
    })
  )
})

// PWA Installation Events
self.addEventListener('install', (event) => {
  console.log('🔧 Service Worker installing...')
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  console.log('🟢 Service Worker activated')
  event.waitUntil(clients.claim())
})

console.log('🚀 Minimal PWA Service Worker loaded successfully!')
