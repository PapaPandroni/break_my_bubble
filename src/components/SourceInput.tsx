import { useState, useEffect, useMemo } from 'react'
import { NewsSource, NewsCategory, SourceFilters } from '../types'
import { filterSources } from '../services/dynamicSourceService'

interface SourceInputProps {
  sources: NewsSource[]
  selectedSources: string[]
  onSourcesChange: (sources: string[]) => void
  minSources?: number
  maxSources?: number
  isLoading?: boolean
  isDynamic?: boolean
  onFiltersChange?: (filters: SourceFilters) => void
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
  onFiltersChange: _onFiltersChange,
  allSourcesLoaded = true,
}: SourceInputProps) {
  const [showDropdown, setShowDropdown] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<NewsCategory | ''>('')
  const [showFilters, setShowFilters] = useState(false)

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

  const getPoliticalLeanColor = (lean: 'left' | 'lean-left' | 'center' | 'lean-right' | 'right' | 'unknown') => {
    switch (lean) {
      case 'left':
        return 'bg-blue-200 text-blue-800 border-blue-400'
      case 'lean-left':
        return 'bg-blue-100 text-blue-700 border-blue-300'
      case 'center':
        return 'bg-gray-100 text-gray-700 border-gray-300'
      case 'lean-right':
        return 'bg-red-100 text-red-700 border-red-300'
      case 'right':
        return 'bg-red-200 text-red-800 border-red-400'
      case 'unknown':
        return 'bg-amber-100 text-amber-700 border-amber-300'
    }
  }

  const getPoliticalLeanLabel = (lean: 'left' | 'lean-left' | 'center' | 'lean-right' | 'right' | 'unknown') => {
    switch (lean) {
      case 'left':
        return 'Left'
      case 'lean-left':
        return 'Lean Left'
      case 'center':
        return 'Center'
      case 'lean-right':
        return 'Lean Right'
      case 'right':
        return 'Right'
      case 'unknown':
        return 'Unknown'
    }
  }

  const getCredibilityIndicator = (credibility: number) => {
    if (credibility >= 0.8) return { emoji: '🟢', text: 'High', color: 'text-green-600' };
    if (credibility >= 0.6) return { emoji: '🟡', text: 'Medium', color: 'text-yellow-600' };
    return { emoji: '🔴', text: 'Low', color: 'text-red-600' };
  }

  const getCategoryIcon = (category: NewsCategory) => {
    const icons = {
      business: '💼',
      entertainment: '🎭',
      general: '📰',
      health: '🏥',
      science: '🔬',
      sports: '⚽',
      technology: '💻'
    };
    return icons[category] || '📰';
  }

  // Filter sources based on search and category
  const filteredSources = useMemo(() => {
    const filters: SourceFilters = {
      languages: [], // Languages handled at parent level
      categories: selectedCategory ? [selectedCategory] : [],
      countries: [],
      search: searchTerm
    };
    return filterSources(sources, filters);
  }, [sources, searchTerm, selectedCategory]);

  const selectedSourcesData = sources.filter(source => 
    selectedSources.includes(source.id)
  )

  // Get available categories from sources
  const availableCategories = useMemo(() => {
    const categories = sources
      .map(source => source.category)
      .filter(Boolean) as NewsCategory[];
    return [...new Set(categories)].sort();
  }, [sources]);

  // Reset search when dropdown closes
  useEffect(() => {
    if (!showDropdown) {
      setSearchTerm('');
    }
  }, [showDropdown]);

  return (
    <div className="space-y-4">
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-medium text-gray-700">
            Select Your Preferred News Sources ({selectedSources.length}/{maxSources})
          </label>
          {isDynamic && sources.length > 10 && (
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="text-sm text-blue-600 hover:text-blue-800 focus:outline-none"
            >
              {showFilters ? 'Hide Filters' : 'Show Filters'}
            </button>
          )}
        </div>
        <p className="text-sm text-gray-500 mb-4">
          Choose {minSources}-{maxSources} sources you typically read. 
          We'll show you how other sources cover the same topics.
          {isDynamic && ` Found ${sources.length} available sources.`}
          {isDynamic && !allSourcesLoaded && (
            <span className="text-blue-600"> Loading more sources in background...</span>
          )}
        </p>

        {/* Filters */}
        {isDynamic && showFilters && (
          <div className="bg-gray-50 p-4 rounded-lg mb-4 space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* Category Filter */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Filter by Category
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value as NewsCategory | '')}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="">All Categories</option>
                  {availableCategories.map(category => (
                    <option key={category} value={category}>
                      {getCategoryIcon(category)} {category.charAt(0).toUpperCase() + category.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
              
              {/* Source Count Info */}
              <div className="flex items-center text-sm text-gray-600">
                <span>Showing {filteredSources.length} of {sources.length} sources</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Selected Sources Display */}
      {selectedSources.length > 0 && (
        <div className="space-y-2">
          <div className="text-sm font-medium text-gray-700">Selected Sources:</div>
          <div className="flex flex-wrap gap-2">
            {selectedSourcesData.map((source) => {
              const credibility = getCredibilityIndicator(source.credibility);
              return (
                <span
                  key={source.id}
                  className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getPoliticalLeanColor(source.politicalLean)}`}
                >
                  <span className="flex items-center gap-1">
                    {source.category && getCategoryIcon(source.category)}
                    {source.name}
                    {isDynamic && (
                      <span className={`text-xs ${credibility.color}`} title={`Credibility: ${credibility.text}`}>
                        {credibility.emoji}
                      </span>
                    )}
                  </span>
                  <button
                    onClick={() => handleSourceToggle(source.id)}
                    className="ml-2 text-lg leading-none hover:bg-gray-200 rounded-full w-5 h-5 flex items-center justify-center"
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

      {/* Source Selection */}
      <div className="relative">
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          className="w-full px-4 py-3 text-left bg-white border border-gray-300 rounded-lg shadow-sm hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
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
            {!allSourcesLoaded ? '⟳' : showDropdown ? '▲' : '▼'}
          </span>
        </button>

        {showDropdown && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg">
            {/* Search Box */}
            {isDynamic && sources.length > 5 && (
              <div className="p-3 border-b border-gray-200">
                <input
                  type="text"
                  placeholder="Search sources..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                  autoFocus
                />
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
                  {searchTerm || selectedCategory ? 'No sources match your filters' : 'No sources available'}
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
                      className={`w-full px-4 py-3 text-left hover:bg-gray-50 focus:outline-none focus:bg-gray-50 border-b border-gray-100 last:border-b-0 ${
                        isSelected ? 'bg-blue-50' : ''
                      } ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
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
                          <span className={`px-2 py-1 text-xs rounded-full border ${getPoliticalLeanColor(source.politicalLean)}`}>
                            {getPoliticalLeanLabel(source.politicalLean)}
                          </span>
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
        <p className="text-sm text-amber-600">
          Please select at least {minSources} source{minSources > 1 ? 's' : ''} to continue.
        </p>
      )}
      
      {isDynamic && sources.length === 0 && !isLoading && (
        <p className="text-sm text-red-600">
          No sources available. Please check your internet connection or try switching to RSS mode.
        </p>
      )}
    </div>
  )
}