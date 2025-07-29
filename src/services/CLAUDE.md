# Services Directory

This directory contains all business logic services for the BreakMyBubble application. Services handle data fetching, processing, caching, and integration with external APIs.

## Architecture Overview

Services follow a modular architecture with clear separation of concerns:

- **Single Responsibility**: Each service handles one specific domain
- **Async/Promise Based**: All external operations return promises
- **Error Handling**: Comprehensive error handling with user-friendly messages
- **Type Safety**: Full TypeScript integration with strict typing
- **Caching**: Smart caching strategies to optimize performance

### **Security & Quality Enhancements (v2.5)** 🔒

All services now include comprehensive security and quality improvements:

**Security Features**:
- **Enhanced Input Validation**: Comprehensive validation and sanitization throughout service layer
- **API Security**: Enhanced API key validation and secure error handling
- **URL Security**: Secure URL validation and sanitization functions
- **Type Safety**: Eliminated unsafe `any` types with proper type guards

**Code Quality Improvements**:
- **Memory Safety**: Enhanced cleanup and resource management
- **Error Resilience**: Improved error boundaries and fallback strategies
- **Performance**: Optimized request handling and caching mechanisms
- **TypeScript Compliance**: 100% type safety with strict mode enabled

### **Phase 4: UX Integration (v3.1)** ✨

Services now provide enhanced support for improved user experience:

**Enhanced Error Handling**:
- **Structured Error Responses**: Services now return detailed error information for comprehensive recovery
- **Error Classification**: Different error types (Network, API, Validation) for targeted user messaging
- **Recovery Context**: Additional context provided to support actionable error recovery steps

**Performance Optimizations**:
- **Request Optimization**: Enhanced caching and deduplication supporting loading state improvements
- **Progress Tracking**: Service layer support for step-by-step progress indicators
- **Mobile Performance**: Optimized request handling for mobile network conditions

## Service Layer Architecture

```
┌─────────────────┐
│  App Component  │
└─────────┬───────┘
          │
┌─────────▼───────┐
│ unifiedSourceService │ ◄── Main Integration Layer
└─────────┬───────┘
          │
    ┌─────┼─────┐
    ▼     ▼     ▼
┌─────┐ ┌────┐ ┌────────────┐
│ RSS │ │API │ │ Dynamic    │
│Service│ │Service│ │SourceService│
└─────┘ └────┘ └────────────┘
    │     │          │
    └─────┼──────────┘
          ▼
   ┌─────────────┐
   │ filterService │
   └─────────────┘
          │
     ┌────┼────┐
     ▼    ▼    ▼
┌─────┐┌─────┐┌─────┐
│cache││debug││mock │
│Service││Service││Service│
└─────┘└─────┘└─────┘
```

## Core Services

### **unifiedSourceService.ts**
**Purpose**: Main integration layer providing unified interface for both RSS and NewsAPI modes

**Key Features**:
- Dual-mode operation (RSS/NewsAPI) controlled by environment variables
- Intelligent fallback strategies
- Consistent API surface regardless of underlying service
- Error handling and mode switching

**API**:
```typescript
export const unifiedSourceService = {
  fetchArticlesForSources(sources: string[], topic: string, options: FetchOptions): Promise<Article[]>
  getAvailableSources(filters?: SourceFilters): Promise<NewsSource[]>
  validateConfiguration(): ConfigStatus
}
```

### **newsApiService.ts** ✨ *Enhanced Security & Type Safety*
**Purpose**: Complete NewsAPI.org integration with dynamic source classification

**Key Features**:
- Full `/everything` and `/sources` endpoint integration
- **🔑 Enhanced API Security**: Comprehensive API key validation and secure error handling
- **✅ Type Safety**: Eliminated unsafe `any` types with proper type guards
- **🔗 URL Security**: Enhanced validation for all API endpoints and responses
- **Dynamic Source Classification**: Uses `availableSources` parameter instead of static maps
- **Unknown Source Handling**: Honest 'unknown' classification instead of misleading 'center'
- Advanced search parameter handling
- Pagination support (page/pageSize)
- Sort options: relevancy, publishedAt, popularity
- Language filtering (14 languages)
- Date range filtering with custom ranges
- Domain include/exclude filtering
- Rate limiting and quota management
- Comprehensive error handling with fallback strategies

**Enhanced Dynamic Classification with Type Safety**:
```typescript
function mapNewsAPIToArticle(apiArticle: NewsAPIArticle, availableSources: NewsSource[]): Article {
  // Enhanced type safety and validation
  const sourceInfo = availableSources.find(source => 
    source.newsApiId === apiArticle.source.id ||
    source.name.toLowerCase() === apiArticle.source.name.toLowerCase()
  );
  const politicalLean: PoliticalLean = sourceInfo?.politicalLean || 'unknown'; // Proper typing
  
  // Enhanced URL validation and sanitization
  const sanitizedUrl = validateURL(apiArticle.url);
  const validImageUrl = isValidImageURL(apiArticle.urlToImage);
  
  return {
    // ... properly typed and validated article data
  };
}
```

**Enhanced API with Type Safety**:
```typescript
// Enhanced with proper type guards and validation
export async function fetchArticlesByTopic(
  topic: string, 
  keywords: string[], 
  sources: string[], 
  timeframeDays: number, 
  availableSources: NewsSource[], 
  languages?: NewsLanguage[], 
  sortBy?: NewsSortBy
): Promise<PaginatedResults>

export async function searchAllSources(
  keywords: string[], 
  timeframeDays: number, 
  availableSources: NewsSource[], 
  excludeSources?: string[], 
  languages?: NewsLanguage[], 
  sortBy?: NewsSortBy
): Promise<PaginatedResults>

// Enhanced API status checking with security validation
export async function checkAPIStatus(): Promise<{
  valid: boolean; 
  remaining?: number; 
  limit?: number;
  secure: boolean; // New security validation flag
}>
```

**Enhanced Environment Variables & Security**:
- `VITE_NEWS_API_KEY`: Required API key (enhanced validation)
- `VITE_USE_NEWS_API`: Enable NewsAPI mode
- **🔒 Security Features**:
  - Enhanced API key validation with proper error handling
  - Secure environment variable management
  - ⚠️ Never commit .env files to version control
  - Production-ready security validation

### **rssService.ts**
**Purpose**: RSS feed parsing and article extraction (fallback/basic mode)

**Key Features**:
- RSS 2.0 and Atom feed support
- CORS proxy integration via api.allorigins.win
- Multiple concurrent feed fetching with Promise.allSettled
- Robust XML parsing with DOMParser
- Error resilience for malformed feeds
- Automatic deduplication

**API**:
```typescript
export async function fetchFeed(rssUrl: string): Promise<Article[]>
export async function fetchMultipleFeeds(sources: NewsSource[]): Promise<Article[]>
```

### **dynamicSourceService.ts**
**Purpose**: Dynamic source discovery and political lean classification

**Key Features**:
- Dynamic source fetching from NewsAPI `/sources` endpoint
- 54 country support with filtering
- 14 language support with native names and flags
- Advanced political lean classification system
- Source credibility scoring (0.0-1.0)
- Confidence levels for classifications (0.0-1.0)
- Domain-based heuristic fallbacks
- 24-hour caching with localStorage

**Political Lean Mapping**: Extended classification system:
```typescript
const POLITICAL_LEAN_MAPPING: PoliticalLeanMapping = {
  // Recently added international sources:
  'cnn-es': { lean: 'lean-left', credibility: 0.7, confidence: 0.8 },
  'the-hindu': { lean: 'lean-left', credibility: 0.8, confidence: 0.8 },
  'infobae': { lean: 'lean-left', credibility: 0.6, confidence: 0.7 },
  'ynet': { lean: 'lean-left', credibility: 0.7, confidence: 0.8 },
  'aftenposten': { lean: 'lean-right', credibility: 0.7, confidence: 0.8 },
  'goteborgs-posten': { lean: 'lean-right', credibility: 0.6, confidence: 0.7 },
  // ... 27 total sources with classifications
}
```

### **filterService.ts** ✨ *Enhanced Security & Multilanguage Support*
**Purpose**: Article filtering, processing, and intelligent opposing perspective logic with comprehensive multilanguage search

**Key Features**:
- **🔒 Input Sanitization**: Enhanced validation and sanitization of all filter inputs
- **✅ Type Safety**: Comprehensive type guards and validation throughout filtering logic
- **Multilanguage Keyword Matching**: Smart language-aware article filtering
- **Custom Search Term Integration**: User-defined search terms override topic keywords (with sanitization)
- **Intelligent Fallback System**: Requested language → English → Legacy keywords
- Advanced relevance scoring with multilanguage normalization
- Date range filtering with timezone handling
- Political perspective analysis and categorization
- **Intelligent Opposition Ranking**: Political lean distance scoring (0-100 points)
- **User Political Lean Detection**: Credibility-weighted source analysis
- **Smart Sort Preservation**: Maintains NewsAPI sort preferences (relevancy/recent/popular)
- Article deduplication based on title similarity
- Content quality filtering

**Intelligent Ranking System**:
```typescript
const OPPOSITION_MATRIX = {
  'right': {
    'left': 100,      // Maximum opposition
    'lean-left': 85,
    'center': 70,
    'lean-right': 20,
    'right': 0,
    'unknown': 30
  },
  // ... complete matrix for all political leans
}
```

**Enhanced API with Security & Type Safety**:
```typescript
// Enhanced with input sanitization and type safety
export function filterArticlesByTopic(
  articles: Article[], 
  topicKeywords: TopicKeywords, 
  selectedLanguages?: NewsLanguage[], 
  customSearchTerms?: string[] // Now sanitized with DOMPurify
): Article[]

export function filterAndProcessArticles(
  articles: Article[], 
  topic: TopicKeywords, 
  timeframe: number, 
  sortBy: NewsSortBy, 
  maxArticlesPerSource?: number, 
  selectedLanguages?: NewsLanguage[], 
  customSearchTerms?: string[] // Enhanced validation
): Article[]

// Enhanced with proper type guards
export function getOpposingPerspectives(
  userSources: NewsSource[], 
  allArticles: Article[], 
  sortBy: NewsSortBy
): { userArticles: Article[], opposingArticles: Article[] }

// Type-safe political lean detection
export function detectUserPoliticalLean(
  selectedSources: NewsSource[]
): { 
  primaryLean: PoliticalLean, 
  confidence: number, 
  distribution: Record<PoliticalLean, number> 
}

export function calculateTopicRelevance(
  article: Article, 
  keywords: TopicKeywords
): number
```

**New Multilanguage Features**:
- `filterArticlesByTopic()`: Now accepts `selectedLanguages[]` and `customSearchTerms[]` parameters
- Smart keyword selection based on user's language preferences
- Custom search terms take priority over predefined topic keywords
- Automatic fallback to English keywords when requested language unavailable
- Efficient keyword normalization for improved matching accuracy

## Utility Services

### **cacheService.ts**
**Purpose**: Smart caching system using localStorage

**Key Features**:
- 30-minute default cache duration for RSS feeds
- 24-hour cache for NewsAPI dynamic sources
- Automatic cache invalidation and cleanup
- Memory-safe with error handling for storage limits
- Cache statistics and debugging support

**API**:
```typescript
export const feedCache: FeedCache
export function getCachedFeed(sourceId: string): CachedFeed | null
export function setCachedFeed(sourceId: string, articles: Article[]): void
export function clearExpiredCache(): void
```

### **corsProxy.ts**
**Purpose**: CORS proxy configuration for RSS feeds

**Key Features**:
- Primary proxy: api.allorigins.win
- Fallback proxy configurations
- Automatic proxy switching on failures
- URL encoding and error handling

**Configuration**:
```typescript
export const CORS_PROXY_URL = 'https://api.allorigins.win/get?url='
export const FALLBACK_PROXIES = [
  'https://api.codetabs.com/v1/proxy?quest=',
  'https://cors-anywhere.herokuapp.com/'
]
```

## Development & Testing Services

### **debugService.ts**
**Purpose**: Development debugging and testing utilities

**Key Features**:
- RSS feed testing and validation
- NewsAPI integration testing
- Topic filtering validation
- Source validation and API status checking
- Cache management and inspection
- Debug buttons in development mode

**Debug Functions**:
```typescript
export function debugFeedAccess(): void
export function debugTopicFiltering(): void
export function debugNewsAPI(): void
export function debugSourceValidation(): void
export function debugCacheStatus(): void
```

### **mockDataService.ts**
**Purpose**: Mock data for development and testing

**Key Features**:
- Realistic article data generation
- Multiple political perspectives
- Various topics and timeframes
- Consistent data structure with production

**API**:
```typescript
export function getMockArticlesForDemo(topic: string, sources: string[]): Promise<Article[]>
export function generateMockArticle(source: string, topic: string): Article
```

## Enhanced Error Handling & Security Strategy

All services implement comprehensive error handling with security considerations:

### Enhanced Error Types
```typescript
interface ServiceError {
  type: 'network' | 'api' | 'parsing' | 'validation' | 'quota' | 'security'
  message: string
  details?: any
  retryable: boolean
  secure: boolean // New: indicates if error is security-related
}
```

### Enhanced Error Handling Patterns
1. **Graceful Degradation**: Services fail gracefully with fallback options
2. **User-Friendly Messages**: Technical errors translated to user-friendly messages
3. **Retry Logic**: Automatic retries for transient failures
4. **Fallback Chains**: Primary → Secondary → Cached → Mock data flows
5. **🔒 Security Error Handling**: Special handling for security-related errors
6. **✅ Type Safety**: Enhanced error typing prevents runtime failures

## Enhanced Performance & Security Optimizations

### Enhanced Caching Strategy
- **RSS Feeds**: 30-minute cache to balance freshness and performance
- **Dynamic Sources**: 24-hour cache for stable source lists
- **API Responses**: Smart caching based on request parameters
- **🔒 Security**: Cache validation to prevent poisoning attacks

### Request Optimization
- **Parallel Requests**: Multiple feeds fetched concurrently
- **Request Timeouts**: 10-second timeouts prevent hanging
- **Deduplication**: Avoid duplicate requests within time windows
- **Pagination**: Efficient loading of large result sets
- **🔗 URL Validation**: All requests validated for security

### Enhanced Memory Management
- **📊 Memory Leak Prevention**: Comprehensive cleanup and resource management
- **Cache Cleanup**: Automatic cleanup of expired cache entries
- **Request Cancellation**: Abort requests when components unmount
- **Error Recovery**: Memory-safe error handling
- **✅ Type Safety**: Prevents memory corruption through strict typing

## Configuration Management

### Environment Variables
```typescript
// NewsAPI Configuration
VITE_NEWS_API_KEY=your_api_key_here
VITE_USE_NEWS_API=true

// Development Configuration  
NODE_ENV=development
VITE_DEBUG_MODE=true

// CORS Proxy Configuration
VITE_CORS_PROXY_URL=https://api.allorigins.win/get?url=
```

### Feature Flags
```typescript
const useNewsAPI = import.meta.env.VITE_USE_NEWS_API === 'true'
const hasNewsAPIKey = Boolean(import.meta.env.VITE_NEWS_API_KEY)
const isDebugMode = import.meta.env.DEV || import.meta.env.VITE_DEBUG_MODE
```

## Enhanced Integration Patterns

### Service Dependencies with Security
```typescript
// unifiedSourceService depends on:
import { newsApiService } from './newsApiService'
import { rssService } from './rssService'  
import { dynamicSourceService } from './dynamicSourceService'

// All services use enhanced security features:
import { cacheService } from './cacheService'
import { filterService } from './filterService'

// New security utilities (v2.5):
import { validateURL, sanitizeURL, isValidImageURL } from '../utils/helpers'
import DOMPurify from 'dompurify'
```

### Type Integration
All services use shared types from `/src/types/index.ts`:
- `Article`, `NewsSource`, `NewsAPIResponse`
- `PaginatedResults`, `UserSelection`
- Service-specific interfaces

## Testing Considerations

### Unit Testing
- Each service should be testable in isolation
- Mock external dependencies (APIs, localStorage)
- Test error conditions and edge cases
- Validate caching behavior

### Integration Testing
- Test service interactions
- Validate end-to-end data flow
- Test fallback mechanisms
- Verify error handling chains

## Future Enhancement Areas

1. **Enhanced Security**: Advanced threat detection and prevention
2. **WebSocket Integration**: Real-time article updates with secure connections
3. **Advanced Caching**: Redis or IndexedDB for larger datasets with encryption
4. **Offline Support**: Service worker integration for PWA with security considerations
5. **Analytics Service**: Privacy-focused user behavior tracking
6. **A/B Testing**: Feature flag management with security validation
7. **Rate Limiting**: Enhanced client-side rate limiting for API quotas
8. **Metrics Collection**: Security-focused performance and usage metrics
9. **AI Integration**: Secure AI-powered analysis with data protection
10. **Security Monitoring**: Real-time security threat detection