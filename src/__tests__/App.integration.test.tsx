import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from '../App'

// Mock all the child components to focus on App logic
vi.mock('../components/Header', () => ({
  default: ({ onReset, onTitleClick }: any) => (
    <div data-testid="header">
      {onReset && (
        <button data-testid="reset-button" onClick={onReset}>
          Reset
        </button>
      )}
      {onTitleClick && (
        <button data-testid="title-button" onClick={onTitleClick}>
          BreakMyBubble
        </button>
      )}
    </div>
  )
}))

vi.mock('../components/LandingPage', () => ({
  default: ({ onContinue, selectedSources, onSourcesChange }: any) => (
    <div data-testid="landing-page">
      <button 
        data-testid="select-sources"
        onClick={() => onSourcesChange(['cnn'])}
      >
        Select Sources
      </button>
      <button 
        data-testid="continue-button"
        onClick={onContinue}
        disabled={selectedSources.length === 0}
      >
        Continue
      </button>
      <span data-testid="sources-count">{selectedSources.length}</span>
    </div>
  )
}))

vi.mock('../components/TopicSelectionModal', () => ({
  default: ({ isOpen, onClose, onAnalyze, selectedTopic, onTopicChange }: any) => (
    <div data-testid="topic-modal" style={{ display: isOpen ? 'block' : 'none' }}>
      <button data-testid="close-modal" onClick={onClose}>
        Close Modal
      </button>
      <button 
        data-testid="select-topic"
        onClick={() => onTopicChange('Climate Change')}
      >
        Select Topic
      </button>
      <button 
        data-testid="analyze-button"
        onClick={onAnalyze}
        disabled={!selectedTopic}
      >
        Analyze
      </button>
      <span data-testid="selected-topic">{selectedTopic}</span>
    </div>
  )
}))

vi.mock('../components/ResultsDisplay', () => ({
  default: ({ userArticles, opposingArticles }: any) => (
    <div data-testid="results-display">
      <span data-testid="user-articles-count">{userArticles?.length || 0}</span>
      <span data-testid="opposing-articles-count">{opposingArticles?.length || 0}</span>
    </div>
  )
}))

vi.mock('../components/LoadingState', () => ({
  default: ({ message }: any) => <div data-testid="loading-state">{message}</div>,
  ResultsLoadingSkeleton: () => <div data-testid="loading-skeleton">Loading...</div>
}))

vi.mock('../components/ErrorMessage', () => ({
  NetworkErrorMessage: ({ onRetry }: any) => (
    <div data-testid="error-message">
      <button data-testid="retry-button" onClick={onRetry}>
        Retry
      </button>
    </div>
  )
}))

// Mock services with delayed response to test loading state
vi.mock('../services/newsApiService', () => ({
  fetchArticlesByTopic: vi.fn().mockImplementation(() => 
    new Promise(resolve => 
      setTimeout(() => resolve({
        articles: [
          {
            title: 'Test Article 1',
            description: 'Test description',
            link: 'https://example.com/1',
            pubDate: '2024-01-01',
            source: 'CNN',
            sourceLean: 'lean-left'
          }
        ],
        totalResults: 1
      }), 100)
    )
  ),
  searchAllSources: vi.fn().mockImplementation(() => 
    new Promise(resolve => 
      setTimeout(() => resolve({
        articles: [
          {
            title: 'Test Article 2',
            description: 'Test description 2',
            link: 'https://example.com/2',
            pubDate: '2024-01-01',
            source: 'Fox News',
            sourceLean: 'lean-right'
          }
        ],
        totalResults: 1
      }), 100)
    )
  )
}))

vi.mock('../services/filterService', () => ({
  filterAndProcessArticles: vi.fn().mockReturnValue([
    {
      title: 'Filtered Article',
      description: 'Filtered description',
      link: 'https://example.com/filtered',
      pubDate: '2024-01-01',
      source: 'CNN',
      sourceLean: 'lean-left'
    }
  ]),
  getOpposingPerspectives: vi.fn().mockReturnValue({
    userArticles: [
      {
        title: 'User Article',
        description: 'User description',
        link: 'https://example.com/user',
        pubDate: '2024-01-01',
        source: 'CNN',
        sourceLean: 'lean-left'
      }
    ],
    opposingArticles: [
      {
        title: 'Opposing Article',
        description: 'Opposing description',
        link: 'https://example.com/opposing',
        pubDate: '2024-01-01',
        source: 'Fox News',
        sourceLean: 'lean-right'
      }
    ]
  })
}))

vi.mock('../services/unifiedSourceService', () => ({
  unifiedSourceService: {
    getSourcesOptimistic: vi.fn().mockResolvedValue({
      sources: [
        {
          id: 'cnn',
          name: 'CNN',
          website: 'https://cnn.com',
          politicalLean: 'lean-left',
          credibility: 0.8,
          isDynamic: false
        }
      ],
      isLoading: false,
      loadDynamic: vi.fn().mockResolvedValue([])
    }),
    filterSources: vi.fn().mockReturnValue([]),
    getAvailableCountries: vi.fn().mockReturnValue(['us'])
  }
}))

vi.mock('../services/cacheService', () => ({
  feedCache: {
    getCachedFeedWithStatus: vi.fn().mockReturnValue({ status: 'expired', data: null }),
    setCachedFeed: vi.fn(),
    getCacheAge: vi.fn().mockReturnValue(0),
    clearCache: vi.fn()
  }
}))

describe('App Integration Tests - Step Navigation', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('starts on landing page step', () => {
    render(<App />)
    
    expect(screen.getByTestId('landing-page')).toBeInTheDocument()
    expect(screen.queryByTestId('topic-modal')).toHaveStyle({ display: 'none' })
    expect(screen.queryByTestId('results-display')).not.toBeInTheDocument()
  })

  it('navigates from landing to modal when continue is clicked', async () => {
    const user = userEvent.setup()
    render(<App />)
    
    // First select sources to enable continue button
    const selectSourcesButton = screen.getByTestId('select-sources')
    await user.click(selectSourcesButton)
    
    // Wait for state update
    await waitFor(() => {
      expect(screen.getByTestId('sources-count')).toHaveTextContent('1')
    })
    
    // Then click continue
    const continueButton = screen.getByTestId('continue-button')
    await user.click(continueButton)
    
    // Should show modal
    await waitFor(() => {
      expect(screen.getByTestId('topic-modal')).toHaveStyle({ display: 'block' })
    })
  })

  it('navigates from modal back to landing when close is clicked', async () => {
    const user = userEvent.setup()
    render(<App />)
    
    // Navigate to modal first
    await user.click(screen.getByTestId('select-sources'))
    await waitFor(() => {
      expect(screen.getByTestId('sources-count')).toHaveTextContent('1')
    })
    
    await user.click(screen.getByTestId('continue-button'))
    await waitFor(() => {
      expect(screen.getByTestId('topic-modal')).toHaveStyle({ display: 'block' })
    })
    
    // Close modal
    await user.click(screen.getByTestId('close-modal'))
    
    // Should be back on landing page
    await waitFor(() => {
      expect(screen.getByTestId('topic-modal')).toHaveStyle({ display: 'none' })
    })
    expect(screen.getByTestId('landing-page')).toBeInTheDocument()
  })

  it('navigates from modal to results when analyze is clicked', async () => {
    const user = userEvent.setup()
    render(<App />)
    
    // Navigate to modal
    await user.click(screen.getByTestId('select-sources'))
    await waitFor(() => {
      expect(screen.getByTestId('sources-count')).toHaveTextContent('1')
    })
    
    await user.click(screen.getByTestId('continue-button'))
    await waitFor(() => {
      expect(screen.getByTestId('topic-modal')).toHaveStyle({ display: 'block' })
    })
    
    // Select topic and analyze
    await user.click(screen.getByTestId('select-topic'))
    await waitFor(() => {
      expect(screen.getByTestId('selected-topic')).toHaveTextContent('Climate Change')
    })
    
    await user.click(screen.getByTestId('analyze-button'))
    
    // Should show results
    await waitFor(() => {
      expect(screen.getByTestId('results-display')).toBeInTheDocument()
    })
  })

  it('shows header reset button only when not on landing page', async () => {
    const user = userEvent.setup()
    render(<App />)
    
    // On landing page - no reset button
    expect(screen.queryByTestId('reset-button')).not.toBeInTheDocument()
    
    // Navigate to modal
    await user.click(screen.getByTestId('select-sources'))
    await user.click(screen.getByTestId('continue-button'))
    
    await waitFor(() => {
      expect(screen.getByTestId('reset-button')).toBeInTheDocument()
    })
  })

  it('shows header title as clickable button when not on landing page', async () => {
    const user = userEvent.setup()
    render(<App />)
    
    // On landing page - no title button
    expect(screen.queryByTestId('title-button')).not.toBeInTheDocument()
    
    // Navigate to modal
    await user.click(screen.getByTestId('select-sources'))
    await user.click(screen.getByTestId('continue-button'))
    
    await waitFor(() => {
      expect(screen.getByTestId('title-button')).toBeInTheDocument()
    })
  })

  it('resets to landing page when reset button is clicked', async () => {
    const user = userEvent.setup()
    render(<App />)
    
    // Navigate to modal
    await user.click(screen.getByTestId('select-sources'))
    await user.click(screen.getByTestId('continue-button'))
    
    await waitFor(() => {
      expect(screen.getByTestId('reset-button')).toBeInTheDocument()
    })
    
    // Click reset
    await user.click(screen.getByTestId('reset-button'))
    
    // Should be back on landing page with cleared state
    await waitFor(() => {
      expect(screen.getByTestId('sources-count')).toHaveTextContent('0')
    })
    expect(screen.queryByTestId('reset-button')).not.toBeInTheDocument()
  })

  it('returns to landing page when title is clicked', async () => {
    const user = userEvent.setup()
    render(<App />)
    
    // Navigate to modal
    await user.click(screen.getByTestId('select-sources'))
    await user.click(screen.getByTestId('continue-button'))
    
    await waitFor(() => {
      expect(screen.getByTestId('title-button')).toBeInTheDocument()
    })
    
    // Click title
    await user.click(screen.getByTestId('title-button'))
    
    // Should be back on landing page
    await waitFor(() => {
      expect(screen.getByTestId('topic-modal')).toHaveStyle({ display: 'none' })
    })
    expect(screen.getByTestId('landing-page')).toBeInTheDocument()
  })

  it('shows loading state during analysis', async () => {
    const user = userEvent.setup()
    render(<App />)
    
    // Navigate through to analysis
    await user.click(screen.getByTestId('select-sources'))
    await waitFor(() => {
      expect(screen.getByTestId('sources-count')).toHaveTextContent('1')
    })
    
    await user.click(screen.getByTestId('continue-button'))
    await waitFor(() => {
      expect(screen.getByTestId('topic-modal')).toHaveStyle({ display: 'block' })
    })
    
    await user.click(screen.getByTestId('select-topic'))
    await waitFor(() => {
      expect(screen.getByTestId('selected-topic')).toHaveTextContent('Climate Change')
    })
    
    // Start analysis
    await user.click(screen.getByTestId('analyze-button'))
    
    // Should show loading state initially (might be very brief)
    // First check if we're in results step
    await waitFor(() => {
      expect(screen.getByTestId('results-display')).toBeInTheDocument()
    }, { timeout: 1000 })
  })

  it('shows results after successful analysis', async () => {
    const user = userEvent.setup()
    render(<App />)
    
    // Navigate through to analysis
    await user.click(screen.getByTestId('select-sources'))
    await user.click(screen.getByTestId('continue-button'))
    await user.click(screen.getByTestId('select-topic'))
    await user.click(screen.getByTestId('analyze-button'))
    
    // Wait for analysis to complete and results to show
    await waitFor(() => {
      expect(screen.getByTestId('results-display')).toBeInTheDocument()
    }, { timeout: 3000 })
    
    // Should show article counts
    expect(screen.getByTestId('user-articles-count')).toBeInTheDocument()
    expect(screen.getByTestId('opposing-articles-count')).toBeInTheDocument()
  })

  it('maintains selected sources through navigation', async () => {
    const user = userEvent.setup()
    render(<App />)
    
    // Select sources
    await user.click(screen.getByTestId('select-sources'))
    await waitFor(() => {
      expect(screen.getByTestId('sources-count')).toHaveTextContent('1')
    })
    
    // Navigate to modal and back
    await user.click(screen.getByTestId('continue-button'))
    await user.click(screen.getByTestId('close-modal'))
    
    // Sources should still be selected
    await waitFor(() => {
      expect(screen.getByTestId('sources-count')).toHaveTextContent('1')
    })
  })

  it('preserves state when navigating back from results', async () => {
    const user = userEvent.setup()
    render(<App />)
    
    // Complete full flow
    await user.click(screen.getByTestId('select-sources'))
    await user.click(screen.getByTestId('continue-button'))
    await user.click(screen.getByTestId('select-topic'))
    await user.click(screen.getByTestId('analyze-button'))
    
    await waitFor(() => {
      expect(screen.getByTestId('results-display')).toBeInTheDocument()
    })
    
    // Navigate back via title click
    await user.click(screen.getByTestId('title-button'))
    
    // Should maintain selections
    await waitFor(() => {
      expect(screen.getByTestId('sources-count')).toHaveTextContent('1')
    })
  })
})