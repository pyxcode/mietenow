'use client'

import { useState } from 'react'
import { useLanguage } from '@/contexts/LanguageContext'
import { ChevronLeft, Check, Star, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import SimpleHeader from '@/components/SimpleHeader'
import Footer from '@/components/Footer'
import PaymentForm from '@/components/PaymentForm'

export const dynamic = 'force-dynamic'

export default function PaymentPage() {
  const { language } = useLanguage()
  const [selectedPlan, setSelectedPlan] = useState('1-month')
  const [isOpen, setIsOpen] = useState<number | null>(null)
  const [showPaymentForm, setShowPaymentForm] = useState(false)
  const [paymentError, setPaymentError] = useState<string | null>(null)

  const toggleFAQ = (index: number) => {
    setIsOpen(isOpen === index ? null : index)
  }

  const handlePayment = () => {
    setShowPaymentForm(true)
    setPaymentError(null)
  }

  const handlePaymentSuccess = () => {
    window.location.href = `/payment/success?plan=${selectedPlan}`
  }

  const handlePaymentError = (error: string) => {
    setPaymentError(error)
    setShowPaymentForm(false)
  }

  const plans = [
    {
      id: '2-week',
      name: language === 'de' ? '2-Wochen-Plan' : '2-week plan',
      price: '€26',
      originalPrice: null,
      discount: null,
      popular: false
    },
    {
      id: '1-month',
      name: language === 'de' ? '1-Monats-Plan' : '1-month plan',
      price: '€34',
      originalPrice: '€51',
      discount: language === 'de' ? 'Spare 33%' : 'Save 33%',
      popular: true
    },
    {
      id: '3-month',
      name: language === 'de' ? '3-Monats-Plan' : '3-month plan',
      price: '€68',
      originalPrice: '€120',
      discount: language === 'de' ? 'Spare 44%' : 'Save 44%',
      popular: false
    }
  ]

  const faqs = [
    {
      question: {
        de: "Wie lange dauert es, eine neue Wohnung zu finden?",
        en: "How long will it take to find a new home?"
      },
      answer: {
        de: "Wie schnell Sie eine Wohnung finden, hängt von Ihrer Situation und Ihrer Geschwindigkeit ab. Die meisten Nutzer finden eine Mietwohnung innerhalb von 7 Wochen, aber wenn Sie in einer beliebten Stadt mit einem kleineren Budget suchen, könnte es etwas länger dauern. Deshalb lohnt es sich, früh zu beginnen und schnell zu bewerben.",
        en: "How fast you'll find a home depends on your situation and how fast you are. Most users find a rental within 7 weeks, but if you're searching in a popular city on a smaller budget, it might take a bit longer. That's why it pays to start early and apply fast."
      }
    },
    {
      question: {
        de: "Vermieten Sie selbst Häuser?",
        en: "Do you rent out houses yourself?"
      },
      answer: {
        de: "Nein — und genau das ist der Punkt. Mit Tausenden von Immobilienbüros in ganz Deutschland brauchen wir nicht noch eines mehr zu sein. Tatsächlich ist der Versuch, alle ihre Anzeigen im Auge zu behalten, genau der Grund, warum wir mietenow gebaut haben. Anstatt Anzeigen zu verwalten, verfolgen wir sie alle für Sie.",
        en: "Nope — and that's the whole point. With thousands of real estate offices across Germany, we don't need to be one more. In fact, trying to keep track of all their listings is exactly why we built mietenow. Instead of managing listings, we track them all for you."
      }
    },
    {
      question: {
        de: "Warum verlangt mietenow eine Gebühr?",
        en: "Why does mietenow charge a fee?"
      },
      answer: {
        de: "mietenow ist darauf ausgelegt, Ihnen einen echten Vorteil auf einem hochkompetitiven Mietmarkt zu verschaffen, indem es Ihnen hilft, schneller eine neue Wohnung zu finden. Um diesen Service zu liefern, investieren wir kontinuierlich in fortschrittliche Technologie, Echtzeitüberwachung und Support — all dies erfordert laufende Ressourcen. Darüber hinaus stellen wir durch die Erhebung einer Gebühr sicher, dass die Plattform effektiv bleibt und exklusiv für ernsthafte Mietinteressenten ist.",
        en: "mietenow is designed to give you a real advantage in a highly competitive rental market by helping you find a new home faster. To deliver this service, we continuously invest in advanced technology, real-time monitoring, and support — all of which require ongoing resources. In addition, by charging a fee, we ensure the platform remains effective and exclusive to serious rental seekers."
      }
    },
    {
      question: {
        de: "Kann ich ein Zimmer über mietenow mieten?",
        en: "Can I rent a room via mietenow?"
      },
      answer: {
        de: "Ja. Zusätzlich zu ganzen Wohnungen und Häusern überwacht mietenow auch Anzeigen für einzelne Zimmer in Wohngemeinschaften und Häusern in ganz Deutschland. Setzen Sie einfach Ihre Präferenzen entsprechend, und Sie erhalten Benachrichtigungen für Zimmervermietungen, die Ihren Kriterien entsprechen.",
        en: "Yes. In addition to full apartments and houses, mietenow also monitors listings for individual rooms in shared flats and houses across Germany. Simply set your preferences accordingly, and you'll receive notifications for room rentals that match your criteria."
      }
    },
    {
      question: {
        de: "Was ist, wenn ich nicht zufrieden bin?",
        en: "What if I'm not satisfied?"
      },
      answer: {
        de: "Keine Sorge! Sie können Ihr Abonnement jederzeit in Ihren Kontoeinstellungen kündigen. Wenn Sie mit unserem Service nicht vollständig zufrieden sind, kontaktieren Sie einfach unser Support-Team, um eine Rückerstattung zu beantragen. Wir sind bestrebt, sicherzustellen, dass Sie die beste Erfahrung haben.",
        en: "No worries! You can cancel your subscription anytime from your account settings. If you're not completely satisfied with our service, simply contact our support team to request a refund. We're committed to ensuring you have the best experience possible."
      }
    },
    {
      question: {
        de: "Ich habe eine andere Frage...",
        en: "I have another question..."
      },
      answer: {
        de: "Wenn Sie weitere Fragen haben, zögern Sie nicht, uns über Chat oder E-Mail unter support@mietenow.de zu kontaktieren. Wir helfen Ihnen gerne weiter!",
        en: "If you have any additional questions, feel free to reach out to us via chat or email at support@mietenow.de. We're always happy to assist!"
      }
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 relative">
      <SimpleHeader />

      {/* Main Content */}
      <div className="flex items-center justify-center px-4 py-16">
        <div className="max-w-6xl w-full">
          {/* Success Stories Section */}
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-12 leading-tight">
              {language === 'de' 
                ? 'Dein nächstes Zuhause wartet!'
                : 'Your next home is waiting!'
              }
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-16">
              {/* Success Story 1 - Centered format */}
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
                <div className="w-24 h-24 rounded-full overflow-hidden border-3 border-[#00BFA6] mx-auto mb-3">
                  <Image
                    src="/Logos/pers1.png"
                    alt="Sarah M."
                    width={96}
                    height={96}
                    className="w-full h-full object-cover"
                  />
                </div>
                <h3 className="text-white font-bold text-base mb-1">Sarah M.</h3>
                <p className="text-blue-100 text-xs mb-2">Student, TU Berlin</p>
                <p className="text-gray-300 text-sm italic">
                  "{language === 'de' 
                    ? 'Alle Anzeigen an einem Ort - das war noch nie da! MieteNow hat mir Stunden täglich gespart.'
                    : 'All listings in one place - never seen that before! MieteNow saved me hours daily.'
                  }"
                </p>
              </div>

              {/* Success Story 2 - Centered format */}
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
                <div className="w-24 h-24 rounded-full overflow-hidden border-3 border-[#00BFA6] mx-auto mb-3">
                  <Image
                    src="/Logos/pers2.png"
                    alt="Anna K."
                    width={96}
                    height={96}
                    className="w-full h-full object-cover"
                  />
                </div>
                <h3 className="text-white font-bold text-base mb-1">Anna K.</h3>
                <p className="text-blue-100 text-xs mb-2">Chef, Restaurant Amarone</p>
                <p className="text-gray-300 text-sm italic">
                  "{language === 'de' 
                    ? 'Als Koch arbeite ich unregelmäßig - MieteNow hat mir geholfen, die besten Angebote zu finden, auch wenn ich beschäftigt bin.'
                    : 'As a chef I work irregular hours - MieteNow helped me find the best deals even when I\'m busy.'
                  }"
                </p>
              </div>

              {/* Success Story 3 - Centered format */}
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
                <div className="w-24 h-24 rounded-full overflow-hidden border-3 border-[#00BFA6] mx-auto mb-3">
                  <Image
                    src="/Logos/pers3.png"
                    alt="Thomas R."
                    width={96}
                    height={96}
                    className="w-full h-full object-cover"
                  />
                </div>
                <h3 className="text-white font-bold text-base mb-1">Thomas R.</h3>
                <p className="text-blue-100 text-xs mb-2">Business Development, University of Applied Sciences</p>
                <p className="text-gray-300 text-sm italic">
                  "{language === 'de' 
                    ? 'Die Software ist genial! Statt 20 Websites zu checken, bekomme ich alles in einer App.'
                    : 'The software is brilliant! Instead of checking 20 websites, I get everything in one app.'
                  }"
                </p>
              </div>
            </div>
          </div>

          {/* Comparison Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Manual Search */}
            <div className="bg-red-500/10 backdrop-blur-sm rounded-xl p-6 border border-red-500/20">
              <h2 className="text-2xl font-bold text-white mb-6 text-center">
                {language === 'de' ? 'Manuelle Suche' : 'Manual search'}
              </h2>
              <div className="space-y-4">
                {[
                  language === 'de' ? 'Verpassen perfekte Immobilien durch verspätete Bewerbungen' : 'Missing out on perfect properties due to late applications',
                  language === 'de' ? 'Tage mit dem Aktualisieren Dutzender Mietwebsites verschwenden' : 'Wasting days refreshing dozens of rental websites',
                  language === 'de' ? 'Umgang mit nicht reagierenden Immobilienverwaltern' : 'Dealing with unresponsive property managers',
                  language === 'de' ? 'Begrenzter Zugang zu exklusiven Mietangeboten' : 'Limited access to exclusive rental listings'
                ].map((item, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center mt-0.5 flex-shrink-0">
                      <span className="text-white text-xs font-bold">✗</span>
                    </div>
                    <p className="text-gray-200 text-sm leading-relaxed">{item}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Search with MieteNow */}
            <div className="bg-gradient-to-br from-[#00BFA6]/30 to-[#00A693]/20 backdrop-blur-sm rounded-xl p-6 border-2 border-[#00BFA6]">
              <h2 className="text-2xl font-bold text-white mb-6 text-center">
                {language === 'de' ? 'Suche mit MieteNow' : 'Search with MieteNow'}
              </h2>
              <div className="space-y-4">
                {[
                  language === 'de' ? 'Erstbewerber-Vorteil mit sofortigem Benachrichtigungssystem' : 'First-mover advantage with instant notification system',
                  language === 'de' ? 'Echtzeit-Alerts von über 1000+ vertrauenswürdigen Mietquellen' : 'Real-time alerts from over 1000+ trusted rental sources',
                  language === 'de' ? 'Prioritätsbewerbungsstatus bei Partneragenturen' : 'Priority application status with partner agencies',
                  language === 'de' ? 'Zugang zu exklusiven Immobilien, die nicht öffentlich gelistet sind' : 'Access to exclusive properties not listed publicly'
                ].map((item, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className="w-5 h-5 bg-[#00BFA6] rounded-full flex items-center justify-center mt-0.5 flex-shrink-0">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                    <p className="text-white text-sm leading-relaxed font-medium">{item}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Pricing Plans Section - Fond blanc */}
      <div className="bg-white py-16">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              {language === 'de' 
                ? 'Wähle den Plan, der zu dir passt'
                : 'Choose the plan that\'s right for you'
              }
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              {language === 'de' 
                ? 'Flexible Pläne, die sich an deine Suchzeit anpassen. Jederzeit kündbar.'
                : 'Flexible plans that adapt to your search timeline. Cancel anytime.'
              }
            </p>
          </div>

          <div className="max-w-2xl mx-auto mb-8">
            {/* Plan 2-week */}
            <div className={`bg-gray-50 border rounded-xl p-6 mb-4 cursor-pointer transition-all duration-200 ${
              selectedPlan === '2-week' ? 'border-[#00BFA6] bg-white' : 'border-gray-200 hover:border-gray-300'
            }`} onClick={() => setSelectedPlan('2-week')}>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className={`w-6 h-6 rounded-full border-2 mr-4 flex items-center justify-center ${
                    selectedPlan === '2-week' ? 'border-[#00BFA6] bg-[#00BFA6]' : 'border-gray-300'
                  }`}>
                    {selectedPlan === '2-week' && (
                      <div className="w-3 h-3 bg-white rounded-full"></div>
                    )}
                  </div>
                  <span className="text-gray-900 font-semibold text-lg">2-week plan</span>
                </div>
                <span className="text-gray-900 font-bold text-2xl">€26</span>
              </div>
            </div>

            {/* Plan 1-month */}
            <div className={`bg-gray-50 border rounded-xl p-6 mb-4 cursor-pointer transition-all duration-200 ${
              selectedPlan === '1-month' ? 'border-[#00BFA6] bg-white' : 'border-gray-200 hover:border-gray-300'
            }`} onClick={() => setSelectedPlan('1-month')}>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className={`w-6 h-6 rounded-full border-2 mr-4 flex items-center justify-center ${
                    selectedPlan === '1-month' ? 'border-[#00BFA6] bg-[#00BFA6]' : 'border-gray-300'
                  }`}>
                    {selectedPlan === '1-month' && (
                      <div className="w-3 h-3 bg-white rounded-full"></div>
                    )}
                  </div>
                  <div className="flex items-center">
                    <span className="text-gray-900 font-semibold text-lg mr-3">1-month plan</span>
                    <span className="bg-[#00BFA6] text-white text-sm px-3 py-1 rounded-full font-medium">
                      {language === 'de' ? 'Beliebt' : 'Most Popular'}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-green-600 text-base font-medium">Save 33%</div>
                  <span className="text-gray-900 font-bold text-2xl">€34</span>
                </div>
              </div>
            </div>

            {/* Plan 3-month */}
            <div className={`bg-gray-50 border rounded-xl p-6 mb-4 cursor-pointer transition-all duration-200 ${
              selectedPlan === '3-month' ? 'border-[#00BFA6] bg-white' : 'border-gray-200 hover:border-gray-300'
            }`} onClick={() => setSelectedPlan('3-month')}>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className={`w-6 h-6 rounded-full border-2 mr-4 flex items-center justify-center ${
                    selectedPlan === '3-month' ? 'border-[#00BFA6] bg-[#00BFA6]' : 'border-gray-300'
                  }`}>
                    {selectedPlan === '3-month' && (
                      <div className="w-3 h-3 bg-white rounded-full"></div>
                    )}
                  </div>
                  <span className="text-gray-900 font-semibold text-lg">3-month plan</span>
                </div>
                <div className="text-right">
                  <div className="text-green-600 text-base font-medium">Save 44%</div>
                  <span className="text-gray-900 font-bold text-2xl">€68</span>
                </div>
              </div>
            </div>
          </div>

          {/* CTA Button ou Formulaire de Paiement */}
          <div className="text-center mb-6 relative z-10">
            {!showPaymentForm ? (
              <div className="flex justify-center">
                <button 
                  onClick={handlePayment}
                  className="w-full max-w-md bg-[#00BFA6] hover:bg-[#00A693] text-white py-6 px-8 rounded-lg font-bold text-lg transition-colors duration-200 cursor-pointer relative z-20 block"
                  style={{ minHeight: '60px' }}
                >
                  {language === 'de' ? 'Jetzt Plan aktivieren' : 'Activate Your Plan Now'}
                </button>
              </div>
            ) : (
              <div className="max-w-md mx-auto relative z-20">
                <PaymentForm
                  selectedPlan={selectedPlan}
                  onSuccess={handlePaymentSuccess}
                  onError={handlePaymentError}
                />
                {paymentError && (
                  <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                    {paymentError}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Customer Satisfaction */}
          <div className="text-center relative z-5">
            <div className="flex items-center justify-center mb-1">
              <span className="text-gray-900 font-medium mr-2 text-sm">
                {language === 'de' ? 'Ausgezeichnet' : 'Excellent'}
              </span>
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className={`w-4 h-4 ${i < 4 ? 'text-blue-600' : i === 4 ? 'text-blue-300' : 'text-gray-300'}`} fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
            </div>
            <p className="text-gray-600 text-xs">
              350+ {language === 'de' ? 'zufriedene Kunden' : 'satisfied customers'}
            </p>
          </div>
        </div>
      </div>

      {/* FAQ Section - Fond bleu */}
      <div className="bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 py-16 relative">
        {/* Background Image - Only on FAQ section */}
        <div className="absolute -bottom-[300px] left-0 right-0 z-5">
          <img 
            src="/Logos/berlin.png" 
            alt="Berlin" 
            className="w-full h-auto opacity-20"
          />
        </div>
        
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              {language === 'de' ? 'Häufig gestellte Fragen' : 'Frequently Asked Questions'}
            </h2>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl overflow-hidden">
              {faqs.map((faq, index) => (
                <div key={index} className="border-b border-white/10 last:border-b-0">
                  <button
                    onClick={() => toggleFAQ(index)}
                    className="w-full px-6 py-6 text-left flex justify-between items-center hover:bg-white/5 transition-colors duration-200"
                  >
                    <h3 className="text-lg md:text-xl font-semibold text-white pr-4">
                      {language === 'de' ? faq.question.de : faq.question.en}
                    </h3>
                    <div className="flex-shrink-0">
                      <svg
                        className={`w-5 h-5 text-white transition-transform duration-200 ${
                          isOpen === index ? 'rotate-180' : ''
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </div>
                  </button>
                  {isOpen === index && (
                    <div className="px-6 pb-6">
                      <p className="text-gray-300 text-base md:text-lg leading-relaxed">
                        {language === 'de' ? faq.answer.de : faq.answer.en}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  )
}