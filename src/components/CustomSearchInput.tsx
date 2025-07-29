import { useState, useRef, useEffect } from 'react'
import { validateSearchTerm, sanitizeSearchTerms } from '../utils/helpers'
import { generateId, announceToScreenReader } from '../utils/accessibility'

interface CustomSearchInputProps {
  searchTerms: string[]
  onSearchTermsChange: (terms: string[]) => void
  placeholder?: string
  disabled?: boolean
  maxTerms?: number
}

export default function CustomSearchInput({
  searchTerms,
  onSearchTermsChange,
  placeholder = "Enter your search terms (comma or space separated)",
  disabled = false,
  maxTerms = 10
}: CustomSearchInputProps) {
  const [inputValue, setInputValue] = useState('')
  const [isFocused, setIsFocused] = useState(false)
  const [rejectedTerms, setRejectedTerms] = useState<string[]>([])
  const [showSecurityWarning, setShowSecurityWarning] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  
  // Generate stable IDs for accessibility
  const inputId = useRef(generateId('search-input')).current
  const helpTextId = useRef(generateId('help-text')).current
  const errorId = useRef(generateId('error')).current
  const counterid = useRef(generateId('counter')).current

  // Initialize input value from existing search terms
  useEffect(() => {
    if (searchTerms.length > 0) {
      setInputValue(searchTerms.join(', '))
    }
  }, [searchTerms])

  const parseSearchTerms = (value: string): { validTerms: string[], rejectedTerms: string[] } => {
    if (!value.trim()) return { validTerms: [], rejectedTerms: [] }
    
    // Split by comma or multiple spaces, then clean up
    const rawTerms = value
      .split(/[,\s]+/)
      .map(term => term.trim())
      .filter(term => term.length > 0)
    
    // Separate valid and invalid terms for user feedback
    const validTerms: string[] = []
    const rejectedTerms: string[] = []
    
    for (const term of rawTerms) {
      if (validateSearchTerm(term)) {
        validTerms.push(term.toLowerCase())
      } else {
        rejectedTerms.push(term)
      }
    }
    
    // Apply additional sanitization to valid terms and enforce max limit
    const sanitizedTerms = sanitizeSearchTerms(validTerms).slice(0, maxTerms)
    
    return { 
      validTerms: sanitizedTerms, 
      rejectedTerms: rejectedTerms 
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setInputValue(newValue)
    
    // Parse and update search terms in real-time with security validation
    const { validTerms, rejectedTerms } = parseSearchTerms(newValue)
    
    // Update rejected terms state for user feedback
    setRejectedTerms(rejectedTerms)
    
    // Show security warning if any terms were rejected
    if (rejectedTerms.length > 0) {
      setShowSecurityWarning(true)
      announceToScreenReader(`Warning: ${rejectedTerms.length} invalid search terms were rejected`, 'assertive')
      // Auto-hide warning after 5 seconds
      setTimeout(() => setShowSecurityWarning(false), 5000)
    } else {
      setShowSecurityWarning(false)
    }
    
    // Announce search term count changes
    if (validTerms.length !== searchTerms.length) {
      announceToScreenReader(`${validTerms.length} search term${validTerms.length === 1 ? '' : 's'} entered`, 'polite')
    }
    
    // Only pass valid, sanitized terms to parent
    onSearchTermsChange(validTerms)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Allow Enter to blur the input (finish editing)
    if (e.key === 'Enter') {
      inputRef.current?.blur()
    }
    
    // Clear all terms with Escape
    if (e.key === 'Escape') {
      setInputValue('')
      onSearchTermsChange([])
      setRejectedTerms([])
      setShowSecurityWarning(false)
    }
  }

  const handleClear = () => {
    setInputValue('')
    onSearchTermsChange([])
    setRejectedTerms([])
    setShowSecurityWarning(false)
    inputRef.current?.focus()
  }

  const { validTerms } = parseSearchTerms(inputValue)
  const currentTermCount = validTerms.length

  return (
    <div className="space-y-2">
      {/* Term counter with screen reader support */}
      {currentTermCount > 0 && (
        <div className="text-right">
          <span 
            id={counterid}
            className={`text-xs ${currentTermCount >= maxTerms ? 'text-red-600' : 'text-gray-400'}`}
            aria-live="polite"
            role="status"
          >
            {currentTermCount}/{maxTerms} terms
            {currentTermCount >= maxTerms && (
              <span className="sr-only"> (maximum reached)</span>
            )}
          </span>
        </div>
      )}

      {/* Search Input with enhanced accessibility */}
      <div className="relative">
        <label htmlFor={inputId} className="sr-only">
          Search terms input. {placeholder}
        </label>
        <input
          ref={inputRef}
          id={inputId}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          disabled={disabled}
          className={`w-full px-4 py-3 pr-12 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px] ${
            isFocused ? 'shadow-sm' : ''
          } ${
            currentTermCount >= maxTerms ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : ''
          }`}
          maxLength={200}
          aria-describedby={`${helpTextId} ${showSecurityWarning ? errorId : ''} ${currentTermCount > 0 ? counterid : ''}`.trim()}
          aria-invalid={showSecurityWarning ? 'true' : 'false'}
          autoComplete="off"
        />
        
        {/* Clear Button with proper touch target */}
        {inputValue && (
          <button
            onClick={handleClear}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 rounded-full p-2 min-w-[40px] min-h-[40px] flex items-center justify-center"
            aria-label="Clear all search terms"
            title="Clear all search terms"
            type="button"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Parsed Terms with enhanced accessibility */}
      {searchTerms.length > 0 && (
        <div className="space-y-2">
          <div className="sr-only" aria-live="polite">
            {searchTerms.length} search term{searchTerms.length === 1 ? '' : 's'}: {searchTerms.join(', ')}
          </div>
          <div className="flex flex-wrap gap-1.5" role="list" aria-label="Current search terms">
            {searchTerms.map((term, index) => (
              <span
                key={index}
                className="inline-flex items-center px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full"
                role="listitem"
              >
                <span className="mr-1">{term}</span>
                <button
                  onClick={() => {
                    const newTerms = searchTerms.filter((_, i) => i !== index)
                    onSearchTermsChange(newTerms)
                    setInputValue(newTerms.join(', '))
                    announceToScreenReader(`Removed search term: ${term}`, 'polite')
                  }}
                  className="text-purple-600 hover:text-purple-800 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-1 rounded-full min-w-[16px] min-h-[16px] flex items-center justify-center"
                  aria-label={`Remove search term: ${term}`}
                  title={`Remove ${term}`}
                  type="button"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Security Warning with enhanced accessibility */}
      {showSecurityWarning && rejectedTerms.length > 0 && (
        <div 
          id={errorId}
          className="p-2 bg-red-50 border border-red-200 rounded-lg"
          role="alert"
          aria-live="assertive"
        >
          <p className="text-xs text-red-700 font-medium mb-1">
            <span role="img" aria-label="Warning">⚠️</span> Security Warning: Invalid terms detected
          </p>
          <p className="text-xs text-red-600">
            The following terms were rejected for security reasons: {rejectedTerms.join(', ')}
          </p>
        </div>
      )}
      
      {/* Minimal warning for too many terms */}
      {currentTermCount >= maxTerms && (
        <p className="text-xs text-red-600 text-center" role="status" aria-live="polite">
          Maximum {maxTerms} terms reached
        </p>
      )}
      
      {/* Hidden help text */}
      <div id={helpTextId} className="sr-only">
        Enter search terms separated by commas or spaces. Maximum {maxTerms} terms allowed. Use the clear button or press Escape to clear all terms.
      </div>
    </div>
  )
}

