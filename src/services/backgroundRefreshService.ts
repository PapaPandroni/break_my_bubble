import { BackgroundRefreshConfig } from '../types'

/**
 * Background refresh service for cache management
 * Implements stale-while-revalidate pattern with smart refresh timing
 */

export interface RefreshTask {
  sourceId: string
  priority: 'high' | 'medium' | 'low'
  lastAttempt: number
  retryCount: number
  maxRetries: number
}

export interface RefreshCallback {
  (sourceId: string): Promise<void>
}

class BackgroundRefreshService {
  private config: BackgroundRefreshConfig = {
    enabled: true,
    staleThreshold: 2 * 60 * 60 * 1000, // 2 hours
    maxConcurrentRefresh: 3,
    refreshInterval: 5 * 60 * 1000, // 5 minutes
    priorityThreshold: 30 * 60 * 1000 // 30 minutes for high priority
  }
  
  private refreshQueue: RefreshTask[] = []
  private activeRefreshes = new Set<string>()
  private refreshCallback: RefreshCallback | null = null
  private intervalId: number | null = null
  private isServiceWorkerAvailable = false
  
  constructor() {
    this.checkServiceWorkerSupport()
    this.startRefreshTimer()
  }
  
  /**
   * Initialize the background refresh service
   */
  initialize(refreshCallback: RefreshCallback, config?: Partial<BackgroundRefreshConfig>): void {
    if (config) {
      this.config = { ...this.config, ...config }
    }
    
    this.refreshCallback = refreshCallback
    
    if (this.config.enabled) {
      this.startRefreshTimer()
    }
  }
  
  /**
   * Check if service worker is available for background tasks
   */
  private checkServiceWorkerSupport(): void {
    this.isServiceWorkerAvailable = 'serviceWorker' in navigator
    
    if (this.isServiceWorkerAvailable && import.meta.env.PROD) {
      this.registerServiceWorker()
    }
  }
  
  /**
   * Register service worker for background refresh
   */
  private async registerServiceWorker(): Promise<void> {
    try {
      if ('serviceWorker' in navigator) {
        await navigator.serviceWorker.register('/cache-refresh-worker.js')
        console.log('Cache refresh service worker registered')
      }
    } catch (error) {
      console.warn('Service worker registration failed:', error)
      this.isServiceWorkerAvailable = false
    }
  }
  
  /**
   * Start the refresh timer
   */
  private startRefreshTimer(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId)
    }
    
    if (this.config.enabled) {
      this.intervalId = window.setInterval(() => {
        this.processRefreshQueue()
      }, this.config.refreshInterval)
    }
  }
  
  /**
   * Stop the refresh timer
   */
  private stopRefreshTimer(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId)
      this.intervalId = null
    }
  }
  
  /**
   * Add a source to the refresh queue
   */
  queueRefresh(sourceId: string, priority: 'high' | 'medium' | 'low' = 'medium'): void {
    if (!this.config.enabled || !this.refreshCallback) {
      return
    }
    
    // Check if already queued or actively refreshing
    const existingTask = this.refreshQueue.find(task => task.sourceId === sourceId)
    if (existingTask || this.activeRefreshes.has(sourceId)) {
      return
    }
    
    const task: RefreshTask = {
      sourceId,
      priority,
      lastAttempt: 0,
      retryCount: 0,
      maxRetries: 3
    }
    
    // Insert task based on priority
    if (priority === 'high') {
      this.refreshQueue.unshift(task)
    } else {
      this.refreshQueue.push(task)
    }
    
    // Immediately process if we have capacity
    if (this.activeRefreshes.size < this.config.maxConcurrentRefresh) {
      this.processRefreshQueue()
    }
  }
  
  /**
   * Process the refresh queue
   */
  private async processRefreshQueue(): Promise<void> {
    if (!this.config.enabled || !this.refreshCallback) {
      return
    }
    
    // Process tasks while we have capacity
    while (
      this.refreshQueue.length > 0 && 
      this.activeRefreshes.size < this.config.maxConcurrentRefresh
    ) {
      const task = this.refreshQueue.shift()
      if (!task) break
      
      // Skip if too soon since last attempt
      const timeSinceLastAttempt = Date.now() - task.lastAttempt
      if (task.lastAttempt > 0 && timeSinceLastAttempt < 60000) { // 1 minute cooldown
        this.refreshQueue.push(task) // Re-queue for later
        continue
      }
      
      this.executeRefreshTask(task)
    }
  }
  
  /**
   * Execute a single refresh task
   */
  private async executeRefreshTask(task: RefreshTask): Promise<void> {
    if (!this.refreshCallback) return
    
    this.activeRefreshes.add(task.sourceId)
    task.lastAttempt = Date.now()
    
    try {
      await this.refreshCallback(task.sourceId)
      console.log(`Background refresh completed for ${task.sourceId}`)
    } catch (error) {
      console.warn(`Background refresh failed for ${task.sourceId}:`, error)
      
      task.retryCount++
      
      // Re-queue if retries remaining
      if (task.retryCount < task.maxRetries) {
        // Lower priority on retry
        if (task.priority === 'high') task.priority = 'medium'
        else if (task.priority === 'medium') task.priority = 'low'
        
        this.refreshQueue.push(task)
      }
    } finally {
      this.activeRefreshes.delete(task.sourceId)
    }
  }
  
  /**
   * Check if a source should be refreshed based on age and usage
   */
  shouldRefresh(_sourceId: string, age: number, accessCount: number = 0): boolean {
    if (!this.config.enabled) return false
    
    // High priority items (frequently accessed)
    if (accessCount > 5 && age > this.config.priorityThreshold) {
      return true
    }
    
    // Regular refresh threshold
    return age > this.config.staleThreshold
  }
  
  /**
   * Update configuration
   */
  updateConfig(config: Partial<BackgroundRefreshConfig>): void {
    const wasEnabled = this.config.enabled
    this.config = { ...this.config, ...config }
    
    if (this.config.enabled && !wasEnabled) {
      this.startRefreshTimer()
    } else if (!this.config.enabled && wasEnabled) {
      this.stopRefreshTimer()
    } else if (this.config.enabled) {
      // Restart timer with new interval
      this.startRefreshTimer()
    }
  }
  
  /**
   * Get current configuration
   */
  getConfig(): BackgroundRefreshConfig {
    return { ...this.config }
  }
  
  /**
   * Get refresh queue status
   */
  getStatus(): {
    queueLength: number
    activeRefreshes: number
    isEnabled: boolean
    hasServiceWorker: boolean
  } {
    return {
      queueLength: this.refreshQueue.length,
      activeRefreshes: this.activeRefreshes.size,
      isEnabled: this.config.enabled,
      hasServiceWorker: this.isServiceWorkerAvailable
    }
  }
  
  /**
   * Force refresh of specific source
   */
  async forceRefresh(sourceId: string): Promise<void> {
    if (!this.refreshCallback) {
      throw new Error('Background refresh service not initialized')
    }
    
    // Remove from queue if already queued
    this.refreshQueue = this.refreshQueue.filter(task => task.sourceId !== sourceId)
    
    // Execute immediately
    const task: RefreshTask = {
      sourceId,
      priority: 'high',
      lastAttempt: Date.now(),
      retryCount: 0,
      maxRetries: 1
    }
    
    await this.executeRefreshTask(task)
  }
  
  /**
   * Clear all queued refreshes
   */
  clearQueue(): void {
    this.refreshQueue = []
  }
  
  /**
   * Shutdown the service
   */
  shutdown(): void {
    this.stopRefreshTimer()
    this.clearQueue()
    this.activeRefreshes.clear()
    this.refreshCallback = null
  }
}

// Export singleton instance
export const backgroundRefreshService = new BackgroundRefreshService()

// Service worker message handling for production environments
if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
  navigator.serviceWorker.addEventListener('message', (event) => {
    if (event.data?.type === 'CACHE_REFRESH_REQUEST') {
      const { sourceId, priority } = event.data
      if (sourceId) {
        backgroundRefreshService.queueRefresh(sourceId, priority)
      }
    }
  })
}