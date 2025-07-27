# BreakMyBubble 🎯

A sophisticated news analysis web application with a streamlined three-step interface that helps users discover opposing perspectives. Built on a "show, don't tell" design philosophy, the app features refined UI/UX with enhanced consistency while maintaining comprehensive NewsAPI integration and multilanguage support.

![BreakMyBubble](https://img.shields.io/badge/Version-2.4-blue) ![BreakMyBubble](https://img.shields.io/badge/Status-Production%20Ready-green) ![TypeScript](https://img.shields.io/badge/TypeScript-100%25-blue) ![NewsAPI](https://img.shields.io/badge/NewsAPI-Integrated-orange)

## 🎨 Latest Updates (v2.4)

### UI/UX Enhancements
- **Header Consistency**: Integrated "Discover opposing perspectives" subtitle directly in header for unified branding
- **Refined Landing Page**: Improved visual hierarchy with optimized typography and spacing
- **Enhanced Source Selection**: Color/shape emphasis (primary blue borders and backgrounds) instead of oversized elements
- **Content Accuracy**: Updated FAQ from misleading "80,000+ sources" to honest "130+ curated sources"
- **Streamlined Interface**: Removed duplicate elements and fixed modal organization issues

## 🌟 Key Features

### Simplified User Experience
- **Three-Step Flow**: Landing → Topic Selection → Results (no complex navigation)
- **"Show, Don't Tell" Design**: Interface communicates through visual design, not verbose text
- **Custom Search Priority**: User-defined search terms prominently featured
- **Streamlined Interactions**: Minimal clicks, maximum impact

### Core Functionality
- **NewsAPI-Powered**: Comprehensive NewsAPI integration with intelligent caching
- **Source Comparison**: Select 1-5 preferred news sources and discover opposing perspectives  
- **5-Point Political Analysis**: Enhanced political lean classification (left/lean-left/center/lean-right/right)
- **Multilanguage Search**: 14 languages with professional translations and free text search
- **International Coverage**: 27+ classified international news sources

### Advanced NewsAPI Features
- **Multi-Language Support**: 14 languages with native names and flags
- **Global Coverage**: 54 countries with dynamic source discovery
- **Advanced Filtering**: Sort by relevancy, date, or popularity
- **Custom Date Ranges**: Precise date filtering vs preset time ranges
- **Enhanced Articles**: Images, author info, and content previews
- **Smart Caching**: Optimized performance with intelligent cache strategies

### User Experience
- **Mobile-First Design**: Responsive across all devices with Google-inspired layout
- **Accessibility**: Full keyboard navigation, focus management, and screen reader support
- **Performance**: Sub-second load times with memoization and smart caching
- **Error Recovery**: Comprehensive error boundaries and graceful fallback systems
- **Memory Leak Prevention**: Robust cleanup systems and optimized component lifecycle

## 🚀 Live Demo

[Deploy your own instance](#deployment) or explore the codebase to understand the advanced news analysis architecture.

## 📊 Supported News Sources

### Recent International Expansion
**Lean-Left**: CNN Spanish, The Hindu (India), Infobae (Argentina), Ynet (Israel)  
**Center**: BBC News, Reuters, Associated Press, Blasting News (Brazil), SABQ (Saudi Arabia)  
**Lean-Right**: Wall Street Journal, Aftenposten (Norway), Svenska Dagbladet (Sweden), News.com.au  
**Right**: Fox News, Globo (Brazil), La Gaceta (Argentina)

*Plus 54 countries worth of dynamically discovered sources via NewsAPI integration.*

## 🛠️ Tech Stack

### Frontend Architecture
- **React 18** + **TypeScript** (100% type coverage)
- **Vite** for lightning-fast builds and hot reload
- **Tailwind CSS** with custom political lean color palette
- **Native APIs**: Fetch, DOMParser, LocalStorage

### Data & Services
- **NewsAPI.org** integration with full feature support
- **RSS Parsing** with CORS proxy fallback
- **Smart Caching**: 30-minute feeds, 24-hour dynamic sources
- **Advanced Error Handling** with exponential backoff

### Development Tools
- **ESLint + TypeScript** for code quality
- **Claude Code Integration** with comprehensive documentation
- **Automated Scripts** for data management and validation

## 📦 Quick Start

### Option 1: Basic RSS Mode (No Setup Required)
```bash
git clone https://github.com/yourusername/break-my-bubble.git
cd break-my-bubble
npm install
npm run dev
```
Access at `http://localhost:5173` - Works immediately with RSS feeds!

### Option 2: Full NewsAPI Mode (Recommended)
1. **Get NewsAPI Key**: Free at [newsapi.org/register](https://newsapi.org/register)
2. **Configure Environment**:
   ```bash
   # Create .env file (ENSURE IT'S IN .gitignore!)
   echo "VITE_USE_NEWS_API=true" >> .env
   echo "VITE_NEWS_API_KEY=your_api_key_here" >> .env
   ```
3. **Run Application**:
   ```bash
   npm install
   npm run dev
   ```

**⚠️ SECURITY WARNING**: 
- **NEVER commit your `.env` file to version control**
- API keys in client-side applications are visible to users
- For production use, consider implementing a backend proxy to hide API keys
- The current implementation includes input sanitization and URL validation for security
4. **Enjoy Full Features**: Multi-language, 54 countries, advanced filtering!

## 🏗️ Production Deployment

### Build for Production
```bash
npm run build    # Creates optimized build in /dist
npm run preview  # Preview production build locally
```

### Environment Configuration
```bash
# Required for NewsAPI mode
VITE_USE_NEWS_API=true
VITE_NEWS_API_KEY=your_production_api_key

# Optional configurations
VITE_DEBUG_MODE=false  # Disable debug features
```

### Deployment Platforms
- **Netlify**: Automatic deployment from Git with environment variables
- **Vercel**: Zero-config deployment with built-in optimizations  
- **AWS S3 + CloudFront**: Enterprise-scale static hosting
- **Docker**: Containerized deployment for any cloud platform

## 🎯 How It Works

### Three-Phase Modal-Based User Journey ✨
1. **Phase 1 - Landing Page** (`currentStep: 'landing'`)
   - Google-inspired centered layout with minimal hero section
   - Primary source selection using streamlined SourceInput component
   - FAQ section for user education and guidance
   - Continue button with validation (requires ≥1 source selected)

2. **Phase 2 - Topic Selection Modal** (`currentStep: 'modal'`)
   - **Full-screen modal interface** with backdrop and focus trapping
   - **Enhanced accessibility**: Keyboard navigation, escape key, and proper ARIA labels
   - Topic selection with prominent custom search capability
   - **Integrated FilterPanel**: Languages, countries, date ranges, and sorting options
   - Modal-specific error handling with ModalErrorBoundary
   - "BREAK MY BUBBLE" action button to proceed to analysis

3. **Phase 3 - Results Display** (`currentStep: 'results'`)
   - **Comprehensive error boundary system** with ResultsErrorBoundary
   - Enhanced loading states with skeleton components
   - Side-by-side comparison with intelligent opposing perspective algorithms
   - Enhanced articles with images, authors, and content previews
   - Navigation back to landing via header controls

### Technical Architecture - 3-Phase Modal System
```
┌─────────────────────────────────┐
│        React App (App.tsx)      │ ◄── AppStep state management
│     currentStep: AppStep        │     ('landing'|'modal'|'results')
└─────────────┬───────────────────┘
              │
┌─────────────▼───────────────────┐
│      ErrorBoundary (App)        │ ◄── Top-level error protection
└─────────────┬───────────────────┘
              │
        ┌─────┼─────┬─────────────┐
        ▼     ▼     ▼             ▼
┌─────────┐ ┌───────────────┐ ┌─────────────────┐
│ Phase 1 │ │   Phase 2     │ │    Phase 3      │
│Landing  │ │Topic Modal    │ │   Results       │
│Page     │ │+ FilterPanel  │ │   Display       │
└────┬────┘ └───────┬───────┘ └────────┬────────┘
     │              │                  │
     ▼              ▼                  ▼
┌─────────┐ ┌──────────────┐ ┌─────────────────┐
│ErrorBnd │ │ModalErrorBnd │ │ResultsErrorBnd  │
└─────────┘ └──────────────┘ └─────────────────┘
     │              │                  │
     └──────────────┼──────────────────┘
                    ▼
           ┌─────────────────┐
           │ Services Layer  │ ◄── NewsAPI + Caching
           │ + Filter Logic  │     + Multilanguage
           └─────────────────┘
```

## 📁 Project Structure

```
break-my-bubble/
├── src/
│   ├── components/         # 15+ React components (3-Phase Architecture)
│   │   ├── LandingPage.tsx           # ✨ NEW: Phase 1 - Google-inspired landing
│   │   ├── TopicSelectionModal.tsx   # ✨ NEW: Phase 2 - Full-screen modal
│   │   ├── FilterPanel.tsx           # ✨ NEW: Integrated filter interface
│   │   ├── ModalErrorBoundary.tsx    # ✨ NEW: Modal-specific error handling
│   │   ├── ResultsErrorBoundary.tsx  # ✨ NEW: Results error boundary
│   │   ├── FAQ.tsx                   # ✨ NEW: User education component
│   │   ├── ErrorBoundary.tsx         # Enhanced general error handling
│   │   ├── CustomSearchInput.tsx     # Free text search with modal integration
│   │   └── ResultsDisplay.tsx        # Enhanced articles with Phase 3 layout
│   ├── services/          # 6 optimized business logic services
│   │   ├── newsApiService.ts      # Full NewsAPI integration
│   │   ├── filterService.ts       # Analysis algorithms
│   │   ├── cacheService.ts        # Smart caching system
│   │   └── unifiedSourceService.ts # Source management
│   ├── constants/         # New: Shared constants
│   ├── utils/             # New: Helper functions & utilities
│   ├── data/              # Static configuration
│   └── types/             # TypeScript definitions (AppStep, etc.)
├── scripts/               # Automation tools
├── .claude/              # Claude Code configuration
└── docs/                 # Comprehensive documentation
```

*Each directory includes detailed CLAUDE.md documentation for developers.*

## 🔧 Development Features

### Debug Mode (Development Only)
When `NODE_ENV=development`, access debug tools:
- RSS feed validation
- NewsAPI integration testing  
- Topic filtering analysis
- Cache management
- Source validation status

### Scripts & Automation
```bash
npm run dev          # Development server
npm run build        # Production build
npm run lint         # Code quality check
npm run preview      # Preview production build
npm run test:newsapi # NewsAPI integration test
```

### Data Management
```bash
node scripts/fetch-newsapi-sources.js  # Update source data
node scripts/validate-sources.js       # Validate RSS feeds
```

## 🌍 International Features

### Supported Languages (NewsAPI Mode)
🇺🇸 English • 🇪🇸 Spanish • 🇫🇷 French • 🇩🇪 German • 🇮🇹 Italian • 🇵🇹 Portuguese • 🇷🇺 Russian  
🇸🇦 Arabic • 🇮🇱 Hebrew • 🇳🇱 Dutch • 🇳🇴 Norwegian • 🇸🇪 Swedish • 🇨🇳 Chinese • 🇵🇰 Urdu

### Global Coverage
- **54 Countries** with localized news sources
- **Dynamic Discovery** of new sources via NewsAPI
- **Political Lean Classification** adapted for international media
- **Cultural Context** awareness in source categorization

## 🔐 Privacy & Ethics

### Data Privacy
- **No User Tracking**: Stateless application with no personal data collection
- **Local Storage Only**: Cache data stays on user's device
- **No Analytics**: Privacy-first approach with no third-party tracking
- **Open Source**: Full transparency in data handling

### Editorial Standards  
- **Bias Transparency**: Clear political lean classifications with sources
- **Source Attribution**: All articles link to original sources
- **Credibility Scores**: Transparency in source quality assessment
- **Disclaimer**: Educational tool for media literacy, not political alignment

## 🤝 Contributing

### Development Setup
1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Follow TypeScript strict mode and ESLint rules
4. Add tests for new functionality  
5. Update documentation in relevant CLAUDE.md files
6. Submit pull request with detailed description

### Contribution Areas
- **Source Classification**: Help classify international news sources
- **Language Support**: Add new language packs and translations
- **Performance**: Optimize caching and loading strategies
- **Features**: Enhance analysis algorithms and user experience
- **Testing**: Expand test coverage and edge case handling

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

### Data Sources
- [NewsAPI.org](https://newsapi.org) for comprehensive news data
- [AllOrigins](https://allorigins.win) for CORS proxy services
- Independent media bias research organizations

### Technology Partners
- [Vite](https://vitejs.dev) for build tooling excellence
- [Tailwind CSS](https://tailwindcss.com) for utility-first styling
- [TypeScript](https://typescriptlang.org) for type safety

### Community
- Media literacy educators and researchers
- Open source contributors and maintainers
- Users providing feedback and feature requests

## ⚠️ Important Disclaimers

- **Educational Purpose**: This tool is designed for media literacy education
- **Political Neutrality**: Classifications based on academic media bias research  
- **Source Responsibility**: All articles link to original sources for full context
- **Critical Thinking**: Encourages analysis of all news sources, regardless of classification
- **API Limitations**: NewsAPI free tier has usage limits; see their documentation

## 📞 Support & Contact

### Technical Support
1. **Documentation**: Check directory-specific CLAUDE.md files
2. **Issues**: [GitHub Issues](https://github.com/yourusername/break-my-bubble/issues)
3. **Discussions**: [GitHub Discussions](https://github.com/yourusername/break-my-bubble/discussions)

### Development Questions
- Include environment details (Node version, OS)
- Provide error messages and logs
- Specify which mode (RSS/NewsAPI) you're using
- Include reproduction steps for bugs

---

**Built with ❤️ for media literacy, informed citizenship, and healthy democratic discourse.**

*"The best way to break your news bubble is to actively seek diverse perspectives and think critically about all sources of information."*

**Version 3.0** - 3-Phase Modal-Based UI Architecture ✨  
**Last Updated**: July 2025

**Key Changes in v3.0:**
- Complete UI restructure with 3-phase flow ('landing' → 'modal' → 'results')
- Full-screen modal interface for topic selection with advanced accessibility
- Comprehensive error boundary system with phase-specific error handling
- Google-inspired landing page design with streamlined user experience
- Enhanced focus management and keyboard navigation throughout

*Previous versions: v2.3 (API-Only Architecture), v2.1 (International Sources)*