'use client'

interface FormattedDescriptionProps {
  description: string
  className?: string
}

export default function FormattedDescription({ description, className = '' }: FormattedDescriptionProps) {
  if (!description) return null

  // Split by lines
  const lines = description.split('\n').filter(line => line.trim())
  
  // Detect if it has structured sections (starts with === or is already well formatted)
  const hasSections = lines.some(line => line.trim().startsWith('===') || line.trim().match(/^[A-Z\s]+:$/))

  if (!hasSections) {
    // Simple format: just display with line breaks
    return (
      <div className={`text-gray-700 leading-relaxed whitespace-pre-line ${className}`}>
        {description}
      </div>
    )
  }

  // Structured format: parse sections
  interface Section {
    title?: string
    content: string[]
  }
  const sections: Section[] = []
  let currentSection: Section | null = null

  lines.forEach(line => {
    const trimmed = line.trim()
    
    // Detect section title (=== TITLE === or TITLE:)
    if (trimmed.startsWith('===') || trimmed.match(/^[A-Z\s]+:$/)) {
      // Save previous section
      const prevSection = currentSection
      if (prevSection && prevSection.content.length > 0) {
        sections.push(prevSection)
      }
      
      // Start new section
      const title = trimmed.replace(/^===*\s*/, '').replace(/\s*===*$/, '').replace(/:$/, '')
      currentSection = { title, content: [] }
    } else {
      if (currentSection) {
        currentSection.content.push(line)
      } else {
        // Content before any section
        if (sections.length === 0 || sections[sections.length - 1].title) {
          sections.push({ content: [] })
        }
        sections[sections.length - 1].content.push(line)
      }
    }
  })

  // Add last section
  if (currentSection !== null) {
    const sectionToAdd: Section = currentSection
    if (sectionToAdd.content.length > 0) {
      sections.push(sectionToAdd)
    }
  }

  // If no sections were detected properly, just display normally
  if (sections.length === 0) {
    return (
      <div className={`text-gray-700 leading-relaxed whitespace-pre-line ${className}`}>
        {description}
      </div>
    )
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {sections.map((section, index) => (
        <div key={index} className="space-y-3">
          {section.title && (
            <h4 className="text-base font-semibold text-gray-900 uppercase tracking-wide border-b border-gray-200 pb-2">
              {section.title}
            </h4>
          )}
          <div className="text-gray-700 leading-relaxed space-y-2">
            {section.content.map((line, lineIndex) => {
              const trimmed = line.trim()
              
              // Detect bullet points
              if (trimmed.startsWith('- ') || trimmed.startsWith('• ') || trimmed.match(/^[-\u2022\u2023\u25E6\u2043]\s/)) {
                return (
                  <div key={lineIndex} className="flex items-start gap-2">
                    <span className="text-blue-600 mt-1.5">•</span>
                    <span className="flex-1">{trimmed.replace(/^[-\u2022\u2023\u25E6\u2043]\s*/, '')}</span>
                  </div>
                )
              }
              
              // Regular paragraph
              if (trimmed) {
                return (
                  <p key={lineIndex} className={section.title ? '' : 'first:mt-0'}>
                    {trimmed}
                  </p>
                )
              }
              
              // Empty line
              return <br key={lineIndex} />
            })}
          </div>
        </div>
      ))}
    </div>
  )
}

