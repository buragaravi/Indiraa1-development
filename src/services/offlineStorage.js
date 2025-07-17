import { openDB } from 'idb'

const DB_NAME = 'indiraa1-offline'
const DB_VERSION = 1

// Initialize IndexedDB
export const initDB = async () => {
  const db = await openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      // Products store
      if (!db.objectStoreNames.contains('products')) {
        const productsStore = db.createObjectStore('products', {
          keyPath: '_id'
        })
        productsStore.createIndex('category', 'category')
        productsStore.createIndex('featured', 'featured')
        productsStore.createIndex('price', 'price')
      }
      
      // Cart store
      if (!db.objectStoreNames.contains('cart')) {
        db.createObjectStore('cart', {
          keyPath: 'id'
        })
      }
      
      // User data store
      if (!db.objectStoreNames.contains('userData')) {
        db.createObjectStore('userData', {
          keyPath: 'type'
        })
      }
      
      // Sync queue store
      if (!db.objectStoreNames.contains('syncQueue')) {
        db.createObjectStore('syncQueue', {
          keyPath: 'id',
          autoIncrement: true
        })
      }
      
      // Search cache
      if (!db.objectStoreNames.contains('searchCache')) {
        const searchStore = db.createObjectStore('searchCache', {
          keyPath: 'query'
        })
        searchStore.createIndex('timestamp', 'timestamp')
      }

      // Wishlist store
      if (!db.objectStoreNames.contains('wishlist')) {
        db.createObjectStore('wishlist', {
          keyPath: '_id'
        })
      }
    }
  })
  return db
}

// Products offline management
export const saveProductsOffline = async (products) => {
  try {
    const db = await initDB()
    const tx = db.transaction('products', 'readwrite')
    
    for (const product of products) {
      await tx.store.put({
        ...product,
        cachedAt: Date.now()
      })
    }
    
    await tx.done
    console.log(`Saved ${products.length} products offline`)
  } catch (error) {
    console.error('Failed to save products offline:', error)
  }
}

export const getProductsOffline = async (filters = {}) => {
  try {
    const db = await initDB()
    let products = await db.getAll('products')
    
    // Apply filters
    if (filters.category) {
      products = products.filter(p => p.category === filters.category)
    }
    
    if (filters.featured) {
      products = products.filter(p => p.featured)
    }
    
    if (filters.maxPrice) {
      products = products.filter(p => p.price <= filters.maxPrice)
    }
    
    return products
  } catch (error) {
    console.error('Failed to get products offline:', error)
    return []
  }
}

export const getProductOffline = async (id) => {
  try {
    const db = await initDB()
    return await db.get('products', id)
  } catch (error) {
    console.error('Failed to get product offline:', error)
    return null
  }
}

// Cart offline management
export const saveCartOffline = async (cartItems) => {
  try {
    const db = await initDB()
    const tx = db.transaction('cart', 'readwrite')
    
    // Clear existing cart
    await tx.store.clear()
    
    // Save new cart items
    for (const item of cartItems) {
      await tx.store.put({
        ...item,
        updatedAt: Date.now()
      })
    }
    
    await tx.done
    console.log('Cart saved offline')
  } catch (error) {
    console.error('Failed to save cart offline:', error)
  }
}

export const getCartOffline = async () => {
  try {
    const db = await initDB()
    return await db.getAll('cart')
  } catch (error) {
    console.error('Failed to get cart offline:', error)
    return []
  }
}

export const addCartItemOffline = async (item) => {
  try {
    const db = await initDB()
    await db.put('cart', {
      ...item,
      id: item.id || Date.now(),
      updatedAt: Date.now()
    })
  } catch (error) {
    console.error('Failed to add cart item offline:', error)
  }
}

export const removeCartItemOffline = async (itemId) => {
  try {
    const db = await initDB()
    await db.delete('cart', itemId)
  } catch (error) {
    console.error('Failed to remove cart item offline:', error)
  }
}

// Wishlist offline management
export const saveWishlistOffline = async (wishlistItems) => {
  try {
    const db = await initDB()
    const tx = db.transaction('wishlist', 'readwrite')
    
    // Clear existing wishlist
    await tx.store.clear()
    
    // Save new wishlist items
    for (const item of wishlistItems) {
      await tx.store.put({
        ...item,
        cachedAt: Date.now()
      })
    }
    
    await tx.done
    console.log('Wishlist saved offline')
  } catch (error) {
    console.error('Failed to save wishlist offline:', error)
  }
}

export const getWishlistOffline = async () => {
  try {
    const db = await initDB()
    return await db.getAll('wishlist')
  } catch (error) {
    console.error('Failed to get wishlist offline:', error)
    return []
  }
}

// Sync queue management
export const addToSyncQueue = async (action) => {
  try {
    const db = await initDB()
    await db.add('syncQueue', {
      ...action,
      timestamp: Date.now(),
      retryCount: 0
    })
    console.log('Added to sync queue:', action.type)
  } catch (error) {
    console.error('Failed to add to sync queue:', error)
  }
}

export const getSyncQueue = async () => {
  try {
    const db = await initDB()
    return await db.getAll('syncQueue')
  } catch (error) {
    console.error('Failed to get sync queue:', error)
    return []
  }
}

export const removeSyncQueueItem = async (id) => {
  try {
    const db = await initDB()
    await db.delete('syncQueue', id)
  } catch (error) {
    console.error('Failed to remove sync queue item:', error)
  }
}

export const updateSyncQueueItem = async (id, updates) => {
  try {
    const db = await initDB()
    const item = await db.get('syncQueue', id)
    if (item) {
      await db.put('syncQueue', { ...item, ...updates })
    }
  } catch (error) {
    console.error('Failed to update sync queue item:', error)
  }
}

// Search cache management
export const saveSearchCache = async (query, results) => {
  try {
    const db = await initDB()
    await db.put('searchCache', {
      query,
      results,
      timestamp: Date.now()
    })
  } catch (error) {
    console.error('Failed to save search cache:', error)
  }
}

export const getSearchCache = async (query) => {
  try {
    const db = await initDB()
    const cached = await db.get('searchCache', query)
    
    // Check if cache is still valid (1 hour)
    if (cached && (Date.now() - cached.timestamp) < 3600000) {
      return cached.results
    }
    
    return null
  } catch (error) {
    console.error('Failed to get search cache:', error)
    return null
  }
}

// User data management
export const saveUserDataOffline = async (userData) => {
  try {
    const db = await initDB()
    await db.put('userData', {
      type: 'profile',
      data: userData,
      updatedAt: Date.now()
    })
  } catch (error) {
    console.error('Failed to save user data offline:', error)
  }
}

export const getUserDataOffline = async () => {
  try {
    const db = await initDB()
    const cached = await db.get('userData', 'profile')
    return cached ? cached.data : null
  } catch (error) {
    console.error('Failed to get user data offline:', error)
    return null
  }
}

// Database cleanup utilities
export const cleanupOldData = async () => {
  try {
    const db = await initDB()
    const oneWeekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000)
    
    // Clean old search cache
    const searchTx = db.transaction('searchCache', 'readwrite')
    const searchIndex = searchTx.store.index('timestamp')
    
    for await (const cursor of searchIndex.iterate()) {
      if (cursor.value.timestamp < oneWeekAgo) {
        cursor.delete()
      }
    }
    
    await searchTx.done
    console.log('Cleaned up old offline data')
  } catch (error) {
    console.error('Failed to cleanup old data:', error)
  }
}

// Get storage usage
export const getStorageUsage = async () => {
  try {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      const estimate = await navigator.storage.estimate()
      return {
        used: estimate.usage,
        available: estimate.quota,
        percentage: Math.round((estimate.usage / estimate.quota) * 100)
      }
    }
    return null
  } catch (error) {
    console.error('Failed to get storage usage:', error)
    return null
  }
}
