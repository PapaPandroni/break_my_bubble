import { Article, NewsSource } from '../types'
import { fetchWithCorsProxy } from './corsProxy'
import { extractTextFromHTML } from '../utils/helpers'

interface RSSItem {
  title?: string
  description?: string
  link?: string
  pubDate?: string
  'content:encoded'?: string
  guid?: string
}

interface RSSChannel {
  title?: string
  description?: string
  item?: RSSItem | RSSItem[]
}

interface RSSFeed {
  rss?: {
    channel?: RSSChannel
  }
  feed?: {
    title?: string
    entry?: RSSItem | RSSItem[]
  }
}

export const parseRSSFeed = async (
  source: NewsSource
): Promise<Article[]> => {
  try {
    const xmlData = await fetchWithCorsProxy(source.rssUrl)
    const parser = new DOMParser()
    const xmlDoc = parser.parseFromString(xmlData, 'text/xml')

    // Check for parsing errors
    const parseError = xmlDoc.querySelector('parsererror')
    if (parseError) {
      throw new Error(`XML parsing error: ${parseError.textContent}`)
    }

    const articles: Article[] = []

    // Handle RSS 2.0 format
    const rssItems = xmlDoc.querySelectorAll('item')
    if (rssItems.length > 0) {
      rssItems.forEach((item) => {
        const article = parseRSSItem(item, source)
        if (article) {
          articles.push(article)
        }
      })
      return articles
    }

    // Handle Atom format
    const atomEntries = xmlDoc.querySelectorAll('entry')
    if (atomEntries.length > 0) {
      atomEntries.forEach((entry) => {
        const article = parseAtomEntry(entry, source)
        if (article) {
          articles.push(article)
        }
      })
      return articles
    }

    throw new Error('No recognizable feed format found')
  } catch (error) {
    console.error(`Failed to parse RSS feed for ${source.name}:`, error)
    throw error
  }
}

const parseRSSItem = (item: Element, source: NewsSource): Article | null => {
  try {
    const title = getTextContent(item, 'title')
    const link = getTextContent(item, 'link')
    const pubDate = getTextContent(item, 'pubDate')

    if (!title || !link) {
      return null
    }

    let description = getTextContent(item, 'description') || ''
    
    // Try content:encoded if description is short or empty
    if (description.length < 50) {
      const contentEncoded = getTextContent(item, 'content:encoded')
      if (contentEncoded && contentEncoded.length > description.length) {
        description = contentEncoded
      }
    }

    // Clean HTML from description
    description = extractTextFromHTML(description)

    return {
      title: title.trim(),
      description: description.trim(),
      link: link.trim(),
      pubDate: pubDate || new Date().toISOString(),
      source: source.name,
      sourceLean: source.politicalLean,
    }
  } catch (error) {
    console.warn(`Failed to parse RSS item for ${source.name}:`, error)
    return null
  }
}

const parseAtomEntry = (entry: Element, source: NewsSource): Article | null => {
  try {
    const title = getTextContent(entry, 'title')
    const linkElement = entry.querySelector('link[href]')
    const link = linkElement?.getAttribute('href')
    const published = getTextContent(entry, 'published') || getTextContent(entry, 'updated')

    if (!title || !link) {
      return null
    }

    let description = getTextContent(entry, 'summary') || getTextContent(entry, 'content') || ''
    description = extractTextFromHTML(description)

    return {
      title: title.trim(),
      description: description.trim(),
      link: link.trim(),
      pubDate: published || new Date().toISOString(),
      source: source.name,
      sourceLean: source.politicalLean,
    }
  } catch (error) {
    console.warn(`Failed to parse Atom entry for ${source.name}:`, error)
    return null
  }
}

const getTextContent = (element: Element, selector: string): string => {
  const node = element.querySelector(selector)
  return node?.textContent?.trim() || ''
}

export const fetchMultipleFeeds = async (
  sources: NewsSource[]
): Promise<{ source: string; articles: Article[]; error?: string }[]> => {
  const results = await Promise.allSettled(
    sources.map(async (source) => {
      try {
        const articles = await parseRSSFeed(source)
        return { source: source.name, articles }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error'
        return { source: source.name, articles: [], error: errorMessage }
      }
    })
  )

  return results.map((result, index) => {
    if (result.status === 'fulfilled') {
      return result.value
    } else {
      return {
        source: sources[index].name,
        articles: [],
        error: result.reason instanceof Error ? result.reason.message : 'Failed to fetch',
      }
    }
  })
}