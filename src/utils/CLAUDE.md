# Utils Directory

This directory contains utility functions and helper modules used throughout the BreakMyBubble application. These pure functions provide common functionality without side effects.

## Overview

The utils directory provides:
- **Date Utilities**: Date parsing, formatting, and calculations
- **Helper Functions**: Common operations and data transformations
- **Pure Functions**: Stateless, testable utility functions
- **Cross-cutting Concerns**: Functions used across multiple components/services

## File Structure

```
src/utils/
├── dateUtils.ts    # Date manipulation and formatting utilities
└── helpers.ts      # General helper functions and utilities
```

## Utility Modules

### **dateUtils.ts**

**Purpose**: Centralized date handling, parsing, and formatting operations for consistent date behavior across the application.

#### Core Functions

##### Date Parsing
```typescript
export function parseArticleDate(dateString: string): Date
```
- Parses various date formats from RSS feeds and NewsAPI
- Handles multiple date formats: ISO 8601, RFC 2822, custom formats
- Returns normalized Date object
- Graceful error handling for invalid dates

**Supported Formats**:
- ISO 8601: `2023-12-01T10:30:00Z`
- RFC 2822: `Fri, 01 Dec 2023 10:30:00 GMT`
- RSS formats: Various RSS-specific date formats
- NewsAPI format: `2023-12-01T10:30:00Z`

##### Date Calculations
```typescript
export function isWithinTimeframe(articleDate: Date, timeframeDays: number): boolean
```
- Checks if article falls within specified time range
- Accounts for timezone differences
- Used by filtering services

```typescript
export function getDaysAgo(days: number): Date
```
- Returns Date object for N days ago from current time
- Handles timezone normalization
- Used for date range filtering

##### Date Formatting
```typescript
export function formatRelativeDate(date: Date): string
export function formatAbsoluteDate(date: Date): string
```
- **Relative**: "2 hours ago", "3 days ago", "1 week ago"
- **Absolute**: "December 1, 2023 at 10:30 AM"
- Internationalization-ready formatting
- User-friendly time representations

##### Date Range Operations
```typescript
export interface DateRange {
  from: Date;
  to: Date;
}

export function createDateRange(days: number): DateRange
export function isDateInRange(date: Date, range: DateRange): boolean
export function formatDateRange(range: DateRange): string
```

#### Usage Examples
```typescript
import { parseArticleDate, isWithinTimeframe, formatRelativeDate } from '../utils/dateUtils';

// Parse article date from RSS feed
const articleDate = parseArticleDate(article.pubDate);

// Check if article is within last 7 days
const isRecent = isWithinTimeframe(articleDate, 7);

// Display user-friendly relative time
const displayTime = formatRelativeDate(articleDate);
// Output: "2 hours ago" or "3 days ago"
```

### **helpers.ts**

**Purpose**: General utility functions for data manipulation, validation, and common operations.

#### String Operations
```typescript
export function normalizeString(input: string): string
```
- Trims whitespace, normalizes case
- Removes extra spaces and line breaks
- Used for consistent text processing

```typescript
export function truncateText(text: string, maxLength: number, ellipsis: boolean = true): string
```
- Safely truncates long text
- Preserves word boundaries
- Optional ellipsis indicator
- Used in UI components for text overflow

```typescript
export function calculateSimilarity(text1: string, text2: string): number
```
- Calculates text similarity (0.0-1.0)
- Used for article deduplication
- Implements basic string distance algorithms

#### Array Operations
```typescript
export function deduplicate<T>(array: T[], keyExtractor: (item: T) => string): T[]
```
- Removes duplicate items from arrays
- Uses custom key extraction for comparison
- Preserves order of first occurrence
- Used for article and source deduplication

```typescript
export function shuffleArray<T>(array: T[]): T[]
```
- Fisher-Yates shuffle implementation
- Returns new array without mutating original
- Used for randomizing article order

```typescript
export function groupBy<T, K extends string>(array: T[], keyExtractor: (item: T) => K): Record<K, T[]>
```
- Groups array items by extracted key
- Type-safe key extraction
- Used for organizing articles by source or date

#### Validation Functions
```typescript
export function isValidUrl(url: string): boolean
```
- Validates URL format
- Checks for required protocol
- Used for RSS feed and article link validation

```typescript
export function isValidEmail(email: string): boolean
```
- Email format validation
- RFC-compliant regex pattern
- Used for future user account features

```typescript
export function sanitizeInput(input: string): string
```
- Sanitizes user input for XSS prevention
- Removes potentially dangerous characters
- Encodes HTML entities

#### Data Transformation
```typescript
export function extractDomain(url: string): string
```
- Extracts domain from URL
- Removes protocol, www, and path
- Used for source identification and grouping

```typescript
export function capitalizeWords(text: string): string
```
- Title case transformation
- Handles common articles and prepositions
- Used for consistent text display

```typescript
export function generateSlug(text: string): string
```
- URL-friendly slug generation
- Removes special characters
- Converts spaces to hyphens
- Used for URL routing and IDs

#### Performance Utilities
```typescript
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void
```
- Debounces function execution
- Prevents excessive API calls
- Used in search inputs and user interactions

```typescript
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void
```
- Throttles function execution
- Rate limiting for expensive operations
- Used for scroll handlers and animations

#### Error Handling
```typescript
export function safeJsonParse<T>(jsonString: string, fallback: T): T
```
- Safe JSON parsing with fallback
- Prevents runtime errors from malformed JSON
- Used for localStorage and API responses

```typescript
export function createErrorMessage(error: unknown): string
```
- Standardized error message creation
- Handles different error types (Error, string, unknown)
- User-friendly error messages

```typescript
export function retryWithBackoff<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T>
```
- Exponential backoff retry mechanism
- Configurable retry count and delays
- Used for network operations

#### Usage Examples
```typescript
import { 
  normalizeString, 
  deduplicate, 
  debounce,
  extractDomain,
  calculateSimilarity 
} from '../utils/helpers';

// Normalize article titles for comparison
const normalizedTitle = normalizeString(article.title);

// Remove duplicate articles
const uniqueArticles = deduplicate(articles, article => article.title);

// Debounce search function
const debouncedSearch = debounce(handleSearch, 300);

// Extract domain from article URL
const sourceDomain = extractDomain(article.link);

// Check article similarity for deduplication
const similarity = calculateSimilarity(article1.title, article2.title);
```

## Type Safety and Documentation

### Function Signatures
All utility functions use strict TypeScript typing:

```typescript
// Generic function with constraints
export function mapAndFilter<T, U>(
  items: T[], 
  predicate: (item: T) => boolean, 
  mapper: (item: T) => U
): U[]

// Function overloads for different use cases
export function formatDate(date: Date): string;
export function formatDate(date: Date, format: 'relative'): string;
export function formatDate(date: Date, format: 'absolute'): string;
export function formatDate(date: Date, format?: 'relative' | 'absolute'): string
```

### JSDoc Documentation
All functions include comprehensive JSDoc comments:

```typescript
/**
 * Calculates the similarity between two strings using basic string comparison
 * @param text1 - First string to compare
 * @param text2 - Second string to compare
 * @returns Similarity score between 0.0 (no similarity) and 1.0 (identical)
 * @example
 * ```typescript
 * const similarity = calculateSimilarity("Hello World", "Hello Earth");
 * console.log(similarity); // 0.6
 * ```
 */
export function calculateSimilarity(text1: string, text2: string): number
```

## Testing Considerations

### Pure Functions
All utility functions are pure (no side effects):
- Same input always produces same output
- No external dependencies
- Easy to unit test
- Predictable behavior

### Test Coverage
Focus areas for testing:
- Edge cases (empty strings, null values, invalid dates)
- Boundary conditions (very large/small numbers)
- Different input formats and types
- Error handling and recovery
- Performance with large datasets

### Example Tests
```typescript
describe('dateUtils', () => {
  describe('parseArticleDate', () => {
    it('should parse ISO 8601 dates correctly', () => {
      const date = parseArticleDate('2023-12-01T10:30:00Z');
      expect(date.getFullYear()).toBe(2023);
      expect(date.getMonth()).toBe(11); // December
      expect(date.getDate()).toBe(1);
    });

    it('should handle invalid dates gracefully', () => {
      const date = parseArticleDate('invalid-date');
      expect(date).toBeInstanceOf(Date);
      expect(isNaN(date.getTime())).toBe(false);
    });
  });
});
```

## Performance Optimization

### Memoization
Consider memoization for expensive calculations:

```typescript
const memoizedCalculateSimilarity = memoize((text1: string, text2: string): number => {
  // Expensive similarity calculation
  return calculateSimilarityInternal(text1, text2);
});
```

### Lazy Evaluation
For expensive operations that might not be needed:

```typescript
export function createLazyCalculator<T>(calculation: () => T): () => T {
  let cached: T | undefined;
  let calculated = false;
  
  return () => {
    if (!calculated) {
      cached = calculation();
      calculated = true;
    }
    return cached!;
  };
}
```

## Integration Patterns

### Service Integration
```typescript
// In services, import and use utilities
import { parseArticleDate, isWithinTimeframe } from '../utils/dateUtils';
import { deduplicate, normalizeString } from '../utils/helpers';

export function processArticles(articles: RawArticle[]): Article[] {
  return deduplicate(
    articles
      .map(article => ({
        ...article,
        title: normalizeString(article.title),
        parsedDate: parseArticleDate(article.pubDate)
      }))
      .filter(article => isWithinTimeframe(article.parsedDate, 30)),
    article => article.title
  );
}
```

### Component Integration
```typescript
// In components, use utilities for display logic
import { formatRelativeDate, truncateText } from '../utils';

const ArticleCard: React.FC<{ article: Article }> = ({ article }) => {
  const displayTime = formatRelativeDate(new Date(article.pubDate));
  const shortDescription = truncateText(article.description, 150);
  
  return (
    <div>
      <h3>{article.title}</h3>
      <p>{shortDescription}</p>
      <span>{displayTime}</span>
    </div>
  );
};
```

## Future Enhancements

### Planned Additions
1. **Internationalization Utils**: Locale-aware formatting and parsing
2. **Advanced Text Processing**: NLP utilities for content analysis
3. **Caching Utilities**: More sophisticated memoization and caching
4. **Validation Schemas**: Integration with validation libraries
5. **Performance Monitoring**: Utility function performance tracking

### Library Integration
Consider integrating with established utility libraries:
- **Lodash**: For advanced array/object manipulation
- **Date-fns**: For comprehensive date operations
- **Ramda**: For functional programming utilities
- **Validator.js**: For robust validation functions

## Best Practices

### Function Design
1. **Single Responsibility**: Each function should do one thing well
2. **Pure Functions**: Avoid side effects where possible
3. **Immutable Returns**: Don't mutate input parameters
4. **Error Handling**: Handle edge cases gracefully
5. **Type Safety**: Use strict TypeScript types

### Documentation Standards
- Clear function descriptions
- Parameter documentation with types
- Return value documentation  
- Usage examples for complex functions
- Performance considerations where relevant

### Import/Export Patterns
```typescript
// Named exports for tree-shaking
export { parseArticleDate, formatRelativeDate } from './dateUtils';
export { normalizeString, deduplicate, debounce } from './helpers';

// Barrel exports for convenience
export * from './dateUtils';
export * from './helpers';
```

This utility layer provides a solid foundation for consistent, reliable data processing and manipulation throughout the application.