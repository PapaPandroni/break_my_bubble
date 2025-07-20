// Try multiple CORS proxy services
const CORS_PROXIES = [
  'https://api.allorigins.win/get?url=',
  'https://api.codetabs.com/v1/proxy?quest=',
  'https://corsproxy.io/?'
]

let currentProxyIndex = 0

export interface ProxyResponse {
  contents: string
  status: {
    url: string
    content_type: string
    http_code: number
    response_time: number
  }
}

export const fetchWithCorsProxy = async (url: string): Promise<string> => {
  const maxRetries = CORS_PROXIES.length
  let lastError: Error | null = null

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    const proxyIndex = (currentProxyIndex + attempt) % CORS_PROXIES.length
    const proxy = CORS_PROXIES[proxyIndex]
    
    try {
      console.log(`🔄 Attempting proxy ${proxyIndex + 1}/${CORS_PROXIES.length}: ${proxy}`)
      
      let proxyUrl: string
      let isAllOrigins = false
      
      if (proxy.includes('allorigins')) {
        proxyUrl = `${proxy}${encodeURIComponent(url)}`
        isAllOrigins = true
      } else {
        proxyUrl = `${proxy}${encodeURIComponent(url)}`
      }

      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout

      const response = await fetch(proxyUrl, {
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
        },
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      let data: string
      
      if (isAllOrigins) {
        const jsonData: ProxyResponse = await response.json()
        if (jsonData.status?.http_code !== 200) {
          throw new Error(`Source returned ${jsonData.status?.http_code} for URL: ${url}`)
        }
        data = jsonData.contents
      } else {
        data = await response.text()
      }

      if (!data || data.length === 0) {
        throw new Error('Empty response from proxy')
      }

      console.log(`✅ Success with proxy ${proxyIndex + 1}: ${data.length} characters`)
      currentProxyIndex = proxyIndex // Remember working proxy
      return data
      
    } catch (error) {
      console.log(`❌ Proxy ${proxyIndex + 1} failed:`, error)
      lastError = error instanceof Error ? error : new Error(String(error))
      
      if (error instanceof Error && error.name === 'AbortError') {
        lastError = new Error(`Request timeout for URL: ${url}`)
      }
    }
  }

  // If all proxies failed
  throw new Error(`All CORS proxies failed for ${url}. Last error: ${lastError?.message}`)
}

export const testCorsProxy = async (): Promise<boolean> => {
  try {
    await fetchWithCorsProxy('https://www.google.com')
    return true
  } catch (error) {
    console.error('CORS proxy test failed:', error)
    return false
  }
}