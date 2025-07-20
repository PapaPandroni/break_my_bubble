# BreakMyBubble Development Plan

## Phase 1: Project Foundation
- Initialize React + TypeScript + Vite project with proper configuration
- Configure Tailwind CSS with custom color scheme (blue/gray/red for political leanings)
- Set up TypeScript strict mode, ESLint, and Prettier

## Phase 2: Core Data & Infrastructure
- Create TypeScript interfaces for NewsSource, Article, TopicKeywords, UserSelection
- Implement news sources data (10 sources across left/center/right spectrum)
- Create topics data with keyword mappings for 5 key topics
- Build utility functions for date handling and text processing

## Phase 3: Service Layer
- **CORS Proxy Service**: Handle RSS feed access using `https://api.allorigins.win/get?url=`
- **RSS Parser**: Convert XML feeds to structured Article objects
- **Content Filter**: Keyword matching, date filtering, and deduplication
- **Caching**: 30-minute cache for RSS data with 10-second request timeouts

## Phase 4: Component Development
- **Input Components**: SourceInput (multi-select), TopicSelector, TimeSlider (24h-1month)
- **Display Components**: ResultsDisplay (side-by-side layout), LoadingState, ErrorMessage
- **Layout**: Header with branding and navigation

## Phase 5: Integration & User Flow
- Wire components in App.tsx with React hooks state management
- Implement complete flow: source selection → topic choice → time range → analysis → results
- Apply political lean color coding throughout UI
- Ensure mobile-responsive design

## Phase 6: Performance & Polish
- Limit 20 articles per source, add proper error handling for failed feeds
- Implement accessibility features (ARIA labels, keyboard nav, screen reader support)
- Add source bias disclaimer and attribution
- Test RSS parsing across different news source formats

## Key Technical Challenges
1. **CORS Issues**: RSS feeds will be blocked by browser CORS policies - using proxy service
2. **RSS Variability**: Different sources have varying XML structures - robust parsing needed
3. **Performance**: Multiple concurrent feed requests - proper loading states and timeouts
4. **Content Filtering**: Accurate keyword matching without false positives

## Expected Outcome
A functional MVP that demonstrates news perspective comparison without AI analysis, showing users how different sources frame the same topics. The app will be stateless, fast-loading, and provide immediate value for media literacy.

## Detailed Task Breakdown

### Setup Tasks
- [x] Initialize React + TypeScript + Vite project with proper configuration
- [x] Configure Tailwind CSS with custom color scheme for political leanings
- [ ] Set up TypeScript strict mode, ESLint, and Prettier configuration

### Data & Types
- [ ] Create TypeScript interfaces in src/types/index.ts
- [ ] Implement news sources data with RSS URLs and political classifications
- [ ] Create topics data with keyword mappings for content filtering

### Services
- [ ] Build CORS proxy service for RSS feed access
- [ ] Implement RSS parsing service with XML-to-JSON conversion
- [ ] Create content filtering service with keyword matching and date filtering
- [ ] Add 30-minute caching mechanism for RSS feeds

### Utilities
- [ ] Build date utilities for timeframe filtering
- [ ] Create helper functions for deduplication and text processing

### Components
- [ ] Build Header component with app branding and navigation
- [ ] Create SourceInput component for multi-select news source selection
- [ ] Implement TopicSelector component with predefined topic options
- [ ] Build TimeSlider component with 24h to 1 month range options
- [ ] Create LoadingState component with skeleton animations
- [ ] Build ErrorMessage component for graceful error handling
- [ ] Implement ResultsDisplay component with side-by-side layout

### Styling & UX
- [ ] Apply political lean color coding (blue/gray/red) throughout UI
- [ ] Implement responsive mobile-first design with proper breakpoints

### Integration
- [ ] Wire up all components in main App.tsx with state management
- [ ] Implement complete user flow from source selection to results display

### Performance & Optimization
- [ ] Add 10-second timeouts for RSS requests with proper error handling
- [ ] Limit display to 20 articles per source to prevent UI overwhelm

### Accessibility
- [ ] Add ARIA labels and keyboard navigation support
- [ ] Ensure high contrast ratios and screen reader compatibility

### Testing & Validation
- [ ] Test RSS feed parsing with various news source formats
- [ ] Verify CORS proxy functionality across different browsers

### Polish
- [ ] Add source bias disclaimer and proper attribution
- [ ] Implement empty states for no results scenarios