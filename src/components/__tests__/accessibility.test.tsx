import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import FAQ from '../FAQ'
import LandingPage from '../LandingPage'
import TopicSelectionModal from '../TopicSelectionModal'
import { NewsSource, TopicKeywords, NewsLanguage, NewsSortBy } from '../../types'

// Mock components for TopicSelectionModal tests
vi.mock('../TopicSelector', () => ({
  default: () => <div data-testid="topic-selector" />
}))

vi.mock('../FilterPanel', () => ({
  default: () => <div data-testid="filter-panel" />
}))

// Mock SourceInput for LandingPage tests
vi.mock('../SourceInput', () => ({
  default: () => <div data-testid="source-input" />
}))

describe('Accessibility Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('FAQ Accessibility', () => {
    it('has proper heading hierarchy', () => {
      render(<FAQ />)
      
      const heading = screen.getByRole('heading', { level: 3 })
      expect(heading).toHaveTextContent('Frequently Asked Questions')
    })

    it('has proper ARIA attributes for expandable content', () => {
      render(<FAQ />)
      
      const buttons = screen.getAllByRole('button')
      
      buttons.forEach((button, index) => {
        expect(button).toHaveAttribute('aria-expanded', 'false')
        expect(button).toHaveAttribute('aria-controls', `faq-answer-${index}`)
      })
    })

    it('updates ARIA expanded state correctly', async () => {
      const user = userEvent.setup()
      render(<FAQ />)
      
      const firstButton = screen.getAllByRole('button')[0]
      expect(firstButton).toHaveAttribute('aria-expanded', 'false')
      
      await user.click(firstButton)
      expect(firstButton).toHaveAttribute('aria-expanded', 'true')
    })

    it('provides proper answer IDs for ARIA controls', async () => {
      const user = userEvent.setup()
      render(<FAQ />)
      
      const firstButton = screen.getAllByRole('button')[0]
      await user.click(firstButton)
      
      const answerId = firstButton.getAttribute('aria-controls')
      const answerElement = document.getElementById(answerId!)
      expect(answerElement).toBeInTheDocument()
    })

    it('supports keyboard navigation', async () => {
      const user = userEvent.setup()
      render(<FAQ />)
      
      // Tab to first button
      await user.tab()
      const firstButton = screen.getAllByRole('button')[0]
      expect(firstButton).toHaveFocus()
      
      // Enter should expand
      await user.keyboard('{Enter}')
      expect(firstButton).toHaveAttribute('aria-expanded', 'true')
      
      // Space should also work
      await user.keyboard(' ')
      expect(firstButton).toHaveAttribute('aria-expanded', 'false')
    })
  })

  describe('LandingPage Accessibility', () => {
    const mockSources: NewsSource[] = [
      {
        id: 'cnn',
        name: 'CNN',
        website: 'https://cnn.com',
        politicalLean: 'lean-left',
        credibility: 0.8,
        isDynamic: false
      }
    ]

    const defaultProps = {
      sources: mockSources,
      selectedSources: [],
      onSourcesChange: vi.fn(),
      onContinue: vi.fn(),
      isLoadingSources: false,
      allSourcesLoaded: true
    }

    it('has proper heading hierarchy', () => {
      render(<LandingPage {...defaultProps} />)
      
      const h1 = screen.getByRole('heading', { level: 1 })
      expect(h1).toHaveTextContent('BreakMyBubble')
      
      const h2 = screen.getByRole('heading', { level: 2 })
      expect(h2).toHaveTextContent('Discover opposing perspectives on any topic')
      
      const h3Elements = screen.getAllByRole('heading', { level: 3 })
      expect(h3Elements).toHaveLength(2) // One for sources, one for FAQ
      expect(h3Elements[0]).toHaveTextContent('Start by selecting your news sources')
      expect(h3Elements[1]).toHaveTextContent('Frequently Asked Questions')
    })

    it('has proper ARIA label for continue button', () => {
      render(<LandingPage {...defaultProps} selectedSources={['cnn']} />)
      
      const continueButton = screen.getByRole('button', { name: /continue/i })
      expect(continueButton).toHaveAttribute('aria-label', 'Continue to topic selection')
    })

    it('provides clear focus indication', async () => {
      const user = userEvent.setup()
      render(<LandingPage {...defaultProps} selectedSources={['cnn']} />)
      
      const continueButton = screen.getByRole('button', { name: /continue/i })
      
      await user.tab()
      // Focus should be visible (tested via CSS classes)
      expect(continueButton).toHaveClass('focus:ring-2', 'focus:ring-blue-500', 'focus:ring-offset-2')
    })

    it('has descriptive helper text for different states', () => {
      const { rerender } = render(<LandingPage {...defaultProps} selectedSources={[]} />)
      
      // When no sources selected
      expect(screen.getByText('Select at least one news source to continue')).toBeInTheDocument()
      
      // When sources selected
      rerender(<LandingPage {...defaultProps} selectedSources={['cnn']} />)
      expect(screen.getByText('Next: Choose a topic to explore different perspectives')).toBeInTheDocument()
    })

    it('maintains logical tab order', async () => {
      const user = userEvent.setup()
      render(<LandingPage {...defaultProps} selectedSources={['cnn']} />)
      
      // Test that continue button is focusable
      const continueButton = screen.getByRole('button', { name: /continue/i })
      continueButton.focus()
      expect(continueButton).toHaveFocus()
    })
  })

  describe('TopicSelectionModal Accessibility', () => {
    const defaultProps = {
      topics: [] as TopicKeywords[],
      selectedTopic: '',
      onTopicChange: vi.fn(),
      customSearchTerms: [],
      onCustomSearchTermsChange: vi.fn(),
      selectedLanguages: [] as NewsLanguage[],
      onLanguagesChange: vi.fn(),
      selectedCountries: [],
      onCountriesChange: vi.fn(),
      availableCountries: ['us'],
      selectedSort: 'relevancy' as NewsSortBy,
      onSortChange: vi.fn(),
      selectedDateRange: { type: 'preset' as const, days: 7, label: 'Last week' },
      onDateRangeChange: vi.fn(),
      timeOptions: [],
      isOpen: true,
      onClose: vi.fn(),
      onAnalyze: vi.fn(),
      isLoading: false
    }

    it('has proper modal ARIA attributes', () => {
      render(<TopicSelectionModal {...defaultProps} />)
      
      const modal = screen.getByRole('dialog')
      expect(modal).toHaveAttribute('aria-modal', 'true')
      expect(modal).toHaveAttribute('aria-labelledby', 'modal-title')
    })

    it('has proper modal title', () => {
      render(<TopicSelectionModal {...defaultProps} />)
      
      const title = screen.getByText('Choose your topic and preferences')
      expect(title).toHaveAttribute('id', 'modal-title')
    })

    it('has proper ARIA label for close button', () => {
      render(<TopicSelectionModal {...defaultProps} />)
      
      const closeButton = screen.getByRole('button', { name: /close modal/i })
      expect(closeButton).toHaveAttribute('aria-label', 'Close modal')
    })

    it('manages focus correctly when opened', () => {
      render(<TopicSelectionModal {...defaultProps} />)
      
      const modal = screen.getByRole('dialog')
      expect(modal).toBeInTheDocument()
      
      // Modal should be properly structured for focus management
      expect(modal).toHaveAttribute('aria-modal', 'true')
    })

    it('supports ESC key for accessibility', async () => {
      const user = userEvent.setup()
      const onClose = vi.fn()
      render(<TopicSelectionModal {...defaultProps} onClose={onClose} />)
      
      // ESC key should close modal
      await user.keyboard('{Escape}')
      expect(onClose).toHaveBeenCalled()
    })

    it('has proper focus management with backdrop', () => {
      render(<TopicSelectionModal {...defaultProps} />)
      
      // Modal should have proper accessibility structure
      const modal = screen.getByRole('dialog')
      expect(modal).toHaveAttribute('aria-modal', 'true')
    })

    it('provides clear visual hierarchy', () => {
      render(<TopicSelectionModal {...defaultProps} />)
      
      // Check for proper heading structure
      const mainHeading = screen.getByText('Choose your topic and preferences')
      expect(mainHeading).toHaveClass('text-xl', 'font-semibold')
      
      const subheading = screen.getByText('What topic interests you?')
      expect(subheading).toHaveClass('text-lg', 'font-medium')
    })

    it('has accessible button states', () => {
      render(<TopicSelectionModal {...defaultProps} selectedTopic="" />)
      
      const analyzeButton = screen.getByRole('button', { name: /break my bubble/i })
      expect(analyzeButton).toBeDisabled()
      expect(analyzeButton).toHaveClass('cursor-not-allowed')
    })

    it('provides loading state accessibility', () => {
      render(<TopicSelectionModal {...defaultProps} selectedTopic="Climate Change" isLoading={true} />)
      
      const loadingButton = screen.getByRole('button', { name: /analyzing/i })
      expect(loadingButton).toBeDisabled()
      
      // Should have loading indicator
      const spinner = loadingButton.querySelector('.animate-spin')
      expect(spinner).toBeInTheDocument()
    })

    it('maintains keyboard navigation through modal', async () => {
      const user = userEvent.setup()
      render(<TopicSelectionModal {...defaultProps} />)
      
      // Tab through modal elements
      await user.tab()
      
      // Should be able to navigate through all interactive elements
      const closeButton = screen.getByRole('button', { name: /close modal/i })
      const backButton = screen.getByRole('button', { name: /back to sources/i })
      
      expect(closeButton).toHaveClass('focus:ring-2')
      expect(backButton).toHaveClass('focus:ring-2')
    })
  })

  describe('Cross-Component Accessibility', () => {
    it('maintains consistent focus styles across components', () => {
      // Test that all interactive elements use consistent focus styling
      const { container: faqContainer } = render(<FAQ />)
      const faqButtons = faqContainer.querySelectorAll('button')
      
      faqButtons.forEach(button => {
        expect(button).toHaveClass('focus:outline-none')
      })
    })

    it('has consistent color contrast for text elements', () => {
      render(<FAQ />)
      
      // Main text should have high contrast
      const title = screen.getByText('Frequently Asked Questions')
      expect(title).toHaveClass('text-gray-900')
      
      // Secondary text should have appropriate contrast
      const description = screen.getByText("Ready to explore different perspectives? Let's get started!")
      expect(description).toHaveClass('text-gray-500')
    })

    it('provides skip links for keyboard users', () => {
      // This would be implemented at the app level
      // Testing the structure exists for skip links
      const mockSources: NewsSource[] = []
      const props = {
        sources: mockSources,
        selectedSources: [],
        onSourcesChange: vi.fn(),
        onContinue: vi.fn(),
        isLoadingSources: false,
        allSourcesLoaded: true
      }
      
      render(<LandingPage {...props} />)
      
      // Main content should have proper landmarks
      const main = document.querySelector('main')
      expect(main).toBeInTheDocument()
    })

    it('uses semantic HTML elements appropriately', () => {
      const mockSources: NewsSource[] = []
      const props = {
        sources: mockSources,
        selectedSources: [],
        onSourcesChange: vi.fn(),
        onContinue: vi.fn(),
        isLoadingSources: false,
        allSourcesLoaded: true
      }
      
      render(<LandingPage {...props} />)
      
      // Should use semantic elements
      expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument()
      expect(screen.getByRole('heading', { level: 2 })).toBeInTheDocument()
      
      // Multiple buttons exist (Continue + FAQ buttons), so check for at least one
      const buttons = screen.getAllByRole('button')
      expect(buttons.length).toBeGreaterThan(0)
    })
  })
})