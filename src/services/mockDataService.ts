import { Article } from '../types'

export const MOCK_ARTICLES: Article[] = [
  // CNN - Left leaning
  {
    title: "Climate Scientists Warn of Accelerating Global Temperature Rise",
    description: "New research shows global temperatures are rising faster than previously predicted, with urgent calls for immediate action on emissions reduction and renewable energy transition.",
    link: "https://cnn.com/climate-warning-temperature-rise",
    pubDate: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    source: "CNN",
    sourceLean: "left"
  },
  {
    title: "Immigration Reform Advocates Push for Comprehensive Border Policy",
    description: "Advocacy groups call for humane immigration policies that balance border security with pathways to citizenship for undocumented immigrants already in the country.",
    link: "https://cnn.com/immigration-reform-advocacy",
    pubDate: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), // 4 hours ago
    source: "CNN",
    sourceLean: "left"
  },
  {
    title: "Healthcare Expansion Shows Promise in Reducing Medical Debt",
    description: "New data suggests that expanded healthcare coverage has significantly reduced medical bankruptcies and improved access to preventive care across diverse communities.",
    link: "https://cnn.com/healthcare-expansion-debt",
    pubDate: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), // 6 hours ago
    source: "CNN",
    sourceLean: "left"
  },

  // NPR - Center
  {
    title: "Climate Change Impacts Vary Significantly Across Different Regions",
    description: "Analysis of climate data reveals that while global temperatures are rising, the effects are unevenly distributed, affecting agricultural and urban areas differently.",
    link: "https://npr.org/climate-regional-impacts",
    pubDate: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(), // 3 hours ago
    source: "NPR",
    sourceLean: "center"
  },
  {
    title: "Bipartisan Immigration Talks Focus on Border Security and Legal Pathways",
    description: "Congressional leaders from both parties discuss potential compromise legislation that addresses border enforcement while creating legal immigration opportunities.",
    link: "https://npr.org/bipartisan-immigration-talks",
    pubDate: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), // 5 hours ago
    source: "NPR",
    sourceLean: "center"
  },
  {
    title: "Technology Giants Report Mixed Results on AI Investment Returns",
    description: "Major tech companies show varying success rates in artificial intelligence initiatives, with some seeing significant returns while others face implementation challenges.",
    link: "https://npr.org/tech-ai-investment-results",
    pubDate: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(), // 1 hour ago
    source: "NPR",
    sourceLean: "center"
  },

  // Fox News - Right leaning
  {
    title: "Energy Independence Advocates Question Climate Policy Economic Impact",
    description: "Critics argue that rapid transitions to renewable energy could harm economic growth and energy security, calling for more gradual policy implementation.",
    link: "https://foxnews.com/energy-independence-climate-policy",
    pubDate: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(), // 3 hours ago
    source: "Fox News",
    sourceLean: "right"
  },
  {
    title: "Border Security Officials Highlight Need for Enhanced Enforcement",
    description: "Law enforcement agencies report increased challenges at border crossings, emphasizing the need for additional resources and stricter enforcement policies.",
    link: "https://foxnews.com/border-security-enforcement",
    pubDate: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), // 5 hours ago
    source: "Fox News",
    sourceLean: "right"
  },
  {
    title: "Healthcare Costs Rise Despite Government Intervention Programs",
    description: "Analysis shows that despite various government healthcare programs, medical costs continue to increase, raising questions about the effectiveness of current policies.",
    link: "https://foxnews.com/healthcare-costs-government-programs",
    pubDate: new Date(Date.now() - 7 * 60 * 60 * 1000).toISOString(), // 7 hours ago
    source: "Fox News",
    sourceLean: "right"
  },

  // BBC - Center
  {
    title: "Global Climate Summit Produces Mixed Commitments from World Leaders",
    description: "International climate negotiations result in varied pledges from different nations, with some countries making ambitious commitments while others remain cautious.",
    link: "https://bbc.com/climate-summit-mixed-commitments",
    pubDate: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(), // 8 hours ago
    source: "BBC News",
    sourceLean: "center"
  },
  {
    title: "Technology Sector Faces Regulatory Scrutiny Over Data Privacy",
    description: "Government regulators worldwide are increasing oversight of tech companies' data collection practices, leading to new compliance requirements and potential fines.",
    link: "https://bbc.com/tech-regulatory-scrutiny-privacy",
    pubDate: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    source: "BBC News",
    sourceLean: "center"
  },

  // Wall Street Journal - Right leaning
  {
    title: "Economic Growth Shows Resilience Despite Climate Policy Concerns",
    description: "Market analysts note that economic indicators remain strong even as businesses adapt to new environmental regulations, though some sectors show strain.",
    link: "https://wsj.com/economic-growth-climate-policy",
    pubDate: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), // 4 hours ago
    source: "Wall Street Journal",
    sourceLean: "right"
  },
  {
    title: "Technology Innovation Drives Market Optimism Despite Regulatory Challenges",
    description: "Investors remain bullish on tech stocks as companies demonstrate strong innovation capabilities, even while navigating increased regulatory oversight.",
    link: "https://wsj.com/tech-innovation-market-optimism",
    pubDate: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(), // 1 hour ago
    source: "Wall Street Journal",
    sourceLean: "right"
  }
]

export const getMockArticlesForDemo = (): Article[] => {
  return MOCK_ARTICLES.map(article => ({
    ...article,
    // Randomize publication times within the last 24 hours
    pubDate: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toISOString()
  }))
}