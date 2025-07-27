# Components Directory

This directory contains all React components for the BreakMyBubble application. The components are built using TypeScript and follow a modular, reusable design pattern.

## Architecture Overview

The components are organized as functional components using React hooks for state management. They follow these conventions:

- **TypeScript**: All components are written in TypeScript with strict type checking
- **Props Interface**: Each component defines its props interface for type safety
- **Tailwind CSS**: Styling using Tailwind utility classes with custom color scheme
- **Accessibility**: ARIA labels, keyboard navigation, and screen reader support
- **Responsive**: Mobile-first design with responsive breakpoints

## Component Hierarchy - 3-Phase UI Architecture ✨

The application now implements a 3-phase user interface with modal-based interactions:

```
App.tsx (3-Phase Flow Control)
├── ErrorBoundary (App-level protection)
│   ├── Header.tsx (Phase navigation)
│   │
│   ├── Phase 1: Landing Page (currentStep: 'landing')
│   │   └── ErrorBoundary
│   │       └── LandingPage.tsx
│   │           ├── SourceInput.tsx
│   │           └── FAQ.tsx
│   │
│   ├── Phase 2: Topic Selection Modal (currentStep: 'modal')
│   │   └── ModalErrorBoundary
│   │       └── TopicSelectionModal.tsx
│   │           ├── TopicSelector.tsx
│   │           │   └── CustomSearchInput.tsx
│   │           └── FilterPanel.tsx
│   │               ├── LanguageSelector.tsx
│   │               ├── CountrySelector.tsx
│   │               ├── SortSelector.tsx
│   │               └── DateRangePicker.tsx
│   │
│   └── Phase 3: Results Display (currentStep: 'results')
│       ├── LoadingState.tsx / ResultsLoadingSkeleton
│       ├── ErrorMessage.tsx / NetworkErrorMessage
│       └── ResultsErrorBoundary
│           └── ResultsDisplay.tsx
```

## Components Overview

### Core Layout Components

#### **Header.tsx**
- Application header with title and branding
- **NEW**: Phase-aware navigation with conditional reset/back functionality
- Responsive design with mobile considerations
- Dynamic button display based on current phase
- Title click navigation back to landing page

#### **LandingPage.tsx** ✨ *NEW: Phase 1 Component*
- Google-inspired centered layout with hero section
- Primary interface for Phase 1 of the user flow
- **Features**:
  - Clean, minimal design focusing on source selection
  - SourceInput integration for news source selection
  - FAQ section for user guidance
  - Continue button with validation (requires ≥1 source)
  - Responsive design with mobile-optimized spacing

#### **TopicSelectionModal.tsx** ✨ *NEW: Phase 2 Component*
- Full-screen modal interface for Phase 2
- **Advanced Modal Features**:
  - Backdrop click to close with proper event handling
  - Focus trapping and keyboard navigation (Tab/Shift+Tab)
  - Escape key to close modal
  - Automatic focus management on open/close
  - Body scroll prevention when modal is open
  - **Accessibility**: Full ARIA support with proper labels
- **Content Sections**:
  - Topic selection with TopicSelector integration
  - Advanced filtering panel with all NewsAPI options
  - Action footer with validation and loading states
- **Responsive Design**: Mobile-optimized modal sizing and scrolling

### **NEW: Error Boundary Components** ✨

#### **ErrorBoundary.tsx**
- General-purpose error boundary for components
- Configurable fallback UI and error reporting
- Optional reload functionality
- Proper error context logging

#### **ModalErrorBoundary.tsx** 
- Specialized error boundary for modal components
- Modal-specific cleanup on error (focus restoration, body scroll reset)
- Custom modal error UI with close functionality
- Proper modal lifecycle management during errors

#### **ResultsErrorBoundary.tsx**
- Results-specific error boundary with search context
- Retry functionality for failed searches
- Reset capability to return to landing page
- Search context preservation for debugging

#### **ResultsDisplay.tsx**
- Main results presentation component
- Side-by-side layout for user's sources vs opposing perspectives
- **Intelligent Opposition Ranking**: Articles prioritized by political distance and credibility
- Article cards with images, titles, descriptions, and metadata
- Color-coded by political lean (left/center/right/lean-left/lean-right/unknown)
- **Unknown Source Handling**: Proper display for sources with 'unknown' political classification
- External links with proper attribution
- Enhanced features in NewsAPI mode: author, images, content previews

### Input & Selection Components

#### **SourceInput.tsx**
- Multi-source selection interface (1-5 sources)
- **Enhanced UX**: Fixed removal restrictions - users can now remove all sources if needed
- **Improved Dropdown**: Automatically closes after source selection
- Search and filter functionality
- Integration with both static and dynamic sources
- Visual feedback for selected sources
- Responsive grid layout

#### **TopicSelector.tsx**
- Twelve predefined topics with multilanguage support
- **Enhanced with Custom Search**: Purple-styled "Custom Search" option for free text search
- Clear visual selection with keyword previews
- Integration with CustomSearchInput for user-defined search terms
- Dynamic display of active search terms with counts

#### **FilterPanel.tsx** ✨ *NEW: Modal Filter Component*
- Comprehensive filtering interface for the Topic Selection Modal
- **Organized Layout**: All NewsAPI filter options in a cohesive panel
- **Components Integration**:
  - LanguageSelector for multilanguage support
  - CountrySelector for geographic filtering  
  - SortSelector for result ordering preferences
  - DateRangePicker for temporal filtering
- **Responsive Design**: Mobile-optimized layout within modal context
- **State Management**: Centralized filter state through modal component

#### **CustomSearchInput.tsx** ✨ *Enhanced Integration*
- **Free text search input** with comprehensive multilanguage support
- **Real-time parsing**: Comma and space-separated terms with instant validation
- **Visual term management**: Individual removable chips for each search term
- **Modal Integration**: Optimized for use within TopicSelectionModal
- **User experience features**:
  - Auto-clear functionality (Escape key)
  - Term count display with warnings
  - Comprehensive help text and tips
  - Maximum term limits (10 terms default)
- **Accessibility**: Full keyboard navigation and screen reader support
- **Integration**: Seamless integration with topic-based search system
- **Performance**: Debounced updates and efficient state management

#### **TimeSlider.tsx**
- **Used in**: RSS mode only
- Time range selection: 24 hours to 1 month
- Slider interface with labeled markers
- Real-time value display

#### **DateRangePicker.tsx**
- **Used in**: NewsAPI mode only
- Custom date range selection
- Preset options (24h, 3d, 1w, 2w, 1m)
- Calendar interface for precise date selection
- Enhanced replacement for TimeSlider in NewsAPI mode

### NewsAPI Enhanced Components

These components are only visible/functional when `VITE_USE_NEWS_API=true`:

#### **LanguageSelector.tsx**
- 14 language selection with native names and flags
- Multi-select up to 5 languages
- Search functionality within languages
- Flag icons for visual identification
- Languages: English, Spanish, French, German, Italian, Portuguese, Russian, Arabic, Hebrew, Dutch, Norwegian, Swedish, Chinese, Urdu

#### **CountrySelector.tsx**
- 54 country selection with flags
- Multi-select up to 3 countries
- Search functionality
- Country-based source filtering
- Integration with dynamic source service

#### **SortSelector.tsx**
- Three sorting options:
  - **Relevancy**: Best matches for search terms (works with intelligent opposition ranking)
  - **Published At**: Most recent articles first (preserves sort while adding opposition intelligence)
  - **Popularity**: Most popular/shared articles (enhanced with political distance scoring)
- Clear visual feedback for current selection
- **Intelligent Integration**: Works seamlessly with the opposition ranking system while preserving user's chosen sort preference

### Utility Components

#### **LoadingState.tsx**
- Standard loading spinner with consistent styling
- **ResultsLoadingSkeleton**: Skeleton loading for article results
- Smooth transitions and animations
- Accessible loading indicators

#### **ErrorMessage.tsx**
- **NetworkErrorMessage**: Specific error handling for network issues
- User-friendly error messages
- Retry functionality where applicable
- Consistent error styling and UX

## Styling Conventions

### Color System
The components use a custom Tailwind color palette for political lean visualization:

```css
/* Political Lean Colors */
.text-left-600     /* Left-leaning sources */
.text-center-600   /* Center sources */ 
.text-right-600    /* Right-leaning sources */
.text-strong-left-600   /* Strongly left-leaning */
.text-strong-right-600  /* Strongly right-leaning */
```

### Responsive Breakpoints
- **Mobile First**: Base styles for mobile devices
- **sm**: 640px+ (small tablets)
- **md**: 768px+ (tablets)
- **lg**: 1024px+ (desktop)
- **xl**: 1280px+ (large desktop)

### Component Layout Patterns
- Grid layouts for source/article display
- Flexbox for navigation and controls
- Consistent spacing using Tailwind scale (4, 8, 16, 24, 32px)
- Card-based design for content blocks

## State Management Patterns

Components receive state via props from the main App component and communicate back through callback functions:

```typescript
interface ComponentProps {
  // Data props
  value: string | string[]
  options: OptionType[]
  
  // Event handlers
  onChange: (value: OptionType) => void
  onError?: (error: string) => void
  
  // UI state
  loading?: boolean
  disabled?: boolean
}
```

## Accessibility Features

All components implement:
- **ARIA labels** for screen readers
- **Keyboard navigation** support
- **Focus management** for form controls  
- **High contrast** color ratios
- **Semantic HTML** structure
- **Touch-friendly** interfaces (44px minimum touch targets)

## Performance Considerations

- **React.memo** for expensive render components
- **useCallback** for event handlers to prevent unnecessary re-renders  
- **Lazy loading** for images in ResultsDisplay
- **Debounced search** in selector components
- **Virtualization** considered for large lists (not currently implemented)

## Development Guidelines

### Adding New Components
1. Create TypeScript file with proper interface definitions
2. Implement accessibility features from the start
3. Use Tailwind classes consistently with existing patterns
4. Add responsive design considerations
5. Include proper error handling
6. Document props and usage in component comments

### Testing Considerations
- Components should be testable in isolation
- Props should be mockable for testing
- Error states should be reproducible
- Loading states should be testable

## Integration Points

### With Services
Components integrate with services through the main App component:
- **newsApiService**: NewsAPI data fetching
- **rssService**: RSS feed parsing  
- **filterService**: Article filtering and processing
- **dynamicSourceService**: Dynamic source discovery

### With Types
All components use shared TypeScript interfaces from `/src/types/index.ts`:
- `NewsSource`, `Article`, `NewsLanguage`
- `UserSelection`, `AppState`
- Component-specific prop interfaces

## Future Enhancement Areas

1. **Virtualization**: For large source/country lists
2. **Drag & Drop**: For source reordering
3. **Advanced Filtering**: More granular content filters
4. **Real-time Updates**: WebSocket integration for live articles
5. **Offline Support**: Progressive Web App features
6. **Analytics**: User interaction tracking
7. **Theming**: Dark mode support