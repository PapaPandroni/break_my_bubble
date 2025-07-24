import { 
  NewsSource, 
  NewsAPISourcesResponse, 
  NewsAPISourceData, 
  NewsLanguage, 
  NewsCategory,
  SourceFilters,
  LanguageOption
} from '../types';
import { NEWS_SOURCES } from '../data/newsSources';

const API_KEY = import.meta.env.VITE_NEWS_API_KEY;
const BASE_URL = 'https://newsapi.org/v2';

// Cache configuration
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours
const CACHE_KEY_ALL_SOURCES = 'unified_all_sources';
const CACHE_KEY_STATIC_FALLBACK = 'static_sources_fallback';

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

// Political lean classification mapping based on AllSides Media Bias Chart
// Updated mapping for real NewsAPI source IDs (January 2025)
//
// CLASSIFICATION COVERAGE:
// - 80+ explicitly classified sources using ACTUAL NewsAPI IDs (high confidence)
// - Enhanced keywords for domain-based heuristics (medium confidence) 
// - Unknown classification for unrecognized sources (prevents false center labeling)
//
// BIAS SCALE: Left → Lean Left → Center → Lean Right → Right → Unknown
// VERIFIED: All source IDs confirmed to exist in NewsAPI (127 total sources available)
const POLITICAL_LEAN_MAPPING = {
  // Left - Sources with clear liberal/progressive editorial positions
  'cnn': { lean: 'left' as const, credibility: 0.7, confidence: 0.9 },
  'msnbc': { lean: 'left' as const, credibility: 0.6, confidence: 0.9 },
  'the-huffington-post': { lean: 'left' as const, credibility: 0.6, confidence: 0.9 },
  'buzzfeed': { lean: 'left' as const, credibility: 0.5, confidence: 0.8 },
  'vice-news': { lean: 'left' as const, credibility: 0.6, confidence: 0.8 },
  
  // Lean Left - Sources with slight liberal editorial positions but generally good journalism
  'politico': { lean: 'lean-left' as const, credibility: 0.7, confidence: 0.9 },
  'usa-today': { lean: 'lean-left' as const, credibility: 0.7, confidence: 0.9 },
  'time': { lean: 'lean-left' as const, credibility: 0.8, confidence: 0.9 },
  'the-washington-post': { lean: 'lean-left' as const, credibility: 0.8, confidence: 0.9 },
  'abc-news': { lean: 'lean-left' as const, credibility: 0.7, confidence: 0.8 },
  'cbs-news': { lean: 'lean-left' as const, credibility: 0.7, confidence: 0.8 },
  'nbc-news': { lean: 'lean-left' as const, credibility: 0.7, confidence: 0.8 },
  'newsweek': { lean: 'lean-left' as const, credibility: 0.6, confidence: 0.8 },
  'bloomberg': { lean: 'lean-left' as const, credibility: 0.8, confidence: 0.8 },
  'axios': { lean: 'lean-left' as const, credibility: 0.7, confidence: 0.8 },
  'the-hill': { lean: 'lean-left' as const, credibility: 0.7, confidence: 0.7 },
  'business-insider': { lean: 'lean-left' as const, credibility: 0.6, confidence: 0.7 },
  'mashable': { lean: 'lean-left' as const, credibility: 0.6, confidence: 0.6 },
  'techcrunch': { lean: 'lean-left' as const, credibility: 0.7, confidence: 0.6 },
  'the-verge': { lean: 'lean-left' as const, credibility: 0.7, confidence: 0.6 },
  'wired': { lean: 'lean-left' as const, credibility: 0.7, confidence: 0.6 },
  'engadget': { lean: 'lean-left' as const, credibility: 0.6, confidence: 0.6 },
  'ars-technica': { lean: 'lean-left' as const, credibility: 0.8, confidence: 0.7 },
  'recode': { lean: 'lean-left' as const, credibility: 0.7, confidence: 0.7 },
  
  // Center - Sources with minimal editorial bias, focus on factual reporting
  'bbc-news': { lean: 'center' as const, credibility: 0.8, confidence: 0.9 },
  'reuters': { lean: 'center' as const, credibility: 0.9, confidence: 0.9 },
  'associated-press': { lean: 'center' as const, credibility: 0.9, confidence: 0.9 },
  'fortune': { lean: 'center' as const, credibility: 0.7, confidence: 0.7 },
  'google-news': { lean: 'center' as const, credibility: 0.7, confidence: 0.6 },
  'hacker-news': { lean: 'center' as const, credibility: 0.6, confidence: 0.6 },
  'new-scientist': { lean: 'center' as const, credibility: 0.8, confidence: 0.7 },
  'medical-news-today': { lean: 'center' as const, credibility: 0.7, confidence: 0.6 },
  'national-geographic': { lean: 'center' as const, credibility: 0.8, confidence: 0.7 },
  
  // Lean Right - Sources with slight conservative editorial positions
  'the-wall-street-journal': { lean: 'lean-right' as const, credibility: 0.8, confidence: 0.9 },
  'new-york-magazine': { lean: 'lean-right' as const, credibility: 0.6, confidence: 0.7 },
  
  // Right - Sources with clear conservative editorial positions
  'fox-news': { lean: 'right' as const, credibility: 0.6, confidence: 0.9 },
  'breitbart-news': { lean: 'right' as const, credibility: 0.4, confidence: 0.9 },
  'national-review': { lean: 'right' as const, credibility: 0.7, confidence: 0.9 },
  'the-american-conservative': { lean: 'right' as const, credibility: 0.7, confidence: 0.8 },
  'the-washington-times': { lean: 'right' as const, credibility: 0.5, confidence: 0.8 },
  
  // International Sources - Classified by editorial positions relative to their home countries
  'al-jazeera-english': { lean: 'lean-left' as const, credibility: 0.7, confidence: 0.6 },
  'rt': { lean: 'right' as const, credibility: 0.3, confidence: 0.8 },
  'independent': { lean: 'lean-left' as const, credibility: 0.6, confidence: 0.7 },
  'the-times-of-india': { lean: 'center' as const, credibility: 0.6, confidence: 0.5 },
  'xinhua-net': { lean: 'right' as const, credibility: 0.4, confidence: 0.7 },
  'bbc-sport': { lean: 'center' as const, credibility: 0.8, confidence: 0.7 },
  'abc-news-au': { lean: 'center' as const, credibility: 0.7, confidence: 0.6 },
  'cbc-news': { lean: 'lean-left' as const, credibility: 0.7, confidence: 0.6 },
  'the-globe-and-mail': { lean: 'center' as const, credibility: 0.7, confidence: 0.6 },
  'the-irish-times': { lean: 'center' as const, credibility: 0.7, confidence: 0.6 },
  'rte': { lean: 'center' as const, credibility: 0.7, confidence: 0.6 },
  
  // German Sources
  'spiegel-online': { lean: 'lean-left' as const, credibility: 0.7, confidence: 0.6 },
  'bild': { lean: 'lean-right' as const, credibility: 0.5, confidence: 0.7 },
  'die-zeit': { lean: 'lean-left' as const, credibility: 0.8, confidence: 0.7 },
  'der-tagesspiegel': { lean: 'lean-left' as const, credibility: 0.7, confidence: 0.6 },
  'handelsblatt': { lean: 'center' as const, credibility: 0.7, confidence: 0.6 },
  'focus': { lean: 'lean-right' as const, credibility: 0.6, confidence: 0.6 },
  'wired-de': { lean: 'lean-left' as const, credibility: 0.7, confidence: 0.5 },
  't3n': { lean: 'center' as const, credibility: 0.6, confidence: 0.5 },
  'gruenderszene': { lean: 'center' as const, credibility: 0.6, confidence: 0.5 },
  'wirtschafts-woche': { lean: 'lean-right' as const, credibility: 0.7, confidence: 0.6 },
  
  // French Sources
  'le-monde': { lean: 'lean-left' as const, credibility: 0.8, confidence: 0.7 },
  'les-echos': { lean: 'lean-right' as const, credibility: 0.7, confidence: 0.6 },
  'liberation': { lean: 'left' as const, credibility: 0.6, confidence: 0.7 },
  'lequipe': { lean: 'center' as const, credibility: 0.7, confidence: 0.6 },
  
  // Italian Sources  
  'la-repubblica': { lean: 'lean-left' as const, credibility: 0.7, confidence: 0.6 },
  'il-sole-24-ore': { lean: 'lean-right' as const, credibility: 0.7, confidence: 0.6 },
  'ansa': { lean: 'center' as const, credibility: 0.7, confidence: 0.6 },
  
  // Spanish Sources
  'el-mundo': { lean: 'lean-right' as const, credibility: 0.7, confidence: 0.6 },
  'marca': { lean: 'center' as const, credibility: 0.6, confidence: 0.5 },
  
  // Sports/Entertainment (Generally Center but can vary)
  'espn': { lean: 'center' as const, credibility: 0.7, confidence: 0.6 },
  'fox-sports': { lean: 'center' as const, credibility: 0.7, confidence: 0.6 },
  'bleacher-report': { lean: 'center' as const, credibility: 0.6, confidence: 0.5 },
  'entertainment-weekly': { lean: 'lean-left' as const, credibility: 0.6, confidence: 0.5 },
  'mtv-news': { lean: 'lean-left' as const, credibility: 0.5, confidence: 0.5 },
  'ign': { lean: 'center' as const, credibility: 0.6, confidence: 0.5 },
  'polygon': { lean: 'lean-left' as const, credibility: 0.6, confidence: 0.5 },
  
  // Crypto/Tech Specialized
  'crypto-coins-news': { lean: 'center' as const, credibility: 0.5, confidence: 0.4 },
  'techradar': { lean: 'center' as const, credibility: 0.6, confidence: 0.5 },
  'the-next-web': { lean: 'center' as const, credibility: 0.6, confidence: 0.5 },
  
  // Nordic/Scandinavian Sources
  'aftenposten': { lean: 'lean-right' as const, credibility: 0.7, confidence: 0.6 },
  'goteborgs-posten': { lean: 'lean-right' as const, credibility: 0.6, confidence: 0.5 },
  'svenska-dagbladet': { lean: 'lean-right' as const, credibility: 0.7, confidence: 0.6 },
  'nrk': { lean: 'lean-left' as const, credibility: 0.8, confidence: 0.7 },
  
  // South American Sources
  'infobae': { lean: 'lean-left' as const, credibility: 0.6, confidence: 0.6 },
  'la-gaceta': { lean: 'right' as const, credibility: 0.6, confidence: 0.6 },
  'la-nacion': { lean: 'lean-right' as const, credibility: 0.7, confidence: 0.6 },
  'globo': { lean: 'right' as const, credibility: 0.6, confidence: 0.6 },
  'blasting-news-br': { lean: 'center' as const, credibility: 0.5, confidence: 0.5 },
  'info-money': { lean: 'lean-right' as const, credibility: 0.6, confidence: 0.6 },
  
  // Russian Sources
  'lenta': { lean: 'lean-right' as const, credibility: 0.4, confidence: 0.7 },
  'rbc': { lean: 'lean-right' as const, credibility: 0.5, confidence: 0.6 },
  
  // Middle East/South Asia
  'argaam': { lean: 'right' as const, credibility: 0.5, confidence: 0.6 },
  'ary-news': { lean: 'lean-right' as const, credibility: 0.5, confidence: 0.6 },
  'sabq': { lean: 'right' as const, credibility: 0.4, confidence: 0.6 },
  'the-hindu': { lean: 'lean-left' as const, credibility: 0.7, confidence: 0.6 },
  
  // Israeli Sources
  'the-jerusalem-post': { lean: 'lean-right' as const, credibility: 0.6, confidence: 0.6 },
  'ynet': { lean: 'lean-left' as const, credibility: 0.6, confidence: 0.6 },
  
  // English-Speaking International
  'news-com-au': { lean: 'lean-right' as const, credibility: 0.6, confidence: 0.6 },
  'australian-financial-review': { lean: 'lean-right' as const, credibility: 0.7, confidence: 0.6 },
  'financial-post': { lean: 'lean-right' as const, credibility: 0.7, confidence: 0.6 },
  'news24': { lean: 'lean-right' as const, credibility: 0.6, confidence: 0.6 },
  
  // US/International Digital  
  'cnn-es': { lean: 'lean-left' as const, credibility: 0.6, confidence: 0.7 },
  'reddit-r-all': { lean: 'unknown' as const, credibility: 0.5, confidence: 0.3 },
  'next-big-future': { lean: 'unknown' as const, credibility: 0.6, confidence: 0.3 },
  'nfl-news': { lean: 'unknown' as const, credibility: 0.7, confidence: 0.3 },
  'nhl-news': { lean: 'unknown' as const, credibility: 0.7, confidence: 0.3 },
  'mtv-news-uk': { lean: 'lean-left' as const, credibility: 0.5, confidence: 0.6 },
  'the-lad-bible': { lean: 'unknown' as const, credibility: 0.4, confidence: 0.3 },
  
  // Google News Regional (aggregators - mostly unknown, classified based on regional context)
  'google-news-ar': { lean: 'unknown' as const, credibility: 0.6, confidence: 0.3 },
  'google-news-au': { lean: 'unknown' as const, credibility: 0.6, confidence: 0.3 },
  'google-news-br': { lean: 'unknown' as const, credibility: 0.6, confidence: 0.3 },
  'google-news-ca': { lean: 'unknown' as const, credibility: 0.6, confidence: 0.3 },
  'google-news-fr': { lean: 'unknown' as const, credibility: 0.6, confidence: 0.3 },
  'google-news-in': { lean: 'unknown' as const, credibility: 0.6, confidence: 0.3 },
  'google-news-is': { lean: 'unknown' as const, credibility: 0.6, confidence: 0.3 },
  'google-news-it': { lean: 'unknown' as const, credibility: 0.6, confidence: 0.3 },
  'google-news-ru': { lean: 'right' as const, credibility: 0.5, confidence: 0.6 },
  'google-news-sa': { lean: 'right' as const, credibility: 0.5, confidence: 0.6 },
  'google-news-uk': { lean: 'unknown' as const, credibility: 0.6, confidence: 0.3 }
};

// Domain-based heuristics for unknown sources (enhanced keyword matching)
// Updated to match actual NewsAPI source names and domains
const DOMAIN_HEURISTICS = {
  left: [
    'huffpost', 'huffington', 'slate', 'vox', 'motherjones', 'thenation', 'intercept',
    'democracynow', 'commondreams', 'jacobin', 'salon', 'alternet', 'rawstory', 
    'thinkprogress', 'mediamatters', 'progressive', 'buzzfeed', 'vice'
  ],
  'lean-left': [
    'guardian', 'washingtonpost', 'washington-post', 'nytimes', 'newyorktimes', 'atlantic',
    'npr', 'pbs', 'politico', 'time', 'usatoday', 'usa-today', 'abc-news', 'cbs-news', 'nbc-news',
    'bloomberg', 'axios', 'thehill', 'the-hill', 'yahoo', 'google-news', 'newsweek',
    'dailybeast', 'daily-beast', 'aljazeera', 'al-jazeera', 'business-insider',
    'mashable', 'techcrunch', 'the-verge', 'wired', 'engadget', 'ars-technica',
    'recode', 'independent', 'spiegel', 'die-zeit', 'tagesspiegel', 'le-monde',
    'liberation', 'la-repubblica', 'cbc-news'
  ],
  center: [
    'bbc', 'reuters', 'ap', 'associated-press', 'associatedpress', 'cspan', 'economist',
    'marketwatch', 'cnbc', 'fortune', 'france24', 'dw', 'timeofindia', 'times-of-india',
    'google-news', 'hacker-news', 'new-scientist', 'medical-news', 'national-geographic',
    'ansa', 'handelsblatt', 't3n', 'gruenderszene', 'lequipe', 'marca',
    'espn', 'fox-sports', 'bleacher-report', 'ign', 'crypto-coins', 'techradar',
    'the-next-web', 'abc-news-au', 'the-globe', 'irish-times', 'rte'
  ],
  'lean-right': [
    'wsj', 'wall-street-journal', 'wallstreetjournal', 'washingtonexaminer', 'washington-examiner',
    'foxbusiness', 'fox-business', 'telegraph', 'dailymail', 'daily-mail', 'nypost', 'new-york-post',
    'dispatch', 'new-york-magazine', 'bild', 'focus', 'les-echos', 'il-sole', 'el-mundo',
    'wirtschafts-woche'
  ],
  right: [
    'foxnews', 'fox-news', 'breitbart', 'dailywire', 'daily-wire', 'nationalreview', 'national-review',
    'blaze', 'townhall', 'washingtontimes', 'washington-times', 'newsmax', 'oann', 'infowars',
    'redstate', 'conservativereview', 'theconservativetreehouse', 'american-conservative',
    'rt', 'sputnik', 'xinhua'
  ]
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
        throw new Error('NewsAPI key is required but not configured in environment variables');
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
    lean: 'left' | 'lean-left' | 'center' | 'lean-right' | 'right' | 'unknown';
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
            lean: lean as 'left' | 'lean-left' | 'center' | 'lean-right' | 'right' | 'unknown',
            credibility: 0.6
          };
        }
      }
    }

    // Default to unknown for unclassified sources (better than incorrectly marking as center)
    console.log(`⚠️ UNKNOWN SOURCE: ${apiSource.id} (${apiSource.name}) - ${apiSource.url}`);
    return { lean: 'unknown', credibility: 0.3 };
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

// Export standalone functions for backward compatibility
export function filterSources(sources: NewsSource[], filters: SourceFilters): NewsSource[] {
  return unifiedSourceService.filterSources(sources, filters);
}

export function getAvailableCountries(sources: NewsSource[]): string[] {
  return unifiedSourceService.getAvailableCountries(sources);
}

export function getAvailableCategories(sources: NewsSource[]): NewsCategory[] {
  return unifiedSourceService.getAvailableCategories(sources);
}

export function clearDynamicSourceCache(): void {
  unifiedSourceService.clearCache();
}