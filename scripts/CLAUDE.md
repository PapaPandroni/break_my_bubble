# Scripts Directory

This directory contains build utilities, development tools, and automation scripts for the BreakMyBubble project. These scripts support development workflows, data management, and deployment processes.

## Overview

The scripts directory provides:
- **Data Collection Scripts**: Fetching and processing external data sources
- **Development Utilities**: Tools for development and debugging
- **Build Automation**: Custom build and deployment scripts
- **Maintenance Scripts**: Database cleanup and data validation

## File Structure

```
scripts/
└── fetch-newsapi-sources.js    # NewsAPI source data collection script
```

## Script Documentation

### **fetch-newsapi-sources.js**

**Purpose**: Fetches all available news sources from NewsAPI.org and generates comprehensive data files for development and analysis.

#### Functionality
- **Full Source Discovery**: Retrieves all available sources from NewsAPI `/sources` endpoint
- **Data Enrichment**: Organizes sources by country, language, and category
- **File Generation**: Creates structured JSON files for development use
- **Error Handling**: Robust error handling with detailed logging

#### Generated Files
The script generates these files in the project root:

1. **newsapi-source-ids.json**
   ```json
   [
     "abc-news",
     "abc-news-au", 
     "aftenposten",
     "al-jazeera-english",
     // ... all source IDs
   ]
   ```

2. **newsapi-sources-complete.json**
   ```json
   {
     "totalSources": 127,
     "fetchedAt": "2025-01-22T10:30:00.000Z",
     "sources": [
       {
         "id": "abc-news",
         "name": "ABC News",
         "description": "Your trusted source for breaking news...",
         "url": "https://abcnews.go.com",
         "category": "general",
         "language": "en", 
         "country": "us"
       }
       // ... complete source data
     ],
     "byCountry": {
       "us": [...],
       "uk": [...],
       // ... sources grouped by country
     },
     "byLanguage": {
       "en": [...],
       "es": [...], 
       // ... sources grouped by language
     },
     "byCategory": {
       "general": [...],
       "business": [...],
       // ... sources grouped by category  
     }
   }
   ```

#### Usage
```bash
# Run the script
node scripts/fetch-newsapi-sources.js

# With environment variable
VITE_NEWS_API_KEY=your_key_here node scripts/fetch-newsapi-sources.js
```

#### Configuration
The script reads the NewsAPI key from environment variables:
- `VITE_NEWS_API_KEY`: Primary API key variable
- `NEWS_API_KEY`: Fallback API key variable

#### Error Handling
- **API Key Validation**: Checks for valid API key before making requests
- **Network Errors**: Handles network failures with retry logic
- **Rate Limiting**: Respects NewsAPI rate limits
- **File Write Errors**: Handles filesystem errors gracefully
- **Data Validation**: Validates response structure before processing

#### Implementation Details
```javascript
const API_KEY = process.env.VITE_NEWS_API_KEY || process.env.NEWS_API_KEY;
const API_URL = 'https://newsapi.org/v2/top-headlines/sources';

async function fetchAllSources() {
  const response = await fetch(`${API_URL}?apiKey=${API_KEY}`);
  
  if (!response.ok) {
    throw new Error(`API request failed: ${response.status} ${response.statusText}`);
  }
  
  const data = await response.json();
  
  if (data.status !== 'ok') {
    throw new Error(`API error: ${data.code} - ${data.message}`);
  }
  
  return processSources(data.sources);
}
```

#### Data Processing
The script performs several data transformations:

1. **Source Organization**: Groups sources by country, language, and category
2. **Data Enrichment**: Adds metadata and computed fields
3. **Validation**: Ensures data integrity and completeness
4. **Formatting**: Structures data for easy consumption by the application

## Planned Scripts

### **validate-sources.js** (Future)
**Purpose**: Validates RSS feeds and NewsAPI sources for availability and quality.

```javascript
// Planned functionality:
// - Test RSS feed accessibility
// - Validate NewsAPI source IDs
// - Check for broken links
// - Generate source quality report
```

### **update-classifications.js** (Future)
**Purpose**: Updates political lean classifications based on external data sources.

```javascript
// Planned functionality:  
// - Fetch bias ratings from AllSides, Ad Fontes Media
// - Cross-reference with existing classifications
// - Generate classification updates
// - Validate classification changes
```

### **generate-test-data.js** (Future)
**Purpose**: Generates mock data for testing and development.

```javascript
// Planned functionality:
// - Create realistic article data
// - Generate various political perspectives
// - Create edge cases for testing
// - Export data in multiple formats
```

### **deploy.js** (Future)
**Purpose**: Automated deployment script with environment-specific configurations.

```javascript
// Planned functionality:
// - Build optimization
// - Environment configuration
// - Asset optimization
// - Deployment to various platforms
```

### **analyze-performance.js** (Future)
**Purpose**: Performance analysis and optimization recommendations.

```javascript
// Planned functionality:
// - Bundle size analysis
// - Performance metrics collection
// - Optimization recommendations
// - Performance regression detection
```

## Development Workflow Integration

### NPM Scripts Integration
Scripts can be integrated into package.json:

```json
{
  "scripts": {
    "fetch-sources": "node scripts/fetch-newsapi-sources.js",
    "validate-sources": "node scripts/validate-sources.js",
    "update-data": "npm run fetch-sources && npm run validate-sources",
    "prebuild": "npm run update-data"
  }
}
```

### CI/CD Integration
Scripts can be integrated into continuous integration:

```yaml
# .github/workflows/data-update.yml
name: Update Source Data
on:
  schedule:
    - cron: '0 6 * * 1'  # Weekly on Monday at 6 AM
jobs:
  update-data:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
      - run: npm install
      - run: npm run fetch-sources
        env:
          VITE_NEWS_API_KEY: ${{ secrets.NEWS_API_KEY }}
      - name: Commit updated data
        run: |
          git config --local user.email "action@github.com"
          git config --local user.name "GitHub Action"
          git add newsapi-*.json
          git commit -m "Update NewsAPI source data" || exit 0
          git push
```

## Error Handling and Logging

### Logging Strategy
```javascript
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'scripts/logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'scripts/logs/combined.log' }),
    new winston.transports.Console({
      format: winston.format.simple()
    })
  ]
});
```

### Error Recovery
```javascript
async function fetchWithRetry(url, options, maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(url, options);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return response;
    } catch (error) {
      logger.warn(`Attempt ${attempt}/${maxRetries} failed:`, error.message);
      if (attempt === maxRetries) throw error;
      await sleep(1000 * attempt); // Exponential backoff
    }
  }
}
```

## Security Considerations

### API Key Management
- Never commit API keys to version control
- Use environment variables for sensitive data
- Implement key rotation strategies
- Log API usage for monitoring

### Input Validation
```javascript
function validateApiResponse(data) {
  if (!data || typeof data !== 'object') {
    throw new Error('Invalid API response format');
  }
  
  if (data.status !== 'ok') {
    throw new Error(`API error: ${data.message}`);
  }
  
  if (!Array.isArray(data.sources)) {
    throw new Error('Sources array missing from response');
  }
  
  return true;
}
```

### File System Security
```javascript
const path = require('path');

function validateOutputPath(filePath) {
  const resolved = path.resolve(filePath);
  const projectRoot = path.resolve(__dirname, '..');
  
  if (!resolved.startsWith(projectRoot)) {
    throw new Error('Output path outside project directory');
  }
  
  return resolved;
}
```

## Performance Considerations

### Rate Limiting
```javascript
class RateLimiter {
  constructor(requestsPerMinute = 60) {
    this.requests = [];
    this.limit = requestsPerMinute;
  }
  
  async waitIfNeeded() {
    const now = Date.now();
    this.requests = this.requests.filter(time => now - time < 60000);
    
    if (this.requests.length >= this.limit) {
      const oldestRequest = Math.min(...this.requests);
      const waitTime = 60000 - (now - oldestRequest);
      await sleep(waitTime);
    }
    
    this.requests.push(now);
  }
}
```

### Memory Management
```javascript
function processLargeDataset(sources) {
  // Process in chunks to avoid memory issues
  const chunkSize = 100;
  const results = [];
  
  for (let i = 0; i < sources.length; i += chunkSize) {
    const chunk = sources.slice(i, i + chunkSize);
    const processed = processChunk(chunk);
    results.push(...processed);
    
    // Allow garbage collection
    if (global.gc) global.gc();
  }
  
  return results;
}
```

## Testing Scripts

### Unit Tests for Scripts
```javascript
// scripts/tests/fetch-newsapi-sources.test.js
const { processSources, validateApiResponse } = require('../fetch-newsapi-sources');

describe('fetch-newsapi-sources', () => {
  describe('processSources', () => {
    it('should organize sources by country', () => {
      const sources = [
        { id: 'test', country: 'us', language: 'en', category: 'general' },
        { id: 'test2', country: 'uk', language: 'en', category: 'business' }
      ];
      
      const result = processSources(sources);
      expect(result.byCountry.us).toHaveLength(1);
      expect(result.byCountry.uk).toHaveLength(1);
    });
  });
});
```

### Integration Tests
```javascript
// Test script execution in isolated environment
describe('Script Integration Tests', () => {
  it('should successfully fetch and process sources', async () => {
    const mockApiKey = 'test-key';
    process.env.VITE_NEWS_API_KEY = mockApiKey;
    
    // Mock API response
    nock('https://newsapi.org')
      .get('/v2/top-headlines/sources')
      .query({ apiKey: mockApiKey })
      .reply(200, { status: 'ok', sources: mockSources });
    
    const result = await require('../fetch-newsapi-sources').run();
    expect(result.success).toBe(true);
  });
});
```

## Best Practices

### Script Development
1. **Error First**: Design for failure scenarios
2. **Logging**: Comprehensive logging for debugging  
3. **Validation**: Validate inputs and outputs
4. **Idempotency**: Scripts should be safe to run multiple times
5. **Configuration**: Use environment variables for configuration

### Maintenance
1. **Documentation**: Keep documentation up-to-date
2. **Version Control**: Track script changes carefully
3. **Testing**: Regular testing of script functionality
4. **Monitoring**: Monitor script execution and performance
5. **Security**: Regular security reviews and updates

### Code Quality
```javascript
// Use modern JavaScript features
const { promises: fs } = require('fs');

// Async/await for better error handling
async function saveDataToFile(data, filename) {
  try {
    const jsonData = JSON.stringify(data, null, 2);
    await fs.writeFile(filename, jsonData, 'utf8');
    logger.info(`Successfully saved ${filename}`);
  } catch (error) {
    logger.error(`Failed to save ${filename}:`, error);
    throw error;
  }
}
```

This scripts directory provides essential automation and tooling to support the development and maintenance of the BreakMyBubble application.