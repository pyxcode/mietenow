'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import SimpleHeader from '@/components/SimpleHeader'
import Link from 'next/link'
import Image from 'next/image'
import { useLanguage } from '@/contexts/LanguageContext'

export default function PaymentSuccessClient() {
  const searchParams = useSearchParams()
  const sessionId = searchParams.get('session_id')
  const plan = searchParams.get('plan')
  const [loading, setLoading] = useState(true)
  const { language } = useLanguage()

  useEffect(() => {
    // Activer automatiquement le plan
    const activatePlan = async () => {
      try {
        if (plan) {
          const userId = localStorage.getItem('userId') || sessionStorage.getItem('userId')
          
          if (!userId) {
            console.error('❌ ID utilisateur non trouvé')
            setLoading(false)
            return
          }

          const response = await fetch('/api/activate-plan', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ userId, plan, sessionId }),
          })

          if (!response.ok) {
            throw new Error('Failed to activate plan')
          }

          console.log('✅ Plan activé avec succès !')
        }
      } catch (error) {
        console.error('❌ Erreur lors de l\'activation du plan:', error)
      } finally {
        setLoading(false)
      }
    }

    activatePlan()
  }, [plan, sessionId])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 relative">
        <SimpleHeader />
        <div className="flex items-center justify-center min-h-[80vh]">
          <div className="text-white text-xl">
            {language === 'de' ? 'Zahlung wird überprüft...' : 'Verifying payment...'}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 relative">
      <SimpleHeader />
      <div className="flex items-center justify-center min-h-[80vh] px-4 py-16">
        <div className="text-center text-white max-w-2xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
            {language === 'de' 
              ? 'Willkommen in der mietenow Community ❤️'
              : 'Welcome to the mietenow Community ❤️'
            }
          </h1>
          
          <p className="text-xl mb-4 text-blue-100">
            {language === 'de'
              ? 'Ihre Zahlung wurde erfolgreich akzeptiert'
              : 'Your payment has been successfully accepted'
            }
          </p>
          
          <p className="text-lg mb-8 text-gray-200">
            {language === 'de'
              ? 'Ihr mietenow-Abonnement ist jetzt aktiv'
              : 'Your mietenow subscription is now active'
            }
          </p>

          <Link 
            href="/search"
            className="bg-[#00BFA6] hover:bg-[#00A693] text-white px-8 py-3 rounded-lg font-semibold text-lg transition-colors duration-200"
          >
            {language === 'de' ? 'Suche starten' : 'Start Searching'}
          </Link>
        </div>
      </div>
    </div>
  )
}
