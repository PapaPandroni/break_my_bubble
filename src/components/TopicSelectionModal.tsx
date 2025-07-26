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
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div>
              <h2 id="modal-title" className="text-xl font-semibold text-gray-900">
                Choose a topic
              </h2>
            </div>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg p-2"
              aria-label="Close modal"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-8 max-h-[70vh] overflow-y-auto">
            {/* Topic Selection */}
            <div className="space-y-4">
              
              <TopicSelector
                topics={topics}
                selectedTopic={selectedTopic}
                onTopicChange={onTopicChange}
                customSearchTerms={customSearchTerms}
                onCustomSearchTermsChange={onCustomSearchTermsChange}
              />
            </div>

            {/* Divider */}
            <div className="border-t border-gray-200">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-gray-500 flex items-center">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Options
                  </span>
                </div>
              </div>
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

          {/* Footer */}
          <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
            <button
              onClick={handleClose}
              className="px-6 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 rounded-lg transition-colors"
            >
              Back to sources
            </button>
            
            <div className="flex items-center space-x-3">
              {!canAnalyze && (
                <p className="text-xs text-gray-500">
                  Select a topic to continue
                </p>
              )}
              
              <button
                onClick={handleAnalyze}
                disabled={!canAnalyze || isLoading}
                className={`px-8 py-3 text-base font-semibold rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                  canAnalyze && !isLoading
                    ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg hover:shadow-xl transform hover:scale-105'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
                    <span>Analyzing...</span>
                  </div>
                ) : (
                  'BREAK MY BUBBLE'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}