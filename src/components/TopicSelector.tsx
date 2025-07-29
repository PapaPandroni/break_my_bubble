import { TopicKeywords } from '../types'
import { CUSTOM_SEARCH_TOPIC } from '../constants'
import { announceToScreenReader } from '../utils/accessibility'

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
      {/* All Topics Grid - WCAG compliant with proper touch targets */}
      <div className="flex flex-wrap justify-center gap-3" role="group" aria-labelledby="topic-selection-heading">
        <h5 id="topic-selection-heading" className="sr-only">Choose a topic for news analysis</h5>
        {topics.map((topic) => {
          const isSelected = selectedTopic === topic.topic
          
          return (
            <button
              key={topic.topic}
              onClick={() => {
                if (isSelected) {
                  // Allow deselecting the currently selected topic
                  onTopicChange('')
                  announceToScreenReader(`Deselected topic: ${topic.topic}`, 'polite')
                } else {
                  onTopicChange(topic.topic)
                  announceToScreenReader(`Selected topic: ${topic.topic}`, 'polite')
                }
              }}
              className={`px-6 py-3 rounded-2xl text-sm font-medium transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-primary-200 focus:ring-offset-2 transform hover:scale-105 min-h-[44px] min-w-[44px] ${
                isSelected
                  ? 'bg-primary-600 text-white shadow-medium'
                  : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-primary-300 hover:bg-primary-25 shadow-soft hover:shadow-medium'
              }`}
              aria-pressed={isSelected}
              aria-describedby={`topic-${topic.topic.replace(/\s+/g, '-').toLowerCase()}-desc`}
              title={`Keywords: ${topic.keywords.slice(0, 3).join(', ')}${topic.keywords.length > 3 ? ` +${topic.keywords.length - 3} more` : ''}`}
            >
              {topic.topic}
            </button>
          )
        })}
      </div>
      
      {/* Hidden descriptions for screen readers */}
      {topics.map((topic) => (
        <div 
          key={`desc-${topic.topic}`}
          id={`topic-${topic.topic.replace(/\s+/g, '-').toLowerCase()}-desc`}
          className="sr-only"
        >
          Topic: {topic.topic}. Keywords include: {topic.keywords.slice(0, 5).join(', ')}{topic.keywords.length > 5 ? ` and ${topic.keywords.length - 5} more` : ''}.
        </div>
      ))}

      {/* Selected topic feedback with live region for screen readers */}
      {selectedTopic && selectedTopic !== CUSTOM_SEARCH_TOPIC && (
        <div className="text-center">
          <div className="inline-flex items-center px-4 py-2 bg-primary-50 rounded-xl border border-primary-200 shadow-soft" role="status" aria-live="polite">
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

