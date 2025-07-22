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
  keywords: string[]
}

export interface UserSelection {
  sources: string[]
  topic: string
  timeframe: number // days
  languages: NewsLanguage[]
  domains?: string[]
  excludeDomains?: string[]
}

export interface TimeOption {
  label: string
  value: number
}

export interface CachedFeed {
  data: Article[]
  timestamp: number
}

export interface FeedCache {
  [sourceId: string]: CachedFeed
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