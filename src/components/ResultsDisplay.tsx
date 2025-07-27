import { Article } from '../types'
import { truncateText } from '../utils/helpers'
import { formatRelativeTime } from '../utils/dateUtils'
import { getPoliticalLeanColor, getPoliticalLeanLabel, getPoliticalLeanCardStyle } from '../utils/politicalLean'

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
  return (
    <article className={`border border-gray-100 rounded-2xl overflow-hidden hover:shadow-strong transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1 ${getPoliticalLeanCardStyle(article.sourceLean)}`}>
      {/* Enhanced Article Image */}
      {article.imageUrl && (
        <div className="aspect-w-16 aspect-h-9 relative overflow-hidden">
          <img
            src={article.imageUrl}
            alt={article.title}
            className="w-full h-48 object-cover transition-transform duration-300 hover:scale-105"
            onError={(e) => {
              // Hide image if it fails to load
              e.currentTarget.style.display = 'none';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
        </div>
      )}

      <div className="p-6">
        <header className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <span className={`px-3 py-1.5 text-xs font-semibold rounded-xl border-2 ${getPoliticalLeanColor(article.sourceLean)}`}>
              {article.source}
            </span>
            <span className={`text-sm font-medium ${
              article.sourceLean === 'left' ? 'text-strong-left-600' :
              article.sourceLean === 'lean-left' ? 'text-lean-left-600' :
              article.sourceLean === 'center' ? 'text-center-600' :
              article.sourceLean === 'lean-right' ? 'text-lean-right-600' :
              article.sourceLean === 'right' ? 'text-strong-right-600' :
              'text-unknown-600'
            }`}>
              {getPoliticalLeanLabel(article.sourceLean)}
            </span>
          </div>
          <time className="text-sm text-gray-500 font-medium" dateTime={article.pubDate}>
            {formatRelativeTime(article.pubDate)}
          </time>
        </header>

        <div className="space-y-4">
          <h3 className="text-xl font-bold text-gray-900 leading-tight">
            <a
              href={article.link}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-primary-600 transition-colors duration-200 focus:outline-none focus:ring-4 focus:ring-primary-200 focus:ring-offset-2 rounded-lg"
            >
              {article.title}
            </a>
          </h3>

          {/* Enhanced Author */}
          {article.author && (
            <div className="flex items-center text-sm text-gray-600 bg-gray-50 rounded-lg px-3 py-2">
              <span className="text-base mr-2">✍️</span>
              <span className="font-medium">By {article.author}</span>
            </div>
          )}

          {article.description && (
            <p className="text-gray-700 text-sm leading-relaxed font-medium">
              {truncateText(article.description, 200)}
            </p>
          )}

          {/* Enhanced Content Preview */}
          {article.content && article.content !== article.description && (
            <div className="bg-gradient-to-r from-gray-50 to-gray-25 p-4 rounded-xl border-l-4 border-gray-200 shadow-soft">
              <p className="text-gray-700 text-sm leading-relaxed italic">
                {truncateText(article.content.replace(/\[\+\d+ chars\]$/, ''), 150)}
                {article.content.includes('[+') && (
                  <span className="text-gray-500 ml-1 font-medium">(preview)</span>
                )}
              </p>
            </div>
          )}

          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
            <a
              href={article.link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center text-sm font-semibold text-primary-600 hover:text-primary-700 focus:outline-none focus:ring-4 focus:ring-primary-200 focus:ring-offset-2 rounded-lg px-3 py-2 hover:bg-primary-25 transition-all duration-200"
            >
              Read full article
              <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
            <div className="text-xs text-gray-400 font-medium">
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
    <div className="bg-white rounded-2xl shadow-medium border border-gray-100 p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
        <span className="w-2 h-8 bg-primary-500 rounded-full mr-3"></span>
        {title}
      </h2>
      
      {articles.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <div className="text-4xl mb-4">📄</div>
          <p className="font-medium">{emptyMessage}</p>
        </div>
      ) : (
        <div className="space-y-6">
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
      <div className="text-center py-16 bg-white rounded-2xl shadow-medium border border-gray-100">
        <div className="text-gray-400 text-8xl mb-6">📰</div>
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          No Articles Found
        </h2>
        <p className="text-gray-600 max-w-lg mx-auto text-lg leading-relaxed">
          No articles found for <span className="font-semibold text-gray-900">"{topic}"</span> in the selected timeframe. 
          Try expanding your time range or selecting a different topic.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Enhanced Results Summary */}
      <div className="bg-gradient-to-r from-white to-gray-50 border border-gray-100 rounded-2xl shadow-medium p-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-3">
            Perspective Analysis
          </h2>
          <p className="text-xl text-gray-600 font-medium">
            <span className="text-primary-600 font-semibold">"{topic}"</span>
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center mb-8">
          <div className="p-6 bg-gradient-to-br from-primary-50 to-primary-100 rounded-2xl border border-primary-200 shadow-soft">
            <div className="text-4xl font-bold text-primary-600 mb-2">{userArticles.length}</div>
            <div className="text-sm font-semibold text-primary-700">Your Sources</div>
            <div className="text-xs text-primary-600 mt-1">Selected outlets</div>
          </div>
          <div className="p-6 bg-gradient-to-br from-secondary-50 to-secondary-100 rounded-2xl border border-secondary-200 shadow-soft">
            <div className="text-4xl font-bold text-secondary-600 mb-2">{opposingArticles.length}</div>
            <div className="text-sm font-semibold text-secondary-700">Other Perspectives</div>
            <div className="text-xs text-secondary-600 mt-1">Alternative views</div>
          </div>
          <div className="p-6 bg-gradient-to-br from-success-50 to-success-100 rounded-2xl border border-success-200 shadow-soft">
            <div className="text-4xl font-bold text-success-600 mb-2">{totalArticles}</div>
            <div className="text-sm font-semibold text-success-700">Total Articles</div>
            <div className="text-xs text-success-600 mt-1">Combined coverage</div>
          </div>
        </div>

        <div className="text-center bg-white rounded-xl p-4 border border-gray-100 shadow-soft">
          <p className="text-gray-700 leading-relaxed">
            Comparing coverage across <span className="font-semibold text-gray-900">{userSources.length} of your preferred sources</span> vs. 
            <span className="font-semibold text-gray-900"> alternative perspectives</span> from other news outlets
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