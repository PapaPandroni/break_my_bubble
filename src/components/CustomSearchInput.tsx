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
  }, [searchTerms])

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
      {/* Term counter - minimal */}
      {currentTermCount > 0 && (
        <div className="text-right">
          <span className={`text-xs ${currentTermCount >= maxTerms ? 'text-red-600' : 'text-gray-400'}`}>
            {currentTermCount}/{maxTerms}
          </span>
        </div>
      )}

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

      {/* Parsed Terms - clean display */}
      {searchTerms.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {searchTerms.map((term, index) => (
            <span
              key={index}
              className="inline-flex items-center px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full"
            >
              {term}
              <button
                onClick={() => {
                  const newTerms = searchTerms.filter((_, i) => i !== index)
                  onSearchTermsChange(newTerms)
                  setInputValue(newTerms.join(', '))
                }}
                className="ml-1 text-purple-600 hover:text-purple-800 focus:outline-none"
                aria-label={`Remove "${term}"`}
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Minimal warning for too many terms */}
      {currentTermCount >= maxTerms && (
        <p className="text-xs text-red-600 text-center">
          Maximum {maxTerms} terms
        </p>
      )}
    </div>
  )
}