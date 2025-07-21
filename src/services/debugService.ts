import { fetchWithCorsProxy } from './corsProxy'
import { fetchAvailableNewsAPISources, validateNewsAPISources, checkAPIStatus, fetchArticlesByTopic } from './newsApiService'
import { NEWS_SOURCES } from '../data/newsSources'

export const debugFeedAccess = async () => {
  const testFeeds = [
    'https://feeds.reuters.com/reuters/topNews',
    'http://rss.cnn.com/rss/edition.rss',
    'http://feeds.bbci.co.uk/news/rss.xml',
    'https://feeds.npr.org/1001/rss.xml'
  ]

  console.log('🔍 Starting RSS feed debugging...')
  
  for (const feed of testFeeds) {
    try {
      console.log(`\n📡 Testing feed: ${feed}`)
      const data = await fetchWithCorsProxy(feed)
      console.log(`✅ Success! Got ${data.length} characters`)
      console.log(`📄 First 200 chars: ${data.substring(0, 200)}...`)
      
      // Check if it looks like XML
      if (data.includes('<?xml') || data.includes('<rss') || data.includes('<feed')) {
        console.log('✅ Looks like valid XML/RSS')
      } else {
        console.log('⚠️ Does not look like XML/RSS')
      }
    } catch (error) {
      console.error(`❌ Failed: ${error}`)
    }
  }
}

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
      
      const articles = await fetchArticlesByTopic(
        'Climate Change',
        ['climate', 'global warming'],
        // Convert NewsAPI IDs back to our internal IDs
        testSources.map(apiId => {
          const source = NEWS_SOURCES.find(s => s.newsApiId === apiId);
          return source?.id || apiId;
        }),
        7
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