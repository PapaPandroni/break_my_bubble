import { 
  NewsSource, 
  NewsAPISourcesResponse, 
  NewsAPISourceData, 
  LanguageOption, 
  NewsLanguage, 
  NewsCategory, 
  DynamicSourceCache,
  PoliticalLeanMapping,
  SourceFilters
} from '../types';
import { NEWS_SOURCES } from '../data/newsSources';

const API_KEY = import.meta.env.VITE_NEWS_API_KEY;
const BASE_URL = 'https://newsapi.org/v2';
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours
const CACHE_KEY_PREFIX = 'dynamic_sources_';

// Available languages with display names and flags
export const AVAILABLE_LANGUAGES: LanguageOption[] = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪' },
  { code: 'it', name: 'Italian', nativeName: 'Italiano', flag: '🇮🇹' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português', flag: '🇵🇹' },
  { code: 'ru', name: 'Russian', nativeName: 'Русский', flag: '🇷🇺' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦' },
  { code: 'he', name: 'Hebrew', nativeName: 'עברית', flag: '🇮🇱' },
  { code: 'nl', name: 'Dutch', nativeName: 'Nederlands', flag: '🇳🇱' },
  { code: 'no', name: 'Norwegian', nativeName: 'Norsk', flag: '🇳🇴' },
  { code: 'sv', name: 'Swedish', nativeName: 'Svenska', flag: '🇸🇪' },
  { code: 'zh', name: 'Chinese', nativeName: '中文', flag: '🇨🇳' },
  { code: 'ud', name: 'Urdu', nativeName: 'اردو', flag: '🇵🇰' },
];

// Political lean classification mapping
// This maps NewsAPI source IDs to political leans and credibility scores
const POLITICAL_LEAN_MAPPING: PoliticalLeanMapping = {
  'cnn': { lean: 'left', credibility: 0.7, confidence: 0.9 },
  'msnbc': { lean: 'left', credibility: 0.6, confidence: 0.9 },
  'the-guardian-uk': { lean: 'left', credibility: 0.8, confidence: 0.9 },
  'the-huffington-post': { lean: 'left', credibility: 0.6, confidence: 0.8 },
  'politico': { lean: 'left', credibility: 0.7, confidence: 0.7 },
  
  // Lean-left sources
  'cnn-es': { lean: 'lean-left', credibility: 0.7, confidence: 0.8 },
  'the-hindu': { lean: 'lean-left', credibility: 0.8, confidence: 0.8 },
  'infobae': { lean: 'lean-left', credibility: 0.6, confidence: 0.7 },
  'ynet': { lean: 'lean-left', credibility: 0.7, confidence: 0.8 },
  
  'bbc-news': { lean: 'center', credibility: 0.8, confidence: 0.9 },
  'reuters': { lean: 'center', credibility: 0.9, confidence: 0.9 },
  'associated-press': { lean: 'center', credibility: 0.9, confidence: 0.9 },
  'npr': { lean: 'center', credibility: 0.9, confidence: 0.8 },
  'usa-today': { lean: 'center', credibility: 0.7, confidence: 0.8 },
  'time': { lean: 'center', credibility: 0.8, confidence: 0.7 },
  'blasting-news-br': { lean: 'center', credibility: 0.6, confidence: 0.7 },
  'sabq': { lean: 'center', credibility: 0.5, confidence: 0.6 },
  
  // Lean-right sources
  'aftenposten': { lean: 'lean-right', credibility: 0.7, confidence: 0.8 },
  'goteborgs-posten': { lean: 'lean-right', credibility: 0.6, confidence: 0.7 },
  'the-jerusalem-post': { lean: 'lean-right', credibility: 0.7, confidence: 0.8 },
  'svenska-dagbladet': { lean: 'lean-right', credibility: 0.7, confidence: 0.8 },
  'news-com-au': { lean: 'lean-right', credibility: 0.6, confidence: 0.7 },
  'rbc': { lean: 'lean-right', credibility: 0.6, confidence: 0.7 },
  
  'fox-news': { lean: 'right', credibility: 0.6, confidence: 0.9 },
  'the-wall-street-journal': { lean: 'right', credibility: 0.8, confidence: 0.8 },
  'new-york-post': { lean: 'right', credibility: 0.5, confidence: 0.8 },
  'breitbart-news': { lean: 'right', credibility: 0.4, confidence: 0.9 },
  'national-review': { lean: 'right', credibility: 0.7, confidence: 0.8 },
  'globo': { lean: 'right', credibility: 0.6, confidence: 0.8 },
  'la-gaceta': { lean: 'right', credibility: 0.5, confidence: 0.7 },
};

// Domain-based heuristics for unknown sources
const DOMAIN_HEURISTICS = {
  left: ['guardian', 'huffpost', 'slate', 'vox', 'motherjones', 'thenation'],
  right: ['foxnews', 'breitbart', 'dailywire', 'nationalreview', 'wsj', 'nypost'],
  center: ['bbc', 'reuters', 'ap', 'npr', 'pbs', 'cspan']
};

/**
 * Fetches available sources from NewsAPI with optional filtering
 */
export async function fetchDynamicSources(
  languages?: NewsLanguage[],
  categories?: NewsCategory[],
  countries?: string[]
): Promise<NewsSource[]> {
  try {
    // Check if API key is available
    if (!API_KEY) {
      console.warn('NewsAPI key not configured, falling back to static sources');
      return getStaticSourcesFallback(languages, countries);
    }

    // Check cache first
    const cacheKey = `${CACHE_KEY_PREFIX}${JSON.stringify({ languages, categories, countries })}`;
    const cached = getCachedSources(cacheKey);
    if (cached) {
      return cached.sources;
    }

    // NewsAPI sources endpoint doesn't support multiple countries, so we need to fetch all and filter
    const params = new URLSearchParams({
      apiKey: API_KEY,
    });

    if (languages && languages.length > 0) {
      params.append('language', languages.join(','));
    }
    if (categories && categories.length > 0) {
      params.append('category', categories.join(','));
    }
    // Note: NewsAPI sources endpoint only supports single country, we'll filter after fetching

    const response = await fetch(`${BASE_URL}/top-headlines/sources?${params}`);
    
    if (!response.ok) {
      throw new Error(`NewsAPI sources request failed: ${response.status}`);
    }

    const data: NewsAPISourcesResponse = await response.json();
    
    if (data.status !== 'ok') {
      throw new Error(data.message || 'NewsAPI sources request failed');
    }

    // Transform NewsAPI sources to our format
    let sources = data.sources.map(apiSource => transformNewsAPISource(apiSource));

    // Filter by countries if specified (since NewsAPI doesn't support multiple countries in the API)
    if (countries && countries.length > 0) {
      sources = sources.filter(source => 
        source.country && countries.includes(source.country)
      );
    }

    // Cache the results
    setCachedSources(cacheKey, {
      sources,
      timestamp: Date.now(),
      languages: languages || [],
      categories: categories || []
    });

    return sources;
  } catch (error) {
    console.error('Failed to fetch dynamic sources:', error);
    // Fallback to static sources if available
    return getStaticSourcesFallback(languages, countries);
  }
}

/**
 * Transforms a NewsAPI source to our NewsSource format
 */
function transformNewsAPISource(apiSource: NewsAPISourceData): NewsSource {
  const politicalLeanData = classifyPoliticalLean(apiSource);
  
  return {
    id: apiSource.id,
    name: apiSource.name,
    newsApiId: apiSource.id,
    politicalLean: politicalLeanData.lean,
    credibility: politicalLeanData.credibility,
    website: extractDomain(apiSource.url),
    description: apiSource.description,
    category: apiSource.category,
    language: apiSource.language,
    country: apiSource.country,
    isDynamic: true
  };
}

/**
 * Classifies political lean for a source
 */
function classifyPoliticalLean(apiSource: NewsAPISourceData): {
  lean: 'left' | 'lean-left' | 'center' | 'lean-right' | 'right' | 'unknown';
  credibility: number;
} {
  // Check explicit mapping first
  if (POLITICAL_LEAN_MAPPING[apiSource.id]) {
    const mapping = POLITICAL_LEAN_MAPPING[apiSource.id];
    return {
      lean: mapping.lean,
      credibility: mapping.credibility
    };
  }

  // Use domain heuristics
  const domain = extractDomain(apiSource.url).toLowerCase();
  const name = apiSource.name.toLowerCase();
  
  for (const [lean, keywords] of Object.entries(DOMAIN_HEURISTICS)) {
    for (const keyword of keywords) {
      if (domain.includes(keyword) || name.includes(keyword)) {
        return {
          lean: lean as 'left' | 'center' | 'right',
          credibility: 0.6 // Default credibility for heuristic matches
        };
      }
    }
  }

  // Default to center for unknown sources
  return {
    lean: 'center',
    credibility: 0.5
  };
}

/**
 * Extracts domain from URL
 */
function extractDomain(url: string): string {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname.replace('www.', '');
  } catch {
    return url;
  }
}

/**
 * Filters sources based on criteria
 */
export function filterSources(sources: NewsSource[], filters: SourceFilters): NewsSource[] {
  return sources.filter(source => {
    // Language filter
    if (filters.languages.length > 0 && source.language) {
      if (!filters.languages.includes(source.language as NewsLanguage)) {
        return false;
      }
    }

    // Category filter
    if (filters.categories.length > 0 && source.category) {
      if (!filters.categories.includes(source.category)) {
        return false;
      }
    }

    // Country filter
    if (filters.countries.length > 0 && source.country) {
      if (!filters.countries.includes(source.country)) {
        return false;
      }
    }

    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      return (
        source.name.toLowerCase().includes(searchLower) ||
        source.description?.toLowerCase().includes(searchLower) ||
        source.website.toLowerCase().includes(searchLower)
      );
    }

    return true;
  });
}

/**
 * Cache management functions
 */
function getCachedSources(cacheKey: string): DynamicSourceCache | null {
  try {
    const cached = localStorage.getItem(cacheKey);
    if (!cached) return null;

    const parsedCache: DynamicSourceCache = JSON.parse(cached);
    const isExpired = Date.now() - parsedCache.timestamp > CACHE_DURATION;
    
    if (isExpired) {
      localStorage.removeItem(cacheKey);
      return null;
    }

    return parsedCache;
  } catch {
    return null;
  }
}

function setCachedSources(cacheKey: string, cache: DynamicSourceCache): void {
  try {
    localStorage.setItem(cacheKey, JSON.stringify(cache));
  } catch (error) {
    console.warn('Failed to cache sources:', error);
  }
}

/**
 * Fallback to static sources when dynamic fetching fails
 */
function getStaticSourcesFallback(languages?: NewsLanguage[], countries?: string[]): NewsSource[] {
  // If specific languages requested but we only have English static sources,
  // return empty array to indicate language filtering not available
  if (languages && languages.length > 0 && !languages.includes('en')) {
    return [];
  }

  // If specific countries requested, filter static sources (most are US-based)
  let sources = NEWS_SOURCES;
  if (countries && countries.length > 0) {
    // Most static sources are US-based, so only return them if 'us' is in the countries list
    if (!countries.includes('us')) {
      return [];
    }
  }

  // Return static sources with isDynamic: false
  return sources.map(source => ({
    ...source,
    isDynamic: false
  }));
}

/**
 * Get unique countries from sources
 */
export function getAvailableCountries(sources: NewsSource[]): string[] {
  const countries = sources
    .map(source => source.country)
    .filter(Boolean) as string[];
  
  return [...new Set(countries)].sort();
}

/**
 * Get unique categories from sources
 */
export function getAvailableCategories(sources: NewsSource[]): NewsCategory[] {
  const categories = sources
    .map(source => source.category)
    .filter(Boolean) as NewsCategory[];
  
  return [...new Set(categories)].sort();
}

/**
 * Clear all dynamic source caches
 */
export function clearDynamicSourceCache(): void {
  const keys = Object.keys(localStorage).filter(key => 
    key.startsWith(CACHE_KEY_PREFIX)
  );
  
  keys.forEach(key => localStorage.removeItem(key));
}