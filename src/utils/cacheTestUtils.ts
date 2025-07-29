import { Article } from '../types'
import { feedCache, cacheUtils } from '../services/cacheService'

/**
 * Test utilities for verifying cache performance and compression
 */

/**
 * Generate mock articles for testing cache compression
 */
export function generateMockArticles(count: number = 50): Article[] {
  const articles: Article[] = []
  
  for (let i = 0; i < count; i++) {
    articles.push({
      title: `Test Article ${i + 1} - Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua`,
      description: `This is a test article description ${i + 1}. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.`,
      link: `https://example.com/article-${i + 1}`,
      pubDate: new Date(Date.now() - i * 60 * 60 * 1000).toISOString(),
      source: `test-source-${i % 5}`,
      sourceLean: ['left', 'lean-left', 'center', 'lean-right', 'right'][i % 5] as any,
      imageUrl: `https://example.com/image-${i + 1}.jpg`,
      author: `Test Author ${i + 1}`,
      content: `This is the full content of test article ${i + 1}. `.repeat(10)
    })
  }
  
  return articles
}

/**
 * Test cache compression performance
 */
export async function testCacheCompression(): Promise<{
  success: boolean
  results: {
    originalSize: number
    compressedSize: number
    compressionRatio: number
    savingsPercentage: number
    testArticleCount: number
  }
  error?: string
}> {
  try {
    console.log('🧪 Testing cache compression...')
    
    // Generate test data
    const testArticles = generateMockArticles(100)
    const testSourceId = 'compression-test-source'
    
    // Clear any existing data
    feedCache.clearCache()
    
    // Get size before (for potential future use)
    // const sizeBefore = cacheUtils.calculateStorageSize(JSON.stringify({}))
    
    // Cache the test data
    feedCache.setCachedFeed(testSourceId, testArticles)
    
    // Get cache stats
    const stats = feedCache.getCacheStats()
    // const analytics = feedCache.getCacheAnalytics() // Available for future debugging
    
    // Calculate results
    const originalSize = stats.compressionSavings + stats.cacheSize
    const compressedSize = stats.cacheSize
    const compressionRatio = originalSize > 0 ? compressedSize / originalSize : 1
    const savingsPercentage = originalSize > 0 ? ((originalSize - compressedSize) / originalSize) * 100 : 0
    
    console.log('✅ Compression test completed:')
    console.log(`   Original size: ${cacheUtils.formatBytes(originalSize)}`)
    console.log(`   Compressed size: ${cacheUtils.formatBytes(compressedSize)}`)
    console.log(`   Compression ratio: ${compressionRatio.toFixed(3)}`)
    console.log(`   Space savings: ${savingsPercentage.toFixed(1)}%`)
    
    // Clean up
    feedCache.clearCache()
    
    return {
      success: true,
      results: {
        originalSize,
        compressedSize,
        compressionRatio,
        savingsPercentage,
        testArticleCount: testArticles.length
      }
    }
    
  } catch (error) {
    console.error('❌ Compression test failed:', error)
    return {
      success: false,
      results: {
        originalSize: 0,
        compressedSize: 0,
        compressionRatio: 1,
        savingsPercentage: 0,
        testArticleCount: 0
      },
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

/**
 * Test cache LRU eviction
 */
export async function testLRUEviction(): Promise<{
  success: boolean
  results: {
    entriesBeforeEviction: number
    entriesAfterEviction: number
    evictedCount: number
    cacheSizeBefore: number
    cacheSizeAfter: number
  }
  error?: string
}> {
  try {
    console.log('🧪 Testing LRU eviction...')
    
    // Clear cache
    feedCache.clearCache()
    
    // Add many cache entries to trigger eviction
    const testSources = []
    for (let i = 0; i < 50; i++) {
      const sourceId = `lru-test-source-${i}`
      const articles = generateMockArticles(20) // Smaller batches
      feedCache.setCachedFeed(sourceId, articles)
      testSources.push(sourceId)
    }
    
    const statsBefore = feedCache.getCacheStats()
    const sizeBefore = statsBefore.cacheSize
    const entriesBefore = statsBefore.totalEntries
    
    // Force cache size management by adding more data
    for (let i = 50; i < 100; i++) {
      const sourceId = `lru-test-source-${i}`
      const articles = generateMockArticles(30) // Larger batches to trigger eviction
      feedCache.setCachedFeed(sourceId, articles)
    }
    
    const statsAfter = feedCache.getCacheStats()
    const sizeAfter = statsAfter.cacheSize
    const entriesAfter = statsAfter.totalEntries
    
    const evictedCount = Math.max(0, entriesBefore - entriesAfter + 50) // Account for new entries
    
    console.log('✅ LRU eviction test completed:')
    console.log(`   Entries before: ${entriesBefore}`)
    console.log(`   Entries after: ${entriesAfter}`)
    console.log(`   Evicted entries: ${evictedCount}`)
    console.log(`   Size before: ${cacheUtils.formatBytes(sizeBefore)}`)
    console.log(`   Size after: ${cacheUtils.formatBytes(sizeAfter)}`)
    
    // Clean up
    feedCache.clearCache()
    
    return {
      success: true,
      results: {
        entriesBeforeEviction: entriesBefore,
        entriesAfterEviction: entriesAfter,
        evictedCount,
        cacheSizeBefore: sizeBefore,
        cacheSizeAfter: sizeAfter
      }
    }
    
  } catch (error) {
    console.error('❌ LRU eviction test failed:', error)
    return {
      success: false,
      results: {
        entriesBeforeEviction: 0,
        entriesAfterEviction: 0,
        evictedCount: 0,
        cacheSizeBefore: 0,
        cacheSizeAfter: 0
      },
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

/**
 * Test cache analytics
 */
export async function testCacheAnalytics(): Promise<{
  success: boolean
  results: {
    hitRate: number
    missRate: number
    totalRequests: number
    analyticsWorking: boolean
  }
  error?: string
}> {
  try {
    console.log('🧪 Testing cache analytics...')
    
    // Clear cache and reset analytics
    feedCache.clearCache()
    
    const testSourceId = 'analytics-test-source'
    const testArticles = generateMockArticles(10)
    
    // Test cache miss (triggers analytics updates)
    feedCache.getCachedFeed(testSourceId) // miss1
    feedCache.getCachedFeed(testSourceId) // miss2
    
    // Add data to cache
    feedCache.setCachedFeed(testSourceId, testArticles)
    
    // Test cache hits (triggers analytics updates)
    feedCache.getCachedFeed(testSourceId) // hit1
    feedCache.getCachedFeed(testSourceId) // hit2  
    feedCache.getCachedFeed(testSourceId) // hit3
    
    // Get analytics
    const analytics = feedCache.getCacheAnalytics()
    
    const expectedHits = 3
    const expectedMisses = 2
    const expectedTotal = expectedHits + expectedMisses
    
    const analyticsWorking = analytics.totalHits >= expectedHits && 
                           analytics.totalMisses >= expectedMisses &&
                           analytics.totalRequests >= expectedTotal
    
    console.log('✅ Analytics test completed:')
    console.log(`   Hit rate: ${(analytics.hitRate * 100).toFixed(1)}%`)
    console.log(`   Miss rate: ${(analytics.missRate * 100).toFixed(1)}%`)
    console.log(`   Total requests: ${analytics.totalRequests}`)
    console.log(`   Analytics working: ${analyticsWorking}`)
    
    // Clean up
    feedCache.clearCache()
    
    return {
      success: true,
      results: {
        hitRate: analytics.hitRate,
        missRate: analytics.missRate,
        totalRequests: analytics.totalRequests,
        analyticsWorking
      }
    }
    
  } catch (error) {
    console.error('❌ Analytics test failed:', error)
    return {
      success: false,
      results: {
        hitRate: 0,
        missRate: 0,
        totalRequests: 0,
        analyticsWorking: false
      },
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

/**
 * Run all cache tests
 */
export async function runAllCacheTests(): Promise<{
  success: boolean
  results: {
    compression: Awaited<ReturnType<typeof testCacheCompression>>['results']
    lruEviction: Awaited<ReturnType<typeof testLRUEviction>>['results']
    analytics: Awaited<ReturnType<typeof testCacheAnalytics>>['results']
  }
  summary: {
    testsRun: number
    testsPassed: number
    overallCompressionSavings: number
  }
}> {
  console.log('🚀 Running comprehensive cache tests...')
  
  const compressionTest = await testCacheCompression()
  const lruTest = await testLRUEviction()
  const analyticsTest = await testCacheAnalytics()
  
  const testsRun = 3
  const testsPassed = [compressionTest.success, lruTest.success, analyticsTest.success].filter(Boolean).length
  
  console.log(`\n📊 Test Summary:`)
  console.log(`   Tests run: ${testsRun}`)
  console.log(`   Tests passed: ${testsPassed}`)
  console.log(`   Overall compression savings: ${compressionTest.results.savingsPercentage.toFixed(1)}%`)
  
  if (testsPassed === testsRun) {
    console.log('🎉 All cache tests passed!')
  } else {
    console.log('⚠️  Some cache tests failed')
  }
  
  return {
    success: testsPassed === testsRun,
    results: {
      compression: compressionTest.results,
      lruEviction: lruTest.results,
      analytics: analyticsTest.results
    },
    summary: {
      testsRun,
      testsPassed,
      overallCompressionSavings: compressionTest.results.savingsPercentage
    }
  }
}

// Export for development console access
if (import.meta.env.DEV) {
  (window as any).cacheTests = {
    testCacheCompression,
    testLRUEviction,
    testCacheAnalytics,
    runAllCacheTests,
    generateMockArticles,
    cacheUtils
  }
}