import { useMemo, useCallback } from 'react'
import { NewsSource } from '../types'
import SourceInput from './SourceInput'
import FAQ from './FAQ'

interface LandingPageProps {
  sources: NewsSource[]
  selectedSources: string[]
  onSourcesChange: (sources: string[]) => void
  onContinue: () => void
  isLoadingSources: boolean
  allSourcesLoaded: boolean
}

export default function LandingPage({
  sources,
  selectedSources,
  onSourcesChange,
  onContinue,
  isLoadingSources,
  allSourcesLoaded
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
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-4xl mx-auto px-4">
        <div className="min-h-[80vh] flex flex-col justify-center">
          {/* Google-inspired centered layout */}
          <div className="max-w-2xl mx-auto w-full space-y-12">
            
            {/* Hero Section */}
            <div className="text-center space-y-6">
              <div className="space-y-4">
                <h1 className="text-4xl md:text-5xl font-light text-gray-900">
                  BreakMyBubble
                </h1>
                <h2 className="text-xl md:text-2xl font-normal text-gray-700">
                  Discover opposing perspectives
                </h2>
              </div>
            </div>

            {/* Source Selection - Primary Focus */}
            <div className="space-y-6">

              <div className="max-w-lg mx-auto">
                <SourceInput
                  sources={sources}
                  selectedSources={selectedSources}
                  onSourcesChange={handleSourcesChange}
                  isLoading={isLoadingSources}
                  isDynamic={true}
                  allSourcesLoaded={allSourcesLoaded}
                  maxSources={5}
                />
              </div>
            </div>

            {/* Continue Button */}
            <div className="text-center space-y-4">
              <button
                onClick={handleContinue}
                disabled={!canContinue}
                className={`px-8 py-4 text-lg font-medium rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                  canContinue
                    ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg hover:shadow-xl transform hover:scale-105'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
                aria-label="Continue to topic selection"
              >
                Continue
              </button>
              
              {!canContinue && (
                <p className="text-sm text-gray-500">
                  Select a news source to continue
                </p>
              )}
            </div>

            {/* FAQ Section */}
            <div className="border-t border-gray-200 pt-8">
              <FAQ className="max-w-lg mx-auto" />
            </div>

            {/* Bottom spacing for mobile */}
            <div className="h-8"></div>
          </div>
        </div>
      </main>
    </div>
  )
}