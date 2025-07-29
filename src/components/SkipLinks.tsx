/**
 * Skip Links component for WCAG 2.1 AA keyboard navigation compliance
 * Provides keyboard users quick access to main content areas
 */

interface SkipLinksProps {
  currentStep: 'landing' | 'modal' | 'results'
}

export default function SkipLinks({ currentStep }: SkipLinksProps) {
  const handleSkipToContent = (targetId: string) => {
    const element = document.getElementById(targetId)
    if (element) {
      element.focus()
      element.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  return (
    <div className="skip-links">
      {/* Skip links are only visible when focused */}
      <a
        href="#main-content"
        onClick={(e) => {
          e.preventDefault()
          handleSkipToContent('main-content')
        }}
        className="skip-link"
      >
        Skip to main content
      </a>
      
      {currentStep === 'landing' && (
        <>
          <a
            href="#source-selection"
            onClick={(e) => {
              e.preventDefault()
              handleSkipToContent('source-selection')
            }}
            className="skip-link"
          >
            Skip to source selection
          </a>
          <a
            href="#filter-panel"
            onClick={(e) => {
              e.preventDefault()
              handleSkipToContent('filter-panel')
            }}
            className="skip-link"
          >
            Skip to filters
          </a>
        </>
      )}
      
      {currentStep === 'modal' && (
        <>
          <a
            href="#topic-search"
            onClick={(e) => {
              e.preventDefault()
              handleSkipToContent('topic-search')
            }}
            className="skip-link"
          >
            Skip to topic search
          </a>
          <a
            href="#topic-selection"
            onClick={(e) => {
              e.preventDefault()
              handleSkipToContent('topic-selection')
            }}
            className="skip-link"
          >
            Skip to topic selection
          </a>
        </>
      )}
      
      {currentStep === 'results' && (
        <>
          <a
            href="#results-summary"
            onClick={(e) => {
              e.preventDefault()
              handleSkipToContent('results-summary')
            }}
            className="skip-link"
          >
            Skip to results summary
          </a>
          <a
            href="#user-articles"
            onClick={(e) => {
              e.preventDefault()
              handleSkipToContent('user-articles')
            }}
            className="skip-link"
          >
            Skip to your articles
          </a>
          <a
            href="#opposing-articles"
            onClick={(e) => {
              e.preventDefault()
              handleSkipToContent('opposing-articles')
            }}
            className="skip-link"
          >
            Skip to opposing articles
          </a>
        </>
      )}
      
      <style>{`
        .skip-links {
          position: absolute;
          top: 0;
          left: 0;
          z-index: 100;
        }
        
        .skip-link {
          position: absolute;
          top: -40px;
          left: 6px;
          background: #000;
          color: #fff;
          padding: 8px 16px;
          text-decoration: none;
          font-weight: 600;
          border-radius: 4px;
          transition: top 0.3s;
          z-index: 101;
        }
        
        .skip-link:focus {
          top: 6px;
          outline: 3px solid #4F46E5;
          outline-offset: 2px;
        }
        
        .skip-link:hover {
          background: #333;
        }
      `}</style>
    </div>
  )
}