# Components Directory

This directory contains all React components for the BreakMyBubble application. The components are built using TypeScript and follow a modular, reusable design pattern.

## Architecture Overview

The components are organized as functional components using React hooks for state management. They follow these conventions:

- **TypeScript**: All components are written in TypeScript with strict type checking
- **Props Interface**: Each component defines its props interface for type safety
- **Tailwind CSS**: Styling using Tailwind utility classes with custom color scheme
- **Accessibility**: ARIA labels, keyboard navigation, and screen reader support
- **Responsive**: Mobile-first design with responsive breakpoints

### **Security & Quality Enhancements (v2.5)** 🔒

All components now include comprehensive security and quality improvements:

**Security Features**:
- **Input Sanitization**: DOMPurify integration in CustomSearchInput and content display
- **XSS Protection**: Secure handling of user input and external content
- **URL Validation**: Enhanced security for external links in ResultsDisplay
- **Content Security**: Trusted domain validation for images and links

**Code Quality Improvements**:
- **Memory Leak Prevention**: Proper cleanup in TopicSelectionModal and event listeners
- **Stale Closure Fixes**: Enhanced callback patterns to prevent infinite re-renders
- **Type Safety**: Eliminated unsafe `any` types with proper type guards
- **Performance**: Optimized component lifecycle and re-render prevention

### **Phase 4: Frontend/UX Enhancements (v3.1.1)** ✨

Complete user experience transformation with accessibility, mobile optimization, and refined interaction patterns:

**Accessibility Compliance (WCAG 2.1 AA)**:
- **Touch Target Compliance**: All interactive elements now meet 44px minimum requirement
- **ARIA Live Regions**: Comprehensive screen reader support for dynamic content updates
- **Enhanced Focus Management**: Improved modal focus trapping with immediate focus restoration
- **Keyboard Navigation**: Full keyboard accessibility across all components

**Mobile-First Optimization**:
- **Responsive Modal Design**: Mobile-first breakpoints with optimized sizing and touch interactions
- **Layout Optimization**: Enhanced spacing, typography, and component sizing for small screens
- **Touch-Friendly Interfaces**: Optimized dropdown behavior and selector interactions
- **Mobile Typography**: Responsive text sizing and improved readability

**Enhanced Loading States**:
- **Step-by-Step Progress**: Detailed loading indicators with visual progress tracking
- **Shimmer Animations**: CSS keyframe animations for improved perceived performance
- **Multiple Loading Variants**: Compact, default, and detailed loading state options
- **Mobile-Optimized Skeletons**: Responsive skeleton components with enhanced animations

**Comprehensive Error Recovery**:
- **Actionable Error Messages**: Step-by-step recovery guidance for all error scenarios
- **Multiple Error Types**: Specialized handling for Network, API, Validation, and Timeout errors
- **Mobile-Responsive Error UI**: Touch-friendly error interfaces with contextual help
- **Recovery Actions**: "Try Again", "Start Over", and contextual assistance buttons

**Latest UX Refinements (v3.1.1)**:
- **Toggleable Topic Selection**: Quick topic buttons now support deselection - click once to select, click again to deselect
- **Fixed Custom Search Input**: Resolved focus loss issue - users can type smoothly without input losing focus after each character
- **Smart Topic/Search Interaction**: Topic automatically deselects when user starts typing custom search terms for clear, intuitive behavior
- **Streamlined Source Selection**: Removed political lean badges from selection phase to reduce visual clutter while maintaining credibility indicators
- **Cleaner Interface**: Removed redundant text labels for a more polished user experience

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

#### **Header.tsx** ✨ *Enhanced v2.4*
- Application header with integrated branding and subtitle
- **Enhanced Branding**: "Discover opposing perspectives" subtitle now directly in header for consistency
- **NEW**: Phase-aware navigation with conditional reset/back functionality
- Unified branding message across all application phases
- Responsive design with mobile considerations
- Dynamic button display based on current phase
- Title click navigation back to landing page
- Improved visual hierarchy and spacing

#### **LandingPage.tsx** ✨ *Enhanced v2.4: Refined UI/UX*
- Google-inspired centered layout with refined visual hierarchy
- Primary interface for Phase 1 of the user flow with improved user experience
- **Enhanced Features**:
  - Clean, minimal design with optimized proportions (removed oversized typography)
  - Improved spacing throughout (balanced space-y-8 instead of excessive space-y-16)
  - **Source Selection Enhancement**: Color/shape emphasis instead of size:
    - Primary blue border (border-primary-300) for clear visual distinction
    - Light primary background (bg-primary-25) for subtle emphasis
    - Proper proportional padding and refined hover effects
  - **Integrated Filter Panel**: Successfully moved below source selection for improved workflow
  - **Streamlined Content**: Removed duplicate titles and subtitles for focused design
  - FAQ section with updated, accurate content
  - Continue button with validation (requires ≥1 source)
  - Responsive design with mobile-optimized spacing

#### **TopicSelectionModal.tsx** ✨ *Enhanced v2.5: Security + Memory Fixes*
- Full-screen modal interface for Phase 2 with improved organization
- **📊 Memory Leak Fixes**: Proper event listener cleanup and component unmounting
- **♾️ Performance**: Resolved stale closure issues and infinite re-render prevention
- **Advanced Modal Features**:
  - Backdrop click to close with proper event handling
  - Focus trapping and keyboard navigation (Tab/Shift+Tab)
  - Escape key to close modal
  - Automatic focus management on open/close
  - Body scroll prevention when modal is open
  - **Accessibility**: Full ARIA support with proper labels
  - **Enhanced Cleanup**: Proper component lifecycle management
- **Streamlined Content Sections**:
  - Topic selection with TopicSelector integration
  - **Fixed**: Removed duplicate "Advanced options" sections for cleaner interface
  - Advanced filtering panel with all NewsAPI options
  - Action footer with validation and loading states
- **Responsive Design**: Mobile-optimized modal sizing and scrolling

#### **FAQ.tsx** ✨ *Enhanced v2.4: Content Accuracy*
- Frequently asked questions component with improved accuracy
- **Content Enhancement**: Updated source count from misleading "over 80,000" to accurate "over 130 high-quality news sources"
- **Quality Emphasis**: Now emphasizes curation and quality over inflated quantity claims
- **Better User Expectations**: More accurately reflects the actual user experience and value proposition
- **Features**:
  - Expandable/collapsible FAQ items with smooth animations
  - Clean, accessible design with proper ARIA support
  - Mobile-optimized layout and typography
  - Integrated seamlessly into landing page design

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

#### **ResultsDisplay.tsx** ✨ *Enhanced Security*
- Main results presentation component
- **🔗 URL Security**: Enhanced validateURL() and sanitizeURL() functions for all external links
- **🖼️ Image Security**: Trusted domain validation with isValidImageURL() for secure image loading
- **🔒 Content Security**: DOMPurify sanitization for article content and descriptions
- Side-by-side layout for user's sources vs opposing perspectives
- **Intelligent Opposition Ranking**: Articles prioritized by political distance and credibility
- Article cards with images, titles, descriptions, and metadata
- Color-coded by political lean (left/center/right/lean-left/lean-right/unknown)
- **Unknown Source Handling**: Proper display for sources with 'unknown' political classification
- External links with proper attribution and security validation
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

#### **TopicSelector.tsx** ✨ *Enhanced v2.4*
- Twelve predefined topics with multilanguage support
- **Enhanced with Custom Search**: Purple-styled "Custom Search" option for free text search
- Clear visual selection with keyword previews
- Integration with CustomSearchInput for user-defined search terms
- Dynamic display of active search terms with counts
- **v2.4 Enhancement**: Improved modal integration with streamlined interface

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

#### **CustomSearchInput.tsx** ✨ *Enhanced Integration + Security*
- **Free text search input** with comprehensive multilanguage support
- **🔒 Security Enhancement**: DOMPurify integration for input sanitization
- **🚫 XSS Protection**: Secure handling of user input to prevent script injection
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

## **Security & Quality Enhancement Notes (v2.5)** 🔒

### **Security Improvements**
- **Input Sanitization**: DOMPurify integration across all user input components
- **XSS Protection**: Comprehensive protection against script injection attacks
- **URL Validation**: Enhanced security for all external links and images
- **Content Security**: Trusted domain validation and secure content handling
- **API Security**: Enhanced validation and secure error handling patterns

### **Code Quality Fixes**
- **Memory Leak Prevention**: Fixed TopicSelectionModal cleanup and event listener management
- **Performance Optimization**: Resolved stale closure bugs preventing infinite re-renders
- **Type Safety**: Enhanced TypeScript compliance with proper type guards
- **Component Lifecycle**: Improved cleanup patterns and dependency management
- **React Best Practices**: Fixed useEffect patterns and callback optimization

### **Previous UI/UX Improvements (v2.4)**
- **Consistency Over Size**: Professional proportions and strategic color emphasis
- **Typography & Spacing**: Optimized sizing and refined spacing for better flow
- **Content Accuracy**: Updated messaging to reflect actual capabilities
- **Workflow Integration**: Enhanced component positioning and user experience

## Styling Conventions

### Color System
The components use a custom Tailwind color palette for political lean visualization and UI enhancement:

```css
/* Political Lean Colors */
.text-left-600     /* Left-leaning sources */
.text-center-600   /* Center sources */ 
.text-right-600    /* Right-leaning sources */
.text-strong-left-600   /* Strongly left-leaning */
.text-strong-right-600  /* Strongly right-leaning */

/* UI Enhancement Colors (v2.4) */
.border-primary-300  /* Enhanced visual distinction */
.bg-primary-25       /* Subtle emphasis backgrounds */
.border-primary-400  /* Hover state enhancements */
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

## Performance & Security Considerations

### **Enhanced Performance (v2.5 + v3.1)**
- **Memory Leak Prevention**: Proper component cleanup and event listener management
- **Stale Closure Fixes**: Enhanced callback patterns preventing infinite re-renders
- **React.memo** for expensive render components
- **useCallback** optimization for event handlers
- **Lazy loading** for images in ResultsDisplay
- **Debounced search** in selector components
- **Shimmer Animations**: CSS keyframes for optimized loading performance
- **Mobile-First Rendering**: Responsive components with optimized breakpoints
- **Enhanced Focus Management**: requestAnimationFrame for immediate focus restoration

### **Security Features**
- **Input Sanitization**: DOMPurify protection against XSS attacks
- **URL Validation**: Secure handling of external links and images
- **Content Security**: Trusted domain validation for all external content
- **Type Safety**: 100% TypeScript compliance preventing runtime errors

## Development Guidelines

### Adding New Components
1. Create TypeScript file with proper interface definitions
2. **🔒 Security First**: Implement input sanitization and XSS protection
3. **📊 Memory Safety**: Ensure proper cleanup and event listener management
4. Implement accessibility features from the start
5. Use Tailwind classes consistently with existing patterns
6. Add responsive design considerations
7. Include proper error handling
8. **Type Safety**: Use strict TypeScript with proper type guards
9. Document props and usage in component comments
10. **Performance**: Optimize re-renders and component lifecycle

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