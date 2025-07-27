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

import DOMPurify from 'dompurify'

export const normalizeKeyword = (keyword: string): string => {
  return keyword.toLowerCase().trim()
}

export const extractTextFromHTML = (html: string): string => {
  // Use DOMPurify for secure HTML sanitization
  const sanitized = DOMPurify.sanitize(html, { 
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: [],
    KEEP_CONTENT: true
  })
  return sanitized.trim()
}

export const sanitizeHTML = (html: string): string => {
  // For cases where we want to keep some safe HTML tags
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u'],
    ALLOWED_ATTR: [],
    KEEP_CONTENT: true
  })
}

// URL validation and sanitization
export const validateURL = (url: string): boolean => {
  try {
    const parsed = new URL(url)
    return ['http:', 'https:'].includes(parsed.protocol)
  } catch {
    return false
  }
}

export const sanitizeURL = (url: string): string | null => {
  if (!validateURL(url)) {
    return null
  }
  try {
    const parsed = new URL(url)
    // Remove potentially dangerous parameters
    parsed.searchParams.delete('javascript')
    parsed.searchParams.delete('data')
    return parsed.href
  } catch {
    return null
  }
}

// Trusted domains for images (can be expanded)
const TRUSTED_IMAGE_DOMAINS = [
  'images.unsplash.com',
  'cdn.pixabay.com',
  'images.pexels.com',
  // News sources
  'cdn.cnn.com',
  'static01.nyt.com',
  'www.reuters.com',
  'ichef.bbci.co.uk',
  'img.huffingtonpost.com'
]

export const isValidImageURL = (url: string): boolean => {
  if (!validateURL(url)) return false
  
  try {
    const parsed = new URL(url)
    // Allow any HTTPS image from news sources for now
    // In production, consider implementing a more restrictive whitelist
    return parsed.protocol === 'https:' && 
           (TRUSTED_IMAGE_DOMAINS.some(domain => parsed.hostname.includes(domain)) ||
            parsed.hostname.includes('news') ||
            parsed.hostname.includes('media'))
  } catch {
    return false
  }
}

// Input validation for search terms
export const validateSearchTerm = (term: string): boolean => {
  if (!term || typeof term !== 'string') return false
  
  const trimmed = term.trim()
  if (trimmed.length === 0 || trimmed.length > 100) return false
  
  // Check for potential script injection patterns
  const dangerousPatterns = [
    /<script/i,
    /javascript:/i,
    /data:/i,
    /vbscript:/i,
    /on\w+\s*=/i
  ]
  
  return !dangerousPatterns.some(pattern => pattern.test(trimmed))
}

export const sanitizeSearchTerms = (terms: string[]): string[] => {
  return terms
    .filter(term => validateSearchTerm(term))
    .map(term => term.trim().toLowerCase())
    .filter(term => term.length > 0)
    .slice(0, 10) // Limit to 10 terms max
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