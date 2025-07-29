export interface NewsSource {
  id: string;
  name: string;
  rssUrl?: string; // Optional for dynamic sources
  newsApiId?: string;
  politicalLean: 'left' | 'lean-left' | 'center' | 'lean-right' | 'right' | 'unknown';
  credibility: number;
  website: string;
  // NewsAPI additional fields
  description?: string;
  category?: NewsCategory;
  language?: string;
  country?: string;
  // Source metadata
  isDynamic?: boolean; // True if fetched from NewsAPI
}

export interface Article {
  title: string
  description: string
  link: string
  pubDate: string
  source: string
  sourceLean: 'left' | 'lean-left' | 'center' | 'lean-right' | 'right' | 'unknown'
  // Enhanced fields for NewsAPI
  imageUrl?: string
  author?: string
  content?: string
}

export interface TopicKeywords {
  topic: string
  keywords: string[] // Legacy support - will be deprecated
  multiLanguageKeywords?: Record<NewsLanguage, string[]> // New multi-language support
  fallbackKeywords?: string[] // English fallback when translation unavailable
  customSearch?: boolean // Indicates if this is a custom search topic
}

export interface UserSelection {
  sources: string[]
  topic: string
  customSearchTerms?: string[] // User-defined search terms
  timeframe: number // days
  languages: NewsLanguage[]
  domains?: string[]
  excludeDomains?: string[]
}

export interface TimeOption {
  label: string
  value: number
  days: number
}

export interface CachedFeed {
  data: Article[]
  timestamp: number
  // Enhanced cache metadata
  compressed?: boolean
  originalSize?: number
  compressedSize?: number
  compressionRatio?: number
  accessCount?: number
  lastAccessed?: number
  version?: number // For cache format versioning
}

export interface FeedCache {
  [sourceId: string]: CachedFeed
}

// Enhanced cache analytics
export interface CacheAnalytics {
  hitRate: number
  missRate: number
  totalHits: number
  totalMisses: number
  totalRequests: number
  compressionSavings: number
  averageCompressionRatio: number
  cacheSize: number
  entryCount: number
  oldestEntry: number | null
  newestEntry: number | null
}

// Cache size management
export interface CacheSizeInfo {
  totalSize: number
  entryCount: number
  averageEntrySize: number
  compressionSavings: number
  utilizationPercentage: number
}

// Background refresh configuration
export interface BackgroundRefreshConfig {
  enabled: boolean
  staleThreshold: number // Refresh when cache is this old (ms)
  maxConcurrentRefresh: number
  refreshInterval: number // Check interval for background refresh (ms)
  priorityThreshold: number // Refresh high-priority items first
}

// NewsAPI specific types
export interface NewsAPIResponse {
  status: string;
  totalResults: number;
  articles: NewsAPIArticle[];
  code?: string;
  message?: string;
}

export interface PaginatedResults {
  articles: Article[];
  totalResults: number;
  hasMorePages: boolean;
  currentPage: number;
  totalPages: number;
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

// NewsAPI Sources endpoint response types
export interface NewsAPISourcesResponse {
  status: string;
  sources: NewsAPISourceData[];
  code?: string;
  message?: string;
}

export interface NewsAPISourceData {
  id: string;
  name: string;
  description: string;
  url: string;
  category: NewsCategory;
  language: string;
  country: string;
}

// Language and category types
export type NewsCategory = 
  | 'business' 
  | 'entertainment' 
  | 'general' 
  | 'health' 
  | 'science' 
  | 'sports' 
  | 'technology';

export type NewsLanguage = 
  | 'ar' | 'de' | 'en' | 'es' | 'fr' | 'he' 
  | 'it' | 'nl' | 'no' | 'pt' | 'ru' | 'sv' | 'ud' | 'zh';

export type NewsSortBy = 'relevancy' | 'publishedAt' | 'popularity';

export interface LanguageOption {
  code: NewsLanguage;
  name: string;
  nativeName: string;
  flag: string;
}

// Enhanced source filtering
export interface SourceFilters {
  languages: NewsLanguage[];
  categories: NewsCategory[];
  countries: string[];
  search: string;
}

// Dynamic source cache
export interface DynamicSourceCache {
  sources: NewsSource[];
  timestamp: number;
  languages: NewsLanguage[];
  categories: NewsCategory[];
}

// Political lean classification
export interface PoliticalLeanMapping {
  [sourceId: string]: {
    lean: 'left' | 'lean-left' | 'center' | 'lean-right' | 'right' | 'unknown';
    credibility: number;
    confidence: number; // 0-1, how confident we are in this classification
  };
}

// App flow types
export type AppStep = 'landing' | 'modal' | 'results'

// Request Optimization Types
export interface RequestOptimizationConfig {
  requestsPerSecond: number;
  requestsPerMinute: number;
  requestsPerHour: number;
  requestsPerDay: number;
  burstLimit: number;
  enableDeduplication: boolean;
  enableAnalytics: boolean;
  maxRetries: number;
  baseDelay: number;
  maxDelay: number;
}

export interface RequestAnalytics {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  duplicatesBlocked: number;
  rateLimitHits: number;
  averageResponseTime: number;
  requestsByPriority: Record<'high' | 'medium' | 'low', number>;
  errorsByStatus: Record<number, number>;
  retryAttempts: number;
  lastResetTime: number;
}

export interface RequestMonitoringDashboard {
  performance: {
    averageResponseTime: number;
    requestThroughput: number;
    cachingEfficiency: number;
    rateLimitUtilization: number;
    queueEfficiency: number;
    duplicatesBlocked: number;
  };
  health: {
    status: 'healthy' | 'degraded' | 'critical';
    uptime: number;
    apiAvailability: number;
    errorRate: number;
    lastSuccessfulRequest: Date | null;
    systemLoad: 'low' | 'medium' | 'high';
  };
  recommendations: string[];
  warnings: string[];
  errors: Array<{
    type: string;
    count: number;
    lastOccurrence: Date;
    message: string; 
    severity: 'low' | 'medium' | 'high';
  }>;
}