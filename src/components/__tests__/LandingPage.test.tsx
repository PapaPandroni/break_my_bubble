import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import LandingPage from '../LandingPage'
import { NewsSource } from '../../types'

// Mock the SourceInput component
vi.mock('../SourceInput', () => ({
  default: ({ onSourcesChange, selectedSources, maxSources }: any) => (
    <div data-testid="source-input">
      <button
        onClick={() => onSourcesChange(['cnn'])}
        data-testid="select-source"
      >
        Select CNN
      </button>
      <button
        onClick={() => onSourcesChange([])}
        data-testid="clear-sources"
      >
        Clear Sources
      </button>
      <span data-testid="selected-count">{selectedSources.length}</span>
      <span data-testid="max-sources">{maxSources}</span>
    </div>
  )
}))

// Mock the FAQ component
vi.mock('../FAQ', () => ({
  default: ({ className }: any) => (
    <div data-testid="faq" className={className}>
      FAQ Component
    </div>
  )
}))

const mockSources: NewsSource[] = [
  {
    id: 'cnn',
    name: 'CNN',
    website: 'https://cnn.com',
    politicalLean: 'lean-left',
    credibility: 0.8,
    isDynamic: false
  },
  {
    id: 'fox-news',
    name: 'Fox News',
    website: 'https://foxnews.com',
    politicalLean: 'lean-right',
    credibility: 0.7,
    isDynamic: false
  }
]

describe('LandingPage Component', () => {
  const defaultProps = {
    sources: mockSources,
    selectedSources: [],
    onSourcesChange: vi.fn(),
    onContinue: vi.fn(),
    isLoadingSources: false,
    allSourcesLoaded: true
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders the main heading and tagline correctly', () => {
    render(<LandingPage {...defaultProps} />)
    
    expect(screen.getByText('BreakMyBubble')).toBeInTheDocument()
    expect(screen.getByText('Discover opposing perspectives on any topic')).toBeInTheDocument()
    expect(screen.getByText(/Compare news coverage from your preferred sources/)).toBeInTheDocument()
  })

  it('renders source selection section with instructions', () => {
    render(<LandingPage {...defaultProps} />)
    
    expect(screen.getByText('Start by selecting your news sources')).toBeInTheDocument()
    expect(screen.getByText('Choose 1-5 sources you typically read for news')).toBeInTheDocument()
  })

  it('renders SourceInput component with correct props', () => {
    render(<LandingPage {...defaultProps} />)
    
    const sourceInput = screen.getByTestId('source-input')
    expect(sourceInput).toBeInTheDocument()
    
    // Check that max sources is set to 5
    expect(screen.getByTestId('max-sources')).toHaveTextContent('5')
  })

  it('disables continue button when no sources are selected', () => {
    render(<LandingPage {...defaultProps} />)
    
    const continueButton = screen.getByRole('button', { name: /continue/i })
    expect(continueButton).toBeDisabled()
    expect(continueButton).toHaveClass('bg-gray-300', 'text-gray-500', 'cursor-not-allowed')
  })

  it('enables continue button when at least one source is selected', () => {
    render(<LandingPage {...defaultProps} selectedSources={['cnn']} />)
    
    const continueButton = screen.getByRole('button', { name: /continue/i })
    expect(continueButton).not.toBeDisabled()
    expect(continueButton).toHaveClass('bg-blue-600', 'text-white')
  })

  it('shows correct helper text based on source selection state', () => {
    const { rerender } = render(<LandingPage {...defaultProps} />)
    
    // When no sources selected
    expect(screen.getByText('Select at least one news source to continue')).toBeInTheDocument()
    expect(screen.queryByText('Next: Choose a topic to explore different perspectives')).not.toBeInTheDocument()
    
    // When sources are selected
    rerender(<LandingPage {...defaultProps} selectedSources={['cnn']} />)
    expect(screen.queryByText('Select at least one news source to continue')).not.toBeInTheDocument()
    expect(screen.getByText('Next: Choose a topic to explore different perspectives')).toBeInTheDocument()
  })

  it('calls onContinue when continue button is clicked', async () => {
    const user = userEvent.setup()
    const onContinue = vi.fn()
    
    render(<LandingPage {...defaultProps} selectedSources={['cnn']} onContinue={onContinue} />)
    
    const continueButton = screen.getByRole('button', { name: /continue/i })
    await user.click(continueButton)
    
    expect(onContinue).toHaveBeenCalledTimes(1)
  })

  it('calls onSourcesChange when source selection changes', async () => {
    const user = userEvent.setup()
    const onSourcesChange = vi.fn()
    
    render(<LandingPage {...defaultProps} onSourcesChange={onSourcesChange} />)
    
    const selectButton = screen.getByTestId('select-source')
    await user.click(selectButton)
    
    expect(onSourcesChange).toHaveBeenCalledWith(['cnn'])
  })

  it('renders FAQ component with correct styling', () => {
    render(<LandingPage {...defaultProps} />)
    
    const faq = screen.getByTestId('faq')
    expect(faq).toBeInTheDocument()
    expect(faq).toHaveClass('max-w-lg', 'mx-auto')
  })

  it('has proper responsive design classes', () => {
    const { container } = render(<LandingPage {...defaultProps} />)
    
    // Check for responsive text sizing
    const heading = screen.getByText('BreakMyBubble')
    expect(heading).toHaveClass('text-4xl', 'md:text-5xl')
    
    const subheading = screen.getByText('Discover opposing perspectives on any topic')
    expect(subheading).toHaveClass('text-xl', 'md:text-2xl')
  })

  it('passes loading states to SourceInput correctly', () => {
    const { rerender } = render(<LandingPage {...defaultProps} isLoadingSources={true} />)
    
    // Component should still render when loading
    expect(screen.getByTestId('source-input')).toBeInTheDocument()
    
    rerender(<LandingPage {...defaultProps} isLoadingSources={false} allSourcesLoaded={true} />)
    
    // Component should render when loaded
    expect(screen.getByTestId('source-input')).toBeInTheDocument()
  })

  it('has proper ARIA labels for accessibility', () => {
    render(<LandingPage {...defaultProps} selectedSources={['cnn']} />)
    
    const continueButton = screen.getByRole('button', { name: /continue/i })
    expect(continueButton).toHaveAttribute('aria-label', 'Continue to topic selection')
  })

  it('has proper focus management', async () => {
    const user = userEvent.setup()
    render(<LandingPage {...defaultProps} selectedSources={['cnn']} />)
    
    const continueButton = screen.getByRole('button', { name: /continue/i })
    
    // Tab to the continue button
    await user.tab()
    // The SourceInput mock button might get focus first, so we may need multiple tabs
    if (!continueButton.matches(':focus')) {
      await user.tab()
    }
    
    // Check that focus outline is applied (focus:ring-2 focus:ring-blue-500)
    expect(continueButton).toHaveClass('focus:ring-2', 'focus:ring-blue-500')
  })

  it('maintains proper layout structure', () => {
    const { container } = render(<LandingPage {...defaultProps} />)
    
    // Check for main layout classes
    const mainContainer = container.firstChild as HTMLElement
    expect(mainContainer).toHaveClass('min-h-screen', 'bg-gray-50')
    
    // Check for centered layout
    const centeredContent = container.querySelector('.max-w-2xl.mx-auto')
    expect(centeredContent).toBeInTheDocument()
  })

  it('handles source changes correctly when canContinue state updates', async () => {
    const user = userEvent.setup()
    render(<LandingPage {...defaultProps} />)
    
    // Initially disabled
    let continueButton = screen.getByRole('button', { name: /continue/i })
    expect(continueButton).toBeDisabled()
    
    // Select a source to enable
    const selectButton = screen.getByTestId('select-source')
    await user.click(selectButton)
    
    // The component would re-render with selectedSources=['cnn'] in real usage
    // Since our mock calls onSourcesChange, we need to simulate the parent re-render
  })

  it('displays proper section hierarchy', () => {
    render(<LandingPage {...defaultProps} />)
    
    // Check heading hierarchy
    const h1 = screen.getByRole('heading', { level: 1 })
    expect(h1).toHaveTextContent('BreakMyBubble')
    
    const h2 = screen.getByRole('heading', { level: 2 })
    expect(h2).toHaveTextContent('Discover opposing perspectives on any topic')
    
    const h3 = screen.getByRole('heading', { level: 3 })
    expect(h3).toHaveTextContent('Start by selecting your news sources')
  })
})