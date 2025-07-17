// Enhanced Service Worker for PWA Phase 2 & 3
import { precacheAndRoute, cleanupOutdatedCaches } from 'workbox-precaching'
import { registerRoute, NavigationRoute } from 'workbox-routing'
import { NetworkFirst, CacheFirst, StaleWhileRevalidate, NetworkOnly } from 'workbox-strategies'
import { ExpirationPlugin } from 'workbox-expiration'
import { BackgroundSyncPlugin } from 'workbox-background-sync'
import { BroadcastUpdatePlugin } from 'workbox-broadcast-update'

// Precache and route static assets
precacheAndRoute(self.__WB_MANIFEST)
cleanupOutdatedCaches()

// Advanced caching strategies
const API_BASE_URL = 'http://localhost:5001/api'

// 1. API Caching with Background Sync
const bgSyncPlugin = new BackgroundSyncPlugin('api-sync-queue', {
  maxRetentionTime: 24 * 60 // Retry for max of 24 Hours (specified in minutes)
})

// API Routes with Network First strategy and background sync
registerRoute(
  ({ url }) => url.origin === 'http://localhost:5001' && url.pathname.startsWith('/api/'),
  new NetworkFirst({
    cacheName: 'api-cache-v2',
    networkTimeoutSeconds: 10,
    plugins: [
      new ExpirationPlugin({
        maxEntries: 200,
        maxAgeSeconds: 60 * 60 * 24, // 24 hours
        purgeOnQuotaError: true
      }),
      new BroadcastUpdatePlugin(),
      bgSyncPlugin
    ]
  })
)

// 2. Product Images with Cache First
registerRoute(
  ({ request, url }) => 
    request.destination === 'image' || 
    /\.(png|gif|jpg|jpeg|svg|webp)$/i.test(url.pathname),
  new CacheFirst({
    cacheName: 'images-cache-v2',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 500,
        maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
        purgeOnQuotaError: true
      })
    ]
  })
)

// 3. Static Assets with Stale While Revalidate
registerRoute(
  ({ request }) => 
    request.destination === 'script' ||
    request.destination === 'style' ||
    request.destination === 'font',
  new StaleWhileRevalidate({
    cacheName: 'static-assets-v2',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 100,
        maxAgeSeconds: 60 * 60 * 24 * 7, // 7 days
        purgeOnQuotaError: true
      })
    ]
  })
)

// 4. HTML Pages with Network First
registerRoute(
  ({ request }) => request.mode === 'navigate',
  new NetworkFirst({
    cacheName: 'pages-cache-v2',
    networkTimeoutSeconds: 3,
    plugins: [
      new ExpirationPlugin({
        maxEntries: 50,
        maxAgeSeconds: 60 * 60 * 24, // 24 hours
        purgeOnQuotaError: true
      })
    ]
  })
)

// Advanced Features for Phase 3

// Push Notification Handling
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
      icon: icon || '/icon-192.png',
      badge: badge || '/badge-72.png',
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
        icon: '/icon-192.png',
        badge: '/badge-72.png'
      })
    )
  }
})

// Notification Click Handling
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
    case 'buy':
      url = `/products/${data.productId || ''}`
      break
    case 'save':
      // Add to wishlist action
      url = `/wishlist?add=${data.productId || ''}`
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

// Background Sync for Offline Actions
self.addEventListener('sync', (event) => {
  console.log('🔄 Background sync event:', event.tag)

  switch (event.tag) {
    case 'sync-cart':
      event.waitUntil(syncCartData())
      break
    case 'sync-wishlist':
      event.waitUntil(syncWishlistData())
      break
    case 'sync-orders':
      event.waitUntil(syncOrderData())
      break
    case 'update-prices':
      event.waitUntil(updatePricesInBackground())
      break
    default:
      console.log(`Unknown sync tag: ${event.tag}`)
  }
})

// Periodic Background Sync (if supported)
self.addEventListener('periodicsync', (event) => {
  console.log('🔄 Periodic sync event:', event.tag)

  switch (event.tag) {
    case 'sync-cart':
      event.waitUntil(syncCartData())
      break
    case 'update-prices':
      event.waitUntil(updatePricesInBackground())
      break
    case 'sync-wishlist':
      event.waitUntil(syncWishlistData())
      break
    default:
      console.log(`Unknown periodic sync tag: ${event.tag}`)
  }
})

// Sync Functions
async function syncCartData() {
  try {
    console.log('🛒 Syncing cart data...')
    
    // Get offline cart data
    const cart = await getOfflineData('cart')
    if (!cart || cart.length === 0) {
      return
    }

    // Sync with server
    const response = await fetch(`${API_BASE_URL}/cart/sync`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${await getStoredToken()}`
      },
      body: JSON.stringify({ cartItems: cart })
    })

    if (response.ok) {
      console.log('✅ Cart sync successful')
      await clearOfflineData('cart')
      
      // Notify all clients
      await broadcastToClients({
        type: 'CART_SYNCED',
        data: await response.json()
      })
    }
  } catch (error) {
    console.error('❌ Cart sync failed:', error)
  }
}

async function syncWishlistData() {
  try {
    console.log('❤️ Syncing wishlist data...')
    
    const wishlist = await getOfflineData('wishlist')
    if (!wishlist || wishlist.length === 0) {
      return
    }

    const response = await fetch(`${API_BASE_URL}/wishlist/sync`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${await getStoredToken()}`
      },
      body: JSON.stringify({ wishlistItems: wishlist })
    })

    if (response.ok) {
      console.log('✅ Wishlist sync successful')
      await clearOfflineData('wishlist')
      
      await broadcastToClients({
        type: 'WISHLIST_SYNCED',
        data: await response.json()
      })
    }
  } catch (error) {
    console.error('❌ Wishlist sync failed:', error)
  }
}

async function syncOrderData() {
  try {
    console.log('📦 Syncing order data...')
    
    const orders = await getOfflineData('pending-orders')
    if (!orders || orders.length === 0) {
      return
    }

    for (const order of orders) {
      try {
        const response = await fetch(`${API_BASE_URL}/orders`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${await getStoredToken()}`
          },
          body: JSON.stringify(order)
        })

        if (response.ok) {
          console.log(`✅ Order ${order.id} synced successfully`)
          await removeOfflineOrderData(order.id)
          
          // Show success notification
          await self.registration.showNotification('Order Placed!', {
            body: `Your order #${order.id} has been placed successfully`,
            icon: '/icon-192.png',
            tag: `order-${order.id}`,
            data: { type: 'order', orderId: order.id, url: `/orders/${order.id}` },
            actions: [
              { action: 'view', title: 'View Order' },
              { action: 'track', title: 'Track Package' }
            ]
          })
        }
      } catch (error) {
        console.error(`❌ Failed to sync order ${order.id}:`, error)
      }
    }
  } catch (error) {
    console.error('❌ Order sync failed:', error)
  }
}

async function updatePricesInBackground() {
  try {
    console.log('💰 Updating prices in background...')
    
    // Get cached products
    const cache = await caches.open('api-cache-v2')
    const cachedRequests = await cache.keys()
    
    for (const request of cachedRequests) {
      if (request.url.includes('/products')) {
        // Fetch fresh data
        const response = await fetch(request)
        if (response.ok) {
          await cache.put(request, response.clone())
        }
      }
    }
    
    await broadcastToClients({
      type: 'PRICES_UPDATED',
      timestamp: Date.now()
    })
    
    console.log('✅ Price update completed')
  } catch (error) {
    console.error('❌ Price update failed:', error)
  }
}

// Utility Functions
async function getOfflineData(storeName) {
  return new Promise((resolve) => {
    const request = indexedDB.open('indiraa1-offline', 1)
    
    request.onsuccess = () => {
      const db = request.result
      const transaction = db.transaction([storeName], 'readonly')
      const store = transaction.objectStore(storeName)
      const getAll = store.getAll()
      
      getAll.onsuccess = () => resolve(getAll.result)
      getAll.onerror = () => resolve([])
    }
    
    request.onerror = () => resolve([])
  })
}

async function clearOfflineData(storeName) {
  return new Promise((resolve) => {
    const request = indexedDB.open('indiraa1-offline', 1)
    
    request.onsuccess = () => {
      const db = request.result
      const transaction = db.transaction([storeName], 'readwrite')
      const store = transaction.objectStore(storeName)
      const clear = store.clear()
      
      clear.onsuccess = () => resolve()
      clear.onerror = () => resolve()
    }
    
    request.onerror = () => resolve()
  })
}

async function removeOfflineOrderData(orderId) {
  return new Promise((resolve) => {
    const request = indexedDB.open('indiraa1-offline', 1)
    
    request.onsuccess = () => {
      const db = request.result
      const transaction = db.transaction(['pending-orders'], 'readwrite')
      const store = transaction.objectStore('pending-orders')
      const deleteRequest = store.delete(orderId)
      
      deleteRequest.onsuccess = () => resolve()
      deleteRequest.onerror = () => resolve()
    }
    
    request.onerror = () => resolve()
  })
}

async function getStoredToken() {
  // Get token from storage
  const clients = await self.clients.matchAll()
  if (clients.length > 0) {
    return new Promise((resolve) => {
      clients[0].postMessage({ type: 'GET_TOKEN' })
      
      const handleMessage = (event) => {
        if (event.data.type === 'TOKEN_RESPONSE') {
          self.removeEventListener('message', handleMessage)
          resolve(event.data.token)
        }
      }
      
      self.addEventListener('message', handleMessage)
      
      // Timeout fallback
      setTimeout(() => {
        self.removeEventListener('message', handleMessage)
        resolve(null)
      }, 1000)
    })
  }
  return null
}

async function broadcastToClients(message) {
  const clients = await self.clients.matchAll()
  clients.forEach(client => {
    client.postMessage(message)
  })
}

// Handle messages from main thread
self.addEventListener('message', (event) => {
  console.log('📨 Service worker received message:', event.data)
  
  const { type, data } = event.data
  
  switch (type) {
    case 'SKIP_WAITING':
      self.skipWaiting()
      break
    case 'GET_TOKEN':
      // This is handled in getStoredToken function
      break
    case 'CACHE_PRODUCT':
      cacheProductData(data)
      break
    case 'CACHE_IMAGES':
      cacheImageData(data)
      break
    default:
      console.log(`Unknown message type: ${type}`)
  }
})

async function cacheProductData(productData) {
  try {
    const cache = await caches.open('api-cache-v2')
    const response = new Response(JSON.stringify({ products: [productData] }), {
      headers: { 'Content-Type': 'application/json' }
    })
    
    await cache.put(`${API_BASE_URL}/products/${productData.id}`, response)
    console.log(`📦 Cached product: ${productData.id}`)
  } catch (error) {
    console.error('❌ Failed to cache product:', error)
  }
}

async function cacheImageData(imageUrls) {
  try {
    const cache = await caches.open('images-cache-v2')
    
    for (const url of imageUrls) {
      try {
        const response = await fetch(url)
        if (response.ok) {
          await cache.put(url, response)
          console.log(`🖼️ Cached image: ${url}`)
        }
      } catch (error) {
        console.error(`❌ Failed to cache image ${url}:`, error)
      }
    }
  } catch (error) {
    console.error('❌ Failed to cache images:', error)
  }
}

// Error handling
self.addEventListener('error', (event) => {
  console.error('❌ Service worker error:', event.error)
})

self.addEventListener('unhandledrejection', (event) => {
  console.error('❌ Service worker unhandled rejection:', event.reason)
})

console.log('✅ Enhanced Service Worker loaded successfully')
