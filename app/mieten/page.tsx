'use client'

import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Image from 'next/image'
import { useTranslation } from '@/hooks/useTranslation'
import { useState } from 'react'

export default function MietenPage() {
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
                  {language === 'de' ? 'Mieten' : 'Rent'}
                </h1>
                
                {/* Subtitle */}
                <p className="text-lg md:text-xl text-gray-300 mb-6 md:mb-8">
                  {language === 'de' 
                    ? 'Finden Sie Ihre perfekte Wohnung in Berlin'
                    : 'Find your perfect apartment in Berlin'
                  }
                </p>

                {/* Search Simulator */}
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 md:p-8 mb-8">
                  <div className="space-y-6">
                    <h2 className="text-2xl md:text-3xl font-bold text-white mb-6">
                      {language === 'de' ? 'Suchen Sie Ihre Wohnung' : 'Search for your apartment'}
                    </h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-white font-semibold mb-2">
                          {language === 'de' ? 'Mindestpreis' : 'Min Price'}
                        </label>
                        <input 
                          type="number" 
                          placeholder={language === 'de' ? '€800' : '€800'}
                          className="w-full px-4 py-3 rounded-lg bg-white/20 border border-white/30 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-[#00BFA6]"
                        />
                      </div>
                      <div>
                        <label className="block text-white font-semibold mb-2">
                          {language === 'de' ? 'Höchstpreis' : 'Max Price'}
                        </label>
                        <input 
                          type="number" 
                          placeholder={language === 'de' ? '€1500' : '€1500'}
                          className="w-full px-4 py-3 rounded-lg bg-white/20 border border-white/30 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-[#00BFA6]"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-white font-semibold mb-2">
                        {language === 'de' ? 'Stadt' : 'City'}
                      </label>
                      <input 
                        type="text" 
                        value="Berlin" 
                        disabled
                        className="w-full px-4 py-3 rounded-lg bg-gray-500/30 border border-gray-400/30 text-gray-300 cursor-not-allowed"
                      />
                    </div>
                    
                    <button className="w-full bg-[#00BFA6] hover:bg-[#00A693] text-white px-6 py-3 rounded-lg font-semibold text-lg transition-colors duration-200">
                      {language === 'de' ? 'Suchen starten' : 'Start searching'}
                    </button>
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
                      src="/Logos/berlin.png"
                      alt={language === 'de' ? 'Berlin Stadtbild' : 'Berlin cityscape'}
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
