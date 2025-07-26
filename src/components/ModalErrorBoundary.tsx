import React, { Component, ReactNode } from 'react'

interface ModalErrorBoundaryProps {
  children: ReactNode
  onClose?: () => void
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void
  modalTitle?: string
}

interface ModalErrorBoundaryState {
  hasError: boolean
  error: Error | null
  errorInfo: React.ErrorInfo | null
}

/**
 * Specialized error boundary for modal components.
 * Provides modal-specific error handling with option to close modal gracefully.
 */
export default class ModalErrorBoundary extends Component<ModalErrorBoundaryProps, ModalErrorBoundaryState> {
  constructor(props: ModalErrorBoundaryProps) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    }
  }

  static getDerivedStateFromError(error: Error): Partial<ModalErrorBoundaryState> {
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
      console.group('🚨 Modal Error Boundary Caught Error')
      console.error('Modal:', this.props.modalTitle || 'Unknown Modal')
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
        console.error('Error in modal error handler:', handlerError)
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

  handleClose = () => {
    // Close the modal and reset error state
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    })
    
    if (this.props.onClose) {
      this.props.onClose()
    }
  }

  render() {
    if (this.state.hasError) {
      const { error, errorInfo } = this.state
      const { modalTitle = 'Modal' } = this.props

      return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          {/* Backdrop */}
          <div className="fixed inset-0 bg-black bg-opacity-50" aria-hidden="true" />
          
          {/* Modal Container */}
          <div className="flex min-h-full items-center justify-center p-4">
            {/* Error Modal Content */}
            <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                    <svg 
                      className="w-5 h-5 text-red-600" 
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
                  <h2 className="text-lg font-semibold text-gray-900">
                    {modalTitle} Error
                  </h2>
                </div>
                
                <button
                  onClick={this.handleClose}
                  className="text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 rounded-lg p-2"
                  aria-label="Close modal"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Content */}
              <div className="p-6">
                <div className="text-center mb-6">
                  <p className="text-gray-700 mb-4">
                    Something went wrong while loading this modal. You can try again or close the modal to continue using the app.
                  </p>
                </div>

                {/* Error details in development */}
                {import.meta.env.DEV && error && (
                  <details className="mb-6 p-3 bg-gray-100 rounded border">
                    <summary className="text-sm font-medium text-gray-800 cursor-pointer">
                      Technical Details (Development)
                    </summary>
                    <div className="mt-2 text-xs text-gray-700 font-mono">
                      <div className="mb-2">
                        <strong>Error:</strong> {error.message}
                      </div>
                      {error.stack && (
                        <div className="mb-2">
                          <strong>Stack:</strong>
                          <pre className="whitespace-pre-wrap break-all mt-1 max-h-32 overflow-y-auto">
                            {error.stack}
                          </pre>
                        </div>
                      )}
                      {errorInfo && errorInfo.componentStack && (
                        <div>
                          <strong>Component Stack:</strong>
                          <pre className="whitespace-pre-wrap break-all mt-1 max-h-32 overflow-y-auto">
                            {errorInfo.componentStack}
                          </pre>
                        </div>
                      )}
                    </div>
                  </details>
                )}

                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={this.handleRetry}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                  >
                    Try Again
                  </button>
                  
                  <button
                    onClick={this.handleClose}
                    className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 text-sm font-medium rounded-lg hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
                  >
                    Close Modal
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

/**
 * Higher-order component to wrap modal components with modal-specific error boundary
 */
export function withModalErrorBoundary<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  modalErrorBoundaryProps?: Omit<ModalErrorBoundaryProps, 'children'>
) {
  const WithModalErrorBoundaryComponent = (props: P) => (
    <ModalErrorBoundary {...modalErrorBoundaryProps}>
      <WrappedComponent {...props} />
    </ModalErrorBoundary>
  )

  WithModalErrorBoundaryComponent.displayName = `withModalErrorBoundary(${WrappedComponent.displayName || WrappedComponent.name})`

  return WithModalErrorBoundaryComponent
}