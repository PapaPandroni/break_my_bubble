import { useEffect, useRef, useCallback, useMemo } from 'react'
import { TopicKeywords, NewsLanguage, NewsSortBy } from '../types'
import { DateRange } from './DateRangePicker'
import TopicSelector from './TopicSelector'
import FilterPanel from './FilterPanel'

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

  // Enhanced cleanup function to prevent memory leaks
  const cleanupModal = useCallback(() => {
    try {
      // Remove event listeners with null checks
      if (typeof document !== 'undefined') {
        document.removeEventListener('keydown', handleKeyDown)
      }
      
      // Reset body overflow with error handling
      if (typeof document !== 'undefined' && document.body) {
        document.body.style.overflow = 'unset'
      }
      
      // Return focus to the element that opened the modal
      if (previousFocusRef.current && typeof previousFocusRef.current.focus === 'function') {
        try {
          previousFocusRef.current.focus()
        } catch (error) {
          console.warn('Failed to return focus to previous element:', error)
        }
      }
    } catch (error) {
      console.warn('Error during modal cleanup:', error)
    }
  }, [])

  // Combined keyboard event handler
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      onClose()
    } else if (event.key === 'Tab') {
      handleTabNavigation(event)
    }
  }, [onClose, handleTabNavigation])

  // Modal lifecycle management
  useEffect(() => {
    if (isOpen) {
      // Store the currently focused element before opening modal
      previousFocusRef.current = document.activeElement as HTMLElement
      
      // Add event listeners
      document.addEventListener('keydown', handleKeyDown)
      
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden'
      
      // Set initial focus after a brief delay to ensure DOM is ready
      const timeoutId = setTimeout(() => {
        const focusableElements = getFocusableElements()
        if (focusableElements.length > 0) {
          focusableElements[0].focus()
        }
      }, 100)
      
      return () => {
        clearTimeout(timeoutId)
        cleanupModal()
      }
    } else {
      // Ensure cleanup runs when modal closes
      cleanupModal()
    }
  }, [isOpen, handleKeyDown, getFocusableElements, cleanupModal])

  // Cleanup on component unmount
  useEffect(() => {
    return () => {
      cleanupModal()
    }
  }, [cleanupModal])

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
      <div className="flex min-h-full items-center justify-center p-4">
        {/* Modal Content */}
        <div 
          ref={modalRef}
          className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl transform transition-all"
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
              className="text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-4 focus:ring-gray-200 rounded-xl p-3 hover:bg-white hover:shadow-soft transition-all duration-200"
              aria-label="Close modal"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="p-8 space-y-10 max-h-[70vh] overflow-y-auto">
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
              
              {/* Always-visible Custom Search Input */}
              <div className="max-w-2xl mx-auto">
                <div className="relative group">
                  <input
                    type="text"
                    placeholder="artificial intelligence, climate policy, economic trends..."
                    value={customSearchTerms.join(', ')}
                    onChange={(e) => {
                      const terms = e.target.value
                        .split(/[,\s]+/)
                        .map(term => term.trim().toLowerCase())
                        .filter(term => term.length > 0)
                        .slice(0, 10);
                      onCustomSearchTermsChange(terms);
                      if (terms.length > 0) {
                        onTopicChange('Custom Search');
                      }
                    }}
                    className="w-full px-6 py-4 text-lg bg-white border-2 border-gray-200 rounded-2xl shadow-glow-purple focus:outline-none focus:border-secondary-400 focus:shadow-glow-purple transition-all duration-300 placeholder-gray-400"
                  />
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-secondary-500/20 to-primary-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"></div>
                </div>
                
                {/* Search Terms Display */}
                {customSearchTerms.length > 0 && (
                  <div className="mt-4 flex flex-wrap justify-center gap-2">
                    {customSearchTerms.map((term, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-3 py-1.5 bg-secondary-100 text-secondary-800 text-sm rounded-full font-medium"
                      >
                        {term}
                        <button
                          onClick={() => {
                            const newTerms = customSearchTerms.filter((_, i) => i !== index);
                            onCustomSearchTermsChange(newTerms);
                            if (newTerms.length === 0) {
                              onTopicChange('');
                            }
                          }}
                          className="ml-2 text-secondary-600 hover:text-secondary-800 focus:outline-none"
                        >
                          ×
                        </button>
                      </span>
                    ))}
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
            <div className="space-y-4">
              <TopicSelector
                topics={topics}
                selectedTopic={selectedTopic}
                onTopicChange={onTopicChange}
              />
            </div>

            {/* Filter Panel */}
            <div>
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
              className="px-6 py-3 text-sm font-medium text-gray-600 hover:text-gray-800 focus:outline-none focus:ring-4 focus:ring-gray-200 focus:ring-offset-2 rounded-xl transition-all duration-200 hover:bg-white hover:shadow-soft"
            >
              ← Back to sources
            </button>
            
            <div className="flex items-center space-x-4">
              {!canAnalyze && (
                <p className="text-sm text-gray-500 font-medium">
                  Enter a search term or select a topic
                </p>
              )}
              
              <button
                onClick={handleAnalyze}
                disabled={!canAnalyze || isLoading}
                className={`px-10 py-4 text-lg font-bold rounded-2xl transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-offset-2 transform ${
                  canAnalyze && !isLoading
                    ? 'bg-gradient-to-r from-primary-600 to-secondary-600 text-white hover:from-primary-700 hover:to-secondary-700 shadow-strong hover:shadow-glow hover:scale-105 hover:-translate-y-0.5 focus:ring-primary-200'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed shadow-soft'
                }`}
              >
                {isLoading ? (
                  <div className="flex items-center space-x-3">
                    <div className="animate-spin w-6 h-6 border-3 border-white border-t-transparent rounded-full"></div>
                    <span>Analyzing...</span>
                  </div>
                ) : (
                  <span className="flex items-center space-x-2">
                    <span>BREAK MY BUBBLE</span>
                    <span className="text-xl">🎯</span>
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