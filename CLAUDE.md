# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Lint code
npm run lint

# Preview production build
npm run preview

# Test NewsAPI integration
npm run test:newsapi
```

## Project Status

**Version**: 2.2 - Multilanguage Search & Free Text Search ✅  
**Last Updated**: July 2025  
**Build Status**: ✅ Production Ready  
**Features**: Comprehensive multilanguage search support (14 languages) + free text search functionality

## Architecture Overview

BreakMyBubble is a React + TypeScript news analysis app that helps users discover opposing perspectives by comparing their preferred news sources against others. The app supports both RSS feeds and NewsAPI as data sources, with comprehensive multi-language and advanced filtering capabilities.

### Core Components Structure

- **App.tsx**: Main application with dual data source support and enhanced NewsAPI features
- **Components**: 15+ modular UI components including advanced selectors, filters, and CustomSearchInput
- **Services**: Business logic layer with comprehensive NewsAPI integration and multilanguage filtering
- **Data**: Static configuration for news sources, topics, and multilanguage keyword mappings

### Data Source Architecture

The app supports two data fetching strategies controlled by the `VITE_USE_NEWS_API` environment variable:

**RSS Mode (Basic)**: 
- Fetches from RSS feeds via CORS proxy
- Uses TimeSlider for date selection
- Limited to English sources
- Static source configuration

**NewsAPI Mode (Advanced)**:
- Uses NewsAPI.org with full feature set
- Dynamic source fetching with 54 countries
- 14 language support with native names
- Advanced filtering (country, language, domain, sort options)
- Custom date range picker
- Article images, author info, and content previews
- Pagination support

### Enhanced Components (NewsAPI Mode)

- **LanguageSelector**: 14 languages with flags and native names, search functionality
- **CountrySelector**: 54 countries with flags, multi-selection up to 3 countries  
- **SortSelector**: Sort by relevancy, publishedAt, or popularity
- **DateRangePicker**: Custom date ranges or preset options (replaces TimeSlider)
- **Enhanced ResultsDisplay**: Article images, author info, content previews with 5-point political lean classification
- **CustomSearchInput**: Free text search with multilanguage support, real-time parsing, and term management
- **TopicSelector**: Enhanced with "Custom Search" option for user-defined search terms

### Key Services

- **newsApiService.ts**: Complete NewsAPI integration with pagination, sorting, domain filtering
- **dynamicSourceService.ts**: Dynamic source fetching with enhanced political lean classification (27+ international sources)
- **rssService.ts**: RSS feed parsing with CORS proxy (fallback mode)
- **filterService.ts**: Article filtering and opposing perspective logic with multilanguage keyword support
- **cacheService.ts**: 30-minute local storage caching system
- **debugService.ts**: Development debugging utilities with NewsAPI testing

### Multilanguage Search & Free Text Search System ✨

**Multilanguage Topic Keywords** (`/src/data/multiLanguageKeywords.ts`):
- **14 Language Support**: Arabic, Chinese, Dutch, English, French, German, Hebrew, Italian, Norwegian, Portuguese, Russian, Spanish, Swedish, Urdu
- **5 Fully Translated Topics**: Climate Change, Healthcare, Immigration, Economy, Technology
- **Smart Fallback System**: Requested language → English → Legacy keywords
- **Professional Translations**: 20+ keywords per topic per language (1,400+ total keywords)

**Free Text Search** (`/src/components/CustomSearchInput.tsx`):
- **Real-time Parsing**: Comma and space-separated terms with instant validation
- **Term Management**: Individual term removal with visual chips
- **Multilanguage Support**: Works seamlessly with any language input
- **User Experience**: Auto-complete, help text, and clear visual feedback
- **Integration**: "Custom Search" option in TopicSelector with distinct purple styling

**Enhanced Filtering** (`/src/services/filterService.ts`):
- **Language-aware Matching**: Uses appropriate keywords based on selected languages
- **Custom Term Priority**: User-defined search terms override topic keywords
- **Intelligent Fallbacks**: Multiple fallback strategies for maximum coverage
- **Performance Optimized**: Efficient keyword normalization and caching

### News Source Configuration

**Static Sources** (`/src/data/newsSources.ts`):
- RSS URL for RSS mode
- NewsAPI ID for API mode  
- 5-point political lean classification (left/lean-left/center/lean-right/right)
- Credibility scoring (0.0-1.0)

**Dynamic Sources** (NewsAPI Mode):
- Fetched from NewsAPI `/sources` endpoint
- Enhanced political lean mapping with 27+ classified international sources
- Filtered by language, country, category
- Confidence scoring for classification accuracy
- 24-hour caching with fallback to static sources

### State Management

Uses React hooks with enhanced AppState interface:
- Source selection (1-5 sources) with dynamic filtering
- Multi-language selection (up to 5 languages)  
- Multi-country filtering (up to 3 countries)
- Sort preferences (relevancy/date/popularity)
- Custom date ranges or preset timeframes
- Topic filtering (12 predefined topics + custom search capability)
- Custom search terms (user-defined multilanguage search)
- Results display with enhanced article data
- Available sources management (static + dynamic)
- Loading states for sources and results
- Error handling for network failures

### NewsAPI Features Implemented ✅

**Core Integration**:
- ✅ Both `/everything` and `/sources` endpoints
- ✅ Comprehensive error handling and rate limiting  
- ✅ API key validation with graceful fallbacks

**Search Parameters**:
- ✅ Query building with keyword optimization
- ✅ Source filtering with validation
- ✅ Language filtering (14 languages)
- ✅ Date range filtering (custom + presets)
- ✅ Sort by relevancy/publishedAt/popularity
- ✅ Domain include/exclude filtering
- ✅ Pagination support (page/pageSize)

**Advanced Features**:
- ✅ Dynamic source discovery and filtering
- ✅ Country-based source filtering (54 countries)
- ✅ Political lean classification with confidence scoring
- ✅ Article images and author information
- ✅ Content previews where available
- ✅ Comprehensive caching strategy

### Development Features

When `import.meta.env.DEV` is true, debug buttons are available for:
- RSS feed testing
- Topic filtering validation  
- NewsAPI integration testing
- Source validation and API status
- Cache management and clearing
- Demo mode with mock data

### Environment Variables

**Required for NewsAPI Mode**:
- `VITE_USE_NEWS_API=true`: Enables NewsAPI mode
- `VITE_NEWS_API_KEY=your_key`: Your NewsAPI.org API key

**Optional**:
- `VITE_USE_NEWS_API=false` or unset: Uses RSS mode (basic features)

### Technology Stack

- React 18 + TypeScript (100% type coverage)
- Vite build system with optimized production builds
- Tailwind CSS for responsive styling with custom political lean color palette
- Native Fetch API with comprehensive error handling
- DOMParser for RSS parsing (fallback mode)
- Advanced date handling and internationalization

### Project Documentation Structure

Each directory contains comprehensive CLAUDE.md documentation:
- **`/src/components/`**: React component architecture and patterns
- **`/src/services/`**: Business logic services and API integration
- **`/src/data/`**: Static data configuration and management
- **`/src/types/`**: TypeScript type definitions and interfaces
- **`/src/utils/`**: Utility functions and helpers
- **`/scripts/`**: Build and development automation scripts
- **`.claude/`**: Claude Code configuration and permissions

### Setup Instructions

**RSS Mode (Basic)**:
1. `npm install`
2. `npm run dev`
3. No additional configuration needed

**NewsAPI Mode (Full Features)**:
1. Get free API key from [newsapi.org/register](https://newsapi.org/register)  
2. Create `.env` file:
   ```
   VITE_USE_NEWS_API=true
   VITE_NEWS_API_KEY=your_api_key_here
   ```
3. `npm install && npm run dev`
4. Enjoy full multi-language, multi-country news analysis!

### Error Handling

The app includes comprehensive error handling:
- ✅ Graceful API key validation with user-friendly messages
- ✅ Automatic fallback to RSS mode when NewsAPI fails  
- ✅ Clear user guidance for configuration issues
- ✅ Network error recovery with exponential backoff retry
- ✅ Loading states and user feedback throughout
- ✅ Service-level error boundaries and recovery mechanisms
- ✅ Cache fallback strategies for improved reliability

### International Source Classifications (Latest Update)

Recently expanded political lean mapping with 14 new international sources:

**Lean-Left Sources:**
- CNN Spanish (CNN en Español) - US Spanish-language news
- The Hindu - India's leading English newspaper  
- Infobae - Argentina's digital news leader
- Ynet - Israel's largest news website

**Center Sources:**
- Blasting News (BR) - Brazil's citizen journalism platform
- SABQ - Saudi Arabia digital newspaper

**Lean-Right Sources:**
- Aftenposten - Norway's leading newspaper
- Göteborgs-Posten - Sweden's major daily
- The Jerusalem Post - Israel's English-language news
- Svenska Dagbladet - Sweden's morning newspaper  
- News.com.au - Australia's digital news platform
- RBC - Russia's business and news outlet

**Right Sources:**
- Globo - Brazil's media conglomerate
- La Gaceta - Argentina's conservative newspaper

Each source includes credibility scores (0.5-0.8) and confidence levels (0.6-0.9) for classification accuracy.

## Developer Relationship Guidelines

- **Communication Philosophy**:
  - You are my lead developer, I am the lead designer
  - I do not want a "yes-man" approach
  - When you think it is appropriate to challenge my ideas, you are expected to do so constructively

## Additional Guidelines and Memories

- Whenever you find a CLAUDE.md file in a directory you are working in, read it and use it.