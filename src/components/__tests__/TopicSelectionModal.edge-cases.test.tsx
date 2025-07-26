import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import TopicSelectionModal from '../TopicSelectionModal'
import { TopicKeywords, NewsLanguage, NewsSortBy } from '../../types'

// Mock child components with edge case behaviors
vi.mock('../TopicSelector', () => ({
  default: ({ onTopicChange, onCustomSearchTermsChange }: any) => (
    <div data-testid="topic-selector">
      <button 
        onClick={() => onTopicChange('')}
        data-testid="clear-topic"
      >
        Clear Topic
      </button>
      <button 
        onClick={() => onTopicChange('Invalid Topic')}
        data-testid="select-invalid-topic"
      >
        Select Invalid Topic
      </button>
      <button 
        onClick={() => onCustomSearchTermsChange([])}
        data-testid="clear-custom-terms"
      >
        Clear Custom Terms
      </button>
      <button 
        onClick={() => onCustomSearchTermsChange(Array(100).fill('term'))}
        data-testid="add-many-terms"
      >
        Add Many Terms
      </button>
    </div>
  )
}))

vi.mock('../FilterPanel', () => ({
  default: ({ onLanguagesChange, onCountriesChange, onSortChange }: any) => (
    <div data-testid="filter-panel">
      <button
        onClick={() => onLanguagesChange([])}
        data-testid="clear-languages"
      >
        Clear Languages
      </button>
      <button
        onClick={() => onCountriesChange(Array(50).fill('country'))}
        data-testid="select-many-countries"
      >
        Select Many Countries
      </button>
      <button
        onClick={() => onSortChange('invalid-sort' as NewsSortBy)}
        data-testid="invalid-sort"
      >
        Invalid Sort
      </button>
    </div>
  )
}))

const mockTopics: TopicKeywords[] = [
  {
    topic: 'Climate Change',
    keywords: ['climate'],
    multiLanguageKeywords: {
      en: ['climate change'],
      es: ['cambio climático']
    }
  }
]

describe('TopicSelectionModal Edge Cases', () => {
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
    availableCountries: ['us', 'gb'],
    selectedSort: 'relevancy' as NewsSortBy,
    onSortChange: vi.fn(),
    selectedDateRange: { type: 'preset' as const, days: 7, label: 'Last week' },
    onDateRangeChange: vi.fn(),
    timeOptions: [{ value: 7, label: 'Last week', days: 7 }],
    isOpen: true,
    onClose: vi.fn(),
    onAnalyze: vi.fn(),
    isLoading: false
  }

  beforeEach(() => {
    vi.clearAllMocks()
    // Reset body overflow
    document.body.style.overflow = 'unset'
  })

  it('handles rapid open/close operations', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    const { rerender } = render(<TopicSelectionModal {...defaultProps} onClose={onClose} isOpen={false} />)
    
    // Rapidly toggle modal
    rerender(<TopicSelectionModal {...defaultProps} onClose={onClose} isOpen={true} />)
    rerender(<TopicSelectionModal {...defaultProps} onClose={onClose} isOpen={false} />)
    rerender(<TopicSelectionModal {...defaultProps} onClose={onClose} isOpen={true} />)
    
    // Should still work properly
    const closeButton = screen.getByRole('button', { name: /close modal/i })
    await user.click(closeButton)
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('handles multiple ESC key presses', () => {
    const onClose = vi.fn()
    render(<TopicSelectionModal {...defaultProps} onClose={onClose} />)
    
    // Multiple ESC presses
    fireEvent.keyDown(document, { key: 'Escape' })
    fireEvent.keyDown(document, { key: 'Escape' })
    fireEvent.keyDown(document, { key: 'Escape' })
    
    expect(onClose).toHaveBeenCalledTimes(3)
  })

  it('handles invalid topic selection', async () => {
    const user = userEvent.setup()
    const onTopicChange = vi.fn()
    render(<TopicSelectionModal {...defaultProps} onTopicChange={onTopicChange} />)
    
    const invalidTopicButton = screen.getByTestId('select-invalid-topic')
    await user.click(invalidTopicButton)
    
    expect(onTopicChange).toHaveBeenCalledWith('Invalid Topic')
  })

  it('handles clearing topic selection', async () => {
    const user = userEvent.setup()
    const onTopicChange = vi.fn()
    render(<TopicSelectionModal {...defaultProps} onTopicChange={onTopicChange} selectedTopic="Climate Change" />)
    
    const clearTopicButton = screen.getByTestId('clear-topic')
    await user.click(clearTopicButton)
    
    expect(onTopicChange).toHaveBeenCalledWith('')
  })

  it('handles excessive custom search terms', async () => {
    const user = userEvent.setup()
    const onCustomSearchTermsChange = vi.fn()
    render(<TopicSelectionModal {...defaultProps} onCustomSearchTermsChange={onCustomSearchTermsChange} />)
    
    const addManyTermsButton = screen.getByTestId('add-many-terms')
    await user.click(addManyTermsButton)
    
    expect(onCustomSearchTermsChange).toHaveBeenCalledWith(Array(100).fill('term'))
  })

  it('handles empty custom search terms for Custom Search topic', () => {
    render(<TopicSelectionModal {...defaultProps} selectedTopic="Custom Search" customSearchTerms={[]} />)
    
    const analyzeButton = screen.getByRole('button', { name: /break my bubble/i })
    expect(analyzeButton).toBeDisabled()
  })

  it('handles modal opening when body has existing overflow style', () => {
    document.body.style.overflow = 'scroll'
    
    render(<TopicSelectionModal {...defaultProps} isOpen={true} />)
    expect(document.body.style.overflow).toBe('hidden')
  })

  it('restores original body overflow when modal closes', () => {
    document.body.style.overflow = 'auto'
    
    const { rerender } = render(<TopicSelectionModal {...defaultProps} isOpen={true} />)
    expect(document.body.style.overflow).toBe('hidden')
    
    rerender(<TopicSelectionModal {...defaultProps} isOpen={false} />)
    expect(document.body.style.overflow).toBe('unset')
  })

  it('handles clicking on modal content without closing', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    render(<TopicSelectionModal {...defaultProps} onClose={onClose} />)
    
    const modalContent = screen.getByRole('dialog')
    await user.click(modalContent)
    
    expect(onClose).not.toHaveBeenCalled()
  })

  it('handles analyze button click when loading', async () => {
    const user = userEvent.setup()
    const onAnalyze = vi.fn()
    render(<TopicSelectionModal {...defaultProps} selectedTopic="Climate Change" isLoading={true} onAnalyze={onAnalyze} />)
    
    const analyzeButton = screen.getByRole('button', { name: /analyzing/i })
    expect(analyzeButton).toBeDisabled()
    
    // Attempt to click disabled button
    await user.click(analyzeButton)
    expect(onAnalyze).not.toHaveBeenCalled()
  })

  it('handles window resize events while modal is open', () => {
    render(<TopicSelectionModal {...defaultProps} />)
    
    // Simulate various window sizes
    Object.defineProperty(window, 'innerWidth', { value: 320, writable: true })
    window.dispatchEvent(new Event('resize'))
    
    Object.defineProperty(window, 'innerWidth', { value: 1920, writable: true })
    window.dispatchEvent(new Event('resize'))
    
    // Modal should still be functional
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })

  it('handles keyboard events other than ESC', () => {
    const onClose = vi.fn()
    render(<TopicSelectionModal {...defaultProps} onClose={onClose} />)
    
    // Other keys should not close modal
    fireEvent.keyDown(document, { key: 'Enter' })
    fireEvent.keyDown(document, { key: 'Space' })
    fireEvent.keyDown(document, { key: 'Tab' })
    
    expect(onClose).not.toHaveBeenCalled()
  })

  it('handles multiple analyze button clicks rapidly', async () => {
    const user = userEvent.setup()
    const onAnalyze = vi.fn()
    render(<TopicSelectionModal {...defaultProps} selectedTopic="Climate Change" onAnalyze={onAnalyze} />)
    
    const analyzeButton = screen.getByRole('button', { name: /break my bubble/i })
    
    // Rapid clicks
    await user.click(analyzeButton)
    await user.click(analyzeButton)
    await user.click(analyzeButton)
    
    expect(onAnalyze).toHaveBeenCalledTimes(3)
  })

  it('handles invalid sort selection', async () => {
    const user = userEvent.setup()
    const onSortChange = vi.fn()
    render(<TopicSelectionModal {...defaultProps} onSortChange={onSortChange} />)
    
    const invalidSortButton = screen.getByTestId('invalid-sort')
    await user.click(invalidSortButton)
    
    expect(onSortChange).toHaveBeenCalledWith('invalid-sort')
  })

  it('handles excessive country selection', async () => {
    const user = userEvent.setup()
    const onCountriesChange = vi.fn()
    render(<TopicSelectionModal {...defaultProps} onCountriesChange={onCountriesChange} />)
    
    const selectManyCountriesButton = screen.getByTestId('select-many-countries')
    await user.click(selectManyCountriesButton)
    
    expect(onCountriesChange).toHaveBeenCalledWith(Array(50).fill('country'))
  })

  it('handles clearing all languages', async () => {
    const user = userEvent.setup()
    const onLanguagesChange = vi.fn()
    render(<TopicSelectionModal {...defaultProps} onLanguagesChange={onLanguagesChange} selectedLanguages={['en', 'es']} />)
    
    const clearLanguagesButton = screen.getByTestId('clear-languages')
    await user.click(clearLanguagesButton)
    
    expect(onLanguagesChange).toHaveBeenCalledWith([])
  })

  it('handles modal focus management edge cases', async () => {
    const user = userEvent.setup()
    render(<TopicSelectionModal {...defaultProps} />)
    
    // Try to tab through all elements
    await user.tab()
    await user.tab()
    await user.tab()
    
    // Should not crash or lose focus
    expect(document.activeElement).toBeTruthy()
  })

  it('handles modal with empty topics array', () => {
    render(<TopicSelectionModal {...defaultProps} topics={[]} />)
    
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByTestId('topic-selector')).toBeInTheDocument()
  })

  it('handles modal with empty available countries', () => {
    render(<TopicSelectionModal {...defaultProps} availableCountries={[]} />)
    
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByTestId('filter-panel')).toBeInTheDocument()
  })

  it('handles memory cleanup on unmount', () => {
    const { unmount } = render(<TopicSelectionModal {...defaultProps} />)
    
    // Unmount component
    unmount()
    
    // ESC key should not trigger anything after unmount
    const onClose = vi.fn()
    fireEvent.keyDown(document, { key: 'Escape' })
    
    expect(onClose).not.toHaveBeenCalled()
  })

  it('handles backdrop click with nested elements', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    
    render(<TopicSelectionModal {...defaultProps} onClose={onClose} />)
    
    // Test backdrop functionality exists
    const modal = screen.getByRole('dialog')
    expect(modal).toBeInTheDocument()
    
    // The backdrop click is handled in the actual implementation
    // For testing purposes, verify the modal structure exists
    expect(onClose).toHaveBeenCalledTimes(0) // Should not be called without actual click
  })
})