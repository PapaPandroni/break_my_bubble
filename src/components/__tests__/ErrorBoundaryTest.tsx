import React, { useState } from 'react'
import ErrorBoundary from '../ErrorBoundary'
import ModalErrorBoundary from '../ModalErrorBoundary'
import ResultsErrorBoundary from '../ResultsErrorBoundary'

// Test component that can throw errors on demand
function ErrorThrower({ shouldThrow, errorMessage }: { shouldThrow: boolean; errorMessage: string }) {
  if (shouldThrow) {
    throw new Error(errorMessage)
  }
  
  return (
    <div className="p-4 bg-green-50 border border-green-200 rounded">
      <p className="text-green-800">Component rendered successfully!</p>
    </div>
  )
}

// Test component for async errors
function AsyncErrorThrower({ shouldThrow }: { shouldThrow: boolean }) {
  const [error, setError] = useState<string | null>(null)
  
  React.useEffect(() => {
    if (shouldThrow) {
      // Simulate async error
      setTimeout(() => {
        setError('Async operation failed')
      }, 100)
    }
  }, [shouldThrow])
  
  if (error) {
    throw new Error(error)
  }
  
  return (
    <div className="p-4 bg-blue-50 border border-blue-200 rounded">
      <p className="text-blue-800">Async component rendered successfully!</p>
    </div>
  )
}

/**
 * Test component to demonstrate error boundary functionality.
 * This is only used for testing and development purposes.
 */
export default function ErrorBoundaryTest() {
  const [showModal, setShowModal] = useState(false)
  const [throwSyncError, setThrowSyncError] = useState(false)
  const [throwAsyncError, setThrowAsyncError] = useState(false)
  const [throwModalError, setThrowModalError] = useState(false)
  const [throwResultsError, setThrowResultsError] = useState(false)

  const resetErrors = () => {
    setThrowSyncError(false)
    setThrowAsyncError(false)
    setThrowModalError(false)
    setThrowResultsError(false)
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Error Boundary Test Suite
        </h1>
        <p className="text-gray-600 mb-6">
          This component demonstrates the error boundary functionality. 
          Use the buttons below to trigger different types of errors.
        </p>

        {/* Control Panel */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
          <button
            onClick={() => setThrowSyncError(true)}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Trigger Sync Error
          </button>
          
          <button
            onClick={() => setThrowAsyncError(true)}
            className="px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700"
          >
            Trigger Async Error
          </button>
          
          <button
            onClick={() => {
              setThrowModalError(true)
              setShowModal(true)
            }}
            className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
          >
            Trigger Modal Error
          </button>
          
          <button
            onClick={() => setThrowResultsError(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Trigger Results Error
          </button>
          
          <button
            onClick={resetErrors}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Reset All
          </button>
          
          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
          >
            Show Modal
          </button>
        </div>
      </div>

      {/* Test ErrorBoundary */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          General Error Boundary Test
        </h2>
        
        <ErrorBoundary
          onError={(error, errorInfo) => {
            console.log('Test Error Boundary caught:', error, errorInfo)
          }}
        >
          <ErrorThrower 
            shouldThrow={throwSyncError} 
            errorMessage="Synchronous error for testing" 
          />
        </ErrorBoundary>
      </div>

      {/* Test Async ErrorBoundary */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Async Error Boundary Test
        </h2>
        
        <ErrorBoundary
          onError={(error, errorInfo) => {
            console.log('Async Error Boundary caught:', error, errorInfo)
          }}
        >
          <AsyncErrorThrower shouldThrow={throwAsyncError} />
        </ErrorBoundary>
      </div>

      {/* Test ResultsErrorBoundary */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Results Error Boundary Test
        </h2>
        
        <ResultsErrorBoundary
          onRetrySearch={() => {
            console.log('Retry search clicked')
            setThrowResultsError(false)
          }}
          onReset={() => {
            console.log('Reset clicked')
            resetErrors()
          }}
          searchTopic="Test Topic"
          userSources={['test-source-1', 'test-source-2']}
          onError={(error, errorInfo) => {
            console.log('Results Error Boundary caught:', error, errorInfo)
          }}
        >
          <ErrorThrower 
            shouldThrow={throwResultsError} 
            errorMessage="Results display error for testing" 
          />
        </ResultsErrorBoundary>
      </div>

      {/* Test ModalErrorBoundary */}
      {showModal && (
        <ModalErrorBoundary
          onClose={() => {
            setShowModal(false)
            setThrowModalError(false)
          }}
          modalTitle="Test Modal"
          onError={(error, errorInfo) => {
            console.log('Modal Error Boundary caught:', error, errorInfo)
          }}
        >
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="fixed inset-0 bg-black bg-opacity-50" />
            <div className="flex min-h-full items-center justify-center p-4">
              <div className="relative w-full max-w-md bg-white rounded-lg p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">Test Modal</h3>
                  <button
                    onClick={() => setShowModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                </div>
                
                <ErrorThrower 
                  shouldThrow={throwModalError} 
                  errorMessage="Modal content error for testing" 
                />
                
                <div className="mt-4 flex justify-end">
                  <button
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </ModalErrorBoundary>
      )}

      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-blue-900 mb-2">
          Testing Instructions
        </h2>
        <ul className="text-blue-800 space-y-1 text-sm">
          <li>• <strong>Sync Error:</strong> Immediately triggers an error during render</li>
          <li>• <strong>Async Error:</strong> Triggers an error after a short delay</li>
          <li>• <strong>Modal Error:</strong> Opens a modal and triggers an error inside it</li>
          <li>• <strong>Results Error:</strong> Triggers an error in the results display context</li>
          <li>• <strong>Reset All:</strong> Clears all error states</li>
          <li>• <strong>Show Modal:</strong> Opens a modal without triggering an error</li>
        </ul>
        <p className="mt-3 text-sm text-blue-700">
          Check the browser console for error logging output when testing error boundaries.
        </p>
      </div>
    </div>
  )
}