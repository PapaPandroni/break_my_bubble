import { Article, FeedCache, CachedFeed, CacheAnalytics, CacheSizeInfo, BackgroundRefreshConfig } from '../types'
import { compressData, decompressData, smartDecompressData, calculateStorageSize, formatBytes, compressionMetrics } from '../utils/compressionUtils'
import { backgroundRefreshService } from './backgroundRefreshService'

// Enhanced caching with compression, size management, and background refresh
const CACHE_DURATION_FRESH = 2 * 60 * 60 * 1000 // 2 hours - fresh cache
const CACHE_DURATION_STALE = 12 * 60 * 60 * 1000 // 12 hours - stale but usable
const CACHE_DURATION_MAX = 24 * 60 * 60 * 1000 // 24 hours - maximum age before deletion
const CACHE_KEY = 'breakMyBubble_feedCache'
const ANALYTICS_KEY = 'breakMyBubble_cacheAnalytics'
const MAX_CACHE_SIZE = 5 * 1024 * 1024 // 5MB limit
const CACHE_VERSION = 2 // For backward compatibility

class FeedCacheService {
  private cache: FeedCache = {}
  private analytics: CacheAnalytics = {
    hitRate: 0,
    missRate: 0,
    totalHits: 0,
    totalMisses: 0,
    totalRequests: 0,
    compressionSavings: 0,
    averageCompressionRatio: 0,
    cacheSize: 0,
    entryCount: 0,
    oldestEntry: null,
    newestEntry: null
  }
  private accessOrder: string[] = [] // For LRU tracking

  constructor() {
    this.loadCacheFromStorage()
    this.loadAnalyticsFromStorage()
    this.initializeBackgroundRefresh()
  }

  private loadCacheFromStorage(): void {
    try {
      const stored = localStorage.getItem(CACHE_KEY)
      if (stored) {
        // Try smart decompression for backward compatibility
        const decompressResult = smartDecompressData<FeedCache>(stored)
        if (decompressResult.success && decompressResult.data) {
          this.cache = decompressResult.data
          this.migrateOldCacheFormat()
          this.cleanExpiredEntries()
          this.updateAccessOrder()
        } else {
          console.warn('Failed to decompress cache data:', decompressResult.error)
          this.cache = {}
        }
      }
    } catch (error) {
      console.warn('Failed to load cache from storage:', error)
      this.cache = {}
    }
  }

  private saveCacheToStorage(): void {
    try {
      // Check cache size and clean if necessary
      this.manageCacheSize()
      
      // Compress cache data
      const compressionResult = compressData(this.cache)
      compressionMetrics.recordCompression(compressionResult)
      
      localStorage.setItem(CACHE_KEY, compressionResult.data)
      
      // Update analytics
      this.updateAnalytics()
      this.saveAnalyticsToStorage()
    } catch (error) {
      if (error instanceof Error && error.name === 'QuotaExceededError') {
        console.warn('Storage quota exceeded, cleaning cache...')
        this.emergencyCleanCache()
        // Retry save with reduced cache
        try {
          const compressionResult = compressData(this.cache)
          localStorage.setItem(CACHE_KEY, compressionResult.data)
        } catch (retryError) {
          console.error('Failed to save cache after cleanup:', retryError)
        }
      } else {
        console.warn('Failed to save cache to storage:', error)
      }
    }
  }

  private cleanExpiredEntries(): void {
    const now = Date.now()
    let hasExpired = false

    Object.keys(this.cache).forEach((sourceId) => {
      if (this.isMaxAgeExceeded(this.cache[sourceId], now)) {
        delete this.cache[sourceId]
        this.removeFromAccessOrder(sourceId)
        hasExpired = true
      }
    })

    if (hasExpired) {
      this.saveCacheToStorage()
    }
  }

  /**
   * Initialize background refresh service
   */
  private initializeBackgroundRefresh(): void {
    backgroundRefreshService.initialize(async (sourceId: string) => {
      // This would be called by the background service to refresh cache
      // The actual refresh logic would be implemented by the calling service (newsApiService)
      console.log(`Background refresh requested for ${sourceId}`)
    })
  }

  /**
   * Load analytics from storage
   */
  private loadAnalyticsFromStorage(): void {
    try {
      const stored = localStorage.getItem(ANALYTICS_KEY)
      if (stored) {
        const decompressResult = smartDecompressData<CacheAnalytics>(stored)
        if (decompressResult.success && decompressResult.data) {
          this.analytics = decompressResult.data
        }
      }
    } catch (error) {
      console.warn('Failed to load analytics from storage:', error)
    }
  }

  /**
   * Save analytics to storage
   */
  private saveAnalyticsToStorage(): void {
    try {
      const compressionResult = compressData(this.analytics)
      localStorage.setItem(ANALYTICS_KEY, compressionResult.data)
    } catch (error) {
      console.warn('Failed to save analytics to storage:', error)
    }
  }

  /**
   * Migrate old cache format to new format
   */
  private migrateOldCacheFormat(): void {
    let migrated = false
    Object.keys(this.cache).forEach((sourceId) => {
      const cached = this.cache[sourceId]
      if (!cached.version) {
        // Old format - add new fields
        cached.version = CACHE_VERSION
        cached.accessCount = cached.accessCount || 0
        cached.lastAccessed = cached.lastAccessed || cached.timestamp
        cached.compressed = false // Old data was uncompressed
        migrated = true
      }
    })
    
    if (migrated) {
      console.log('Migrated cache to new format')
    }
  }

  /**
   * Update access order for LRU tracking
   */
  private updateAccessOrder(): void {
    this.accessOrder = Object.keys(this.cache).sort((a, b) => {
      const aAccessed = this.cache[a].lastAccessed || this.cache[a].timestamp
      const bAccessed = this.cache[b].lastAccessed || this.cache[b].timestamp
      return bAccessed - aAccessed // Most recently accessed first
    })
  }

  /**
   * Remove source from access order
   */
  private removeFromAccessOrder(sourceId: string): void {
    this.accessOrder = this.accessOrder.filter(id => id !== sourceId)
  }

  /**
   * Manage cache size with LRU eviction
   */
  private manageCacheSize(): void {
    const currentSize = this.calculateCurrentCacheSize()
    
    if (currentSize <= MAX_CACHE_SIZE) {
      return // Within limits
    }

    console.log(`Cache size (${formatBytes(currentSize)}) exceeds limit (${formatBytes(MAX_CACHE_SIZE)}), cleaning...`)
    
    // Remove least recently used items until under limit
    while (this.calculateCurrentCacheSize() > MAX_CACHE_SIZE && this.accessOrder.length > 0) {
      const oldestSourceId = this.accessOrder.pop()
      if (oldestSourceId && this.cache[oldestSourceId]) {
        delete this.cache[oldestSourceId]
        console.log(`Evicted cache entry for ${oldestSourceId}`)
      }
    }
  }

  /**
   * Emergency cache cleanup when storage quota exceeded
   */
  private emergencyCleanCache(): void {
    console.warn('Emergency cache cleanup due to storage quota')
    
    // Remove oldest 50% of entries
    const entriesToRemove = Math.ceil(this.accessOrder.length / 2)
    for (let i = 0; i < entriesToRemove; i++) {
      const sourceId = this.accessOrder.pop()
      if (sourceId && this.cache[sourceId]) {
        delete this.cache[sourceId]
      }
    }
  }

  /**
   * Calculate current cache size in bytes
   */
  private calculateCurrentCacheSize(): number {
    const cacheString = JSON.stringify(this.cache)
    return calculateStorageSize(cacheString)
  }

  /**
   * Update analytics after cache operations
   */
  private updateAnalytics(): void {
    const entries = Object.values(this.cache)
    this.analytics.entryCount = entries.length
    this.analytics.cacheSize = this.calculateCurrentCacheSize()
    
    // Calculate compression savings
    let totalOriginal = 0
    let totalCompressed = 0
    entries.forEach(entry => {
      if (entry.originalSize && entry.compressedSize) {
        totalOriginal += entry.originalSize
        totalCompressed += entry.compressedSize
      }
    })
    
    this.analytics.compressionSavings = totalOriginal - totalCompressed
    this.analytics.averageCompressionRatio = totalOriginal > 0 ? totalCompressed / totalOriginal : 0
    
    // Update hit/miss rates
    if (this.analytics.totalRequests > 0) {
      this.analytics.hitRate = this.analytics.totalHits / this.analytics.totalRequests
      this.analytics.missRate = this.analytics.totalMisses / this.analytics.totalRequests
    }
    
    // Update age information
    const timestamps = entries.map(entry => entry.timestamp)
    this.analytics.oldestEntry = timestamps.length > 0 ? Math.min(...timestamps) : null
    this.analytics.newestEntry = timestamps.length > 0 ? Math.max(...timestamps) : null
  }

  private isMaxAgeExceeded(cachedFeed: CachedFeed, currentTime = Date.now()): boolean {
    return currentTime - cachedFeed.timestamp > CACHE_DURATION_MAX
  }

  private isFresh(cachedFeed: CachedFeed, currentTime = Date.now()): boolean {
    return currentTime - cachedFeed.timestamp <= CACHE_DURATION_FRESH
  }

  private isStale(cachedFeed: CachedFeed, currentTime = Date.now()): boolean {
    const age = currentTime - cachedFeed.timestamp
    return age > CACHE_DURATION_FRESH && age <= CACHE_DURATION_STALE
  }

  getCachedFeed(sourceId: string): Article[] | null {
    this.analytics.totalRequests++
    
    const cached = this.cache[sourceId]
    
    if (!cached) {
      this.analytics.totalMisses++
      return null
    }

    // Delete if max age exceeded (24 hours)
    if (this.isMaxAgeExceeded(cached)) {
      delete this.cache[sourceId]
      this.removeFromAccessOrder(sourceId)
      this.saveCacheToStorage()
      this.analytics.totalMisses++
      return null
    }

    // Return cached data if within acceptable age (12 hours)
    const age = Date.now() - cached.timestamp
    if (age <= CACHE_DURATION_STALE) {
      // Update access tracking
      cached.accessCount = (cached.accessCount || 0) + 1
      cached.lastAccessed = Date.now()
      this.updateAccessOrder()
      this.analytics.totalHits++
      
      // Queue background refresh if stale
      if (backgroundRefreshService.shouldRefresh(sourceId, age, cached.accessCount)) {
        const priority = cached.accessCount > 5 ? 'high' : 'medium'
        backgroundRefreshService.queueRefresh(sourceId, priority)
      }
      
      return cached.data
    }

    // Cache is too old but not yet deleted - return null to trigger fresh fetch
    this.analytics.totalMisses++
    return null
  }

  /**
   * Get cached data with freshness indicator for smart fallback
   */
  getCachedFeedWithStatus(sourceId: string): {
    data: Article[] | null
    status: 'fresh' | 'stale' | 'expired' | 'missing'
    age?: number
    accessCount?: number
    compressionRatio?: number
  } {
    this.analytics.totalRequests++
    
    const cached = this.cache[sourceId]
    
    if (!cached) {
      this.analytics.totalMisses++
      return { data: null, status: 'missing' }
    }

    const age = Date.now() - cached.timestamp

    if (this.isMaxAgeExceeded(cached)) {
      this.analytics.totalMisses++
      return { 
        data: null, 
        status: 'expired', 
        age,
        accessCount: cached.accessCount,
        compressionRatio: cached.compressionRatio
      }
    }

    // Update access tracking
    cached.accessCount = (cached.accessCount || 0) + 1
    cached.lastAccessed = Date.now()
    this.updateAccessOrder()
    this.analytics.totalHits++

    if (this.isFresh(cached)) {
      return { 
        data: cached.data, 
        status: 'fresh', 
        age,
        accessCount: cached.accessCount,
        compressionRatio: cached.compressionRatio
      }
    }

    if (this.isStale(cached)) {
      // Queue background refresh for stale data
      if (backgroundRefreshService.shouldRefresh(sourceId, age, cached.accessCount)) {
        const priority = cached.accessCount > 5 ? 'high' : 'medium'
        backgroundRefreshService.queueRefresh(sourceId, priority)
      }
      
      return { 
        data: cached.data, 
        status: 'stale', 
        age,
        accessCount: cached.accessCount,
        compressionRatio: cached.compressionRatio
      }
    }

    // Older than 12 hours but less than 24 hours
    return { 
      data: cached.data, 
      status: 'expired', 
      age,
      accessCount: cached.accessCount,
      compressionRatio: cached.compressionRatio
    }
  }

  setCachedFeed(sourceId: string, articles: Article[]): void {
    const now = Date.now()
    
    // Calculate size for compression metrics
    const originalData = JSON.stringify(articles)
    const originalSize = calculateStorageSize(originalData)
    
    this.cache[sourceId] = {
      data: articles,
      timestamp: now,
      version: CACHE_VERSION,
      accessCount: 1,
      lastAccessed: now,
      compressed: false, // Will be set during storage compression
      originalSize,
      compressedSize: originalSize, // Will be updated after compression
      compressionRatio: 1
    }
    
    // Update access order
    this.removeFromAccessOrder(sourceId)
    this.accessOrder.unshift(sourceId)
    
    this.saveCacheToStorage()
  }

  clearCache(): void {
    this.cache = {}
    this.accessOrder = []
    
    // Reset analytics but preserve cumulative counters
    const preservedHits = this.analytics.totalHits
    const preservedMisses = this.analytics.totalMisses
    const preservedRequests = this.analytics.totalRequests
    
    this.analytics = {
      hitRate: 0,
      missRate: 0,
      totalHits: preservedHits,
      totalMisses: preservedMisses,
      totalRequests: preservedRequests,
      compressionSavings: 0,
      averageCompressionRatio: 0,
      cacheSize: 0,
      entryCount: 0,
      oldestEntry: null,
      newestEntry: null
    }
    
    try {
      localStorage.removeItem(CACHE_KEY)
      this.saveAnalyticsToStorage()
    } catch (error) {
      console.warn('Failed to clear cache from storage:', error)
    }
  }

  getCacheStats(): {
    totalEntries: number
    totalArticles: number
    oldestEntry: number | null
    newestEntry: number | null
    cacheSize: number
    cacheSizeFormatted: string
    compressionSavings: number
    compressionSavingsFormatted: string
    averageCompressionRatio: number
  } {
    const entries = Object.values(this.cache)
    const totalEntries = entries.length
    const totalArticles = entries.reduce((sum, entry) => sum + entry.data.length, 0)
    
    const timestamps = entries.map(entry => entry.timestamp)
    const oldestEntry = timestamps.length > 0 ? Math.min(...timestamps) : null
    const newestEntry = timestamps.length > 0 ? Math.max(...timestamps) : null
    
    const cacheSize = this.calculateCurrentCacheSize()
    
    // Calculate compression metrics
    let totalOriginal = 0
    let totalCompressed = 0
    entries.forEach(entry => {
      if (entry.originalSize && entry.compressedSize) {
        totalOriginal += entry.originalSize
        totalCompressed += entry.compressedSize
      }
    })
    
    const compressionSavings = totalOriginal - totalCompressed
    const averageCompressionRatio = totalOriginal > 0 ? totalCompressed / totalOriginal : 0

    return {
      totalEntries,
      totalArticles,
      oldestEntry,
      newestEntry,
      cacheSize,
      cacheSizeFormatted: formatBytes(cacheSize),
      compressionSavings,
      compressionSavingsFormatted: formatBytes(compressionSavings),
      averageCompressionRatio
    }
  }

  /**
   * Get comprehensive cache analytics
   */
  getCacheAnalytics(): CacheAnalytics {
    this.updateAnalytics()
    return { ...this.analytics }
  }

  /**
   * Get cache size information
   */
  getCacheSizeInfo(): CacheSizeInfo {
    const cacheSize = this.calculateCurrentCacheSize()
    const entries = Object.values(this.cache)
    const entryCount = entries.length
    
    // Calculate compression savings
    let totalOriginal = 0
    let totalCompressed = 0
    entries.forEach(entry => {
      if (entry.originalSize && entry.compressedSize) {
        totalOriginal += entry.originalSize
        totalCompressed += entry.compressedSize
      }
    })
    
    return {
      totalSize: cacheSize,
      entryCount,
      averageEntrySize: entryCount > 0 ? cacheSize / entryCount : 0,
      compressionSavings: totalOriginal - totalCompressed,
      utilizationPercentage: (cacheSize / MAX_CACHE_SIZE) * 100
    }
  }

  /**
   * Get detailed cache entry information
   */
  getCacheEntryDetails(sourceId: string): {
    exists: boolean
    age?: number
    accessCount?: number
    size?: number
    compressionRatio?: number
    status?: 'fresh' | 'stale' | 'expired'
  } {
    const cached = this.cache[sourceId]
    
    if (!cached) {
      return { exists: false }
    }
    
    const age = Date.now() - cached.timestamp
    const size = cached.compressedSize || 0
    
    let status: 'fresh' | 'stale' | 'expired'
    if (this.isFresh(cached)) {
      status = 'fresh'
    } else if (this.isStale(cached)) {
      status = 'stale'
    } else {
      status = 'expired'
    }
    
    return {
      exists: true,
      age,
      accessCount: cached.accessCount,
      size,
      compressionRatio: cached.compressionRatio,
      status
    }
  }

  /**
   * Force refresh of specific cache entry
   */
  async forceRefresh(sourceId: string): Promise<void> {
    await backgroundRefreshService.forceRefresh(sourceId)
  }

  /**
   * Preload cache entries with background refresh
   */
  preloadCache(sourceIds: string[]): void {
    sourceIds.forEach(sourceId => {
      backgroundRefreshService.queueRefresh(sourceId, 'low')
    })
  }

  /**
   * Get background refresh service status
   */
  getBackgroundRefreshStatus() {
    return backgroundRefreshService.getStatus()
  }

  /**
   * Update background refresh configuration
   */
  updateBackgroundRefreshConfig(config: Partial<BackgroundRefreshConfig>): void {
    backgroundRefreshService.updateConfig(config)
  }

  getCacheAge(sourceId: string): number | null {
    const cached = this.cache[sourceId]
    if (!cached) {
      return null
    }
    return Date.now() - cached.timestamp
  }
}

// Export singleton instance
export const feedCache = new FeedCacheService()

// Export helper functions
export const isCacheEnabled = (): boolean => {
  try {
    return typeof Storage !== 'undefined' && localStorage !== null
  } catch {
    return false
  }
}

export const formatCacheAge = (ageMs: number): string => {
  const minutes = Math.floor(ageMs / (60 * 1000))
  const hours = Math.floor(ageMs / (60 * 60 * 1000))
  const days = Math.floor(ageMs / (24 * 60 * 60 * 1000))

  if (days > 0) {
    return `${days} day${days === 1 ? '' : 's'} ago`
  } else if (hours > 0) {
    return `${hours} hour${hours === 1 ? '' : 's'} ago`
  } else if (minutes > 0) {
    return `${minutes} minute${minutes === 1 ? '' : 's'} ago`
  } else {
    return 'Less than 1 minute ago'
  }
}

/**
 * Export advanced cache utilities for development and debugging
 */
export const cacheUtils = {
  // Get current cache size limits
  getMaxCacheSize: () => MAX_CACHE_SIZE,
  getMaxCacheSizeFormatted: () => formatBytes(MAX_CACHE_SIZE),
  
  // Compression utilities
  compressData,
  decompressData,
  smartDecompressData,
  calculateStorageSize,
  formatBytes,
  
  // Compression metrics
  getCompressionMetrics: () => compressionMetrics.getMetrics(),
  resetCompressionMetrics: () => compressionMetrics.reset(),
  
  // Background refresh service
  backgroundRefreshService,
  
  // Advanced cache debugging
  debugCache: () => {
    const analytics = feedCache.getCacheAnalytics()
    const sizeInfo = feedCache.getCacheSizeInfo()
    const stats = feedCache.getCacheStats()
    const refreshStatus = feedCache.getBackgroundRefreshStatus()
    
    console.group('🗄️ Cache Debug Information')
    console.log('📊 Analytics:', analytics)
    console.log('📏 Size Info:', sizeInfo)
    console.log('📈 Stats:', stats)
    console.log('🔄 Background Refresh:', refreshStatus)
    console.log('💾 Compression Metrics:', compressionMetrics.getMetrics())
    console.groupEnd()
    
    return {
      analytics,
      sizeInfo,
      stats,
      refreshStatus,
      compressionMetrics: compressionMetrics.getMetrics()
    }
  }
}