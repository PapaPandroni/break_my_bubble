/**
 * Request Monitoring and Analytics Dashboard
 * 
 * Provides comprehensive monitoring tools for the request optimization system,
 * including real-time analytics, performance tracking, and debugging utilities.
 */

import { newsApiOptimizer } from './newsApiOptimizer';
import { requestOptimizer } from './requestOptimizer';

export interface MonitoringDashboard {
  performance: PerformanceMetrics;
  health: HealthMetrics;
  recommendations: string[];
  warnings: string[];
  errors: ErrorSummary[];
}

export interface PerformanceMetrics {
  averageResponseTime: number;
  requestThroughput: number;
  cachingEfficiency: number;
  rateLimitUtilization: number;
  queueEfficiency: number;
  duplicatesBlocked: number;
}

export interface HealthMetrics {
  status: 'healthy' | 'degraded' | 'critical';
  uptime: number;
  apiAvailability: number;
  errorRate: number;
  lastSuccessfulRequest: Date | null;
  systemLoad: 'low' | 'medium' | 'high';
}

export interface ErrorSummary {
  type: string;
  count: number;
  lastOccurrence: Date;
  message: string;
  severity: 'low' | 'medium' | 'high';
}

/**
 * Request monitoring and analytics service
 */
export class RequestMonitor {
  private startTime = Date.now();
  private healthHistory: Array<{ timestamp: number; status: string }> = [];
  private performanceHistory: Array<{ timestamp: number; responseTime: number }> = [];
  // Note: errorHistory not currently used, using real-time error tracking instead
  private lastAnalysis = 0;
  private analysisInterval = 30000; // 30 seconds

  /**
   * Get comprehensive monitoring dashboard
   */
  public getDashboard(): MonitoringDashboard {
    const now = Date.now();
    
    // Update analytics if needed
    if (now - this.lastAnalysis > this.analysisInterval) {
      this.updateAnalytics();
      this.lastAnalysis = now;
    }

    return {
      performance: this.getPerformanceMetrics(),
      health: this.getHealthMetrics(),
      recommendations: this.generateRecommendations(),
      warnings: this.generateWarnings(),
      errors: this.getErrorSummary()
    };
  }

  /**
   * Get performance metrics
   */
  private getPerformanceMetrics(): PerformanceMetrics {
    const optimizerAnalytics = requestOptimizer.getAnalytics();
    // Note: newsApiAnalytics available but not currently used in performance metrics
    
    return {
      averageResponseTime: optimizerAnalytics.averageResponseTime,
      requestThroughput: this.calculateThroughput(),
      cachingEfficiency: this.calculateCachingEfficiency(),
      rateLimitUtilization: this.calculateRateLimitUtilization(),
      queueEfficiency: this.calculateQueueEfficiency(),
      duplicatesBlocked: optimizerAnalytics.duplicatesBlocked
    };
  }

  /**
   * Get health metrics
   */
  private getHealthMetrics(): HealthMetrics {
    const optimizerAnalytics = requestOptimizer.getAnalytics();
    const queueStatus = requestOptimizer.getQueueStatus();
    
    const totalRequests = optimizerAnalytics.totalRequests;
    const failedRequests = optimizerAnalytics.failedRequests;
    const errorRate = totalRequests > 0 ? (failedRequests / totalRequests) * 100 : 0;
    
    let status: 'healthy' | 'degraded' | 'critical' = 'healthy';
    if (errorRate > 20) status = 'critical';
    else if (errorRate > 10 || queueStatus.queueLength > 50) status = 'degraded';
    
    return {
      status,
      uptime: Date.now() - this.startTime,
      apiAvailability: this.calculateAvailability(),
      errorRate,
      lastSuccessfulRequest: this.getLastSuccessfulRequest(),
      systemLoad: this.calculateSystemLoad()
    };
  }

  /**
   * Generate optimization recommendations
   */
  private generateRecommendations(): string[] {
    const recommendations: string[] = [];
    const analytics = requestOptimizer.getAnalytics();
    const queueStatus = requestOptimizer.getQueueStatus();
    const timingRecommendations = newsApiOptimizer.getTimingRecommendations();
    
    // Queue-based recommendations
    if (queueStatus.queueLength > 20) {
      recommendations.push('High queue length detected. Consider implementing request batching or reducing concurrent requests.');
    }
    
    // Rate limiting recommendations
    if (analytics.rateLimitHits > 5) {
      recommendations.push('Frequent rate limiting detected. Consider implementing more aggressive request spacing.');
    }
    
    // Performance recommendations
    if (analytics.averageResponseTime > 3000) {
      recommendations.push('High average response time. Consider optimizing request parameters or implementing more aggressive caching.');
    }
    
    // Caching recommendations
    const cachingEfficiency = this.calculateCachingEfficiency();
    if (cachingEfficiency < 30) {
      recommendations.push('Low caching efficiency. Review cache key generation and consider longer cache durations for stable data.');
    }
    
    // Add timing-specific recommendations
    Object.entries(timingRecommendations).forEach(([endpoint, recommendation]) => {
      if (recommendation.includes('Consider')) {
        recommendations.push(`${endpoint}: ${recommendation}`);
      }
    });
    
    return recommendations;
  }

  /**
   * Generate system warnings
   */
  private generateWarnings(): string[] {
    const warnings: string[] = [];
    const analytics = requestOptimizer.getAnalytics();
    const queueStatus = requestOptimizer.getQueueStatus();
    
    // Queue warnings
    if (queueStatus.queueLength > 50) {
      warnings.push('Critical: Request queue length exceeds 50. System may be overloaded.');
    } else if (queueStatus.queueLength > 20) {
      warnings.push('Warning: Request queue length is high. Monitor for potential bottlenecks.');
    }
    
    // Error rate warnings
    const errorRate = analytics.totalRequests > 0 ? 
      (analytics.failedRequests / analytics.totalRequests) * 100 : 0;
    
    if (errorRate > 15) {
      warnings.push('Critical: High error rate detected. Check API connectivity and configuration.');
    } else if (errorRate > 5) {
      warnings.push('Warning: Elevated error rate. Monitor for API issues.');
    }
    
    // Rate limiting warnings
    if (analytics.rateLimitHits > 10) {
      warnings.push('Warning: Frequent rate limiting. Consider upgrading API tier or optimizing request patterns.');
    }
    
    return warnings;
  }

  /**
   * Get error summary
   */
  private getErrorSummary(): ErrorSummary[] {
    const analytics = requestOptimizer.getAnalytics();
    const errors: ErrorSummary[] = [];
    
    Object.entries(analytics.errorsByStatus).forEach(([status, count]) => {
      const statusCode = parseInt(status);
      let severity: 'low' | 'medium' | 'high' = 'medium';
      let message = `HTTP ${status} errors`;
      
      switch (statusCode) {
        case 401:
          severity = 'high';
          message = 'Authentication errors - check API key';
          break;
        case 429:
          severity = 'medium';
          message = 'Rate limiting errors';
          break;
        case 500:
        case 502:
        case 503:
        case 504:
          severity = 'high';
          message = 'Server errors - API may be down';
          break;
        case 400:
          severity = 'medium';
          message = 'Bad request errors - check parameters';
          break;
      }
      
      errors.push({
        type: `HTTP_${status}`,
        count,
        lastOccurrence: new Date(),
        message,
        severity
      });
    });
    
    return errors.sort((a, b) => b.count - a.count);
  }

  /**
   * Calculate request throughput (requests per minute)
   */
  private calculateThroughput(): number {
    const analytics = requestOptimizer.getAnalytics();
    const uptimeMinutes = (Date.now() - this.startTime) / (1000 * 60);
    return uptimeMinutes > 0 ? analytics.totalRequests / uptimeMinutes : 0;
  }

  /**
   * Calculate caching efficiency percentage
   */
  private calculateCachingEfficiency(): number {
    const analytics = requestOptimizer.getAnalytics();
    const totalRequests = analytics.totalRequests;
    const duplicatesBlocked = analytics.duplicatesBlocked;
    
    return totalRequests > 0 ? (duplicatesBlocked / totalRequests) * 100 : 0;
  }

  /**
   * Calculate rate limit utilization
   */
  private calculateRateLimitUtilization(): number {
    // This would require access to actual rate limit headers
    // For now, estimate based on request frequency
    const throughput = this.calculateThroughput();
    const maxThroughput = 60; // Assume 1 request per second limit
    
    return (throughput / maxThroughput) * 100;
  }

  /**
   * Calculate queue efficiency
   */
  private calculateQueueEfficiency(): number {
    const queueStatus = requestOptimizer.getQueueStatus();
    const analytics = requestOptimizer.getAnalytics();
    
    if (analytics.totalRequests === 0) return 100;
    
    // Efficiency based on queue length relative to total requests
    const queueRatio = queueStatus.queueLength / Math.max(analytics.totalRequests, 1);
    return Math.max(0, 100 - (queueRatio * 100));
  }

  /**
   * Calculate API availability percentage
   */
  private calculateAvailability(): number {
    const analytics = requestOptimizer.getAnalytics();
    const totalRequests = analytics.totalRequests;
    const successfulRequests = analytics.successfulRequests;
    
    return totalRequests > 0 ? (successfulRequests / totalRequests) * 100 : 100;
  }

  /**
   * Get last successful request timestamp
   */
  private getLastSuccessfulRequest(): Date | null {
    const analytics = requestOptimizer.getAnalytics();
    if (analytics.successfulRequests > 0) {
      return new Date(); // Approximation - would need better tracking
    }
    return null;
  }

  /**
   * Calculate system load
   */
  private calculateSystemLoad(): 'low' | 'medium' | 'high' {
    const queueStatus = requestOptimizer.getQueueStatus();
    const analytics = requestOptimizer.getAnalytics();
    
    const queueLength = queueStatus.queueLength;
    const inFlight = queueStatus.inFlightCount;
    const errorRate = analytics.totalRequests > 0 ? 
      (analytics.failedRequests / analytics.totalRequests) * 100 : 0;
    
    if (queueLength > 30 || inFlight > 10 || errorRate > 15) {
      return 'high';
    } else if (queueLength > 10 || inFlight > 5 || errorRate > 5) {
      return 'medium';
    }
    
    return 'low';
  }

  /**
   * Update internal analytics
   */
  private updateAnalytics(): void {
    const now = Date.now();
    const analytics = requestOptimizer.getAnalytics();
    
    // Update performance history
    this.performanceHistory.push({
      timestamp: now,
      responseTime: analytics.averageResponseTime
    });
    
    // Keep only last hour of data
    const oneHourAgo = now - (60 * 60 * 1000);
    this.performanceHistory = this.performanceHistory.filter(
      entry => entry.timestamp > oneHourAgo
    );
    
    // Update health history
    const health = this.getHealthMetrics();
    this.healthHistory.push({
      timestamp: now,
      status: health.status
    });
    
    // Keep only last day of health data
    const oneDayAgo = now - (24 * 60 * 60 * 1000);
    this.healthHistory = this.healthHistory.filter(
      entry => entry.timestamp > oneDayAgo
    );
  }

  /**
   * Export analytics for external monitoring
   */
  public exportAnalytics(): {
    optimizer: ReturnType<typeof requestOptimizer.getAnalytics>;
    newsApi: ReturnType<typeof newsApiOptimizer.getAnalytics>;
    monitor: MonitoringDashboard;
  } {
    return {
      optimizer: requestOptimizer.getAnalytics(),
      newsApi: newsApiOptimizer.getAnalytics(),
      monitor: this.getDashboard()
    };
  }

  /**
   * Reset all monitoring data
   */
  public reset(): void {
    this.startTime = Date.now();
    this.healthHistory = [];
    this.performanceHistory = [];
    this.lastAnalysis = 0;
    
    requestOptimizer.resetAnalytics();
    newsApiOptimizer.resetAnalytics();
  }

  /**
   * Generate monitoring report
   */
  public generateReport(): string {
    const dashboard = this.getDashboard();
    const uptime = dashboard.health.uptime;
    const uptimeHours = Math.floor(uptime / (1000 * 60 * 60));
    const uptimeMinutes = Math.floor((uptime % (1000 * 60 * 60)) / (1000 * 60));
    
    return `
# Request Optimization Monitoring Report

## System Health: ${dashboard.health.status.toUpperCase()}
- Uptime: ${uptimeHours}h ${uptimeMinutes}m
- API Availability: ${dashboard.health.apiAvailability.toFixed(1)}%
- Error Rate: ${dashboard.health.errorRate.toFixed(1)}%
- System Load: ${dashboard.health.systemLoad}

## Performance Metrics
- Average Response Time: ${dashboard.performance.averageResponseTime.toFixed(0)}ms
- Request Throughput: ${dashboard.performance.requestThroughput.toFixed(1)} req/min
- Caching Efficiency: ${dashboard.performance.cachingEfficiency.toFixed(1)}%
- Duplicates Blocked: ${dashboard.performance.duplicatesBlocked}

## Recommendations
${dashboard.recommendations.map(r => `- ${r}`).join('\n')}

## Warnings
${dashboard.warnings.length > 0 ? dashboard.warnings.map(w => `⚠️ ${w}`).join('\n') : 'No active warnings'}

## Error Summary
${dashboard.errors.length > 0 ? 
  dashboard.errors.map(e => `- ${e.type}: ${e.count} occurrences (${e.severity} severity)`).join('\n') : 
  'No recent errors'}
    `.trim();
  }
}

// Singleton instance
export const requestMonitor = new RequestMonitor();