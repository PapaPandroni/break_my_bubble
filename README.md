# BreakMyBubble 🎯

A web application that helps users identify their news consumption "bubble" by comparing headlines from their preferred news sources against opposing perspectives on chosen topics.

![BreakMyBubble Screenshot](https://via.placeholder.com/800x400/3B82F6/FFFFFF?text=BreakMyBubble+Demo)

## 🌟 Features

- **Source Comparison**: Select 1-5 preferred news sources and discover how other outlets cover the same topics
- **Political Perspective Analysis**: Visual color coding for left (blue), center (gray), and right (red) leaning sources
- **Topic-Based Filtering**: Choose from 5 key topics with intelligent keyword matching
- **Flexible Time Ranges**: Filter articles from 24 hours to 1 month
- **Smart Caching**: 30-minute cache system to optimize performance
- **Mobile Responsive**: Clean, modern interface that works on all devices
- **Accessibility First**: Full keyboard navigation and screen reader support

## 🚀 Live Demo

[View Live Demo](your-deployment-url-here) *(Replace with your actual deployment URL)*

## 🛠️ Tech Stack

- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **State Management**: React Hooks
- **HTTP Client**: Native Fetch API
- **RSS Parsing**: DOMParser (native)
- **Deployment Ready**: Netlify/Vercel compatible

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/break-my-bubble.git
   cd break-my-bubble
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   ```
   http://localhost:5173
   ```

## 🏗️ Build for Production

```bash
# Build the app
npm run build

# Preview the build
npm run preview
```

## 📱 How It Works

1. **Select Your Sources**: Choose 1-5 news sources you typically read
2. **Pick a Topic**: Select from Climate Change, Healthcare, Immigration, Economy, or Technology  
3. **Set Time Range**: Choose how far back to search for articles (24 hours to 1 month)
4. **Break Your Bubble**: Get side-by-side comparison of your sources vs. opposing perspectives
5. **Explore**: Read articles from different viewpoints to broaden your understanding

## 📊 Supported News Sources

### Left-Leaning
- CNN
- MSNBC  
- The Guardian
- NPR

### Center
- BBC News
- Reuters
- Associated Press

### Right-Leaning
- Fox News
- Wall Street Journal
- New York Post

## 🔧 Architecture

```
src/
├── components/          # React components
│   ├── Header.tsx
│   ├── SourceInput.tsx
│   ├── TopicSelector.tsx
│   ├── TimeSlider.tsx
│   ├── LoadingState.tsx
│   ├── ErrorMessage.tsx
│   └── ResultsDisplay.tsx
├── services/           # Business logic
│   ├── rssService.ts   # RSS feed parsing
│   ├── filterService.ts # Content filtering
│   ├── corsProxy.ts    # CORS handling
│   └── cacheService.ts # Caching system
├── data/              # Static data
│   ├── newsSources.ts
│   └── topics.ts
├── utils/             # Helper functions
│   ├── dateUtils.ts
│   └── helpers.ts
├── types/             # TypeScript interfaces
│   └── index.ts
└── App.tsx           # Main application
```

## 🎨 Key Technical Features

- **RSS Feed Parsing**: Handles both RSS 2.0 and Atom formats with robust error handling
- **CORS Proxy**: Uses `api.allorigins.win` to bypass browser CORS restrictions
- **Smart Caching**: Local storage caching with 30-minute expiration
- **Deduplication**: Intelligent article similarity detection
- **Content Filtering**: Advanced keyword matching with relevance scoring
- **Error Resilience**: Graceful handling of failed feeds and network issues

## 🚧 Technical Challenges Solved

1. **CORS Restrictions**: RSS feeds are blocked by browser CORS policies - solved with proxy service
2. **RSS Format Variations**: Different sources use varying XML structures - robust parsing handles both RSS and Atom
3. **Performance**: Multiple concurrent feed requests - implemented caching and request timeouts
4. **Content Quality**: Accurate keyword matching without false positives - advanced filtering algorithms

## 🔮 Future Enhancements

- [ ] AI-powered content analysis for deeper perspective comparison
- [ ] User accounts and personalized source recommendations
- [ ] Social sharing of perspective comparisons
- [ ] Browser extension for real-time bubble detection
- [ ] API integration for more news sources
- [ ] Sentiment analysis visualization
- [ ] Historical trend analysis

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## ⚠️ Disclaimer

- Source bias ratings are provided for educational purposes only
- All articles link to their original sources for full context
- This tool encourages media literacy, not political alignment
- Political lean classifications are based on generally accepted media bias assessments

## 🙏 Acknowledgments

- News sources for providing RSS feeds
- [AllOrigins](https://allorigins.win/) for CORS proxy service
- [Tailwind CSS](https://tailwindcss.com/) for styling framework
- [Vite](https://vitejs.dev/) for build tooling

## 📞 Support

If you have any questions or run into issues:

1. Check the [Issues](https://github.com/yourusername/break-my-bubble/issues) page
2. Create a new issue with detailed description
3. Include browser version and error messages if applicable

---

**Built with ❤️ for media literacy and informed citizenship**

*Remember: The best way to break your bubble is to actively seek diverse perspectives and think critically about all sources of information.*