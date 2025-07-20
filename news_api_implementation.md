# NewsAPI Implementation Guide for BreakMyBubble

## Overview
This guide provides step-by-step instructions for implementing NewsAPI.org in the BreakMyBubble application, replacing the current RSS feed implementation while maintaining all existing functionality and UI.

## Prerequisites

1. **Obtain NewsAPI Key**
   - Sign up at https://newsapi.org/register
   - Get your free development API key
   - Note: Free tier includes 100 requests/day, 1 month historical data

2. **Environment Setup**
   - Create `.env` file in project root
   - Add: `VITE_NEWS_API_KEY=your_api_key_here`
   - Ensure `.env` is in `.gitignore`

## Implementation Steps

### Step 1: Update Type Definitions

Add to `src/types/index.ts`:

```typescript
// NewsAPI specific types
export interface NewsAPIResponse {
  status: string;
  totalResults: number;
  articles: NewsAPIArticle[];
  code?: string;
  message?: string;
}

export interface NewsAPIArticle {
  source: {
    id: string | null;
    name: string;
  };
  author: string | null;
  title: string;
  description: string | null;
  url: string;
  urlToImage: string | null;
  publishedAt: string;
  content: string | null;
}

// Update NewsSource interface
export interface NewsSource {
  id: string;
  name: string;
  rssUrl: string;
  newsApiId?: string; // Add this field
  politicalLean: 'left' | 'center' | 'right';
  credibility: number;
  website: string;
}
```

### Step 2: Update News Sources Data

Modify `src/data/newsSources.ts`:

```typescript
export const NEWS_SOURCES: NewsSource[] = [
  // Left-leaning
  {
    id: 'cnn',
    name: 'CNN',
    rssUrl: 'http://rss.cnn.com/rss/edition.rss',
    newsApiId: 'cnn',
    politicalLean: 'left',
    credibility: 0.7,
    website: 'cnn.com',
  },
  {
    id: 'msnbc',
    name: 'MSNBC',
    rssUrl: 'http://www.msnbc.com/feeds/latest',
    newsApiId: 'msnbc',
    politicalLean: 'left',
    credibility: 0.6,
    website: 'msnbc.com',
  },
  {
    id: 'guardian',
    name: 'The Guardian',
    rssUrl: 'https://www.theguardian.com/rss',
    newsApiId: 'the-guardian-uk',
    politicalLean: 'left',
    credibility: 0.8,
    website: 'theguardian.com',
  },
  // ... continue for all sources
];
```

### Step 3: Create NewsAPI Service

Create new file `src/services/newsApiService.ts`:

```typescript
import { Article, NewsSource, NewsAPIResponse, NewsAPIArticle } from '../types';
import { NEWS_SOURCES } from '../data/newsSources';

const API_KEY = import.meta.env.VITE_NEWS_API_KEY;
const BASE_URL = 'https://newsapi.org/v2';

// Create source mapping for quick lookups
const sourceMapByName = new Map<string, NewsSource>();
const sourceMapByApiId = new Map<string, NewsSource>();

NEWS_SOURCES.forEach(source => {
  sourceMapByName.set(source.name.toLowerCase(), source);
  if (source.newsApiId) {
    sourceMapByApiId.set(source.newsApiId, source);
  }
});

// Main function to fetch articles by topic
export async function fetchArticlesByTopic(
  topic: string,
  keywords: string[],
  sources: string[],
  timeframeDays: number
): Promise<Article[]> {
  try {
    // Build query from keywords
    const query = keywords.join(' OR ');
    
    // Calculate date range
    const to = new Date();
    const from = new Date();
    from.setDate(from.getDate() - timeframeDays);
    
    // Map source IDs to NewsAPI IDs
    const newsApiSources = sources
      .map(sourceId => {
        const source = NEWS_SOURCES.find(s => s.id === sourceId);
        return source?.newsApiId;
      })
      .filter(Boolean);
    
    // Build API URL
    const params = new URLSearchParams({
      apiKey: API_KEY,
      q: query,
      from: from.toISOString(),
      to: to.toISOString(),
      language: 'en',
      sortBy: 'relevancy',
      pageSize: '100'
    });
    
    // Add sources if specific ones selected
    if (newsApiSources.length > 0) {
      params.append('sources', newsApiSources.join(','));
    }
    
    const response = await fetch(`${BASE_URL}/everything?${params}`);
    const data: NewsAPIResponse = await response.json();
    
    if (data.status !== 'ok') {
      throw new Error(data.message || 'NewsAPI request failed');
    }
    
    // Convert to our Article format
    return data.articles.map(apiArticle => mapNewsAPIToArticle(apiArticle));
  } catch (error) {
    console.error('NewsAPI fetch error:', error);
    throw error;
  }
}

// Convert NewsAPI article to our Article interface
function mapNewsAPIToArticle(apiArticle: NewsAPIArticle): Article {
  // Find source info by name or API ID
  let sourceInfo = sourceMapByName.get(apiArticle.source.name.toLowerCase());
  
  if (!sourceInfo && apiArticle.source.id) {
    sourceInfo = sourceMapByApiId.get(apiArticle.source.id);
  }
  
  // Default to center if source not found
  const politicalLean = sourceInfo?.politicalLean || 'center';
  
  return {
    title: apiArticle.title,
    description: apiArticle.description || '',
    link: apiArticle.url,
    pubDate: apiArticle.publishedAt,
    source: apiArticle.source.name,
    sourceLean: politicalLean,
  };
}

// Fetch articles without source filtering (for opposing perspectives)
export async function searchAllSources(
  keywords: string[],
  timeframeDays: number,
  excludeSources?: string[]
): Promise<Article[]> {
  try {
    const query = keywords.join(' OR ');
    
    const to = new Date();
    const from = new Date();
    from.setDate(from.getDate() - timeframeDays);
    
    const params = new URLSearchParams({
      apiKey: API_KEY,
      q: query,
      from: from.toISOString(),
      to: to.toISOString(),
      language: 'en',
      sortBy: 'relevancy',
      pageSize: '100'
    });
    
    const response = await fetch(`${BASE_URL}/everything?${params}`);
    const data: NewsAPIResponse = await response.json();
    
    if (data.status !== 'ok') {
      throw new Error(data.message || 'NewsAPI request failed');
    }
    
    let articles = data.articles.map(apiArticle => mapNewsAPIToArticle(apiArticle));
    
    // Filter out excluded sources if provided
    if (excludeSources && excludeSources.length > 0) {
      const excludeSet = new Set(excludeSources.map(s => s.toLowerCase()));
      articles = articles.filter(article => 
        !excludeSet.has(article.source.toLowerCase())
      );
    }
    
    return articles;
  } catch (error) {
    console.error('NewsAPI search error:', error);
    throw error;
  }
}

// Check API key validity and remaining requests
export async function checkAPIStatus(): Promise<{
  valid: boolean;
  remaining?: number;
  limit?: number;
}> {
  try {
    const response = await fetch(`${BASE_URL}/top-headlines?country=us&apiKey=${API_KEY}`);
    const remaining = response.headers.get('X-RateLimit-Remaining');
    const limit = response.headers.get('X-RateLimit-Limit');
    
    return {
      valid: response.ok,
      remaining: remaining ? parseInt(remaining) : undefined,
      limit: limit ? parseInt(limit) : undefined
    };
  } catch (error) {
    return { valid: false };
  }
}
```

### Step 4: Update App.tsx

Modify the `handleAnalyze` function in `src/App.tsx`:

```typescript
import { fetchArticlesByTopic, searchAllSources } from './services/newsApiService'

// In handleAnalyze function, replace the RSS fetching logic:

const handleAnalyze = async () => {
  if (!canAnalyze) return

  setState(prev => ({
    ...prev,
    isLoading: true,
    error: null,
    results: null,
  }))

  try {
    // Get selected topic data
    const topicData = TOPICS.find(t => t.topic === state.selectedTopic)
    if (!topicData) {
      throw new Error('Selected topic not found')
    }

    // Check cache first
    const cacheKey = `newsapi-${state.selectedTopic}-${state.selectedSources.join(',')}-${state.selectedTimeframe}`;
    const cached = feedCache.getCachedFeed(cacheKey);
    
    let allArticles: Article[] = [];
    
    if (cached) {
      allArticles = cached;
    } else {
      // Fetch articles from user's selected sources
      const userArticles = await fetchArticlesByTopic(
        state.selectedTopic,
        topicData.keywords,
        state.selectedSources,
        state.selectedTimeframe
      );
      
      // Fetch articles from all other sources for comparison
      const opposingSourceArticles = await searchAllSources(
        topicData.keywords,
        state.selectedTimeframe,
        state.selectedSources.map(id => {
          const source = NEWS_SOURCES.find(s => s.id === id);
          return source?.name || '';
        })
      );
      
      allArticles = [...userArticles, ...opposingSourceArticles];
      
      // Cache the results
      feedCache.setCachedFeed(cacheKey, allArticles);
    }

    // Filter and process articles (remove duplicates, sort by date)
    const filteredArticles = filterAndProcessArticles(
      allArticles,
      topicData,
      state.selectedTimeframe,
      20
    );

    // Separate user articles from opposing perspectives
    const { userArticles, opposingArticles } = getOpposingPerspectives(
      state.selectedSources.map(id => {
        const source = NEWS_SOURCES.find(s => s.id === id);
        return source?.name || '';
      }),
      filteredArticles
    );

    setState(prev => ({
      ...prev,
      isLoading: false,
      results: { userArticles, opposingArticles },
    }))
  } catch (error) {
    console.error('Analysis failed:', error)
    setState(prev => ({
      ...prev,
      isLoading: false,
      error: error instanceof Error ? error.message : 'Analysis failed',
    }))
  }
}
```

### Step 5: Update Debug Service

Add NewsAPI debugging to `src/services/debugService.ts`:

```typescript
import { checkAPIStatus, fetchArticlesByTopic } from './newsApiService';

export const debugNewsAPI = async () => {
  console.log('🔍 Testing NewsAPI integration...');
  
  // Check API status
  const status = await checkAPIStatus();
  console.log('API Status:', status);
  
  // Test topic search
  try {
    const articles = await fetchArticlesByTopic(
      'Climate Change',
      ['climate', 'global warming'],
      ['cnn', 'bbc'],
      7
    );
    console.log(`✅ Found ${articles.length} articles`);
    console.log('Sample article:', articles[0]);
  } catch (error) {
    console.error('❌ NewsAPI test failed:', error);
  }
};
```

### Step 6: Update Filter Service

Modify `src/services/filterService.ts` to handle source name comparison:

```typescript
export const getOpposingPerspectives = (
  userSourceNames: string[],
  allArticles: Article[]
): { userArticles: Article[]; opposingArticles: Article[] } => {
  const userSourcesLower = userSourceNames.map(s => s.toLowerCase());
  
  const userArticles = allArticles.filter((article) =>
    userSourcesLower.includes(article.source.toLowerCase())
  );

  const opposingArticles = allArticles.filter((article) =>
    !userSourcesLower.includes(article.source.toLowerCase())
  );

  return { userArticles, opposingArticles };
}
```

### Step 7: Add Feature Toggle (Optional)

Add to `.env`:
```
VITE_USE_NEWS_API=true
```

In `src/App.tsx`:
```typescript
const useNewsAPI = import.meta.env.VITE_USE_NEWS_API === 'true';

// In handleAnalyze:
if (useNewsAPI) {
  // Use NewsAPI implementation
} else {
  // Use RSS implementation
}
```

## Error Handling

Add specific error handling for NewsAPI errors:

```typescript
// In newsApiService.ts
export class NewsAPIError extends Error {
  constructor(
    message: string,
    public code?: string,
    public statusCode?: number
  ) {
    super(message);
    this.name = 'NewsAPIError';
  }
}

// Handle specific error cases
if (response.status === 429) {
  throw new NewsAPIError('Rate limit exceeded. Please try again later.', 'rateLimited', 429);
}
if (response.status === 401) {
  throw new NewsAPIError('Invalid API key. Please check your configuration.', 'unauthorized', 401);
}
```

## Testing Checklist

- [ ] API key is properly loaded from environment
- [ ] All topics return relevant results
- [ ] Date filtering works correctly
- [ ] Source filtering maintains political lean grouping
- [ ] Caching works with NewsAPI responses
- [ ] Error states display properly
- [ ] Rate limiting is handled gracefully
- [ ] Results display identically to RSS version

## Migration Notes

1. **Gradual Migration**: Keep RSS as fallback initially
2. **Source Coverage**: Some RSS sources may not be available on NewsAPI
3. **Rate Limits**: Monitor API usage to stay within free tier
4. **Data Quality**: NewsAPI provides more consistent data format
5. **Performance**: Fewer requests needed compared to multiple RSS feeds

## Troubleshooting

### Common Issues

1. **CORS Errors**: NewsAPI handles CORS properly, no proxy needed
2. **Empty Results**: Check keyword matching and date ranges
3. **401 Errors**: Verify API key is correctly set
4. **Rate Limits**: Implement request queuing if needed

### Debug Commands

Add to package.json:
```json
"scripts": {
  "test:newsapi": "node -e \"require('./src/services/debugService').debugNewsAPI()\""
}
```

## Future Enhancements

1. **Pagination**: Handle results beyond 100 articles
2. **Advanced Filtering**: Use NewsAPI's domain filtering
3. **Trending Topics**: Integrate top headlines endpoint
4. **Multiple Languages**: Expand beyond English
5. **Source Discovery**: Use sources endpoint to add more news sources

## Important Limitations

- Free tier: 100 requests/day
- Historical data: 1 month maximum
- Article content: Truncated to 200 characters
- Sources: Not all RSS sources available on NewsAPI
- Commercial use: Requires paid plan

## Rollback Plan

If NewsAPI integration fails:
1. Set `VITE_USE_NEWS_API=false`
2. RSS implementation remains unchanged
3. All UI components work with both data sources
4. User experience remains consistent