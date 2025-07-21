import { useState } from 'react'
import { TimeOption } from '../types'

export interface CustomDateRange {
  type: 'custom'
  fromDate: string
  toDate: string
  days: number
}

export interface PresetDateRange {
  type: 'preset'
  days: number
  label: string
}

export type DateRange = CustomDateRange | PresetDateRange

interface DateRangePickerProps {
  timeOptions: TimeOption[]
  selectedRange: DateRange
  onRangeChange: (range: DateRange) => void
}

export default function DateRangePicker({
  timeOptions,
  selectedRange,
  onRangeChange,
}: DateRangePickerProps) {
  const [showCustom, setShowCustom] = useState(selectedRange.type === 'custom')
  const [customFromDate, setCustomFromDate] = useState(
    selectedRange.type === 'custom' ? selectedRange.fromDate : ''
  )
  const [customToDate, setCustomToDate] = useState(
    selectedRange.type === 'custom' ? selectedRange.toDate : ''
  )

  // Calculate max date (today)
  const today = new Date().toISOString().split('T')[0]
  
  // Calculate min date (3 months ago)
  const maxDaysAgo = 90
  const minDate = new Date()
  minDate.setDate(minDate.getDate() - maxDaysAgo)
  const minDateStr = minDate.toISOString().split('T')[0]

  const handlePresetChange = (days: number, label: string) => {
    onRangeChange({
      type: 'preset',
      days,
      label
    })
    setShowCustom(false)
  }

  const handleCustomDateChange = () => {
    if (customFromDate && customToDate) {
      const fromDate = new Date(customFromDate)
      const toDate = new Date(customToDate)
      const diffTime = Math.abs(toDate.getTime() - fromDate.getTime())
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      
      onRangeChange({
        type: 'custom',
        fromDate: customFromDate,
        toDate: customToDate,
        days: diffDays
      })
    }
  }

  const handleShowCustom = () => {
    setShowCustom(true)
    // Set defaults to last 7 days if no custom dates set
    if (!customFromDate || !customToDate) {
      const to = new Date()
      const from = new Date()
      from.setDate(from.getDate() - 7)
      
      const fromStr = from.toISOString().split('T')[0]
      const toStr = to.toISOString().split('T')[0]
      
      setCustomFromDate(fromStr)
      setCustomToDate(toStr)
      
      onRangeChange({
        type: 'custom',
        fromDate: fromStr,
        toDate: toStr,
        days: 7
      })
    }
  }

  const getCurrentRangeDisplay = () => {
    if (selectedRange.type === 'preset') {
      return selectedRange.label
    } else {
      const from = new Date(selectedRange.fromDate).toLocaleDateString()
      const to = new Date(selectedRange.toDate).toLocaleDateString()
      return `${from} to ${to}`
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Date Range for Articles
        </label>
        <p className="text-sm text-gray-500 mb-4">
          Choose how far back to search for articles on this topic.
        </p>
      </div>

      <div className="space-y-4">
        {/* Current Selection Display */}
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center">
            <span className="text-blue-600 mr-2">📅</span>
            <div>
              <div className="font-medium text-blue-900">
                Selected Range: {getCurrentRangeDisplay()}
              </div>
              <div className="text-sm text-blue-600">
                {selectedRange.type === 'custom' 
                  ? `${Math.max(1, selectedRange.days)} days` 
                  : `Last ${selectedRange.days} days`
                }
              </div>
            </div>
          </div>
        </div>

        {/* Preset Options */}
        {!showCustom && (
          <div className="space-y-3">
            <div className="text-sm font-medium text-gray-700">Quick Presets:</div>
            <div className="grid grid-cols-2 gap-3">
              {timeOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handlePresetChange(option.value, option.label)}
                  className={`px-4 py-3 text-left border rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    selectedRange.type === 'preset' && selectedRange.days === option.value
                      ? 'bg-blue-50 border-blue-300 text-blue-900'
                      : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400'
                  }`}
                >
                  <div className="font-medium">{option.label}</div>
                  <div className="text-sm text-gray-500">
                    Last {option.value} days
                  </div>
                </button>
              ))}
            </div>
            
            <button
              onClick={handleShowCustom}
              className="w-full px-4 py-3 text-left bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg hover:from-purple-100 hover:to-pink-100 transition-all focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <div className="flex items-center">
                <span className="text-purple-600 mr-2">🎯</span>
                <div>
                  <div className="font-medium text-purple-900">Custom Date Range</div>
                  <div className="text-sm text-purple-600">
                    Choose specific start and end dates
                  </div>
                </div>
              </div>
            </button>
          </div>
        )}

        {/* Custom Date Range */}
        {showCustom && (
          <div className="space-y-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium text-gray-700">Custom Date Range</div>
              <button
                onClick={() => setShowCustom(false)}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                ← Back to presets
              </button>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  From Date
                </label>
                <input
                  type="date"
                  value={customFromDate}
                  onChange={(e) => {
                    setCustomFromDate(e.target.value)
                    // Auto-update if both dates are set
                    if (e.target.value && customToDate) {
                      setTimeout(handleCustomDateChange, 100)
                    }
                  }}
                  min={minDateStr}
                  max={customToDate || today}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  To Date
                </label>
                <input
                  type="date"
                  value={customToDate}
                  onChange={(e) => {
                    setCustomToDate(e.target.value)
                    // Auto-update if both dates are set
                    if (customFromDate && e.target.value) {
                      setTimeout(handleCustomDateChange, 100)
                    }
                  }}
                  min={customFromDate || minDateStr}
                  max={today}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div className="text-xs text-gray-500 space-y-1">
              <div>• Maximum range: 90 days ago to today</div>
              <div>• More recent articles typically have better coverage</div>
              <div>• Very old articles may have limited availability</div>
            </div>

            {customFromDate && customToDate && (
              <div className="p-3 bg-green-50 border border-green-200 rounded">
                <div className="text-sm text-green-700">
                  ✓ Custom range selected: {new Date(customFromDate).toLocaleDateString()} to {new Date(customToDate).toLocaleDateString()}
                  ({Math.abs(Math.ceil((new Date(customToDate).getTime() - new Date(customFromDate).getTime()) / (1000 * 60 * 60 * 24)))} days)
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Help Text */}
      <div className="text-xs text-gray-500 space-y-1">
        <div>💡 <strong>Tip:</strong> More recent time ranges usually provide better article coverage</div>
        <div>⚡ Breaking news: Use "Last 24 hours" for the most current coverage</div>
        <div>📊 Analysis: Use "Last week" or longer for comprehensive topic analysis</div>
      </div>
    </div>
  )
}