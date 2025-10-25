'use client'

import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Image from 'next/image'
import { useTranslation } from '@/hooks/useTranslation'
import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'

export default function SolutionsPageContent() {
  const { language } = useTranslation()
  const { user, loading } = useAuth()
  const router = useRouter()
  const [isOpen, setIsOpen] = useState<number | null>(null)
  const [selectedPlan, setSelectedPlan] = useState<string>('1mois')

  const toggleFAQ = (index: number) => {
    setIsOpen(isOpen === index ? null : index)
  }

  const plans = [
    {
      id: '1mois',
      name: language === 'de' ? '1 Monat' : '1 Month',
      price: language === 'de' ? '29€' : '29€',
      originalPrice: language === 'de' ? '39€' : '39€',
      description: language === 'de' ? 'Perfekt zum Testen' : 'Perfect for testing',
      features: [
        language === 'de' ? 'Unbegrenzte Suchanfragen' : 'Unlimited searches',
        language === 'de' ? 'Echtzeit-Benachrichtigungen' : 'Real-time notifications',
        language === 'de' ? 'Erweiterte Filter' : 'Advanced filters',
        language === 'de' ? 'Prioritäts-Support' : 'Priority support'
      ]
    },
    {
      id: '3mois',
      name: language === 'de' ? '3 Monate' : '3 Months',
      price: language === 'de' ? '69€' : '69€',
      originalPrice: language === 'de' ? '117€' : '117€',
      description: language === 'de' ? 'Beliebteste Option' : 'Most popular',
      features: [
        language === 'de' ? 'Alles aus 1 Monat' : 'Everything from 1 month',
        language === 'de' ? 'Exklusive Berlin-Insider-Tipps' : 'Exclusive Berlin insider tips',
        language === 'de' ? 'Persönlicher Wohnungsberater' : 'Personal apartment consultant',
        language === 'de' ? 'Garantierte Vermittlung' : 'Guaranteed placement'
      ],
      popular: true
    },
    {
      id: '6mois',
      name: language === 'de' ? '6 Monate' : '6 Months',
      price: language === 'de' ? '99€' : '99€',
      originalPrice: language === 'de' ? '234€' : '234€',
      description: language === 'de' ? 'Beste Wert' : 'Best value',
      features: [
        language === 'de' ? 'Alles aus 3 Monaten' : 'Everything from 3 months',
        language === 'de' ? 'VIP-Status' : 'VIP status',
        language === 'de' ? 'Erstzugriff auf neue Listings' : 'First access to new listings',
        language === 'de' ? '24/7 Premium-Support' : '24/7 premium support'
      ]
    }
  ]

  const faqs = [
    {
      question: language === 'de' ? 'Wie funktioniert MieteNow?' : 'How does MieteNow work?',
      answer: language === 'de' 
        ? 'MieteNow durchsucht automatisch alle großen Immobilienportale in Berlin und benachrichtigt Sie sofort, wenn eine Wohnung Ihren Kriterien entspricht. Sie müssen nicht mehr manuell suchen!'
        : 'MieteNow automatically searches all major real estate portals in Berlin and notifies you immediately when an apartment matches your criteria. No more manual searching!'
    },
    {
      question: language === 'de' ? 'Ist MieteNow wirklich effektiv?' : 'Is MieteNow really effective?',
      answer: language === 'de'
        ? 'Ja! Unsere Nutzer finden durchschnittlich 3x schneller eine Wohnung als mit traditionellen Methoden. Wir haben bereits über 15.000 erfolgreiche Vermittlungen.'
        : 'Yes! Our users find apartments 3x faster on average than with traditional methods. We have already facilitated over 15,000 successful placements.'
    },
    {
      question: language === 'de' ? 'Kann ich jederzeit kündigen?' : 'Can I cancel anytime?',
      answer: language === 'de'
        ? 'Absolut! Sie können Ihr Abonnement jederzeit kündigen. Keine versteckten Gebühren, keine langfristigen Verpflichtungen.'
        : 'Absolutely! You can cancel your subscription anytime. No hidden fees, no long-term commitments.'
    },
    {
      question: language === 'de' ? 'Wie sicher sind meine Daten?' : 'How secure is my data?',
      answer: language === 'de'
        ? 'Ihre Daten sind bei uns in sicheren Händen. Wir verwenden Bank-Level-Verschlüsselung und teilen niemals Ihre persönlichen Informationen mit Dritten.'
        : 'Your data is safe with us. We use bank-level encryption and never share your personal information with third parties.'
    }
  ]

  const handleGetStarted = () => {
    if (user) {
      router.push('/criteria')
    } else {
      router.push('/signup')
    }
  }

  return (
    <div className="min-h-screen">
      <Header />

      <main className="min-h-screen">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 min-h-screen flex items-center justify-center relative overflow-hidden">
          <div className="container-custom z-10 text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 md:mb-6 leading-tight">
              {language === 'de' ? 'Finde deine Traumwohnung in Berlin' : 'Find Your Dream Apartment in Berlin'}
            </h1>
            <p className="text-lg md:text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
              {language === 'de'
                ? 'MieteNow durchsucht automatisch alle Immobilienportale und benachrichtigt dich sofort, wenn eine Wohnung deinen Kriterien entspricht.'
                : 'MieteNow automatically searches all real estate portals and notifies you immediately when an apartment matches your criteria.'
              }
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={handleGetStarted}
                className="bg-blue-600 text-white px-8 py-4 rounded-lg hover:bg-blue-700 transition-colors text-lg font-semibold"
              >
                {language === 'de' ? 'Jetzt starten' : 'Get Started Now'}
              </button>
              <button
                onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })}
                className="bg-transparent border-2 border-white text-white px-8 py-4 rounded-lg hover:bg-white hover:text-blue-900 transition-colors text-lg font-semibold"
              >
                {language === 'de' ? 'Preise ansehen' : 'View Pricing'}
              </button>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="py-20 bg-gray-50">
          <div className="container-custom">
            <div className="max-w-6xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">
                {language === 'de' ? 'Wähle deinen Plan' : 'Choose Your Plan'}
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {plans.map((plan) => (
                  <div
                    key={plan.id}
                    className={`bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-shadow ${
                      plan.popular ? 'ring-2 ring-blue-600 relative' : ''
                    }`}
                  >
                    {plan.popular && (
                      <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                        <span className="bg-blue-600 text-white px-4 py-2 rounded-full text-sm font-semibold">
                          {language === 'de' ? 'Beliebteste' : 'Most Popular'}
                        </span>
                      </div>
                    )}
                    
                    <div className="text-center mb-6">
                      <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                      <p className="text-gray-600 mb-4">{plan.description}</p>
                      <div className="flex items-center justify-center gap-2 mb-4">
                        <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                        <span className="text-lg text-gray-500 line-through">{plan.originalPrice}</span>
                      </div>
                    </div>

                    <ul className="space-y-3 mb-8">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-center">
                          <svg className="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          <span className="text-gray-700">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    <button
                      onClick={() => setSelectedPlan(plan.id)}
                      className={`w-full py-3 px-6 rounded-lg font-semibold transition-colors ${
                        selectedPlan === plan.id
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {language === 'de' ? 'Auswählen' : 'Select'}
                    </button>
                  </div>
                ))}
              </div>

              <div className="text-center mt-12">
                <button
                  onClick={handleGetStarted}
                  className="bg-blue-600 text-white px-12 py-4 rounded-lg hover:bg-blue-700 transition-colors text-xl font-semibold"
                >
                  {language === 'de' ? 'Jetzt loslegen' : 'Get Started Now'}
                </button>
                <p className="text-gray-600 mt-4">
                  {language === 'de' ? 'Keine Kreditkarte erforderlich • Jederzeit kündbar' : 'No credit card required • Cancel anytime'}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-20 bg-white">
          <div className="container-custom">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">
                {language === 'de' ? 'Häufig gestellte Fragen' : 'Frequently Asked Questions'}
              </h2>

              <div className="space-y-4">
                {faqs.map((faq, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg">
                    <button
                      onClick={() => toggleFAQ(index)}
                      className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-gray-50 transition-colors"
                    >
                      <span className="font-semibold text-gray-900">{faq.question}</span>
                      <svg
                        className={`w-5 h-5 text-gray-500 transition-transform ${
                          isOpen === index ? 'rotate-180' : ''
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    {isOpen === index && (
                      <div className="px-6 pb-4">
                        <p className="text-gray-700">{faq.answer}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-blue-600">
          <div className="container-custom">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-3xl font-bold text-white mb-6">
                {language === 'de' ? 'Bereit, deine Traumwohnung zu finden?' : 'Ready to find your dream apartment?'}
              </h2>
              <p className="text-xl text-blue-100 mb-8">
                {language === 'de'
                  ? 'Schließe dich über 10.000 zufriedenen Nutzern an, die bereits ihre Traumwohnung gefunden haben.'
                  : 'Join over 10,000 satisfied users who have already found their dream apartment.'
                }
              </p>
              <button
                onClick={handleGetStarted}
                className="bg-white text-blue-600 px-12 py-4 rounded-lg hover:bg-gray-100 transition-colors text-xl font-semibold"
              >
                {language === 'de' ? 'Jetzt kostenlos starten' : 'Start Free Now'}
              </button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
