'use client'

import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Image from 'next/image'
import { useTranslation } from '@/hooks/useTranslation'
import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'

export default function SolutionsPage() {
  const { language } = useTranslation()
  const { user, loading } = useAuth()
  const router = useRouter()
  const [isOpen, setIsOpen] = useState<number | null>(null)
  const [selectedPlan, setSelectedPlan] = useState<string>('1mois')

  const toggleFAQ = (index: number) => {
    setIsOpen(isOpen === index ? null : index)
  }

  const handlePlanSelection = (plan: string) => {
    setSelectedPlan(plan)
  }

  const handleActivatePlan = () => {
    if (!user) {
      // Si l'utilisateur n'est pas connecté, rediriger vers la création de compte
      router.push('/signup')
      return
    }
    
    // Si l'utilisateur est connecté, rediriger directement vers la page de paiement avec le plan sélectionné
    router.push(`/payment?plan=${selectedPlan}`)
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


        {/* Section Pricing - Nouveau design */}
        <section className="bg-white py-16">
          <div className="container-custom">
            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                {language === 'de' ? 'Wählen Sie den Plan, der zu Ihnen passt' : 'Choose the plan that\'s right for you'}
              </h2>
              <p className="text-xl text-gray-600 mb-8">
                {language === 'de' 
                  ? 'Flexible Pläne, die sich an Ihre Suchzeit anpassen. Jederzeit kündbar.'
                  : 'Flexible plans that adapt to your search timeline. Cancel anytime.'
                }
              </p>
            </div>
            
            <div className="max-w-2xl mx-auto mb-8">
              {/* Plan 2 semaines */}
              <div 
                className={`border rounded-xl p-6 mb-4 cursor-pointer transition-all duration-200 ${
                  selectedPlan === '2sem' 
                    ? 'border-[#00BFA6] bg-white' 
                    : 'border-gray-200 hover:border-gray-300 bg-gray-50'
                }`}
                onClick={() => handlePlanSelection('2sem')}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className={`w-6 h-6 rounded-full border-2 mr-4 flex items-center justify-center ${
                      selectedPlan === '2sem' 
                        ? 'border-[#00BFA6] bg-[#00BFA6]' 
                        : 'border-gray-300'
                    }`}>
                      {selectedPlan === '2sem' && <div className="w-3 h-3 bg-white rounded-full"></div>}
                    </div>
                    <span className="text-gray-900 font-semibold text-lg">
                      {language === 'de' ? '2-Wochen-Plan' : '2-week plan'}
                    </span>
                  </div>
                  <span className="text-gray-900 font-bold text-2xl">€26</span>
                </div>
              </div>
              
              {/* Plan 1 mois - Recommandé */}
              <div 
                className={`border rounded-xl p-6 mb-4 cursor-pointer transition-all duration-200 ${
                  selectedPlan === '1mois' 
                    ? 'border-[#00BFA6] bg-white' 
                    : 'border-gray-200 hover:border-gray-300 bg-gray-50'
                }`}
                onClick={() => handlePlanSelection('1mois')}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className={`w-6 h-6 rounded-full border-2 mr-4 flex items-center justify-center ${
                      selectedPlan === '1mois' 
                        ? 'border-[#00BFA6] bg-[#00BFA6]' 
                        : 'border-gray-300'
                    }`}>
                      {selectedPlan === '1mois' && <div className="w-3 h-3 bg-white rounded-full"></div>}
                    </div>
                    <div className="flex items-center">
                      <span className="text-gray-900 font-semibold text-lg mr-3">
                        {language === 'de' ? '1-Monats-Plan' : '1-month plan'}
                      </span>
                      <span className="bg-[#00BFA6] text-white text-sm px-3 py-1 rounded-full font-medium">
                        {language === 'de' ? 'Beliebteste' : 'Most Popular'}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-green-600 text-base font-medium">
                      {language === 'de' ? '33% sparen' : 'Save 33%'}
                    </div>
                    <span className="text-gray-900 font-bold text-2xl">€34</span>
                  </div>
                </div>
              </div>
              
              {/* Plan 3 mois */}
              <div 
                className={`border rounded-xl p-6 mb-4 cursor-pointer transition-all duration-200 ${
                  selectedPlan === '3mois' 
                    ? 'border-[#00BFA6] bg-white' 
                    : 'border-gray-200 hover:border-gray-300 bg-gray-50'
                }`}
                onClick={() => handlePlanSelection('3mois')}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className={`w-6 h-6 rounded-full border-2 mr-4 flex items-center justify-center ${
                      selectedPlan === '3mois' 
                        ? 'border-[#00BFA6] bg-[#00BFA6]' 
                        : 'border-gray-300'
                    }`}>
                      {selectedPlan === '3mois' && <div className="w-3 h-3 bg-white rounded-full"></div>}
                    </div>
                    <span className="text-gray-900 font-semibold text-lg">
                      {language === 'de' ? '3-Monats-Plan' : '3-month plan'}
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="text-green-600 text-base font-medium">
                      {language === 'de' ? '44% sparen' : 'Save 44%'}
                    </div>
                    <span className="text-gray-900 font-bold text-2xl">€68</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="text-center mb-6 relative z-10">
              <div className="flex justify-center">
                <button 
                  onClick={handleActivatePlan}
                  className="w-full max-w-md bg-[#00BFA6] hover:bg-[#00A693] text-white py-6 px-8 rounded-lg font-bold text-lg transition-colors duration-200 cursor-pointer relative z-20 block" 
                  style={{minHeight: '60px'}}
                >
                  {language === 'de' ? 'Plan jetzt aktivieren' : 'Activate Your Plan Now'}
                </button>
              </div>
            </div>
            
            <div className="text-center relative z-5">
              <div className="flex items-center justify-center mb-1">
                <span className="text-gray-900 font-medium mr-2 text-sm">
                  {language === 'de' ? 'Ausgezeichnet' : 'Excellent'}
                </span>
                <div className="flex items-center">
                  <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                  </svg>
                  <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                  </svg>
                  <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                  </svg>
                  <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                  </svg>
                  <svg className="w-4 h-4 text-blue-300" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                  </svg>
                </div>
              </div>
              <p className="text-gray-600 text-xs">
                {language === 'de' ? '350+ zufriedene Kunden' : '350+ satisfied customers'}
              </p>
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