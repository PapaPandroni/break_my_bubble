import { TopicKeywords, TimeOption } from '../types'

export const TOPICS: TopicKeywords[] = [
  {
    topic: 'Climate Change',
    keywords: [
      'climate',
      'global warming',
      'carbon',
      'renewable',
      'fossil fuel',
      'emissions',
    ],
  },
  {
    topic: 'Healthcare',
    keywords: [
      'healthcare',
      'medicare',
      'insurance',
      'prescription',
      'medical',
      'health policy',
    ],
  },
  {
    topic: 'Immigration',
    keywords: [
      'immigration',
      'border',
      'asylum',
      'visa',
      'refugee',
      'migrant',
    ],
  },
  {
    topic: 'Economy',
    keywords: [
      'economy',
      'inflation',
      'jobs',
      'gdp',
      'unemployment',
      'recession',
    ],
  },
  {
    topic: 'Technology',
    keywords: [
      'tech',
      'AI',
      'artificial intelligence',
      'privacy',
      'data',
      'cyber',
      'digital',
    ],
  },
]

export const TIME_OPTIONS: TimeOption[] = [
  { label: '24 hours', value: 1 },
  { label: '3 days', value: 3 },
  { label: '1 week', value: 7 },
  { label: '2 weeks', value: 14 },
  { label: '1 month', value: 30 },
]