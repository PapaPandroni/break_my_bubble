#!/usr/bin/env node

/**
 * Get definitive list of sources classified as "unknown" 
 * Uses exact same logic as the app
 */

import fs from 'fs';

// Read the complete source list
const sourcesData = JSON.parse(fs.readFileSync('./newsapi-sources-complete.json', 'utf8'));
const allSources = sourcesData.sources;

// EXACT same mappings from unifiedSourceService.ts
const POLITICAL_LEAN_MAPPING = {
  // Left
  'cnn': { lean: 'left', credibility: 0.7, confidence: 0.9 },
  'msnbc': { lean: 'left', credibility: 0.6, confidence: 0.9 },
  'the-huffington-post': { lean: 'left', credibility: 0.6, confidence: 0.9 },
  'buzzfeed': { lean: 'left', credibility: 0.5, confidence: 0.8 },
  'vice-news': { lean: 'left', credibility: 0.6, confidence: 0.8 },
  
  // Lean Left
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
  
  // Center
  'bbc-news': { lean: 'center', credibility: 0.8, confidence: 0.9 },
  'reuters': { lean: 'center', credibility: 0.9, confidence: 0.9 },
  'associated-press': { lean: 'center', credibility: 0.9, confidence: 0.9 },
  'fortune': { lean: 'center', credibility: 0.7, confidence: 0.7 },
  'google-news': { lean: 'center', credibility: 0.7, confidence: 0.6 },
  'hacker-news': { lean: 'center', credibility: 0.6, confidence: 0.6 },
  'new-scientist': { lean: 'center', credibility: 0.8, confidence: 0.7 },
  'medical-news-today': { lean: 'center', credibility: 0.7, confidence: 0.6 },
  'national-geographic': { lean: 'center', credibility: 0.8, confidence: 0.7 },
  
  // Lean Right
  'the-wall-street-journal': { lean: 'lean-right', credibility: 0.8, confidence: 0.9 },
  'new-york-magazine': { lean: 'lean-right', credibility: 0.6, confidence: 0.7 },
  
  // Right
  'fox-news': { lean: 'right', credibility: 0.6, confidence: 0.9 },
  'breitbart-news': { lean: 'right', credibility: 0.4, confidence: 0.9 },
  'national-review': { lean: 'right', credibility: 0.7, confidence: 0.9 },
  'the-american-conservative': { lean: 'right', credibility: 0.7, confidence: 0.8 },
  'the-washington-times': { lean: 'right', credibility: 0.5, confidence: 0.8 },
  
  // International Sources
  'al-jazeera-english': { lean: 'lean-left', credibility: 0.7, confidence: 0.6 },
  'rt': { lean: 'right', credibility: 0.3, confidence: 0.8 },
  'independent': { lean: 'lean-left', credibility: 0.6, confidence: 0.7 },
  'the-times-of-india': { lean: 'center', credibility: 0.6, confidence: 0.5 },
  'xinhua-net': { lean: 'right', credibility: 0.4, confidence: 0.7 },
  'bbc-sport': { lean: 'center', credibility: 0.8, confidence: 0.7 },
  'abc-news-au': { lean: 'center', credibility: 0.7, confidence: 0.6 },
  'cbc-news': { lean: 'lean-left', credibility: 0.7, confidence: 0.6 },
  'the-globe-and-mail': { lean: 'center', credibility: 0.7, confidence: 0.6 },
  'the-irish-times': { lean: 'center', credibility: 0.7, confidence: 0.6 },
  'rte': { lean: 'center', credibility: 0.7, confidence: 0.6 },
  
  // German Sources
  'spiegel-online': { lean: 'lean-left', credibility: 0.7, confidence: 0.6 },
  'bild': { lean: 'lean-right', credibility: 0.5, confidence: 0.7 },
  'die-zeit': { lean: 'lean-left', credibility: 0.8, confidence: 0.7 },
  'der-tagesspiegel': { lean: 'lean-left', credibility: 0.7, confidence: 0.6 },
  'handelsblatt': { lean: 'center', credibility: 0.7, confidence: 0.6 },
  'focus': { lean: 'lean-right', credibility: 0.6, confidence: 0.6 },
  'wired-de': { lean: 'lean-left', credibility: 0.7, confidence: 0.5 },
  't3n': { lean: 'center', credibility: 0.6, confidence: 0.5 },
  'gruenderszene': { lean: 'center', credibility: 0.6, confidence: 0.5 },
  'wirtschafts-woche': { lean: 'lean-right', credibility: 0.7, confidence: 0.6 },
  
  // French Sources
  'le-monde': { lean: 'lean-left', credibility: 0.8, confidence: 0.7 },
  'les-echos': { lean: 'lean-right', credibility: 0.7, confidence: 0.6 },
  'liberation': { lean: 'left', credibility: 0.6, confidence: 0.7 },
  'lequipe': { lean: 'center', credibility: 0.7, confidence: 0.6 },
  
  // Italian Sources  
  'la-repubblica': { lean: 'lean-left', credibility: 0.7, confidence: 0.6 },
  'il-sole-24-ore': { lean: 'lean-right', credibility: 0.7, confidence: 0.6 },
  'ansa': { lean: 'center', credibility: 0.7, confidence: 0.6 },
  
  // Spanish Sources
  'el-mundo': { lean: 'lean-right', credibility: 0.7, confidence: 0.6 },
  'marca': { lean: 'center', credibility: 0.6, confidence: 0.5 },
  
  // Sports/Entertainment
  'espn': { lean: 'center', credibility: 0.7, confidence: 0.6 },
  'fox-sports': { lean: 'center', credibility: 0.7, confidence: 0.6 },
  'bleacher-report': { lean: 'center', credibility: 0.6, confidence: 0.5 },
  'entertainment-weekly': { lean: 'lean-left', credibility: 0.6, confidence: 0.5 },
  'mtv-news': { lean: 'lean-left', credibility: 0.5, confidence: 0.5 },
  'ign': { lean: 'center', credibility: 0.6, confidence: 0.5 },
  'polygon': { lean: 'lean-left', credibility: 0.6, confidence: 0.5 },
  
  // Crypto/Tech
  'crypto-coins-news': { lean: 'center', credibility: 0.5, confidence: 0.4 },
  'techradar': { lean: 'center', credibility: 0.6, confidence: 0.5 },
  'the-next-web': { lean: 'center', credibility: 0.6, confidence: 0.5 },
  
  // Additional classified sources from research batch 1
  'argaam': { lean: 'right', credibility: 0.5, confidence: 0.6 },
  'ary-news': { lean: 'lean-right', credibility: 0.5, confidence: 0.6 },
  'info-money': { lean: 'lean-right', credibility: 0.6, confidence: 0.6 },
  'la-nacion': { lean: 'lean-right', credibility: 0.7, confidence: 0.6 },
  'lenta': { lean: 'lean-right', credibility: 0.4, confidence: 0.7 },
  'mtv-news-uk': { lean: 'lean-left', credibility: 0.5, confidence: 0.6 },
  'the-lad-bible': { lean: 'lean-left', credibility: 0.4, confidence: 0.5 },
  
  // Final batch of classifications
  'news24': { lean: 'lean-right', credibility: 0.6, confidence: 0.6 },
  'nrk': { lean: 'lean-left', credibility: 0.8, confidence: 0.7 }
};

// EXACT same domain heuristics from unifiedSourceService.ts
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

// Extract domain from URL (same logic as app)
function extractDomain(url) {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname.replace('www.', '');
  } catch {
    return url;
  }
}

// EXACT same classification logic as unifiedSourceService.ts
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
  const domain = extractDomain(apiSource.url).toLowerCase();
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

// Find all unknown sources
const unknownSources = allSources
  .map(source => ({
    ...source,
    classification: classifyPoliticalLean(source)
  }))
  .filter(source => source.classification.lean === 'unknown')
  .sort((a, b) => a.name.localeCompare(b.name));

console.log('🔍 DEFINITIVE LIST: Sources Classified as "Unknown"');
console.log('===================================================');
console.log(`Total Unknown Sources: ${unknownSources.length} out of ${allSources.length}`);
console.log('');

unknownSources.forEach((source, index) => {
  console.log(`${index + 1}. ${source.id}`);
  console.log(`   Name: ${source.name}`);
  console.log(`   Country/Language: ${source.country}/${source.language}`);
  console.log(`   Category: ${source.category}`);
  console.log(`   URL: ${source.url}`);
  console.log('');
});

console.log('📊 Summary by Category:');
const byCategory = {};
const byCountry = {};
unknownSources.forEach(source => {
  byCategory[source.category] = (byCategory[source.category] || 0) + 1;
  byCountry[source.country] = (byCountry[source.country] || 0) + 1;
});

console.log('\nBy Category:');
Object.entries(byCategory)
  .sort(([,a], [,b]) => b - a)
  .forEach(([category, count]) => {
    console.log(`  ${category}: ${count}`);
  });

console.log('\nBy Country:');
Object.entries(byCountry)
  .sort(([,a], [,b]) => b - a)
  .forEach(([country, count]) => {
    console.log(`  ${country.toUpperCase()}: ${count}`);
  });

// Generate simple list for copy/paste
console.log('\n📋 Simple List (copy/paste ready):');
console.log('================================');
unknownSources.forEach(source => {
  console.log(`${source.id} - ${source.name} (${source.country}/${source.language})`);
});