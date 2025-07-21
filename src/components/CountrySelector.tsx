import { useState } from 'react'

interface CountrySelectorProps {
  selectedCountries: string[]
  onCountriesChange: (countries: string[]) => void
  availableCountries: string[]
  disabled?: boolean
  maxCountries?: number
}

// Country name to flag emoji mapping
const COUNTRY_FLAGS: { [key: string]: string } = {
  'ae': '🇦🇪', // UAE
  'ar': '🇦🇷', // Argentina
  'at': '🇦🇹', // Austria
  'au': '🇦🇺', // Australia
  'be': '🇧🇪', // Belgium
  'bg': '🇧🇬', // Bulgaria
  'br': '🇧🇷', // Brazil
  'ca': '🇨🇦', // Canada
  'ch': '🇨🇭', // Switzerland
  'cn': '🇨🇳', // China
  'co': '🇨🇴', // Colombia
  'cu': '🇨🇺', // Cuba
  'cz': '🇨🇿', // Czech Republic
  'de': '🇩🇪', // Germany
  'eg': '🇪🇬', // Egypt
  'fr': '🇫🇷', // France
  'gb': '🇬🇧', // United Kingdom
  'gr': '🇬🇷', // Greece
  'hk': '🇭🇰', // Hong Kong
  'hu': '🇭🇺', // Hungary
  'id': '🇮🇩', // Indonesia
  'ie': '🇮🇪', // Ireland
  'il': '🇮🇱', // Israel
  'in': '🇮🇳', // India
  'it': '🇮🇹', // Italy
  'jp': '🇯🇵', // Japan
  'kr': '🇰🇷', // South Korea
  'lt': '🇱🇹', // Lithuania
  'lv': '🇱🇻', // Latvia
  'ma': '🇲🇦', // Morocco
  'mx': '🇲🇽', // Mexico
  'my': '🇲🇾', // Malaysia
  'ng': '🇳🇬', // Nigeria
  'nl': '🇳🇱', // Netherlands
  'no': '🇳🇴', // Norway
  'nz': '🇳🇿', // New Zealand
  'ph': '🇵🇭', // Philippines
  'pl': '🇵🇱', // Poland
  'pt': '🇵🇹', // Portugal
  'ro': '🇷🇴', // Romania
  'rs': '🇷🇸', // Serbia
  'ru': '🇷🇺', // Russia
  'sa': '🇸🇦', // Saudi Arabia
  'se': '🇸🇪', // Sweden
  'sg': '🇸🇬', // Singapore
  'si': '🇸🇮', // Slovenia
  'sk': '🇸🇰', // Slovakia
  'th': '🇹🇭', // Thailand
  'tr': '🇹🇷', // Turkey
  'tw': '🇹🇼', // Taiwan
  'ua': '🇺🇦', // Ukraine
  'us': '🇺🇸', // United States
  've': '🇻🇪', // Venezuela
  'za': '🇿🇦', // South Africa
}

// Country code to display name mapping
const COUNTRY_NAMES: { [key: string]: string } = {
  'ae': 'United Arab Emirates',
  'ar': 'Argentina',
  'at': 'Austria',
  'au': 'Australia',
  'be': 'Belgium',
  'bg': 'Bulgaria',
  'br': 'Brazil',
  'ca': 'Canada',
  'ch': 'Switzerland',
  'cn': 'China',
  'co': 'Colombia',
  'cu': 'Cuba',
  'cz': 'Czech Republic',
  'de': 'Germany',
  'eg': 'Egypt',
  'fr': 'France',
  'gb': 'United Kingdom',
  'gr': 'Greece',
  'hk': 'Hong Kong',
  'hu': 'Hungary',
  'id': 'Indonesia',
  'ie': 'Ireland',
  'il': 'Israel',
  'in': 'India',
  'it': 'Italy',
  'jp': 'Japan',
  'kr': 'South Korea',
  'lt': 'Lithuania',
  'lv': 'Latvia',
  'ma': 'Morocco',
  'mx': 'Mexico',
  'my': 'Malaysia',
  'ng': 'Nigeria',
  'nl': 'Netherlands',
  'no': 'Norway',
  'nz': 'New Zealand',
  'ph': 'Philippines',
  'pl': 'Poland',
  'pt': 'Portugal',
  'ro': 'Romania',
  'rs': 'Serbia',
  'ru': 'Russia',
  'sa': 'Saudi Arabia',
  'se': 'Sweden',
  'sg': 'Singapore',
  'si': 'Slovenia',
  'sk': 'Slovakia',
  'th': 'Thailand',
  'tr': 'Turkey',
  'tw': 'Taiwan',
  'ua': 'Ukraine',
  'us': 'United States',
  've': 'Venezuela',
  'za': 'South Africa',
}

export default function CountrySelector({
  selectedCountries,
  onCountriesChange,
  availableCountries,
  disabled = false,
  maxCountries = 3
}: CountrySelectorProps) {
  const [showDropdown, setShowDropdown] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  // Filter countries based on search and availability
  const filteredCountries = availableCountries.filter(countryCode => {
    const countryName = COUNTRY_NAMES[countryCode] || countryCode.toUpperCase()
    return (
      countryName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      countryCode.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })

  const handleCountryToggle = (countryCode: string) => {
    const isSelected = selectedCountries.includes(countryCode)
    
    if (isSelected) {
      onCountriesChange(selectedCountries.filter(code => code !== countryCode))
    } else {
      if (selectedCountries.length < maxCountries) {
        onCountriesChange([...selectedCountries, countryCode])
      }
    }
  }

  const handleSelectPopular = () => {
    // Select popular English-speaking countries
    const popularCountries = ['us', 'gb', 'ca'].filter(country => 
      availableCountries.includes(country) && !selectedCountries.includes(country)
    )
    const toAdd = popularCountries.slice(0, maxCountries - selectedCountries.length)
    onCountriesChange([...selectedCountries, ...toAdd])
  }

  const handleClearAll = () => {
    onCountriesChange([])
  }

  const getCountryDisplay = (countryCode: string) => ({
    code: countryCode,
    name: COUNTRY_NAMES[countryCode] || countryCode.toUpperCase(),
    flag: COUNTRY_FLAGS[countryCode] || '🏳️'
  })

  const selectedCountryData = selectedCountries.map(getCountryDisplay)

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Filter by Country ({selectedCountries.length}/{maxCountries})
        </label>
        <p className="text-sm text-gray-500 mb-4">
          Choose which countries to search for news articles. 
          Leave empty to search all countries.
        </p>
      </div>

      {/* Selected Countries Display */}
      {selectedCountries.length > 0 && (
        <div className="space-y-2">
          <div className="text-sm font-medium text-gray-700">Selected Countries:</div>
          <div className="flex flex-wrap gap-2">
            {selectedCountryData.map((country) => (
              <span
                key={country.code}
                className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 border border-blue-300"
              >
                <span className="mr-2">{country.flag}</span>
                {country.name}
                <button
                  onClick={() => handleCountryToggle(country.code)}
                  className="ml-2 text-lg leading-none hover:bg-blue-200 rounded-full w-5 h-5 flex items-center justify-center"
                  aria-label={`Remove ${country.name}`}
                  disabled={disabled}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Country Selection Dropdown */}
      <div className="relative">
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          className="w-full px-4 py-3 text-left bg-white border border-gray-300 rounded-lg shadow-sm hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={disabled || selectedCountries.length >= maxCountries}
          aria-expanded={showDropdown}
          aria-haspopup="listbox"
        >
          <span className="text-gray-700">
            {disabled 
              ? 'Country selection not available in RSS mode'
              : selectedCountries.length >= maxCountries 
              ? 'Maximum countries selected' 
              : availableCountries.length === 0
              ? 'No countries available'
              : 'Click to select countries...'}
          </span>
          <span className="float-right text-gray-400">
            {showDropdown ? '▲' : '▼'}
          </span>
        </button>

        {showDropdown && !disabled && availableCountries.length > 0 && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg">
            {/* Search and Bulk Actions */}
            <div className="p-3 border-b border-gray-200 space-y-3">
              {/* Search */}
              <input
                type="text"
                placeholder="Search countries..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                autoFocus
              />
              
              {/* Bulk Actions */}
              <div className="flex justify-between items-center">
                <div className="text-xs text-gray-500">
                  {filteredCountries.length} countries available
                </div>
                <div className="space-x-2">
                  <button
                    onClick={handleSelectPopular}
                    className="text-xs text-blue-600 hover:text-blue-800 focus:outline-none"
                    disabled={selectedCountries.length >= maxCountries}
                  >
                    Select Popular
                  </button>
                  <span className="text-gray-300">|</span>
                  <button
                    onClick={handleClearAll}
                    className="text-xs text-red-600 hover:text-red-800 focus:outline-none"
                    disabled={selectedCountries.length === 0}
                  >
                    Clear All
                  </button>
                </div>
              </div>
            </div>
            
            {/* Country List */}
            <div className="max-h-64 overflow-y-auto">
              {filteredCountries.length === 0 ? (
                <div className="px-4 py-8 text-center text-gray-500">
                  No countries match your search
                </div>
              ) : (
                filteredCountries.map((countryCode) => {
                  const country = getCountryDisplay(countryCode)
                  const isSelected = selectedCountries.includes(countryCode)
                  const isDisabled = !isSelected && selectedCountries.length >= maxCountries
                  
                  return (
                    <label
                      key={countryCode}
                      className={`flex items-center px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0 ${
                        isSelected ? 'bg-blue-50' : ''
                      } ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => !isDisabled && handleCountryToggle(countryCode)}
                        disabled={isDisabled}
                        className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <div className="flex items-center flex-1 min-w-0">
                        <span className="text-2xl mr-3" role="img" aria-label={`${country.name} flag`}>
                          {country.flag}
                        </span>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-gray-900 truncate">
                            {country.name}
                          </div>
                          <div className="text-sm text-gray-500 truncate">
                            {countryCode.toUpperCase()}
                          </div>
                        </div>
                        {isSelected && (
                          <span className="text-blue-600 ml-2">✓</span>
                        )}
                      </div>
                    </label>
                  )
                })
              )}
            </div>
            
            {/* Footer with selection info */}
            <div className="p-3 border-t border-gray-200 bg-gray-50 text-xs text-gray-600">
              {selectedCountries.length > 0 && (
                <div>
                  {selectedCountries.length} of {maxCountries} countries selected
                  {selectedCountries.length >= maxCountries && (
                    <span className="text-amber-600 ml-2">
                      (Maximum reached)
                    </span>
                  )}
                </div>
              )}
              <div className="mt-1 text-gray-500">
                💡 Tip: Leave empty to search globally, or select 1-2 specific countries
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Help Text */}
      {!disabled && (
        <div className="text-xs text-gray-500 space-y-1">
          <div>• Fewer countries = more focused but potentially less coverage</div>
          <div>• Popular countries like US, UK typically have most content</div>
          <div>• Some topics may not be available in all countries</div>
        </div>
      )}
      
      {disabled && (
        <div className="text-sm text-amber-600 bg-amber-50 border border-amber-200 rounded-lg p-3">
          <div className="flex items-start">
            <span className="mr-2">⚠️</span>
            <div>
              <div className="font-medium">Country filtering not available</div>
              <div className="text-xs mt-1">
                Country-based filtering requires NewsAPI mode. Enable NewsAPI to use this feature.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}