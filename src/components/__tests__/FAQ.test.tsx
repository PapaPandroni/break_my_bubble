import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import FAQ from '../FAQ'

describe('FAQ Component', () => {
  it('renders FAQ title correctly', () => {
    render(<FAQ />)
    expect(screen.getByText('Frequently Asked Questions')).toBeInTheDocument()
  })

  it('renders all FAQ questions initially collapsed', () => {
    render(<FAQ />)
    
    // Check that all questions are present
    expect(screen.getByText('How does it work?')).toBeInTheDocument()
    expect(screen.getByText('Where do sources come from?')).toBeInTheDocument()
    expect(screen.getByText('How is political bias determined?')).toBeInTheDocument()
    expect(screen.getByText('What languages are supported?')).toBeInTheDocument()
    
    // Check that answers are not visible initially
    expect(screen.queryByText(/Simply select your preferred news sources/)).not.toBeInTheDocument()
    expect(screen.queryByText(/Our news sources are powered by NewsAPI.org/)).not.toBeInTheDocument()
  })

  it('expands and collapses FAQ items when clicked', async () => {
    const user = userEvent.setup()
    render(<FAQ />)
    
    const firstQuestion = screen.getByText('How does it work?')
    
    // Initially collapsed - answer should not be visible
    expect(screen.queryByText(/Simply select your preferred news sources/)).not.toBeInTheDocument()
    
    // Click to expand
    await user.click(firstQuestion)
    expect(screen.getByText(/Simply select your preferred news sources/)).toBeInTheDocument()
    
    // Click again to collapse
    await user.click(firstQuestion)
    expect(screen.queryByText(/Simply select your preferred news sources/)).not.toBeInTheDocument()
  })

  it('shows correct + and - icons based on expanded state', async () => {
    const user = userEvent.setup()
    render(<FAQ />)
    
    const questionButton = screen.getByRole('button', { name: /How does it work?/ })
    
    // Initially should show + icon
    expect(questionButton).toHaveTextContent('+')
    
    // After clicking, should show - icon
    await user.click(questionButton)
    expect(questionButton).toHaveTextContent('−')
    
    // After clicking again, should show + icon
    await user.click(questionButton)
    expect(questionButton).toHaveTextContent('+')
  })

  it('supports multiple expanded items simultaneously', async () => {
    const user = userEvent.setup()
    render(<FAQ />)
    
    // Expand first question
    await user.click(screen.getByText('How does it work?'))
    expect(screen.getByText(/Simply select your preferred news sources/)).toBeInTheDocument()
    
    // Expand second question
    await user.click(screen.getByText('Where do sources come from?'))
    expect(screen.getByText(/Our news sources are powered by NewsAPI.org/)).toBeInTheDocument()
    
    // Both answers should be visible
    expect(screen.getByText(/Simply select your preferred news sources/)).toBeInTheDocument()
    expect(screen.getByText(/Our news sources are powered by NewsAPI.org/)).toBeInTheDocument()
  })

  it('has proper ARIA attributes for accessibility', () => {
    render(<FAQ />)
    
    const buttons = screen.getAllByRole('button')
    
    buttons.forEach((button, index) => {
      expect(button).toHaveAttribute('aria-expanded', 'false')
      expect(button).toHaveAttribute('aria-controls', `faq-answer-${index}`)
    })
  })

  it('updates ARIA attributes when expanded', async () => {
    const user = userEvent.setup()
    render(<FAQ />)
    
    const firstButton = screen.getAllByRole('button')[0]
    
    // Initially collapsed
    expect(firstButton).toHaveAttribute('aria-expanded', 'false')
    
    // After clicking
    await user.click(firstButton)
    expect(firstButton).toHaveAttribute('aria-expanded', 'true')
  })

  it('applies custom className when provided', () => {
    const { container } = render(<FAQ className="custom-class" />)
    const faqContainer = container.firstChild as HTMLElement
    expect(faqContainer).toHaveClass('custom-class')
  })

  it('renders the footer message', () => {
    render(<FAQ />)
    expect(screen.getByText("Ready to explore different perspectives? Let's get started!")).toBeInTheDocument()
  })

  it('supports keyboard navigation', async () => {
    const user = userEvent.setup()
    render(<FAQ />)
    
    const firstButton = screen.getAllByRole('button')[0]
    
    // Focus the button
    await user.tab()
    expect(firstButton).toHaveFocus()
    
    // Press Enter to expand
    await user.keyboard('{Enter}')
    expect(screen.getByText(/Simply select your preferred news sources/)).toBeInTheDocument()
    
    // Press Enter again to collapse
    await user.keyboard('{Enter}')
    expect(screen.queryByText(/Simply select your preferred news sources/)).not.toBeInTheDocument()
  })

  it('has proper hover states', async () => {
    const user = userEvent.setup()
    render(<FAQ />)
    
    const firstButton = screen.getAllByRole('button')[0]
    
    // Check initial background
    expect(firstButton).toHaveClass('bg-white')
    
    // Hover should add hover:bg-gray-50 class (this is handled by CSS)
    await user.hover(firstButton)
    expect(firstButton).toHaveClass('hover:bg-gray-50')
  })

  it('contains all expected FAQ content', () => {
    render(<FAQ />)
    
    // Check for key content snippets from each FAQ item
    const questions = [
      'How does it work?',
      'Where do sources come from?', 
      'How is political bias determined?',
      'What languages are supported?'
    ]
    
    questions.forEach(question => {
      expect(screen.getByText(question)).toBeInTheDocument()
    })
  })
})