import { Article } from '../types'
import { truncateText } from '../utils/helpers'
import { formatRelativeTime } from '../utils/dateUtils'

interface ResultsDisplayProps {
  userArticles: Article[]
  opposingArticles: Article[]
  topic: string
  userSources: string[]
}

interface ArticleCardProps {
  article: Article
}

function ArticleCard({ article }: ArticleCardProps) {
  const getPoliticalLeanStyles = (lean: 'left' | 'lean-left' | 'center' | 'lean-right' | 'right' | 'unknown') => {
    switch (lean) {
      case 'left':
        return 'border-l-4 border-blue-600 bg-blue-50'
      case 'lean-left':
        return 'border-l-4 border-blue-400 bg-blue-25'
      case 'center':
        return 'border-l-4 border-gray-500 bg-gray-50'
      case 'lean-right':
        return 'border-l-4 border-red-400 bg-red-25'
      case 'right':
        return 'border-l-4 border-red-600 bg-red-50'
      case 'unknown':
        return 'border-l-4 border-amber-500 bg-amber-25'
    }
  }

  const getPoliticalLeanBadge = (lean: 'left' | 'lean-left' | 'center' | 'lean-right' | 'right' | 'unknown') => {
    switch (lean) {
      case 'left':
        return 'bg-blue-200 text-blue-800 border-blue-400'
      case 'lean-left':
        return 'bg-blue-100 text-blue-700 border-blue-300'
      case 'center':
        return 'bg-gray-100 text-gray-700 border-gray-300'
      case 'lean-right':
        return 'bg-red-100 text-red-700 border-red-300'
      case 'right':
        return 'bg-red-200 text-red-800 border-red-400'
      case 'unknown':
        return 'bg-amber-100 text-amber-700 border-amber-300'
    }
  }

  const getPoliticalLeanLabel = (lean: 'left' | 'lean-left' | 'center' | 'lean-right' | 'right' | 'unknown') => {
    switch (lean) {
      case 'left':
        return 'Left'
      case 'lean-left':
        return 'Lean Left'
      case 'center':
        return 'Center'
      case 'lean-right':
        return 'Lean Right'
      case 'right':
        return 'Right'
      case 'unknown':
        return 'Unknown'
    }
  }

  return (
    <article className={`border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow ${getPoliticalLeanStyles(article.sourceLean)}`}>
      {/* Article Image */}
      {article.imageUrl && (
        <div className="aspect-w-16 aspect-h-9">
          <img
            src={article.imageUrl}
            alt={article.title}
            className="w-full h-48 object-cover"
            onError={(e) => {
              // Hide image if it fails to load
              e.currentTarget.style.display = 'none';
            }}
          />
        </div>
      )}

      <div className="p-4">
        <header className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <span className={`px-2 py-1 text-xs font-medium rounded border ${getPoliticalLeanBadge(article.sourceLean)}`}>
              {article.source}
            </span>
            <span className="text-xs text-gray-500">
              {getPoliticalLeanLabel(article.sourceLean)}
            </span>
          </div>
          <time className="text-xs text-gray-500" dateTime={article.pubDate}>
            {formatRelativeTime(article.pubDate)}
          </time>
        </header>

        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-gray-900 leading-tight">
            <a
              href={article.link}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              {article.title}
            </a>
          </h3>

          {/* Author */}
          {article.author && (
            <div className="flex items-center text-sm text-gray-500">
              <span className="mr-1">✍️</span>
              <span>By {article.author}</span>
            </div>
          )}

          {article.description && (
            <p className="text-gray-600 text-sm leading-relaxed">
              {truncateText(article.description, 200)}
            </p>
          )}

          {/* Content Preview (if available and different from description) */}
          {article.content && article.content !== article.description && (
            <div className="bg-gray-50 p-3 rounded border-l-2 border-gray-300">
              <p className="text-gray-700 text-sm leading-relaxed italic">
                {truncateText(article.content.replace(/\[\+\d+ chars\]$/, ''), 150)}
                {article.content.includes('[+') && (
                  <span className="text-gray-500 ml-1">(preview)</span>
                )}
              </p>
            </div>
          )}

          <div className="flex items-center justify-between pt-2">
            <a
              href={article.link}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium text-blue-600 hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Read full article →
            </a>
            <div className="text-xs text-gray-400">
              External link
            </div>
          </div>
        </div>
      </div>
    </article>
  )
}

function ArticlesList({ articles, title, emptyMessage }: {
  articles: Article[]
  title: string
  emptyMessage: string
}) {
  return (
    <div>
      <h2 className="text-xl font-bold text-gray-900 mb-4">{title}</h2>
      
      {articles.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>{emptyMessage}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {articles.map((article, index) => (
            <ArticleCard key={`${article.source}-${index}`} article={article} />
          ))}
        </div>
      )}
    </div>
  )
}

export default function ResultsDisplay({
  userArticles,
  opposingArticles,
  topic,
  userSources,
}: ResultsDisplayProps) {
  const totalArticles = userArticles.length + opposingArticles.length

  if (totalArticles === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 text-6xl mb-4">📰</div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          No Articles Found
        </h2>
        <p className="text-gray-600 max-w-md mx-auto">
          No articles found for "{topic}" in the selected timeframe. 
          Try expanding your time range or selecting a different topic.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Results Summary */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Perspective Comparison: {topic}
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
          <div className="p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{userArticles.length}</div>
            <div className="text-sm text-blue-700">Your Sources</div>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-600">{opposingArticles.length}</div>
            <div className="text-sm text-gray-700">Other Perspectives</div>
          </div>
          <div className="p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{totalArticles}</div>
            <div className="text-sm text-green-700">Total Articles</div>
          </div>
        </div>

        <div className="mt-4 text-sm text-gray-600">
          <p>
            Comparing coverage of <strong>"{topic}"</strong> across {userSources.length} of your 
            preferred sources vs. alternative perspectives from other news outlets.
          </p>
        </div>
      </div>

      {/* Side-by-side comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <ArticlesList
          articles={userArticles}
          title={`Your Sources (${userArticles.length})`}
          emptyMessage="No articles found from your selected sources for this topic and timeframe."
        />

        <ArticlesList
          articles={opposingArticles}
          title={`Other Perspectives (${opposingArticles.length})`}
          emptyMessage="No articles found from alternative sources for this topic and timeframe."
        />
      </div>

      {/* Footer note */}
      <div className="text-center text-sm text-gray-500 pt-8 border-t">
        <p>
          All articles link to their original sources. Political lean classifications are for educational purposes.
          Consider reading articles from multiple perspectives to form a well-rounded understanding.
        </p>
      </div>
    </div>
  )
}