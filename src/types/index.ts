export interface NewsSource {
  id: string;
  name: string;
  rssUrl: string;
  newsApiId?: string; // Add this field
  politicalLean: 'left' | 'center' | 'right';
  credibility: number;
  website: string;
}

export interface Article {
  title: string
  description: string
  link: string
  pubDate: string
  source: string
  sourceLean: 'left' | 'center' | 'right'
}

export interface TopicKeywords {
  topic: string
  keywords: string[]
}

export interface UserSelection {
  sources: string[]
  topic: string
  timeframe: number // days
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