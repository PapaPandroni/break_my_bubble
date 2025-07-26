// Type alias for political lean values
export type PoliticalLean = 'left' | 'lean-left' | 'center' | 'lean-right' | 'right' | 'unknown'

/**
 * Returns the CSS classes for styling political lean badges
 */
export const getPoliticalLeanColor = (lean: PoliticalLean): string => {
  switch (lean) {
    case 'left':
      return 'bg-blue-200 text-blue-800 border-blue-400'
    case 'lean-left':
      return 'bg-blue-100 text-blue-700 border-blue-300'
    case 'center':
      return 'bg-gray-100 text-gray-700 border-gray-300'
    case 'lean-right':
      return 'bg-red-100 text-red-700 border-red-300'
    case 'right':
      return 'bg-red-200 text-red-800 border-red-400'
    case 'unknown':
    default:
      return 'bg-amber-100 text-amber-700 border-amber-300'
  }
}

/**
 * Returns the human-readable label for political lean
 */
export const getPoliticalLeanLabel = (lean: PoliticalLean): string => {
  switch (lean) {
    case 'left':
      return 'Left'
    case 'lean-left':
      return 'Lean Left'
    case 'center':
      return 'Center'
    case 'lean-right':
      return 'Lean Right'
    case 'right':
      return 'Right'
    case 'unknown':
    default:
      return 'Unknown'
  }
}

/**
 * Returns political lean score for sorting and comparison
 * Lower scores = more left-leaning, Higher scores = more right-leaning
 */
export const getPoliticalLeanScore = (lean: PoliticalLean): number => {
  switch (lean) {
    case 'left':
      return 1
    case 'lean-left':
      return 2
    case 'center':
      return 3
    case 'lean-right':
      return 4
    case 'right':
      return 5
    case 'unknown':
    default:
      return 3 // Treat unknown as neutral/center
  }
}

/**
 * Determines if two political leans are opposing
 */
export const areOpposingLeans = (lean1: PoliticalLean, lean2: PoliticalLean): boolean => {
  const score1 = getPoliticalLeanScore(lean1)
  const score2 = getPoliticalLeanScore(lean2)
  
  // Consider leans opposing if they're on different sides of center (3)
  // Left/Lean-Left vs Right/Lean-Right
  return (score1 <= 2 && score2 >= 4) || (score1 >= 4 && score2 <= 2)
}

/**
 * Groups political leans by general orientation
 */
export const getPoliticalLeanGroup = (lean: PoliticalLean): 'left' | 'center' | 'right' | 'unknown' => {
  switch (lean) {
    case 'left':
    case 'lean-left':
      return 'left'
    case 'center':
      return 'center'
    case 'lean-right':
    case 'right':
      return 'right'
    case 'unknown':
    default:
      return 'unknown'
  }
}