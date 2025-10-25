'use client'

import Link from 'next/link'
import { useLanguage } from '@/contexts/LanguageContext'

export default function NotFound() {
  const { language } = useLanguage()

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-white mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-blue-200 mb-8">
          {language === 'de' 
            ? 'Seite nicht gefunden'
            : 'Page not found'
          }
        </h2>
        <p className="text-gray-300 mb-8">
          {language === 'de'
            ? 'Die gesuchte Seite existiert nicht.'
            : 'The page you are looking for does not exist.'
          }
        </p>
        <Link
          href="/"
          className="bg-[#00BFA6] hover:bg-[#00A693] text-white px-6 py-3 rounded-lg font-semibold transition-colors duration-200"
        >
          {language === 'de' ? 'Zurück zur Startseite' : 'Back to Home'}
        </Link>
      </div>
    </div>
  )
}
