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
    <div className="space-y-4">
      {/* Main topic selection - cleaner layout */}
      <div className="space-y-3">
        {/* Popular topics as prominent pills */}
        <div className="flex flex-wrap justify-center gap-2">
          {topics.slice(0, 6).map((topic) => {
            const isSelected = selectedTopic === topic.topic
            
            return (
              <button
                key={topic.topic}
                onClick={() => onTopicChange(topic.topic)}
                className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                  isSelected
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'bg-white text-gray-700 border border-gray-300 hover:border-blue-300 hover:bg-blue-50 shadow-sm hover:shadow-md'
                }`}
                aria-pressed={isSelected}
                title={`Keywords: ${topic.keywords.slice(0, 3).join(', ')}${topic.keywords.length > 3 ? ` +${topic.keywords.length - 3} more` : ''}`}
              >
                {topic.topic}
              </button>
            )
          })}
        </div>

        {/* More topics and custom search */}
        <div className="flex flex-wrap justify-center gap-2">
          {topics.slice(6).map((topic) => {
            const isSelected = selectedTopic === topic.topic
            
            return (
              <button
                key={topic.topic}
                onClick={() => onTopicChange(topic.topic)}
                className={`px-4 py-2 rounded-full text-xs font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                  isSelected
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-600 hover:bg-blue-50 hover:text-blue-700'
                }`}
                aria-pressed={isSelected}
                title={`Keywords: ${topic.keywords.slice(0, 3).join(', ')}${topic.keywords.length > 3 ? ` +${topic.keywords.length - 3} more` : ''}`}
              >
                {topic.topic}
              </button>
            )
          })}
          
          {/* Custom Search Option */}
          <button
            onClick={() => onTopicChange(CUSTOM_SEARCH_TOPIC)}
            className={`px-4 py-2 rounded-full text-xs font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 ${
              selectedTopic === CUSTOM_SEARCH_TOPIC
                ? 'bg-purple-600 text-white shadow-md'
                : 'bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200'
            }`}
            aria-pressed={selectedTopic === CUSTOM_SEARCH_TOPIC}
            title="Enter your own search terms"
          >
            <span className="mr-1">🔍</span>
            {CUSTOM_SEARCH_TOPIC}
          </button>
        </div>
      </div>

      {/* Custom Search Input */}
      {selectedTopic === CUSTOM_SEARCH_TOPIC && (
        <div className="max-w-md mx-auto">
          <CustomSearchInput
            searchTerms={customSearchTerms}
            onSearchTermsChange={onCustomSearchTermsChange}
            placeholder="artificial intelligence, climate policy..."
          />
        </div>
      )}

      {/* Selected topic feedback - minimal */}
      {selectedTopic && selectedTopic !== CUSTOM_SEARCH_TOPIC && (
        <div className="text-center">
          <div className="inline-flex items-center px-3 py-1 bg-blue-50 rounded-full">
            <span className="text-xs text-blue-600">
              {(() => {
                const topic = topics.find(t => t.topic === selectedTopic)
                return topic ? `${topic.keywords.slice(0, 3).join(' • ')}${topic.keywords.length > 3 ? '...' : ''}` : ''
              })()}
            </span>
          </div>
        </div>
      )}

      {/* Custom search feedback - minimal */}
      {selectedTopic === CUSTOM_SEARCH_TOPIC && customSearchTerms.length > 0 && (
        <div className="text-center">
          <div className="inline-flex items-center px-3 py-1 bg-purple-50 rounded-full">
            <span className="text-xs text-purple-600">
              {customSearchTerms.slice(0, 3).join(' • ')}
              {customSearchTerms.length > 3 ? `... +${customSearchTerms.length - 3}` : ''}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}