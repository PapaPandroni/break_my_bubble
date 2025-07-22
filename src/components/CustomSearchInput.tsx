import { useState, useRef, useEffect } from 'react'

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
  const inputRef = useRef<HTMLInputElement>(null)

  // Initialize input value from existing search terms
  useEffect(() => {
    if (searchTerms.length > 0) {
      setInputValue(searchTerms.join(', '))
    }
  }, [])

  const parseSearchTerms = (value: string): string[] => {
    if (!value.trim()) return []
    
    // Split by comma or multiple spaces, then clean up
    return value
      .split(/[,\s]+/)
      .map(term => term.trim().toLowerCase())
      .filter(term => term.length > 0)
      .slice(0, maxTerms) // Limit number of terms
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setInputValue(newValue)
    
    // Parse and update search terms in real-time
    const terms = parseSearchTerms(newValue)
    onSearchTermsChange(terms)
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
    }
  }

  const handleClear = () => {
    setInputValue('')
    onSearchTermsChange([])
    inputRef.current?.focus()
  }

  const currentTermCount = parseSearchTerms(inputValue).length

  return (
    <div className="space-y-2">
      {/* Input Label */}
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-gray-700">
          Custom Search Terms
        </label>
        {currentTermCount > 0 && (
          <span className={`text-xs ${currentTermCount >= maxTerms ? 'text-red-600' : 'text-gray-500'}`}>
            {currentTermCount}/{maxTerms} terms
          </span>
        )}
      </div>

      {/* Search Input */}
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          disabled={disabled}
          className={`w-full px-4 py-3 pr-12 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed ${
            isFocused ? 'shadow-sm' : ''
          } ${
            currentTermCount >= maxTerms ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : ''
          }`}
          maxLength={200}
        />
        
        {/* Clear Button */}
        {inputValue && (
          <button
            onClick={handleClear}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
            aria-label="Clear search terms"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Parsed Terms Display */}
      {searchTerms.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs text-gray-600">Your search terms:</p>
          <div className="flex flex-wrap gap-2">
            {searchTerms.map((term, index) => (
              <span
                key={index}
                className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full"
              >
                {term}
                <button
                  onClick={() => {
                    const newTerms = searchTerms.filter((_, i) => i !== index)
                    onSearchTermsChange(newTerms)
                    setInputValue(newTerms.join(', '))
                  }}
                  className="ml-1 text-blue-600 hover:text-blue-800 focus:outline-none"
                  aria-label={`Remove "${term}"`}
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Help Text */}
      <div className="text-xs text-gray-500 space-y-1">
        <p>💡 <strong>Tips:</strong></p>
        <ul className="ml-4 space-y-0.5">
          <li>• Separate terms with commas or spaces</li>
          <li>• Use specific keywords for better results</li>
          <li>• Press Enter when done, Escape to clear all</li>
          <li>• Works with any language</li>
        </ul>
      </div>

      {/* Warning for too many terms */}
      {currentTermCount >= maxTerms && (
        <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">
          <div className="flex items-start">
            <span className="mr-2">⚠️</span>
            <div>
              <div className="font-medium">Too many search terms</div>
              <div className="text-xs mt-1">
                Only the first {maxTerms} terms will be used. Consider using more specific keywords for better results.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}