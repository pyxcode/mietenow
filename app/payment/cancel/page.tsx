'use client'

export const dynamic = 'force-dynamic'

import SimpleHeader from '@/components/SimpleHeader'
import Link from 'next/link'
import { useLanguage } from '@/contexts/LanguageContext'

export default function PaymentCancel() {
  const { language } = useLanguage()

  const translations = {
    title: {
      de: 'Zahlung abgebrochen',
      en: 'Payment cancelled'
    },
    message: {
      de: 'Ihre Zahlung wurde abgebrochen. Es wurde kein Betrag belastet.',
      en: 'Your payment has been cancelled. No amount has been charged.'
    },
    retry: {
      de: 'Erneut versuchen',
      en: 'Try again'
    },
    home: {
      de: 'Zurück zur Startseite',
      en: 'Back to home'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      <SimpleHeader />
      <div className="flex items-center justify-center min-h-[80vh]">
        <div className="text-center text-white max-w-md mx-auto">
          <div className="text-6xl mb-6">❌</div>
          <h1 className="text-4xl font-bold mb-4">
            {language === 'de' ? translations.title.de : translations.title.en}
          </h1>
          <p className="text-xl mb-8">
            {language === 'de' ? translations.message.de : translations.message.en}
          </p>
          <div className="space-y-4">
            <Link 
              href="/payment"
              className="block bg-[#00BFA6] hover:bg-[#00A693] text-white px-8 py-3 rounded-lg font-bold text-lg transition-colors duration-200"
            >
              {language === 'de' ? translations.retry.de : translations.retry.en}
            </Link>
            <Link 
              href="/"
              className="block text-white hover:text-blue-300 transition-colors duration-200"
            >
              {language === 'de' ? translations.home.de : translations.home.en}
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
