import { useState } from 'react'
import { NewsLanguage, NewsSortBy } from '../types'
import { DateRange } from './DateRangePicker'
import LanguageSelector from './LanguageSelector'
import CountrySelector from './CountrySelector'
import SortSelector from './SortSelector'
import DateRangePicker from './DateRangePicker'
import TimeSlider from './TimeSlider'

interface FilterPanelProps {
  // NewsAPI mode props
  useNewsAPI: boolean
  selectedLanguages: NewsLanguage[]
  onLanguagesChange: (languages: NewsLanguage[]) => void
  selectedCountries: string[]
  onCountriesChange: (countries: string[]) => void
  availableCountries: string[]
  selectedSort: NewsSortBy
  onSortChange: (sort: NewsSortBy) => void
  selectedDateRange: DateRange
  onDateRangeChange: (dateRange: DateRange) => void
  
  // RSS mode props
  selectedTimeframe: number
  onTimeframeChange: (timeframe: number) => void
  timeOptions: { value: number; label: string; days: number }[]
}

export default function FilterPanel({
  useNewsAPI,
  selectedLanguages,
  onLanguagesChange,
  selectedCountries,
  onCountriesChange,
  availableCountries,
  selectedSort,
  onSortChange,
  selectedDateRange,
  onDateRangeChange,
  selectedTimeframe,
  onTimeframeChange,
  timeOptions
}: FilterPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const getActiveFiltersCount = () => {
    let count = 0
    
    if (useNewsAPI) {
      if (selectedLanguages.length > 0) count++ // Empty means all languages, so count when specific languages selected
      if (selectedCountries.length > 0) count++
      if (selectedSort !== 'relevancy') count++ // relevancy is default
      if (selectedDateRange.type !== 'preset' || selectedDateRange.days !== 7) count++ // 1 week is default
    } else {
      if (selectedTimeframe !== 7) count++ // 1 week is default
    }
    
    return count
  }

  const activeFiltersCount = getActiveFiltersCount()

  return (
    <div className="space-y-4">
      {/* Filter Toggle Button */}
      <div className="flex items-center justify-center">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
        >
          <span className="mr-2">🔧</span>
          <span>Filters</span>
          {activeFiltersCount > 0 && (
            <span className="ml-2 inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-blue-600 rounded-full">
              {activeFiltersCount}
            </span>
          )}
          <span className="ml-2 text-gray-400">
            {isExpanded ? '▲' : '▼'}
          </span>
        </button>
      </div>

      {/* Collapsible Filter Panel */}
      {isExpanded && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 space-y-6 animate-in fade-in duration-200">
          <div className="text-center">
            <h3 className="text-lg font-medium text-gray-900 mb-1">Advanced Filters</h3>
            <p className="text-sm text-gray-600">Customize your news search parameters</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {useNewsAPI ? (
              <>
                {/* Language Selection */}
                <div className="space-y-4">
                  <LanguageSelector
                    selectedLanguages={selectedLanguages}
                    onLanguagesChange={onLanguagesChange}
                    disabled={false}
                  />
                </div>

                {/* Country Selection */}
                <div className="space-y-4">
                  <CountrySelector
                    selectedCountries={selectedCountries}
                    onCountriesChange={onCountriesChange}
                    availableCountries={availableCountries}
                    disabled={false}
                  />
                </div>

                {/* Sort Options */}
                <div className="space-y-4">
                  <SortSelector
                    selectedSort={selectedSort}
                    onSortChange={onSortChange}
                    disabled={false}
                  />
                </div>

                {/* Date Range */}
                <div className="space-y-4">
                  <DateRangePicker
                    timeOptions={timeOptions}
                    selectedRange={selectedDateRange}
                    onRangeChange={onDateRangeChange}
                  />
                </div>
              </>
            ) : (
              /* RSS Mode - Time Selection Only */
              <div className="lg:col-span-2 space-y-4">
                <TimeSlider
                  timeOptions={timeOptions}
                  selectedTimeframe={selectedTimeframe}
                  onTimeframeChange={onTimeframeChange}
                />
              </div>
            )}
          </div>

          {/* Reset Filters Button */}
          {activeFiltersCount > 0 && (
            <div className="text-center pt-4 border-t border-gray-300">
              <button
                onClick={() => {
                  if (useNewsAPI) {
                    onLanguagesChange(['en'])
                    onCountriesChange([])
                    onSortChange('relevancy')
                    onDateRangeChange({ type: 'preset', days: 7, label: 'Last week' })
                  } else {
                    onTimeframeChange(7)
                  }
                }}
                className="text-sm text-gray-600 hover:text-gray-800 underline focus:outline-none"
              >
                Reset all filters
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}