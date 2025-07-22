import { Article, TopicKeywords, NewsSortBy, NewsSource } from '../types'
import { isWithinTimeframe } from '../utils/dateUtils'
import { normalizeKeyword, removeDuplicateArticles } from '../utils/helpers'

// Political opposition scoring matrix - higher scores = better opposition
const OPPOSITION_MATRIX = {
  'left': {
    'left': 0,
    'lean-left': 20,
    'center': 70,
    'lean-right': 85,
    'right': 100,
    'unknown': 30
  },
  'lean-left': {
    'left': 20,
    'lean-left': 0,
    'center': 60,
    'lean-right': 80,
    'right': 90,
    'unknown': 30
  },
  'center': {
    'left': 70,
    'lean-left': 60,
    'center': 0,
    'lean-right': 60,
    'right': 70,
    'unknown': 30
  },
  'lean-right': {
    'left': 90,
    'lean-left': 80,
    'center': 60,
    'lean-right': 0,
    'right': 20,
    'unknown': 30
  },
  'right': {
    'left': 100,
    'lean-left': 85,
    'center': 70,
    'lean-right': 20,
    'right': 0,
    'unknown': 30
  },
  'unknown': {
    'left': 50,
    'lean-left': 50,
    'center': 50,
    'lean-right': 50,
    'right': 50,
    'unknown': 0
  }
} as const

type PoliticalLean = 'left' | 'lean-left' | 'center' | 'lean-right' | 'right' | 'unknown'

/**
 * Detect user's political lean based on their selected sources
 */
export const detectUserPoliticalLean = (selectedSources: NewsSource[]): {
  primaryLean: PoliticalLean
  confidence: number
  distribution: Record<PoliticalLean, number>
} => {
  if (selectedSources.length === 0) {
    return {
      primaryLean: 'center',
      confidence: 0,
      distribution: { left: 0, 'lean-left': 0, center: 0, 'lean-right': 0, right: 0, unknown: 0 }
    }
  }

  // Weight by credibility scores
  const distribution = { left: 0, 'lean-left': 0, center: 0, 'lean-right': 0, right: 0, unknown: 0 }
  let totalWeight = 0

  selectedSources.forEach(source => {
    const weight = source.credibility || 0.5 // Default credibility if not set
    distribution[source.politicalLean] += weight
    totalWeight += weight
  })

  // Normalize to percentages
  Object.keys(distribution).forEach(lean => {
    distribution[lean as PoliticalLean] = totalWeight > 0 ? distribution[lean as PoliticalLean] / totalWeight : 0
  })

  // Find primary lean (highest percentage)
  const primaryLean = Object.entries(distribution).reduce((max, [lean, score]) => 
    score > max.score ? { lean: lean as PoliticalLean, score } : max
  , { lean: 'center' as PoliticalLean, score: 0 }).lean

  // Calculate confidence (how concentrated the selection is)
  const confidence = distribution[primaryLean]

  return { primaryLean, confidence, distribution }
}

/**
 * Calculate opposition score for an article based on user's political lean
 */
const calculateOppositionScore = (
  userLean: PoliticalLean, 
  articleLean: PoliticalLean, 
  sourceCredibility: number
): number => {
  const baseScore = OPPOSITION_MATRIX[userLean][articleLean]
  // Boost credible sources (0.5 base + up to 0.5 credibility bonus)
  return baseScore * (0.5 + sourceCredibility * 0.5)
}

export const filterArticlesByTopic = (
  articles: Article[],
  topicKeywords: TopicKeywords
): Article[] => {
  const normalizedKeywords = topicKeywords.keywords.map(normalizeKeyword)

  return articles.filter((article) => {
    const titleLower = normalizeKeyword(article.title)
    const descriptionLower = normalizeKeyword(article.description)
    const combinedText = `${titleLower} ${descriptionLower}`

    return normalizedKeywords.some((keyword) =>
      combinedText.includes(keyword)
    )
  })
}

export const filterArticlesByTimeframe = (
  articles: Article[],
  timeframeDays: number
): Article[] => {
  return articles.filter((article) =>
    isWithinTimeframe(article.pubDate, timeframeDays)
  )
}

export const filterAndProcessArticles = (
  articles: Article[],
  topicKeywords: TopicKeywords,
  timeframeDays: number,
  sortBy: NewsSortBy,
  maxArticlesPerSource = 20
): Article[] => {
  // Filter by topic
  let filtered = filterArticlesByTopic(articles, topicKeywords)

  // Filter by timeframe
  filtered = filterArticlesByTimeframe(filtered, timeframeDays)

  // Remove duplicates
  filtered = removeDuplicateArticles(filtered)

  // Sort according to user preference (preserve NewsAPI sorting for relevancy/popularity)
  if (sortBy === 'publishedAt') {
    // Only sort by date when explicitly requested
    filtered.sort((a, b) => {
      const dateA = new Date(a.pubDate)
      const dateB = new Date(b.pubDate)
      return dateB.getTime() - dateA.getTime()
    })
  }
  // For 'relevancy' and 'popularity', preserve the order from NewsAPI

  // Limit articles per source
  const articlesBySource: Record<string, Article[]> = {}
  
  for (const article of filtered) {
    if (!articlesBySource[article.source]) {
      articlesBySource[article.source] = []
    }
    
    if (articlesBySource[article.source].length < maxArticlesPerSource) {
      articlesBySource[article.source].push(article)
    }
  }

  // Flatten back to single array
  return Object.values(articlesBySource).flat()
}

export const groupArticlesByPoliticalLean = (articles: Article[]) => {
  const grouped = {
    left: [] as Article[],
    'lean-left': [] as Article[],
    center: [] as Article[],
    'lean-right': [] as Article[],
    right: [] as Article[],
    unknown: [] as Article[],
  }

  articles.forEach((article) => {
    grouped[article.sourceLean].push(article)
  })

  return grouped
}

export const getOpposingPerspectives = (
  userSources: NewsSource[],
  allArticles: Article[],
  _sortBy: NewsSortBy // Used conceptually for maintaining sort order in opposition ranking
): { userArticles: Article[]; opposingArticles: Article[] } => {
  const userSourceNames = userSources.map(s => s.name.toLowerCase());
  
  // Separate user vs opposing articles
  const userArticles = allArticles.filter((article) =>
    userSourceNames.includes(article.source.toLowerCase())
  );

  let opposingArticles = allArticles.filter((article) =>
    !userSourceNames.includes(article.source.toLowerCase())
  );

  // Apply intelligent opposition ranking
  if (opposingArticles.length > 0 && userSources.length > 0) {
    const { primaryLean } = detectUserPoliticalLean(userSources);
    
    // Create a map of source credibility for quick lookup
    const sourceCredibilityMap = new Map<string, number>();
    // For opposing articles, we need to find their source credibility
    // Since we don't have the full source objects here, use default credibility
    
    // Sort opposing articles by opposition score
    opposingArticles.sort((a, b) => {
      const credibilityA = sourceCredibilityMap.get(a.source.toLowerCase()) || 0.6; // Default credibility
      const credibilityB = sourceCredibilityMap.get(b.source.toLowerCase()) || 0.6;
      
      const scoreA = calculateOppositionScore(primaryLean, a.sourceLean, credibilityA);
      const scoreB = calculateOppositionScore(primaryLean, b.sourceLean, credibilityB);
      
      // Higher opposition scores first
      if (scoreA !== scoreB) {
        return scoreB - scoreA;
      }
      
      // For ties, maintain original NewsAPI sorting
      // If sortBy is publishedAt, articles are already sorted by date in filterAndProcessArticles
      // For relevancy/popularity, preserve the original order by doing nothing
      return 0;
    });
  }

  return { userArticles, opposingArticles };
}

export const calculateTopicRelevance = (
  article: Article,
  topicKeywords: TopicKeywords
): number => {
  const normalizedKeywords = topicKeywords.keywords.map(normalizeKeyword)
  const titleLower = normalizeKeyword(article.title)
  const descriptionLower = normalizeKeyword(article.description)
  // const combinedText = `${titleLower} ${descriptionLower}`

  let relevanceScore = 0
  let keywordMatches = 0

  normalizedKeywords.forEach((keyword) => {
    const titleMatches = (titleLower.match(new RegExp(keyword, 'g')) || []).length
    const descriptionMatches = (descriptionLower.match(new RegExp(keyword, 'g')) || []).length
    
    if (titleMatches > 0 || descriptionMatches > 0) {
      keywordMatches++
      // Title matches get higher weight
      relevanceScore += titleMatches * 3 + descriptionMatches
    }
  })

  // Normalize score by total keywords and text length
  return keywordMatches / normalizedKeywords.length
}