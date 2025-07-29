# Data Directory ✨ *Enhanced with Multilanguage Support*

This directory contains static data configurations used throughout the BreakMyBubble application. These files define news sources, topic keywords, multilanguage translations, and other reference data.

## Overview

The data directory provides:
- **Static News Sources**: Curated list of news outlets with political lean classifications (baseline for dynamic system)
- **Topic Keywords**: Keyword mappings for content filtering with multilanguage support
- **Multilanguage Translations**: Professional translations for 5 topics across 14 languages (1,400+ keywords)
- **Time Options**: Predefined time range configurations with explicit days property
- **Reference Data**: Structured data for consistent application behavior
- **Dynamic Source Fallbacks**: Stable fallback data when dynamic source fetching fails

### **Phase 4: UX Data Enhancements (v3.1)** ✨

Enhanced data configurations supporting improved user experience:
- **Accessibility Labels**: Predefined ARIA labels and screen reader announcements
- **Mobile-Responsive Data**: Touch target sizes and responsive breakpoint configurations
- **Error Message Templates**: Structured error messages with recovery step guidance
- **Loading State Configurations**: Progress indicator steps and loading message templates

## File Structure

```
src/data/
├── newsSources.ts           # Curated news sources with political classifications
├── topics.ts               # Enhanced topic keywords with multilanguage integration
└── multiLanguageKeywords.ts # Comprehensive multilanguage keyword translations
```

## Core Data Files

### **newsSources.ts**

**Purpose**: Defines the core set of curated news sources with political lean classifications and metadata.

**Structure**:
```typescript
export const NEWS_SOURCES: NewsSource[] = [
  {
    id: string,           // Unique identifier
    name: string,         // Display name
    rssUrl?: string,      // RSS feed URL (for RSS mode)
    newsApiId?: string,   // NewsAPI source ID (for API mode)
    politicalLean: 'left' | 'lean-left' | 'center' | 'lean-right' | 'right',
    credibility: number,  // 0.0-1.0 credibility score
    website: string,      // Main website domain
  }
]
```

**Current Sources** (as of latest update):

#### Left-Leaning Sources
```typescript
{
  id: 'cnn',
  name: 'CNN',
  rssUrl: 'http://rss.cnn.com/rss/edition.rss',
  newsApiId: 'cnn',
  politicalLean: 'left',
  credibility: 0.7,
  website: 'cnn.com',
},
{
  id: 'msnbc', 
  name: 'MSNBC',
  rssUrl: 'http://www.msnbc.com/feeds/latest',
  newsApiId: 'msnbc',
  politicalLean: 'left',
  credibility: 0.6,
  website: 'msnbc.com',
}
```

#### Lean-Left Sources  
```typescript
{
  id: 'guardian',
  name: 'The Guardian',
  rssUrl: 'https://www.theguardian.com/rss',
  newsApiId: 'the-guardian-uk',
  politicalLean: 'lean-left',
  credibility: 0.8,
  website: 'theguardian.com',
},
{
  id: 'npr',
  name: 'NPR', 
  rssUrl: 'https://feeds.npr.org/1001/rss.xml',
  politicalLean: 'lean-left',
  credibility: 0.9,
  website: 'npr.org',
}
```

#### Center Sources
```typescript
{
  id: 'bbc',
  name: 'BBC News',
  rssUrl: 'http://feeds.bbci.co.uk/news/rss.xml',
  newsApiId: 'bbc-news',
  politicalLean: 'center',
  credibility: 0.8,
  website: 'bbc.com',
},
{
  id: 'reuters',
  name: 'Reuters',
  rssUrl: 'https://feeds.reuters.com/reuters/topNews',
  newsApiId: 'reuters',
  politicalLean: 'center',
  credibility: 0.9,
  website: 'reuters.com',
},
{
  id: 'ap',
  name: 'Associated Press',
  rssUrl: 'https://feeds.apnews.com/apnews/topnews', 
  newsApiId: 'associated-press',
  politicalLean: 'center',
  credibility: 0.9,
  website: 'apnews.com',
}
```

#### Lean-Right Sources
```typescript
{
  id: 'wsj',
  name: 'Wall Street Journal',
  rssUrl: 'https://feeds.a.dj.com/rss/RSSWorldNews.xml',
  newsApiId: 'the-wall-street-journal',
  politicalLean: 'lean-right',
  credibility: 0.8,
  website: 'wsj.com',
}
```

#### Right-Leaning Sources
```typescript
{
  id: 'fox',
  name: 'Fox News',
  rssUrl: 'http://feeds.foxnews.com/foxnews/latest',
  newsApiId: 'fox-news',
  politicalLean: 'right',
  credibility: 0.6,
  website: 'foxnews.com',
},
{
  id: 'nypost',
  name: 'New York Post',
  rssUrl: 'https://nypost.com/feed/',
  newsApiId: 'new-york-post',
  politicalLean: 'right',
  credibility: 0.5,
  website: 'nypost.com',
}
```

### **multiLanguageKeywords.ts** ✨ *New File*

**Purpose**: Comprehensive multilanguage keyword translations for international news analysis.

**Structure**:
```typescript
export const MULTI_LANGUAGE_TOPICS: TopicKeywords[] = [
  {
    topic: 'Climate Change',
    keywords: [], // Legacy - kept for compatibility
    multiLanguageKeywords: {
      'en': ['climate change', 'global warming', ...], // 20+ English keywords
      'es': ['cambio climático', 'calentamiento global', ...], // 20+ Spanish keywords
      'fr': ['changement climatique', 'réchauffement climatique', ...], // 20+ French keywords
      // ... 14 languages total per topic
    },
    fallbackKeywords: ['climate change', 'global warming', ...]
  }
]
```

**Language Coverage** (14 languages):
- **Arabic** (ar): العربية
- **Chinese** (zh): 中文  
- **Dutch** (nl): Nederlands
- **English** (en): English
- **French** (fr): Français
- **German** (de): Deutsch
- **Hebrew** (he): עברית
- **Italian** (it): Italiano
- **Norwegian** (no): Norsk
- **Portuguese** (pt): Português
- **Russian** (ru): Русский
- **Spanish** (es): Español
- **Swedish** (sv): Svenska
- **Urdu** (ud): اردو

**Topics with Full Translations** (5 topics):
1. **Climate Change**: Environmental policy, sustainability, renewable energy
2. **Healthcare**: Medical costs, insurance, policy reform
3. **Immigration**: Border security, asylum policy, visa reform
4. **Economy**: Economic growth, inflation, employment, financial policy
5. **Technology**: AI, cybersecurity, digital privacy, tech regulation

**Helper Functions**:
```typescript
export function getKeywordsForLanguage(topic: string, language: NewsLanguage): string[]
export function getAvailableLanguagesForTopic(topic: string): NewsLanguage[]
```

### **topics.ts** ✨ *Enhanced with Multilanguage Integration*

**Purpose**: Defines topic categories with associated keywords for content filtering and time range options, now enhanced with multilanguage support.

**Structure**:
```typescript
export const TOPICS: TopicKeywords[] = [...]
export const TIME_OPTIONS: TimeOption[] = [...]
```

#### Topic Keywords Configuration
```typescript
export const TOPICS: TopicKeywords[] = [
  {
    topic: 'Climate Change',
    keywords: [
      'climate',
      'global warming', 
      'carbon',
      'renewable',
      'fossil fuel',
      'emissions',
    ],
  },
  {
    topic: 'Healthcare',
    keywords: [
      'healthcare',
      'medicare',
      'insurance',
      'prescription',
      'medical',
      'health policy',
    ],
  },
  {
    topic: 'Immigration', 
    keywords: [
      'immigration',
      'border',
      'asylum',
      'visa',
      'refugee',
      'migrant',
    ],
  },
  {
    topic: 'Economy',
    keywords: [
      'economy',
      'inflation',
      'jobs',
      'gdp',
      'unemployment',
      'recession',
    ],
  },
  {
    topic: 'Technology',
    keywords: [
      'tech',
      'AI',
      'artificial intelligence',
      'privacy',
      'data',
      'cyber',
      'digital',
    ],
  },
]
```

#### Time Range Options
```typescript
export const TIME_OPTIONS: TimeOption[] = [
  { label: '24 hours', value: 1, days: 1 },
  { label: '3 days', value: 3, days: 3 },
  { label: '1 week', value: 7, days: 7 },
  { label: '2 weeks', value: 14, days: 14 },
  { label: '1 month', value: 30, days: 30 },
]
```
*Note: Added explicit `days` property for improved date calculations and type safety.*

## Data Validation and Quality

### Source Classification Methodology

**Political Lean Classifications** are based on:
- Independent media bias analysis (AllSides, Ad Fontes Media)
- Editorial positioning and content analysis
- Peer review and academic research
- International media bias assessments

**Credibility Scores** (0.0-1.0) consider:
- Factual accuracy track record
- Transparency in reporting  
- Editorial standards and corrections policy
- Independence from commercial/political influence
- Professional journalism standards

### Keywords Selection Criteria

Topic keywords are chosen based on:
- **Relevance**: Direct relationship to topic area
- **Coverage**: Broad enough to capture relevant articles
- **Specificity**: Specific enough to avoid false positives
- **Variations**: Common alternative terms and synonyms
- **Current Events**: Updated to reflect contemporary language

## Usage Patterns

### In RSS Mode
- Static sources provide RSS URLs for direct feed fetching
- Political lean used for visual categorization
- Credibility scores influence source recommendations

### In NewsAPI Mode (Dynamic Source System)
- **Fallback Foundation**: Static sources provide reliable fallback when dynamic sources fail
- **API Integration**: NewsAPI IDs enable API-based article fetching
- **Classification Baseline**: Political lean provides baseline for dynamic source classification
- **Quality Assessment**: Credibility scores complement dynamic source evaluation
- **Unknown Source Handling**: System now defaults to 'unknown' classification instead of misleading 'center' for unrecognized sources

## Data Management

### Adding New Sources

When adding new sources:

1. **Research Political Lean**: Use multiple bias assessment sources
2. **Verify Feed Quality**: Test RSS feeds and NewsAPI IDs
3. **Assess Credibility**: Review factual accuracy and standards
4. **Check Availability**: Ensure consistent feed availability
5. **Update Documentation**: Document rationale for classifications

**Example Addition**:
```typescript
{
  id: 'new-source-id',
  name: 'Source Display Name',
  rssUrl: 'https://source.com/rss',
  newsApiId: 'source-newsapi-id',
  politicalLean: 'center', // Based on research
  credibility: 0.8, // Based on assessment
  website: 'source.com',
}
```

### Updating Topic Keywords

When updating topic keywords:

1. **Analyze Current Coverage**: Review article matching effectiveness
2. **Research New Terms**: Identify emerging terminology
3. **Test Relevance**: Validate keyword effectiveness
4. **Avoid Overlap**: Minimize cross-topic keyword conflicts
5. **Document Changes**: Track keyword evolution

### Version Control

Changes to data files should be:
- **Well-documented**: Clear commit messages explaining changes
- **Validated**: Tested for impact on article filtering
- **Reviewed**: Subject to code review for accuracy
- **Traceable**: Linked to research sources and rationale

## Integration with Services

### Dynamic Source Service
- Static sources provide fallback when API fails
- Political lean classifications seed dynamic source mapping
- Credibility scores influence source ranking

### Filter Service
- Topic keywords drive article relevance scoring
- Time options provide user interface consistency

### RSS Service
- RSS URLs enable direct feed fetching
- Source metadata enriches article data

## Development Considerations

### TypeScript Integration
All data structures use strict TypeScript interfaces:
```typescript
interface NewsSource {
  id: string;
  name: string; 
  rssUrl?: string;
  newsApiId?: string;
  politicalLean: 'left' | 'lean-left' | 'center' | 'lean-right' | 'right';
  credibility: number;
  website: string;
}
```

### Data Validation
Consider adding runtime validation:
```typescript
function validateNewsSource(source: any): source is NewsSource {
  return (
    typeof source.id === 'string' &&
    typeof source.name === 'string' &&
    typeof source.credibility === 'number' &&
    source.credibility >= 0 && source.credibility <= 1 &&
    ['left', 'lean-left', 'center', 'lean-right', 'right'].includes(source.politicalLean)
  );
}
```

### Performance Considerations
- Data is loaded once at application startup
- Consider code splitting for large datasets
- Static analysis can optimize bundle size

## Future Enhancements

1. **Dynamic Topic Keywords**: AI-generated keywords based on trending topics
2. **User-Defined Sources**: Allow users to add custom news sources  
3. **Regional Variations**: Location-specific source recommendations
4. **Real-time Updates**: Dynamic source availability checking
5. **Community Curation**: Crowdsourced source quality ratings
6. **Machine Learning**: AI-powered political lean detection
7. **Multilingual Support**: International source categories
8. **Source Recommendations**: Personalized source suggestions