import { useMemo, useCallback } from 'react'
import { NewsSource, NewsLanguage, NewsSortBy } from '../types'
import { DateRange } from './DateRangePicker'
import SourceInput from './SourceInput'
import FilterPanel from './FilterPanel'
import FAQ from './FAQ'

interface LandingPageProps {
  sources: NewsSource[]
  selectedSources: string[]
  onSourcesChange: (sources: string[]) => void
  onContinue: () => void
  isLoadingSources: boolean
  allSourcesLoaded: boolean
  // Filter props
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

export default function LandingPage({
  sources,
  selectedSources,
  onSourcesChange,
  onContinue,
  isLoadingSources,
  allSourcesLoaded,
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
}: LandingPageProps) {
  // Memoize expensive calculation
  const canContinue = useMemo(() => {
    return selectedSources.length >= 1
  }, [selectedSources.length])

  // Memoize event handlers to prevent unnecessary re-renders
  const handleContinue = useCallback(() => {
    if (canContinue) {
      onContinue()
    }
  }, [canContinue, onContinue])

  const handleSourcesChange = useCallback((sources: string[]) => {
    onSourcesChange(sources)
  }, [onSourcesChange])

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      <main className="max-w-4xl mx-auto px-4">
        <div className="min-h-[80vh] flex flex-col justify-center">
          {/* Simplified Layout with Better Spacing */}
          <div className="max-w-3xl mx-auto w-full space-y-8">
            {/* Main Content */}
            <div className="text-center space-y-8">
              <div className="space-y-4">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 leading-tight">
                  Choose your news sources
                </h1>
                <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed font-medium">
                  Select the news outlets you trust, and we'll show you how other sources cover the same stories
                </p>
              </div>

              {/* Source Selection Card - Color/Shape Focus */}
              <div className="max-w-2xl mx-auto">
                <div className="relative">
                  {/* Main selection card with colored border and background */}
                  <div className="relative bg-primary-25 rounded-2xl shadow-medium border-2 border-primary-300 p-6 transition-all duration-300 hover:shadow-strong hover:border-primary-400">
                    <div className="space-y-4">
                      <div className="text-center space-y-2">
                        <div className="inline-flex items-center px-3 py-1.5 bg-primary-200 rounded-full">
                          <span className="w-2 h-2 bg-primary-600 rounded-full mr-2"></span>
                          <span className="text-primary-800 font-medium text-sm">Step 1</span>
                        </div>
                        <h2 className="text-lg font-semibold text-gray-900">
                          Select News Sources
                        </h2>
                      </div>
                      
                      <SourceInput
                        sources={sources}
                        selectedSources={selectedSources}
                        onSourcesChange={handleSourcesChange}
                        isLoading={isLoadingSources}
                        isDynamic={true}
                        allSourcesLoaded={allSourcesLoaded}
                        maxSources={5}
                      />
                      
                      {/* Filter Panel - beneath source selection as requested */}
                      <div className="pt-6 border-t border-gray-100 mt-6">
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
                  </div>
                </div>
              </div>
            </div>

            {/* Continue Button */}
            <div className="text-center">
              <button
                onClick={handleContinue}
                disabled={!canContinue}
                className={`px-8 py-3 text-lg font-semibold rounded-xl transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-primary-200 focus:ring-offset-2 ${
                  canContinue
                    ? 'bg-gradient-to-r from-primary-600 to-secondary-600 text-white hover:from-primary-700 hover:to-secondary-700 shadow-medium hover:shadow-strong'
                    : 'bg-gray-200 text-gray-500 cursor-not-allowed shadow-soft'
                }`}
                aria-label="Continue to topic selection"
              >
                {canContinue ? 'Continue to Topics →' : 'Select a source to continue'}
              </button>
            </div>

            {/* FAQ Section */}
            <div className="border-t border-gray-100 pt-8">
              <div className="bg-white rounded-xl shadow-soft border border-gray-50 p-6">
                <FAQ className="max-w-2xl mx-auto" />
              </div>
            </div>

            {/* Bottom spacing for mobile */}
            <div className="h-8"></div>
          </div>
        </div>
      </main>
    </div>
  )
}