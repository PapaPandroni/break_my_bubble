import React, { Component, ReactNode } from 'react'

interface LazyLoadErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void
  componentName?: string
  onRetry?: () => void
}

interface LazyLoadErrorBoundaryState {
  hasError: boolean
  error: Error | null
  isLazyLoadError: boolean
  retryCount: number
}

/**
 * Specialized error boundary for handling lazy loading failures
 * Provides retry functionality and specific handling for chunk load errors
 */
export default class LazyLoadErrorBoundary extends Component<LazyLoadErrorBoundaryProps, LazyLoadErrorBoundaryState> {
  private retryTimeoutId: number | null = null
  private maxRetries = 3

  constructor(props: LazyLoadErrorBoundaryProps) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      isLazyLoadError: false,
      retryCount: 0
    }
  }

  static getDerivedStateFromError(error: Error): Partial<LazyLoadErrorBoundaryState> {
    // Check if this is a lazy loading/chunk loading error
    const isLazyLoadError = 
      error.message.includes('Loading chunk') ||
      error.message.includes('dynamically imported module') ||
      error.message.includes('ChunkLoadError') ||
      error.name === 'ChunkLoadError' ||
      // Network errors during dynamic imports
      (error.message.includes('Failed to fetch') && error.stack?.includes('import()'))

    return {
      hasError: true,
      error,
      isLazyLoadError
    }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error details
    if (import.meta.env.DEV) {
      console.group('🔄 Lazy Load Error Boundary Caught Error')
      console.error('Component:', this.props.componentName || 'Unknown')
      console.error('Error:', error)
      console.error('Error Info:', errorInfo)
      console.error('Is Lazy Load Error:', this.state.isLazyLoadError)
      console.groupEnd()
    }

    // Call parent error handler
    this.props.onError?.(error, errorInfo)

    // For lazy load errors, attempt automatic retry if under limit
    if (this.state.isLazyLoadError && this.state.retryCount < this.maxRetries) {
      this.scheduleRetry()
    }
  }

  scheduleRetry = () => {
    // Clear any existing timeout
    if (this.retryTimeoutId) {
      clearTimeout(this.retryTimeoutId)
    }

    // Schedule retry with exponential backoff
    const delay = Math.min(1000 * Math.pow(2, this.state.retryCount), 10000)
    
    this.retryTimeoutId = window.setTimeout(() => {
      this.setState(prev => ({
        hasError: false,
        error: null,
        isLazyLoadError: false,
        retryCount: prev.retryCount + 1
      }))
    }, delay)
  }

  handleManualRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      isLazyLoadError: false,
      retryCount: 0
    })
    
    // Call external retry handler if provided
    this.props.onRetry?.()
  }

  componentWillUnmount() {
    // Clean up timeout
    if (this.retryTimeoutId) {
      clearTimeout(this.retryTimeoutId)
    }
  }

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback
      }

      // Render appropriate error UI based on error type
      if (this.state.isLazyLoadError) {
        return (
          <div className="flex flex-col items-center justify-center p-8 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="text-yellow-600 mb-4">
              <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            
            <h3 className="text-lg font-semibold text-yellow-800 mb-2">
              Loading Component
            </h3>
            
            <p className="text-yellow-700 text-center mb-4 max-w-md">
              {this.state.retryCount < this.maxRetries 
                ? `Loading component... Retry attempt ${this.state.retryCount + 1}/${this.maxRetries}`
                : 'Failed to load component after multiple attempts. This might be due to network issues.'
              }
            </p>

            {this.state.retryCount >= this.maxRetries && (
              <div className="space-y-2">
                <button
                  onClick={this.handleManualRetry}
                  className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700 transition-colors"
                >
                  Try Again
                </button>
                
                <p className="text-xs text-yellow-600 text-center">
                  Check your internet connection and try refreshing the page
                </p>
              </div>
            )}
            
            {import.meta.env.DEV && (
              <details className="mt-4 w-full">
                <summary className="text-xs text-yellow-600 cursor-pointer">
                  Debug Info (Dev Only)
                </summary>
                <pre className="text-xs bg-yellow-100 p-2 rounded mt-2 overflow-auto">
                  {this.state.error?.message}
                  {'\n\n'}
                  {this.state.error?.stack}
                </pre>
              </details>
            )}
          </div>
        )
      }

      // Generic error fallback for non-lazy-load errors
      return (
        <div className="flex flex-col items-center justify-center p-8 bg-red-50 border border-red-200 rounded-lg">
          <div className="text-red-600 mb-4">
            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          
          <h3 className="text-lg font-semibold text-red-800 mb-2">
            Component Error
          </h3>
          
          <p className="text-red-700 text-center mb-4 max-w-md">
            {this.props.componentName || 'A component'} encountered an error and couldn't be displayed.
          </p>

          <button
            onClick={this.handleManualRetry}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
          
          {import.meta.env.DEV && (
            <details className="mt-4 w-full">
              <summary className="text-xs text-red-600 cursor-pointer">
                Debug Info (Dev Only)
              </summary>
              <pre className="text-xs bg-red-100 p-2 rounded mt-2 overflow-auto">
                {this.state.error?.message}
                {'\n\n'}
                {this.state.error?.stack}
              </pre>
            </details>
          )}
        </div>
      )
    }

    return this.props.children
  }
}