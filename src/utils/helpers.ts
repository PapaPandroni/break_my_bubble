import { Article } from '../types'

export const calculateStringSimilarity = (str1: string, str2: string): number => {
  const longer = str1.length > str2.length ? str1 : str2
  const shorter = str1.length > str2.length ? str2 : str1

  if (longer.length === 0) {
    return 1.0
  }

  const editDistance = levenshteinDistance(longer, shorter)
  return (longer.length - editDistance) / longer.length
}

const levenshteinDistance = (str1: string, str2: string): number => {
  const matrix = []

  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i]
  }

  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j
  }

  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1]
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        )
      }
    }
  }

  return matrix[str2.length][str1.length]
}

export const removeDuplicateArticles = (
  articles: Article[],
  similarityThreshold = 0.8
): Article[] => {
  const unique: Article[] = []

  for (const article of articles) {
    const isDuplicate = unique.some((existing) =>
      calculateStringSimilarity(
        article.title.toLowerCase(),
        existing.title.toLowerCase()
      ) > similarityThreshold
    )

    if (!isDuplicate) {
      unique.push(article)
    }
  }

  return unique
}

export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) {
    return text
  }
  return text.slice(0, maxLength - 3) + '...'
}

export const normalizeKeyword = (keyword: string): string => {
  return keyword.toLowerCase().trim()
}

export const extractTextFromHTML = (html: string): string => {
  // Simple HTML tag removal - in production, consider using DOMParser
  return html.replace(/<[^>]*>/g, '').trim()
}

export const shuffleArray = <T>(array: T[]): T[] => {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

export const groupBy = <T>(
  array: T[],
  keyFunction: (item: T) => string
): Record<string, T[]> => {
  return array.reduce(
    (groups, item) => {
      const key = keyFunction(item)
      if (!groups[key]) {
        groups[key] = []
      }
      groups[key].push(item)
      return groups
    },
    {} as Record<string, T[]>
  )
}