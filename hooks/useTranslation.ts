'use client'

import { useState, useEffect, useCallback } from 'react'
import { translations, Language } from '@/lib/translations'

// État global simple pour la langue
let globalLanguage: Language = 'de'
let listeners: Set<() => void> = new Set()

const notifyListeners = () => {
  listeners.forEach(listener => listener())
}

export function useTranslation() {
  const [language, setLanguage] = useState<Language>(globalLanguage)

  useEffect(() => {
    // Récupérer la langue depuis localStorage si disponible
    const savedLanguage = localStorage.getItem('language') as Language
    if (savedLanguage && (savedLanguage === 'de' || savedLanguage === 'en')) {
      globalLanguage = savedLanguage
      setLanguage(savedLanguage)
    }
  }, [])

  useEffect(() => {
    const listener = () => {
      setLanguage(globalLanguage)
    }
    
    listeners.add(listener)
    
    return () => {
      listeners.delete(listener)
    }
  }, [])

  const changeLanguage = useCallback((newLanguage: Language) => {
    globalLanguage = newLanguage
    setLanguage(newLanguage)
    localStorage.setItem('language', newLanguage)
    notifyListeners()
  }, [])

  const t = useCallback((key: string) => {
    const keys = key.split('.')
    let value: any = translations[language]
    
    for (const k of keys) {
      value = value?.[k]
    }
    
    return value || key
  }, [language])

  return {
    language,
    changeLanguage,
    t
  }
}
