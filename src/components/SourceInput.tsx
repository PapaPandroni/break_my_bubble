import { useState } from 'react'
import { NewsSource } from '../types'

interface SourceInputProps {
  sources: NewsSource[]
  selectedSources: string[]
  onSourcesChange: (sources: string[]) => void
  minSources?: number
  maxSources?: number
}

export default function SourceInput({
  sources,
  selectedSources,
  onSourcesChange,
  minSources = 1,
  maxSources = 5,
}: SourceInputProps) {
  const [showDropdown, setShowDropdown] = useState(false)

  const handleSourceToggle = (sourceId: string) => {
    const isSelected = selectedSources.includes(sourceId)
    
    if (isSelected) {
      if (selectedSources.length > minSources) {
        onSourcesChange(selectedSources.filter(id => id !== sourceId))
      }
    } else {
      if (selectedSources.length < maxSources) {
        onSourcesChange([...selectedSources, sourceId])
      }
    }
  }

  const getPoliticalLeanColor = (lean: 'left' | 'center' | 'right') => {
    switch (lean) {
      case 'left':
        return 'bg-left-100 text-left-700 border-left-300'
      case 'center':
        return 'bg-center-100 text-center-700 border-center-300'
      case 'right':
        return 'bg-right-100 text-right-700 border-right-300'
    }
  }

  const selectedSourcesData = sources.filter(source => 
    selectedSources.includes(source.id)
  )

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select Your Preferred News Sources ({selectedSources.length}/{maxSources})
        </label>
        <p className="text-sm text-gray-500 mb-4">
          Choose {minSources}-{maxSources} sources you typically read. 
          We'll show you how other sources cover the same topics.
        </p>
      </div>

      {/* Selected Sources Display */}
      {selectedSources.length > 0 && (
        <div className="space-y-2">
          <div className="text-sm font-medium text-gray-700">Selected Sources:</div>
          <div className="flex flex-wrap gap-2">
            {selectedSourcesData.map((source) => (
              <span
                key={source.id}
                className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getPoliticalLeanColor(source.politicalLean)}`}
              >
                {source.name}
                <button
                  onClick={() => handleSourceToggle(source.id)}
                  className="ml-2 text-lg leading-none hover:bg-gray-200 rounded-full w-5 h-5 flex items-center justify-center"
                  aria-label={`Remove ${source.name}`}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Source Selection */}
      <div className="relative">
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          className="w-full px-4 py-3 text-left bg-white border border-gray-300 rounded-lg shadow-sm hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          disabled={selectedSources.length >= maxSources}
          aria-expanded={showDropdown}
          aria-haspopup="listbox"
        >
          <span className="text-gray-700">
            {selectedSources.length >= maxSources 
              ? 'Maximum sources selected' 
              : 'Click to add more sources...'}
          </span>
          <span className="float-right text-gray-400">
            {showDropdown ? '▲' : '▼'}
          </span>
        </button>

        {showDropdown && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg">
            <div className="max-h-60 overflow-y-auto">
              {sources.map((source) => {
                const isSelected = selectedSources.includes(source.id)
                const isDisabled = !isSelected && selectedSources.length >= maxSources
                
                return (
                  <button
                    key={source.id}
                    onClick={() => !isDisabled && handleSourceToggle(source.id)}
                    disabled={isDisabled}
                    className={`w-full px-4 py-3 text-left hover:bg-gray-50 focus:outline-none focus:bg-gray-50 border-b border-gray-100 last:border-b-0 ${
                      isSelected ? 'bg-blue-50' : ''
                    } ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                    role="option"
                    aria-selected={isSelected}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-gray-900">{source.name}</div>
                        <div className="text-sm text-gray-500">{source.website}</div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 text-xs rounded-full border ${getPoliticalLeanColor(source.politicalLean)}`}>
                          {source.politicalLean}
                        </span>
                        {isSelected && (
                          <span className="text-blue-600">✓</span>
                        )}
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        )}
      </div>

      {selectedSources.length < minSources && (
        <p className="text-sm text-amber-600">
          Please select at least {minSources} source{minSources > 1 ? 's' : ''} to continue.
        </p>
      )}
    </div>
  )
}