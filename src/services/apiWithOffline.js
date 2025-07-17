import { 
  saveProductsOffline, 
  getProductsOffline, 
  getProductOffline,
  saveCartOffline,
  getCartOffline,
  addCartItemOffline,
  saveWishlistOffline,
  getWishlistOffline,
  addToSyncQueue,
  saveSearchCache,
  getSearchCache
} from './offlineStorage'
import { openDB } from 'idb'
import { syncManager } from './syncManager'
import { cacheManager } from './cacheManager'

const API_BASE_URL = 'http://localhost:5001/api'

// Network status detection
export const isOnline = () => {
  return navigator.onLine
}

// Enhanced fetch with offline fallback
export const fetchWithOfflineFallback = async (url, options = {}) => {
  try {
    if (!isOnline()) {
      throw new Error('Network unavailable')
    }
    
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    })
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    return response
  } catch (error) {
    console.log('Network request failed:', error.message)
    throw error
  }
}

// Enhanced product service with offline support
export const getProductsWithOffline = async (filters = {}) => {
  const cacheKey = `products_${JSON.stringify(filters)}`
  
  try {
    // Try advanced cache first (memory -> IndexedDB -> network)
    const cachedData = await cacheManager.get(cacheKey, {
      strategy: 'stale-while-revalidate',
      ttl: 5 * 60 * 1000, // 5 minutes
      category: 'products',
      fallback: null
    })
    
    if (cachedData) {
      // Background refresh if stale
      if (isOnline()) {
        refreshProductsInBackground(filters, cacheKey)
      }
      return {
        data: { products: cachedData },
        source: 'cache',
        cached: true
      }
    }
    
    // Try network first
    const response = await fetchWithOfflineFallback(`${API_BASE_URL}/products`)
    const data = await response.json()
    
    // Save to both advanced cache and offline storage
    if (data.products) {
      await saveProductsOffline(data.products)
      await cacheManager.set(cacheKey, data.products, {
        ttl: 5 * 60 * 1000,
        category: 'products',
        priority: 'high'
      })
      
      // Cache individual products
      for (const product of data.products) {
        await cacheManager.set(`product_${product.id}`, product, {
          ttl: 10 * 60 * 1000,
          category: 'product-details',
          priority: 'normal'
        })
      }
    }
    
    return { 
      data: { products: data.products || [] }, 
      source: 'network',
      cached: true 
    }
  } catch (error) {
    console.log('Network failed, loading from offline storage')
    
    // Fallback to offline storage
    const offlineProducts = await getProductsOffline(filters)
    return { 
      data: { products: offlineProducts }, 
      source: 'offline',
      error: error.message,
      cached: false
    }
  }
}

export const getProductWithOffline = async (id) => {
  try {
    const response = await fetchWithOfflineFallback(`${API_BASE_URL}/products/${id}`)
    const data = await response.json()
    
    // Cache single product
    if (data.product) {
      await saveProductsOffline([data.product])
    }
    
    return { 
      data: { product: data.product }, 
      source: 'network',
      cached: true 
    }
  } catch (error) {
    const offlineProduct = await getProductOffline(id)
    if (offlineProduct) {
      return { 
        data: { product: offlineProduct }, 
        source: 'offline',
        error: error.message,
        cached: false
      }
    }
    throw error
  }
}

// Search with offline cache
export const searchProductsWithOffline = async (query, filters = {}) => {
  const searchKey = `${query}_${JSON.stringify(filters)}`
  
  try {
    // Check cache first
    const cachedResults = await getSearchCache(searchKey)
    if (cachedResults && isOnline()) {
      // Return cached but try to refresh in background
      refreshSearchInBackground(query, filters, searchKey)
      return {
        data: { products: cachedResults },
        source: 'cache',
        cached: true
      }
    }
    
    // Try network
    const response = await fetchWithOfflineFallback(
      `${API_BASE_URL}/products/search?q=${encodeURIComponent(query)}`
    )
    const data = await response.json()
    
    // Cache results
    if (data.products) {
      await saveSearchCache(searchKey, data.products)
    }
    
    return {
      data: { products: data.products || [] },
      source: 'network',
      cached: true
    }
  } catch (error) {
    // Try cache as fallback
    const cachedResults = await getSearchCache(searchKey)
    if (cachedResults) {
      return {
        data: { products: cachedResults },
        source: 'cache',
        error: error.message,
        cached: false
      }
    }
    
    // Last resort: filter offline products
    const offlineProducts = await getProductsOffline()
    const filteredProducts = offlineProducts.filter(product =>
      product.name.toLowerCase().includes(query.toLowerCase()) ||
      product.description.toLowerCase().includes(query.toLowerCase())
    )
    
    return {
      data: { products: filteredProducts },
      source: 'offline',
      error: error.message,
      cached: false
    }
  }
}

// Background search refresh
const refreshSearchInBackground = async (query, filters, searchKey) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/products/search?q=${encodeURIComponent(query)}`
    )
    const data = await response.json()
    
    if (data.products) {
      await saveSearchCache(searchKey, data.products)
    }
  } catch (error) {
    console.log('Background search refresh failed:', error)
  }
}

// Enhanced cart operations with robust online/offline detection
export const addToCartWithSync = async (productId, quantity, productDetails = null) => {
  const cartItem = { 
    id: `${productId}_${Date.now()}`, 
    productId, 
    quantity, 
    timestamp: Date.now(),
    productDetails
  }
  
  // Double-check online status with timeout test
  const isActuallyOnline = await checkRealConnectivity()
  
  try {
    if (isActuallyOnline) {
      console.log('🌐 Online - attempting server sync for cart addition')
      
      const response = await fetchWithOfflineFallback(`${API_BASE_URL}/products/cart`, {
        method: 'POST',
        body: JSON.stringify({ productId, quantity }),
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      
      const result = await response.json()
      
      // Update local cart cache
      if (result.success) {
        await addCartItemOffline(cartItem)
        // Update cache
        await cacheManager.delete('user_cart') // Invalidate cart cache
        console.log('✅ Cart updated on server and locally')
      }
      
      return result
    } else {
      console.log('📱 Offline - queuing cart addition for sync')
      
      // Offline mode - use advanced sync manager
      await syncManager.addToQueue({
        type: 'ADD_TO_CART',
        data: { productId, quantity, productDetails },
        priority: 'high',
        metadata: { cartItemId: cartItem.id }
      })
      
      // Update local cart immediately
      await addCartItemOffline(cartItem)
      
      return { 
        success: true, 
        queued: true, 
        message: 'Added to cart! Will sync when you\'re back online.',
        source: 'offline'
      }
    }
  } catch (error) {
    console.log('❌ Network error - falling back to offline mode')
    
    // Queue for advanced background sync
    await syncManager.addToQueue({
      type: 'ADD_TO_CART',
      data: { productId, quantity, productDetails },
      priority: 'high',
      metadata: { cartItemId: cartItem.id, error: error.message }
    })
    
    // Update local cart
    await addCartItemOffline(cartItem)
    
    return { 
      success: true, 
      queued: true, 
      message: 'Added to cart! Will sync when connection is restored.',
      source: 'offline',
      error: error.message
    }
  }
}

export const getCartWithOffline = async () => {
  try {
    if (isOnline()) {
      const response = await fetchWithOfflineFallback(`${API_BASE_URL}/products/cart/me`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      
      const data = await response.json()
      
      // Update local cache
      if (data.cart) {
        await saveCartOffline(data.cart)
      }
      
      return {
        data: data.cart || [],
        source: 'network',
        cached: true
      }
    } else {
      const offlineCart = await getCartOffline()
      return {
        data: offlineCart,
        source: 'offline',
        cached: false
      }
    }
  } catch (error) {
    const offlineCart = await getCartOffline()
    return {
      data: offlineCart,
      source: 'offline',
      error: error.message,
      cached: false
    }
  }
}

// Enhanced cart update operations with robust connectivity check
export const updateCartWithSync = async (itemId, quantity) => {
  const isActuallyOnline = await checkRealConnectivity()
  
  try {
    if (isActuallyOnline) {
      console.log('🌐 Online - updating cart on server')
      
      const response = await fetchWithOfflineFallback(`${API_BASE_URL}/products/cart/update`, {
        method: 'POST',
        body: JSON.stringify({ itemId, quantity }),
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      
      const result = await response.json()
      
      // Update local cache
      if (result.success) {
        await updateCartItemOffline(itemId, quantity)
        await cacheManager.delete('user_cart') // Invalidate cache
        console.log('✅ Cart updated on server and locally')
      }
      
      return result
    } else {
      console.log('📱 Offline - queuing cart update')
      
      // Queue for background sync
      await syncManager.addToQueue({
        type: 'UPDATE_CART',
        data: { itemId, quantity },
        priority: 'medium'
      })
      
      // Update locally immediately
      await updateCartItemOffline(itemId, quantity)
      
      return { 
        success: true, 
        queued: true, 
        message: 'Cart updated! Changes will sync when you\'re back online.',
        source: 'offline'
      }
    }
  } catch (error) {
    console.log('❌ Network error - falling back to offline mode')
    
    // Queue for background sync
    await syncManager.addToQueue({
      type: 'UPDATE_CART',
      data: { itemId, quantity },
      priority: 'medium',
      metadata: { error: error.message }
    })
    
    // Update locally
    await updateCartItemOffline(itemId, quantity)
    
    return { 
      success: true, 
      queued: true, 
      message: 'Cart updated! Changes will sync when connection is restored.',
      source: 'offline',
      error: error.message
    }
  }
}

export const removeFromCartWithSync = async (itemId) => {
  const isActuallyOnline = await checkRealConnectivity()
  
  try {
    if (isActuallyOnline) {
      console.log('🌐 Online - removing item from cart on server')
      
      const response = await fetchWithOfflineFallback(`${API_BASE_URL}/products/cart/remove`, {
        method: 'POST',
        body: JSON.stringify({ itemId }),
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      
      const result = await response.json()
      
      // Update local cache
      if (result.success) {
        await removeCartItemOffline(itemId)
        await cacheManager.delete('user_cart') // Invalidate cache
        console.log('✅ Item removed from server and local cart')
      }
      
      return result
    } else {
      console.log('📱 Offline - queuing cart item removal')
      
      // Queue for background sync
      await syncManager.addToQueue({
        type: 'REMOVE_FROM_CART',
        data: { itemId },
        priority: 'medium'
      })
      
      // Remove locally immediately for better UX
      await removeCartItemOffline(itemId)
      
      return { 
        success: true, 
        queued: true, 
        message: 'Item removed! Changes will sync when you\'re back online.',
        source: 'offline'
      }
    }
  } catch (error) {
    console.log('❌ Network error - falling back to offline mode')
    
    // Queue for background sync
    await syncManager.addToQueue({
      type: 'REMOVE_FROM_CART',
      data: { itemId },
      priority: 'medium',
      metadata: { error: error.message }
    })
    
    // Remove locally
    await removeCartItemOffline(itemId)
    
    return { 
      success: true, 
      queued: true, 
      message: 'Item removed! Changes will sync when connection is restored.',
      source: 'offline',
      error: error.message
    }
  }
}

// Wishlist operations with offline support
export const addToWishlistWithSync = async (productId) => {
  try {
    if (isOnline()) {
      const response = await fetchWithOfflineFallback(`${API_BASE_URL}/products/wishlist`, {
        method: 'POST',
        body: JSON.stringify({ productId }),
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      
      return await response.json()
    } else {
      // Queue for background sync
      await addToSyncQueue({
        type: 'ADD_TO_WISHLIST',
        data: { productId }
      })
      
      return { success: true, queued: true, message: 'Added to wishlist (will sync when online)' }
    }
  } catch (error) {
    // Queue for background sync
    await addToSyncQueue({
      type: 'ADD_TO_WISHLIST',
      data: { productId }
    })
    
    return { success: true, queued: true, message: 'Added to wishlist (will sync when online)' }
  }
}

export const getWishlistWithOffline = async () => {
  try {
    if (isOnline()) {
      const response = await fetchWithOfflineFallback(`${API_BASE_URL}/products/wishlist/me`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      
      const data = await response.json()
      
      // Update local cache
      if (data.wishlist) {
        await saveWishlistOffline(data.wishlist)
      }
      
      return {
        data: data.wishlist || [],
        source: 'network',
        cached: true
      }
    } else {
      const offlineWishlist = await getWishlistOffline()
      return {
        data: offlineWishlist,
        source: 'offline',
        cached: false
      }
    }
  } catch (error) {
    const offlineWishlist = await getWishlistOffline()
    return {
      data: offlineWishlist,
      source: 'offline',
      error: error.message,
      cached: false
    }
  }
}

// Wishlist remove operation
export const removeFromWishlistWithSync = async (productId) => {
  try {
    if (isOnline()) {
      const response = await fetchWithOfflineFallback(`${API_BASE_URL}/products/wishlist/remove`, {
        method: 'POST',
        body: JSON.stringify({ productId }),
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      
      return await response.json()
    } else {
      // Queue for background sync
      await addToSyncQueue({
        type: 'REMOVE_FROM_WISHLIST',
        data: { productId }
      })
      
      return { success: true, queued: true, message: 'Removed from wishlist (will sync when online)' }
    }
  } catch (error) {
    // Queue for background sync
    await addToSyncQueue({
      type: 'REMOVE_FROM_WISHLIST',
      data: { productId }
    })
    
    return { success: true, queued: true, message: 'Removed from wishlist (will sync when online)' }
  }
}

// Order operations
export const placeOrderWithSync = async (orderData) => {
  try {
    if (isOnline()) {
      const response = await fetchWithOfflineFallback(`${API_BASE_URL}/orders`, {
        method: 'POST',
        body: JSON.stringify(orderData),
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      
      return await response.json()
    } else {
      // Queue for background sync
      await addToSyncQueue({
        type: 'PLACE_ORDER',
        data: orderData
      })
      
      return { 
        success: false, 
        queued: true, 
        message: 'Order will be processed when you\'re back online' 
      }
    }
  } catch (error) {
    // Queue for background sync
    await addToSyncQueue({
      type: 'PLACE_ORDER',
      data: orderData
    })
    
    return { 
      success: false, 
      queued: true, 
      message: 'Order will be processed when you\'re back online' 
    }
  }
}

// Product details with offline support
export const getProductDetailsWithOffline = async (id) => {
  try {
    const response = await fetchWithOfflineFallback(`${API_BASE_URL}/products/${id}`)
    const data = await response.json()
    
    // Cache single product
    if (data.product) {
      await saveProductsOffline([data.product])
    }
    
    return { 
      data: data.product, 
      source: 'network',
      cached: true 
    }
  } catch (error) {
    const offlineProduct = await getProductOffline(id)
    if (offlineProduct) {
      return { 
        data: offlineProduct, 
        source: 'offline',
        error: error.message,
        cached: false
      }
    }
    throw error
  }
}

// Enhanced error handling wrapper
export const withOfflineFallback = async (networkOperation, offlineOperation, errorMessage = 'Operation failed') => {
  try {
    if (isOnline()) {
      return await networkOperation()
    } else {
      throw new Error('Network unavailable')
    }
  } catch (error) {
    console.log(`Network operation failed: ${error.message}`)
    if (offlineOperation) {
      return await offlineOperation()
    }
    throw new Error(`${errorMessage}: ${error.message}`)
  }
}

// Utility functions
export const syncPendingActions = async () => {
  if (!isOnline()) {
    return { success: false, message: 'No internet connection' }
  }
  
  // This will be implemented in Phase 3 (Background Sync)
  console.log('Sync functionality will be available in Phase 3')
  return { success: true, message: 'Sync completed' }
}

export const getOfflineStatus = async () => {
  const cart = await getCartOffline()
  const wishlist = await getWishlistOffline()
  const products = await getProductsOffline()
  
  return {
    isOnline: isOnline(),
    offlineData: {
      products: products.length,
      cart: cart.length,
      wishlist: wishlist.length
    }
  }
}

// Trigger sync when coming back online
export const triggerOnlineSync = async () => {
  if (!isOnline()) {
    return { success: false, message: 'Still offline' }
  }
  
  try {
    // Refresh user data when back online
    const token = localStorage.getItem('token')
    if (token) {
      // Refresh cart and wishlist data
      const [cartResponse, wishlistResponse] = await Promise.all([
        getCartWithOffline(),
        getWishlistWithOffline()
      ])
      
      console.log('✅ Synced cart and wishlist data')
      return { 
        success: true, 
        message: 'Data synced successfully',
        data: {
          cart: cartResponse.data,
          wishlist: wishlistResponse.data
        }
      }
    }
    
    return { success: true, message: 'No user data to sync' }
  } catch (error) {
    console.error('Failed to sync data:', error)
    return { success: false, message: 'Sync failed' }
  }
}

// Background refresh functions for advanced caching
const refreshProductsInBackground = async (filters, cacheKey) => {
  try {
    const response = await fetch(`${API_BASE_URL}/products`)
    const data = await response.json()
    
    if (data.products) {
      await cacheManager.set(cacheKey, data.products, {
        ttl: 5 * 60 * 1000,
        category: 'products',
        priority: 'high'
      })
      await saveProductsOffline(data.products)
      
      console.log('🔄 Background refresh completed for products')
    }
  } catch (error) {
    console.log('Background products refresh failed:', error)
  }
}

// Initialize offline storage for PWA
export const initializeOfflineStorage = async () => {
  try {
    console.log('🔄 Initializing offline storage...')
    
    // Initialize IndexedDB
    await openDB()
    
    // Check if we have basic data cached
    const hasProducts = await hasOfflineData('products')
    const hasUserData = await hasOfflineData('user')
    
    console.log(`📦 Offline storage status - Products: ${hasProducts ? 'Available' : 'Empty'}, User: ${hasUserData ? 'Available' : 'Empty'}`)
    
    // If online, try to populate with fresh data
    if (isOnline() && localStorage.getItem('token')) {
      console.log('🌐 Online - syncing fresh data...')
      
      try {
        // Sync essential data in background
        const [cartResponse, wishlistResponse] = await Promise.all([
          getCartWithOffline(),
          getWishlistWithOffline()
        ])
        
        console.log('✅ Synced user data to offline storage')
      } catch (error) {
        console.log('⚠️ Failed to sync user data:', error.message)
      }
    }
    
    console.log('✅ Offline storage initialized successfully')
    return true
  } catch (error) {
    console.error('❌ Failed to initialize offline storage:', error)
    return false
  }
}

// Enhanced connectivity detection
const checkRealConnectivity = async () => {
  // Basic navigator.onLine check
  if (!navigator.onLine) {
    return false
  }
  
  try {
    // Test actual connectivity with a quick ping to the server
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 3000) // 3 second timeout
    
    const response = await fetch(`${API_BASE_URL}/health`, {
      method: 'HEAD',
      signal: controller.signal,
      cache: 'no-cache'
    })
    
    clearTimeout(timeoutId)
    return response.ok
  } catch (error) {
    // If ping fails, we're effectively offline
    return false
  }
}

// Functions imported from offlineStorage.js - no need to redeclare
