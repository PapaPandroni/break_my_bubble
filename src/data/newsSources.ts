import { NewsSource } from '../types'

export const NEWS_SOURCES: NewsSource[] = [
  // Left-leaning
  {
    id: 'cnn',
    name: 'CNN',
    rssUrl: 'http://rss.cnn.com/rss/edition.rss',
    politicalLean: 'left',
    credibility: 0.7,
    website: 'cnn.com',
  },
  {
    id: 'msnbc',
    name: 'MSNBC',
    rssUrl: 'http://www.msnbc.com/feeds/latest',
    politicalLean: 'left',
    credibility: 0.6,
    website: 'msnbc.com',
  },
  {
    id: 'guardian',
    name: 'The Guardian',
    rssUrl: 'https://www.theguardian.com/rss',
    politicalLean: 'left',
    credibility: 0.8,
    website: 'theguardian.com',
  },
  {
    id: 'npr',
    name: 'NPR',
    rssUrl: 'https://feeds.npr.org/1001/rss.xml',
    politicalLean: 'center',
    credibility: 0.9,
    website: 'npr.org',
  },

  // Center
  {
    id: 'bbc',
    name: 'BBC News',
    rssUrl: 'http://feeds.bbci.co.uk/news/rss.xml',
    politicalLean: 'center',
    credibility: 0.8,
    website: 'bbc.com',
  },
  {
    id: 'reuters',
    name: 'Reuters',
    rssUrl: 'https://feeds.reuters.com/reuters/topNews',
    politicalLean: 'center',
    credibility: 0.9,
    website: 'reuters.com',
  },
  {
    id: 'ap',
    name: 'Associated Press',
    rssUrl: 'https://feeds.apnews.com/apnews/topnews',
    politicalLean: 'center',
    credibility: 0.9,
    website: 'apnews.com',
  },

  // Right-leaning
  {
    id: 'fox',
    name: 'Fox News',
    rssUrl: 'http://feeds.foxnews.com/foxnews/latest',
    politicalLean: 'right',
    credibility: 0.6,
    website: 'foxnews.com',
  },
  {
    id: 'wsj',
    name: 'Wall Street Journal',
    rssUrl: 'https://feeds.a.dj.com/rss/RSSWorldNews.xml',
    politicalLean: 'right',
    credibility: 0.8,
    website: 'wsj.com',
  },
  {
    id: 'nypost',
    name: 'New York Post',
    rssUrl: 'https://nypost.com/feed/',
    politicalLean: 'right',
    credibility: 0.5,
    website: 'nypost.com',
  },
]