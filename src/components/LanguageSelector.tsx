import { useState, useRef } from 'react'
import { NewsLanguage } from '../types'
import { AVAILABLE_LANGUAGES } from '../services/unifiedSourceService'
import { generateId, announceToScreenReader } from '../utils/accessibility'

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
  
  // Generate stable IDs for accessibility
  const dropdownId = useRef(generateId('language-dropdown')).current
  const searchInputId = useRef(generateId('language-search')).current
  const helpTextId = useRef(generateId('language-help')).current

  // Filter languages based on search
  const filteredLanguages = AVAILABLE_LANGUAGES.filter(lang =>
    lang.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lang.nativeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lang.code.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleLanguageToggle = (languageCode: NewsLanguage) => {
    const isSelected = selectedLanguages.includes(languageCode)
    const language = AVAILABLE_LANGUAGES.find(lang => lang.code === languageCode)
    
    if (isSelected) {
      onLanguagesChange(selectedLanguages.filter(code => code !== languageCode))
      announceToScreenReader(`Removed ${language?.name || languageCode} from selection`, 'polite')
    } else {
      if (selectedLanguages.length < maxLanguages) {
        onLanguagesChange([...selectedLanguages, languageCode])
        announceToScreenReader(`Added ${language?.name || languageCode} to selection`, 'polite')
      } else {
        announceToScreenReader(`Cannot add ${language?.name || languageCode}. Maximum ${maxLanguages} languages allowed`, 'assertive')
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
        <label className="block text-sm font-medium text-gray-700 mb-2" id="language-selector-label">
          Select Languages ({selectedLanguages.length}/{maxLanguages})
        </label>
        <p id={helpTextId} className="text-sm text-gray-500 mb-4">
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
                  className="ml-2 text-lg leading-none hover:bg-blue-200 rounded-full min-w-[44px] min-h-[44px] flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
                  aria-label={`Remove ${language.name} from selection`}
                  title={`Remove ${language.name}`}
                  disabled={disabled}
                  type="button"
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
          onClick={() => {
            const newState = !showDropdown
            setShowDropdown(newState)
            announceToScreenReader(`Language selection dropdown ${newState ? 'opened' : 'closed'}`, 'polite')
          }}
          className="w-full px-4 py-3 text-left bg-white border border-gray-300 rounded-lg shadow-sm hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px] flex items-center justify-between"
          disabled={disabled || selectedLanguages.length >= maxLanguages}
          aria-expanded={showDropdown}
          aria-haspopup="listbox"
          aria-controls={dropdownId}
          aria-describedby={helpTextId}
          type="button"
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
          <div 
            id={dropdownId}
            className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-[80vh] sm:max-h-[60vh] flex flex-col"
            role="listbox"
            aria-labelledby="language-selector-label"
          >
            {/* Search and Bulk Actions */}
            <div className="p-3 border-b border-gray-200 space-y-3">
              {/* Search with accessibility */}
              <label htmlFor={searchInputId} className="sr-only">
                Search available languages
              </label>
              <input
                id={searchInputId}
                type="text"
                placeholder="Search languages..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 min-h-[40px]"
                autoFocus
                autoComplete="off"
                role="searchbox"
                aria-label="Search languages"
              />
              
              {/* Bulk Actions */}
              <div className="flex justify-between items-center">
                <div className="text-xs text-gray-500">
                  {filteredLanguages.length} languages available
                </div>
                <div className="space-x-2">
                  <button
                    onClick={() => {
                      handleSelectAll()
                      announceToScreenReader('Selected popular languages', 'polite')
                    }}
                    className="text-xs text-blue-600 hover:text-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 rounded px-2 py-1 min-h-[44px]"
                    disabled={selectedLanguages.length >= maxLanguages}
                    type="button"
                  >
                    Select Popular
                  </button>
                  <span className="text-gray-300" aria-hidden="true">|</span>
                  <button
                    onClick={() => {
                      handleClearAll()
                      announceToScreenReader('Cleared all language selections', 'polite')
                    }}
                    className="text-xs text-red-600 hover:text-red-800 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1 rounded px-2 py-1 min-h-[44px]"
                    disabled={selectedLanguages.length === 0}
                    type="button"
                  >
                    Clear All
                  </button>
                </div>
              </div>
            </div>
            
            {/* Language List */}
            <div className="flex-1 overflow-y-auto min-h-0">
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
                      className={`flex items-center px-3 sm:px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0 min-h-[56px] ${
                        isSelected ? 'bg-blue-50' : ''
                      } ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                      role="option"
                      aria-selected={isSelected}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => !isDisabled && handleLanguageToggle(language.code)}
                        disabled={isDisabled}
                        className="mr-3 h-4 w-4 text-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 border-gray-300 rounded"
                        aria-describedby={`lang-desc-${language.code}`}
                      />
                      <div className="flex items-center flex-1 min-w-0">
                        <span className="text-2xl mr-3" role="img" aria-label={`${language.name} flag`}>
                          {language.flag}
                        </span>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-gray-900 truncate">
                            {language.name}
                          </div>
                          <div id={`lang-desc-${language.code}`} className="text-sm text-gray-500 truncate">
                            {language.nativeName} ({language.code.toUpperCase()})
                          </div>
                        </div>
                        {isSelected && (
                          <span className="text-blue-600 ml-2" aria-hidden="true">✓</span>
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