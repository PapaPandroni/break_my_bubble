import { useState } from 'react'
import { NewsSortBy } from '../types'

interface SortSelectorProps {
  selectedSort: NewsSortBy
  onSortChange: (sort: NewsSortBy) => void
  disabled?: boolean
}

const SORT_OPTIONS = [
  {
    value: 'relevancy' as NewsSortBy,
    label: 'Most Relevant',
    description: 'Articles most relevant to your search terms',
    icon: '🎯'
  },
  {
    value: 'publishedAt' as NewsSortBy,
    label: 'Most Recent',
    description: 'Latest published articles first',
    icon: '🕐'
  },
  {
    value: 'popularity' as NewsSortBy,
    label: 'Most Popular',
    description: 'Articles from most popular sources',
    icon: '🔥'
  }
]

export default function SortSelector({
  selectedSort,
  onSortChange,
  disabled = false
}: SortSelectorProps) {
  const [showDropdown, setShowDropdown] = useState(false)

  const selectedOption = SORT_OPTIONS.find(option => option.value === selectedSort) || SORT_OPTIONS[0]

  const handleSortChange = (sortValue: NewsSortBy) => {
    onSortChange(sortValue)
    setShowDropdown(false)
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Sort Articles By
        </label>
        <p className="text-sm text-gray-500 mb-4">
          Choose how to order the articles in your results.
        </p>
      </div>

      <div className="relative">
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          className="w-full px-4 py-3 text-left bg-white border border-gray-300 rounded-lg shadow-sm hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={disabled}
          aria-expanded={showDropdown}
          aria-haspopup="listbox"
        >
          <div className="flex items-center">
            <span className="text-2xl mr-3" role="img" aria-label={selectedOption.label}>
              {selectedOption.icon}
            </span>
            <div className="flex-1">
              <div className="font-medium text-gray-900">{selectedOption.label}</div>
              <div className="text-sm text-gray-500">{selectedOption.description}</div>
            </div>
            <span className="text-gray-400 ml-2">
              {showDropdown ? '▲' : '▼'}
            </span>
          </div>
        </button>

        {showDropdown && !disabled && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg">
            <div className="py-1">
              {SORT_OPTIONS.map((option) => {
                const isSelected = option.value === selectedSort
                
                return (
                  <button
                    key={option.value}
                    onClick={() => handleSortChange(option.value)}
                    className={`w-full px-4 py-3 text-left hover:bg-gray-50 focus:outline-none focus:bg-gray-50 border-b border-gray-100 last:border-b-0 ${
                      isSelected ? 'bg-blue-50 border-blue-100' : ''
                    }`}
                  >
                    <div className="flex items-center">
                      <span className="text-2xl mr-3" role="img" aria-label={option.label}>
                        {option.icon}
                      </span>
                      <div className="flex-1">
                        <div className={`font-medium ${isSelected ? 'text-blue-900' : 'text-gray-900'}`}>
                          {option.label}
                        </div>
                        <div className={`text-sm ${isSelected ? 'text-blue-600' : 'text-gray-500'}`}>
                          {option.description}
                        </div>
                      </div>
                      {isSelected && (
                        <span className="text-blue-600 ml-2">✓</span>
                      )}
                    </div>
                  </button>
                )
              })}
            </div>
            
            {/* Footer with sort info */}
            <div className="p-3 border-t border-gray-200 bg-gray-50 text-xs text-gray-600">
              <div>
                💡 <strong>Tip:</strong> Use "Most Recent" for breaking news, "Most Relevant" for research topics
              </div>
            </div>
          </div>
        )}
      </div>

      {disabled && (
        <div className="text-sm text-amber-600 bg-amber-50 border border-amber-200 rounded-lg p-3">
          <div className="flex items-start">
            <span className="mr-2">⚠️</span>
            <div>
              <div className="font-medium">Sort options not available</div>
              <div className="text-xs mt-1">
                Sort preferences require NewsAPI mode. Enable NewsAPI to use advanced sorting options.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}