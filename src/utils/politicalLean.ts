// Type alias for political lean values
export type PoliticalLean = 'left' | 'lean-left' | 'center' | 'lean-right' | 'right' | 'unknown'

/**
 * Returns WCAG 2.1 AA compliant CSS classes for political lean badges (4.5:1+ contrast ratio)
 */
export const getPoliticalLeanColor = (lean: PoliticalLean): string => {
  switch (lean) {
    case 'left':
      return 'bg-strong-left-100 text-strong-left-900 border-strong-left-300 shadow-soft'
    case 'lean-left':
      return 'bg-lean-left-100 text-lean-left-900 border-lean-left-300 shadow-soft'
    case 'center':
      return 'bg-center-100 text-center-900 border-center-300 shadow-soft'
    case 'lean-right':
      return 'bg-lean-right-100 text-lean-right-900 border-lean-right-300 shadow-soft'
    case 'right':
      return 'bg-strong-right-100 text-strong-right-900 border-strong-right-300 shadow-soft'
    case 'unknown':
    default:
      return 'bg-unknown-100 text-unknown-900 border-unknown-300 shadow-soft'
  }
}

/**
 * Returns enhanced background styles for article cards based on political lean
 */
export const getPoliticalLeanCardStyle = (lean: PoliticalLean): string => {
  switch (lean) {
    case 'left':
      return 'border-l-4 border-strong-left-500 bg-gradient-to-r from-strong-left-25 to-white'
    case 'lean-left':
      return 'border-l-4 border-lean-left-400 bg-gradient-to-r from-lean-left-25 to-white'
    case 'center':
      return 'border-l-4 border-center-400 bg-gradient-to-r from-center-25 to-white'
    case 'lean-right':
      return 'border-l-4 border-lean-right-400 bg-gradient-to-r from-lean-right-25 to-white'
    case 'right':
      return 'border-l-4 border-strong-right-500 bg-gradient-to-r from-strong-right-25 to-white'
    case 'unknown':
    default:
      return 'border-l-4 border-unknown-400 bg-gradient-to-r from-unknown-25 to-white'
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