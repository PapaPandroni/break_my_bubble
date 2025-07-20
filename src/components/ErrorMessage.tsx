interface ErrorMessageProps {
  title?: string
  message: string
  onRetry?: () => void
  onDismiss?: () => void
  type?: 'error' | 'warning' | 'info'
}

export default function ErrorMessage({
  title = 'Something went wrong',
  message,
  onRetry,
  onDismiss,
  type = 'error',
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

  return (
    <div className={`border rounded-lg p-4 ${getColorClasses()}`} role="alert">
      <div className="flex items-start">
        <div className={`flex-shrink-0 ${getIconClasses()}`}>
          <span className="text-xl" aria-hidden="true">
            {getIcon()}
          </span>
        </div>
        
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-medium">{title}</h3>
          <p className="mt-1 text-sm">{message}</p>
          
          {(onRetry || onDismiss) && (
            <div className="mt-4 flex space-x-3">
              {onRetry && (
                <button
                  onClick={onRetry}
                  className="text-sm font-medium underline hover:no-underline focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Try again
                </button>
              )}
              {onDismiss && (
                <button
                  onClick={onDismiss}
                  className="text-sm font-medium underline hover:no-underline focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Dismiss
                </button>
              )}
            </div>
          )}
        </div>
        
        {onDismiss && (
          <div className="ml-auto pl-3">
            <button
              onClick={onDismiss}
              className="inline-flex rounded-md p-1.5 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              aria-label="Dismiss"
            >
              <span className="text-lg">×</span>
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export function NetworkErrorMessage({ onRetry }: { onRetry?: () => void }) {
  return (
    <ErrorMessage
      title="Network Error"
      message="Unable to load news feeds. Please check your internet connection and try again."
      onRetry={onRetry}
      type="error"
    />
  )
}

export function NoResultsMessage({ topic }: { topic: string }) {
  return (
    <ErrorMessage
      title="No Articles Found"
      message={`No articles found for "${topic}" in the selected timeframe. Try expanding your time range or selecting a different topic.`}
      type="info"
    />
  )
}

export function CorsErrorMessage({ onRetry }: { onRetry?: () => void }) {
  return (
    <ErrorMessage
      title="Feed Access Issue"
      message="Some news sources are currently unavailable due to access restrictions. This is a common issue with RSS feeds in browsers."
      onRetry={onRetry}
      type="warning"
    />
  )
}