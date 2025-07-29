/**
 * NewsAPI-specific Request Optimizer
 * 
 * Provides NewsAPI-optimized request handling with intelligent caching,
 * error handling, and API-specific rate limiting strategies.
 */

import { requestOptimizer, RequestConfig, RequestPriority, detectNewsAPITier } from './requestOptimizer';
import { NewsAPIError } from './newsApiService';

export interface NewsAPIRequestConfig {
  endpoint: 'everything' | 'sources' | 'top-headlines';
  params: URLSearchParams;
  priority?: RequestPriority;
  timeout?: number;
  cacheKey?: string;
}

export interface NewsAPIAnalytics {
  endpointUsage: Record<string, number>;
  averageResponseSizes: Record<string, number>;
  errorPatterns: Record<string, number>;
  cachingEfficiency: number;
  optimalRequestTiming: Record<string, number>;
}

/**
 * NewsAPI-optimized request manager
 */
export class NewsAPIOptimizer {
  private baseUrl = 'https://newsapi.org/v2';
  private apiKey: string;
  private analytics: NewsAPIAnalytics;
  private lastTierDetection = 0;
  private tierDetectionInterval = 60 * 60 * 1000; // 1 hour

  constructor(apiKey: string) {
    this.apiKey = apiKey;
    this.analytics = this.initializeAnalytics();
    
    // Validate API key
    if (!apiKey || apiKey.length < 32) {
      throw new Error('Invalid NewsAPI key provided');
    }
  }

  private initializeAnalytics(): NewsAPIAnalytics {
    return {
      endpointUsage: {},
      averageResponseSizes: {},
      errorPatterns: {},
      cachingEfficiency: 0,
      optimalRequestTiming: {}
    };
  }

  /**
   * Generate cache key for NewsAPI requests
   */
  private generateCacheKey(endpoint: string, params: URLSearchParams): string {
    // Remove API key from cache key for security
    const cacheParams = new URLSearchParams(params);
    cacheParams.delete('apiKey');
    
    // Sort parameters for consistent cache keys
    const sortedParams = Array.from(cacheParams.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => `${key}=${value}`)
      .join('&');
    
    return `newsapi:${endpoint}:${btoa(sortedParams)}`;
  }

  /**
   * Optimize parameters for better API efficiency
   */
  private optimizeParams(params: URLSearchParams): URLSearchParams {
    const optimized = new URLSearchParams(params);
    
    // Ensure API key is present
    if (!optimized.has('apiKey')) {
      optimized.set('apiKey', this.apiKey);
    }
    
    // Optimize page size for better performance
    const pageSize = optimized.get('pageSize');
    if (!pageSize) {
      // Use smaller page size for better response times
      optimized.set('pageSize', '50');
    } else {
      // Cap page size to prevent timeout issues
      const pageSizeNum = parseInt(pageSize);
      if (pageSizeNum > 100) {
        optimized.set('pageSize', '100');
      }
    }
    
    // Add sorting for consistent results
    if (!optimized.has('sortBy')) {
      optimized.set('sortBy', 'publishedAt');
    }
    
    return optimized;
  }

  /**
   * Determine request priority based on parameters
   */
  private calculatePriority(endpoint: string, params: URLSearchParams): RequestPriority {
    // High priority for sources endpoint (needed for app initialization)
    if (endpoint === 'sources') {
      return 'high';
    }
    
    // High priority for small page sizes (likely initial requests)
    const pageSize = parseInt(params.get('pageSize') || '50');
    if (pageSize <= 20) {
      return 'high';
    }
    
    // High priority for recent articles (last 24 hours)
    const from = params.get('from');
    if (from) {
      const fromDate = new Date(from);
      const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      if (fromDate > dayAgo) {
        return 'high';
      }
    }
    
    // Medium priority for everything else
    return 'medium';
  }

  /**
   * Handle NewsAPI-specific errors
   */
  private handleNewsAPIError(response: Response): void {
    const status = response.status;
    
    // Update analytics
    this.analytics.errorPatterns[status] = (this.analytics.errorPatterns[status] || 0) + 1;
    
    switch (status) {
      case 401:
        throw new NewsAPIError(
          'Invalid API key. Please check your VITE_NEWS_API_KEY environment variable.',
          'unauthorized',
          401
        );
      case 429:
        throw new NewsAPIError(
          'Rate limit exceeded. The request will be automatically retried.',
          'rateLimited',
          429
        );
      case 400:
        throw new NewsAPIError(
          'Bad request to NewsAPI. Please check your request parameters.',
          'badRequest',
          400
        );
      case 500:
        throw new NewsAPIError(
          'NewsAPI server error. Please try again later.',
          'serverError',
          500
        );
      default:
        throw new NewsAPIError(
          `NewsAPI request failed with status ${status}`,
          'requestFailed',
          status
        );
    }
  }

  /**
   * Update rate limiting based on response headers
   */
  private updateRateLimiting(response: Response): void {
    const now = Date.now();
    
    // Only detect tier periodically to avoid overhead
    if (now - this.lastTierDetection > this.tierDetectionInterval) {
      const tierConfig = detectNewsAPITier(response);
      if (Object.keys(tierConfig).length > 0) {
        requestOptimizer.updateRateLimitConfig(tierConfig);
        console.log('Updated rate limiting based on detected tier:', tierConfig);
      }
      this.lastTierDetection = now;
    }
  }

  /**
   * Make optimized NewsAPI request
   */
  public async request(config: NewsAPIRequestConfig): Promise<Response> {
    const { endpoint, params, priority, timeout = 30000, cacheKey } = config;
    
    // Optimize parameters
    const optimizedParams = this.optimizeParams(params);
    
    // Build URL
    const url = `${this.baseUrl}/${endpoint}?${optimizedParams.toString()}`;
    
    // Generate cache key if not provided
    const requestCacheKey = cacheKey || this.generateCacheKey(endpoint, optimizedParams);
    
    // Determine priority if not provided
    const requestPriority = priority || this.calculatePriority(endpoint, optimizedParams);
    
    // Track analytics
    this.analytics.endpointUsage[endpoint] = (this.analytics.endpointUsage[endpoint] || 0) + 1;
    
    const requestConfig: RequestConfig = {
      url,
      method: 'GET',
      timeout,
      priority: requestPriority,
      cacheKey: requestCacheKey,
      retryConfig: {
        maxRetries: 3,
        baseDelay: 1000,
        maxDelay: 30000,
        backoffMultiplier: 2,
        retryableStatuses: [429, 502, 503, 504, 408, 500]
      }
    };
    
    try {
      const startTime = Date.now();
      const response = await requestOptimizer.request(requestConfig);
      const responseTime = Date.now() - startTime;
      
      // Update timing analytics
      this.analytics.optimalRequestTiming[endpoint] = 
        (this.analytics.optimalRequestTiming[endpoint] || 0) * 0.9 + responseTime * 0.1;
      
      // Handle non-OK responses
      if (!response.ok) {
        this.handleNewsAPIError(response);
      }
      
      // Update rate limiting information
      this.updateRateLimiting(response);
      
      // Track response size
      const contentLength = response.headers.get('content-length');
      if (contentLength) {
        const size = parseInt(contentLength);
        this.analytics.averageResponseSizes[endpoint] = 
          (this.analytics.averageResponseSizes[endpoint] || 0) * 0.9 + size * 0.1;
      }
      
      return response;
      
    } catch (error) {
      if (error instanceof NewsAPIError) {
        throw error;
      }
      
      // Wrap other errors
      throw new NewsAPIError(
        `Request to ${endpoint} failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'requestFailed'
      );
    }
  }

  /**
   * Convenience method for everything endpoint
   */
  public async fetchEverything(
    params: URLSearchParams,
    priority?: RequestPriority,
    cacheKey?: string
  ): Promise<Response> {
    return this.request({
      endpoint: 'everything',
      params,
      priority,
      cacheKey
    });
  }

  /**
   * Convenience method for sources endpoint
   */
  public async fetchSources(
    params: URLSearchParams,
    priority: RequestPriority = 'high',
    cacheKey?: string
  ): Promise<Response> {
    return this.request({
      endpoint: 'sources',
      params,
      priority,
      cacheKey
    });
  }

  /**
   * Convenience method for top headlines endpoint
   */
  public async fetchTopHeadlines(
    params: URLSearchParams,
    priority?: RequestPriority,
    cacheKey?: string
  ): Promise<Response> {
    return this.request({
      endpoint: 'top-headlines',
      params,
      priority,
      cacheKey
    });
  }

  /**
   * Check API status with rate limit information
   */
  public async checkStatus(): Promise<{
    valid: boolean;
    remaining?: number;
    limit?: number;
    resetTime?: Date;
  }> {
    try {
      const params = new URLSearchParams({
        country: 'us',
        pageSize: '1'
      });
      
      const response = await this.fetchTopHeadlines(params, 'high');
      
      const remaining = response.headers.get('X-RateLimit-Remaining');
      const limit = response.headers.get('X-RateLimit-Limit');
      const reset = response.headers.get('X-RateLimit-Reset');
      
      return {
        valid: response.ok,
        remaining: remaining ? parseInt(remaining) : undefined,
        limit: limit ? parseInt(limit) : undefined,
        resetTime: reset ? new Date(parseInt(reset) * 1000) : undefined
      };
    } catch (error) {
      return { valid: false };
    }
  }

  /**
   * Get NewsAPI-specific analytics
   */
  public getAnalytics(): NewsAPIAnalytics & {
    requestOptimizer: ReturnType<typeof requestOptimizer.getAnalytics>;
    queueStatus: ReturnType<typeof requestOptimizer.getQueueStatus>;
  } {
    return {
      ...this.analytics,
      requestOptimizer: requestOptimizer.getAnalytics(),
      queueStatus: requestOptimizer.getQueueStatus()
    };
  }

  /**
   * Reset analytics
   */
  public resetAnalytics(): void {
    this.analytics = this.initializeAnalytics();
    requestOptimizer.resetAnalytics();
  }

  /**
   * Get optimal request timing recommendations
   */
  public getTimingRecommendations(): Record<string, string> {
    const recommendations: Record<string, string> = {};
    
    Object.entries(this.analytics.optimalRequestTiming).forEach(([endpoint, avgTime]) => {
      if (avgTime > 5000) {
        recommendations[endpoint] = `Consider reducing page size or adding more specific filters. Average response time: ${Math.round(avgTime)}ms`;
      } else if (avgTime > 2000) {
        recommendations[endpoint] = `Response time is acceptable but could be optimized. Average: ${Math.round(avgTime)}ms`;
      } else {
        recommendations[endpoint] = `Optimal performance. Average response time: ${Math.round(avgTime)}ms`;
      }
    });
    
    return recommendations;
  }

  /**
   * Preload critical data with optimal timing
   */
  public async preloadCriticalData(): Promise<void> {
    try {
      // Preload sources with high priority
      const sourcesParams = new URLSearchParams();
      await this.fetchSources(sourcesParams, 'high', 'preload:sources');
      
      console.log('Critical NewsAPI data preloaded successfully');
    } catch (error) {
      console.warn('Failed to preload critical data:', error);
    }
  }
}

// Default instance for the app
const API_KEY = import.meta.env.VITE_NEWS_API_KEY;
if (!API_KEY) {
  throw new Error('VITE_NEWS_API_KEY environment variable is required');
}

export const newsApiOptimizer = new NewsAPIOptimizer(API_KEY);