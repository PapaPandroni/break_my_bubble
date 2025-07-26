import { useState } from 'react'
import { NewsLanguage, NewsSortBy } from '../types'
import { DateRange } from './DateRangePicker'
import LanguageSelector from './LanguageSelector'
import CountrySelector from './CountrySelector'
import SortSelector from './SortSelector'
import DateRangePicker from './DateRangePicker'

interface FilterPanelProps {
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
}

export default function FilterPanel({
  selectedLanguages,
  onLanguagesChange,
  selectedCountries,
  onCountriesChange,
  availableCountries,
  selectedSort,
  onSortChange,
  selectedDateRange,
  onDateRangeChange,
  timeOptions
}: FilterPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const getActiveFiltersCount = () => {
    let count = 0
    
    if (selectedLanguages.length > 0) count++ // Empty means all languages, so count when specific languages selected
    if (selectedCountries.length > 0) count++
    if (selectedSort !== 'relevancy') count++ // relevancy is default
    if (selectedDateRange.type !== 'preset' || selectedDateRange.days !== 7) count++ // 1 week is default
    
    return count
  }

  const activeFiltersCount = getActiveFiltersCount()

  return (
    <div className="space-y-4">
      {/* Subtle Filter Toggle - Google-inspired */}
      <div className="text-center">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="inline-flex items-center px-3 py-1.5 text-xs text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
        >
          <span className="mr-1">⚙️</span>
          <span>Advanced options</span>
          {activeFiltersCount > 0 && (
            <span className="ml-1.5 inline-flex items-center justify-center w-4 h-4 text-xs font-medium text-white bg-blue-500 rounded-full">
              {activeFiltersCount}
            </span>
          )}
          <span className="ml-1 text-xs">
            {isExpanded ? '−' : '+'}
          </span>
        </button>
      </div>

      {/* Collapsible Filter Panel */}
      {isExpanded && (
        <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-5 shadow-sm animate-in fade-in duration-200">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Language Selection */}
            <div>
              <LanguageSelector
                selectedLanguages={selectedLanguages}
                onLanguagesChange={onLanguagesChange}
                disabled={false}
              />
            </div>

            {/* Country Selection */}
            <div>
              <CountrySelector
                selectedCountries={selectedCountries}
                onCountriesChange={onCountriesChange}
                availableCountries={availableCountries}
                disabled={false}
              />
            </div>

            {/* Sort Options */}
            <div>
              <SortSelector
                selectedSort={selectedSort}
                onSortChange={onSortChange}
                disabled={false}
              />
            </div>

            {/* Date Range */}
            <div>
              <DateRangePicker
                timeOptions={timeOptions}
                selectedRange={selectedDateRange}
                onRangeChange={onDateRangeChange}
              />
            </div>
          </div>

          {/* Reset Filters Button */}
          {activeFiltersCount > 0 && (
            <div className="text-center pt-3 border-t border-gray-100">
              <button
                onClick={() => {
                  onLanguagesChange(['en'])
                  onCountriesChange([])
                  onSortChange('relevancy')
                  onDateRangeChange({ type: 'preset', days: 7, label: 'Last week' })
                }}
                className="text-xs text-gray-500 hover:text-gray-700 focus:outline-none"
              >
                Reset filters
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}