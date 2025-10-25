'use client'

import { useLanguage } from '@/contexts/LanguageContext'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const { language } = useLanguage()

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-white mb-4">500</h1>
        <h2 className="text-2xl font-semibold text-blue-200 mb-8">
          {language === 'de'
            ? 'Ein Fehler ist aufgetreten'
            : 'An error occurred'
          }
        </h2>
        <p className="text-gray-300 mb-8">
          {error.message || (language === 'de'
            ? 'Etwas ist schief gelaufen. Bitte versuchen Sie es später erneut.'
            : 'Something went wrong. Please try again later.'
          )}
        </p>
        <button
          onClick={() => reset()}
          className="bg-[#00BFA6] hover:bg-[#00A693] text-white px-6 py-3 rounded-lg font-semibold transition-colors duration-200"
        >
          {language === 'de' ? 'Erneut versuchen' : 'Try again'}
        </button>
      </div>
    </div>
  )
}
