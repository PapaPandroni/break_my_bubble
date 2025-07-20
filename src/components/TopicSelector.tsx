import { TopicKeywords } from '../types'

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
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Choose a Topic to Analyze
        </label>
        <p className="text-sm text-gray-500 mb-4">
          Select one topic to see how different sources cover it
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {topics.map((topic) => {
          const isSelected = selectedTopic === topic.topic
          
          return (
            <button
              key={topic.topic}
              onClick={() => onTopicChange(topic.topic)}
              className={`p-4 text-left border-2 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                isSelected
                  ? 'border-blue-500 bg-blue-50 text-blue-900'
                  : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50'
              }`}
              aria-pressed={isSelected}
            >
              <div className="font-medium text-base mb-2">{topic.topic}</div>
              <div className="text-sm opacity-75">
                Keywords: {topic.keywords.slice(0, 3).join(', ')}
                {topic.keywords.length > 3 && ` +${topic.keywords.length - 3} more`}
              </div>
              
              {isSelected && (
                <div className="mt-2 flex items-center text-blue-600">
                  <span className="text-sm font-medium">✓ Selected</span>
                </div>
              )}
            </button>
          )
        })}
      </div>

      {selectedTopic && (
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="text-sm">
            <span className="font-medium text-blue-900">Selected topic:</span>{' '}
            <span className="text-blue-700">{selectedTopic}</span>
          </div>
          {(() => {
            const topic = topics.find(t => t.topic === selectedTopic)
            return topic && (
              <div className="mt-1 text-xs text-blue-600">
                Will search for articles containing: {topic.keywords.join(', ')}
              </div>
            )
          })()}
        </div>
      )}
    </div>
  )
}