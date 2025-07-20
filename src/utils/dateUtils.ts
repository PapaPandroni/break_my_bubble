export const isWithinTimeframe = (
  pubDate: string,
  timeframeDays: number
): boolean => {
  try {
    const articleDate = new Date(pubDate)
    const now = new Date()
    const timeframeMs = timeframeDays * 24 * 60 * 60 * 1000
    const cutoffDate = new Date(now.getTime() - timeframeMs)

    return articleDate >= cutoffDate && articleDate <= now
  } catch (error) {
    console.warn('Invalid date format:', pubDate)
    return false
  }
}

export const formatDate = (dateString: string): string => {
  try {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  } catch (error) {
    return 'Unknown date'
  }
}

export const formatRelativeTime = (dateString: string): string => {
  try {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffHours / 24)

    if (diffHours < 1) {
      return 'Less than 1 hour ago'
    } else if (diffHours < 24) {
      return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`
    } else {
      return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`
    }
  } catch (error) {
    return 'Unknown time'
  }
}