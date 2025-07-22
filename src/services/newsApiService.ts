import { Article, NewsSource, NewsAPIResponse, NewsAPIArticle, NewsLanguage, NewsSortBy, PaginatedResults } from '../types';
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

// Cache for available NewsAPI sources
let cachedNewsAPISources: Set<string> | null = null;
let sourceCacheTimestamp = 0;
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

// Create source mapping for quick lookups
const sourceMapByName = new Map<string, NewsSource>();
const sourceMapByApiId = new Map<string, NewsSource>();

NEWS_SOURCES.forEach(source => {
  sourceMapByName.set(source.name.toLowerCase(), source);
  if (source.newsApiId) {
    sourceMapByApiId.set(source.newsApiId, source);
  }
});

// Fetch available NewsAPI sources
export async function fetchAvailableNewsAPISources(): Promise<Set<string>> {
  try {
    if (!API_KEY) {
      console.warn('NewsAPI key not configured');
      return new Set<string>();
    }

    const response = await fetch(`${BASE_URL}/top-headlines/sources?apiKey=${API_KEY}`);
    
    if (!response.ok) {
      console.warn('Failed to fetch NewsAPI sources, using cached or defaults');
      return cachedNewsAPISources || new Set<string>();
    }
    
    const data = await response.json();
    const sources = new Set<string>(data.sources?.map((s: any) => s.id) || []);
    
    // Cache the results
    cachedNewsAPISources = sources;
    sourceCacheTimestamp = Date.now();
    
    return sources;
  } catch (error) {
    console.warn('Error fetching NewsAPI sources:', error);
    return cachedNewsAPISources || new Set<string>();
  }
}

// Get valid NewsAPI sources (with caching)
export async function getValidNewsAPISources(): Promise<Set<string>> {
  const now = Date.now();
  
  // Return cached sources if still valid
  if (cachedNewsAPISources && (now - sourceCacheTimestamp) < CACHE_DURATION) {
    return cachedNewsAPISources;
  }
  
  return await fetchAvailableNewsAPISources();
}

// Validate and filter NewsAPI source IDs
export async function validateNewsAPISources(sourceIds: string[]): Promise<{
  valid: string[];
  invalid: string[];
}> {
  const availableSources = await getValidNewsAPISources();
  
  const valid: string[] = [];
  const invalid: string[] = [];
  
  sourceIds.forEach(sourceId => {
    if (availableSources.has(sourceId)) {
      valid.push(sourceId);
    } else {
      invalid.push(sourceId);
    }
  });
  
  return { valid, invalid };
}

// Fallback function to fetch articles without source filtering
async function fetchArticlesByTopicWithoutSources(
  _topic: string,
  keywords: string[],
  timeframeDays: number,
  languages?: NewsLanguage[],
  sortBy: NewsSortBy = 'relevancy',
  domains?: string[],
  excludeDomains?: string[],
  page: number = 1,
  pageSize: number = 100
): Promise<PaginatedResults> {
  const query = keywords.join(' OR ');
  
  const to = new Date();
  const from = new Date();
  from.setDate(from.getDate() - timeframeDays);
  
  const params = new URLSearchParams({
    apiKey: API_KEY,
    q: query,
    from: from.toISOString(),
    to: to.toISOString(),
    sortBy: sortBy,
    page: page.toString(),
    pageSize: pageSize.toString()
  });
  
  // Only add language parameter if languages are specified
  if (languages && languages.length > 0) {
    params.append('language', languages.join(','));
  }

  // Add domain parameters if provided
  if (domains && domains.length > 0) {
    params.append('domains', domains.join(','));
  }
  if (excludeDomains && excludeDomains.length > 0) {
    params.append('excludeDomains', excludeDomains.join(','));
  }
  
  const response = await fetch(`${BASE_URL}/everything?${params}`);
  
  if (!response.ok) {
    throw new NewsAPIError(`Fallback NewsAPI request failed with status ${response.status}`, 'fallbackFailed', response.status);
  }
  
  const data: NewsAPIResponse = await response.json();
  
  if (data.status !== 'ok') {
    throw new NewsAPIError(data.message || 'Fallback NewsAPI request failed', data.code || 'fallbackApiError');
  }
  
  const articles = data.articles.map(apiArticle => mapNewsAPIToArticle(apiArticle));
  const totalPages = Math.ceil(data.totalResults / pageSize);
  
  return {
    articles,
    totalResults: data.totalResults,
    hasMorePages: page < totalPages,
    currentPage: page,
    totalPages
  };
}

// Main function to fetch articles by topic
export async function fetchArticlesByTopic(
  topic: string,
  keywords: string[],
  sources: string[],
  timeframeDays: number,
  languages?: NewsLanguage[],
  sortBy: NewsSortBy = 'relevancy',
  domains?: string[],
  excludeDomains?: string[],
  page: number = 1,
  pageSize: number = 100
): Promise<PaginatedResults> {
  try {
    // Build query from keywords
    const query = keywords.join(' OR ');
    
    // Calculate date range
    const to = new Date();
    const from = new Date();
    from.setDate(from.getDate() - timeframeDays);
    
    // Map source IDs to NewsAPI IDs and validate them
    const newsApiSources = sources
      .map(sourceId => {
        const source = NEWS_SOURCES.find(s => s.id === sourceId);
        return source?.newsApiId;
      })
      .filter(Boolean) as string[];
    
    // Validate sources against NewsAPI
    const { valid: validSources, invalid: invalidSources } = await validateNewsAPISources(newsApiSources);
    
    if (invalidSources.length > 0) {
      console.warn('Invalid NewsAPI sources detected:', invalidSources);
    }
    
    if (validSources.length === 0) {
      console.warn('No valid NewsAPI sources found, searching all sources');
    }
    
    // Build API URL
    const params = new URLSearchParams({
      apiKey: API_KEY,
      q: query,
      from: from.toISOString(),
      to: to.toISOString(),
      sortBy: sortBy,
      page: page.toString(),
      pageSize: pageSize.toString()
    });
    
    // Only add language parameter if languages are specified
    if (languages && languages.length > 0) {
      params.append('language', languages.join(','));
    }
    
    // Add sources if valid ones exist
    if (validSources.length > 0) {
      params.append('sources', validSources.join(','));
    }

    // Add domain parameters if provided (but only if no sources are specified, as they conflict)
    if (validSources.length === 0) {
      if (domains && domains.length > 0) {
        params.append('domains', domains.join(','));
      }
      if (excludeDomains && excludeDomains.length > 0) {
        params.append('excludeDomains', excludeDomains.join(','));
      }
    }
    
    const response = await fetch(`${BASE_URL}/everything?${params}`);
    
    if (response.status === 429) {
      throw new NewsAPIError('Rate limit exceeded. Please try again later.', 'rateLimited', 429);
    }
    if (response.status === 401) {
      throw new NewsAPIError('Invalid API key. Please check your configuration.', 'unauthorized', 401);
    }
    if (response.status === 400) {
      const errorData = await response.json().catch(() => ({}));
      if (errorData.message?.includes('source')) {
        console.warn('Source-related error, attempting fallback without specific sources');
        // Retry without sources parameter
        return await fetchArticlesByTopicWithoutSources(topic, keywords, timeframeDays, languages, sortBy, domains, excludeDomains, page, pageSize);
      }
      throw new NewsAPIError(errorData.message || 'Bad request to NewsAPI', 'badRequest', 400);
    }
    if (!response.ok) {
      throw new NewsAPIError(`NewsAPI request failed with status ${response.status}`, 'requestFailed', response.status);
    }
    
    const data: NewsAPIResponse = await response.json();
    
    if (data.status !== 'ok') {
      throw new NewsAPIError(data.message || 'NewsAPI request failed', data.code || 'apiError');
    }
    
    // Convert to our Article format and return paginated results
    const articles = data.articles.map(apiArticle => mapNewsAPIToArticle(apiArticle));
    const totalPages = Math.ceil(data.totalResults / pageSize);
    
    return {
      articles,
      totalResults: data.totalResults,
      hasMorePages: page < totalPages,
      currentPage: page,
      totalPages
    };
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
    // Enhanced NewsAPI fields
    imageUrl: apiArticle.urlToImage || undefined,
    author: apiArticle.author || undefined,
    content: apiArticle.content || undefined,
  };
}

// Fetch articles without source filtering (for opposing perspectives)
export async function searchAllSources(
  keywords: string[],
  timeframeDays: number,
  excludeSources?: string[],
  languages?: NewsLanguage[],
  sortBy: NewsSortBy = 'relevancy',
  domains?: string[],
  excludeDomains?: string[],
  page: number = 1,
  pageSize: number = 100
): Promise<PaginatedResults> {
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
      sortBy: sortBy,
      page: page.toString(),
      pageSize: pageSize.toString()
    });
    
    // Only add language parameter if languages are specified
    if (languages && languages.length > 0) {
      params.append('language', languages.join(','));
    }

    // Add domain parameters if provided
    if (domains && domains.length > 0) {
      params.append('domains', domains.join(','));
    }
    if (excludeDomains && excludeDomains.length > 0) {
      params.append('excludeDomains', excludeDomains.join(','));
    }
    
    const response = await fetch(`${BASE_URL}/everything?${params}`);
    
    if (response.status === 429) {
      throw new NewsAPIError('Rate limit exceeded. Please try again later.', 'rateLimited', 429);
    }
    if (response.status === 401) {
      throw new NewsAPIError('Invalid API key. Please check your configuration.', 'unauthorized', 401);
    }
    if (!response.ok) {
      throw new NewsAPIError(`NewsAPI request failed with status ${response.status}`, 'requestFailed', response.status);
    }
    
    const data: NewsAPIResponse = await response.json();
    
    if (data.status !== 'ok') {
      throw new NewsAPIError(data.message || 'NewsAPI request failed', data.code || 'apiError');
    }
    
    let articles = data.articles.map(apiArticle => mapNewsAPIToArticle(apiArticle));
    
    // Filter out excluded sources if provided
    if (excludeSources && excludeSources.length > 0) {
      const excludeSet = new Set(excludeSources.map(s => s.toLowerCase()));
      articles = articles.filter(article => 
        !excludeSet.has(article.source.toLowerCase())
      );
    }
    
    const totalPages = Math.ceil(data.totalResults / pageSize);
    
    return {
      articles,
      totalResults: data.totalResults,
      hasMorePages: page < totalPages,
      currentPage: page,
      totalPages
    };
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