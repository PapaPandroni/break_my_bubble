import { useState, useEffect, useMemo, useCallback } from 'react'
import { Article, NewsSource, NewsLanguage, NewsSortBy, AppStep, TopicKeywords } from './types'
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
import LandingPage from './components/LandingPage'
import TopicSelectionModal from './components/TopicSelectionModal'
import LoadingState, { ResultsLoadingSkeleton } from './components/LoadingState'
import { NetworkErrorMessage } from './components/ErrorMessage'
import ResultsDisplay from './components/ResultsDisplay'
import ErrorBoundary from './components/ErrorBoundary'
import ModalErrorBoundary from './components/ModalErrorBoundary'
import ResultsErrorBoundary from './components/ResultsErrorBoundary'

// Helper function to extract keywords from topic based on selected languages
const extractKeywordsFromTopic = (topicData: TopicKeywords, selectedLanguages: NewsLanguage[]): string[] => {
  // If no multilanguage keywords available, fall back to legacy keywords
  if (!topicData.multiLanguageKeywords) {
    return topicData.keywords || topicData.fallbackKeywords || [];
  }

  // Extract keywords for selected languages, with fallback strategy
  const allKeywords: string[] = [];
  
  // If no languages selected, default to English
  const languagesToUse = selectedLanguages.length > 0 ? selectedLanguages : ['en'];
  
  for (const lang of languagesToUse) {
    const keywords = topicData.multiLanguageKeywords?.[lang as NewsLanguage];
    if (keywords && keywords.length > 0) {
      allKeywords.push(...keywords);
    }
  }
  
  // If no keywords found for selected languages, fallback to English
  if (allKeywords.length === 0 && !languagesToUse.includes('en')) {
    const englishKeywords = topicData.multiLanguageKeywords?.['en'];
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
  currentStep: AppStep
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
    currentStep: 'landing',
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

  // Memoize expensive calculations
  const canAnalyze = useMemo(() => {
    return state.selectedSources.length >= 1 && (
      (state.selectedTopic && state.selectedTopic !== 'Custom Search') ||
      (state.selectedTopic === 'Custom Search' && state.customSearchTerms.length > 0)
    )
  }, [state.selectedSources.length, state.selectedTopic, state.customSearchTerms.length])

  // Memoize filtered sources calculation
  const filteredSources = useMemo(() => {
    return unifiedSourceService.filterSources(state.allSources, {
      languages: state.selectedLanguages,
      countries: state.selectedCountries,
      categories: [],
      search: ''
    })
  }, [state.allSources, state.selectedLanguages, state.selectedCountries])

  // Memoize available countries
  const availableCountries = useMemo(() => {
    return unifiedSourceService.getAvailableCountries(state.allSources)
  }, [state.allSources])

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

  const handleReset = useCallback(() => {
    setState(prev => ({
      currentStep: 'landing',
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
  }, [])

  // Client-side filtering moved inline to prevent stale closures

  const handleLanguagesChange = useCallback((languages: NewsLanguage[]) => {
    setState(prev => {
      // Apply filters directly in setState to avoid stale closures
      const filteredSources = unifiedSourceService.filterSources(prev.allSources, {
        languages,
        countries: prev.selectedCountries,
        categories: [],
        search: ''
      })
      
      return {
        ...prev,
        selectedLanguages: languages,
        availableSources: filteredSources,
        selectedSources: prev.selectedSources.filter(id => 
          filteredSources.some(source => source.id === id)
        )
      }
    })
  }, [])

  const handleCountriesChange = useCallback((countries: string[]) => {
    setState(prev => {
      // Apply filters directly in setState to avoid stale closures
      const filteredSources = unifiedSourceService.filterSources(prev.allSources, {
        languages: prev.selectedLanguages,
        countries,
        categories: [],
        search: ''
      })
      
      return {
        ...prev,
        selectedCountries: countries,
        availableSources: filteredSources,
        selectedSources: prev.selectedSources.filter(id => 
          filteredSources.some(source => source.id === id)
        )
      }
    })
  }, [])

  const handleDateRangeChange = useCallback((dateRange: DateRange) => {
    setState(prev => ({ ...prev, selectedDateRange: dateRange }))
  }, [])

  const handleSortChange = useCallback((sort: NewsSortBy) => {
    setState(prev => ({ ...prev, selectedSort: sort }))
  }, [])

  // Step navigation handlers
  const handleContinueToModal = () => {
    setState(prev => ({ ...prev, currentStep: 'modal' }))
  }

  const handleBackToLanding = () => {
    setState(prev => ({ ...prev, currentStep: 'landing' }))
  }

  const handleStartAnalysis = () => {
    setState(prev => ({ ...prev, currentStep: 'results' }))
    handleAnalyze()
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
        const userSources = state.selectedSources
          .map(id => state.availableSources.find(s => s.id === id))
          .filter((source): source is NewsSource => source !== undefined);
          
        const { userArticles, opposingArticles } = getOpposingPerspectives(
          userSources,
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
    <ErrorBoundary
      onError={(error, errorInfo) => {
        // Log critical app errors
        console.error('Critical App Error:', error, errorInfo)
      }}
    >
      <div className="min-h-screen bg-gray-50">
        <ErrorBoundary
          onError={(error, errorInfo) => {
            console.error('Header Error:', error, errorInfo)
          }}
          showReload={false}
          className="mb-4"
        >
          <Header 
            onReset={state.currentStep !== 'landing' ? handleReset : undefined}
            onTitleClick={state.currentStep !== 'landing' ? handleBackToLanding : undefined}
          />
        </ErrorBoundary>
        
        {/* Step 1: Landing Page */}
        {state.currentStep === 'landing' && (
          <ErrorBoundary
            onError={(error, errorInfo) => {
              console.error('Landing Page Error:', error, errorInfo)
            }}
          >
            <LandingPage
              sources={filteredSources}
              selectedSources={state.selectedSources}
              onSourcesChange={(sources) => 
                setState(prev => ({ ...prev, selectedSources: sources }))
              }
              onContinue={handleContinueToModal}
              isLoadingSources={state.isLoadingSources}
              allSourcesLoaded={state.allSourcesLoaded}
              selectedLanguages={state.selectedLanguages}
              onLanguagesChange={(languages) => 
                setState(prev => ({ ...prev, selectedLanguages: languages }))
              }
              selectedCountries={state.selectedCountries}
              onCountriesChange={(countries) => 
                setState(prev => ({ ...prev, selectedCountries: countries }))
              }
              availableCountries={state.availableCountries}
              selectedSort={state.selectedSort}
              onSortChange={(sort) => 
                setState(prev => ({ ...prev, selectedSort: sort }))
              }
              selectedDateRange={state.selectedDateRange}
              onDateRangeChange={(dateRange) => 
                setState(prev => ({ ...prev, selectedDateRange: dateRange }))
              }
              timeOptions={TIME_OPTIONS}
            />
          </ErrorBoundary>
        )}

        {/* Step 2: Topic Selection Modal */}
        <ModalErrorBoundary
          onClose={handleBackToLanding}
          modalTitle="Topic Selection"
          onError={(error, errorInfo) => {
            console.error('Topic Selection Modal Error:', error, errorInfo)
          }}
        >
          <TopicSelectionModal
            topics={TOPICS}
            selectedTopic={state.selectedTopic}
            onTopicChange={(topic) => 
              setState(prev => ({ ...prev, selectedTopic: topic }))
            }
            customSearchTerms={state.customSearchTerms}
            onCustomSearchTermsChange={(terms) =>
              setState(prev => ({ ...prev, customSearchTerms: terms }))
            }
            selectedLanguages={state.selectedLanguages}
            onLanguagesChange={handleLanguagesChange}
            selectedCountries={state.selectedCountries}
            onCountriesChange={handleCountriesChange}
            availableCountries={availableCountries}
            selectedSort={state.selectedSort}
            onSortChange={handleSortChange}
            selectedDateRange={state.selectedDateRange}
            onDateRangeChange={handleDateRangeChange}
            timeOptions={TIME_OPTIONS}
            isOpen={state.currentStep === 'modal'}
            onClose={handleBackToLanding}
            onAnalyze={handleStartAnalysis}
            isLoading={state.isLoading}
          />
        </ModalErrorBoundary>

        {/* Step 3: Results Display */}
        {state.currentStep === 'results' && (
          <main className="max-w-4xl mx-auto px-4">
            {/* Loading State */}
            {state.isLoading && (
              <ErrorBoundary
                onError={(error, errorInfo) => {
                  console.error('Loading State Error:', error, errorInfo)
                }}
                showReload={false}
                className="mt-12"
              >
                <div className="mt-12">
                  <LoadingState 
                    message="Fetching articles from news sources..." 
                  />
                  <div className="mt-8">
                    <ResultsLoadingSkeleton />
                  </div>
                </div>
              </ErrorBoundary>
            )}

            {/* Error State */}
            {state.error && (
              <div className="mt-12">
                <NetworkErrorMessage onRetry={handleAnalyze} />
              </div>
            )}

            {/* Results */}
            {state.results && !state.isLoading && !state.error && (
              <ResultsErrorBoundary
                onRetrySearch={handleAnalyze}
                onReset={handleReset}
                searchTopic={state.selectedTopic}
                userSources={state.selectedSources}
                onError={(error, errorInfo) => {
                  console.error('Results Display Error:', error, errorInfo)
                }}
              >
                <section>
                  <ResultsDisplay
                    userArticles={state.results.userArticles}
                    opposingArticles={state.results.opposingArticles}
                    topic={state.selectedTopic}
                    userSources={state.selectedSources}
                  />
                </section>
              </ResultsErrorBoundary>
            )}
          </main>
        )}

        {/* Debug Tools (only in development) */}
        {import.meta.env.DEV && state.currentStep === 'landing' && (
          <ErrorBoundary
            onError={(error, errorInfo) => {
              console.error('Debug Tools Error:', error, errorInfo)
            }}
            showReload={false}
          >
            <div className="fixed bottom-4 right-4">
              <details className="text-center">
                <summary className="text-xs text-gray-400 cursor-pointer hover:text-gray-600 bg-white px-3 py-2 rounded-lg shadow">
                  Dev Tools
                </summary>
                <div className="mt-2 grid grid-cols-2 gap-1 bg-white p-2 rounded-lg shadow-lg">
                  <button
                    onClick={() => {
                      console.log('🔧 Running topic filter debug...')
                      debugTopicFiltering()
                    }}
                    className="px-2 py-1 text-xs bg-purple-500 text-white rounded hover:bg-purple-600"
                  >
                    Topic Filter
                  </button>
                  <button
                    onClick={() => {
                      console.log('🔧 Running NewsAPI debug...')
                      debugNewsAPI()
                    }}
                    className="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
                  >
                    NewsAPI
                  </button>
                  <button
                    onClick={() => {
                      console.log('🔧 Running source validation...')
                      debugSourceValidation()
                    }}
                    className="px-2 py-1 text-xs bg-indigo-500 text-white rounded hover:bg-indigo-600"
                  >
                    Sources
                  </button>
                  <button
                    onClick={() => {
                      console.log('🔧 Checking cache status...')
                      debugCacheStatus()
                    }}
                    className="px-2 py-1 text-xs bg-gray-500 text-white rounded hover:bg-gray-600"
                  >
                    Cache
                  </button>
                  <button
                    onClick={() => {
                      feedCache.clearCache()
                      console.log('🗑️ Cache cleared')
                    }}
                    className="px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600"
                  >
                    Clear
                  </button>
                  <button
                    onClick={() => {
                      console.log('🎭 Running demo mode...')
                      const demoArticles = getMockArticlesForDemo()
                      console.log(`Got ${demoArticles.length} demo articles`)
                      
                      const topicData = TOPICS.find(t => t.topic === 'Climate Change')
                      if (topicData) {
                        const filtered = filterAndProcessArticles(demoArticles, topicData, 7, 'publishedAt', 20)
                        const cnnSource = NEWS_SOURCES.find(s => s.id === 'cnn')
                        const { userArticles, opposingArticles } = getOpposingPerspectives(cnnSource ? [cnnSource] : [], filtered, 'publishedAt')
                        
                        setState(prev => ({
                          ...prev,
                          currentStep: 'results',
                          selectedSources: ['cnn'],
                          selectedTopic: 'Climate Change',
                          results: { userArticles, opposingArticles }
                        }))
                      }
                    }}
                    className="px-2 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600"
                  >
                    Demo
                  </button>
                </div>
              </details>
            </div>
          </ErrorBoundary>
        )}
      </div>
    </ErrorBoundary>
  )
}

export default App