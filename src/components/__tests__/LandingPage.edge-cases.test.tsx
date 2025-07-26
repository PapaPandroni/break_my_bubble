import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import LandingPage from '../LandingPage'
import { NewsSource } from '../../types'

// Mock components
vi.mock('../SourceInput', () => ({
  default: ({ onSourcesChange, selectedSources, maxSources, isLoading, allSourcesLoaded }: any) => (
    <div data-testid="source-input">
      <button
        onClick={() => onSourcesChange(['source1', 'source2', 'source3', 'source4', 'source5'])}
        data-testid="select-max-sources"
      >
        Select Max Sources
      </button>
      <button
        onClick={() => onSourcesChange(['invalid-source'])}
        data-testid="select-invalid-source"
      >
        Select Invalid Source
      </button>
      <span data-testid="loading-state">{isLoading ? 'loading' : 'loaded'}</span>
      <span data-testid="all-sources-loaded">{allSourcesLoaded ? 'true' : 'false'}</span>
      <span data-testid="max-sources">{maxSources}</span>
    </div>
  )
}))

vi.mock('../FAQ', () => ({
  default: () => <div data-testid="faq">FAQ</div>
}))

describe('LandingPage Edge Cases', () => {
  const mockSources: NewsSource[] = [
    {
      id: 'source1',
      name: 'Source 1',
      website: 'https://source1.com',
      politicalLean: 'left',
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

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('handles empty sources array gracefully', () => {
    render(<LandingPage {...defaultProps} sources={[]} />)
    
    expect(screen.getByText('BreakMyBubble')).toBeInTheDocument()
    expect(screen.getByTestId('source-input')).toBeInTheDocument()
  })

  it('handles loading state correctly', () => {
    render(<LandingPage {...defaultProps} isLoadingSources={true} allSourcesLoaded={false} />)
    
    expect(screen.getByTestId('loading-state')).toHaveTextContent('loading')
    expect(screen.getByTestId('all-sources-loaded')).toHaveTextContent('false')
  })

  it('handles maximum source selection (5 sources)', async () => {
    const user = userEvent.setup()
    const onSourcesChange = vi.fn()
    
    render(<LandingPage {...defaultProps} onSourcesChange={onSourcesChange} />)
    
    const selectMaxButton = screen.getByTestId('select-max-sources')
    await user.click(selectMaxButton)
    
    expect(onSourcesChange).toHaveBeenCalledWith(['source1', 'source2', 'source3', 'source4', 'source5'])
  })

  it('handles rapid clicking on continue button', async () => {
    const user = userEvent.setup()
    const onContinue = vi.fn()
    
    render(<LandingPage {...defaultProps} selectedSources={['source1']} onContinue={onContinue} />)
    
    const continueButton = screen.getByRole('button', { name: /continue/i })
    
    // Rapid clicks
    await user.click(continueButton)
    await user.click(continueButton)
    await user.click(continueButton)
    
    expect(onContinue).toHaveBeenCalledTimes(3)
  })

  it('handles keyboard navigation properly', async () => {
    const user = userEvent.setup()
    const onContinue = vi.fn()
    
    render(<LandingPage {...defaultProps} selectedSources={['source1']} onContinue={onContinue} />)
    
    const continueButton = screen.getByRole('button', { name: /continue/i })
    
    // Focus button directly since mocked components might interfere with tab order
    continueButton.focus()
    await user.keyboard('{Enter}')
    
    expect(onContinue).toHaveBeenCalledTimes(1)
  })

  it('handles very long source names in responsive layout', () => {
    const longNameSources: NewsSource[] = [
      {
        id: 'very-long-source-name',
        name: 'This is a very long news source name that might cause layout issues in responsive design',
        website: 'https://verylongnewssourcename.com',
        politicalLean: 'center',
        credibility: 0.7,
        isDynamic: true
      }
    ]
    
    render(<LandingPage {...defaultProps} sources={longNameSources} />)
    
    // Component should still render without breaking
    expect(screen.getByText('BreakMyBubble')).toBeInTheDocument()
  })

  it('handles null/undefined callbacks gracefully', () => {
    const propsWithNullCallbacks = {
      ...defaultProps,
      onSourcesChange: undefined as any,
      onContinue: undefined as any
    }
    
    // Should not crash even with undefined callbacks
    expect(() => {
      render(<LandingPage {...propsWithNullCallbacks} />)
    }).not.toThrow()
  })

  it('maintains accessibility with dynamic content changes', () => {
    const { rerender } = render(<LandingPage {...defaultProps} selectedSources={[]} />)
    
    // Check initial state
    const continueButton = screen.getByRole('button', { name: /continue/i })
    expect(continueButton).toHaveAttribute('aria-label', 'Continue to topic selection')
    
    // Check after source selection
    rerender(<LandingPage {...defaultProps} selectedSources={['source1']} />)
    const updatedContinueButton = screen.getByRole('button', { name: /continue/i })
    expect(updatedContinueButton).toHaveAttribute('aria-label', 'Continue to topic selection')
  })

  it('handles sources with special characters in names', () => {
    const specialCharSources: NewsSource[] = [
      {
        id: 'special-chars',
        name: 'News & "Opinion" Today (2024)',
        website: 'https://news-opinion.com',
        politicalLean: 'center',
        credibility: 0.8,
        isDynamic: false
      }
    ]
    
    render(<LandingPage {...defaultProps} sources={specialCharSources} />)
    
    expect(screen.getByText('BreakMyBubble')).toBeInTheDocument()
  })

  it('handles window resize events properly', () => {
    render(<LandingPage {...defaultProps} />)
    
    // Simulate mobile viewport
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 375,
    })
    
    window.dispatchEvent(new Event('resize'))
    
    // Component should still be functional
    expect(screen.getByText('BreakMyBubble')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /continue/i })).toBeInTheDocument()
  })

  it('handles focus management during state transitions', async () => {
    const user = userEvent.setup()
    const { rerender } = render(<LandingPage {...defaultProps} selectedSources={[]} />)
    
    const continueButton = screen.getByRole('button', { name: /continue/i })
    
    // Focus the disabled button
    await user.tab()
    
    // Update to enable the button
    rerender(<LandingPage {...defaultProps} selectedSources={['source1']} />)
    
    // Button should still be focusable
    const enabledButton = screen.getByRole('button', { name: /continue/i })
    expect(enabledButton).not.toBeDisabled()
  })

  it('handles multiple re-renders without memory leaks', () => {
    const { rerender } = render(<LandingPage {...defaultProps} />)
    
    // Multiple rapid re-renders
    for (let i = 0; i < 10; i++) {
      rerender(<LandingPage {...defaultProps} selectedSources={[`source${i}`]} />)
    }
    
    // Component should still be functional
    expect(screen.getByText('BreakMyBubble')).toBeInTheDocument()
  })

  it('handles sources with missing or invalid data', () => {
    const invalidSources: NewsSource[] = [
      {
        id: '',
        name: '',
        website: '',
        politicalLean: 'unknown',
        credibility: 0,
        isDynamic: false
      }
    ]
    
    render(<LandingPage {...defaultProps} sources={invalidSources} />)
    
    // Should not crash with invalid source data
    expect(screen.getByText('BreakMyBubble')).toBeInTheDocument()
  })
})