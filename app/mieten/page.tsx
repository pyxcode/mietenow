'use client'

export const dynamic = 'force-dynamic'

import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { Search } from 'lucide-react'
import { useTranslation } from '@/hooks/useTranslation'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import VideoSection from '@/components/VideoSection'

export default function MietenPage() {
  const { t, language } = useTranslation()
  const router = useRouter()
  const [formData, setFormData] = useState({
    minPrice: '500',
    maxPrice: '1500',
    type: 'Any'
  })
  const [isOpen, setIsOpen] = useState<number | null>(null)

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSearch = async () => {
    // Rediriger vers criteria avec les prix min/max en paramètres URL
    const params = new URLSearchParams({
      minPrice: formData.minPrice,
      maxPrice: formData.maxPrice,
      type: formData.type
    })
    router.push(`/criteria?${params.toString()}`)
  }

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
        de: "Wenn Sie weitere Fragen haben, zögern Sie nicht, uns über unseren <a href='#' onclick='window.$crisp.push([\"do\", \"chat:open\"])' class='text-[#00BFA6] hover:underline cursor-pointer'>Live-Chat</a> zu kontaktieren. Wir helfen Ihnen gerne weiter!",
        en: "If you have any additional questions, feel free to reach out to us via our <a href='#' onclick='window.$crisp.push([\"do\", \"chat:open\"])' class='text-[#00BFA6] hover:underline cursor-pointer'>Live Chat</a>. We're always happy to assist!"
      }
    }
  ]

  return (
    <div className="min-h-screen">
      <Header />
      
      <main className="min-h-screen">
        {/* Hero Section - Style Landing avec module de recherche */}
        <section className="bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 min-h-screen flex flex-col items-center justify-center relative overflow-hidden">

          {/* Main Content */}
          <div className="text-center z-10 max-w-4xl mx-auto px-6">
            {/* Title */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 md:mb-6 leading-tight">
              {language === 'de' ? 'Nicht mehr suchen, jetzt finden' : 'Find Your Apartment'}
            </h1>
            
            {/* Subtitle */}
            <p className="text-lg md:text-xl text-gray-300 mb-6 md:mb-8">
              {language === 'de' 
                ? 'Der kürzeste Weg zu Ihrer nächsten Wohnung in Berlin'
                : 'The shortest way to your next apartment in Berlin'
              }
            </p>

            {/* Search Bar Complete - Berlin Only */}
            <div className="bg-white rounded-2xl shadow-xl p-6 max-w-3xl mx-auto mb-16">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Prix Min */}
                <div>
                  <label className="block text-sm font-medium text-[#6B7280] mb-2 text-left">
                    {language === 'de' ? 'Mindestpreis' : 'Min Price'}
                  </label>
                  <input
                    type="number"
                    placeholder="500"
                    value={formData.minPrice}
                    onChange={(e) => handleInputChange('minPrice', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#004AAD] focus:border-transparent text-gray-900"
                  />
                </div>

                {/* Prix Max */}
                <div>
                  <label className="block text-sm font-medium text-[#6B7280] mb-2 text-left">
                    {language === 'de' ? 'Höchstpreis' : 'Max Price'}
                  </label>
                  <input
                    type="number"
                    placeholder="1500"
                    value={formData.maxPrice}
                    onChange={(e) => handleInputChange('maxPrice', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#004AAD] focus:border-transparent text-gray-900"
                  />
                </div>

                {/* Bouton Recherche */}
                <div className="flex items-end">
                  <button 
                    onClick={handleSearch}
                    className="w-full bg-[#004AAD] hover:bg-[#002E73] text-white px-6 py-3 rounded-lg text-lg font-semibold transition-colors duration-200 flex items-center justify-center gap-2"
                  >
                    <Search className="w-5 h-5" />
                    {language === 'de' ? 'Suchen' : 'Search'}
                  </button>
                </div>
              </div>
            </div>

            {/* Additional Info */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 md:p-8 max-w-2xl mx-auto">
              <div className="space-y-4 text-lg md:text-xl text-gray-200 leading-relaxed">
                <p>
                  {language === 'de' 
                    ? 'Durchsuchen Sie Tausende von Anzeigen in Deutschland'
                    : 'Search through thousands of listings in Germany'
                  }
                </p>
                
                <p className="text-[#00BFA6] font-semibold">
                  {language === 'de'
                    ? 'Schnell, einfach und effizient'
                    : 'Fast, easy and efficient'
                  }
                </p>
                
                <p>
                  {language === 'de'
                    ? 'Unsere Plattform aggregiert Anzeigen von über 100 Mietseiten und zeigt Ihnen die besten Angebote in Berlin.'
                    : 'Our platform aggregates listings from over 100 rental sites and shows you the best offers in Berlin.'
                  }
                </p>
              </div>
            </div>
          </div>

          {/* Berlin Image at very bottom */}
          <div className="absolute -bottom-[340px] left-0 right-0 z-5">
            <img 
              src="/Logos/berlin.png" 
              alt="Berlin" 
              className="w-full h-auto opacity-10"
            />
          </div>

          {/* Floating Elements */}
          <div className="absolute top-1/4 left-1/4 w-24 h-24 bg-[#00BFA6]/30 rounded-full blur-2xl"></div>
          <div className="absolute bottom-1/4 right-1/4 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
          <div className="absolute top-1/2 right-1/3 w-16 h-16 bg-[#004AAD]/20 rounded-full blur-xl"></div>
        </section>

        {/* Video Section - Après le Hero */}
        <VideoSection 
          className="bg-white"
        />

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
                        <p 
                          className="text-gray-300 text-base md:text-lg leading-relaxed"
                          dangerouslySetInnerHTML={{
                            __html: language === 'de' ? faq.answer.de : faq.answer.en
                          }}
                        />
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