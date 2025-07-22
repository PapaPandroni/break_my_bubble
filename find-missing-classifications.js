#!/usr/bin/env node

/**
 * Find sources that should be classified but are still unknown
 */

import fs from 'fs';

// Read the complete source list
const sourcesData = JSON.parse(fs.readFileSync('./newsapi-sources-complete.json', 'utf8'));
const allSources = sourcesData.sources;

// Sources that we added explicit classifications for
const explicitlyClassified = [
  'cnn', 'msnbc', 'the-huffington-post', 'buzzfeed', 'vice-news',
  'politico', 'usa-today', 'time', 'the-washington-post', 'abc-news',
  'cbs-news', 'nbc-news', 'newsweek', 'bloomberg', 'axios', 'the-hill',
  'business-insider', 'mashable', 'techcrunch', 'the-verge', 'wired',
  'engadget', 'ars-technica', 'recode', 'bbc-news', 'reuters',
  'associated-press', 'fortune', 'google-news', 'hacker-news',
  'new-scientist', 'medical-news-today', 'national-geographic',
  'the-wall-street-journal', 'new-york-magazine', 'fox-news',
  'breitbart-news', 'national-review', 'the-american-conservative',
  'the-washington-times', 'al-jazeera-english', 'rt', 'independent',
  'the-times-of-india', 'xinhua-net'
];

// Find major sources that should be classified but aren't
const majorUSources = allSources.filter(s => s.country === 'us' && !explicitlyClassified.includes(s.id));
const majorInternational = allSources.filter(s => 
  ['gb', 'ca', 'au', 'de', 'fr', 'it'].includes(s.country) && 
  s.category === 'general' && 
  !explicitlyClassified.includes(s.id)
);

console.log('🔍 Major US Sources Still Needing Classification:');
console.log('================================================');
majorUSources.forEach(source => {
  console.log(`${source.id} - ${source.name} (${source.category})`);
  console.log(`  URL: ${source.url}`);
  console.log('');
});

console.log('🌍 Major International Sources Needing Classification:');
console.log('====================================================');
majorInternational.forEach(source => {
  console.log(`${source.id} - ${source.name} (${source.country.toUpperCase()}/${source.language})`);
  console.log(`  URL: ${source.url}`);
  console.log('');
});

console.log('📊 Quick Stats:');
console.log(`US Sources needing classification: ${majorUSources.length}`);
console.log(`International sources needing classification: ${majorInternational.length}`);
console.log(`Total explicitly classified: ${explicitlyClassified.length}`);
console.log(`Total NewsAPI sources: ${allSources.length}`);