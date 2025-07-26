interface HeaderProps {
  onReset?: () => void
}

export default function Header({ onReset }: HeaderProps) {
  return (
    <header className="bg-white border-b border-gray-200 px-4 py-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-3xl font-bold text-gray-900">
              Break<span className="text-blue-600">My</span>Bubble
            </h1>
            <div className="hidden md:block text-sm text-gray-600">
              Compare news perspectives across the political spectrum
            </div>
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
        
        <div className="mt-4 md:hidden text-sm text-gray-600">
          Compare news perspectives across the political spectrum
        </div>
        
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
          <p className="text-xs text-yellow-800">
            <span className="font-medium">Note:</span> Bias ratings are educational. 
            Articles link to original sources.
          </p>
        </div>
      </div>
    </header>
  )
}