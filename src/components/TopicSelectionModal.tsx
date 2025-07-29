import { useEffect, useRef, useCallback, useMemo, useState } from 'react'
import { TopicKeywords, NewsLanguage, NewsSortBy } from '../types'
import { DateRange } from './DateRangePicker'
import TopicSelector from './TopicSelector'
import FilterPanel from './FilterPanel'
import { manageFocus, screenReader, announceToScreenReader } from '../utils/accessibility'
import { validateSearchTerm, sanitizeSearchTerms } from '../utils/helpers'

interface TopicSelectionModalProps {
  // Topic selection
  topics: TopicKeywords[]
  selectedTopic: string
  onTopicChange: (topic: string) => void
  customSearchTerms: string[]
  onCustomSearchTermsChange: (terms: string[]) => void
  
  // Filter options
  selectedLanguages: NewsLanguage[]
  onLanguagesChange: (languages: NewsLanguage[]) => void
  selectedCountries: string[]
  onCountriesChange: (countries: string[]) => void
  availableCountries: string[]
  selectedSort: NewsSortBy
  onSortChange: (sort: NewsSortBy) => void
  selectedDateRange: DateRange
  onDateRangeChange: (dateRange: DateRange) => void
  timeOptions: { value: number; label: string; days: number }[]
  
  // Modal controls
  isOpen: boolean
  onClose: () => void
  onAnalyze: () => void
  
  // State
  isLoading: boolean
}

export default function TopicSelectionModal({
  topics,
  selectedTopic,
  onTopicChange,
  customSearchTerms,
  onCustomSearchTermsChange,
  selectedLanguages,
  onLanguagesChange,
  selectedCountries,
  onCountriesChange,
  availableCountries,
  selectedSort,
  onSortChange,
  selectedDateRange,
  onDateRangeChange,
  timeOptions,
  isOpen,
  onClose,
  onAnalyze,
  isLoading
}: TopicSelectionModalProps) {
  // Refs for focus management
  const modalRef = useRef<HTMLDivElement>(null)
  const previousFocusRef = useRef<HTMLElement | null>(null)
  const firstFocusableRef = useRef<HTMLElement | null>(null)
  const lastFocusableRef = useRef<HTMLElement | null>(null)
  
  // Local state for custom search input to prevent focus loss
  const [customSearchInput, setCustomSearchInput] = useState('')
  
  // Initialize local input state from props
  useEffect(() => {
    setCustomSearchInput(customSearchTerms.join(', '))
  }, [customSearchTerms])
  
  // Parse search terms without affecting input state
  const parseCustomSearchTerms = useCallback((value: string): string[] => {
    const rawTerms = value
      .split(/[,\s]+/)
      .map(term => term.trim())
      .filter(term => term.length > 0);
    
    const validTerms = rawTerms.filter(validateSearchTerm);
    const sanitizedTerms = sanitizeSearchTerms(validTerms).slice(0, 10);
    
    return sanitizedTerms;
  }, [])
  
  // Handle custom search input changes with auto-deselect topic
  const handleCustomSearchChange = useCallback((value: string) => {
    setCustomSearchInput(value)
    
    const parsedTerms = parseCustomSearchTerms(value)
    
    // If user starts typing and has a topic selected, deselect it
    if (value.trim() && selectedTopic && selectedTopic !== 'Custom Search') {
      onTopicChange('')
    }
    
    // Update parent state
    onCustomSearchTermsChange(parsedTerms)
    
    // Set to custom search if we have terms
    if (parsedTerms.length > 0) {
      onTopicChange('Custom Search')
    } else if (!value.trim()) {
      // Clear topic selection if input is empty
      onTopicChange('')
    }
  }, [selectedTopic, onTopicChange, onCustomSearchTermsChange, parseCustomSearchTerms])
  // Get all focusable elements within the modal
  const getFocusableElements = useCallback((): HTMLElement[] => {
    if (!modalRef.current) return []
    
    const focusableSelectors = [
      'button:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      'a[href]',
      '[tabindex]:not([tabindex="-1"])'
    ].join(', ')
    
    return Array.from(modalRef.current.querySelectorAll(focusableSelectors)) as HTMLElement[]
  }, [])

  // Handle focus trap within modal
  const handleTabNavigation = useCallback((event: KeyboardEvent) => {
    if (event.key !== 'Tab') return
    
    const focusableElements = getFocusableElements()
    if (focusableElements.length === 0) return
    
    const firstElement = focusableElements[0]
    const lastElement = focusableElements[focusableElements.length - 1]
    
    // Store references for focus management
    firstFocusableRef.current = firstElement
    lastFocusableRef.current = lastElement
    
    if (event.shiftKey) {
      // Shift + Tab: moving backwards
      if (document.activeElement === firstElement) {
        event.preventDefault()
        lastElement.focus()
      }
    } else {
      // Tab: moving forwards
      if (document.activeElement === lastElement) {
        event.preventDefault()
        firstElement.focus()
      }
    }
  }, [getFocusableElements])

  // Enhanced modal lifecycle management with accessibility improvements
  useEffect(() => {
    if (!isOpen) return

    // Store the currently focused element before opening modal
    previousFocusRef.current = document.activeElement as HTMLElement
    
    // Announce modal opening to screen readers
    screenReader.announceModal(true, 'Search the news')
    
    // Create event handler inside useEffect to avoid stale closures
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      } else if (event.key === 'Tab') {
        handleTabNavigation(event)
      }
    }
    
    // Add event listeners
    document.addEventListener('keydown', handleKeyDown)
    
    // Prevent body scroll when modal is open
    document.body.style.overflow = 'hidden'
    
    // Set initial focus immediately using requestAnimationFrame for better timing
    const focusInitial = () => {
      const focusableElements = getFocusableElements()
      if (focusableElements.length > 0) {
        manageFocus.focusElement(focusableElements[0])
      }
    }
    
    // Use requestAnimationFrame for better timing than setTimeout
    const animationFrameId = requestAnimationFrame(focusInitial)
    
    // Cleanup function
    return () => {
      cancelAnimationFrame(animationFrameId)
      
      // Remove event listeners
      document.removeEventListener('keydown', handleKeyDown)
      
      // Reset body overflow
      if (document.body) {
        document.body.style.overflow = 'unset'
      }
      
      // Announce modal closing to screen readers
      screenReader.announceModal(false, 'Search the news')
      
      // Return focus to the element that opened the modal with verification
      if (previousFocusRef.current && typeof previousFocusRef.current.focus === 'function') {
        try {
          manageFocus.focusElement(previousFocusRef.current)
          
          // Verify focus was successfully restored
          requestAnimationFrame(() => {
            if (document.activeElement !== previousFocusRef.current) {
              // Fallback: focus first focusable element in body
              const fallbackElement = document.querySelector('button, input, select, textarea, a[href], [tabindex]:not([tabindex="-1"])') as HTMLElement
              if (fallbackElement) {
                manageFocus.focusElement(fallbackElement)
              }
            }
          })
        } catch (error) {
          console.warn('Failed to return focus to previous element:', error)
        }
      }
    }
  }, [isOpen, onClose, handleTabNavigation, getFocusableElements])

  // Memoize complex calculation to prevent unnecessary re-computation
  const canAnalyze = useMemo(() => {
    return selectedTopic && (
      (selectedTopic !== 'Custom Search') ||
      (selectedTopic === 'Custom Search' && customSearchTerms.length > 0)
    )
  }, [selectedTopic, customSearchTerms.length])

  // Memoize event handlers
  const handleAnalyze = useCallback(() => {
    if (canAnalyze && !isLoading) {
      onAnalyze()
    }
  }, [canAnalyze, isLoading, onAnalyze])

  const handleClose = useCallback(() => {
    onClose()
  }, [onClose])

  const handleBackdropClick = useCallback(() => {
    onClose()
  }, [onClose])

  const handleModalClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
  }, [])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={handleBackdropClick}
        aria-hidden="true"
      />
      
      {/* Modal Container */}
      <div className="flex min-h-full items-center justify-center p-2 sm:p-4">
        {/* Modal Content */}
        <div 
          ref={modalRef}
          className="relative w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-2xl xl:max-w-4xl bg-white rounded-2xl shadow-2xl transform transition-all"
          onClick={handleModalClick}
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
          aria-describedby="modal-description"
        >
          {/* Enhanced Header */}
          <div className="flex items-center justify-between p-8 border-b border-gray-100 bg-gradient-to-r from-white to-gray-50">
            <div>
              <h2 id="modal-title" className="text-2xl font-bold text-gray-900">
                Search the news
              </h2>
              <p className="text-gray-600 text-sm mt-1">Choose what you'd like to analyze</p>
            </div>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-4 focus:ring-primary-200 focus:ring-offset-2 rounded-xl p-3 hover:bg-white hover:shadow-soft transition-all duration-200 min-w-[44px] min-h-[44px] flex items-center justify-center"
              aria-label="Close search dialog"
              title="Close search dialog"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="p-4 sm:p-6 md:p-8 space-y-6 sm:space-y-8 md:space-y-10 max-h-[80vh] sm:max-h-[75vh] md:max-h-[70vh] overflow-y-auto">
            {/* Custom Search Hero Section */}
            <div className="text-center space-y-6">
              <div className="space-y-3">
                <h3 className="text-2xl md:text-3xl font-semibold text-gray-900">
                  What would you like to search?
                </h3>
                <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                  Enter any topic or choose from popular options below
                </p>
              </div>
              
              {/* Always-visible Custom Search Input with enhanced accessibility */}
              <div className="max-w-2xl mx-auto">
                <label htmlFor="topic-search-input" className="sr-only">
                  Enter search topics or keywords
                </label>
                <div className="relative group">
                  <input
                    id="topic-search-input"
                    type="text"
                    placeholder="artificial intelligence, climate policy, economic trends..."
                    value={customSearchInput}
                    onChange={(e) => handleCustomSearchChange(e.target.value)}
                    className="w-full px-6 py-4 text-lg bg-white border-2 border-gray-200 rounded-2xl shadow-glow-purple focus:outline-none focus:border-secondary-400 focus:shadow-glow-purple focus:ring-4 focus:ring-secondary-200 focus:ring-offset-2 transition-all duration-300 placeholder-gray-400 min-h-[56px]"
                    aria-describedby="search-help-text"
                    autoComplete="off"
                  />
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-secondary-500/20 to-primary-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"></div>
                </div>
                <div id="search-help-text" className="text-sm text-gray-600 mt-2 text-center">
                  Separate multiple topics with commas or spaces. Maximum 10 terms.
                </div>
                
                {/* Search Terms Display with enhanced accessibility */}
                {customSearchTerms.length > 0 && (
                  <div className="mt-4">
                    <div className="sr-only" aria-live="polite">
                      {customSearchTerms.length} search term{customSearchTerms.length === 1 ? '' : 's'} entered: {customSearchTerms.join(', ')}
                    </div>
                    <div className="flex flex-wrap justify-center gap-2" role="list" aria-label="Selected search terms">
                      {customSearchTerms.map((term, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-3 py-1.5 bg-secondary-100 text-secondary-800 text-sm rounded-full font-medium"
                          role="listitem"
                        >
                          {term}
                          <button
                            onClick={() => {
                              const newTerms = customSearchTerms.filter((_, i) => i !== index);
                              const newInputValue = newTerms.join(', ');
                              setCustomSearchInput(newInputValue);
                              onCustomSearchTermsChange(newTerms);
                              if (newTerms.length === 0) {
                                onTopicChange('');
                              }
                              announceToScreenReader(`Removed search term: ${term}`, 'polite');
                            }}
                            className="ml-2 text-secondary-600 hover:text-secondary-800 focus:outline-none focus:ring-2 focus:ring-secondary-400 focus:ring-offset-1 rounded-full min-w-[44px] min-h-[44px] flex items-center justify-center"
                            aria-label={`Remove search term: ${term}`}
                            title={`Remove ${term}`}
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-6 bg-white text-gray-500 flex items-center">
                  <span className="text-base mr-2">⚡</span>
                  Popular topics
                </span>
              </div>
            </div>

            {/* Topic Selection - Now Secondary */}
            <div className="space-y-4" id="topic-selection">
              <h4 className="text-lg font-semibold text-gray-900 text-center mb-4">Quick Topic Selection</h4>
              <TopicSelector
                topics={topics}
                selectedTopic={selectedTopic}
                onTopicChange={onTopicChange}
              />
            </div>

            {/* Filter Panel */}
            <div id="filter-panel">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Advanced Filters</h4>
              <FilterPanel
                selectedLanguages={selectedLanguages}
                onLanguagesChange={onLanguagesChange}
                selectedCountries={selectedCountries}
                onCountriesChange={onCountriesChange}
                availableCountries={availableCountries}
                selectedSort={selectedSort}
                onSortChange={onSortChange}
                selectedDateRange={selectedDateRange}
                onDateRangeChange={onDateRangeChange}
                timeOptions={timeOptions}
              />
            </div>
          </div>

          {/* Enhanced Footer */}
          <div className="flex items-center justify-between p-8 border-t border-gray-100 bg-gradient-to-r from-gray-50 to-white rounded-b-2xl">
            <button
              onClick={handleClose}
              className="px-6 py-3 text-sm font-medium text-gray-600 hover:text-gray-800 focus:outline-none focus:ring-4 focus:ring-gray-200 focus:ring-offset-2 rounded-xl transition-all duration-200 hover:bg-white hover:shadow-soft min-h-[44px] flex items-center"
              aria-label="Go back to source selection"
            >
              <span aria-hidden="true">←</span>
              <span className="ml-2">Back to sources</span>
            </button>
            
            <div className="flex items-center space-x-4">
              {!canAnalyze && (
                <p id="analyze-button-help" className="text-sm text-gray-500 font-medium" role="status">
                  Enter a search term or select a topic to continue
                </p>
              )}
              
              <button
                onClick={handleAnalyze}
                disabled={!canAnalyze || isLoading}
                className={`px-10 py-4 text-lg font-bold rounded-2xl transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-offset-2 transform min-h-[56px] ${
                  canAnalyze && !isLoading
                    ? 'bg-gradient-to-r from-primary-600 to-secondary-600 text-white hover:from-primary-700 hover:to-secondary-700 shadow-strong hover:shadow-glow hover:scale-105 hover:-translate-y-0.5 focus:ring-primary-200'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed shadow-soft'
                }`}
                aria-describedby={!canAnalyze ? 'analyze-button-help' : undefined}
              >
                {isLoading ? (
                  <div className="flex items-center space-x-3">
                    <div className="animate-spin w-6 h-6 border-3 border-white border-t-transparent rounded-full" role="status" aria-label="Loading"></div>
                    <span>Analyzing...</span>
                  </div>
                ) : (
                  <span className="flex items-center space-x-2">
                    <span>BREAK MY BUBBLE</span>
                    <span className="text-xl" role="img" aria-label="target">🎯</span>
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}