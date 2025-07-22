# Types Directory

This directory contains TypeScript type definitions and interfaces for the BreakMyBubble application. These types ensure type safety across all components and services.

## Overview

The types directory provides:
- **Core Domain Types**: News sources, articles, and user selections
- **API Integration Types**: NewsAPI request/response interfaces
- **UI Component Types**: Component props and state interfaces
- **Service Types**: Business logic and data processing interfaces
- **Utility Types**: Helper types and enums

## File Structure

```
src/types/
└── index.ts       # All type definitions in a single file for easy imports
```

## Core Domain Types

### **NewsSource**
Represents a news publication/outlet with metadata and political classification.

```typescript
export interface NewsSource {
  id: string;                    // Unique identifier
  name: string;                  // Display name
  rssUrl?: string;              // RSS feed URL (optional for dynamic sources)
  newsApiId?: string;           // NewsAPI source ID (optional for RSS-only sources)
  politicalLean: 'left' | 'lean-left' | 'center' | 'lean-right' | 'right' | 'unknown';
  credibility: number;          // 0.0-1.0 credibility score
  website: string;              // Main website domain
  
  // NewsAPI additional fields
  description?: string;         // Source description from NewsAPI
  category?: NewsCategory;      // Source category (general, business, etc.)
  language?: string;           // ISO language code
  country?: string;           // ISO country code
  
  // Source metadata
  isDynamic?: boolean;        // True if fetched from NewsAPI vs static
}
```

### **Article**
Represents a news article with content and metadata.

```typescript
export interface Article {
  title: string;              // Article headline
  description: string;        // Article summary/description
  link: string;              // URL to full article
  pubDate: string;           // Publication date (ISO string)
  source: string;            // Source name
  sourceLean: 'left' | 'lean-left' | 'center' | 'lean-right' | 'right' | 'unknown';
  
  // Enhanced fields for NewsAPI
  imageUrl?: string;         // Article image URL
  author?: string;           // Article author
  content?: string;          // Article content snippet
}
```

### **TopicKeywords**
Defines topics and their associated keywords for content filtering.

```typescript
export interface TopicKeywords {
  topic: string;             // Topic display name
  keywords: string[];        // Keywords for content matching
}
```

### **UserSelection**
Captures user's current selections and preferences.

```typescript
export interface UserSelection {
  sources: string[];         // Selected source IDs (1-5 sources)
  topic: string;            // Selected topic
  timeframe: number;        // Days to look back (RSS mode)
  languages: NewsLanguage[];// Selected languages (NewsAPI mode)
  domains?: string[];       // Include specific domains
  excludeDomains?: string[];// Exclude specific domains
}
```

## NewsAPI Integration Types

### **NewsAPIResponse** 
Response from NewsAPI `/everything` endpoint.

```typescript
export interface NewsAPIResponse {
  status: string;           // 'ok' or 'error'
  totalResults: number;     // Total articles matching query
  articles: NewsAPIArticle[];// Array of articles
  code?: string;           // Error code if status is 'error'
  message?: string;        // Error message if status is 'error'
}
```

### **NewsAPIArticle**
Article format returned by NewsAPI.

```typescript
export interface NewsAPIArticle {
  source: {
    id: string | null;      // NewsAPI source ID
    name: string;          // Source display name
  };
  author: string | null;    // Article author
  title: string;           // Article headline
  description: string | null;// Article description
  url: string;             // Article URL
  urlToImage: string | null;// Article image URL
  publishedAt: string;     // ISO date string
  content: string | null;  // Article content snippet
}
```

### **NewsAPISourcesResponse**
Response from NewsAPI `/sources` endpoint.

```typescript
export interface NewsAPISourcesResponse {
  status: string;          // 'ok' or 'error'
  sources: NewsAPISourceData[];// Available sources
  code?: string;          // Error code if applicable
  message?: string;       // Error message if applicable
}
```

### **NewsAPISourceData**
Source information from NewsAPI `/sources` endpoint.

```typescript
export interface NewsAPISourceData {
  id: string;             // NewsAPI source ID
  name: string;          // Source display name
  description: string;   // Source description
  url: string;           // Source website URL
  category: NewsCategory;// Source category
  language: string;      // ISO language code
  country: string;       // ISO country code
}
```

### **PaginatedResults**
Paginated response wrapper for large result sets.

```typescript
export interface PaginatedResults {
  articles: Article[];      // Current page articles
  totalResults: number;     // Total articles available
  hasMorePages: boolean;    // Whether more pages exist
  currentPage: number;      // Current page number (1-based)
  totalPages: number;       // Total number of pages
}
```

## UI Component Types

### **TimeOption**
Time range option for user selection.

```typescript
export interface TimeOption {
  label: string;           // Display text ("24 hours", "1 week")
  value: number;           // Days as number (1, 7, 30)
}
```

### **LanguageOption**
Language selection option with display information.

```typescript
export interface LanguageOption {
  code: NewsLanguage;      // ISO language code
  name: string;           // English name ("Spanish", "French")
  nativeName: string;     // Native name ("Español", "Français")
  flag: string;           // Flag emoji ("🇪🇸", "🇫🇷")
}
```

### **SourceFilters**
Filters for dynamic source discovery.

```typescript
export interface SourceFilters {
  languages: NewsLanguage[];// Filter by languages
  categories: NewsCategory[];// Filter by categories
  countries: string[];     // Filter by countries
  search: string;         // Text search filter
}
```

## Caching and Storage Types

### **CachedFeed**
Cached RSS feed data with timestamp.

```typescript
export interface CachedFeed {
  data: Article[];        // Cached articles
  timestamp: number;      // Cache creation time (Unix timestamp)
}
```

### **FeedCache**
Cache storage structure for RSS feeds.

```typescript
export interface FeedCache {
  [sourceId: string]: CachedFeed; // Key-value cache by source ID
}
```

### **DynamicSourceCache**
Cache for dynamically fetched sources.

```typescript
export interface DynamicSourceCache {
  sources: NewsSource[];     // Cached sources
  timestamp: number;         // Cache creation time
  languages: NewsLanguage[]; // Languages used for this cache
  categories: NewsCategory[];// Categories used for this cache
}
```

### **PoliticalLeanMapping**
Political lean classification mapping with confidence scores.

```typescript
export interface PoliticalLeanMapping {
  [sourceId: string]: {
    lean: 'left' | 'lean-left' | 'center' | 'lean-right' | 'right' | 'unknown';
    credibility: number;    // 0.0-1.0 credibility score
    confidence: number;     // 0.0-1.0 confidence in classification
  };
}
```

## Enum Types

### **NewsCategory**
NewsAPI source categories.

```typescript
export type NewsCategory = 
  | 'business' 
  | 'entertainment' 
  | 'general' 
  | 'health' 
  | 'science' 
  | 'sports' 
  | 'technology';
```

### **NewsLanguage**
Supported languages with ISO codes.

```typescript
export type NewsLanguage = 
  | 'ar'  // Arabic
  | 'de'  // German
  | 'en'  // English
  | 'es'  // Spanish
  | 'fr'  // French
  | 'he'  // Hebrew
  | 'it'  // Italian
  | 'nl'  // Dutch
  | 'no'  // Norwegian
  | 'pt'  // Portuguese
  | 'ru'  // Russian
  | 'sv'  // Swedish
  | 'ud'  // Urdu
  | 'zh'; // Chinese
```

### **NewsSortBy**
NewsAPI sorting options.

```typescript
export type NewsSortBy = 
  | 'relevancy'    // Best matches for search terms
  | 'publishedAt'  // Most recent articles first
  | 'popularity';  // Most popular/shared articles
```

## Type Usage Patterns

### Import Pattern
All types are imported from a single barrel export:

```typescript
import { 
  NewsSource, 
  Article, 
  NewsAPIResponse,
  UserSelection 
} from '../types';
```

### Type Guards
Implement type guards for runtime validation:

```typescript
export function isNewsAPIResponse(obj: any): obj is NewsAPIResponse {
  return (
    obj &&
    typeof obj.status === 'string' &&
    typeof obj.totalResults === 'number' &&
    Array.isArray(obj.articles)
  );
}

export function isValidArticle(obj: any): obj is Article {
  return (
    obj &&
    typeof obj.title === 'string' &&
    typeof obj.description === 'string' &&
    typeof obj.link === 'string' &&
    typeof obj.pubDate === 'string' &&
    typeof obj.source === 'string'
  );
}
```

### Generic Types
Utility generic types for common patterns:

```typescript
export type OptionalExcept<T, K extends keyof T> = Partial<T> & Pick<T, K>;
export type RequiredExcept<T, K extends keyof T> = Required<T> & Partial<Pick<T, K>>;

// Usage examples:
type PartialNewsSource = OptionalExcept<NewsSource, 'id' | 'name'>;
type RequiredArticle = RequiredExcept<Article, 'imageUrl' | 'author'>;
```

## Error Types

### Service Error Handling
```typescript
export interface ServiceError {
  type: 'network' | 'api' | 'parsing' | 'validation' | 'quota';
  message: string;
  details?: any;
  retryable: boolean;
}

export interface APIError extends ServiceError {
  code?: string;
  status?: number;
  endpoint?: string;
}
```

## Component Props Types

### Common Props Patterns
```typescript
export interface BaseComponentProps {
  className?: string;
  loading?: boolean;
  disabled?: boolean;
  error?: string | null;
}

export interface SelectableComponentProps<T> extends BaseComponentProps {
  value: T | T[];
  onChange: (value: T) => void;
  options: T[];
}
```

## Future Type Enhancements

### Planned Additions
1. **AI Analysis Types**: For future AI-powered content analysis
2. **User Account Types**: For user authentication and preferences
3. **Analytics Types**: For usage tracking and metrics
4. **Real-time Types**: For WebSocket/real-time features
5. **Offline Types**: For Progressive Web App features

### Type Validation
Consider adding runtime type validation libraries:
- **Zod**: Schema validation with TypeScript inference
- **Joi**: Object schema validation
- **io-ts**: Runtime type checking

### Advanced TypeScript Features
```typescript
// Conditional types for mode-specific features
export type ModeSpecificProps<T extends 'rss' | 'newsapi'> = 
  T extends 'rss' ? RSSModeProps : NewsAPIModeProps;

// Template literal types for dynamic keys
export type SourceId = `source-${string}`;
export type CacheKey = `cache-${string}-${number}`;

// Mapped types for transformations
export type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type RequiredBy<T, K extends keyof T> = T & Required<Pick<T, K>>;
```

## Development Guidelines

### Type Definition Best Practices
1. **Explicit Types**: Prefer explicit types over `any`
2. **Optional Properties**: Use `?` for truly optional properties
3. **Union Types**: Use union types for constrained values
4. **Interface vs Type**: Use interfaces for object shapes, types for unions
5. **Generic Constraints**: Add constraints to generic types when appropriate

### Documentation
- Document complex types with TSDoc comments
- Include usage examples in type definitions
- Explain business logic constraints in comments
- Link to external API documentation where relevant

This type system provides comprehensive type safety while maintaining flexibility for future enhancements and ensures consistent data structures across the entire application.