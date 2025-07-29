interface LoadingStateProps {
  message?: string
  showProgress?: boolean
  progress?: number
  steps?: string[]
  currentStep?: number
  variant?: 'default' | 'compact' | 'detailed'
}

export default function LoadingState({
  message = 'Loading news articles...',
  showProgress = false,
  progress = 0,
  steps = [],
  currentStep = 0,
  variant = 'default'
}: LoadingStateProps) {
  const isCompact = variant === 'compact'
  const isDetailed = variant === 'detailed'
  
  return (
    <div className={`flex flex-col items-center justify-center ${isCompact ? 'py-6 px-3' : 'py-12 px-4'}`}>
      {/* Enhanced Spinner */}
      <div className="relative">
        <div className={`${isCompact ? 'w-8 h-8' : 'w-12 h-12'} border-4 border-gray-200 border-t-primary-600 rounded-full animate-spin`}></div>
        {showProgress && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className={`${isCompact ? 'text-xs' : 'text-sm'} font-medium text-primary-600`}>
              {Math.round(progress)}%
            </span>
          </div>
        )}
      </div>

      {/* Message */}
      <p className={`${isCompact ? 'mt-2 text-sm' : 'mt-4 text-base'} text-gray-600 text-center max-w-md font-medium`}>
        {message}
      </p>

      {/* Progress bar */}
      {showProgress && (
        <div className={`w-full ${isCompact ? 'max-w-xs mt-2' : 'max-w-sm mt-4'}`}>
          <div className="bg-gray-200 rounded-full h-2.5">
            <div
              className="bg-gradient-to-r from-primary-500 to-secondary-500 h-2.5 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          {progress > 0 && (
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Progress</span>
              <span>{Math.round(progress)}%</span>
            </div>
          )}
        </div>
      )}

      {/* Step-by-step progress for detailed variant */}
      {isDetailed && steps.length > 0 && (
        <div className="mt-6 w-full max-w-md">
          <div className="space-y-3">
            {steps.map((step, index) => {
              const isCompleted = index < currentStep
              const isCurrent = index === currentStep
              // const isPending = index > currentStep
              
              return (
                <div key={index} className="flex items-center space-x-3">
                  <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                    isCompleted ? 'bg-green-500 text-white' :
                    isCurrent ? 'bg-primary-500 text-white animate-pulse' :
                    'bg-gray-200 text-gray-500'
                  }`}>
                    {isCompleted ? '✓' : index + 1}
                  </div>
                  <span className={`text-sm ${
                    isCompleted ? 'text-green-600 font-medium' :
                    isCurrent ? 'text-primary-600 font-semibold' :
                    'text-gray-500'
                  }`}>
                    {step}
                  </span>
                  {isCurrent && (
                    <div className="ml-auto">
                      <div className="w-4 h-4 border-2 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}
      
      {/* Accessibility */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {message} {showProgress && `${Math.round(progress)}% complete`}
        {isDetailed && steps[currentStep] && ` Currently: ${steps[currentStep]}`}
      </div>
    </div>
  )
}

export function ArticleCardSkeleton({ withImage = true }: { withImage?: boolean }) {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden animate-pulse shadow-soft">
      {/* Article Image Skeleton */}
      {withImage && (
        <div className="w-full h-48 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-shimmer"></div>
      )}
      
      <div className="p-4 sm:p-6">
        {/* Header with source and date */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0 mb-4">
          <div className="flex items-center space-x-3">
            <div className="h-6 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded-xl w-20 animate-shimmer"></div>
            <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded w-16 animate-shimmer"></div>
          </div>
          <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded w-20 animate-shimmer self-start sm:self-auto"></div>
        </div>
        
        {/* Article content */}
        <div className="space-y-4">
          {/* Title */}
          <div className="space-y-2">
            <div className="h-6 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded w-full animate-shimmer"></div>
            <div className="h-6 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded w-4/5 animate-shimmer"></div>
          </div>
          
          {/* Author */}
          <div className="h-10 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded-lg animate-shimmer"></div>
          
          {/* Description */}
          <div className="space-y-2">
            <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded w-full animate-shimmer"></div>
            <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded w-full animate-shimmer"></div>
            <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded w-3/4 animate-shimmer"></div>
          </div>
          
          {/* Footer */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
            <div className="h-8 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded-lg w-28 animate-shimmer"></div>
            <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded w-20 animate-shimmer"></div>
          </div>
        </div>
      </div>
    </div>
  )
}

export function ResultsLoadingSkeleton() {
  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Enhanced Results Summary Skeleton */}
      <div className="bg-gradient-to-r from-white to-gray-50 border border-gray-100 rounded-2xl shadow-medium p-6 sm:p-8">
        <div className="text-center mb-6 sm:mb-8">
          <div className="h-8 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded w-64 mx-auto mb-3 animate-shimmer"></div>
          <div className="h-6 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded w-48 mx-auto animate-shimmer"></div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 text-center mb-6 sm:mb-8">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="p-4 sm:p-6 bg-gradient-to-br from-gray-100 to-gray-50 rounded-2xl border border-gray-200 shadow-soft">
              <div className="h-10 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded w-12 mx-auto mb-2 animate-shimmer"></div>
              <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded w-20 mx-auto mb-1 animate-shimmer"></div>
              <div className="h-3 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded w-16 mx-auto animate-shimmer"></div>
            </div>
          ))}
        </div>
        
        <div className="text-center bg-white rounded-xl p-4 border border-gray-100 shadow-soft">
          <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded w-80 mx-auto animate-shimmer"></div>
        </div>
      </div>
      
      {/* Mobile-optimized comparison layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
        {/* User Sources Column */}
        <div className="bg-white rounded-2xl shadow-medium border border-gray-100 p-4 sm:p-6">
          <div className="h-6 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded w-48 mb-4 sm:mb-6 animate-shimmer"></div>
          <div className="space-y-6">
            {[...Array(3)].map((_, i) => (
              <ArticleCardSkeleton key={i} withImage={i === 0} />
            ))}
          </div>
        </div>

        {/* Opposing Sources Column */}
        <div className="bg-white rounded-2xl shadow-medium border border-gray-100 p-4 sm:p-6">
          <div className="h-6 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded w-52 mb-4 sm:mb-6 animate-shimmer"></div>
          <div className="space-y-6">
            {[...Array(3)].map((_, i) => (
              <ArticleCardSkeleton key={i + 3} withImage={i === 0} />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}