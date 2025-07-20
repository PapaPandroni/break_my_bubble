import { TimeOption } from '../types'

interface TimeSliderProps {
  timeOptions: TimeOption[]
  selectedTimeframe: number
  onTimeframeChange: (timeframe: number) => void
}

export default function TimeSlider({
  timeOptions,
  selectedTimeframe,
  onTimeframeChange,
}: TimeSliderProps) {
  const selectedIndex = timeOptions.findIndex(
    (option) => option.value === selectedTimeframe
  )

  const handleSliderChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const index = parseInt(event.target.value)
    onTimeframeChange(timeOptions[index].value)
  }

  const selectedOption = timeOptions.find(
    (option) => option.value === selectedTimeframe
  )

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Time Range for Articles
        </label>
        <p className="text-sm text-gray-500 mb-4">
          How far back should we look for articles on this topic?
        </p>
      </div>

      <div className="space-y-4">
        {/* Slider */}
        <div className="relative">
          <input
            type="range"
            min="0"
            max={timeOptions.length - 1}
            value={selectedIndex}
            onChange={handleSliderChange}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
            aria-label="Select time range for articles"
          />
          
          {/* Tick marks */}
          <div className="flex justify-between text-xs text-gray-500 mt-2 px-2">
            {timeOptions.map((option, index) => (
              <span
                key={option.value}
                className={`${
                  index === selectedIndex ? 'font-medium text-blue-600' : ''
                }`}
              >
                {option.label}
              </span>
            ))}
          </div>
        </div>

        {/* Selected value display */}
        <div className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-lg">
          <span className="text-sm text-gray-600">Selected timeframe:</span>
          <span className="text-sm font-medium text-gray-900">
            {selectedOption?.label}
          </span>
        </div>

        {/* Time option buttons (alternative interface) */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2 pt-2">
          {timeOptions.map((option) => {
            const isSelected = option.value === selectedTimeframe
            
            return (
              <button
                key={option.value}
                onClick={() => onTimeframeChange(option.value)}
                className={`px-3 py-2 text-sm font-medium rounded-md border transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  isSelected
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
                aria-pressed={isSelected}
              >
                {option.label}
              </button>
            )
          })}
        </div>
      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
          .slider::-webkit-slider-thumb {
            appearance: none;
            height: 20px;
            width: 20px;
            border-radius: 50%;
            background: #3b82f6;
            cursor: pointer;
            border: 2px solid white;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          }

          .slider::-moz-range-thumb {
            height: 20px;
            width: 20px;
            border-radius: 50%;
            background: #3b82f6;
            cursor: pointer;
            border: 2px solid white;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          }
        `
      }} />
    </div>
  )
}