/**
 * Advanced Request Optimization System
 * 
 * Provides comprehensive request deduplication, rate limiting, queuing,
 * and analytics for NewsAPI requests to prevent duplicate calls and
 * stay within API rate limits.
 */

import { NewsAPIError } from './newsApiService';

// Types for request optimization
export interface RequestConfig {
  url: string;
  method?: string;
  headers?: Record<string, string>;
  body?: string;
  timeout?: number;
  priority?: RequestPriority;
  retryConfig?: RetryConfig;
  cacheKey?: string;
}

export interface RetryConfig {
  maxRetries: number;
  baseDelay: number;
  maxDelay: number;
  backoffMultiplier: number;
  retryableStatuses: number[];
}

export type RequestPriority = 'high' | 'medium' | 'low';

export interface QueuedRequest {
  id: string;
  config: RequestConfig;
  promise: Promise<Response>;
  resolve: (value: Response) => void;
  reject: (reason: any) => void;
  timestamp: number;
  retryCount: number;
  lastAttempt?: number;
}

export interface RateLimitConfig {
  requestsPerSecond: number;
  requestsPerMinute: number;
  requestsPerHour: number;
  requestsPerDay: number;
  burstLimit: number;
}

export interface RequestAnalytics {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  duplicatesBlocked: number;
  rateLimitHits: number;
  averageResponseTime: number;
  requestsByPriority: Record<RequestPriority, number>;
  errorsByStatus: Record<number, number>;
  retryAttempts: number;
  lastResetTime: number;
}

export interface InFlightRequest {
  promise: Promise<Response>;
  timestamp: number;
  requestId: string;
}

// Default configurations
const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  baseDelay: 1000,
  maxDelay: 30000,
  backoffMultiplier: 2,
  retryableStatuses: [429, 502, 503, 504, 408]
};

const DEFAULT_RATE_LIMIT_CONFIG: RateLimitConfig = {
  requestsPerSecond: 1,
  requestsPerMinute: 60,
  requestsPerHour: 1000,
  requestsPerDay: 1000,
  burstLimit: 5
};

/**
 * Advanced Request Optimizer with deduplication, rate limiting, and queuing
 */
export class RequestOptimizer {
  private inFlightRequests = new Map<string, InFlightRequest>();
  private requestQueue: QueuedRequest[] = [];
  // Note: rateLimitTokens not currently used, using timestamp-based approach instead
  private rateLimitTimestamps = new Map<string, number[]>();
  private analytics: RequestAnalytics;
  private isProcessingQueue = false;
  private queueProcessingInterval?: number;
  
  constructor(
    private rateLimitConfig: RateLimitConfig = DEFAULT_RATE_LIMIT_CONFIG,
    private enableAnalytics = true
  ) {
    this.analytics = this.initializeAnalytics();
    this.startQueueProcessor();
  }

  private initializeAnalytics(): RequestAnalytics {
    return {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      duplicatesBlocked: 0,
      rateLimitHits: 0,
      averageResponseTime: 0,
      requestsByPriority: { high: 0, medium: 0, low: 0 },
      errorsByStatus: {},
      retryAttempts: 0,
      lastResetTime: Date.now()
    };
  }

  /**
   * Generate a unique key for request deduplication
   */
  private generateRequestKey(config: RequestConfig): string {
    if (config.cacheKey) {
      return config.cacheKey;
    }
    
    const method = config.method || 'GET';
    const headers = JSON.stringify(config.headers || {});
    const body = config.body || '';
    
    // Create a hash-like key from URL, method, headers, and body
    return btoa(`${method}:${config.url}:${headers}:${body}`);
  }

  /**
   * Check if request is already in flight
   */
  private isDuplicateRequest(key: string): boolean {
    const inFlight = this.inFlightRequests.get(key);
    if (!inFlight) return false;
    
    // Check if request is still valid (not too old)
    const maxAge = 30000; // 30 seconds
    return (Date.now() - inFlight.timestamp) < maxAge;
  }

  /**
   * Check rate limiting constraints
   */
  private checkRateLimit(): { allowed: boolean; waitTime: number } {
    const now = Date.now();
    const timestamps = this.rateLimitTimestamps.get('newsapi') || [];
    
    // Clean old timestamps
    const validTimestamps = timestamps.filter(ts => {
      return (now - ts) < 24 * 60 * 60 * 1000; // Keep last 24 hours
    });
    
    // Check different time windows
    const lastSecond = validTimestamps.filter(ts => (now - ts) < 1000).length;
    const lastMinute = validTimestamps.filter(ts => (now - ts) < 60000).length;
    const lastHour = validTimestamps.filter(ts => (now - ts) < 3600000).length;
    const lastDay = validTimestamps.length;
    
    // Check limits
    if (lastSecond >= this.rateLimitConfig.requestsPerSecond) {
      return { allowed: false, waitTime: 1000 };
    }
    if (lastMinute >= this.rateLimitConfig.requestsPerMinute) {
      return { allowed: false, waitTime: 60000 - (now - validTimestamps[validTimestamps.length - 60]) };
    }
    if (lastHour >= this.rateLimitConfig.requestsPerHour) {
      return { allowed: false, waitTime: 3600000 - (now - validTimestamps[validTimestamps.length - this.rateLimitConfig.requestsPerHour]) };
    }
    if (lastDay >= this.rateLimitConfig.requestsPerDay) {
      return { allowed: false, waitTime: 86400000 - (now - validTimestamps[0]) };
    }
    
    return { allowed: true, waitTime: 0 };
  }

  /**
   * Record request for rate limiting
   */
  private recordRequest(): void {
    const now = Date.now();
    const timestamps = this.rateLimitTimestamps.get('newsapi') || [];
    timestamps.push(now);
    
    // Keep only last 24 hours of timestamps
    const validTimestamps = timestamps.filter(ts => (now - ts) < 24 * 60 * 60 * 1000);
    this.rateLimitTimestamps.set('newsapi', validTimestamps);
  }

  /**
   * Add request to queue with priority handling
   */
  private queueRequest(config: RequestConfig): Promise<Response> {
    return new Promise<Response>((resolve, reject) => {
      const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const queuedRequest: QueuedRequest = {
        id: requestId,
        config,
        promise: Promise.resolve() as any, // Will be replaced
        resolve,
        reject,
        timestamp: Date.now(),
        retryCount: 0
      };
      
      // Insert based on priority
      const priority = config.priority || 'medium';
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      
      let insertIndex = this.requestQueue.length;
      for (let i = 0; i < this.requestQueue.length; i++) {
        const queuePriority = this.requestQueue[i].config.priority || 'medium';
        if (priorityOrder[priority] < priorityOrder[queuePriority]) {
          insertIndex = i;
          break;
        }
      }
      
      this.requestQueue.splice(insertIndex, 0, queuedRequest);
      
      if (this.enableAnalytics) {
        this.analytics.requestsByPriority[priority]++;
      }
    });
  }

  /**
   * Execute request with retry logic
   */
  private async executeRequest(config: RequestConfig): Promise<Response> {
    const retryConfig = { ...DEFAULT_RETRY_CONFIG, ...config.retryConfig };
    let lastError: Error = new Error('Request failed');
    
    for (let attempt = 0; attempt <= retryConfig.maxRetries; attempt++) {
      try {
        const startTime = Date.now();
        
        // Create fetch request
        const fetchOptions: RequestInit = {
          method: config.method || 'GET',
          headers: config.headers,
          body: config.body,
          signal: config.timeout ? AbortSignal.timeout(config.timeout) : undefined
        };
        
        const response = await fetch(config.url, fetchOptions);
        
        // Record timing
        if (this.enableAnalytics) {
          const responseTime = Date.now() - startTime;
          this.analytics.averageResponseTime = 
            (this.analytics.averageResponseTime * this.analytics.successfulRequests + responseTime) / 
            (this.analytics.successfulRequests + 1);
        }
        
        // Check if response should be retried
        if (!response.ok && retryConfig.retryableStatuses.includes(response.status)) {
          throw new NewsAPIError(
            `Request failed with status ${response.status}`,
            'retryableError',
            response.status
          );
        }
        
        if (this.enableAnalytics) {
          this.analytics.successfulRequests++;
          if (attempt > 0) {
            this.analytics.retryAttempts += attempt;
          }
        }
        
        return response;
        
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        
        if (this.enableAnalytics) {
          if (error instanceof NewsAPIError && error.statusCode) {
            this.analytics.errorsByStatus[error.statusCode] = 
              (this.analytics.errorsByStatus[error.statusCode] || 0) + 1;
          }
        }
        
        // Don't retry on the last attempt
        if (attempt === retryConfig.maxRetries) break;
        
        // Calculate delay with exponential backoff
        const delay = Math.min(
          retryConfig.baseDelay * Math.pow(retryConfig.backoffMultiplier, attempt),
          retryConfig.maxDelay
        );
        
        // Add jitter to prevent thundering herd
        const jitteredDelay = delay + Math.random() * 1000;
        
        console.log(`Request attempt ${attempt + 1} failed, retrying in ${jitteredDelay}ms:`, 
          error instanceof Error ? error.message : String(error));
        await new Promise(resolve => setTimeout(resolve, jitteredDelay));
      }
    }
    
    if (this.enableAnalytics) {
      this.analytics.failedRequests++;
    }
    
    throw lastError;
  }

  /**
   * Process queued requests
   */
  private async processQueue(): Promise<void> {
    if (this.isProcessingQueue || this.requestQueue.length === 0) return;
    
    this.isProcessingQueue = true;
    
    try {
      while (this.requestQueue.length > 0) {
        const rateLimitCheck = this.checkRateLimit();
        
        if (!rateLimitCheck.allowed) {
          if (this.enableAnalytics) {
            this.analytics.rateLimitHits++;
          }
          
          // Wait before processing more requests
          await new Promise(resolve => setTimeout(resolve, Math.min(rateLimitCheck.waitTime, 5000)));
          continue;
        }
        
        const request = this.requestQueue.shift();
        if (!request) continue;
        
        try {
          this.recordRequest();
          const response = await this.executeRequest(request.config);
          request.resolve(response);
        } catch (error) {
          request.reject(error);
        }
      }
    } finally {
      this.isProcessingQueue = false;
    }
  }

  /**
   * Start the queue processor
   */
  private startQueueProcessor(): void {
    if (this.queueProcessingInterval) return;
    
    this.queueProcessingInterval = setInterval(() => {
      this.processQueue().catch(console.error);
    }, 100); // Process queue every 100ms
  }

  /**
   * Make an optimized request with deduplication, rate limiting, and queuing
   */
  public async request(config: RequestConfig): Promise<Response> {
    if (this.enableAnalytics) {
      this.analytics.totalRequests++;
    }
    
    const requestKey = this.generateRequestKey(config);
    
    // Check for duplicate in-flight request
    if (this.isDuplicateRequest(requestKey)) {
      if (this.enableAnalytics) {
        this.analytics.duplicatesBlocked++;
      }
      
      const inFlight = this.inFlightRequests.get(requestKey)!;
      console.log('Reusing in-flight request:', requestKey);
      return inFlight.promise;
    }
    
    // Create new request promise
    const requestPromise = this.queueRequest(config);
    
    // Track in-flight request
    this.inFlightRequests.set(requestKey, {
      promise: requestPromise,
      timestamp: Date.now(),
      requestId: requestKey
    });
    
    // Clean up after request completes
    requestPromise.finally(() => {
      this.inFlightRequests.delete(requestKey);
    });
    
    return requestPromise;
  }

  /**
   * Get current analytics
   */
  public getAnalytics(): RequestAnalytics {
    return { ...this.analytics };
  }

  /**
   * Reset analytics
   */
  public resetAnalytics(): void {
    this.analytics = this.initializeAnalytics();
  }

  /**
   * Get queue status
   */
  public getQueueStatus(): {
    queueLength: number;
    inFlightCount: number;
    isProcessing: boolean;
  } {
    return {
      queueLength: this.requestQueue.length,
      inFlightCount: this.inFlightRequests.size,
      isProcessing: this.isProcessingQueue
    };
  }

  /**
   * Update rate limit configuration
   */
  public updateRateLimitConfig(config: Partial<RateLimitConfig>): void {
    this.rateLimitConfig = { ...this.rateLimitConfig, ...config };
  }

  /**
   * Clear all queued requests
   */
  public clearQueue(): void {
    this.requestQueue.forEach(request => {
      request.reject(new Error('Request queue cleared'));
    });
    this.requestQueue = [];
  }

  /**
   * Cleanup resources
   */
  public destroy(): void {
    if (this.queueProcessingInterval) {
      clearInterval(this.queueProcessingInterval);
      this.queueProcessingInterval = undefined;
    }
    
    this.clearQueue();
    this.inFlightRequests.clear();
  }
}

// Singleton instance for the application
export const requestOptimizer = new RequestOptimizer();

// Helper function to detect NewsAPI tier from response headers
export function detectNewsAPITier(response: Response): Partial<RateLimitConfig> {
  const remaining = response.headers.get('X-RateLimit-Remaining');
  const limit = response.headers.get('X-RateLimit-Limit');
  
  if (remaining && limit) {
    const limitNum = parseInt(limit);
    
    // Business tier typically has higher limits
    if (limitNum > 1000) {
      return {
        requestsPerDay: limitNum,
        requestsPerHour: Math.floor(limitNum / 24),
        requestsPerMinute: Math.floor(limitNum / (24 * 60)),
        requestsPerSecond: Math.max(1, Math.floor(limitNum / (24 * 60 * 60)))
      };
    }
  }
  
  // Default to free tier limits
  return DEFAULT_RATE_LIMIT_CONFIG;
}