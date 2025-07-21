import { useState, useEffect } from 'react'
import { Article, NewsSource, NewsLanguage, NewsSortBy } from './types'
import { NEWS_SOURCES } from './data/newsSources'
import { TOPICS, TIME_OPTIONS } from './data/topics'
import { fetchArticlesByTopic, searchAllSources } from './services/newsApiService'
import { fetchMultipleFeeds } from './services/rssService'
import { filterAndProcessArticles, getOpposingPerspectives } from './services/filterService'
import { feedCache } from './services/cacheService'
import { debugFeedAccess, debugTopicFiltering, debugNewsAPI, debugSourceValidation, debugCacheStatus } from './services/debugService'
import { getMockArticlesForDemo } from './services/mockDataService'
import { fetchDynamicSources, getAvailableCountries } from './services/dynamicSourceService'

// Components
import Header from './components/Header'
import SourceInput from './components/SourceInput'
import LanguageSelector from './components/LanguageSelector'
import CountrySelector from './components/CountrySelector'
import SortSelector from './components/SortSelector'
import TopicSelector from './components/TopicSelector'
import TimeSlider from './components/TimeSlider'
import DateRangePicker, { DateRange } from './components/DateRangePicker'
import LoadingState, { ResultsLoadingSkeleton } from './components/LoadingState'
import { NetworkErrorMessage } from './components/ErrorMessage'
import ResultsDisplay from './components/ResultsDisplay'

interface AppState {
  selectedSources: string[]
  selectedTopic: string
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
  availableCountries: string[]
}

function App() {
  const useNewsAPI = import.meta.env.VITE_USE_NEWS_API === 'true';
  const hasNewsAPIKey = Boolean(import.meta.env.VITE_NEWS_API_KEY);
  
  const [state, setState] = useState<AppState>({
    selectedSources: [],
    selectedTopic: '',
    selectedTimeframe: 7, // Default to 1 week (for RSS mode)
    selectedDateRange: { type: 'preset', days: 7, label: 'Last week' }, // Default for NewsAPI mode
    selectedLanguages: ['en'], // Default to English
    selectedCountries: [], // Default to all countries
    selectedSort: 'relevancy', // Default to relevancy
    isLoading: false,
    isLoadingSources: false,
    error: null,
    results: null,
    availableSources: useNewsAPI ? [] : NEWS_SOURCES, // Start with static sources for RSS mode
    availableCountries: [], // Will be populated when sources are fetched
  })

  const canAnalyze = state.selectedSources.length >= 1 && state.selectedTopic

  // Fetch dynamic sources when NewsAPI mode, languages, or countries change
  useEffect(() => {
    if (useNewsAPI && hasNewsAPIKey) {
      fetchSources()
    } else if (useNewsAPI && !hasNewsAPIKey) {
      // Use static sources as fallback when API key is missing
      setState(prev => ({ 
        ...prev, 
        availableSources: NEWS_SOURCES,
        availableCountries: ['us'],
        isLoadingSources: false
      }))
    }
  }, [useNewsAPI, hasNewsAPIKey, state.selectedLanguages, state.selectedCountries])

  const fetchSources = async () => {
    setState(prev => ({ ...prev, isLoadingSources: true, error: null }))
    
    try {
      const sources = await fetchDynamicSources(
        state.selectedLanguages.length > 0 ? state.selectedLanguages : undefined,
        undefined, // categories - not filtering by categories at the top level
        state.selectedCountries.length > 0 ? state.selectedCountries : undefined
      )
      
      // Extract unique countries from sources
      const availableCountries = getAvailableCountries(sources)
      
      setState(prev => ({ 
        ...prev, 
        availableSources: sources,
        availableCountries: availableCountries,
        isLoadingSources: false,
        // Clear selected sources if they're no longer available
        selectedSources: prev.selectedSources.filter(id => 
          sources.some(source => source.id === id)
        ),
        // Clear selected countries if they're no longer available
        selectedCountries: prev.selectedCountries.filter(country =>
          availableCountries.includes(country)
        )
      }))
    } catch (error) {
      console.error('Failed to fetch dynamic sources:', error)
      setState(prev => ({ 
        ...prev, 
        availableSources: NEWS_SOURCES, // Fallback to static sources
        availableCountries: ['us'], // Most static sources are US-based
        isLoadingSources: false,
        error: 'Failed to load sources. Using default sources.'
      }))
    }
  }

  const handleReset = () => {
    setState(prev => ({
      selectedSources: [],
      selectedTopic: '',
      selectedTimeframe: 7,
      selectedDateRange: { type: 'preset', days: 7, label: 'Last week' },
      selectedLanguages: ['en'],
      selectedCountries: [],
      selectedSort: 'relevancy',
      isLoading: false,
      isLoadingSources: prev.isLoadingSources, // Keep loading state
      error: null,
      results: null,
      availableSources: prev.availableSources, // Keep available sources
      availableCountries: prev.availableCountries, // Keep available countries
    }))
  }

  const handleLanguagesChange = (languages: NewsLanguage[]) => {
    setState(prev => ({ ...prev, selectedLanguages: languages }))
  }

  const handleCountriesChange = (countries: string[]) => {
    setState(prev => ({ ...prev, selectedCountries: countries }))
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

    if (useNewsAPI) {
      // Use NewsAPI implementation
      try {
        // Get selected topic data
        const topicData = TOPICS.find(t => t.topic === state.selectedTopic)
        if (!topicData) {
          throw new Error('Selected topic not found')
        }

        // Check cache first
        const timeframeDays = state.selectedDateRange.days
        const cacheKey = `newsapi-${state.selectedTopic}-${state.selectedSources.join(',')}-${timeframeDays}-${state.selectedLanguages.join(',')}-${state.selectedCountries.join(',')}-${state.selectedSort}`;
        const cached = feedCache.getCachedFeed(cacheKey);
        
        let allArticles: Article[] = [];
        
        if (cached) {
          allArticles = cached;
        } else {
          // Fetch articles from user's selected sources (using pagination)
          const userResults = await fetchArticlesByTopic(
            state.selectedTopic,
            topicData.keywords,
            state.selectedSources,
            timeframeDays,
            state.selectedLanguages,
            state.selectedSort,
            undefined, // domains
            undefined, // excludeDomains
            1, // page
            50 // smaller pageSize for initial load
          );
          
          // Fetch articles from all other sources for comparison
          const opposingResults = await searchAllSources(
            topicData.keywords,
            timeframeDays,
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
          
          allArticles = [...userResults.articles, ...opposingResults.articles];
          
          // Cache the results
          feedCache.setCachedFeed(cacheKey, allArticles);
        }

        // Filter and process articles (remove duplicates, sort by date)
        const filteredArticles = filterAndProcessArticles(
          allArticles,
          topicData,
          state.selectedTimeframe,
          20
        );

        // Separate user articles from opposing perspectives
        const { userArticles, opposingArticles } = getOpposingPerspectives(
          state.selectedSources.map(id => {
            const source = NEWS_SOURCES.find(s => s.id === id);
            return source?.name || '';
          }),
          filteredArticles
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
    } else {
      // Use RSS implementation
      try {
        // Get all relevant news sources (user selected + others for comparison)
        // const userSourcesData = NEWS_SOURCES.filter(source => 
        //   state.selectedSources.includes(source.id)
        // )
        
        // Get all sources for comprehensive analysis
        const allSourcesData = NEWS_SOURCES

        // Check cache first
        const cachedArticles: Article[] = []
        const sourcesToFetch: NewsSource[] = []

        for (const source of allSourcesData) {
          const cached = feedCache.getCachedFeed(source.id)
          if (cached) {
            cachedArticles.push(...cached)
          } else {
            sourcesToFetch.push(source)
          }
        }

        // Fetch missing feeds
        let fetchedArticles: Article[] = []
        if (sourcesToFetch.length > 0) {
          const feedResults = await fetchMultipleFeeds(sourcesToFetch)
          
          // Process results and update cache
          for (const result of feedResults) {
            if (result.articles.length > 0 && !result.error) {
              const source = sourcesToFetch.find(s => s.name === result.source)
              if (source) {
                feedCache.setCachedFeed(source.id, result.articles)
                fetchedArticles.push(...result.articles)
              }
            }
          }
        }

        // Combine cached and fetched articles
        const allArticles = [...cachedArticles, ...fetchedArticles]

        // Get selected topic data
        const topicData = TOPICS.find(t => t.topic === state.selectedTopic)
        if (!topicData) {
          throw new Error('Selected topic not found')
        }

        // Filter and process articles
        const filteredArticles = filterAndProcessArticles(
          allArticles,
          topicData,
          state.selectedTimeframe,
          20 // Max 20 articles per source
        )

        // Separate user articles from opposing perspectives
        const { userArticles, opposingArticles } = getOpposingPerspectives(
          state.selectedSources,
          filteredArticles
        )

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
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header onReset={state.results ? handleReset : undefined} />
      
      <main className="max-w-6xl mx-auto px-4 py-8">
        {!state.results ? (
          <div className="space-y-12">
            {/* NewsAPI Configuration Warning */}
            {useNewsAPI && !hasNewsAPIKey && (
              <section>
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <div className="flex items-start">
                    <span className="text-amber-600 mr-2">⚠️</span>
                    <div>
                      <div className="font-medium text-amber-800">NewsAPI Configuration Required</div>
                      <div className="text-sm text-amber-700 mt-1">
                        NewsAPI mode is enabled but no API key is configured. Please add your NewsAPI key to the 
                        <code className="mx-1 px-1 bg-amber-100 rounded">VITE_NEWS_API_KEY</code> 
                        environment variable, or switch to RSS mode by removing 
                        <code className="mx-1 px-1 bg-amber-100 rounded">VITE_USE_NEWS_API</code>.
                        <br />
                        <a href="https://newsapi.org/register" target="_blank" rel="noopener noreferrer" 
                           className="text-amber-600 underline hover:text-amber-800 mt-1 inline-block">
                          Get a free NewsAPI key here →
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* Step 1: Language Selection (NewsAPI only) */}
            {useNewsAPI && (
              <section>
                <LanguageSelector
                  selectedLanguages={state.selectedLanguages}
                  onLanguagesChange={handleLanguagesChange}
                  disabled={!useNewsAPI}
                />
              </section>
            )}

            {/* Step 1.5: Country Selection (NewsAPI only) */}
            {useNewsAPI && (
              <section>
                <CountrySelector
                  selectedCountries={state.selectedCountries}
                  onCountriesChange={handleCountriesChange}
                  availableCountries={state.availableCountries}
                  disabled={!useNewsAPI}
                />
              </section>
            )}

            {/* Step 1.6: Sort Selection (NewsAPI only) */}
            {useNewsAPI && (
              <section>
                <SortSelector
                  selectedSort={state.selectedSort}
                  onSortChange={handleSortChange}
                  disabled={!useNewsAPI}
                />
              </section>
            )}

            {/* Step 2: Source Selection */}
            <section>
              <SourceInput
                sources={state.availableSources}
                selectedSources={state.selectedSources}
                onSourcesChange={(sources) => 
                  setState(prev => ({ ...prev, selectedSources: sources }))
                }
                isLoading={state.isLoadingSources}
                isDynamic={useNewsAPI}
              />
            </section>

            {/* Step 3: Topic Selection */}
            <section>
              <TopicSelector
                topics={TOPICS}
                selectedTopic={state.selectedTopic}
                onTopicChange={(topic) => 
                  setState(prev => ({ ...prev, selectedTopic: topic }))
                }
              />
            </section>

            {/* Step 4: Time Range */}
            <section>
              {useNewsAPI ? (
                <DateRangePicker
                  timeOptions={TIME_OPTIONS}
                  selectedRange={state.selectedDateRange}
                  onRangeChange={handleDateRangeChange}
                />
              ) : (
                <TimeSlider
                  timeOptions={TIME_OPTIONS}
                  selectedTimeframe={state.selectedTimeframe}
                  onTimeframeChange={(timeframe) => 
                    setState(prev => ({ ...prev, selectedTimeframe: timeframe }))
                  }
                />
              )}
            </section>

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
                        console.log('🔧 Running feed debug...')
                        debugFeedAccess()
                      }}
                      className="px-3 py-2 text-sm bg-yellow-500 text-white rounded hover:bg-yellow-600"
                    >
                      Test RSS Feeds
                    </button>
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
                          const filtered = filterAndProcessArticles(demoArticles, topicData, 7, 20)
                          const { userArticles, opposingArticles } = getOpposingPerspectives(['cnn'], filtered)
                          
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