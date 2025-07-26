// Topic Selection Constants
export const CUSTOM_SEARCH_TOPIC = 'Custom Search'

// Performance Constants
export const DEBOUNCE_DELAY = 300 // milliseconds
export const PAGINATION_PAGE_SIZE = 20
export const SIMILARITY_THRESHOLD = 0.8
export const MAX_RETRY_ATTEMPTS = 3

// UI Constants
export const MAX_SELECTED_SOURCES = 5
export const MIN_SELECTED_SOURCES = 1
export const MAX_SELECTED_LANGUAGES = 5
export const MAX_SELECTED_COUNTRIES = 3
export const MAX_CUSTOM_SEARCH_TERMS = 10

// Cache Constants
export const CACHE_EXPIRY_HOURS = 12
export const CACHE_STALE_HOURS = 6
export const MAX_CACHE_SIZE_MB = 50

// Animation Constants
export const FADE_DURATION = 200
export const SLIDE_DURATION = 300
export const BOUNCE_DURATION = 150

// Validation Constants
export const MIN_SEARCH_TERM_LENGTH = 2
export const MAX_SEARCH_TERM_LENGTH = 50
export const MAX_TITLE_LENGTH = 100
export const MAX_DESCRIPTION_LENGTH = 300

// Focus Management
export const FOCUS_DELAY = 100 // milliseconds to delay focus for accessibility

// Network Constants
export const REQUEST_TIMEOUT = 10000 // 10 seconds
export const RETRY_DELAY_BASE = 1000 // 1 second base delay for exponential backoff

// Date Constants
export const DEFAULT_DATE_RANGE_DAYS = 7
export const MAX_DATE_RANGE_DAYS = 30
export const MIN_DATE_RANGE_DAYS = 1

// News Categories (for type checking and validation)
export const NEWS_CATEGORIES = [
  'business',
  'entertainment', 
  'general',
  'health',
  'science',
  'sports',
  'technology'
] as const

// Political Lean Values
export const POLITICAL_LEANS = [
  'left',
  'lean-left',
  'center', 
  'lean-right',
  'right',
  'unknown'
] as const

// Sort Options
export const SORT_OPTIONS = [
  'relevancy',
  'publishedAt',
  'popularity'
] as const

// Language Codes (subset of supported languages)
export const SUPPORTED_LANGUAGES = [
  'ar', 'zh', 'nl', 'en', 'fr', 'de', 'he', 'it', 
  'no', 'pt', 'ru', 'es', 'sv', 'ur'
] as const

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error occurred. Please check your connection.',
  API_RATE_LIMIT: 'Too many requests. Please wait a moment and try again.',
  INVALID_API_KEY: 'Invalid API key. Please check your configuration.',
  NO_RESULTS: 'No articles found for your search criteria.',
  CACHE_ERROR: 'Error accessing cached data.',
  GENERIC_ERROR: 'An unexpected error occurred. Please try again.'
} as const

// Success Messages
export const SUCCESS_MESSAGES = {
  ARTICLES_LOADED: 'Articles loaded successfully',
  SOURCES_UPDATED: 'News sources updated',
  CACHE_CLEARED: 'Cache cleared successfully'
} as const