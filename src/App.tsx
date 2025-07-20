import { useState } from 'react'
import { Article, NewsSource, TopicKeywords } from './types'
import { NEWS_SOURCES } from './data/newsSources'
import { TOPICS, TIME_OPTIONS } from './data/topics'
import { fetchArticlesByTopic, searchAllSources } from './services/newsApiService'
import { fetchMultipleFeeds } from './services/rssService'
import { filterAndProcessArticles, getOpposingPerspectives } from './services/filterService'
import { feedCache } from './services/cacheService'
import { debugFeedAccess, debugTopicFiltering } from './services/debugService'
import { getMockArticlesForDemo } from './services/mockDataService'

// Components
import Header from './components/Header'
import SourceInput from './components/SourceInput'
import TopicSelector from './components/TopicSelector'
import TimeSlider from './components/TimeSlider'
import LoadingState, { ResultsLoadingSkeleton } from './components/LoadingState'
import ErrorMessage, { NetworkErrorMessage } from './components/ErrorMessage'
import ResultsDisplay from './components/ResultsDisplay'

interface AppState {
  selectedSources: string[]
  selectedTopic: string
  selectedTimeframe: number
  isLoading: boolean
  error: string | null
  results: {
    userArticles: Article[]
    opposingArticles: Article[]
  } | null
}

function App() {
  const useNewsAPI = import.meta.env.VITE_USE_NEWS_API === 'true';
  const [state, setState] = useState<AppState>({
    selectedSources: [],
    selectedTopic: '',
    selectedTimeframe: 7, // Default to 1 week
    isLoading: false,
    error: null,
    results: null,
  })

  const canAnalyze = state.selectedSources.length >= 1 && state.selectedTopic

  const handleReset = () => {
    setState({
      selectedSources: [],
      selectedTopic: '',
      selectedTimeframe: 7,
      isLoading: false,
      error: null,
      results: null,
    })
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
        const cacheKey = `newsapi-${state.selectedTopic}-${state.selectedSources.join(',')}-${state.selectedTimeframe}`;
        const cached = feedCache.getCachedFeed(cacheKey);
        
        let allArticles: Article[] = [];
        
        if (cached) {
          allArticles = cached;
        } else {
          // Fetch articles from user's selected sources
          const userArticles = await fetchArticlesByTopic(
            state.selectedTopic,
            topicData.keywords,
            state.selectedSources,
            state.selectedTimeframe
          );
          
          // Fetch articles from all other sources for comparison
          const opposingSourceArticles = await searchAllSources(
            topicData.keywords,
            state.selectedTimeframe,
            state.selectedSources.map(id => {
              const source = NEWS_SOURCES.find(s => s.id === id);
              return source?.name || '';
            })
          );
          
          allArticles = [...userArticles, ...opposingSourceArticles];
          
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
        const userSourcesData = NEWS_SOURCES.filter(source => 
          state.selectedSources.includes(source.id)
        )
        
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
            {/* Step 1: Source Selection */}
            <section>
              <SourceInput
                sources={NEWS_SOURCES}
                selectedSources={state.selectedSources}
                onSourcesChange={(sources) => 
                  setState(prev => ({ ...prev, selectedSources: sources }))
                }
              />
            </section>

            {/* Step 2: Topic Selection */}
            <section>
              <TopicSelector
                topics={TOPICS}
                selectedTopic={state.selectedTopic}
                onTopicChange={(topic) => 
                  setState(prev => ({ ...prev, selectedTopic: topic }))
                }
              />
            </section>

            {/* Step 3: Time Range */}
            <section>
              <TimeSlider
                timeOptions={TIME_OPTIONS}
                selectedTimeframe={state.selectedTimeframe}
                onTimeframeChange={(timeframe) => 
                  setState(prev => ({ ...prev, selectedTimeframe: timeframe }))
                }
              />
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
                  <div className="space-x-2">
                    <button
                      onClick={() => {
                        console.log('🔧 Running feed debug...')
                        debugFeedAccess()
                      }}
                      className="px-4 py-2 text-sm bg-yellow-500 text-white rounded hover:bg-yellow-600"
                    >
                      Test RSS Feeds
                    </button>
                    <button
                      onClick={() => {
                        console.log('🔧 Running topic filter debug...')
                        debugTopicFiltering()
                      }}
                      className="px-4 py-2 text-sm bg-purple-500 text-white rounded hover:bg-purple-600"
                    >
                      Test Topic Filtering
                    </button>
                    <button
                      onClick={() => {
                        feedCache.clearCache()
                        console.log('🗑️ Cache cleared')
                      }}
                      className="px-4 py-2 text-sm bg-red-500 text-white rounded hover:bg-red-600"
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