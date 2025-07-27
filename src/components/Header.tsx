interface HeaderProps {
  onReset?: () => void
  onTitleClick?: () => void
}

export default function Header({ onReset, onTitleClick }: HeaderProps) {
  return (
    <header className="bg-gradient-to-r from-white to-gray-50 border-b border-gray-100 px-4 py-8 shadow-soft">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {onTitleClick ? (
              <button
                onClick={onTitleClick}
                className="text-3xl font-bold text-gray-900 hover:text-primary-600 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-primary-200 focus:ring-offset-2 rounded-xl p-2 hover:bg-white hover:shadow-medium transform hover:scale-105"
                aria-label="Return to start"
              >
                Break<span className="text-primary-600">My</span>Bubble <span className="text-gray-500 font-normal">- Discover opposing perspectives</span>
              </button>
            ) : (
              <h1 className="text-3xl font-bold text-gray-900">
                Break<span className="text-primary-600">My</span>Bubble <span className="text-gray-500 font-normal">- Discover opposing perspectives</span>
              </h1>
            )}
          </div>
          
          {onReset && (
            <button
              onClick={onReset}
              className="px-6 py-3 text-sm font-semibold text-gray-700 bg-white border-2 border-gray-200 rounded-xl hover:bg-gray-50 hover:border-primary-300 hover:text-primary-700 focus:outline-none focus:ring-4 focus:ring-primary-200 focus:border-primary-300 transition-all duration-300 shadow-soft hover:shadow-medium transform hover:scale-105"
              aria-label="Reset all selections"
            >
              <span className="flex items-center space-x-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span>Start Over</span>
              </span>
            </button>
          )}
        </div>
        
        <div className="mt-6 p-4 bg-gradient-to-r from-gray-50 to-white border border-gray-100 rounded-xl shadow-soft">
          <p className="text-sm text-gray-600 text-center font-medium flex items-center justify-center space-x-2">
            <span className="w-2 h-2 bg-primary-500 rounded-full"></span>
            <span>Educational bias ratings</span>
            <span className="text-gray-400">•</span>
            <span>Links to original sources</span>
            <span className="w-2 h-2 bg-secondary-500 rounded-full"></span>
          </p>
        </div>
      </div>
    </header>
  )
}