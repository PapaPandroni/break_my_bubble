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

**Version**: 2.4 - Enhanced UI/UX with Refined Landing Page ✅  
**Last Updated**: July 2025  
**Build Status**: ✅ Production Ready  
**Features**: NewsAPI-powered architecture with 12-24 hour smart caching, comprehensive multilanguage search (14 languages), free text search functionality, and refined UI with improved header consistency and landing page experience

## Architecture Overview

BreakMyBubble is a React + TypeScript news analysis app that helps users discover opposing perspectives by comparing their preferred news sources against others. The app uses NewsAPI.org as its data source, providing comprehensive multi-language support and advanced filtering capabilities with intelligent caching for optimal performance.

### **Recent UI/UX Enhancements (v2.4)** ✨

The application now features a significantly improved user interface with enhanced consistency and user experience:

**Header Enhancement:**
- Integrated subtitle "Discover opposing perspectives" directly in header for consistent branding
- Unified branding message across all application phases
- Improved header visual hierarchy and spacing

**Landing Page Refinements:**
- Removed duplicate title/subtitle elements for cleaner, focused design
- Refined typography sizing from oversized (text-5xl) to appropriate proportions (h2)
- Optimized spacing throughout (reduced excessive space-y-16 to balanced space-y-8)
- Enhanced source selection card with color/shape emphasis instead of size:
  - Primary blue border (border-primary-300) for clear visual distinction
  - Light primary background (bg-primary-25) for subtle emphasis
  - Proper proportional padding and refined hover effects
- Successfully integrated filter panel below main selection for improved workflow

**Modal Improvements:**
- Fixed duplicate "Advanced options" sections in TopicSelectionModal
- Streamlined modal interface for better user focus

**Content Accuracy:**
- Updated FAQ from misleading "over 80,000 sources" to accurate "over 130 high-quality news sources"
- Emphasized curation and quality over inflated quantity claims
- Better reflects actual user experience and value proposition

### **NEW: 3-Phase UI Architecture ✨**

The application now implements a streamlined 3-phase user interface flow with modal-based interactions:

**Phase 1: Landing Page** (`currentStep: 'landing'`)
- Google-inspired centered layout with refined visual hierarchy
- Enhanced source selection with color/shape emphasis (primary blue border and background)
- Integrated filter panel positioned below source selection for improved workflow
- FAQ section with accurate content (130+ curated sources vs previous inflated claims)
- Continue button that transitions to Phase 2

**Phase 2: Topic Selection Modal** (`currentStep: 'modal'`)
- Full-screen modal overlay with backdrop
- Topic selection using TopicSelector with custom search capability
- Advanced filtering panel with language, country, sort, and date options
- Modal-specific focus management and keyboard navigation
- "BREAK MY BUBBLE" action button to proceed to results

**Phase 3: Results Display** (`currentStep: 'results'`)
- Full-screen results layout with comprehensive error boundaries
- Loading states with skeleton components
- Enhanced ResultsDisplay with opposing perspective analysis
- Navigation back to landing page via header

### **App State Management**

The app uses a centralized `AppStep` type system:
```typescript
export type AppStep = 'landing' | 'modal' | 'results'
```

Step transitions are handled through dedicated navigation functions:
- `handleContinueToModal()`: Landing → Modal
- `handleBackToLanding()`: Modal → Landing  
- `handleStartAnalysis()`: Modal → Results

### **Enhanced Error Boundary System ✨**

The 3-phase UI implements a comprehensive error boundary strategy:

**App-Level Error Boundary:**
- Wraps entire application for critical errors
- Provides fallback UI for unrecoverable errors

**Phase-Specific Error Boundaries:**
- `ErrorBoundary` for Landing Page components
- `ModalErrorBoundary` for Topic Selection Modal with modal-specific cleanup
- `ResultsErrorBoundary` for Results Display with search retry capabilities

**Component-Level Protection:**
- Header component has dedicated error boundary
- Loading states have isolated error handling
- Debug tools wrapped in development-only error boundaries

**Error Boundary Features:**
- Automatic error reporting to console with context
- Custom fallback UIs per boundary type
- Modal-aware cleanup for modal errors
- Retry functionality where appropriate
- Graceful degradation without losing user progress

### Core Components Structure

- **App.tsx**: Main application with 3-phase flow control and NewsAPI integration
- **Header.tsx**: Enhanced with integrated "Discover opposing perspectives" subtitle for consistent branding
- **LandingPage.tsx**: Phase 1 - Refined Google-inspired interface with improved spacing and visual emphasis
- **TopicSelectionModal.tsx**: Phase 2 - Streamlined modal-based topic and filter selection
- **ResultsDisplay.tsx**: Phase 3 - Results presentation with error boundaries
- **FAQ.tsx**: Updated with accurate content emphasizing quality over quantity (130+ curated sources)
- **Components**: 15+ modular UI components including advanced selectors, filters, and CustomSearchInput
- **Services**: Business logic layer with comprehensive NewsAPI integration and multilanguage filtering
- **Data**: Static configuration for news sources, topics, and multilanguage keyword mappings

### Data Source Architecture

The app uses NewsAPI.org as its primary data source with comprehensive features:

**NewsAPI Integration**:
- Dynamic source fetching with 54 countries supported
- 14 language support with native names and flags
- Advanced filtering (country, language, domain, sort options)
- Custom date range selection with presets
- Article images, author info, and content previews
- Pagination support for large datasets
- **Enhanced Caching**: 12-24 hour smart caching with automatic fallback during API outages

### Core Components

- **LanguageSelector**: 14 languages with flags and native names, search functionality
- **CountrySelector**: 54 countries with flags, multi-selection up to 3 countries  
- **SortSelector**: Sort by relevancy, publishedAt, or popularity
- **DateRangePicker**: Custom date ranges or preset options
- **Enhanced ResultsDisplay**: Article images, author info, content previews with 5-point political lean classification
- **CustomSearchInput**: Free text search with multilanguage support, real-time parsing, and term management
- **TopicSelector**: Enhanced with "Custom Search" option for user-defined search terms

### Key Services

- **newsApiService.ts**: Complete NewsAPI integration with pagination, sorting, domain filtering
- **unifiedSourceService.ts**: Unified source management with enhanced political lean classification (27+ international sources)
- **filterService.ts**: Article filtering and opposing perspective logic with multilanguage keyword support
- **cacheService.ts**: Enhanced 12-24 hour smart caching system with automatic fallback
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
- NewsAPI source IDs and fallback configuration
- 5-point political lean classification (left/lean-left/center/lean-right/right)
- Credibility scoring (0.0-1.0)

**Dynamic Sources**:
- Fetched from NewsAPI `/sources` endpoint
- Enhanced political lean mapping with 27+ classified international sources
- Filtered by language, country, category
- Confidence scoring for classification accuracy
- 24-hour caching with fallback to static sources

### State Management

Uses React hooks with enhanced AppState interface that includes 3-phase flow control:

**Flow Control State:**
- `currentStep`: Controls which phase is displayed ('landing' | 'modal' | 'results')
- Step transition handlers with proper state cleanup

**Data Selection State:**
- Source selection (1-5 sources) with dynamic filtering
- Multi-language selection (up to 5 languages)  
- Multi-country filtering (up to 3 countries)
- Sort preferences (relevancy/date/popularity)
- Custom date ranges or preset timeframes
- Topic filtering (12 predefined topics + custom search capability)
- Custom search terms (user-defined multilanguage search)

**UI State Management:**
- Results display with enhanced article data
- Available sources management (static + dynamic)
- Loading states for sources and results
- Error handling for network failures with step-specific error boundaries
- Modal state management with focus trapping and accessibility

**Navigation Functions:**
- `handleContinueToModal()`: Validates source selection and transitions to modal
- `handleBackToLanding()`: Returns to landing page with state preservation
- `handleStartAnalysis()`: Initiates analysis and transitions to results
- `handleReset()`: Comprehensive state reset returning to landing page

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
- Topic filtering validation  
- NewsAPI integration testing
- Source validation and API status
- Cache management and clearing
- Demo mode with mock data

### Environment Variables

**Required**:
- `VITE_NEWS_API_KEY=your_key`: Your NewsAPI.org API key (business users should provide this)

**Optional**:
- `VITE_USE_NEWS_API=true`: Legacy environment variable (app now defaults to NewsAPI-only)

### Technology Stack

- React 18 + TypeScript (100% type coverage)
- Vite build system with optimized production builds
- Tailwind CSS for responsive styling with custom political lean color palette
- Native Fetch API with comprehensive error handling
- Enhanced caching with smart fallback strategies
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

**For Business/Production Use**:
1. Get API key from [newsapi.org/register](https://newsapi.org/register) (business plan recommended)
2. Create `.env` file:
   ```
   VITE_NEWS_API_KEY=your_api_key_here
   ```
3. `npm install && npm run dev`
4. Enjoy full multi-language, multi-country news analysis with 12-24 hour smart caching!

**For Development/Testing**:
1. `npm install`
2. Contact project maintainer for development API key
3. `npm run dev`

### Error Handling

The app includes comprehensive error handling:
- ✅ Automatic fallback to cached data when NewsAPI is unavailable (up to 24 hours)
- ✅ Smart caching with fresh/stale/expired tiers for optimal performance  
- ✅ Network error recovery with exponential backoff retry
- ✅ Loading states and user feedback throughout
- ✅ Service-level error boundaries and recovery mechanisms
- ✅ Background refresh for stale data without blocking user experience

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