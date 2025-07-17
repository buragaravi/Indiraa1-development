// Advanced Cache Manager for Multi-layer Caching Strategy
import { openDB } from 'idb'

class CacheManager {
  constructor() {
    this.dbName = 'indiraa1-cache'
    this.version = 1
    this.db = null
    this.memoryCache = new Map() // First layer: Memory cache
    this.maxMemoryCacheSize = 100 // Max items in memory
    this.defaultTTL = 5 * 60 * 1000 // 5 minutes default TTL
    this.cacheStrategies = {
      'cache-first': this.cacheFirst.bind(this),
      'network-first': this.networkFirst.bind(this),
      'stale-while-revalidate': this.staleWhileRevalidate.bind(this),
      'network-only': this.networkOnly.bind(this),
      'cache-only': this.cacheOnly.bind(this)
    }
  }

  // Initialize cache database
  async init() {
    try {
      this.db = await openDB(this.dbName, this.version, {
        upgrade(db) {
          // Main cache store
          if (!db.objectStoreNames.contains('cache')) {
            const cacheStore = db.createObjectStore('cache', { keyPath: 'key' })
            cacheStore.createIndex('timestamp', 'timestamp')
            cacheStore.createIndex('expiry', 'expiry')
            cacheStore.createIndex('category', 'category')
            cacheStore.createIndex('size', 'size')
          }

          // Cache metadata store
          if (!db.objectStoreNames.contains('metadata')) {
            const metaStore = db.createObjectStore('metadata', { keyPath: 'key' })
            metaStore.createIndex('lastAccess', 'lastAccess')
            metaStore.createIndex('accessCount', 'accessCount')
          }

          // Cache statistics store
          if (!db.objectStoreNames.contains('stats')) {
            const statsStore = db.createObjectStore('stats', { keyPath: 'date' })
          }
        }
      })
      
      console.log('✅ CacheManager initialized')
      
      // Start cleanup routines
      this.startCleanupRoutines()
      
      // Load frequently accessed items to memory cache
      await this.warmupMemoryCache()
      
    } catch (error) {
      console.error('❌ Failed to initialize CacheManager:', error)
    }
  }

  // Main cache interface
  async get(key, options = {}) {
    const {
      strategy = 'cache-first',
      ttl = this.defaultTTL,
      fallback = null,
      category = 'default'
    } = options

    try {
      const cacheStrategy = this.cacheStrategies[strategy] || this.cacheFirst
      return await cacheStrategy(key, { ttl, fallback, category })
    } catch (error) {
      console.error(`❌ Cache get failed for key ${key}:`, error)
      return fallback
    }
  }

  async set(key, value, options = {}) {
    const {
      ttl = this.defaultTTL,
      category = 'default',
      compress = false,
      priority = 'normal'
    } = options

    try {
      const cacheItem = {
        key,
        value: compress ? await this.compress(value) : value,
        timestamp: Date.now(),
        expiry: Date.now() + ttl,
        category,
        size: this.calculateSize(value),
        compressed: compress,
        priority,
        accessCount: 0,
        lastAccess: Date.now()
      }

      // Store in memory cache (first layer)
      this.setMemoryCache(key, cacheItem)

      // Store in IndexedDB (second layer)
      if (!this.db) await this.init()
      
      const tx = this.db.transaction(['cache', 'metadata'], 'readwrite')
      await tx.objectStore('cache').put(cacheItem)
      await tx.objectStore('metadata').put({
        key,
        lastAccess: Date.now(),
        accessCount: 0,
        category,
        priority
      })
      await tx.done

      console.log(`💾 Cached item: ${key} (${category})`)
      
      // Update statistics
      await this.updateStats('set', category)
      
    } catch (error) {
      console.error(`❌ Cache set failed for key ${key}:`, error)
    }
  }

  async delete(key) {
    try {
      // Remove from memory cache
      this.memoryCache.delete(key)

      // Remove from IndexedDB
      if (!this.db) await this.init()
      
      const tx = this.db.transaction(['cache', 'metadata'], 'readwrite')
      await tx.objectStore('cache').delete(key)
      await tx.objectStore('metadata').delete(key)
      await tx.done

      console.log(`🗑️ Deleted cache item: ${key}`)
      
    } catch (error) {
      console.error(`❌ Cache delete failed for key ${key}:`, error)
    }
  }

  // Cache strategies implementation
  async cacheFirst(key, options) {
    // Try memory cache first
    const memoryItem = this.getMemoryCache(key)
    if (memoryItem && !this.isExpired(memoryItem)) {
      await this.updateAccessMetadata(key)
      await this.updateStats('hit', 'memory')
      return memoryItem.compressed ? await this.decompress(memoryItem.value) : memoryItem.value
    }

    // Try IndexedDB cache
    if (!this.db) await this.init()
    
    const tx = this.db.transaction('cache', 'readonly')
    const cacheItem = await tx.objectStore('cache').get(key)
    
    if (cacheItem && !this.isExpired(cacheItem)) {
      // Move to memory cache for faster access
      this.setMemoryCache(key, cacheItem)
      await this.updateAccessMetadata(key)
      await this.updateStats('hit', 'indexeddb')
      return cacheItem.compressed ? await this.decompress(cacheItem.value) : cacheItem.value
    }

    // Cache miss - return fallback
    await this.updateStats('miss', options.category)
    return options.fallback
  }

  async networkFirst(key, options) {
    // This strategy would typically involve network requests
    // For now, fallback to cache-first since network layer is in apiWithOffline
    return await this.cacheFirst(key, options)
  }

  async staleWhileRevalidate(key, options) {
    // Get from cache immediately
    const cachedValue = await this.cacheFirst(key, options)
    
    // If we have cached data, return it immediately
    if (cachedValue !== options.fallback) {
      // Optionally trigger background revalidation here
      // This would be implemented in the API layer
      return cachedValue
    }
    
    return options.fallback
  }

  async networkOnly(key, options) {
    // Always return fallback for network-only strategy
    // Actual network handling is in apiWithOffline
    return options.fallback
  }

  async cacheOnly(key, options) {
    return await this.cacheFirst(key, options)
  }

  // Memory cache management
  getMemoryCache(key) {
    return this.memoryCache.get(key)
  }

  setMemoryCache(key, item) {
    // Implement LRU eviction if memory cache is full
    if (this.memoryCache.size >= this.maxMemoryCacheSize) {
      // Find least recently used item
      let lruKey = null
      let lruTime = Date.now()
      
      for (const [k, v] of this.memoryCache.entries()) {
        if (v.lastAccess < lruTime) {
          lruTime = v.lastAccess
          lruKey = k
        }
      }
      
      if (lruKey) {
        this.memoryCache.delete(lruKey)
      }
    }

    item.lastAccess = Date.now()
    this.memoryCache.set(key, item)
  }

  // Utility methods
  isExpired(item) {
    return Date.now() > item.expiry
  }

  calculateSize(value) {
    try {
      return JSON.stringify(value).length
    } catch (error) {
      return 0
    }
  }

  async compress(value) {
    // Simple compression placeholder - in production, use a real compression library
    try {
      return JSON.stringify(value)
    } catch (error) {
      return value
    }
  }

  async decompress(value) {
    // Simple decompression placeholder
    try {
      return JSON.parse(value)
    } catch (error) {
      return value
    }
  }

  async updateAccessMetadata(key) {
    if (!this.db) return
    
    try {
      const tx = this.db.transaction('metadata', 'readwrite')
      const metadata = await tx.objectStore('metadata').get(key)
      
      if (metadata) {
        metadata.lastAccess = Date.now()
        metadata.accessCount = (metadata.accessCount || 0) + 1
        await tx.objectStore('metadata').put(metadata)
      }
      
      await tx.done
    } catch (error) {
      console.error('Failed to update access metadata:', error)
    }
  }

  async updateStats(type, category) {
    if (!this.db) return
    
    try {
      const today = new Date().toISOString().split('T')[0]
      const tx = this.db.transaction('stats', 'readwrite')
      
      let stats = await tx.objectStore('stats').get(today)
      if (!stats) {
        stats = {
          date: today,
          hits: { memory: 0, indexeddb: 0 },
          misses: {},
          sets: {},
          total: 0
        }
      }

      if (type === 'hit') {
        stats.hits[category] = (stats.hits[category] || 0) + 1
      } else if (type === 'miss') {
        stats.misses[category] = (stats.misses[category] || 0) + 1
      } else if (type === 'set') {
        stats.sets[category] = (stats.sets[category] || 0) + 1
      }
      
      stats.total++
      
      await tx.objectStore('stats').put(stats)
      await tx.done
      
    } catch (error) {
      console.error('Failed to update cache stats:', error)
    }
  }

  async warmupMemoryCache() {
    if (!this.db) return
    
    try {
      // Load most frequently accessed items
      const tx = this.db.transaction(['cache', 'metadata'], 'readonly')
      const metadata = await tx.objectStore('metadata').index('accessCount').getAll()
      
      // Sort by access count and take top items
      const topItems = metadata
        .sort((a, b) => (b.accessCount || 0) - (a.accessCount || 0))
        .slice(0, Math.floor(this.maxMemoryCacheSize * 0.5)) // Only fill half initially
      
      for (const meta of topItems) {
        const cacheItem = await tx.objectStore('cache').get(meta.key)
        if (cacheItem && !this.isExpired(cacheItem)) {
          this.memoryCache.set(meta.key, cacheItem)
        }
      }
      
      await tx.done
      
      console.log(`🔥 Warmed up memory cache with ${this.memoryCache.size} items`)
      
    } catch (error) {
      console.error('Failed to warmup memory cache:', error)
    }
  }

  startCleanupRoutines() {
    // Clean expired items every 10 minutes
    setInterval(() => this.cleanupExpiredItems(), 10 * 60 * 1000)
    
    // Optimize cache every hour
    setInterval(() => this.optimizeCache(), 60 * 60 * 1000)
    
    // Clean memory cache every 5 minutes
    setInterval(() => this.cleanupMemoryCache(), 5 * 60 * 1000)
  }

  async cleanupExpiredItems() {
    if (!this.db) return
    
    try {
      const now = Date.now()
      const tx = this.db.transaction(['cache', 'metadata'], 'readwrite')
      const cacheStore = tx.objectStore('cache')
      const metaStore = tx.objectStore('metadata')
      
      const expiredItems = await cacheStore.index('expiry').getAll(IDBKeyRange.upperBound(now))
      
      for (const item of expiredItems) {
        await cacheStore.delete(item.key)
        await metaStore.delete(item.key)
        this.memoryCache.delete(item.key)
      }
      
      await tx.done
      
      if (expiredItems.length > 0) {
        console.log(`🧹 Cleaned up ${expiredItems.length} expired cache items`)
      }
      
    } catch (error) {
      console.error('Failed to cleanup expired items:', error)
    }
  }

  async optimizeCache() {
    if (!this.db) return
    
    try {
      // Get cache size statistics
      const stats = await this.getCacheStats()
      const maxCacheSize = 50 * 1024 * 1024 // 50MB limit
      
      if (stats.totalSize > maxCacheSize) {
        await this.evictLeastUsedItems(stats.totalSize - maxCacheSize)
      }
      
    } catch (error) {
      console.error('Failed to optimize cache:', error)
    }
  }

  cleanupMemoryCache() {
    const now = Date.now()
    
    for (const [key, item] of this.memoryCache.entries()) {
      if (this.isExpired(item)) {
        this.memoryCache.delete(key)
      }
    }
  }

  async evictLeastUsedItems(targetReduction) {
    if (!this.db) return
    
    try {
      const tx = this.db.transaction(['cache', 'metadata'], 'readwrite')
      const metadata = await tx.objectStore('metadata').getAll()
      
      // Sort by access frequency and recency
      const candidates = metadata
        .map(meta => ({
          ...meta,
          score: (meta.accessCount || 0) * 0.7 + (Date.now() - meta.lastAccess) * 0.3
        }))
        .sort((a, b) => a.score - b.score)
      
      let currentReduction = 0
      
      for (const candidate of candidates) {
        if (currentReduction >= targetReduction) break
        
        const cacheItem = await tx.objectStore('cache').get(candidate.key)
        if (cacheItem) {
          currentReduction += cacheItem.size || 0
          await tx.objectStore('cache').delete(candidate.key)
          await tx.objectStore('metadata').delete(candidate.key)
          this.memoryCache.delete(candidate.key)
        }
      }
      
      await tx.done
      
      console.log(`🎯 Evicted cache items, freed ${currentReduction} bytes`)
      
    } catch (error) {
      console.error('Failed to evict cache items:', error)
    }
  }

  // Public API methods
  async getCacheStats() {
    if (!this.db) await this.init()
    
    try {
      const tx = this.db.transaction(['cache', 'stats'], 'readonly')
      const allItems = await tx.objectStore('cache').getAll()
      const allStats = await tx.objectStore('stats').getAll()
      
      const totalSize = allItems.reduce((sum, item) => sum + (item.size || 0), 0)
      const itemCount = allItems.length
      const memoryCount = this.memoryCache.size
      
      return {
        totalSize,
        itemCount,
        memoryCount,
        hitRate: this.calculateHitRate(allStats),
        categories: this.getCategoryStats(allItems)
      }
      
    } catch (error) {
      console.error('Failed to get cache stats:', error)
      return {
        totalSize: 0,
        itemCount: 0,
        memoryCount: this.memoryCache.size,
        hitRate: 0,
        categories: {}
      }
    }
  }

  calculateHitRate(statsArray) {
    if (!statsArray.length) return 0
    
    const totals = statsArray.reduce((acc, stat) => {
      const hits = Object.values(stat.hits || {}).reduce((sum, val) => sum + val, 0)
      const misses = Object.values(stat.misses || {}).reduce((sum, val) => sum + val, 0)
      
      acc.hits += hits
      acc.misses += misses
      return acc
    }, { hits: 0, misses: 0 })
    
    const total = totals.hits + totals.misses
    return total > 0 ? (totals.hits / total) * 100 : 0
  }

  getCategoryStats(items) {
    return items.reduce((acc, item) => {
      const category = item.category || 'default'
      if (!acc[category]) {
        acc[category] = { count: 0, size: 0 }
      }
      acc[category].count++
      acc[category].size += item.size || 0
      return acc
    }, {})
  }

  async clearCache(category = null) {
    if (!this.db) await this.init()
    
    try {
      if (category) {
        // Clear specific category
        const tx = this.db.transaction(['cache', 'metadata'], 'readwrite')
        const items = await tx.objectStore('cache').index('category').getAll(category)
        
        for (const item of items) {
          await tx.objectStore('cache').delete(item.key)
          await tx.objectStore('metadata').delete(item.key)
          this.memoryCache.delete(item.key)
        }
        
        await tx.done
        console.log(`🗑️ Cleared cache category: ${category}`)
        
      } else {
        // Clear all cache
        const tx = this.db.transaction(['cache', 'metadata'], 'readwrite')
        await tx.objectStore('cache').clear()
        await tx.objectStore('metadata').clear()
        this.memoryCache.clear()
        await tx.done
        
        console.log('🗑️ Cleared all cache')
      }
      
    } catch (error) {
      console.error('Failed to clear cache:', error)
    }
  }

  async exportCache() {
    if (!this.db) await this.init()
    
    try {
      const tx = this.db.transaction(['cache', 'metadata', 'stats'], 'readonly')
      const cache = await tx.objectStore('cache').getAll()
      const metadata = await tx.objectStore('metadata').getAll()
      const stats = await tx.objectStore('stats').getAll()
      
      return {
        cache,
        metadata,
        stats,
        timestamp: Date.now(),
        version: this.version
      }
      
    } catch (error) {
      console.error('Failed to export cache:', error)
      return null
    }
  }
}

// Export singleton instance
export const cacheManager = new CacheManager()
export default cacheManager
