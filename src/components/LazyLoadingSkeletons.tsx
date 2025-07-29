// Skeleton components for lazy-loaded components

export function TopicSelectionModalSkeleton() {
  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-2 sm:p-4">
      <div className="bg-white rounded-2xl w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-2xl xl:max-w-4xl max-h-[90vh] overflow-hidden animate-pulse shadow-2xl">
        {/* Modal Header */}
        <div className="p-4 sm:p-6 lg:p-8 border-b border-gray-100 bg-gradient-to-r from-white to-gray-50">
          <div className="flex items-center justify-between">
            <div>
              <div className="h-7 sm:h-8 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded w-40 sm:w-48 mb-1 animate-shimmer"></div>
              <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded w-32 animate-shimmer"></div>
            </div>
            <div className="h-10 w-10 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded-xl animate-shimmer"></div>
          </div>
        </div>
        
        {/* Modal Content */}
        <div className="p-4 sm:p-6 md:p-8 space-y-6 sm:space-y-8 md:space-y-10 max-h-[80vh] sm:max-h-[75vh] md:max-h-[70vh] overflow-y-auto">
          {/* Custom Search Section */}
          <div className="text-center space-y-6">
            <div className="space-y-3">
              <div className="h-8 sm:h-9 md:h-10 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded w-64 sm:w-80 mx-auto animate-shimmer"></div>
              <div className="h-5 sm:h-6 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded w-48 sm:w-64 mx-auto animate-shimmer"></div>
            </div>
            
            <div className="max-w-2xl mx-auto">
              <div className="h-14 sm:h-16 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded-2xl animate-shimmer"></div>
              <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded w-56 mx-auto mt-2 animate-shimmer"></div>
            </div>
          </div>
          
          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center">
              <div className="h-6 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded w-32 animate-shimmer"></div>
            </div>
          </div>
          
          {/* Topic Selection Section */}
          <div className="space-y-4">
            <div className="h-6 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded w-40 mx-auto animate-shimmer"></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="h-12 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded-xl animate-shimmer"></div>
              ))}
            </div>
          </div>
          
          {/* Filter Panel Section */}
          <div>
            <div className="h-6 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded w-36 mb-4 animate-shimmer"></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="space-y-2">
                  <div className="h-5 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded w-24 animate-shimmer"></div>
                  <div className="h-10 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded-lg animate-shimmer"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Modal Footer */}
        <div className="p-4 sm:p-6 lg:p-8 border-t border-gray-100 bg-gradient-to-r from-gray-50 to-white rounded-b-2xl">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 sm:gap-0">
            <div className="h-10 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded-xl w-32 animate-shimmer"></div>
            <div className="flex items-center space-x-4">
              <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded w-48 animate-shimmer"></div>
              <div className="h-14 bg-gradient-to-r from-blue-200 via-blue-100 to-blue-200 rounded-2xl w-40 animate-shimmer"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export function ResultsDisplaySkeleton() {
  return (
    <div className="max-w-4xl mx-auto px-4 mt-6 sm:mt-8 animate-pulse">
      {/* Enhanced Results Header */}
      <div className="mb-6 sm:mb-8 text-center">
        <div className="h-7 sm:h-8 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded w-72 sm:w-96 mx-auto mb-2 animate-shimmer"></div>
        <div className="h-5 sm:h-6 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded w-48 sm:w-64 mx-auto animate-shimmer"></div>
      </div>
      
      {/* Mobile-optimized Results Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
        {/* User Articles Column */}
        <div className="bg-white rounded-2xl shadow-medium border border-gray-100 p-4 sm:p-6">
          <div className="h-6 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded w-40 sm:w-48 mb-4 sm:mb-6 animate-shimmer"></div>
          <div className="space-y-4 sm:space-y-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-soft">
                {/* Mobile-optimized article card skeleton */}
                {i === 0 && (
                  <div className="w-full h-32 sm:h-48 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-shimmer"></div>
                )}
                <div className="p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0 mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="h-6 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded-xl w-16 sm:w-20 animate-shimmer"></div>
                      <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded w-12 sm:w-16 animate-shimmer"></div>
                    </div>
                    <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded w-16 sm:w-20 animate-shimmer self-start sm:self-auto"></div>
                  </div>
                  <div className="space-y-3 sm:space-y-4">
                    <div className="space-y-2">
                      <div className="h-5 sm:h-6 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded animate-shimmer"></div>
                      <div className="h-5 sm:h-6 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded w-4/5 animate-shimmer"></div>
                    </div>
                    <div className="h-8 sm:h-10 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded-lg animate-shimmer"></div>
                    <div className="space-y-2">
                      <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded animate-shimmer"></div>
                      <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded animate-shimmer"></div>
                      <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded w-3/4 animate-shimmer"></div>
                    </div>
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <div className="h-6 sm:h-8 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded-lg w-24 sm:w-28 animate-shimmer"></div>
                      <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded w-16 sm:w-20 animate-shimmer"></div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Opposing Articles Column */}
        <div className="bg-white rounded-2xl shadow-medium border border-gray-100 p-4 sm:p-6">
          <div className="h-6 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded w-44 sm:w-52 mb-4 sm:mb-6 animate-shimmer"></div>
          <div className="space-y-4 sm:space-y-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i + 3} className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-soft">
                {/* Mobile-optimized article card skeleton */}
                {i === 0 && (
                  <div className="w-full h-32 sm:h-48 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-shimmer"></div>
                )}
                <div className="p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0 mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="h-6 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded-xl w-16 sm:w-20 animate-shimmer"></div>
                      <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded w-12 sm:w-16 animate-shimmer"></div>
                    </div>
                    <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded w-16 sm:w-20 animate-shimmer self-start sm:self-auto"></div>
                  </div>
                  <div className="space-y-3 sm:space-y-4">
                    <div className="space-y-2">
                      <div className="h-5 sm:h-6 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded animate-shimmer"></div>
                      <div className="h-5 sm:h-6 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded w-4/5 animate-shimmer"></div>
                    </div>
                    <div className="h-8 sm:h-10 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded-lg animate-shimmer"></div>
                    <div className="space-y-2">
                      <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded animate-shimmer"></div>
                      <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded animate-shimmer"></div>
                      <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded w-3/4 animate-shimmer"></div>
                    </div>
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <div className="h-6 sm:h-8 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded-lg w-24 sm:w-28 animate-shimmer"></div>
                      <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded w-16 sm:w-20 animate-shimmer"></div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export function FilterPanelSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-pulse">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="space-y-2">
          <div className="h-5 bg-gray-200 rounded w-24"></div>
          <div className="h-10 bg-gray-200 rounded"></div>
        </div>
      ))}
    </div>
  )
}