/**
 * Accessibility utility functions for WCAG 2.1 AA compliance
 */

/**
 * Generates unique IDs for form elements and ARIA relationships
 */
export const generateId = (prefix: string): string => {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

/**
 * Creates ARIA live region announcements for screen readers
 */
export const announceToScreenReader = (message: string, priority: 'polite' | 'assertive' = 'polite'): void => {
  // Create or get existing live region
  let liveRegion = document.getElementById('screen-reader-announcements')
  
  if (!liveRegion) {
    liveRegion = document.createElement('div')
    liveRegion.id = 'screen-reader-announcements'
    liveRegion.setAttribute('aria-live', priority)
    liveRegion.setAttribute('aria-atomic', 'true')
    liveRegion.className = 'sr-only'
    liveRegion.style.cssText = `
      position: absolute !important;
      width: 1px !important;
      height: 1px !important;
      padding: 0 !important;
      margin: -1px !important;
      overflow: hidden !important;
      clip: rect(0,0,0,0) !important;
      white-space: nowrap !important;
      border: 0 !important;
    `
    document.body.appendChild(liveRegion)
  }
  
  // Update the live region content
  liveRegion.textContent = message
  
  // Clear after announcement to avoid repetition
  setTimeout(() => {
    if (liveRegion) {
      liveRegion.textContent = ''
    }
  }, 1000)
}

/**
 * Validates if an element meets minimum touch target size (44px)
 */
export const validateTouchTarget = (element: HTMLElement): boolean => {
  const rect = element.getBoundingClientRect()
  return rect.width >= 44 && rect.height >= 44
}

/**
 * Ensures proper focus management and visibility
 */
export const manageFocus = {
  /**
   * Focuses element and ensures it's visible
   */
  focusElement: (element: HTMLElement | null): void => {
    if (!element) return
    
    element.focus()
    
    // Ensure element is visible
    if (element.scrollIntoView) {
      element.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'nearest',
        inline: 'nearest' 
      })
    }
  },
  
  /**
   * Gets all focusable elements within a container
   */
  getFocusableElements: (container: HTMLElement): HTMLElement[] => {
    const focusableSelectors = [
      'a[href]:not([disabled])',
      'button:not([disabled])',
      'textarea:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      '[tabindex]:not([tabindex="-1"]):not([disabled])',
      '[contenteditable]:not([contenteditable="false"])'
    ].join(', ')
    
    return Array.from(container.querySelectorAll(focusableSelectors)) as HTMLElement[]
  },
  
  /**
   * Traps focus within a container (for modals)
   */
  trapFocus: (container: HTMLElement, event: KeyboardEvent): void => {
    if (event.key !== 'Tab') return
    
    const focusableElements = manageFocus.getFocusableElements(container)
    if (focusableElements.length === 0) return
    
    const firstElement = focusableElements[0]
    const lastElement = focusableElements[focusableElements.length - 1]
    
    if (event.shiftKey) {
      // Shift + Tab: moving backwards
      if (document.activeElement === firstElement) {
        event.preventDefault()
        lastElement.focus()
      }
    } else {
      // Tab: moving forwards
      if (document.activeElement === lastElement) {
        event.preventDefault()
        firstElement.focus()
      }
    }
  }
}

/**
 * ARIA helper functions
 */
export const aria = {
  /**
   * Sets up proper ARIA relationships for form controls
   */
  associateFormControl: (input: HTMLElement, label: HTMLElement, description?: HTMLElement, error?: HTMLElement): void => {
    const inputId = input.id || generateId('input')
    const labelId = label.id || generateId('label')
    
    input.id = inputId
    label.id = labelId
    
    // Associate label with input
    if (label.tagName === 'LABEL') {
      (label as HTMLLabelElement).htmlFor = inputId
    } else {
      label.setAttribute('id', labelId)
      input.setAttribute('aria-labelledby', labelId)
    }
    
    // Associate description if provided
    if (description) {
      const descId = description.id || generateId('desc')
      description.id = descId
      const existingDescribedBy = input.getAttribute('aria-describedby') || ''
      input.setAttribute('aria-describedby', existingDescribedBy ? `${existingDescribedBy} ${descId}` : descId)
    }
    
    // Associate error if provided
    if (error) {
      const errorId = error.id || generateId('error')
      error.id = errorId
      const existingDescribedBy = input.getAttribute('aria-describedby') || ''
      input.setAttribute('aria-describedby', existingDescribedBy ? `${existingDescribedBy} ${errorId}` : errorId)
      input.setAttribute('aria-invalid', 'true')
    }
  },
  
  /**
   * Creates proper ARIA expand/collapse states
   */
  setExpandableState: (trigger: HTMLElement, target: HTMLElement, isExpanded: boolean): void => {
    const targetId = target.id || generateId('expandable')
    target.id = targetId
    
    trigger.setAttribute('aria-expanded', isExpanded.toString())
    trigger.setAttribute('aria-controls', targetId)
    
    if (!isExpanded) {
      target.setAttribute('aria-hidden', 'true')
    } else {
      target.removeAttribute('aria-hidden')
    }
  }
}

/**
 * Screen reader utilities
 */
export const screenReader = {
  /**
   * Provides context for dynamic content changes
   */
  announceSearchResults: (count: number, topic: string): void => {
    const message = count === 0 
      ? `No articles found for ${topic}` 
      : `Found ${count} article${count === 1 ? '' : 's'} for ${topic}`
    announceToScreenReader(message, 'polite')
  },
  
  /**
   * Announces loading states
   */
  announceLoading: (isLoading: boolean, context: string = 'content'): void => {
    const message = isLoading 
      ? `Loading ${context}, please wait` 
      : `${context} loaded successfully`
    announceToScreenReader(message, 'polite')
  },
  
  /**
   * Announces form validation errors
   */
  announceFormError: (fieldName: string, error: string): void => {
    announceToScreenReader(`Error in ${fieldName}: ${error}`, 'assertive')
  },
  
  /**
   * Announces modal state changes
   */
  announceModal: (isOpen: boolean, title: string): void => {
    const message = isOpen 
      ? `${title} dialog opened` 
      : `${title} dialog closed`
    announceToScreenReader(message, 'polite')
  }
}

/**
 * Color contrast validation utilities
 */
export const colorContrast = {
  /**
   * Calculates relative luminance for WCAG contrast ratio
   */
  getRelativeLuminance: (color: string): number => {
    // Convert hex to RGB
    const hex = color.replace('#', '')
    const r = parseInt(hex.substr(0, 2), 16) / 255
    const g = parseInt(hex.substr(2, 2), 16) / 255
    const b = parseInt(hex.substr(4, 2), 16) / 255
    
    // Convert to linear RGB
    const sRGBtoLin = (colorChannel: number): number => {
      return colorChannel <= 0.03928 
        ? colorChannel / 12.92 
        : Math.pow((colorChannel + 0.055) / 1.055, 2.4)
    }
    
    const rLin = sRGBtoLin(r)
    const gLin = sRGBtoLin(g)
    const bLin = sRGBtoLin(b)
    
    return 0.2126 * rLin + 0.7152 * gLin + 0.0722 * bLin
  },
  
  /**
   * Calculates contrast ratio between two colors
   */
  getContrastRatio: (color1: string, color2: string): number => {
    const l1 = colorContrast.getRelativeLuminance(color1)
    const l2 = colorContrast.getRelativeLuminance(color2)
    
    const lighter = Math.max(l1, l2)
    const darker = Math.min(l1, l2)
    
    return (lighter + 0.05) / (darker + 0.05)
  },
  
  /**
   * Validates if color combination meets WCAG AA standard (4.5:1)
   */
  meetsWCAGAA: (foreground: string, background: string): boolean => {
    return colorContrast.getContrastRatio(foreground, background) >= 4.5
  }
}

/**
 * Keyboard navigation helpers
 */
export const keyboard = {
  /**
   * Common key codes for keyboard navigation
   */
  keys: {
    ESCAPE: 'Escape',
    ENTER: 'Enter',
    SPACE: ' ',
    TAB: 'Tab',
    ARROW_UP: 'ArrowUp',
    ARROW_DOWN: 'ArrowDown',
    ARROW_LEFT: 'ArrowLeft',  
    ARROW_RIGHT: 'ArrowRight',
    HOME: 'Home',
    END: 'End'
  },
  
  /**
   * Handles roving tabindex for complex widgets
   */
  setupRovingTabindex: (container: HTMLElement, items: HTMLElement[]): void => {
    if (items.length === 0) return
    
    // Set initial state - first item is focusable
    items.forEach((item, index) => {
      item.setAttribute('tabindex', index === 0 ? '0' : '-1')
    })
    
    // Handle arrow key navigation
    const handleKeyDown = (event: KeyboardEvent) => {
      const currentIndex = items.findIndex(item => item === event.target)
      if (currentIndex === -1) return
      
      let newIndex = currentIndex
      
      switch (event.key) {
        case keyboard.keys.ARROW_DOWN:
        case keyboard.keys.ARROW_RIGHT:
          event.preventDefault()
          newIndex = (currentIndex + 1) % items.length
          break
        case keyboard.keys.ARROW_UP:
        case keyboard.keys.ARROW_LEFT:
          event.preventDefault()
          newIndex = (currentIndex - 1 + items.length) % items.length
          break
        case keyboard.keys.HOME:
          event.preventDefault()
          newIndex = 0
          break
        case keyboard.keys.END:
          event.preventDefault()
          newIndex = items.length - 1
          break
        default:
          return
      }
      
      // Update tabindex and focus
      items[currentIndex].setAttribute('tabindex', '-1')
      items[newIndex].setAttribute('tabindex', '0')
      items[newIndex].focus()
    }
    
    container.addEventListener('keydown', handleKeyDown)
  }
}