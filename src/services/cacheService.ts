import { Article, FeedCache, CachedFeed } from '../types'

const CACHE_DURATION = 30 * 60 * 1000 // 30 minutes in milliseconds
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
      if (this.isExpired(this.cache[sourceId], now)) {
        delete this.cache[sourceId]
        hasExpired = true
      }
    })

    if (hasExpired) {
      this.saveCacheToStorage()
    }
  }

  private isExpired(cachedFeed: CachedFeed, currentTime = Date.now()): boolean {
    return currentTime - cachedFeed.timestamp > CACHE_DURATION
  }

  getCachedFeed(sourceId: string): Article[] | null {
    const cached = this.cache[sourceId]
    
    if (!cached) {
      return null
    }

    if (this.isExpired(cached)) {
      delete this.cache[sourceId]
      this.saveCacheToStorage()
      return null
    }

    return cached.data
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
  const minutes = Math.floor(ageMs / 60000)
  if (minutes < 1) {
    return 'Less than 1 minute ago'
  } else if (minutes === 1) {
    return '1 minute ago'
  } else {
    return `${minutes} minutes ago`
  }
}