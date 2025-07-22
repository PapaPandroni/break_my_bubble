import { TopicKeywords } from '../types'
import CustomSearchInput from './CustomSearchInput'

const CUSTOM_SEARCH_TOPIC = 'Custom Search'

interface TopicSelectorProps {
  topics: TopicKeywords[]
  selectedTopic: string
  onTopicChange: (topic: string) => void
  customSearchTerms?: string[]
  onCustomSearchTermsChange?: (terms: string[]) => void
}

export default function TopicSelector({
  topics,
  selectedTopic,
  onTopicChange,
  customSearchTerms = [],
  onCustomSearchTermsChange = () => {},
}: TopicSelectorProps) {
  return (
    <div className="space-y-3">
      <div className="text-center">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Choose a topic
        </label>
      </div>

      {/* Horizontal pill layout */}
      <div className="flex flex-wrap justify-center gap-2">
        {topics.map((topic) => {
          const isSelected = selectedTopic === topic.topic
          
          return (
            <button
              key={topic.topic}
              onClick={() => onTopicChange(topic.topic)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                isSelected
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-white text-gray-700 border border-gray-300 hover:border-gray-400 hover:bg-gray-50 shadow-sm'
              }`}
              aria-pressed={isSelected}
              title={`Keywords: ${topic.keywords.slice(0, 3).join(', ')}${topic.keywords.length > 3 ? ` +${topic.keywords.length - 3} more` : ''}`}
            >
              {topic.topic}
              {isSelected && <span className="ml-1">✓</span>}
            </button>
          )
        })}
        
        {/* Custom Search Option */}
        <button
          onClick={() => onTopicChange(CUSTOM_SEARCH_TOPIC)}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
            selectedTopic === CUSTOM_SEARCH_TOPIC
              ? 'bg-purple-600 text-white shadow-md'
              : 'bg-white text-purple-700 border border-purple-300 hover:border-purple-400 hover:bg-purple-50 shadow-sm'
          }`}
          aria-pressed={selectedTopic === CUSTOM_SEARCH_TOPIC}
          title="Enter your own search terms"
        >
          <span className="mr-1">🔍</span>
          {CUSTOM_SEARCH_TOPIC}
          {selectedTopic === CUSTOM_SEARCH_TOPIC && <span className="ml-1">✓</span>}
        </button>
      </div>

      {/* Custom Search Input */}
      {selectedTopic === CUSTOM_SEARCH_TOPIC && (
        <div className="mt-4">
          <CustomSearchInput
            searchTerms={customSearchTerms}
            onSearchTermsChange={onCustomSearchTermsChange}
            placeholder="Enter your search terms (e.g., artificial intelligence, climate policy, sports news)"
          />
        </div>
      )}

      {/* Compact selected topic info */}
      {selectedTopic && selectedTopic !== CUSTOM_SEARCH_TOPIC && (
        <div className="text-center">
          <div className="inline-flex items-center px-3 py-1 bg-blue-50 border border-blue-200 rounded-full">
            <span className="text-xs text-blue-700">
              {(() => {
                const topic = topics.find(t => t.topic === selectedTopic)
                return topic ? `Searching: ${topic.keywords.slice(0, 3).join(', ')}${topic.keywords.length > 3 ? '...' : ''}` : ''
              })()}
            </span>
          </div>
        </div>
      )}

      {/* Custom search info */}
      {selectedTopic === CUSTOM_SEARCH_TOPIC && customSearchTerms.length > 0 && (
        <div className="text-center">
          <div className="inline-flex items-center px-3 py-1 bg-purple-50 border border-purple-200 rounded-full">
            <span className="text-xs text-purple-700">
              Custom search: {customSearchTerms.slice(0, 3).join(', ')}
              {customSearchTerms.length > 3 ? ` +${customSearchTerms.length - 3} more` : ''}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}