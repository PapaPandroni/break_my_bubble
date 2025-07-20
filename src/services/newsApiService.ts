import { Article, NewsSource, NewsAPIResponse, NewsAPIArticle } from '../types';
import { NEWS_SOURCES } from '../data/newsSources';

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
        if (response.status === 429) {
      throw new NewsAPIError('Rate limit exceeded. Please try again later.', 'rateLimited', 429);
    }
    if (response.status === 401) {
      throw new NewsAPIError('Invalid API key. Please check your configuration.', 'unauthorized', 401);
    }
    
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
        if (response.status === 429) {
      throw new NewsAPIError('Rate limit exceeded. Please try again later.', 'rateLimited', 429);
    }
    if (response.status === 401) {
      throw new NewsAPIError('Invalid API key. Please check your configuration.', 'unauthorized', 401);
    }
    
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