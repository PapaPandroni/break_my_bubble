// Dynamic data loaders for code splitting
import { TopicKeywords } from '../types'

// Cache for dynamically loaded data
let multiLanguageKeywordsCache: any = null
let topicsCache: TopicKeywords[] | null = null
let newsSourcesCache: any = null

/**
 * Dynamically imports multilanguage keywords data
 * This large 40KB file is only loaded when needed
 */
export async function loadMultiLanguageKeywords() {
  if (multiLanguageKeywordsCache) {
    return multiLanguageKeywordsCache
  }
  
  try {
    const module = await import('./multiLanguageKeywords')
    multiLanguageKeywordsCache = module.MULTI_LANGUAGE_TOPICS
    return multiLanguageKeywordsCache
  } catch (error) {
    console.error('Failed to load multilanguage keywords:', error)
    // Return empty array as fallback
    return []
  }
}

/**
 * Dynamically imports topics data
 * This 8KB file contains topic configurations and keywords
 */
export async function loadTopics(): Promise<TopicKeywords[]> {
  if (topicsCache) {
    return topicsCache
  }
  
  try {
    const module = await import('./topics')
    topicsCache = module.TOPICS
    return topicsCache
  } catch (error) {
    console.error('Failed to load topics:', error)
    // Return minimal fallback topics
    return [
      {
        topic: 'General News',
        keywords: ['news', 'breaking', 'latest'],
        fallbackKeywords: ['news', 'today', 'current']
      }
    ]
  }
}

/**
 * Dynamically imports news sources data
 * This 4KB file contains static news source configurations
 */
export async function loadNewsSources() {
  if (newsSourcesCache) {
    return newsSourcesCache
  }
  
  try {
    const module = await import('./newsSources')
    newsSourcesCache = module.NEWS_SOURCES
    return newsSourcesCache
  } catch (error) {
    console.error('Failed to load news sources:', error)
    // Return minimal fallback sources
    return [
      {
        id: 'generic',
        name: 'Generic News',
        description: 'Fallback news source',
        url: 'https://example.com',
        category: 'general',
        language: 'en',
        country: 'us',
        politicalLean: 'center',
        credibilityScore: 0.5,
        isDynamic: false
      }
    ]
  }
}

/**
 * Preload critical data that's likely to be needed soon
 * Call this when user starts interacting with the app
 */
export function preloadCriticalData() {
  // Preload topics since they're needed for topic selection
  loadTopics().catch(() => {
    // Silently handle errors, fallbacks are provided
  })
  
  // Preload news sources since they're needed for source selection
  loadNewsSources().catch(() => {
    // Silently handle errors, fallbacks are provided
  })
}

/**
 * Clear all data caches (useful for testing or memory management)
 */
export function clearDataCaches() {
  multiLanguageKeywordsCache = null
  topicsCache = null
  newsSourcesCache = null
}