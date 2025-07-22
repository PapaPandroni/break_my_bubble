#!/usr/bin/env node

/**
 * Test script to verify political lean classifications
 * Shows distribution of classifications and identifies unknown sources
 */

import fs from 'fs';

// Read the complete source list
const sourcesData = JSON.parse(fs.readFileSync('./newsapi-sources-complete.json', 'utf8'));
const allSources = sourcesData.sources;

// Import the political lean mapping (we'll simulate it here)
const POLITICAL_LEAN_MAPPING = {
  // Left - Sources with clear liberal/progressive editorial positions
  'cnn': { lean: 'left', credibility: 0.7, confidence: 0.9 },
  'msnbc': { lean: 'left', credibility: 0.6, confidence: 0.9 },
  'the-huffington-post': { lean: 'left', credibility: 0.6, confidence: 0.9 },
  'buzzfeed': { lean: 'left', credibility: 0.5, confidence: 0.8 },
  'vice-news': { lean: 'left', credibility: 0.6, confidence: 0.8 },
  
  // Lean Left - Sources with slight liberal editorial positions but generally good journalism
  'politico': { lean: 'lean-left', credibility: 0.7, confidence: 0.9 },
  'usa-today': { lean: 'lean-left', credibility: 0.7, confidence: 0.9 },
  'time': { lean: 'lean-left', credibility: 0.8, confidence: 0.9 },
  'the-washington-post': { lean: 'lean-left', credibility: 0.8, confidence: 0.9 },
  'abc-news': { lean: 'lean-left', credibility: 0.7, confidence: 0.8 },
  'cbs-news': { lean: 'lean-left', credibility: 0.7, confidence: 0.8 },
  'nbc-news': { lean: 'lean-left', credibility: 0.7, confidence: 0.8 },
  'newsweek': { lean: 'lean-left', credibility: 0.6, confidence: 0.8 },
  'bloomberg': { lean: 'lean-left', credibility: 0.8, confidence: 0.8 },
  'axios': { lean: 'lean-left', credibility: 0.7, confidence: 0.8 },
  'the-hill': { lean: 'lean-left', credibility: 0.7, confidence: 0.7 },
  'business-insider': { lean: 'lean-left', credibility: 0.6, confidence: 0.7 },
  'mashable': { lean: 'lean-left', credibility: 0.6, confidence: 0.6 },
  'techcrunch': { lean: 'lean-left', credibility: 0.7, confidence: 0.6 },
  'the-verge': { lean: 'lean-left', credibility: 0.7, confidence: 0.6 },
  'wired': { lean: 'lean-left', credibility: 0.7, confidence: 0.6 },
  'engadget': { lean: 'lean-left', credibility: 0.6, confidence: 0.6 },
  'ars-technica': { lean: 'lean-left', credibility: 0.8, confidence: 0.7 },
  'recode': { lean: 'lean-left', credibility: 0.7, confidence: 0.7 },
  
  // Center - Sources with minimal editorial bias, focus on factual reporting
  'bbc-news': { lean: 'center', credibility: 0.8, confidence: 0.9 },
  'reuters': { lean: 'center', credibility: 0.9, confidence: 0.9 },
  'associated-press': { lean: 'center', credibility: 0.9, confidence: 0.9 },
  'fortune': { lean: 'center', credibility: 0.7, confidence: 0.7 },
  'google-news': { lean: 'center', credibility: 0.7, confidence: 0.6 },
  'hacker-news': { lean: 'center', credibility: 0.6, confidence: 0.6 },
  'new-scientist': { lean: 'center', credibility: 0.8, confidence: 0.7 },
  'medical-news-today': { lean: 'center', credibility: 0.7, confidence: 0.6 },
  'national-geographic': { lean: 'center', credibility: 0.8, confidence: 0.7 },
  
  // Lean Right - Sources with slight conservative editorial positions
  'the-wall-street-journal': { lean: 'lean-right', credibility: 0.8, confidence: 0.9 },
  'new-york-magazine': { lean: 'lean-right', credibility: 0.6, confidence: 0.7 },
  
  // Right - Sources with clear conservative editorial positions
  'fox-news': { lean: 'right', credibility: 0.6, confidence: 0.9 },
  'breitbart-news': { lean: 'right', credibility: 0.4, confidence: 0.9 },
  'national-review': { lean: 'right', credibility: 0.7, confidence: 0.9 },
  'the-american-conservative': { lean: 'right', credibility: 0.7, confidence: 0.8 },
  'the-washington-times': { lean: 'right', credibility: 0.5, confidence: 0.8 },
  
  // International Sources - Classified by editorial positions relative to their home countries
  'al-jazeera-english': { lean: 'lean-left', credibility: 0.7, confidence: 0.6 },
  'rt': { lean: 'right', credibility: 0.3, confidence: 0.8 },
  'independent': { lean: 'lean-left', credibility: 0.6, confidence: 0.7 },
  'the-times-of-india': { lean: 'center', credibility: 0.6, confidence: 0.5 },
  'xinhua-net': { lean: 'right', credibility: 0.4, confidence: 0.7 }
};

// Domain-based heuristics
const DOMAIN_HEURISTICS = {
  left: [
    'huffpost', 'huffington', 'slate', 'vox', 'motherjones', 'thenation', 'intercept',
    'democracynow', 'commondreams', 'jacobin', 'salon', 'alternet', 'rawstory', 
    'thinkprogress', 'mediamatters', 'progressive', 'buzzfeed', 'vice'
  ],
  'lean-left': [
    'guardian', 'washingtonpost', 'washington-post', 'nytimes', 'newyorktimes', 'atlantic',
    'npr', 'pbs', 'politico', 'time', 'usatoday', 'usa-today', 'abc-news', 'cbs-news', 'nbc-news',
    'bloomberg', 'axios', 'thehill', 'the-hill', 'yahoo', 'google-news', 'newsweek',
    'dailybeast', 'daily-beast', 'aljazeera', 'al-jazeera', 'business-insider',
    'mashable', 'techcrunch', 'the-verge', 'wired', 'engadget', 'ars-technica',
    'recode', 'independent', 'spiegel', 'die-zeit', 'tagesspiegel', 'le-monde',
    'liberation', 'la-repubblica', 'cbc-news'
  ],
  center: [
    'bbc', 'reuters', 'ap', 'associated-press', 'associatedpress', 'cspan', 'economist',
    'marketwatch', 'cnbc', 'fortune', 'france24', 'dw', 'timeofindia', 'times-of-india',
    'google-news', 'hacker-news', 'new-scientist', 'medical-news', 'national-geographic',
    'ansa', 'handelsblatt', 't3n', 'gruenderszene', 'lequipe', 'marca',
    'espn', 'fox-sports', 'bleacher-report', 'ign', 'crypto-coins', 'techradar',
    'the-next-web', 'abc-news-au', 'the-globe', 'irish-times', 'rte'
  ],
  'lean-right': [
    'wsj', 'wall-street-journal', 'wallstreetjournal', 'washingtonexaminer', 'washington-examiner',
    'foxbusiness', 'fox-business', 'telegraph', 'dailymail', 'daily-mail', 'nypost', 'new-york-post',
    'dispatch', 'new-york-magazine', 'bild', 'focus', 'les-echos', 'il-sole', 'el-mundo',
    'wirtschafts-woche'
  ],
  right: [
    'foxnews', 'fox-news', 'breitbart', 'dailywire', 'daily-wire', 'nationalreview', 'national-review',
    'blaze', 'townhall', 'washingtontimes', 'washington-times', 'newsmax', 'oann', 'infowars',
    'redstate', 'conservativereview', 'theconservativetreehouse', 'american-conservative',
    'rt', 'sputnik', 'xinhua'
  ]
};

function classifyPoliticalLean(apiSource) {
  // Check explicit mapping first
  if (POLITICAL_LEAN_MAPPING[apiSource.id]) {
    const mapping = POLITICAL_LEAN_MAPPING[apiSource.id];
    return {
      lean: mapping.lean,
      credibility: mapping.credibility,
      method: 'explicit'
    };
  }

  // Use domain heuristics
  const domain = apiSource.url.replace('https://', '').replace('www.', '').toLowerCase();
  const name = apiSource.name.toLowerCase();
  
  for (const [lean, keywords] of Object.entries(DOMAIN_HEURISTICS)) {
    for (const keyword of keywords) {
      if (domain.includes(keyword) || name.includes(keyword)) {
        return {
          lean: lean,
          credibility: 0.6,
          method: 'heuristic'
        };
      }
    }
  }

  // Default to unknown for unclassified sources
  return { lean: 'unknown', credibility: 0.3, method: 'unknown' };
}

// Test all sources
const results = allSources.map(source => {
  const classification = classifyPoliticalLean(source);
  return {
    id: source.id,
    name: source.name,
    country: source.country,
    language: source.language,
    category: source.category,
    ...classification
  };
});

// Calculate statistics
const stats = {
  left: 0,
  'lean-left': 0,
  center: 0,
  'lean-right': 0,
  right: 0,
  unknown: 0
};

const methodStats = {
  explicit: 0,
  heuristic: 0,
  unknown: 0
};

results.forEach(result => {
  stats[result.lean]++;
  methodStats[result.method]++;
});

console.log('🎯 Political Lean Classification Results');
console.log('========================================');
console.log(`Total Sources: ${results.length}`);
console.log('');

console.log('📊 Distribution by Political Lean:');
console.log(`Left: ${stats.left} (${(stats.left/results.length*100).toFixed(1)}%)`);
console.log(`Lean Left: ${stats['lean-left']} (${(stats['lean-left']/results.length*100).toFixed(1)}%)`);
console.log(`Center: ${stats.center} (${(stats.center/results.length*100).toFixed(1)}%)`);
console.log(`Lean Right: ${stats['lean-right']} (${(stats['lean-right']/results.length*100).toFixed(1)}%)`);
console.log(`Right: ${stats.right} (${(stats.right/results.length*100).toFixed(1)}%)`);
console.log(`Unknown: ${stats.unknown} (${(stats.unknown/results.length*100).toFixed(1)}%)`);
console.log('');

console.log('🔍 Classification Methods:');
console.log(`Explicit Mapping: ${methodStats.explicit} (${(methodStats.explicit/results.length*100).toFixed(1)}%)`);
console.log(`Domain Heuristics: ${methodStats.heuristic} (${(methodStats.heuristic/results.length*100).toFixed(1)}%)`);
console.log(`Unknown: ${methodStats.unknown} (${(methodStats.unknown/results.length*100).toFixed(1)}%)`);
console.log('');

// Show some examples by category
console.log('📰 Major US Sources:');
const usSources = results.filter(r => r.country === 'us' && ['cnn', 'fox-news', 'abc-news', 'nbc-news', 'reuters', 'associated-press', 'the-wall-street-journal', 'breitbart-news'].includes(r.id));
usSources.forEach(source => {
  console.log(`  ${source.id} (${source.name}) → ${source.lean.toUpperCase()} [${source.method}]`);
});

console.log('');
console.log('❓ Unknown Sources (sample):');
const unknownSources = results.filter(r => r.lean === 'unknown').slice(0, 10);
unknownSources.forEach(source => {
  console.log(`  ${source.id} (${source.name}) - ${source.country}/${source.language}`);
});

if (stats.unknown > 10) {
  console.log(`  ... and ${stats.unknown - 10} more`);
}