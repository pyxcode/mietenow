'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import SimpleHeader from '@/components/SimpleHeader'
import Link from 'next/link'
import Image from 'next/image'
import { useLanguage } from '@/contexts/LanguageContext'

export default function PaymentSuccess() {
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
          // Récupérer l'ID de l'utilisateur depuis localStorage ou session
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
            body: JSON.stringify({ plan, userId })
          })
          
          if (response.ok) {
            console.log('✅ Plan activé automatiquement')
          } else {
            console.error('❌ Erreur lors de l\'activation du plan')
          }
        }
      } catch (error) {
        console.error('❌ Erreur lors de l\'activation du plan:', error)
      }
      
      // Simuler une vérification rapide
      const timer = setTimeout(() => {
        setLoading(false)
      }, 1000)

      return () => clearTimeout(timer)
    }

    activatePlan()
  }, [plan])

  const translations = {
    de: {
      verifying: 'Zahlung wird überprüft...',
      welcome: 'Willkommen in der Berliner mietenow Community ❤️',
      paymentAccepted: 'Ihre Zahlung wurde erfolgreich akzeptiert',
      subscriptionActive: 'Ihr mietenow-Abonnement ist jetzt aktiv',
      notifications: 'Sie erhalten Ihre ersten Benachrichtigungen per E-Mail in den nächsten Minuten',
      startSearching: 'Suche nach Wohnungen starten',
      communityTitle: 'Willkommen in der Berliner mietenow Community ❤️',
      communitySubtitle: 'Eine Nachricht von unseren ersten Nutzern',
      sarah: 'Sarah M.',
      sarahRole: 'Französischlehrerin, TU Berlin',
      sarahQuote: 'Ich war skeptisch am Anfang, aber mietenow hat wirklich funktioniert. Nach 3 Wochen hatte ich meine Wohnung in Prenzlauer Berg.',
      anna: 'Anna K.',
      annaRole: 'Köchin, Restaurant Amarone',
      annaQuote: 'Als Köchin arbeite ich unregelmäßige Stunden. mietenow hat mir geholfen, auch nachts die besten Angebote zu finden.',
      thomas: 'Thomas R.',
      thomasRole: 'Business Development',
      thomasQuote: 'Ich hatte schon fast aufgegeben, eine bezahlbare Wohnung in Berlin zu finden. Dann kam mietenow und alles wurde einfacher.',
      maria: 'Maria S.',
      mariaRole: 'Designerin, Startup',
      mariaQuote: 'Die Zeitersparnis ist enorm. Statt stundenlang auf verschiedenen Seiten zu suchen, bekomme ich alles in einer App.',
      david: 'David L.',
      davidRole: 'Ingenieur, Tech Company',
      davidQuote: 'Endlich eine Lösung, die wirklich funktioniert. Ich habe meine Wohnung in Kreuzberg gefunden, genau wie ich es mir vorgestellt hatte.',
      lisa: 'Lisa W.',
      lisaRole: 'Marketing Manager',
      lisaQuote: 'Ich war überrascht, wie schnell es ging. Innerhalb von 2 Wochen hatte ich mehrere Besichtigungstermine und konnte wählen.'
    },
    en: {
      verifying: 'Verifying payment...',
      welcome: 'Welcome to the Berliner mietenow Community ❤️',
      paymentAccepted: 'Your payment has been successfully accepted',
      subscriptionActive: 'Your mietenow subscription is now active',
      notifications: 'You will receive your first email notifications in the next few minutes',
      startSearching: 'Start Searching Homes',
      communityTitle: 'Welcome to the Berliner mietenow Community ❤️',
      communitySubtitle: 'A note from our first users',
      sarah: 'Sarah M.',
      sarahRole: 'French teacher, TU Berlin',
      sarahQuote: 'Ich war skeptisch am Anfang, aber mietenow hat wirklich funktioniert. Nach 3 Wochen hatte ich meine Wohnung in Prenzlauer Berg.',
      anna: 'Anna K.',
      annaRole: 'Chef, Restaurant Amarone',
      annaQuote: 'Als Köchin arbeite ich unregelmäßige Stunden. mietenow hat mir geholfen, auch nachts die besten Angebote zu finden.',
      thomas: 'Thomas R.',
      thomasRole: 'Business Development',
      thomasQuote: 'Ich hatte schon fast aufgegeben, eine bezahlbare Wohnung in Berlin zu finden. Dann kam mietenow und alles wurde einfacher.',
      maria: 'Maria S.',
      mariaRole: 'Designerin, Startup',
      mariaQuote: 'Die Zeitersparnis ist enorm. Statt stundenlang auf verschiedenen Seiten zu suchen, bekomme ich alles in einer App.',
      david: 'David L.',
      davidRole: 'Ingenieur, Tech Company',
      davidQuote: 'Endlich eine Lösung, die wirklich funktioniert. Ich habe meine Wohnung in Kreuzberg gefunden, genau wie ich es mir vorgestellt hatte.',
      Friedrich: 'Friedrich W.',
      FriedrichRole: 'Marketing Manager',
      FriedrichQuote: 'Ich war überrascht, wie schnell es ging. Innerhalb von 2 Wochen hatte ich mehrere Besichtigungstermine und konnte wählen.'
    }
  }

  const t = translations[language]

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 relative">
        <SimpleHeader />
        <div className="flex items-center justify-center min-h-[80vh]">
          <div className="text-white text-xl">{t.verifying}</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 relative">
      {/* Berlin Background */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/Logos/berlin.png"
          alt="Berlin"
          fill
          className="object-cover opacity-20"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900/80 via-blue-900/80 to-slate-900/80"></div>
      </div>

      <SimpleHeader />

      {/* Main Content */}
      <div className="relative z-10 flex items-center justify-center min-h-[80vh] px-4 py-16">
        <div className="text-center text-white max-w-6xl mx-auto">
          {/* Welcome Message */}
          <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
            {t.welcome}
          </h1>
          
          <p className="text-xl mb-4 text-blue-100">
            {t.paymentAccepted}
          </p>
          
          <p className="text-lg mb-16 text-gray-200">
            {t.subscriptionActive}
          </p>

          {/* CTA Button - Centered */}
          <div className="flex justify-center mb-16">
            <Link 
              href="/search"
              className="bg-[#00BFA6] hover:bg-[#00A693] text-white px-8 py-3 rounded-lg font-semibold text-lg transition-colors duration-200"
            >
              {t.startSearching}
            </Link>
          </div>

          {/* Community Section */}
          <div className="mb-8">
            <p className="text-lg text-gray-200 mb-8 text-center">
              {t.communitySubtitle}
            </p>

            {/* Success Stories - All in one row */}
            <div className="flex flex-wrap justify-center gap-4">
              {/* Sarah */}
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20 hover:bg-white/15 transition-all duration-300 max-w-xs">
                <div className="flex items-center mb-3">
                  <div className="w-12 h-12 rounded-full overflow-hidden mr-3 flex-shrink-0">
                    <Image
                      src="/Logos/pers1.png"
                      alt={t.sarah}
                      width={48}
                      height={48}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold text-sm">{t.sarah}</h3>
                    <p className="text-blue-200 text-xs">{t.sarahRole}</p>
                  </div>
                </div>
                <p className="text-gray-300 text-sm">"{t.sarahQuote}"</p>
              </div>

              {/* Anna */}
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20 hover:bg-white/15 transition-all duration-300 max-w-xs">
                <div className="flex items-center mb-3">
                  <div className="w-12 h-12 rounded-full overflow-hidden mr-3 flex-shrink-0">
                    <Image
                      src="/Logos/pers2.png"
                      alt={t.anna}
                      width={48}
                      height={48}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold text-sm">{t.anna}</h3>
                    <p className="text-blue-200 text-xs">{t.annaRole}</p>
                  </div>
                </div>
                <p className="text-gray-300 text-sm">"{t.annaQuote}"</p>
              </div>

              {/* Thomas */}
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20 hover:bg-white/15 transition-all duration-300 max-w-xs">
                <div className="flex items-center mb-3">
                  <div className="w-12 h-12 rounded-full overflow-hidden mr-3 flex-shrink-0">
                    <Image
                      src="/Logos/pers3.png"
                      alt={t.thomas}
                      width={48}
                      height={48}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold text-sm">{t.thomas}</h3>
                    <p className="text-blue-200 text-xs">{t.thomasRole}</p>
                  </div>
                </div>
                <p className="text-gray-300 text-sm">"{t.thomasQuote}"</p>
              </div>

              {/* Maria */}
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20 hover:bg-white/15 transition-all duration-300 max-w-xs">
                <div className="flex items-center mb-3">
                  <div className="w-12 h-12 rounded-full overflow-hidden mr-3 flex-shrink-0">
                    <Image
                      src="/Logos/pers4.png"
                      alt={t.maria}
                      width={48}
                      height={48}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold text-sm">{t.maria}</h3>
                    <p className="text-blue-200 text-xs">{t.mariaRole}</p>
                  </div>
                </div>
                <p className="text-gray-300 text-sm">"{t.mariaQuote}"</p>
              </div>

              {/* David */}
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20 hover:bg-white/15 transition-all duration-300 max-w-xs">
                <div className="flex items-center mb-3">
                  <div className="w-12 h-12 rounded-full overflow-hidden mr-3 flex-shrink-0">
                    <Image
                      src="/Logos/pers5.png"
                      alt={t.david}
                      width={48}
                      height={48}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold text-sm">{t.david}</h3>
                    <p className="text-blue-200 text-xs">{t.davidRole}</p>
                  </div>
                </div>
                <p className="text-gray-300 text-sm">"{t.davidQuote}"</p>
              </div>

              {/* Friedrich */}
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20 hover:bg-white/15 transition-all duration-300 max-w-xs">
                <div className="flex items-center mb-3">
                  <div className="w-12 h-12 rounded-full overflow-hidden mr-3 flex-shrink-0">
                    <Image
                      src="/Logos/pers6.png"
                      alt="Friedrich W."
                      width={48}
                      height={48}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold text-sm">Friedrich W.</h3>
                    <p className="text-blue-200 text-xs">Student, TU Berlin</p>
                  </div>
                </div>
                <p className="text-gray-300 text-sm">"MieteNow hat mir geholfen, meine Traumwohnung in nur 2 Wochen zu finden. Die Benachrichtigungen sind super schnell!"</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
