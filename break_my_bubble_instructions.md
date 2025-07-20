# BreakMyBubble MVP - Development Instructions for Claude Code

## Project Overview
Build a single-page web application that helps users identify their news consumption "bubble" by comparing headlines from their preferred news sources against opposing perspectives on a chosen topic.

## Tech Stack
- **Frontend**: React 18+ with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **State Management**: React hooks (useState, useEffect)
- **HTTP Client**: Fetch API (native)
- **Package Manager**: npm
- **Deployment Ready**: Netlify/Vercel compatible

## Directory Structure
```
break-my-bubble/
├── src/
│   ├── components/
│   │   ├── Header.tsx
│   │   ├── SourceInput.tsx
│   │   ├── TopicSelector.tsx
│   │   ├── TimeSlider.tsx
│   │   ├── ResultsDisplay.tsx
│   │   ├── LoadingState.tsx
│   │   └── ErrorMessage.tsx
│   ├── services/
│   │   ├── rssService.ts
│   │   ├── filterService.ts
│   │   └── corsProxy.ts
│   ├── types/
│   │   └── index.ts
│   ├── data/
│   │   ├── newsSources.ts
│   │   └── topics.ts
│   ├── utils/
│   │   ├── helpers.ts
│   │   └── dateUtils.ts
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── public/
├── package.json
├── vite.config.ts
├── tailwind.config.js
├── tsconfig.json
└── README.md
```

## Core Data Structures

```typescript
interface NewsSource {
  id: string;
  name: string;
  rssUrl: string;
  politicalLean: 'left' | 'center' | 'right';
  credibility: number;
  website: string;
}

interface Article {
  title: string;
  description: string;
  link: string;
  pubDate: string;
  source: string;
  sourceLean: 'left' | 'center' | 'right';
}

interface TopicKeywords {
  topic: string;
  keywords: string[];
}

interface UserSelection {
  sources: string[];
  topic: string;
  timeframe: number; // days
}
```

## Initial Data Sets

### News Sources (src/data/newsSources.ts)
```typescript
export const NEWS_SOURCES: NewsSource[] = [
  // Left-leaning
  { id: 'cnn', name: 'CNN', rssUrl: 'http://rss.cnn.com/rss/edition.rss', politicalLean: 'left', credibility: 0.7, website: 'cnn.com' },
  { id: 'msnbc', name: 'MSNBC', rssUrl: 'http://www.msnbc.com/feeds/latest', politicalLean: 'left', credibility: 0.6, website: 'msnbc.com' },
  { id: 'guardian', name: 'The Guardian', rssUrl: 'https://www.theguardian.com/rss', politicalLean: 'left', credibility: 0.8, website: 'theguardian.com' },
  { id: 'npr', name: 'NPR', rssUrl: 'https://feeds.npr.org/1001/rss.xml', politicalLean: 'center', credibility: 0.9, website: 'npr.org' },
  
  // Center
  { id: 'bbc', name: 'BBC News', rssUrl: 'http://feeds.bbci.co.uk/news/rss.xml', politicalLean: 'center', credibility: 0.8, website: 'bbc.com' },
  { id: 'reuters', name: 'Reuters', rssUrl: 'https://feeds.reuters.com/reuters/topNews', politicalLean: 'center', credibility: 0.9, website: 'reuters.com' },
  { id: 'ap', name: 'Associated Press', rssUrl: 'https://feeds.apnews.com/apnews/topnews', politicalLean: 'center', credibility: 0.9, website: 'apnews.com' },
  
  // Right-leaning
  { id: 'fox', name: 'Fox News', rssUrl: 'http://feeds.foxnews.com/foxnews/latest', politicalLean: 'right', credibility: 0.6, website: 'foxnews.com' },
  { id: 'wsj', name: 'Wall Street Journal', rssUrl: 'https://feeds.a.dj.com/rss/RSSWorldNews.xml', politicalLean: 'right', credibility: 0.8, website: 'wsj.com' },
  { id: 'nypost', name: 'New York Post', rssUrl: 'https://nypost.com/feed/', politicalLean: 'right', credibility: 0.5, website: 'nypost.com' }
];
```

### Topics with Keywords (src/data/topics.ts)
```typescript
export const TOPICS: TopicKeywords[] = [
  { topic: 'Climate Change', keywords: ['climate', 'global warming', 'carbon', 'renewable', 'fossil fuel', 'emissions'] },
  { topic: 'Healthcare', keywords: ['healthcare', 'medicare', 'insurance', 'prescription', 'medical', 'health policy'] },
  { topic: 'Immigration', keywords: ['immigration', 'border', 'asylum', 'visa', 'refugee', 'migrant'] },
  { topic: 'Economy', keywords: ['economy', 'inflation', 'jobs', 'gdp', 'unemployment', 'recession'] },
  { topic: 'Technology', keywords: ['tech', 'AI', 'artificial intelligence', 'privacy', 'data', 'cyber', 'digital'] }
];
```

## User Flow
1. **Source Selection**: User enters 3-5 preferred news sources from available list
2. **Topic Selection**: User chooses ONE topic from predefined list
3. **Time Range**: User selects timeframe via slider (24 hours to 1 month)
4. **Analysis**: App fetches RSS feeds and filters by topic and timeframe
5. **Results**: Display headlines from user's sources vs. opposing perspectives side-by-side

## Key Features to Implement

### 1. RSS Feed Handling
- **CORS Solution**: Use a CORS proxy service like `https://api.allorigins.win/get?url=` or implement error handling for direct requests
- **XML Parsing**: Parse RSS XML to extract title, description, link, pubDate
- **Caching**: Cache RSS data for 30 minutes to avoid excessive requests
- **Error Handling**: Graceful failures when RSS feeds are unavailable

### 2. Content Filtering
- **Keyword Matching**: Case-insensitive search in title and description
- **Date Filtering**: Filter articles by selected timeframe
- **Deduplication**: Remove similar articles based on title similarity

### 3. Results Display
- **Side-by-Side Layout**: User's sources on left, opposing sources on right
- **Visual Distinction**: Different colors/styling for left/center/right sources
- **External Links**: All article links open in new tabs
- **Empty States**: Handle cases with no matching articles gracefully

## Style Guide
- **Design System**: Clean, modern interface using Tailwind CSS
- **Colors**: 
  - Left sources: Blue accent (#3B82F6)
  - Center sources: Gray accent (#6B7280)
  - Right sources: Red accent (#EF4444)
- **Typography**: Sans-serif, clear hierarchy (text-3xl, text-xl, text-base)
- **Spacing**: Consistent spacing using Tailwind scale (4, 8, 16, 24, 32px)
- **Mobile First**: Responsive design with mobile breakpoints
- **Component Naming**: PascalCase for components, camelCase for functions

## Technical Requirements

### Performance
- Loading states for all async operations
- Maximum 20 articles displayed per source to prevent overwhelm
- 10-second timeout for RSS requests
- Skeleton loading animations

### Accessibility
- ARIA labels for all interactive elements
- Keyboard navigation support
- Screen reader friendly
- High contrast ratios for text

### Error Handling
- Network failures
- Malformed RSS feeds
- No results found scenarios
- CORS blocking issues
- Display user-friendly error messages

### Browser Support
- Modern browsers (Chrome 90+, Firefox 88+, Safari 14+, Edge 90+)
- Mobile responsive design
- Touch-friendly interfaces

## Time Slider Specifications
```typescript
// Time options in days
const timeOptions = [
  { label: '24 hours', value: 1 },
  { label: '3 days', value: 3 },
  { label: '1 week', value: 7 },
  { label: '2 weeks', value: 14 },
  { label: '1 month', value: 30 }
];
```

## Future Implementation Considerations
- Component architecture should accommodate AI integration later
- State management should scale to user accounts
- Analytics hooks should be placeholder-ready
- Modular service layer for easy API upgrades
- Database-ready data structures

## Development Setup
- Use TypeScript strict mode
- Include ESLint and Prettier configuration
- Environment variables for CORS proxy URLs
- Development vs production configurations

## Content Guidelines
- Display disclaimer about source bias
- All links open original articles in new tabs
- No content modification, only filtering and display
- Respect source attribution

## Success Metrics to Track (Placeholder)
- Click-through rates to external articles
- Time spent on results page
- Most popular topic selections
- Source combination patterns

## Error Messages
- "Unable to load news feeds. Please try again later."
- "No articles found for this topic in the selected timeframe. Try expanding your time range."
- "Some news sources are currently unavailable."

## Implementation Notes
Build a fully functional MVP that demonstrates the core concept of comparing news perspectives without AI analysis. Focus on clean code, good user experience, and handling the technical challenges of RSS feed processing in the browser.

The application should be stateless (no user accounts), fast to load, and provide immediate value by showing users how different news sources frame the same topics. This MVP will validate the core concept before investing in more sophisticated AI-powered analysis features.