import { fetchAvailableNewsAPISources, validateNewsAPISources, checkAPIStatus, fetchArticlesByTopic } from './newsApiService'
import { NEWS_SOURCES } from '../data/newsSources'
import { requestMonitor } from './requestMonitor'
import { newsApiOptimizer } from './newsApiOptimizer'
import { requestOptimizer } from './requestOptimizer'


export const debugTopicFiltering = () => {
  const testArticles = [
    {
      title: "Climate Change Impact on Global Economy",
      description: "New study shows climate warming affects GDP growth worldwide",
      link: "https://example.com/1",
      pubDate: new Date().toISOString(),
      source: "Test Source",
      sourceLean: 'center' as const
    },
    {
      title: "Technology Breakthrough in AI",
      description: "Latest artificial intelligence developments revolutionize industry",
      link: "https://example.com/2", 
      pubDate: new Date().toISOString(),
      source: "Test Source",
      sourceLean: 'center' as const
    }
  ]

  const testTopics = [
    {
      topic: 'Climate Change',
      keywords: ['climate', 'global warming', 'carbon', 'renewable', 'fossil fuel', 'emissions']
    },
    {
      topic: 'Technology', 
      keywords: ['tech', 'AI', 'artificial intelligence', 'privacy', 'data', 'cyber', 'digital']
    }
  ]

  console.log('\n🔍 Testing topic filtering...')
  
  testTopics.forEach(topic => {
    console.log(`\n📋 Testing topic: ${topic.topic}`)
    console.log(`🔑 Keywords: ${topic.keywords.join(', ')}`)
    
    testArticles.forEach(article => {
      const titleLower = article.title.toLowerCase()
      const descLower = article.description.toLowerCase()
      const combinedText = `${titleLower} ${descLower}`
      
      const matches = topic.keywords.filter(keyword => 
        combinedText.includes(keyword.toLowerCase())
      )
      
      console.log(`📰 "${article.title}"`)
      console.log(`   Matches: ${matches.length > 0 ? matches.join(', ') : 'none'}`)
    })
  })
}

export const debugCacheStatus = () => {
  console.log('🔍 Checking cache status...');
  
  const cacheKeys = Object.keys(localStorage).filter(key => 
    key.startsWith('feed_') || key.startsWith('newsapi-')
  );
  
  console.log(`📦 Found ${cacheKeys.length} cached entries`);
  
  cacheKeys.forEach(key => {
    try {
      const cached = JSON.parse(localStorage.getItem(key) || '{}');
      const timestamp = cached.timestamp;
      const age = timestamp ? (Date.now() - timestamp) / (1000 * 60) : 'Unknown';
      const size = new Blob([localStorage.getItem(key) || '']).size;
      
      console.log(`📄 ${key}:`);
      console.log(`   Age: ${typeof age === 'number' ? `${Math.round(age)} minutes` : age}`);
      console.log(`   Size: ${(size / 1024).toFixed(1)} KB`);
      console.log(`   Items: ${cached.data?.length || 0}`);
    } catch (error) {
      console.log(`❌ ${key}: Failed to parse`);
    }
  });
}

export const debugNewsAPI = async () => {
  console.log('🔍 Testing NewsAPI integration...');
  
  // Check API status
  const status = await checkAPIStatus();
  console.log('📊 API Status:', status);
  
  // Test source validation
  try {
    const availableSources = await fetchAvailableNewsAPISources();
    console.log(`📰 Available NewsAPI sources: ${availableSources.size}`);
    console.log('First 10 sources:', Array.from(availableSources).slice(0, 10));
    
    // Validate our configured sources
    const configuredSourceIds = NEWS_SOURCES
      .map(s => s.newsApiId)
      .filter(Boolean) as string[];
    
    const validation = await validateNewsAPISources(configuredSourceIds);
    console.log('\n🔍 Source validation results:');
    console.log('✅ Valid sources:', validation.valid);
    console.log('❌ Invalid sources:', validation.invalid);
    
    // Test topic search with valid sources only
    if (validation.valid.length > 0) {
      const testSources = validation.valid.slice(0, 2); // Use first 2 valid sources
      console.log(`\n🧪 Testing with sources: ${testSources.join(', ')}`);
      
      // For debug purposes, use static sources as availableSources
      const staticSources = NEWS_SOURCES.map(source => ({ ...source, isDynamic: false }));
      
      const articles = await fetchArticlesByTopic(
        'Climate Change',
        ['climate', 'global warming'],
        // Convert NewsAPI IDs back to our internal IDs
        testSources.map(apiId => {
          const source = NEWS_SOURCES.find(s => s.newsApiId === apiId);
          return source?.id || apiId;
        }),
        7,
        staticSources
      );
      console.log(`✅ Found ${articles.articles.length} articles`);
      if (articles.articles.length > 0) {
        console.log('📰 Sample article:', {
          title: articles.articles[0].title.substring(0, 100),
          source: articles.articles[0].source,
          lean: articles.articles[0].sourceLean
        });
      }
    } else {
      console.log('⚠️ No valid sources found for testing');
    }
  } catch (error) {
    console.error('❌ NewsAPI test failed:', error);
  }
};

export const debugSourceValidation = async () => {
  console.log('🔍 Debugging NewsAPI source validation...');
  
  try {
    // Fetch all available sources
    const availableSources = await fetchAvailableNewsAPISources();
    console.log(`📊 Total available sources: ${availableSources.size}`);
    
    // Check each configured source
    console.log('\n📋 Checking configured sources:');
    for (const source of NEWS_SOURCES) {
      if (source.newsApiId) {
        const isValid = availableSources.has(source.newsApiId);
        console.log(`${isValid ? '✅' : '❌'} ${source.name} (${source.newsApiId}): ${isValid ? 'Valid' : 'Not found in NewsAPI'}`);
      } else {
        console.log(`⚪ ${source.name}: No NewsAPI ID configured`);
      }
    }
    
    // Show some alternative sources that are available
    const alternativeSources = Array.from(availableSources)
      .filter(id => !NEWS_SOURCES.some(s => s.newsApiId === id))
      .slice(0, 10);
    
    if (alternativeSources.length > 0) {
      console.log('\n💡 Alternative sources available in NewsAPI:');
      alternativeSources.forEach(sourceId => {
        console.log(`   - ${sourceId}`);
      });
    }
  } catch (error) {
    console.error('❌ Source validation debug failed:', error);
  }
};

// Request Optimization Debug Functions

export const debugRequestOptimization = () => {
  console.log('🔧 Request Optimization System Debug');
  console.log('=====================================');
  
  try {
    const dashboard = requestMonitor.getDashboard();
    const analytics = requestOptimizer.getAnalytics();
    const queueStatus = requestOptimizer.getQueueStatus();
    
    console.log('\n📊 Performance Metrics:');
    console.log(`   Average Response Time: ${dashboard.performance.averageResponseTime.toFixed(0)}ms`);
    console.log(`   Request Throughput: ${dashboard.performance.requestThroughput.toFixed(1)} req/min`);
    console.log(`   Caching Efficiency: ${dashboard.performance.cachingEfficiency.toFixed(1)}%`);
    console.log(`   Duplicates Blocked: ${dashboard.performance.duplicatesBlocked}`);
    
    console.log('\n🏥 Health Status:');
    console.log(`   Overall Status: ${dashboard.health.status.toUpperCase()}`);
    console.log(`   API Availability: ${dashboard.health.apiAvailability.toFixed(1)}%`);
    console.log(`   Error Rate: ${dashboard.health.errorRate.toFixed(1)}%`);
    console.log(`   System Load: ${dashboard.health.systemLoad}`);
    
    console.log('\n📋 Queue Status:');
    console.log(`   Queue Length: ${queueStatus.queueLength}`);
    console.log(`   In-Flight Requests: ${queueStatus.inFlightCount}`);
    console.log(`   Is Processing: ${queueStatus.isProcessing}`);
    
    console.log('\n📈 Request Statistics:');
    console.log(`   Total Requests: ${analytics.totalRequests}`);
    console.log(`   Successful: ${analytics.successfulRequests}`);
    console.log(`   Failed: ${analytics.failedRequests}`);
    console.log(`   Rate Limit Hits: ${analytics.rateLimitHits}`);
    console.log(`   Retry Attempts: ${analytics.retryAttempts}`);
    
    console.log('\n🎯 Priority Distribution:');
    Object.entries(analytics.requestsByPriority).forEach(([priority, count]) => {
      console.log(`   ${priority}: ${count} requests`);
    });
    
    if (Object.keys(analytics.errorsByStatus).length > 0) {
      console.log('\n❌ Error Breakdown:');
      Object.entries(analytics.errorsByStatus).forEach(([status, count]) => {
        console.log(`   HTTP ${status}: ${count} errors`);
      });
    }
    
    if (dashboard.recommendations.length > 0) {
      console.log('\n💡 Recommendations:');
      dashboard.recommendations.forEach(rec => {
        console.log(`   - ${rec}`);
      });
    }
    
    if (dashboard.warnings.length > 0) {
      console.log('\n⚠️ Warnings:');
      dashboard.warnings.forEach(warning => {
        console.log(`   - ${warning}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Request optimization debug failed:', error);
  }
};

export const debugNewsAPIOptimization = () => {
  console.log('📡 NewsAPI Optimization Debug');
  console.log('===============================');
  
  try {
    const analytics = newsApiOptimizer.getAnalytics();
    
    console.log('\n📊 Endpoint Usage:');
    Object.entries(analytics.endpointUsage).forEach(([endpoint, count]) => {
      console.log(`   ${endpoint}: ${count} requests`);
    });
    
    console.log('\n⏱️ Average Response Sizes:');
    Object.entries(analytics.averageResponseSizes).forEach(([endpoint, size]) => {
      console.log(`   ${endpoint}: ${(size / 1024).toFixed(1)} KB`);
    });
    
    console.log('\n🎯 Optimal Request Timing:');
    const timingRecommendations = newsApiOptimizer.getTimingRecommendations();
    Object.entries(timingRecommendations).forEach(([endpoint, recommendation]) => {
      console.log(`   ${endpoint}: ${recommendation}`);
    });
    
    if (Object.keys(analytics.errorPatterns).length > 0) {
      console.log('\n❌ Error Patterns:');
      Object.entries(analytics.errorPatterns).forEach(([status, count]) => {
        console.log(`   HTTP ${status}: ${count} occurrences`);
      });
    }
    
    console.log('\n📋 Request Optimizer Status:');
    const queueStatus = analytics.queueStatus;
    console.log(`   Queue Length: ${queueStatus.queueLength}`);
    console.log(`   In-Flight Count: ${queueStatus.inFlightCount}`);
    console.log(`   Is Processing: ${queueStatus.isProcessing}`);
    
  } catch (error) {
    console.error('❌ NewsAPI optimization debug failed:', error);
  }
};

export const debugRequestAnalytics = () => {
  console.log('📊 Request Analytics Report');
  console.log('============================');
  
  try {
    const report = requestMonitor.generateReport();
    console.log(report);
  } catch (error) {
    console.error('❌ Request analytics debug failed:', error);
  }
};

export const testRequestOptimization = async () => {
  console.log('🧪 Testing Request Optimization');
  console.log('================================');
  
  try {
    console.log('\n🔬 Running duplicate request test...');
    
    // Create multiple identical requests to test deduplication
    const testParams = new URLSearchParams({
      q: 'test query',
      pageSize: '10'
    });
    
    const startTime = Date.now();
    
    // Fire 5 identical requests simultaneously
    const promises = Array(5).fill(null).map(() => 
      newsApiOptimizer.fetchEverything(testParams, 'medium', 'test:duplicate')
    );
    
    const responses = await Promise.allSettled(promises);
    const endTime = Date.now();
    
    const successful = responses.filter(r => r.status === 'fulfilled').length;
    const failed = responses.filter(r => r.status === 'rejected').length;
    
    console.log(`   Requests sent: 5`);
    console.log(`   Successful: ${successful}`);
    console.log(`   Failed: ${failed}`);
    console.log(`   Total time: ${endTime - startTime}ms`);
    
    // Check analytics to see if duplicates were blocked
    const analytics = requestOptimizer.getAnalytics();
    console.log(`   Duplicates blocked: ${analytics.duplicatesBlocked}`);
    
    console.log('\n✅ Test completed - check analytics above');
    
  } catch (error) {
    console.error('❌ Request optimization test failed:', error);
  }
};

export const clearOptimizationCache = () => {
  console.log('🧹 Clearing Optimization Cache');
  console.log('===============================');
  
  try {
    requestOptimizer.clearQueue();
    requestMonitor.reset();
    console.log('✅ All optimization caches and analytics cleared');
  } catch (error) {
    console.error('❌ Failed to clear optimization cache:', error);
  }
};