export interface NewsSource {
  id: string
  name: string
  rssUrl: string
  politicalLean: 'left' | 'center' | 'right'
  credibility: number
  website: string
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