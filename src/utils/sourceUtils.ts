import { NewsSource, NewsCategory } from '../types'

/**
 * Returns credibility indicator for a source based on its credibility score
 */
export const getCredibilityIndicator = (credibility: number): { emoji: string; text: string; color: string } => {
  if (credibility >= 0.8) return { emoji: '🟢', text: 'High', color: 'text-green-600' }
  if (credibility >= 0.6) return { emoji: '🟡', text: 'Medium', color: 'text-yellow-600' }
  return { emoji: '🔴', text: 'Low', color: 'text-red-600' }
}

/**
 * Returns the appropriate icon for a news category
 */
export const getCategoryIcon = (category: NewsCategory): string => {
  const icons = {
    business: '💼',
    entertainment: '🎭',
    general: '📰',
    health: '🏥',
    science: '🔬',
    sports: '⚽',
    technology: '💻'
  }
  return icons[category] || '📰'
}

/**
 * Filters sources based on text search
 */
export const filterSourcesBySearch = (sources: NewsSource[], searchTerm: string): NewsSource[] => {
  if (!searchTerm.trim()) return sources
  
  const term = searchTerm.toLowerCase().trim()
  return sources.filter(source => 
    source.name.toLowerCase().includes(term) ||
    source.website.toLowerCase().includes(term) ||
    (source.description && source.description.toLowerCase().includes(term))
  )
}

/**
 * Filters sources by category
 */
export const filterSourcesByCategory = (sources: NewsSource[], categories: NewsCategory[]): NewsSource[] => {
  if (!categories.length) return sources
  return sources.filter(source => source.category && categories.includes(source.category))
}

/**
 * Filters sources by country
 */
export const filterSourcesByCountry = (sources: NewsSource[], countries: string[]): NewsSource[] => {
  if (!countries.length) return sources
  return sources.filter(source => source.country && countries.includes(source.country.toLowerCase()))
}

/**
 * Filters sources by language
 */
export const filterSourcesByLanguage = (sources: NewsSource[], languages: string[]): NewsSource[] => {
  if (!languages.length) return sources
  return sources.filter(source => source.language && languages.includes(source.language.toLowerCase()))
}

/**
 * Sorts sources by various criteria
 */
export const sortSources = (
  sources: NewsSource[], 
  sortBy: 'name' | 'credibility' | 'political-lean' | 'category' = 'name'
): NewsSource[] => {
  return [...sources].sort((a, b) => {
    switch (sortBy) {
      case 'credibility':
        return b.credibility - a.credibility
      case 'name':
        return a.name.localeCompare(b.name)
      case 'category':
        if (!a.category && !b.category) return 0
        if (!a.category) return 1
        if (!b.category) return -1
        return a.category.localeCompare(b.category)
      case 'political-lean':
        // Sort by political lean: left -> center -> right -> unknown
        const leanOrder = { left: 1, 'lean-left': 2, center: 3, 'lean-right': 4, right: 5, unknown: 6 }
        return leanOrder[a.politicalLean] - leanOrder[b.politicalLean]
      default:
        return 0
    }
  })
}

/**
 * Gets unique categories from a list of sources
 */
export const getAvailableCategories = (sources: NewsSource[]): NewsCategory[] => {
  const categories = sources
    .map(source => source.category)
    .filter(Boolean) as NewsCategory[]
  return [...new Set(categories)].sort()
}

/**
 * Gets unique countries from a list of sources
 */
export const getAvailableCountries = (sources: NewsSource[]): string[] => {
  const countries = sources
    .map(source => source.country)
    .filter(Boolean) as string[]
  return [...new Set(countries)].sort()
}

/**
 * Gets unique languages from a list of sources
 */
export const getAvailableLanguages = (sources: NewsSource[]): string[] => {
  const languages = sources
    .map(source => source.language)
    .filter(Boolean) as string[]
  return [...new Set(languages)].sort()
}

/**
 * Checks if a source matches the given criteria
 */
export const sourceMatchesCriteria = (
  source: NewsSource,
  criteria: {
    search?: string
    categories?: NewsCategory[]
    countries?: string[]
    languages?: string[]
    minCredibility?: number
  }
): boolean => {
  const { search, categories, countries, languages, minCredibility } = criteria

  // Search filter
  if (search && !filterSourcesBySearch([source], search).length) {
    return false
  }

  // Category filter
  if (categories?.length && !filterSourcesByCategory([source], categories).length) {
    return false
  }

  // Country filter
  if (countries?.length && !filterSourcesByCountry([source], countries).length) {
    return false
  }

  // Language filter
  if (languages?.length && !filterSourcesByLanguage([source], languages).length) {
    return false
  }

  // Credibility filter
  if (minCredibility !== undefined && source.credibility < minCredibility) {
    return false
  }

  return true
}