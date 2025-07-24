import { useState } from 'react'
import { NewsLanguage } from '../types'
import { AVAILABLE_LANGUAGES } from '../services/unifiedSourceService'

interface LanguageSelectorProps {
  selectedLanguages: NewsLanguage[]
  onLanguagesChange: (languages: NewsLanguage[]) => void
  disabled?: boolean
  maxLanguages?: number
}

export default function LanguageSelector({
  selectedLanguages,
  onLanguagesChange,
  disabled = false,
  maxLanguages = 5
}: LanguageSelectorProps) {
  const [showDropdown, setShowDropdown] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  // Filter languages based on search
  const filteredLanguages = AVAILABLE_LANGUAGES.filter(lang =>
    lang.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lang.nativeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lang.code.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleLanguageToggle = (languageCode: NewsLanguage) => {
    const isSelected = selectedLanguages.includes(languageCode)
    
    if (isSelected) {
      onLanguagesChange(selectedLanguages.filter(code => code !== languageCode))
    } else {
      if (selectedLanguages.length < maxLanguages) {
        onLanguagesChange([...selectedLanguages, languageCode])
      }
    }
  }

  const handleSelectAll = () => {
    const visibleLanguageCodes = filteredLanguages
      .slice(0, maxLanguages)
      .map(lang => lang.code)
    onLanguagesChange(visibleLanguageCodes)
  }

  const handleClearAll = () => {
    onLanguagesChange([])
  }

  const getSelectedLanguageData = () => {
    return AVAILABLE_LANGUAGES.filter(lang => 
      selectedLanguages.includes(lang.code)
    )
  }

  const selectedLanguageData = getSelectedLanguageData()

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select Languages ({selectedLanguages.length}/{maxLanguages})
        </label>
        <p className="text-sm text-gray-500 mb-4">
          Choose which languages to search for news articles. 
          Multiple languages will provide broader coverage but may increase loading time.
        </p>
      </div>

      {/* Selected Languages Display */}
      {selectedLanguages.length > 0 && (
        <div className="space-y-2">
          <div className="text-sm font-medium text-gray-700">Selected Languages:</div>
          <div className="flex flex-wrap gap-2">
            {selectedLanguageData.map((language) => (
              <span
                key={language.code}
                className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 border border-blue-300"
              >
                <span className="mr-2">{language.flag}</span>
                {language.name}
                <button
                  onClick={() => handleLanguageToggle(language.code)}
                  className="ml-2 text-lg leading-none hover:bg-blue-200 rounded-full w-5 h-5 flex items-center justify-center"
                  aria-label={`Remove ${language.name}`}
                  disabled={disabled}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Language Selection Dropdown */}
      <div className="relative">
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          className="w-full px-4 py-3 text-left bg-white border border-gray-300 rounded-lg shadow-sm hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={disabled || selectedLanguages.length >= maxLanguages}
          aria-expanded={showDropdown}
          aria-haspopup="listbox"
        >
          <span className="text-gray-700">
            {selectedLanguages.length >= maxLanguages 
              ? 'Maximum languages selected' 
              : 'Click to select languages...'}
          </span>
          <span className="float-right text-gray-400">
            {showDropdown ? '▲' : '▼'}
          </span>
        </button>

        {showDropdown && !disabled && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg">
            {/* Search and Bulk Actions */}
            <div className="p-3 border-b border-gray-200 space-y-3">
              {/* Search */}
              <input
                type="text"
                placeholder="Search languages..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                autoFocus
              />
              
              {/* Bulk Actions */}
              <div className="flex justify-between items-center">
                <div className="text-xs text-gray-500">
                  {filteredLanguages.length} languages available
                </div>
                <div className="space-x-2">
                  <button
                    onClick={handleSelectAll}
                    className="text-xs text-blue-600 hover:text-blue-800 focus:outline-none"
                    disabled={selectedLanguages.length >= maxLanguages}
                  >
                    Select Popular
                  </button>
                  <span className="text-gray-300">|</span>
                  <button
                    onClick={handleClearAll}
                    className="text-xs text-red-600 hover:text-red-800 focus:outline-none"
                    disabled={selectedLanguages.length === 0}
                  >
                    Clear All
                  </button>
                </div>
              </div>
            </div>
            
            {/* Language List */}
            <div className="max-h-64 overflow-y-auto">
              {filteredLanguages.length === 0 ? (
                <div className="px-4 py-8 text-center text-gray-500">
                  No languages match your search
                </div>
              ) : (
                filteredLanguages.map((language) => {
                  const isSelected = selectedLanguages.includes(language.code)
                  const isDisabled = !isSelected && selectedLanguages.length >= maxLanguages
                  
                  return (
                    <label
                      key={language.code}
                      className={`flex items-center px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0 ${
                        isSelected ? 'bg-blue-50' : ''
                      } ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => !isDisabled && handleLanguageToggle(language.code)}
                        disabled={isDisabled}
                        className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <div className="flex items-center flex-1 min-w-0">
                        <span className="text-2xl mr-3" role="img" aria-label={`${language.name} flag`}>
                          {language.flag}
                        </span>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-gray-900 truncate">
                            {language.name}
                          </div>
                          <div className="text-sm text-gray-500 truncate">
                            {language.nativeName} ({language.code.toUpperCase()})
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
              {selectedLanguages.length > 0 && (
                <div>
                  {selectedLanguages.length} of {maxLanguages} languages selected
                  {selectedLanguages.length >= maxLanguages && (
                    <span className="text-amber-600 ml-2">
                      (Maximum reached)
                    </span>
                  )}
                </div>
              )}
              <div className="mt-1 text-gray-500">
                💡 Tip: Start with English and add 1-2 other languages for best results
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Help Text */}
      {!disabled && (
        <div className="text-xs text-gray-500 space-y-1">
          <div>• More languages = broader coverage but slower loading</div>
          <div>• English sources typically have the most content</div>
          <div>• Some topics may not be available in all languages</div>
        </div>
      )}
      
      {disabled && (
        <div className="text-sm text-amber-600 bg-amber-50 border border-amber-200 rounded-lg p-3">
          <div className="flex items-start">
            <span className="mr-2">⚠️</span>
            <div>
              <div className="font-medium">Language filtering not available</div>
              <div className="text-xs mt-1">
                Multi-language support requires NewsAPI mode. Enable NewsAPI in your environment settings to use this feature.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}