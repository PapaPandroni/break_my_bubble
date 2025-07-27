import { useState, useCallback } from 'react'

interface FAQItem {
  question: string
  answer: string
}

const faqData: FAQItem[] = [
  {
    question: "How does it work?",
    answer: "Simply select your preferred news sources and choose a topic you're interested in. BreakMyBubble will show you articles from your sources alongside articles from sources with opposing political perspectives, helping you understand different viewpoints on the same issues."
  },
  {
    question: "Where do sources come from?",
    answer: "Our news sources are powered by NewsAPI.org. We've carefully curated and classified over 130 high-quality news sources with political bias ratings to ensure you see genuinely opposing perspectives from credible outlets worldwide."
  },
  {
    question: "How is political bias determined?",
    answer: "Political bias classifications are based on established media bias research and editorial positioning. Each source is rated on a 5-point scale from Left to Right, with confidence scores. These are educational classifications meant to help you understand different perspectives, not to judge source quality."
  },
  {
    question: "What languages are supported?",
    answer: "BreakMyBubble supports 14 languages including English, Spanish, French, German, Arabic, Chinese, and more. Our multilingual search system includes professionally translated keywords for major topics, ensuring you can explore perspectives across language barriers."
  }
]

interface FAQProps {
  className?: string
}

export default function FAQ({ className = '' }: FAQProps) {
  const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set())

  // Memoize toggle function to prevent unnecessary re-renders
  const toggleItem = useCallback((index: number) => {
    setExpandedItems(prevExpanded => {
      const newExpanded = new Set(prevExpanded)
      if (newExpanded.has(index)) {
        newExpanded.delete(index)
      } else {
        newExpanded.add(index)
      }
      return newExpanded
    })
  }, [])

  return (
    <div className={`space-y-3 ${className}`}>
      <h3 className="text-lg font-medium text-gray-900 text-center mb-4">
        Frequently Asked Questions
      </h3>
      
      <div className="space-y-2">
        {faqData.map((item, index) => {
          const isExpanded = expandedItems.has(index)
          
          return (
            <div
              key={index}
              className="border border-gray-200 rounded-lg overflow-hidden"
            >
              <button
                onClick={() => toggleItem(index)}
                className="w-full px-4 py-3 text-left bg-white hover:bg-gray-50 focus:outline-none focus:bg-gray-50 transition-colors"
                aria-expanded={isExpanded}
                aria-controls={`faq-answer-${index}`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-900">
                    {item.question}
                  </span>
                  <span className="text-gray-500 text-lg leading-none">
                    {isExpanded ? '−' : '+'}
                  </span>
                </div>
              </button>
              
              {isExpanded && (
                <div
                  id={`faq-answer-${index}`}
                  className="px-4 pb-3 bg-gray-50 border-t border-gray-100"
                >
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {item.answer}
                  </p>
                </div>
              )}
            </div>
          )
        })}
      </div>
      
      <div className="text-center mt-6">
        <p className="text-xs text-gray-500">
          Ready to explore different perspectives? Let's get started!
        </p>
      </div>
    </div>
  )
}