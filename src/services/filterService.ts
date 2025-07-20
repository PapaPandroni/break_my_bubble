import { Article, TopicKeywords } from '../types'
import { isWithinTimeframe } from '../utils/dateUtils'
import { normalizeKeyword, removeDuplicateArticles } from '../utils/helpers'

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
  maxArticlesPerSource = 20
): Article[] => {
  // Filter by topic
  let filtered = filterArticlesByTopic(articles, topicKeywords)

  // Filter by timeframe
  filtered = filterArticlesByTimeframe(filtered, timeframeDays)

  // Remove duplicates
  filtered = removeDuplicateArticles(filtered)

  // Sort by publication date (newest first)
  filtered.sort((a, b) => {
    const dateA = new Date(a.pubDate)
    const dateB = new Date(b.pubDate)
    return dateB.getTime() - dateA.getTime()
  })

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
    center: [] as Article[],
    right: [] as Article[],
  }

  articles.forEach((article) => {
    grouped[article.sourceLean].push(article)
  })

  return grouped
}

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

export const calculateTopicRelevance = (
  article: Article,
  topicKeywords: TopicKeywords
): number => {
  const normalizedKeywords = topicKeywords.keywords.map(normalizeKeyword)
  const titleLower = normalizeKeyword(article.title)
  const descriptionLower = normalizeKeyword(article.description)
  const combinedText = `${titleLower} ${descriptionLower}`

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