interface ErrorMessageProps {
  title?: string
  message: string
  onRetry?: () => void
  onDismiss?: () => void
  onReset?: () => void
  type?: 'error' | 'warning' | 'info'
  steps?: string[]
  helpText?: string
  variant?: 'default' | 'detailed' | 'compact'
}

export default function ErrorMessage({
  title = 'Something went wrong',
  message,
  onRetry,
  onDismiss,
  onReset,
  type = 'error',
  steps = [],
  helpText,
  variant = 'default'
}: ErrorMessageProps) {
  const getColorClasses = () => {
    switch (type) {
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800'
      case 'info':
        return 'bg-blue-50 border-blue-200 text-blue-800'
      default:
        return 'bg-red-50 border-red-200 text-red-800'
    }
  }

  const getIconClasses = () => {
    switch (type) {
      case 'warning':
        return 'text-yellow-400'
      case 'info':
        return 'text-blue-400'
      default:
        return 'text-red-400'
    }
  }

  const getIcon = () => {
    switch (type) {
      case 'warning':
        return '⚠️'
      case 'info':
        return 'ℹ️'
      default:
        return '❌'
    }
  }

  const isCompact = variant === 'compact'
  const isDetailed = variant === 'detailed'

  return (
    <div className={`border-2 rounded-2xl ${isCompact ? 'p-3' : 'p-4 sm:p-6'} ${getColorClasses()} shadow-soft`} role="alert">
      <div className="flex items-start">
        <div className={`flex-shrink-0 ${getIconClasses()}`}>
          <span className={`${isCompact ? 'text-lg' : 'text-xl sm:text-2xl'}`} aria-hidden="true">
            {getIcon()}
          </span>
        </div>
        
        <div className="ml-3 sm:ml-4 flex-1 min-w-0">
          <h3 className={`${isCompact ? 'text-sm' : 'text-base sm:text-lg'} font-semibold leading-tight`}>{title}</h3>
          <p className={`mt-1 sm:mt-2 ${isCompact ? 'text-sm' : 'text-sm sm:text-base'} leading-relaxed`}>{message}</p>
          
          {/* Recovery Steps for detailed variant */}
          {isDetailed && steps.length > 0 && (
            <div className="mt-4 sm:mt-6">
              <h4 className="text-sm font-medium mb-3">Try these steps:</h4>
              <ol className="space-y-2">
                {steps.map((step, index) => (
                  <li key={index} className="flex items-start space-x-2 text-sm">
                    <span className="flex-shrink-0 w-5 h-5 bg-white bg-opacity-50 rounded-full flex items-center justify-center text-xs font-medium">
                      {index + 1}
                    </span>
                    <span className="leading-relaxed">{step}</span>
                  </li>
                ))}
              </ol>
            </div>
          )}
          
          {/* Help text */}
          {helpText && (
            <div className={`mt-3 sm:mt-4 p-3 bg-white bg-opacity-50 rounded-lg border border-white border-opacity-30`}>
              <p className="text-xs sm:text-sm font-medium flex items-start">
                <span className="mr-2" aria-hidden="true">💡</span>
                <span>{helpText}</span>
              </p>
            </div>
          )}
          
          {/* Action buttons */}
          {(onRetry || onDismiss || onReset) && (
            <div className={`${isCompact ? 'mt-3' : 'mt-4 sm:mt-6'} flex flex-col sm:flex-row gap-2 sm:gap-3`}>
              {onRetry && (
                <button
                  onClick={onRetry}
                  className={`inline-flex items-center justify-center px-4 py-2 text-sm font-semibold rounded-xl border-2 border-white border-opacity-30 bg-white bg-opacity-20 hover:bg-opacity-30 focus:outline-none focus:ring-4 focus:ring-white focus:ring-opacity-50 transition-all duration-200 min-h-[44px]`}
                >
                  <span className="mr-2" aria-hidden="true">🔄</span>
                  Try Again
                </button>
              )}
              {onReset && (
                <button
                  onClick={onReset}
                  className={`inline-flex items-center justify-center px-4 py-2 text-sm font-semibold rounded-xl border-2 border-white border-opacity-30 bg-white bg-opacity-20 hover:bg-opacity-30 focus:outline-none focus:ring-4 focus:ring-white focus:ring-opacity-50 transition-all duration-200 min-h-[44px]`}
                >
                  <span className="mr-2" aria-hidden="true">🏠</span>
                  Start Over
                </button>
              )}
              {onDismiss && (
                <button
                  onClick={onDismiss}
                  className={`inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-xl border-2 border-white border-opacity-30 bg-transparent hover:bg-white hover:bg-opacity-20 focus:outline-none focus:ring-4 focus:ring-white focus:ring-opacity-50 transition-all duration-200 min-h-[44px] sm:ml-auto`}
                >
                  Dismiss
                </button>
              )}
            </div>
          )}
        </div>
        
        {/* Close button for non-compact variants */}
        {!isCompact && onDismiss && (
          <div className="ml-auto pl-3">
            <button
              onClick={onDismiss}
              className="inline-flex rounded-xl p-2 hover:bg-white hover:bg-opacity-20 focus:outline-none focus:ring-4 focus:ring-white focus:ring-opacity-50 transition-all duration-200 min-w-[44px] min-h-[44px] items-center justify-center"
              aria-label="Dismiss error message"
            >
              <span className="text-xl font-bold">×</span>
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export function NetworkErrorMessage({ onRetry, onReset }: { onRetry?: () => void, onReset?: () => void }) {
  return (
    <ErrorMessage
      title="Connection Problem"
      message="We're having trouble connecting to news sources. This might be due to network issues or high server load."
      onRetry={onRetry}
      onReset={onReset}
      type="error"
      variant="detailed"
      steps={[
        "Check your internet connection",
        "Try refreshing the page",
        "Wait a few minutes and try again",
        "Use different news sources if the problem persists"
      ]}
      helpText="If you continue experiencing issues, try selecting fewer sources or using a different date range to reduce server load."
    />
  )
}

export function NoResultsMessage({ topic, onReset }: { topic: string, onReset?: () => void }) {
  return (
    <ErrorMessage
      title="No Articles Found"
      message={`We couldn't find any articles about "${topic}" from your selected sources in the chosen timeframe.`}
      onReset={onReset}
      type="info"
      variant="detailed"
      steps={[
        "Try expanding your date range (select 'Last month' instead of 'Last week')",
        "Choose different or additional news sources",
        "Search for a broader topic or use different keywords",
        "Check if your language and country filters are too restrictive"
      ]}
      helpText="Some topics may have limited coverage in certain time periods. Popular topics like 'Economy' or 'Technology' typically have more articles available."
    />
  )
}

export function APIErrorMessage({ onRetry, onReset }: { onRetry?: () => void, onReset?: () => void }) {
  return (
    <ErrorMessage
      title="News API Unavailable"
      message="The news service is temporarily unavailable. This could be due to rate limits or server maintenance."
      onRetry={onRetry}
      onReset={onReset}
      type="warning"
      variant="detailed"
      steps={[
        "Wait 5-10 minutes before trying again",
        "Try using fewer news sources to reduce API load",
        "Select a shorter date range",
        "Check if your API key is valid and has remaining quota"
      ]}
      helpText="News API services have usage limits. If you're using a free plan, you might have reached your daily quota. Premium plans have higher limits."
    />
  )
}

export function ValidationErrorMessage({ field, onReset }: { field: string, onReset?: () => void }) {
  return (
    <ErrorMessage
      title="Invalid Selection"
      message={`There's an issue with your ${field} selection. Please review and update your choices.`}
      onReset={onReset}
      type="warning"
      variant="detailed"
      steps={[
        "Check that all required fields are filled",
        "Ensure selected sources are still available",
        "Verify that your search terms are appropriate",
        "Try refreshing the page if sources aren't loading"
      ]}
      helpText="If you continue having issues, try starting over with a fresh selection."
    />
  )
}

export function LoadingTimeoutMessage({ onRetry, onReset }: { onRetry?: () => void, onReset?: () => void }) {
  return (
    <ErrorMessage
      title="Request Taking Too Long"
      message="The search is taking longer than expected. This might be due to high server load or complex filtering."
      onRetry={onRetry}
      onReset={onReset}
      type="warning"
      variant="detailed"
      steps={[
        "Try again with fewer news sources",
        "Use a shorter date range",
        "Select fewer languages or countries",
        "Simplify your search terms"
      ]}
      helpText="Complex searches with many filters can take longer to process. Reducing the scope of your search can improve performance."
    />
  )
}

