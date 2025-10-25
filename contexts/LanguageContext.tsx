'use client'

import { createContext, useContext, useState, ReactNode } from 'react'

type Language = 'de' | 'en'

interface LanguageContextType {
  language: Language
  changeLanguage: (lang: Language) => void
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>('en')

  const changeLanguage = (lang: Language) => {
    setLanguage(lang)
  }

  return (
    <LanguageContext.Provider value={{ language, changeLanguage }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    // Fallback pour le prerendering côté serveur
    return { language: 'en' as Language, changeLanguage: () => {} }
  }
  return context
}
