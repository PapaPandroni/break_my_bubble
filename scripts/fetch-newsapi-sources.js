#!/usr/bin/env node

/**
 * Script to fetch all available NewsAPI sources and export to JSON
 * This helps us map correct source IDs for political lean classification
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Get API key from environment
const API_KEY = process.env.VITE_NEWS_API_KEY;
const BASE_URL = 'https://newsapi.org/v2';

if (!API_KEY) {
  console.error('❌ Error: VITE_NEWS_API_KEY environment variable not set');
  console.error('Please set your NewsAPI key and run again:');
  console.error('export VITE_NEWS_API_KEY=your_api_key_here');
  process.exit(1);
}

async function fetchAllSources() {
  try {
    console.log('🔍 Fetching all NewsAPI sources...');
    
    const response = await fetch(`${BASE_URL}/top-headlines/sources?apiKey=${API_KEY}`);
    
    if (!response.ok) {
      throw new Error(`NewsAPI request failed: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    if (data.status !== 'ok') {
      throw new Error(data.message || 'NewsAPI request failed');
    }
    
    console.log(`📊 Found ${data.sources.length} total sources`);
    
    // Sort sources by ID for easy reference
    const sortedSources = data.sources.sort((a, b) => a.id.localeCompare(b.id));
    
    // Create detailed analysis
    const analysis = {
      totalSources: data.sources.length,
      fetchedAt: new Date().toISOString(),
      sources: sortedSources,
      byCountry: {},
      byLanguage: {},
      byCategory: {},
      sourceIds: sortedSources.map(s => s.id)
    };
    
    // Group by country
    sortedSources.forEach(source => {
      if (!analysis.byCountry[source.country]) {
        analysis.byCountry[source.country] = [];
      }
      analysis.byCountry[source.country].push(source);
    });
    
    // Group by language
    sortedSources.forEach(source => {
      if (!analysis.byLanguage[source.language]) {
        analysis.byLanguage[source.language] = [];
      }
      analysis.byLanguage[source.language].push(source);
    });
    
    // Group by category
    sortedSources.forEach(source => {
      if (!analysis.byCategory[source.category]) {
        analysis.byCategory[source.category] = [];
      }
      analysis.byCategory[source.category].push(source);
    });
    
    // Write comprehensive analysis to file
    const outputPath = path.join(__dirname, '..', 'newsapi-sources-complete.json');
    fs.writeFileSync(outputPath, JSON.stringify(analysis, null, 2));
    
    // Write simple ID list for quick reference
    const idsOutputPath = path.join(__dirname, '..', 'newsapi-source-ids.json');
    fs.writeFileSync(idsOutputPath, JSON.stringify(analysis.sourceIds, null, 2));
    
    console.log('✅ Complete analysis saved to:', outputPath);
    console.log('✅ Source IDs saved to:', idsOutputPath);
    
    // Print summary
    console.log('\n📈 Summary:');
    console.log(`Total Sources: ${analysis.totalSources}`);
    console.log(`Countries: ${Object.keys(analysis.byCountry).length}`);
    console.log(`Languages: ${Object.keys(analysis.byLanguage).length}`);
    console.log(`Categories: ${Object.keys(analysis.byCategory).length}`);
    
    // Show top countries
    const topCountries = Object.entries(analysis.byCountry)
      .sort(([,a], [,b]) => b.length - a.length)
      .slice(0, 5);
    
    console.log('\n🌍 Top Countries:');
    topCountries.forEach(([country, sources]) => {
      console.log(`  ${country.toUpperCase()}: ${sources.length} sources`);
    });
    
    // Show sample of major US sources for quick verification
    console.log('\n🇺🇸 Major US Sources (sample):');
    const usSources = analysis.byCountry['us'] || [];
    const majorUsSources = usSources.filter(s => 
      ['cnn', 'fox-news', 'abc-news', 'nbc-news', 'cbs-news', 'reuters', 'associated-press', 'the-wall-street-journal'].includes(s.id)
    );
    
    majorUsSources.forEach(source => {
      console.log(`  ✓ ${source.id} - ${source.name}`);
    });
    
    if (majorUsSources.length === 0) {
      console.log('  (Run script to see full list in JSON files)');
    }
    
    return analysis;
    
  } catch (error) {
    console.error('❌ Error fetching sources:', error.message);
    process.exit(1);
  }
}

// Run the script
fetchAllSources().then(() => {
  console.log('\n🎉 Script completed successfully!');
  console.log('Next steps:');
  console.log('1. Review newsapi-sources-complete.json');
  console.log('2. Update political lean mappings with correct IDs');
  console.log('3. Test with updated classifications');
}).catch(error => {
  console.error('💥 Script failed:', error);
  process.exit(1);
});