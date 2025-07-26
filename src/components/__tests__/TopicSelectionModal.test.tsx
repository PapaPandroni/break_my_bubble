import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import TopicSelectionModal from '../TopicSelectionModal'
import { TopicKeywords, NewsLanguage, NewsSortBy } from '../../types'

// Mock child components
vi.mock('../TopicSelector', () => ({
  default: ({ selectedTopic, onTopicChange, customSearchTerms, onCustomSearchTermsChange }: any) => (
    <div data-testid="topic-selector">
      <button 
        onClick={() => onTopicChange('Climate Change')}
        data-testid="select-topic"
      >
        Select Climate Change
      </button>
      <button 
        onClick={() => onTopicChange('Custom Search')}
        data-testid="select-custom"
      >
        Select Custom Search
      </button>
      <button 
        onClick={() => onCustomSearchTermsChange(['test', 'search'])}
        data-testid="add-custom-terms"
      >
        Add Custom Terms
      </button>
      <span data-testid="selected-topic">{selectedTopic}</span>
      <span data-testid="custom-terms-count">{customSearchTerms.length}</span>
    </div>
  )
}))

vi.mock('../FilterPanel', () => ({
  default: ({ selectedLanguages, onLanguagesChange }: any) => (
    <div data-testid="filter-panel">
      <button
        onClick={() => onLanguagesChange(['en', 'es'])}
        data-testid="select-languages"
      >
        Select Languages
      </button>
      <span data-testid="languages-count">{selectedLanguages.length}</span>
    </div>
  )
}))

const mockTopics: TopicKeywords[] = [
  {
    topic: 'Climate Change',
    keywords: ['climate', 'global warming'],
    multiLanguageKeywords: {
      en: ['climate change', 'global warming'],
      es: ['cambio climático', 'calentamiento global']
    }
  },
  {
    topic: 'Technology',
    keywords: ['tech', 'innovation'],
    multiLanguageKeywords: {
      en: ['technology', 'innovation'],
      es: ['tecnología', 'innovación']
    }
  }
]

const mockTimeOptions = [
  { value: 1, label: 'Today', days: 1 },
  { value: 7, label: 'Last week', days: 7 },
  { value: 30, label: 'Last month', days: 30 }
]

describe('TopicSelectionModal Component', () => {
  const defaultProps = {
    topics: mockTopics,
    selectedTopic: '',
    onTopicChange: vi.fn(),
    customSearchTerms: [],
    onCustomSearchTermsChange: vi.fn(),
    selectedLanguages: [] as NewsLanguage[],
    onLanguagesChange: vi.fn(),
    selectedCountries: [],
    onCountriesChange: vi.fn(),
    availableCountries: ['us', 'gb', 'ca'],
    selectedSort: 'relevancy' as NewsSortBy,
    onSortChange: vi.fn(),
    selectedDateRange: { type: 'preset' as const, days: 7, label: 'Last week' },
    onDateRangeChange: vi.fn(),
    timeOptions: mockTimeOptions,
    isOpen: true,
    onClose: vi.fn(),
    onAnalyze: vi.fn(),
    isLoading: false
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders nothing when modal is closed', () => {
    render(<TopicSelectionModal {...defaultProps} isOpen={false} />)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('renders modal with correct structure when open', () => {
    render(<TopicSelectionModal {...defaultProps} />)
    
    const modal = screen.getByRole('dialog')
    expect(modal).toBeInTheDocument()
    expect(modal).toHaveAttribute('aria-modal', 'true')
    expect(modal).toHaveAttribute('aria-labelledby', 'modal-title')
  })

  it('renders modal header correctly', () => {
    render(<TopicSelectionModal {...defaultProps} />)
    
    expect(screen.getByText('Choose your topic and preferences')).toBeInTheDocument()
    expect(screen.getByText('Select what you want to explore and customize your search')).toBeInTheDocument()
  })

  it('renders topic selection section', () => {
    render(<TopicSelectionModal {...defaultProps} />)
    
    expect(screen.getByText('What topic interests you?')).toBeInTheDocument()
    expect(screen.getByText('Choose a predefined topic or create your own custom search')).toBeInTheDocument()
    expect(screen.getByTestId('topic-selector')).toBeInTheDocument()
  })

  it('renders filter panel section', () => {
    render(<TopicSelectionModal {...defaultProps} />)
    
    expect(screen.getByText('Advanced Options')).toBeInTheDocument()
    expect(screen.getByTestId('filter-panel')).toBeInTheDocument()
  })

  it('closes modal when ESC key is pressed', () => {
    const onClose = vi.fn()
    render(<TopicSelectionModal {...defaultProps} onClose={onClose} />)
    
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('closes modal when backdrop is clicked', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    render(<TopicSelectionModal {...defaultProps} onClose={onClose} />)
    
    const backdrop = screen.getByRole('dialog').parentElement?.querySelector('.bg-black.bg-opacity-50')
    if (backdrop) {
      await user.click(backdrop)
      expect(onClose).toHaveBeenCalledTimes(1)
    }
  })

  it('closes modal when close button is clicked', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    render(<TopicSelectionModal {...defaultProps} onClose={onClose} />)
    
    const closeButton = screen.getByRole('button', { name: /close modal/i })
    await user.click(closeButton)
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('closes modal when "Back to sources" button is clicked', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    render(<TopicSelectionModal {...defaultProps} onClose={onClose} />)
    
    const backButton = screen.getByRole('button', { name: /back to sources/i })
    await user.click(backButton)
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('disables analyze button when no topic is selected', () => {
    render(<TopicSelectionModal {...defaultProps} selectedTopic="" />)
    
    const analyzeButton = screen.getByRole('button', { name: /break my bubble/i })
    expect(analyzeButton).toBeDisabled()
    expect(analyzeButton).toHaveClass('bg-gray-300', 'text-gray-500', 'cursor-not-allowed')
    expect(screen.getByText('Select a topic to continue')).toBeInTheDocument()
  })

  it('enables analyze button when a regular topic is selected', () => {
    render(<TopicSelectionModal {...defaultProps} selectedTopic="Climate Change" />)
    
    const analyzeButton = screen.getByRole('button', { name: /break my bubble/i })
    expect(analyzeButton).not.toBeDisabled()
    expect(analyzeButton).toHaveClass('bg-blue-600', 'text-white')
  })

  it('requires custom search terms when "Custom Search" topic is selected', () => {
    const { rerender } = render(<TopicSelectionModal {...defaultProps} selectedTopic="Custom Search" customSearchTerms={[]} />)
    
    // Should be disabled when no custom terms
    let analyzeButton = screen.getByRole('button', { name: /break my bubble/i })
    expect(analyzeButton).toBeDisabled()
    
    // Should be enabled when custom terms are provided
    rerender(<TopicSelectionModal {...defaultProps} selectedTopic="Custom Search" customSearchTerms={['test']} />)
    analyzeButton = screen.getByRole('button', { name: /break my bubble/i })
    expect(analyzeButton).not.toBeDisabled()
  })

  it('calls onAnalyze when analyze button is clicked', async () => {
    const user = userEvent.setup()
    const onAnalyze = vi.fn()
    render(<TopicSelectionModal {...defaultProps} selectedTopic="Climate Change" onAnalyze={onAnalyze} />)
    
    const analyzeButton = screen.getByRole('button', { name: /break my bubble/i })
    await user.click(analyzeButton)
    
    expect(onAnalyze).toHaveBeenCalledTimes(1)
  })

  it('shows loading state correctly', () => {
    render(<TopicSelectionModal {...defaultProps} selectedTopic="Climate Change" isLoading={true} />)
    
    const analyzeButton = screen.getByRole('button', { name: /analyzing/i })
    expect(analyzeButton).toBeDisabled()
    expect(screen.getByText('Analyzing...')).toBeInTheDocument()
    
    // Should show loading spinner
    const spinner = screen.getByRole('button', { name: /analyzing/i }).querySelector('.animate-spin')
    expect(spinner).toBeInTheDocument()
  })

  it('prevents body scroll when modal is open', () => {
    render(<TopicSelectionModal {...defaultProps} isOpen={true} />)
    expect(document.body.style.overflow).toBe('hidden')
  })

  it('restores body scroll when modal is closed', () => {
    const { rerender } = render(<TopicSelectionModal {...defaultProps} isOpen={true} />)
    expect(document.body.style.overflow).toBe('hidden')
    
    rerender(<TopicSelectionModal {...defaultProps} isOpen={false} />)
    expect(document.body.style.overflow).toBe('unset')
  })

  it('handles topic change correctly', async () => {
    const user = userEvent.setup()
    const onTopicChange = vi.fn()
    render(<TopicSelectionModal {...defaultProps} onTopicChange={onTopicChange} />)
    
    const selectTopicButton = screen.getByTestId('select-topic')
    await user.click(selectTopicButton)
    
    expect(onTopicChange).toHaveBeenCalledWith('Climate Change')
  })

  it('handles custom search terms change correctly', async () => {
    const user = userEvent.setup()
    const onCustomSearchTermsChange = vi.fn()
    render(<TopicSelectionModal {...defaultProps} onCustomSearchTermsChange={onCustomSearchTermsChange} />)
    
    const addTermsButton = screen.getByTestId('add-custom-terms')
    await user.click(addTermsButton)
    
    expect(onCustomSearchTermsChange).toHaveBeenCalledWith(['test', 'search'])
  })

  it('handles language selection change correctly', async () => {
    const user = userEvent.setup()
    const onLanguagesChange = vi.fn()
    render(<TopicSelectionModal {...defaultProps} onLanguagesChange={onLanguagesChange} />)
    
    const selectLanguagesButton = screen.getByTestId('select-languages')
    await user.click(selectLanguagesButton)
    
    expect(onLanguagesChange).toHaveBeenCalledWith(['en', 'es'])
  })

  it('has proper modal accessibility attributes', () => {
    render(<TopicSelectionModal {...defaultProps} />)
    
    const modal = screen.getByRole('dialog')
    expect(modal).toHaveAttribute('aria-modal', 'true')
    expect(modal).toHaveAttribute('aria-labelledby', 'modal-title')
    
    const closeButton = screen.getByRole('button', { name: /close modal/i })
    expect(closeButton).toHaveAttribute('aria-label', 'Close modal')
  })

  it('has proper focus management and keyboard navigation', async () => {
    const user = userEvent.setup()
    render(<TopicSelectionModal {...defaultProps} selectedTopic="Climate Change" />)
    
    // Test close button focus
    const closeButton = screen.getByRole('button', { name: /close modal/i })
    await user.tab()
    expect(closeButton).toHaveClass('focus:ring-2', 'focus:ring-blue-500')
    
    // Test analyze button focus
    const analyzeButton = screen.getByRole('button', { name: /break my bubble/i })
    expect(analyzeButton).toHaveClass('focus:ring-2', 'focus:ring-blue-500')
  })

  it('stops event propagation when modal content is clicked', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    render(<TopicSelectionModal {...defaultProps} onClose={onClose} />)
    
    const modalContent = screen.getByRole('dialog')
    await user.click(modalContent)
    
    // Modal should not close when content is clicked
    expect(onClose).not.toHaveBeenCalled()
  })

  it('renders with correct responsive classes', () => {
    render(<TopicSelectionModal {...defaultProps} />)
    
    const modal = screen.getByRole('dialog')
    expect(modal).toHaveClass('w-full', 'max-w-4xl')
    
    // Check for responsive padding and spacing
    const container = modal.closest('.p-4')
    expect(container).toBeInTheDocument()
  })

  it('manages scroll correctly in modal content', () => {
    render(<TopicSelectionModal {...defaultProps} />)
    
    // The content area should have scrollable overflow
    const contentArea = screen.getByRole('dialog').querySelector('.max-h-\\[70vh\\].overflow-y-auto')
    expect(contentArea).toBeInTheDocument()
  })
})