import React, { Component, ReactNode } from 'react'

interface ResultsErrorBoundaryProps {
  children: ReactNode
  onRetrySearch?: () => void
  onReset?: () => void
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void
  searchTopic?: string
  userSources?: string[]
}

interface ResultsErrorBoundaryState {
  hasError: boolean
  error: Error | null
  errorInfo: React.ErrorInfo | null
}

/**
 * Specialized error boundary for results display components.
 * Provides search-specific error handling with options to retry search or reset app.
 */
export default class ResultsErrorBoundary extends Component<ResultsErrorBoundaryProps, ResultsErrorBoundaryState> {
  constructor(props: ResultsErrorBoundaryProps) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    }
  }

  static getDerivedStateFromError(error: Error): Partial<ResultsErrorBoundaryState> {
    return {
      hasError: true,
      error
    }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({
      error,
      errorInfo
    })

    // Log error for debugging (only in development)
    if (import.meta.env.DEV) {
      console.group('🚨 Results Error Boundary Caught Error')
      console.error('Search Topic:', this.props.searchTopic || 'Unknown')
      console.error('User Sources:', this.props.userSources || [])
      console.error('Error:', error)
      console.error('Error Info:', errorInfo)
      console.error('Component Stack:', errorInfo.componentStack)
      console.groupEnd()
    }

    // Call custom error handler if provided
    if (this.props.onError) {
      try {
        this.props.onError(error, errorInfo)
      } catch (handlerError) {
        console.error('Error in results error handler:', handlerError)
      }
    }
  }

  handleRetry = () => {
    // Reset error state to retry rendering
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    })
  }

  handleRetrySearch = () => {
    // Reset error state and trigger search retry
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    })
    
    if (this.props.onRetrySearch) {
      this.props.onRetrySearch()
    }
  }

  handleReset = () => {
    // Reset error state and trigger app reset
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    })
    
    if (this.props.onReset) {
      this.props.onReset()
    }
  }

  render() {
    if (this.state.hasError) {
      const { error, errorInfo } = this.state
      const { searchTopic, userSources, onRetrySearch, onReset } = this.props

      return (
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <div className="text-center mb-6">
              {/* Error Icon */}
              <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <svg 
                  className="w-8 h-8 text-red-600" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
                  />
                </svg>
              </div>

              <h2 className="text-2xl font-bold text-red-800 mb-2">
                Error Loading Results
              </h2>
              
              <p className="text-red-700 mb-4 max-w-md mx-auto">
                We encountered an error while displaying your search results. This could be due to a 
                data processing issue or a problem with the article content.
              </p>

              {/* Search Context */}
              {searchTopic && (
                <div className="bg-red-100 rounded-lg p-4 mb-6 text-left">
                  <h3 className="font-semibold text-red-800 mb-2">Search Details:</h3>
                  <div className="text-sm text-red-700 space-y-1">
                    <div>
                      <strong>Topic:</strong> {searchTopic}
                    </div>
                    {userSources && userSources.length > 0 && (
                      <div>
                        <strong>Sources:</strong> {userSources.join(', ')}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Error details in development */}
            {import.meta.env.DEV && error && (
              <details className="mb-6 p-4 bg-red-100 rounded border">
                <summary className="text-sm font-medium text-red-800 cursor-pointer">
                  Technical Details (Development)
                </summary>
                <div className="mt-3 text-xs text-red-700 font-mono">
                  <div className="mb-3">
                    <strong>Error:</strong> {error.message}
                  </div>
                  {error.stack && (
                    <div className="mb-3">
                      <strong>Stack:</strong>
                      <pre className="whitespace-pre-wrap break-all mt-1 max-h-40 overflow-y-auto bg-white p-2 rounded">
                        {error.stack}
                      </pre>
                    </div>
                  )}
                  {errorInfo && errorInfo.componentStack && (
                    <div>
                      <strong>Component Stack:</strong>
                      <pre className="whitespace-pre-wrap break-all mt-1 max-h-40 overflow-y-auto bg-white p-2 rounded">
                        {errorInfo.componentStack}
                      </pre>
                    </div>
                  )}
                </div>
              </details>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row justify-center gap-3">
              <button
                onClick={this.handleRetry}
                className="px-6 py-3 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors"
              >
                Try Again
              </button>
              
              {onRetrySearch && (
                <button
                  onClick={this.handleRetrySearch}
                  className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                >
                  Retry Search
                </button>
              )}
              
              {onReset && (
                <button
                  onClick={this.handleReset}
                  className="px-6 py-3 bg-gray-600 text-white font-medium rounded-lg hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
                >
                  Start Over
                </button>
              )}
            </div>

            {/* Help Text */}
            <div className="mt-6 text-center text-sm text-red-600">
              <p>
                If this problem persists, try refreshing the page or selecting different search parameters.
              </p>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

/**
 * Higher-order component to wrap results components with results-specific error boundary
 */
export function withResultsErrorBoundary<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  resultsErrorBoundaryProps?: Omit<ResultsErrorBoundaryProps, 'children'>
) {
  const WithResultsErrorBoundaryComponent = (props: P) => (
    <ResultsErrorBoundary {...resultsErrorBoundaryProps}>
      <WrappedComponent {...props} />
    </ResultsErrorBoundary>
  )

  WithResultsErrorBoundaryComponent.displayName = `withResultsErrorBoundary(${WrappedComponent.displayName || WrappedComponent.name})`

  return WithResultsErrorBoundaryComponent
}