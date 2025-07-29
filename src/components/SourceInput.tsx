import { useState, useEffect, useMemo } from 'react'
import { NewsSource } from '../types'
import { getCredibilityIndicator, getCategoryIcon } from '../utils/sourceUtils'

interface SourceInputProps {
  sources: NewsSource[]
  selectedSources: string[]
  onSourcesChange: (sources: string[]) => void
  minSources?: number
  maxSources?: number
  isLoading?: boolean
  isDynamic?: boolean
  allSourcesLoaded?: boolean
}

export default function SourceInput({
  sources,
  selectedSources,
  onSourcesChange,
  minSources = 1,
  maxSources = 5,
  isLoading = false,
  isDynamic = false,
  allSourcesLoaded = true,
}: SourceInputProps) {
  const [showDropdown, setShowDropdown] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  const handleSourceToggle = (sourceId: string) => {
    const isSelected = selectedSources.includes(sourceId)
    
    if (isSelected) {
      // Always allow removal - users should be able to clear all sources
      onSourcesChange(selectedSources.filter(id => id !== sourceId))
    } else {
      if (selectedSources.length < maxSources) {
        onSourcesChange([...selectedSources, sourceId])
        setShowDropdown(false) // Close dropdown after adding a source
      }
    }
  }


  // Filter sources based on search only (categories removed)
  const filteredSources = useMemo(() => {
    if (!searchTerm.trim()) return sources;
    return sources.filter(source => 
      source.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      source.website.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [sources, searchTerm]);

  const selectedSourcesData = sources.filter(source => 
    selectedSources.includes(source.id)
  )

  // Reset search when dropdown closes
  useEffect(() => {
    if (!showDropdown) {
      setSearchTerm('');
    }
  }, [showDropdown]);

  return (
    <div className="space-y-3">
      <div>
        {isDynamic && !allSourcesLoaded && (
          <div className="text-center mb-4">
            <div className="inline-flex items-center px-3 py-2 bg-primary-50 rounded-full">
              <div className="animate-spin w-4 h-4 border-2 border-primary-600 border-t-transparent rounded-full mr-2"></div>
              <span className="text-primary-700 font-medium text-sm">Loading sources...</span>
            </div>
          </div>
        )}
      </div>

      {/* Enhanced Selected Sources Display */}
      {selectedSources.length > 0 && (
        <div className="text-center mb-4">
          <div className="flex flex-wrap justify-center gap-3">
            {selectedSourcesData.map((source) => {
              const credibility = getCredibilityIndicator(source.credibility);
              return (
                <span
                  key={source.id}
                  className="inline-flex items-center px-4 py-2 rounded-2xl text-sm font-medium border-2 bg-white text-gray-700 border-gray-200 hover:border-primary-300 hover:bg-primary-25 transition-all duration-200 hover:scale-105"
                >
                  <span className="flex items-center gap-2">
                    {source.category && (
                      <span className="text-base" title={source.category}>
                        {getCategoryIcon(source.category)}
                      </span>
                    )}
                    <span className="font-semibold">{source.name}</span>
                    {isDynamic && (
                      <span className={`text-sm ${credibility.color}`} title={`Credibility: ${credibility.text}`}>
                        {credibility.emoji}
                      </span>
                    )}
                  </span>
                  <button
                    onClick={() => handleSourceToggle(source.id)}
                    className="ml-2 text-lg leading-none hover:bg-white hover:bg-opacity-30 rounded-full w-6 h-6 flex items-center justify-center transition-all duration-200 hover:scale-110"
                    aria-label={`Remove ${source.name}`}
                  >
                    ×
                  </button>
                </span>
              );
            })}
          </div>
        </div>
      )}

      {/* Enhanced Source Selection Button */}
      <div className="relative">
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          className={`w-full px-6 py-4 text-center bg-white border-2 rounded-xl shadow-soft hover:shadow-medium focus:outline-none focus:ring-4 focus:ring-primary-200 focus:border-primary-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 ${
            selectedSources.length >= maxSources 
              ? 'border-gray-200 text-gray-500' 
              : 'border-gray-200 text-gray-700 hover:border-primary-300 hover:bg-primary-25'
          }`}
          disabled={selectedSources.length >= maxSources}
          aria-expanded={showDropdown}
          aria-haspopup="listbox"
        >
          <div className="flex items-center justify-center space-x-2">
            <svg className="w-5 h-5 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <span className="text-base font-medium">
              {selectedSources.length >= maxSources 
                ? 'Maximum sources selected' 
                : selectedSources.length === 0
                  ? 'Select news sources'
                  : 'Add more sources'}
            </span>
          </div>
          {sources.length > 0 && (
            <span className="block text-sm text-gray-500 mt-2 font-normal">
              {!allSourcesLoaded ? 'Loading additional sources...' : `${sources.length} sources available`}
            </span>
          )}
        </button>

        {showDropdown && (
          <div className="absolute z-10 w-full mt-3 bg-white border border-gray-200 rounded-2xl shadow-strong">
            {/* Enhanced Search Box */}
            {isDynamic && sources.length > 5 && (
              <div className="p-4 border-b border-gray-100">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search news sources..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-4 py-3 pl-10 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-3 focus:ring-primary-200 focus:border-primary-300 transition-all duration-200"
                    autoFocus
                  />
                  <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
            )}
            
            <div className="max-h-64 overflow-y-auto">
              {/* Show background loading indicator when not all sources loaded */}
              {!allSourcesLoaded && sources.length > 0 && (
                <div className="px-4 py-2 bg-blue-50 border-b border-blue-100 text-center">
                  <div className="flex items-center justify-center gap-2 text-sm text-blue-600">
                    <div className="animate-spin w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full"></div>
                    Loading additional sources...
                  </div>
                </div>
              )}
              
              {filteredSources.length === 0 ? (
                <div className="px-4 py-8 text-center text-gray-500">
                  {searchTerm ? 'No sources match your search' : 'No sources available'}
                </div>
              ) : (
                filteredSources.map((source) => {
                  const isSelected = selectedSources.includes(source.id)
                  const isDisabled = !isSelected && selectedSources.length >= maxSources
                  const credibility = getCredibilityIndicator(source.credibility);
                  
                  return (
                    <button
                      key={source.id}
                      onClick={() => !isDisabled && handleSourceToggle(source.id)}
                      disabled={isDisabled}
                      className={`w-full px-4 py-4 text-left hover:bg-gray-50 focus:outline-none focus:bg-primary-25 border-b border-gray-50 last:border-b-0 transition-all duration-200 ${
                        isSelected ? 'bg-primary-50 border-primary-100' : ''
                      } ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:scale-[1.01]'}`}
                      role="option"
                      aria-selected={isSelected}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            {source.category && (
                              <span className="text-lg" title={source.category}>
                                {getCategoryIcon(source.category)}
                              </span>
                            )}
                            <div className="font-medium text-gray-900 truncate">{source.name}</div>
                            {isDynamic && (
                              <span className={`text-xs ${credibility.color}`} title={`Credibility: ${credibility.text}`}>
                                {credibility.emoji}
                              </span>
                            )}
                          </div>
                          <div className="text-sm text-gray-500 truncate">{source.website}</div>
                          {isDynamic && source.description && (
                            <div className="text-xs text-gray-400 mt-1 line-clamp-2">
                              {source.description}
                            </div>
                          )}
                          {isDynamic && (source.language || source.country) && (
                            <div className="flex items-center gap-2 mt-1 text-xs text-gray-400">
                              {source.language && <span>🌐 {source.language.toUpperCase()}</span>}
                              {source.country && <span>📍 {source.country.toUpperCase()}</span>}
                            </div>
                          )}
                        </div>
                        <div className="flex items-center space-x-2 ml-2">
                          {isSelected && (
                            <span className="text-blue-600">✓</span>
                          )}
                        </div>
                      </div>
                    </button>
                  )
                })
              )}
            </div>
          </div>
        )}
      </div>

      {selectedSources.length < minSources && (
        <p className="text-xs text-gray-500 text-center">
          Select {minSources === 1 ? 'a' : `${minSources}`} source{minSources > 1 ? 's' : ''} to continue
        </p>
      )}
      
      {isDynamic && sources.length === 0 && !isLoading && (
        <p className="text-xs text-red-600 text-center">
          No sources available
        </p>
      )}
    </div>
  )
}