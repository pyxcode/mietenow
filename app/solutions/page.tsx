'use client'

import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Image from 'next/image'
import { useTranslation } from '@/hooks/useTranslation'
import { useState } from 'react'

export default function SolutionsPage() {
  const { language } = useTranslation()
  const [isOpen, setIsOpen] = useState<number | null>(null)

  const toggleFAQ = (index: number) => {
    setIsOpen(isOpen === index ? null : index)
  }

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
    <div className="min-h-screen">
      <Header />
      
      <main className="min-h-screen">
        {/* Hero Section - Style Landing avec contenu côte à côte */}
        <section className="bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 min-h-screen flex items-center justify-center relative overflow-hidden">
          <div className="container-custom z-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">
              {/* Contenu à gauche */}
              <div className="flex flex-col">
                {/* Title */}
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 md:mb-6 leading-tight">
                  {language === 'de' ? 'Unsere Lösung' : 'Our Solution'}
                </h1>
                
                {/* Subtitle */}
                <p className="text-lg md:text-xl text-gray-300 mb-6 md:mb-8">
                  {language === 'de' 
                    ? 'Der ultimative stressfreie Weg zur Wohnungssuche'
                    : 'Ultimate stress-free home hunting'
                  }
                </p>

                {/* Story Content - Plus petit et plus lisible */}
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 md:p-8 h-[400px] flex flex-col justify-center">
                  <div className="space-y-6 text-xl md:text-2xl text-gray-200 leading-relaxed">
                    <h2 className="text-xl md:text-2xl">
                      {language === 'de' 
                        ? 'Hör auf zu suchen, fang an zu finden.'
                        : 'Stop searching, start finding.'
                      }
                    </h2>
                    <br />
                    
                    <p className="text-xl md:text-2xl">
                      {language === 'de'
                        ? 'Müde vom endlosen Scrollen? Wir scannen 100+ Mietseiten und zentralisieren alle Anzeigen auf einer Plattform.'
                        : 'Tired of endless scrolling? We scan 100+ rental sites and centralize all listings on one platform.'
                      }
                    </p>
                    

                  </div>
                </div>
              </div>

              {/* Photo à droite - Alignée avec le bloc de texte */}
              <div className="flex flex-col">
                {/* Espace pour aligner avec le titre et sous-titre */}
                <div className="h-[143px]"></div>
                
                {/* Image alignée avec le bloc de texte - Échelle réduite */}
                <div className="w-full h-[400px]">
                  <div className="rounded-2xl overflow-hidden shadow-2xl w-full h-full">
                    <Image
                      src="/Logos/gatherplat_optimized.jpg"
                      alt={language === 'de' ? 'Plattform-Aggregation' : 'Platform aggregation'}
                      width={200}
                      height={200}
                      className="w-full h-full object-cover object-center"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Floating Elements */}
          <div className="absolute top-1/4 left-1/4 w-24 h-24 bg-[#00BFA6]/30 rounded-full blur-2xl"></div>
          <div className="absolute bottom-1/4 right-1/4 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
          <div className="absolute top-1/2 right-1/3 w-16 h-16 bg-[#004AAD]/20 rounded-full blur-xl"></div>
        </section>


        {/* Section Pricing - Plus lisible */}
        <section className="bg-white py-16">
          <div className="container-custom">
                <div className="text-center mb-12">
                  <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                    {language === 'de' ? 'Pläne' : 'Plans'}
                  </h2>
                  <p className="text-2xl text-gray-600">
                    {language === 'de' 
                      ? 'Wählen Sie den Plan, der zu Ihnen passt'
                      : 'Choose the plan that fits you'
                    }
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {/* Plan 1 mois */}
              <div className="bg-white border border-gray-200 rounded-2xl p-6 text-center hover:shadow-lg transition-all duration-300">
                <div className="bg-gray-100 rounded-full px-4 py-2 inline-block mb-6">
                  <span className="text-gray-700 font-semibold">1 month</span>
                </div>
                <div className="text-4xl font-bold text-gray-900 mb-2">€29.95</div>
                <div className="text-gray-600 mb-6 text-lg">per month</div>
                <button className="w-full bg-[#00BFA6] hover:bg-[#00A693] text-white px-6 py-3 rounded-lg font-semibold transition-colors duration-200 mb-6">
                  Subscribe now!
                </button>
                <div className="space-y-2 text-gray-600 text-base">
                  <div className="flex items-center justify-center">
                    <span className="text-[#00BFA6] mr-2">✓</span>
                    Priority access
                  </div>
                  <div className="flex items-center justify-center">
                    <span className="text-[#00BFA6] mr-2">✓</span>
                    Customized alerts
                  </div>
                  <div className="flex items-center justify-center">
                    <span className="text-[#00BFA6] mr-2">✓</span>
                    More filters
                  </div>
                  <div className="flex items-center justify-center">
                    <span className="text-[#00BFA6] mr-2">✓</span>
                    Premium support
                  </div>
                </div>
              </div>

              {/* Plan 2 mois - Recommandé */}
              <div className="bg-white border-2 border-[#00BFA6] rounded-2xl p-6 text-center hover:shadow-lg transition-all duration-300 relative">
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="bg-[#00BFA6] text-white px-4 py-1 rounded-full text-sm font-semibold">
                    {language === 'de' ? 'Empfohlen' : 'Recommended'}
                  </span>
                </div>
                <div className="bg-[#00BFA6] rounded-full px-4 py-2 inline-block mb-6">
                  <span className="text-white font-semibold">2 months</span>
                </div>
                <div className="text-4xl font-bold text-gray-900 mb-2">€19.95</div>
                <div className="text-gray-600 mb-6 text-lg">per month</div>
                <button className="w-full bg-[#00BFA6] hover:bg-[#00A693] text-white px-6 py-3 rounded-lg font-semibold transition-colors duration-200 mb-6">
                  Subscribe now!
                </button>
                <div className="space-y-2 text-gray-600 text-base">
                  <div className="flex items-center justify-center">
                    <span className="text-[#00BFA6] mr-2">✓</span>
                    Priority access
                  </div>
                  <div className="flex items-center justify-center">
                    <span className="text-[#00BFA6] mr-2">✓</span>
                    Customized alerts
                  </div>
                  <div className="flex items-center justify-center">
                    <span className="text-[#00BFA6] mr-2">✓</span>
                    More filters
                  </div>
                  <div className="flex items-center justify-center">
                    <span className="text-[#00BFA6] mr-2">✓</span>
                    Premium support
                  </div>
                </div>
              </div>

              {/* Plan 3 mois */}
              <div className="bg-white border border-gray-200 rounded-2xl p-6 text-center hover:shadow-lg transition-all duration-300">
                <div className="bg-gray-100 rounded-full px-4 py-2 inline-block mb-6">
                  <span className="text-gray-700 font-semibold">3 months</span>
                </div>
                <div className="text-4xl font-bold text-gray-900 mb-2">€16.65</div>
                <div className="text-gray-600 mb-6 text-lg">per month</div>
                <button className="w-full bg-[#00BFA6] hover:bg-[#00A693] text-white px-6 py-3 rounded-lg font-semibold transition-colors duration-200 mb-6">
                  Subscribe now!
                </button>
                <div className="space-y-2 text-gray-600 text-base">
                  <div className="flex items-center justify-center">
                    <span className="text-[#00BFA6] mr-2">✓</span>
                    Priority access
                  </div>
                  <div className="flex items-center justify-center">
                    <span className="text-[#00BFA6] mr-2">✓</span>
                    Customized alerts
                  </div>
                  <div className="flex items-center justify-center">
                    <span className="text-[#00BFA6] mr-2">✓</span>
                    More filters
                  </div>
                  <div className="flex items-center justify-center">
                    <span className="text-[#00BFA6] mr-2">✓</span>
                    Premium support
                  </div>
                </div>
              </div>
                </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 py-16">
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
        </section>
      </main>

      <Footer />
    </div>
  )
}