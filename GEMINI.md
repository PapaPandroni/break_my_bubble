# Gemini's Understanding of BreakMyBubble

This document outlines my understanding of the "BreakMyBubble" project based on the provided files and source code.

## Project Purpose

"BreakMyBubble" is a sophisticated news analysis web application built with React and TypeScript. Its primary goal is to help users become more aware of their media consumption biases. It achieves this by allowing users to select their preferred news sources and a topic, and then presenting them with articles from those sources alongside articles from sources with opposing political viewpoints. This direct comparison is designed to help users "break their bubble" and engage with a wider range of perspectives.

The application has two modes of operation:
1.  **RSS Mode (Default):** A basic mode that fetches news from a predefined list of sources using their RSS feeds. This mode works out-of-the-box without any API keys.
2.  **NewsAPI Mode (Advanced):** A more powerful mode that integrates with the NewsAPI.org service. This unlocks advanced features like multi-language support, access to sources from 54 countries, advanced filtering (by date, popularity, relevancy), and richer article data. This mode requires a NewsAPI key to be configured in the environment variables.

## Core Functionality

-   **Source Selection:** Users can select between 1 and 5 news sources to analyze.
-   **Topic Selection:** Users choose from a predefined list of topics (e.g., Climate Change, Healthcare) to focus the analysis.
-   **Perspective Comparison:** The application fetches articles for the selected topic from both the user's chosen sources and sources with opposing viewpoints.
-   **Political Lean Classification:** News sources are categorized based on a 5-point political spectrum (left, lean-left, center, lean-right, right).
-   **Advanced Filtering (NewsAPI only):**
    -   Filter by language (14 supported).
    -   Filter by country (54 supported).
    -   Custom date ranges.
    -   Sort results by relevancy, date, or popularity.
-   **Smart Caching:** Caches API/feed responses in `localStorage` to improve performance and avoid redundant network requests.
-   **Responsive Design:** The UI is built with Tailwind CSS and is mobile-first.
-   **Developer Tools:** A suite of debug tools is available in development mode to test feeds, caching, and API integrations.

## Technology Stack

-   **Frontend Framework:** React 18
-   **Language:** TypeScript
-   **Build Tool:** Vite
-   **Styling:** Tailwind CSS
-   **HTTP Client:** Native Fetch API
-   **Package Manager:** npm
-   **Linting:** ESLint

## Project Structure

The project follows a standard structure for a modern React application.

```
/
├── src/
│   ├── components/         # Reusable React components (e.g., selectors, results display)
│   ├── services/           # Core business logic and API interactions
│   │   ├── newsApiService.ts   # Logic for interacting with the NewsAPI
│   │   ├── rssService.ts       # Logic for fetching and parsing RSS feeds
│   │   ├── filterService.ts    # Logic for filtering and processing articles
│   │   ├── cacheService.ts     # Caching implementation using localStorage
│   │   └── unifiedSourceService.ts # Orchestrates between RSS and NewsAPI modes
│   ├── data/               # Static data (predefined sources, topics)
│   ├── types/              # TypeScript type definitions
│   ├── utils/              # Utility helper functions
│   ├── App.tsx             # Main application component, manages state and logic
│   └── main.tsx            # Application entry point
├── scripts/                # Standalone scripts for data management
├── public/                 # Static assets
├── package.json            # Project dependencies and scripts
└── README.md               # Detailed project documentation
```

## How to Run & Develop

Based on `package.json` and `README.md`, here are the main commands:

-   **Install Dependencies:** `npm install`
-   **Run Development Server:** `npm run dev` (Accessible at `http://localhost:5173`)
-   **Build for Production:** `npm run build`
-   **Lint Code:** `npm run lint`
--   **Test NewsAPI Integration:** `npm run test:newsapi`

To enable the full-featured NewsAPI mode, a `.env` file must be created with the following variables:
```
VITE_USE_NEWS_API=true
VITE_NEWS_API_KEY=your_api_key_here
```

Without these variables, the application gracefully falls back to the RSS-based mode.
