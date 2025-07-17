// Enhanced Background Sync Manager for Phase 2
import { openDB } from 'idb'
import { isOnline } from './apiWithOffline'

class SyncManager {
  constructor() {
    this.dbName = 'indiraa1-sync'
    this.version = 1
    this.db = null
    this.syncInProgress = false
    this.retryDelays = [1000, 5000, 15000, 30000, 60000] // Progressive delays
    this.maxRetries = 5
    this.listeners = new Set()
  }

  // Initialize the sync database
  async init() {
    try {
      this.db = await openDB(this.dbName, this.version, {
        upgrade(db) {
          // Sync queue store
          if (!db.objectStoreNames.contains('syncQueue')) {
            const syncStore = db.createObjectStore('syncQueue', { keyPath: 'id' })
            syncStore.createIndex('timestamp', 'timestamp')
            syncStore.createIndex('priority', 'priority')
            syncStore.createIndex('type', 'type')
            syncStore.createIndex('status', 'status')
          }

          // Sync history store
          if (!db.objectStoreNames.contains('syncHistory')) {
            const historyStore = db.createObjectStore('syncHistory', { keyPath: 'id' })
            historyStore.createIndex('timestamp', 'timestamp')
            historyStore.createIndex('success', 'success')
          }

          // Conflict resolution store
          if (!db.objectStoreNames.contains('conflicts')) {
            const conflictStore = db.createObjectStore('conflicts', { keyPath: 'id' })
            conflictStore.createIndex('timestamp', 'timestamp')
            conflictStore.createIndex('resolved', 'resolved')
          }
        }
      })
      
      console.log('✅ SyncManager initialized')
      
      // Start background sync if online
      if (isOnline()) {
        this.startPeriodicSync()
      }
      
      // Listen for online events
      window.addEventListener('online', () => this.handleOnline())
      window.addEventListener('offline', () => this.handleOffline())
      
    } catch (error) {
      console.error('❌ Failed to initialize SyncManager:', error)
    }
  }

  // Add action to sync queue
  async addToQueue(action) {
    if (!this.db) await this.init()
    
    const syncItem = {
      id: `${action.type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: action.type,
      data: action.data,
      priority: action.priority || 'normal', // high, normal, low
      timestamp: Date.now(),
      retries: 0,
      status: 'pending', // pending, processing, completed, failed
      metadata: action.metadata || {},
      dependencies: action.dependencies || []
    }

    try {
      const tx = this.db.transaction('syncQueue', 'readwrite')
      await tx.store.add(syncItem)
      await tx.done
      
      console.log('📝 Added to sync queue:', syncItem.type)
      this.notifyListeners('itemAdded', syncItem)
      
      // Try immediate sync if online
      if (isOnline()) {
        this.processSyncQueue()
      }
      
      return syncItem.id
    } catch (error) {
      console.error('❌ Failed to add to sync queue:', error)
      throw error
    }
  }

  // Process sync queue
  async processSyncQueue() {
    if (!this.db || this.syncInProgress) return
    
    this.syncInProgress = true
    this.notifyListeners('syncStarted')
    
    try {
      const tx = this.db.transaction('syncQueue', 'readonly')
      const items = await tx.store.index('timestamp').getAll()
      
      // Filter pending items and sort by priority and timestamp
      const pendingItems = items
        .filter(item => item.status === 'pending')
        .sort((a, b) => {
          const priorityOrder = { high: 3, normal: 2, low: 1 }
          const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority]
          return priorityDiff !== 0 ? priorityDiff : a.timestamp - b.timestamp
        })

      console.log(`🔄 Processing ${pendingItems.length} sync items`)
      
      let successCount = 0
      let failureCount = 0
      
      for (const item of pendingItems) {
        try {
          await this.processSyncItem(item)
          successCount++
        } catch (error) {
          console.error(`❌ Failed to sync item ${item.id}:`, error)
          failureCount++
        }
      }
      
      console.log(`✅ Sync completed: ${successCount} success, ${failureCount} failed`)
      this.notifyListeners('syncCompleted', { successCount, failureCount })
      
    } catch (error) {
      console.error('❌ Sync queue processing failed:', error)
      this.notifyListeners('syncFailed', error)
    } finally {
      this.syncInProgress = false
    }
  }

  // Process individual sync item
  async processSyncItem(item) {
    const startTime = Date.now()
    
    try {
      // Mark as processing
      await this.updateSyncItemStatus(item.id, 'processing')
      
      // Execute the sync action
      const result = await this.executeSyncAction(item)
      
      // Mark as completed
      await this.updateSyncItemStatus(item.id, 'completed')
      await this.removeSyncItem(item.id)
      
      // Add to history
      await this.addToHistory({
        id: item.id,
        type: item.type,
        timestamp: Date.now(),
        duration: Date.now() - startTime,
        success: true,
        result: result
      })
      
      this.notifyListeners('itemSynced', { item, result })
      
    } catch (error) {
      const newRetries = item.retries + 1
      
      if (newRetries < this.maxRetries) {
        // Schedule retry
        await this.scheduleRetry(item, newRetries, error)
      } else {
        // Mark as failed
        await this.updateSyncItemStatus(item.id, 'failed')
        await this.addToHistory({
          id: item.id,
          type: item.type,
          timestamp: Date.now(),
          duration: Date.now() - startTime,
          success: false,
          error: error.message
        })
        
        this.notifyListeners('itemFailed', { item, error })
      }
      
      throw error
    }
  }

  // Execute sync action based on type
  async executeSyncAction(item) {
    const { type, data } = item
    
    switch (type) {
      case 'ADD_TO_CART':
        return await this.syncAddToCart(data)
      case 'REMOVE_FROM_CART':
        return await this.syncRemoveFromCart(data)
      case 'UPDATE_CART':
        return await this.syncUpdateCart(data)
      case 'ADD_TO_WISHLIST':
        return await this.syncAddToWishlist(data)
      case 'REMOVE_FROM_WISHLIST':
        return await this.syncRemoveFromWishlist(data)
      case 'PLACE_ORDER':
        return await this.syncPlaceOrder(data)
      case 'UPDATE_PROFILE':
        return await this.syncUpdateProfile(data)
      case 'SUBMIT_REVIEW':
        return await this.syncSubmitReview(data)
      default:
        throw new Error(`Unknown sync action type: ${type}`)
    }
  }

  // Sync implementations for different actions
  async syncAddToCart(data) {
    const response = await fetch('http://localhost:5001/api/products/cart/add', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(data)
    })
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }
    
    return await response.json()
  }

  async syncRemoveFromCart(data) {
    const response = await fetch('http://localhost:5001/api/products/cart/remove', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(data)
    })
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }
    
    return await response.json()
  }

  async syncUpdateCart(data) {
    const response = await fetch('http://localhost:5001/api/products/cart/update', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(data)
    })
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }
    
    return await response.json()
  }

  async syncAddToWishlist(data) {
    const response = await fetch('http://localhost:5001/api/products/wishlist/add', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(data)
    })
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }
    
    return await response.json()
  }

  async syncRemoveFromWishlist(data) {
    const response = await fetch('http://localhost:5001/api/products/wishlist/remove', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(data)
    })
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }
    
    return await response.json()
  }

  async syncPlaceOrder(data) {
    const response = await fetch('http://localhost:5001/api/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(data)
    })
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }
    
    return await response.json()
  }

  async syncUpdateProfile(data) {
    const response = await fetch('http://localhost:5001/api/auth/profile', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(data)
    })
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }
    
    return await response.json()
  }

  async syncSubmitReview(data) {
    const response = await fetch(`http://localhost:5001/api/products/${data.productId}/reviews`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(data)
    })
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }
    
    return await response.json()
  }

  // Utility methods
  async updateSyncItemStatus(id, status) {
    if (!this.db) return
    
    const tx = this.db.transaction('syncQueue', 'readwrite')
    const item = await tx.store.get(id)
    if (item) {
      item.status = status
      item.lastUpdated = Date.now()
      await tx.store.put(item)
    }
    await tx.done
  }

  async scheduleRetry(item, retries, error) {
    if (!this.db) return
    
    const delay = this.retryDelays[Math.min(retries - 1, this.retryDelays.length - 1)]
    
    setTimeout(async () => {
      const tx = this.db.transaction('syncQueue', 'readwrite')
      const currentItem = await tx.store.get(item.id)
      if (currentItem && currentItem.status === 'processing') {
        currentItem.retries = retries
        currentItem.status = 'pending'
        currentItem.lastError = error.message
        currentItem.nextRetry = Date.now() + delay
        await tx.store.put(currentItem)
      }
      await tx.done
      
      // Try processing again
      if (isOnline()) {
        this.processSyncQueue()
      }
    }, delay)
  }

  async removeSyncItem(id) {
    if (!this.db) return
    
    const tx = this.db.transaction('syncQueue', 'readwrite')
    await tx.store.delete(id)
    await tx.done
  }

  async addToHistory(record) {
    if (!this.db) return
    
    try {
      const tx = this.db.transaction('syncHistory', 'readwrite')
      await tx.store.add(record)
      await tx.done
    } catch (error) {
      console.error('Failed to add sync history:', error)
    }
  }

  // Event handling
  async handleOnline() {
    console.log('🌐 Back online - starting sync')
    this.startPeriodicSync()
    this.processSyncQueue()
  }

  async handleOffline() {
    console.log('📱 Gone offline - stopping periodic sync')
    this.stopPeriodicSync()
  }

  startPeriodicSync() {
    if (this.syncInterval) return
    
    // Sync every 30 seconds when online
    this.syncInterval = setInterval(() => {
      if (isOnline()) {
        this.processSyncQueue()
      }
    }, 30000)
  }

  stopPeriodicSync() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval)
      this.syncInterval = null
    }
  }

  // Event listeners
  addListener(callback) {
    this.listeners.add(callback)
  }

  removeListener(callback) {
    this.listeners.delete(callback)
  }

  notifyListeners(event, data) {
    this.listeners.forEach(callback => {
      try {
        callback(event, data)
      } catch (error) {
        console.error('Listener callback error:', error)
      }
    })
  }

  // Public API methods
  async getSyncStatus() {
    if (!this.db) await this.init()
    
    const tx = this.db.transaction('syncQueue', 'readonly')
    const items = await tx.store.getAll()
    
    return {
      pending: items.filter(item => item.status === 'pending').length,
      processing: items.filter(item => item.status === 'processing').length,
      failed: items.filter(item => item.status === 'failed').length,
      isOnline: isOnline(),
      syncInProgress: this.syncInProgress
    }
  }

  async getSyncHistory(limit = 50) {
    if (!this.db) await this.init()
    
    const tx = this.db.transaction('syncHistory', 'readonly')
    const items = await tx.store.index('timestamp').getAll()
    
    return items
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, limit)
  }

  async clearSyncHistory() {
    if (!this.db) return
    
    const tx = this.db.transaction('syncHistory', 'readwrite')
    await tx.store.clear()
    await tx.done
  }

  async forceSyncNow() {
    if (isOnline()) {
      return await this.processSyncQueue()
    } else {
      throw new Error('Cannot sync while offline')
    }
  }
}

// Export singleton instance
export const syncManager = new SyncManager()
export default syncManager
