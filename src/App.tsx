import { useState, useEffect } from 'react'
import { Article, NewsSource, NewsLanguage, NewsSortBy } from './types'
import { DateRange } from './components/DateRangePicker'
import { NEWS_SOURCES } from './data/newsSources'
import { TOPICS, TIME_OPTIONS } from './data/topics'
import { fetchArticlesByTopic, searchAllSources } from './services/newsApiService'
import { filterAndProcessArticles, getOpposingPerspectives } from './services/filterService'
import { feedCache } from './services/cacheService'
import { debugTopicFiltering, debugNewsAPI, debugSourceValidation, debugCacheStatus } from './services/debugService'
import { getMockArticlesForDemo } from './services/mockDataService'
import { unifiedSourceService } from './services/unifiedSourceService'

// Components
import Header from './components/Header'
import SourceInput from './components/SourceInput'
import TopicSelector from './components/TopicSelector'
import FilterPanel from './components/FilterPanel'
import LoadingState, { ResultsLoadingSkeleton } from './components/LoadingState'
import { NetworkErrorMessage } from './components/ErrorMessage'
import ResultsDisplay from './components/ResultsDisplay'

// Helper function to extract keywords from topic based on selected languages
const extractKeywordsFromTopic = (topicData: any, selectedLanguages: NewsLanguage[]): string[] => {
  // If no multilanguage keywords available, fall back to legacy keywords
  if (!topicData.multiLanguageKeywords) {
    return topicData.keywords || topicData.fallbackKeywords || [];
  }

  // Extract keywords for selected languages, with fallback strategy
  const allKeywords: string[] = [];
  
  // If no languages selected, default to English
  const languagesToUse = selectedLanguages.length > 0 ? selectedLanguages : ['en'];
  
  for (const lang of languagesToUse) {
    const keywords = topicData.multiLanguageKeywords[lang];
    if (keywords && keywords.length > 0) {
      allKeywords.push(...keywords);
    }
  }
  
  // If no keywords found for selected languages, fallback to English
  if (allKeywords.length === 0 && !languagesToUse.includes('en')) {
    const englishKeywords = topicData.multiLanguageKeywords['en'];
    if (englishKeywords) {
      allKeywords.push(...englishKeywords);
    }
  }
  
  // Final fallback to legacy keywords or fallback keywords
  if (allKeywords.length === 0) {
    return topicData.keywords || topicData.fallbackKeywords || [];
  }
  
  // Remove duplicates and return
  return [...new Set(allKeywords)];
};

interface AppState {
  selectedSources: string[]
  selectedTopic: string
  customSearchTerms: string[]
  selectedTimeframe: number
  selectedDateRange: DateRange
  selectedLanguages: NewsLanguage[]
  selectedCountries: string[]
  selectedSort: NewsSortBy
  isLoading: boolean
  isLoadingSources: boolean
  error: string | null
  results: {
    userArticles: Article[]
    opposingArticles: Article[]
  } | null
  availableSources: NewsSource[]
  allSources: NewsSource[] // All sources (unfiltered)
  availableCountries: string[]
  allSourcesLoaded: boolean
}

function App() {
  
  const [state, setState] = useState<AppState>({
    selectedSources: [],
    selectedTopic: '',
    customSearchTerms: [], // Start with no custom search terms
    selectedTimeframe: 7, // Default to 1 week (for RSS mode)
    selectedDateRange: { type: 'preset', days: 7, label: 'Last week' }, // Default for NewsAPI mode
    selectedLanguages: [], // Start with empty language selection
    selectedCountries: [], // Default to all countries
    selectedSort: 'relevancy', // Default to relevancy
    isLoading: false,
    isLoadingSources: false,
    error: null,
    results: null,
    availableSources: NEWS_SOURCES.map(source => ({ ...source, isDynamic: false })), // Start with static sources immediately
    allSources: NEWS_SOURCES.map(source => ({ ...source, isDynamic: false })), // Store all sources for filtering
    availableCountries: ['us'], // Start with US as most static sources are US-based
    allSourcesLoaded: false, // Will be set to true once dynamic sources are loaded
  })

  const canAnalyze = state.selectedSources.length >= 1 && (
    (state.selectedTopic && state.selectedTopic !== 'Custom Search') ||
    (state.selectedTopic === 'Custom Search' && state.customSearchTerms.length > 0)
  )

  // Initialize sources with optimistic loading
  useEffect(() => {
    initializeSourcesOptimistically()
  }, [])

  const initializeSourcesOptimistically = async () => {
    try {
      // Get sources with optimistic loading - this returns static sources immediately
      const { sources, isLoading, loadDynamic } = await unifiedSourceService.getSourcesOptimistic()
      
      // Update state with initial sources (static sources)
      setState(prev => ({ 
        ...prev, 
        availableSources: sources,
        allSources: sources,
        availableCountries: unifiedSourceService.getAvailableCountries(sources),
        isLoadingSources: isLoading,
        allSourcesLoaded: !isLoading
      }))

      // Load dynamic sources in background if needed
      if (isLoading) {
        try {
          const dynamicSources = await loadDynamic()
          
          // Apply current filters to the new sources
          const filteredSources = unifiedSourceService.filterSources(dynamicSources, {
            languages: state.selectedLanguages,
            countries: state.selectedCountries,
            categories: [],
            search: ''
          })
          
          setState(prev => ({ 
            ...prev, 
            availableSources: filteredSources,
            allSources: dynamicSources, // Store all sources for filtering
            availableCountries: unifiedSourceService.getAvailableCountries(dynamicSources),
            isLoadingSources: false,
            allSourcesLoaded: true,
            // Preserve selected sources if they're still available
            selectedSources: prev.selectedSources.filter(id => 
              dynamicSources.some(source => source.id === id)
            )
          }))
        } catch (error) {
          console.warn('Failed to load dynamic sources, keeping static sources:', error)
          setState(prev => ({ 
            ...prev, 
            isLoadingSources: false,
            allSourcesLoaded: true,
            error: 'Using basic sources. Dynamic sources failed to load.'
          }))
        }
      }
    } catch (error) {
      console.error('Failed to initialize sources:', error)
      setState(prev => ({ 
        ...prev, 
        isLoadingSources: false,
        allSourcesLoaded: true,
        error: 'Failed to load sources.'
      }))
    }
  }

  const handleReset = () => {
    setState(prev => ({
      selectedSources: [],
      selectedTopic: '',
      customSearchTerms: [],
      selectedTimeframe: 7,
      selectedDateRange: { type: 'preset', days: 7, label: 'Last week' },
      selectedLanguages: [],
      selectedCountries: [],
      selectedSort: 'relevancy',
      isLoading: false,
      isLoadingSources: prev.isLoadingSources, // Keep loading state
      error: null,
      results: null,
      availableSources: prev.availableSources, // Keep available sources
      allSources: prev.allSources, // Keep all sources
      availableCountries: prev.availableCountries, // Keep available countries
      allSourcesLoaded: prev.allSourcesLoaded, // Keep loading status
    }))
  }

  // Client-side filtering for performance
  const applySourceFilters = (languages: NewsLanguage[], countries: string[]) => {
    const filteredSources = unifiedSourceService.filterSources(state.allSources, {
      languages: languages,
      countries: countries,
      categories: [],
      search: ''
    })

    setState(prev => ({ 
      ...prev, 
      availableSources: filteredSources,
      // Clear selected sources that are no longer available after filtering
      selectedSources: prev.selectedSources.filter(id => 
        filteredSources.some(source => source.id === id)
      )
    }))
  }

  const handleLanguagesChange = (languages: NewsLanguage[]) => {
    setState(prev => ({ ...prev, selectedLanguages: languages }))
    // Apply filters client-side for instant results
    applySourceFilters(languages, state.selectedCountries)
  }

  const handleCountriesChange = (countries: string[]) => {
    setState(prev => ({ ...prev, selectedCountries: countries }))
    // Apply filters client-side for instant results
    applySourceFilters(state.selectedLanguages, countries)
  }

  const handleDateRangeChange = (dateRange: DateRange) => {
    setState(prev => ({ ...prev, selectedDateRange: dateRange }))
  }

  const handleSortChange = (sort: NewsSortBy) => {
    setState(prev => ({ ...prev, selectedSort: sort }))
  }

  const handleAnalyze = async () => {
    if (!canAnalyze) return

    setState(prev => ({
      ...prev,
      isLoading: true,
      error: null,
      results: null,
    }))

    try {
        // Get selected topic data (handle Custom Search case)
        let topicData = TOPICS.find(t => t.topic === state.selectedTopic)
        if (!topicData && state.selectedTopic === 'Custom Search') {
          // Create synthetic topic data for custom search
          topicData = {
            topic: 'Custom Search',
            keywords: [], // Legacy - not used for custom search
            customSearch: true
          }
        }
        if (!topicData) {
          throw new Error('Selected topic not found')
        }

        // Enhanced caching with smart fallback strategy
        const timeframeDays = state.selectedDateRange.days
        const customSearchKey = state.customSearchTerms.length > 0 ? state.customSearchTerms.join(',') : ''
        const cacheKey = `newsapi-${state.selectedTopic}-${state.selectedSources.join(',')}-${timeframeDays}-${state.selectedLanguages.join(',')}-${state.selectedCountries.join(',')}-${state.selectedSort}-${customSearchKey}`;
        const cacheResult = feedCache.getCachedFeedWithStatus(cacheKey);
        
        let allArticles: Article[] = [];
        let shouldFetchFresh = false;
        let backgroundRefresh = false;
        
        if (cacheResult.status === 'fresh') {
          // Cache is fresh (< 2 hours) - use immediately
          allArticles = cacheResult.data!;
          console.log(`📋 Using fresh cache (${feedCache.getCacheAge(cacheKey) ? Math.floor(feedCache.getCacheAge(cacheKey)! / 60000) : 0} minutes old)`);
        } else if (cacheResult.status === 'stale') {
          // Cache is stale (2-12 hours) - use immediately but refresh in background
          allArticles = cacheResult.data!;
          backgroundRefresh = true;
          console.log(`📋 Using stale cache (${feedCache.getCacheAge(cacheKey) ? Math.floor(feedCache.getCacheAge(cacheKey)! / (60 * 60 * 1000)) : 0} hours old), refreshing in background`);
        } else {
          // Cache is expired or missing - fetch fresh data
          shouldFetchFresh = true;
        }
        
        if (shouldFetchFresh || backgroundRefresh) {
          try {
            // Determine keywords to use (custom search terms or topic keywords)
            const keywordsToUse = state.customSearchTerms.length > 0 
              ? state.customSearchTerms 
              : extractKeywordsFromTopic(topicData, state.selectedLanguages);
            
            console.log(`🔍 Search Debug:`, {
              topic: state.selectedTopic,
              selectedSources: state.selectedSources,
              keywordsCount: keywordsToUse.length,
              keywords: keywordsToUse.slice(0, 5), // Show first 5 keywords
              selectedLanguages: state.selectedLanguages
            });

            // Fetch articles from user's selected sources (using pagination)
            const userResults = await fetchArticlesByTopic(
              state.selectedTopic,
              keywordsToUse,
              state.selectedSources,
              timeframeDays,
              state.availableSources,
              state.selectedLanguages,
              state.selectedSort,
              undefined, // domains
              undefined, // excludeDomains
              1, // page
              50 // smaller pageSize for initial load
            );
            
            // Fetch articles from all other sources for comparison
            const opposingResults = await searchAllSources(
              keywordsToUse,
              timeframeDays,
              state.availableSources,
              state.selectedSources.map(id => {
                const source = state.availableSources.find(s => s.id === id);
                return source?.name || '';
              }),
              state.selectedLanguages,
              state.selectedSort,
              undefined, // domains
              undefined, // excludeDomains
              1, // page
              50 // smaller pageSize for initial load
            );
            
            const freshArticles = [...userResults.articles, ...opposingResults.articles];
            
            console.log(`📊 API Results:`, {
              userArticles: userResults.articles.length,
              userTotalResults: userResults.totalResults,
              opposingArticles: opposingResults.articles.length,
              opposingTotalResults: opposingResults.totalResults,
              combinedArticles: freshArticles.length
            });
            
            // Cache the fresh results
            feedCache.setCachedFeed(cacheKey, freshArticles);
            
            if (shouldFetchFresh) {
              // For fresh fetch, use the new data
              allArticles = freshArticles;
              console.log(`✅ Fetched fresh data (${freshArticles.length} articles)`);
            } else {
              // For background refresh, keep using stale data but log success
              console.log(`🔄 Background refresh successful (${freshArticles.length} articles cached)`);
            }
          } catch (error) {
            console.error('Failed to fetch fresh articles:', error);
            
            if (shouldFetchFresh) {
              // If fresh fetch failed, try to use expired cache as fallback
              if (cacheResult.status === 'expired' && cacheResult.data) {
                allArticles = cacheResult.data;
                console.log(`🚨 API failed, using expired cache fallback (${Math.floor(cacheResult.age! / (60 * 60 * 1000))} hours old)`);
              } else {
                // No fallback available, re-throw error
                throw error;
              }
            }
            // For background refresh failure, silently continue with stale data
          }
        }

        // Filter and process articles (remove duplicates, respect user's sort preference)
        // Skip topic filtering since NewsAPI already did keyword matching
        const filteredArticles = filterAndProcessArticles(
          allArticles,
          topicData,
          timeframeDays, // Use the correct timeframe from selectedDateRange
          state.selectedSort,
          20,
          state.selectedLanguages,
          state.customSearchTerms.length > 0 ? state.customSearchTerms : undefined,
          true // skipTopicFiltering - NewsAPI already did keyword matching
        );

        console.log(`🔄 After Filtering:`, {
          beforeFiltering: allArticles.length,
          afterFiltering: filteredArticles.length,
          maxArticles: 20
        });

        // Separate user articles from opposing perspectives
        const { userArticles, opposingArticles } = getOpposingPerspectives(
          state.selectedSources.map(id => {
            return state.availableSources.find(s => s.id === id);
          }).filter(Boolean) as NewsSource[],
          filteredArticles,
          state.selectedSort
        );

        setState(prev => ({
          ...prev,
          isLoading: false,
          results: { userArticles, opposingArticles },
        }))
    } catch (error) {
      console.error('Analysis failed:', error)
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Analysis failed',
      }))
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header onReset={state.results ? handleReset : undefined} />
      
      <main className="max-w-6xl mx-auto px-4 py-8">
        {!state.results ? (
          <div className="space-y-8">

            {/* Main Interface - Progressive Disclosure */}
            <div className="max-w-4xl mx-auto space-y-6">
              {/* Primary Action: Source Selection */}
              <section>
                <SourceInput
                  sources={state.availableSources}
                  selectedSources={state.selectedSources}
                  onSourcesChange={(sources) => 
                    setState(prev => ({ ...prev, selectedSources: sources }))
                  }
                  isLoading={state.isLoadingSources}
                  isDynamic={true}
                  allSourcesLoaded={state.allSourcesLoaded}
                />
              </section>

              {/* Secondary Action: Topic Selection */}
              <section>
                <TopicSelector
                  topics={TOPICS}
                  selectedTopic={state.selectedTopic}
                  onTopicChange={(topic) => 
                    setState(prev => ({ ...prev, selectedTopic: topic }))
                  }
                  customSearchTerms={state.customSearchTerms}
                  onCustomSearchTermsChange={(terms) =>
                    setState(prev => ({ ...prev, customSearchTerms: terms }))
                  }
                />
              </section>

              {/* Advanced Options: Collapsible Filter Panel */}
              <section>
                <FilterPanel
                  selectedLanguages={state.selectedLanguages}
                  onLanguagesChange={handleLanguagesChange}
                  selectedCountries={state.selectedCountries}
                  onCountriesChange={handleCountriesChange}
                  availableCountries={state.availableCountries}
                  selectedSort={state.selectedSort}
                  onSortChange={handleSortChange}
                  selectedDateRange={state.selectedDateRange}
                  onDateRangeChange={handleDateRangeChange}
                  timeOptions={TIME_OPTIONS}
                />
              </section>
            </div>

            {/* Analyze Button */}
            <section className="text-center space-y-4">
              <div>
                <button
                  onClick={handleAnalyze}
                  disabled={!canAnalyze || state.isLoading}
                  className={`px-8 py-4 text-lg font-semibold rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                    canAnalyze && !state.isLoading
                      ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg hover:shadow-xl'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {state.isLoading ? 'Analyzing...' : 'Break My Bubble!'}
                </button>
                
                {!canAnalyze && (
                  <p className="mt-2 text-sm text-gray-500">
                    Please select at least one source and a topic to continue
                  </p>
                )}
              </div>

              {/* Debug Button (only in development) */}
              {import.meta.env.DEV && (
                <div className="pt-4 border-t border-gray-200">
                  <p className="text-xs text-gray-500 mb-2">Development Tools</p>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => {
                        console.log('🔧 Running topic filter debug...')
                        debugTopicFiltering()
                      }}
                      className="px-3 py-2 text-sm bg-purple-500 text-white rounded hover:bg-purple-600"
                    >
                      Test Topic Filtering
                    </button>
                    <button
                      onClick={() => {
                        console.log('🔧 Running NewsAPI debug...')
                        debugNewsAPI()
                      }}
                      className="px-3 py-2 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                      Test NewsAPI
                    </button>
                    <button
                      onClick={() => {
                        console.log('🔧 Running source validation...')
                        debugSourceValidation()
                      }}
                      className="px-3 py-2 text-sm bg-indigo-500 text-white rounded hover:bg-indigo-600"
                    >
                      Validate Sources
                    </button>
                    <button
                      onClick={() => {
                        console.log('🔧 Checking cache status...')
                        debugCacheStatus()
                      }}
                      className="px-3 py-2 text-sm bg-gray-500 text-white rounded hover:bg-gray-600"
                    >
                      Cache Status
                    </button>
                    <button
                      onClick={() => {
                        feedCache.clearCache()
                        console.log('🗑️ Cache cleared')
                      }}
                      className="px-3 py-2 text-sm bg-red-500 text-white rounded hover:bg-red-600"
                    >
                      Clear Cache
                    </button>
                    <button
                      onClick={() => {
                        console.log('🎭 Running demo mode...')
                        const demoArticles = getMockArticlesForDemo()
                        console.log(`Got ${demoArticles.length} demo articles`)
                        
                        // Process demo articles
                        const topicData = TOPICS.find(t => t.topic === 'Climate Change')
                        if (topicData) {
                          const filtered = filterAndProcessArticles(demoArticles, topicData, 7, 'publishedAt', 20)
                          const cnnSource = NEWS_SOURCES.find(s => s.id === 'cnn')
                          const { userArticles, opposingArticles } = getOpposingPerspectives(cnnSource ? [cnnSource] : [], filtered, 'publishedAt')
                          
                          setState(prev => ({
                            ...prev,
                            selectedSources: ['cnn'],
                            selectedTopic: 'Climate Change',
                            results: { userArticles, opposingArticles }
                          }))
                        }
                      }}
                      className="px-4 py-2 text-sm bg-green-500 text-white rounded hover:bg-green-600"
                    >
                      Demo Mode
                    </button>
                  </div>
                </div>
              )}
            </section>

            {/* Loading State */}
            {state.isLoading && (
              <section>
                <LoadingState 
                  message="Fetching articles from news sources..." 
                />
                <div className="mt-8">
                  <ResultsLoadingSkeleton />
                </div>
              </section>
            )}

            {/* Error State */}
            {state.error && (
              <section>
                <NetworkErrorMessage onRetry={handleAnalyze} />
              </section>
            )}
          </div>
        ) : (
          /* Results Display */
          <section>
            <ResultsDisplay
              userArticles={state.results.userArticles}
              opposingArticles={state.results.opposingArticles}
              topic={state.selectedTopic}
              userSources={state.selectedSources}
            />
          </section>
        )}
      </main>
    </div>
  )
}

export default App