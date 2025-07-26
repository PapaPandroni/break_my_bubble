interface HeaderProps {
  onReset?: () => void
  onTitleClick?: () => void
}

export default function Header({ onReset, onTitleClick }: HeaderProps) {
  return (
    <header className="bg-white border-b border-gray-200 px-4 py-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {onTitleClick ? (
              <button
                onClick={onTitleClick}
                className="text-3xl font-bold text-gray-900 hover:text-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-lg"
                aria-label="Return to start"
              >
                Break<span className="text-blue-600">My</span>Bubble
              </button>
            ) : (
              <h1 className="text-3xl font-bold text-gray-900">
                Break<span className="text-blue-600">My</span>Bubble
              </h1>
            )}
          </div>
          
          {onReset && (
            <button
              onClick={onReset}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              aria-label="Reset all selections"
            >
              Reset
            </button>
          )}
        </div>
        
        <div className="mt-3 p-2 bg-gray-50 border border-gray-200 rounded-md">
          <p className="text-xs text-gray-600 text-center">
            Educational bias ratings • Links to original sources
          </p>
        </div>
      </div>
    </header>
  )
}