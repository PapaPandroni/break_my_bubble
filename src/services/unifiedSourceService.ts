import { 
  NewsSource, 
  NewsAPISourcesResponse, 
  NewsAPISourceData, 
  NewsLanguage, 
  NewsCategory,
  SourceFilters
} from '../types';
import { NEWS_SOURCES } from '../data/newsSources';
import { AVAILABLE_LANGUAGES } from './dynamicSourceService';

const API_KEY = import.meta.env.VITE_NEWS_API_KEY;
const BASE_URL = 'https://newsapi.org/v2';

// Cache configuration
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours
const CACHE_KEY_ALL_SOURCES = 'unified_all_sources';
const CACHE_KEY_STATIC_FALLBACK = 'static_sources_fallback';

// Political lean classification mapping (consolidated from dynamicSourceService)
const POLITICAL_LEAN_MAPPING = {
  'cnn': { lean: 'left' as const, credibility: 0.7, confidence: 0.9 },
  'msnbc': { lean: 'left' as const, credibility: 0.6, confidence: 0.9 },
  'the-guardian-uk': { lean: 'left' as const, credibility: 0.8, confidence: 0.9 },
  'the-huffington-post': { lean: 'left' as const, credibility: 0.6, confidence: 0.8 },
  'politico': { lean: 'left' as const, credibility: 0.7, confidence: 0.7 },
  'bbc-news': { lean: 'center' as const, credibility: 0.8, confidence: 0.9 },
  'reuters': { lean: 'center' as const, credibility: 0.9, confidence: 0.9 },
  'associated-press': { lean: 'center' as const, credibility: 0.9, confidence: 0.9 },
  'npr': { lean: 'center' as const, credibility: 0.9, confidence: 0.8 },
  'usa-today': { lean: 'center' as const, credibility: 0.7, confidence: 0.8 },
  'time': { lean: 'center' as const, credibility: 0.8, confidence: 0.7 },
  'fox-news': { lean: 'right' as const, credibility: 0.6, confidence: 0.9 },
  'the-wall-street-journal': { lean: 'right' as const, credibility: 0.8, confidence: 0.8 },
  'new-york-post': { lean: 'right' as const, credibility: 0.5, confidence: 0.8 },
  'breitbart-news': { lean: 'right' as const, credibility: 0.4, confidence: 0.9 },
  'national-review': { lean: 'right' as const, credibility: 0.7, confidence: 0.8 }
};

// Domain-based heuristics for unknown sources
const DOMAIN_HEURISTICS = {
  left: ['guardian', 'huffpost', 'slate', 'vox', 'motherjones', 'thenation'],
  right: ['foxnews', 'breitbart', 'dailywire', 'nationalreview', 'wsj', 'nypost'],
  center: ['bbc', 'reuters', 'ap', 'npr', 'pbs', 'cspan']
};

interface SourceCache {
  sources: NewsSource[];
  timestamp: number;
  isFromAPI: boolean;
}

/**
 * Unified service for managing news sources with optimized caching and loading
 */
class UnifiedSourceService {
  private loadingPromise: Promise<NewsSource[]> | null = null;

  /**
   * Get sources with optimistic loading - returns static sources immediately,
   * then loads dynamic sources in background
   */
  async getSourcesOptimistic(): Promise<{
    sources: NewsSource[];
    isLoading: boolean;
    loadDynamic: () => Promise<NewsSource[]>;
  }> {
    // Always return static sources immediately for instant UI
    const staticSources = this.getStaticSources();
    
    // Check if we have fresh dynamic sources in cache
    const cachedSources = this.getCachedSources();
    if (cachedSources && cachedSources.isFromAPI) {
      return {
        sources: cachedSources.sources,
        isLoading: false,
        loadDynamic: () => Promise.resolve(cachedSources.sources)
      };
    }

    // Return static sources immediately and provide function to load dynamic
    return {
      sources: staticSources,
      isLoading: true,
      loadDynamic: () => this.loadDynamicSources()
    };
  }

  /**
   * Get all sources (tries dynamic first, falls back to static)
   */
  async getAllSources(): Promise<NewsSource[]> {
    // Check cache first
    const cached = this.getCachedSources();
    if (cached) {
      return cached.sources;
    }

    // If already loading, wait for existing request
    if (this.loadingPromise) {
      return this.loadingPromise;
    }

    return this.loadDynamicSources();
  }

  /**
   * Load dynamic sources from NewsAPI with fallback to static
   */
  private async loadDynamicSources(): Promise<NewsSource[]> {
    if (this.loadingPromise) {
      return this.loadingPromise;
    }

    this.loadingPromise = this.fetchFromAPI();
    
    try {
      const sources = await this.loadingPromise;
      this.loadingPromise = null;
      return sources;
    } catch (error) {
      this.loadingPromise = null;
      throw error;
    }
  }

  /**
   * Fetch sources from NewsAPI
   */
  private async fetchFromAPI(): Promise<NewsSource[]> {
    try {
      if (!API_KEY) {
        console.warn('NewsAPI key not configured, using static sources');
        return this.getStaticSourcesWithCache();
      }

      const response = await fetch(`${BASE_URL}/top-headlines/sources?apiKey=${API_KEY}`);
      
      if (!response.ok) {
        throw new Error(`NewsAPI sources request failed: ${response.status}`);
      }

      const data: NewsAPISourcesResponse = await response.json();
      
      if (data.status !== 'ok') {
        throw new Error(data.message || 'NewsAPI sources request failed');
      }

      // Transform API sources to our format
      const dynamicSources = data.sources.map(apiSource => this.transformNewsAPISource(apiSource));
      
      // Merge with static sources (static sources take precedence for duplicates)
      const allSources = this.mergeWithStaticSources(dynamicSources);

      // Cache the results
      this.setCachedSources({
        sources: allSources,
        timestamp: Date.now(),
        isFromAPI: true
      });

      return allSources;
    } catch (error) {
      console.error('Failed to fetch dynamic sources:', error);
      // Fallback to static sources
      return this.getStaticSourcesWithCache();
    }
  }

  /**
   * Get static sources with caching
   */
  private getStaticSourcesWithCache(): NewsSource[] {
    const staticSources = this.getStaticSources();
    
    // Cache static sources as fallback
    this.setCachedSources({
      sources: staticSources,
      timestamp: Date.now(),
      isFromAPI: false
    });

    return staticSources;
  }

  /**
   * Get static sources
   */
  private getStaticSources(): NewsSource[] {
    return NEWS_SOURCES.map(source => ({
      ...source,
      isDynamic: false
    }));
  }

  /**
   * Merge dynamic sources with static sources
   */
  private mergeWithStaticSources(dynamicSources: NewsSource[]): NewsSource[] {
    const staticSources = this.getStaticSources();
    const staticIds = new Set(staticSources.map(s => s.newsApiId).filter(Boolean));
    
    // Filter out dynamic sources that conflict with static ones
    const uniqueDynamicSources = dynamicSources.filter(source => 
      !staticIds.has(source.newsApiId || source.id)
    );

    return [...staticSources, ...uniqueDynamicSources];
  }

  /**
   * Transform NewsAPI source to our format
   */
  private transformNewsAPISource(apiSource: NewsAPISourceData): NewsSource {
    const politicalLeanData = this.classifyPoliticalLean(apiSource);
    
    return {
      id: apiSource.id,
      name: apiSource.name,
      newsApiId: apiSource.id,
      politicalLean: politicalLeanData.lean,
      credibility: politicalLeanData.credibility,
      website: this.extractDomain(apiSource.url),
      description: apiSource.description,
      category: apiSource.category,
      language: apiSource.language,
      country: apiSource.country,
      isDynamic: true
    };
  }

  /**
   * Classify political lean for a source
   */
  private classifyPoliticalLean(apiSource: NewsAPISourceData): {
    lean: 'left' | 'center' | 'right';
    credibility: number;
  } {
    // Check explicit mapping first
    if (POLITICAL_LEAN_MAPPING[apiSource.id as keyof typeof POLITICAL_LEAN_MAPPING]) {
      const mapping = POLITICAL_LEAN_MAPPING[apiSource.id as keyof typeof POLITICAL_LEAN_MAPPING];
      return {
        lean: mapping.lean,
        credibility: mapping.credibility
      };
    }

    // Use domain heuristics
    const domain = this.extractDomain(apiSource.url).toLowerCase();
    const name = apiSource.name.toLowerCase();
    
    for (const [lean, keywords] of Object.entries(DOMAIN_HEURISTICS)) {
      for (const keyword of keywords) {
        if (domain.includes(keyword) || name.includes(keyword)) {
          return {
            lean: lean as 'left' | 'center' | 'right',
            credibility: 0.6
          };
        }
      }
    }

    // Default to center for unknown sources
    return { lean: 'center', credibility: 0.5 };
  }

  /**
   * Extract domain from URL
   */
  private extractDomain(url: string): string {
    try {
      const urlObj = new URL(url);
      return urlObj.hostname.replace('www.', '');
    } catch {
      return url;
    }
  }

  /**
   * Filter sources based on criteria (client-side filtering)
   */
  filterSources(sources: NewsSource[], filters: SourceFilters): NewsSource[] {
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
   * Get available countries from sources
   */
  getAvailableCountries(sources: NewsSource[]): string[] {
    const countries = sources
      .map(source => source.country)
      .filter(Boolean) as string[];
    
    return [...new Set(countries)].sort();
  }

  /**
   * Get available categories from sources
   */
  getAvailableCategories(sources: NewsSource[]): NewsCategory[] {
    const categories = sources
      .map(source => source.category)
      .filter(Boolean) as NewsCategory[];
    
    return [...new Set(categories)].sort();
  }

  /**
   * Cache management
   */
  private getCachedSources(): SourceCache | null {
    try {
      const cached = localStorage.getItem(CACHE_KEY_ALL_SOURCES);
      if (!cached) return null;

      const parsedCache: SourceCache = JSON.parse(cached);
      const isExpired = Date.now() - parsedCache.timestamp > CACHE_DURATION;
      
      if (isExpired) {
        localStorage.removeItem(CACHE_KEY_ALL_SOURCES);
        return null;
      }

      return parsedCache;
    } catch {
      return null;
    }
  }

  private setCachedSources(cache: SourceCache): void {
    try {
      localStorage.setItem(CACHE_KEY_ALL_SOURCES, JSON.stringify(cache));
    } catch (error) {
      console.warn('Failed to cache sources:', error);
    }
  }

  /**
   * Clear all source caches
   */
  clearCache(): void {
    this.loadingPromise = null;
    try {
      localStorage.removeItem(CACHE_KEY_ALL_SOURCES);
      localStorage.removeItem(CACHE_KEY_STATIC_FALLBACK);
    } catch (error) {
      console.warn('Failed to clear source cache:', error);
    }
  }

  /**
   * Preload sources in background (fire-and-forget)
   */
  preloadSources(): void {
    // Only preload if we don't have fresh cached sources
    const cached = this.getCachedSources();
    if (cached && cached.isFromAPI) {
      return; // Already have fresh dynamic sources
    }

    // Fire and forget - don't await this
    this.loadDynamicSources().catch(error => {
      console.warn('Background source preload failed:', error);
    });
  }
}

// Export singleton instance
export const unifiedSourceService = new UnifiedSourceService();

// Export available languages for convenience
export { AVAILABLE_LANGUAGES };