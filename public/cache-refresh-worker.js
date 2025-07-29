/**
 * Cache Refresh Service Worker
 * Handles background cache refresh for BreakMyBubble app
 */

const CACHE_NAME = 'break-my-bubble-cache-v1'
const REFRESH_INTERVAL = 5 * 60 * 1000 // 5 minutes

// Track refresh operations
let refreshOperations = new Map()

self.addEventListener('install', (event) => {
  console.log('Cache refresh service worker installed')
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  console.log('Cache refresh service worker activated')
  event.waitUntil(self.clients.claim())
  
  // Start periodic refresh check
  startPeriodicRefresh()
})

self.addEventListener('message', (event) => {
  const { type, sourceId, priority } = event.data
  
  if (type === 'CACHE_REFRESH_REQUEST') {
    handleRefreshRequest(sourceId, priority, event.source)
  } else if (type === 'CACHE_REFRESH_STATUS') {
    event.source.postMessage({
      type: 'CACHE_REFRESH_STATUS_RESPONSE',
      operations: Array.from(refreshOperations.entries()).map(([id, op]) => ({
        sourceId: id,
        ...op
      }))
    })
  }
})

/**
 * Handle cache refresh request from main thread
 */
async function handleRefreshRequest(sourceId, priority = 'medium', client) {
  try {
    // Check if already refreshing
    if (refreshOperations.has(sourceId)) {
      const existing = refreshOperations.get(sourceId)
      if (existing.status === 'refreshing') {
        console.log(`Refresh already in progress for ${sourceId}`)
        return
      }
    }
    
    // Start refresh operation
    refreshOperations.set(sourceId, {
      status: 'refreshing',
      priority,
      startTime: Date.now(),
      retryCount: 0
    })
    
    console.log(`Starting background refresh for ${sourceId} (priority: ${priority})`)
    
    // Notify main thread to perform actual refresh
    const clients = await self.clients.matchAll()
    clients.forEach(client => {
      client.postMessage({
        type: 'BACKGROUND_REFRESH_EXECUTE',
        sourceId,
        priority
      })
    })
    
    // Set timeout for refresh operation
    setTimeout(() => {
      const operation = refreshOperations.get(sourceId)
      if (operation && operation.status === 'refreshing') {
        // Mark as timed out
        refreshOperations.set(sourceId, {
          ...operation,
          status: 'timeout',
          endTime: Date.now()
        })
        console.warn(`Background refresh timeout for ${sourceId}`)
      }
    }, 30000) // 30 second timeout
    
  } catch (error) {
    console.error(`Background refresh failed for ${sourceId}:`, error)
    refreshOperations.set(sourceId, {
      status: 'error',
      priority,
      startTime: Date.now(),
      endTime: Date.now(),
      error: error.message,
      retryCount: 0
    })
  }
}

/**
 * Mark refresh operation as completed
 */
function markRefreshCompleted(sourceId, success = true) {
  const operation = refreshOperations.get(sourceId)
  if (operation) {
    refreshOperations.set(sourceId, {
      ...operation,
      status: success ? 'completed' : 'failed',
      endTime: Date.now()
    })
    
    // Clean up completed operations after 5 minutes
    setTimeout(() => {
      refreshOperations.delete(sourceId)
    }, 5 * 60 * 1000)
  }
}

/**
 * Start periodic refresh check
 */
function startPeriodicRefresh() {
  setInterval(async () => {
    try {
      const clients = await self.clients.matchAll()
      if (clients.length === 0) return // No active clients
      
      // Request cache status from main thread
      clients.forEach(client => {
        client.postMessage({
          type: 'PERIODIC_CACHE_CHECK'
        })
      })
    } catch (error) {
      console.error('Periodic refresh check failed:', error)
    }
  }, REFRESH_INTERVAL)
}

/**
 * Handle fetch events for cache-first strategy
 */
self.addEventListener('fetch', (event) => {
  // Only handle API requests
  if (event.request.url.includes('/api/') || event.request.url.includes('newsapi.org')) {
    event.respondWith(
      caches.match(event.request).then(response => {
        if (response) {
          // Return cached response and trigger background refresh if stale
          const cacheDate = response.headers.get('cache-date')
          if (cacheDate) {
            const age = Date.now() - new Date(cacheDate).getTime()
            if (age > 2 * 60 * 60 * 1000) { // 2 hours
              // Trigger background refresh without blocking response
              const sourceId = extractSourceIdFromUrl(event.request.url)
              if (sourceId) {
                handleRefreshRequest(sourceId, 'low')
              }
            }
          }
          return response
        }
        
        // Fetch from network and cache
        return fetch(event.request).then(response => {
          if (response.ok) {
            const responseClone = response.clone()
            caches.open(CACHE_NAME).then(cache => {
              // Add cache date header
              const headers = new Headers(responseClone.headers)
              headers.set('cache-date', new Date().toISOString())
              
              const modifiedResponse = new Response(responseClone.body, {
                status: responseClone.status,
                statusText: responseClone.statusText,
                headers
              })
              
              cache.put(event.request, modifiedResponse)
            })
          }
          return response
        })
      })
    )
  }
})

/**
 * Extract source ID from API URL
 */
function extractSourceIdFromUrl(url) {
  // Simple extraction - could be enhanced based on actual API patterns
  const match = url.match(/sources?[=/]([^&/?]+)/)
  return match ? match[1] : null
}

/**
 * Clean up old cache entries
 */
async function cleanupCache() {
  try {
    const cache = await caches.open(CACHE_NAME)
    const requests = await cache.keys()
    
    const now = Date.now()
    const maxAge = 24 * 60 * 60 * 1000 // 24 hours
    
    for (const request of requests) {
      const response = await cache.match(request)
      if (response) {
        const cacheDate = response.headers.get('cache-date')
        if (cacheDate) {
          const age = now - new Date(cacheDate).getTime()
          if (age > maxAge) {
            await cache.delete(request)
            console.log(`Deleted stale cache entry: ${request.url}`)
          }
        }
      }
    }
  } catch (error) {
    console.error('Cache cleanup failed:', error)
  }
}

// Run cache cleanup every hour
setInterval(cleanupCache, 60 * 60 * 1000)

// Listen for refresh completion messages from main thread
self.addEventListener('message', (event) => {
  if (event.data.type === 'REFRESH_COMPLETED') {
    markRefreshCompleted(event.data.sourceId, event.data.success)
  }
})