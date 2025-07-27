import { TopicKeywords } from '../types'
import { CUSTOM_SEARCH_TOPIC } from '../constants'

interface TopicSelectorProps {
  topics: TopicKeywords[]
  selectedTopic: string
  onTopicChange: (topic: string) => void
}

export default function TopicSelector({
  topics,
  selectedTopic,
  onTopicChange,
}: TopicSelectorProps) {
  return (
    <div className="space-y-6">
      {/* All Topics Grid - More Streamlined */}
      <div className="flex flex-wrap justify-center gap-3">
        {topics.map((topic) => {
          const isSelected = selectedTopic === topic.topic
          
          return (
            <button
              key={topic.topic}
              onClick={() => onTopicChange(topic.topic)}
              className={`px-6 py-3 rounded-2xl text-sm font-medium transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-primary-200 focus:ring-offset-2 transform hover:scale-105 ${
                isSelected
                  ? 'bg-primary-600 text-white shadow-medium'
                  : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-primary-300 hover:bg-primary-25 shadow-soft hover:shadow-medium'
              }`}
              aria-pressed={isSelected}
              title={`Keywords: ${topic.keywords.slice(0, 3).join(', ')}${topic.keywords.length > 3 ? ` +${topic.keywords.length - 3} more` : ''}`}
            >
              {topic.topic}
            </button>
          )
        })}
      </div>

      {/* Selected topic feedback - enhanced */}
      {selectedTopic && selectedTopic !== CUSTOM_SEARCH_TOPIC && (
        <div className="text-center">
          <div className="inline-flex items-center px-4 py-2 bg-primary-50 rounded-xl border border-primary-200 shadow-soft">
            <span className="text-sm text-primary-700 font-medium">
              {(() => {
                const topic = topics.find(t => t.topic === selectedTopic)
                return topic ? `Keywords: ${topic.keywords.slice(0, 4).join(' • ')}${topic.keywords.length > 4 ? '...' : ''}` : ''
              })()}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}