import { fetchWithCorsProxy } from './corsProxy'

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