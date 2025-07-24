import { Article, FeedCache, CachedFeed } from '../types'

// Enhanced caching with multiple tiers for better reliability
const CACHE_DURATION_FRESH = 2 * 60 * 60 * 1000 // 2 hours - fresh cache
const CACHE_DURATION_STALE = 12 * 60 * 60 * 1000 // 12 hours - stale but usable
const CACHE_DURATION_MAX = 24 * 60 * 60 * 1000 // 24 hours - maximum age before deletion
const CACHE_KEY = 'breakMyBubble_feedCache'

class FeedCacheService {
  private cache: FeedCache = {}

  constructor() {
    this.loadCacheFromStorage()
  }

  private loadCacheFromStorage(): void {
    try {
      const stored = localStorage.getItem(CACHE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored) as FeedCache
        this.cache = parsed
        this.cleanExpiredEntries()
      }
    } catch (error) {
      console.warn('Failed to load cache from storage:', error)
      this.cache = {}
    }
  }

  private saveCacheToStorage(): void {
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify(this.cache))
    } catch (error) {
      console.warn('Failed to save cache to storage:', error)
    }
  }

  private cleanExpiredEntries(): void {
    const now = Date.now()
    let hasExpired = false

    Object.keys(this.cache).forEach((sourceId) => {
      if (this.isMaxAgeExceeded(this.cache[sourceId], now)) {
        delete this.cache[sourceId]
        hasExpired = true
      }
    })

    if (hasExpired) {
      this.saveCacheToStorage()
    }
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
    const cached = this.cache[sourceId]
    
    if (!cached) {
      return null
    }

    // Delete if max age exceeded (24 hours)
    if (this.isMaxAgeExceeded(cached)) {
      delete this.cache[sourceId]
      this.saveCacheToStorage()
      return null
    }

    // Return cached data if within acceptable age (12 hours)
    const age = Date.now() - cached.timestamp
    if (age <= CACHE_DURATION_STALE) {
      return cached.data
    }

    // Cache is too old but not yet deleted - return null to trigger fresh fetch
    return null
  }

  /**
   * Get cached data with freshness indicator for smart fallback
   */
  getCachedFeedWithStatus(sourceId: string): {
    data: Article[] | null
    status: 'fresh' | 'stale' | 'expired' | 'missing'
    age?: number
  } {
    const cached = this.cache[sourceId]
    
    if (!cached) {
      return { data: null, status: 'missing' }
    }

    const age = Date.now() - cached.timestamp

    if (this.isMaxAgeExceeded(cached)) {
      return { data: null, status: 'expired', age }
    }

    if (this.isFresh(cached)) {
      return { data: cached.data, status: 'fresh', age }
    }

    if (this.isStale(cached)) {
      return { data: cached.data, status: 'stale', age }
    }

    // Older than 12 hours but less than 24 hours
    return { data: cached.data, status: 'expired', age }
  }

  setCachedFeed(sourceId: string, articles: Article[]): void {
    this.cache[sourceId] = {
      data: articles,
      timestamp: Date.now(),
    }
    this.saveCacheToStorage()
  }

  clearCache(): void {
    this.cache = {}
    try {
      localStorage.removeItem(CACHE_KEY)
    } catch (error) {
      console.warn('Failed to clear cache from storage:', error)
    }
  }

  getCacheStats(): {
    totalEntries: number
    totalArticles: number
    oldestEntry: number | null
    newestEntry: number | null
  } {
    const entries = Object.values(this.cache)
    const totalEntries = entries.length
    const totalArticles = entries.reduce((sum, entry) => sum + entry.data.length, 0)
    
    const timestamps = entries.map(entry => entry.timestamp)
    const oldestEntry = timestamps.length > 0 ? Math.min(...timestamps) : null
    const newestEntry = timestamps.length > 0 ? Math.max(...timestamps) : null

    return {
      totalEntries,
      totalArticles,
      oldestEntry,
      newestEntry,
    }
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