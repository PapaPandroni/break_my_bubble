import { NewsSource } from '../types'

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
  
  // Lean Left (updated per AllSides ratings)
  {
    id: 'guardian',
    name: 'The Guardian',
    rssUrl: 'https://www.theguardian.com/rss',
    newsApiId: 'the-guardian-uk',
    politicalLean: 'lean-left',
    credibility: 0.8,
    website: 'theguardian.com',
  },
  {
    id: 'npr',
    name: 'NPR',
    rssUrl: 'https://feeds.npr.org/1001/rss.xml',
    politicalLean: 'lean-left', // Corrected from center per AllSides
    credibility: 0.9,
    website: 'npr.org',
  },

  // Center
  {
    id: 'bbc',
    name: 'BBC News',
    rssUrl: 'http://feeds.bbci.co.uk/news/rss.xml',
    newsApiId: 'bbc-news',
    politicalLean: 'center',
    credibility: 0.8,
    website: 'bbc.com',
  },
  {
    id: 'reuters',
    name: 'Reuters',
    rssUrl: 'https://feeds.reuters.com/reuters/topNews',
    newsApiId: 'reuters',
    politicalLean: 'center',
    credibility: 0.9,
    website: 'reuters.com',
  },
  {
    id: 'ap',
    name: 'Associated Press',
    rssUrl: 'https://feeds.apnews.com/apnews/topnews',
    newsApiId: 'associated-press',
    politicalLean: 'center',
    credibility: 0.9,
    website: 'apnews.com',
  },

  // Lean Right (updated per AllSides ratings)
  {
    id: 'wsj',
    name: 'Wall Street Journal',
    rssUrl: 'https://feeds.a.dj.com/rss/RSSWorldNews.xml',
    newsApiId: 'the-wall-street-journal',
    politicalLean: 'lean-right', // News section is lean-right per AllSides
    credibility: 0.8,
    website: 'wsj.com',
  },

  // Right-leaning
  {
    id: 'fox',
    name: 'Fox News',
    rssUrl: 'http://feeds.foxnews.com/foxnews/latest',
    newsApiId: 'fox-news',
    politicalLean: 'right',
    credibility: 0.6,
    website: 'foxnews.com',
  },
  {
    id: 'nypost',
    name: 'New York Post',
    rssUrl: 'https://nypost.com/feed/',
    newsApiId: 'new-york-post',
    politicalLean: 'right',
    credibility: 0.5,
    website: 'nypost.com',
  },
]