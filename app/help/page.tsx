'use client'

import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { HelpCircle, MessageCircle, ChevronDown, ChevronUp } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from '@/hooks/useTranslation'

export default function HelpPage() {
  const { t, language } = useTranslation()
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  const faqCategories = [
    {
      title: language === 'de' ? 'Erste Schritte' : 'Getting Started',
      icon: '🚀',
      faqs: [
        {
          question: language === 'de' 
            ? 'Wie funktioniert MieteNow?' 
            : 'How does MieteNow work?',
          answer: language === 'de'
            ? 'MieteNow ist eine intelligente Plattform, die dir hilft, die perfekte Wohnung in Berlin zu finden. Unser KI-gestütztes System durchsucht automatisch alle verfügbaren Wohnungsanzeigen und kontaktiert Vermieter in deinem Namen. Du erhältst täglich personalisierte Vorschläge basierend auf deinen Kriterien und kannst direkt mit interessanten Angeboten in Kontakt treten.'
            : 'MieteNow is an intelligent platform that helps you find the perfect apartment in Berlin. Our AI-powered system automatically searches all available apartment listings and contacts landlords on your behalf. You receive daily personalized suggestions based on your criteria and can directly get in touch with interesting offers.'
        },
        {
          question: language === 'de'
            ? 'Wie erstelle ich mein Profil?'
            : 'How do I create my profile?',
          answer: language === 'de'
            ? 'Die Profilerstellung ist einfach und dauert nur wenige Minuten. Gehe zur Registrierungsseite, gib deine E-Mail-Adresse ein und erstelle ein sicheres Passwort. Anschließend füllst du deine Suchkriterien aus: gewünschte Bezirke, Budget, Zimmeranzahl und besondere Anforderungen. Je detaillierter deine Angaben, desto besser können wir dir passende Wohnungen vorschlagen.'
            : 'Creating your profile is easy and takes only a few minutes. Go to the registration page, enter your email address and create a secure password. Then fill out your search criteria: desired districts, budget, number of rooms and special requirements. The more detailed your information, the better we can suggest suitable apartments for you.'
        },
        {
          question: language === 'de'
            ? 'Welche Pläne gibt es?'
            : 'What plans are available?',
          answer: language === 'de'
            ? 'Wir bieten verschiedene Pläne für unterschiedliche Bedürfnisse: Den kostenlosen Basic-Plan mit limitierten Suchvorgängen, den Premium-Plan mit unbegrenzten Suchen und erweiterten Filtern, sowie den Pro-Plan mit persönlicher Betreuung und Prioritätsunterstützung. Alle Pläne beinhalten unsere KI-gestützte Suche und automatische Benachrichtigungen.'
            : 'We offer different plans for different needs: the free Basic plan with limited searches, the Premium plan with unlimited searches and advanced filters, and the Pro plan with personal support and priority assistance. All plans include our AI-powered search and automatic notifications.'
        }
      ]
    },
    {
      title: language === 'de' ? 'Suche & Filter' : 'Search & Filters',
      icon: '🔍',
      faqs: [
        {
          question: language === 'de'
            ? 'Wie kann ich meine Suchkriterien anpassen?'
            : 'How can I adjust my search criteria?',
          answer: language === 'de'
            ? 'Du kannst deine Suchkriterien jederzeit in deinem Profil anpassen. Gehe zu den Einstellungen und ändere Bezirke, Budget, Zimmeranzahl oder besondere Anforderungen. Änderungen werden sofort wirksam und beeinflussen deine täglichen Vorschläge. Du kannst auch temporäre Suchkriterien für spezielle Anlässe festlegen.'
            : 'You can adjust your search criteria at any time in your profile. Go to settings and change districts, budget, number of rooms or special requirements. Changes take effect immediately and influence your daily suggestions. You can also set temporary search criteria for special occasions.'
        },
        {
          question: language === 'de'
            ? 'Warum erhalte ich keine passenden Vorschläge?'
            : 'Why am I not receiving suitable suggestions?',
          answer: language === 'de'
            ? 'Wenn du keine passenden Vorschläge erhältst, kann das verschiedene Gründe haben: Dein Budget ist möglicherweise zu niedrig für die gewünschten Bezirke, deine Kriterien sind zu spezifisch oder es gibt aktuell wenige verfügbare Wohnungen. Wir empfehlen, deine Suchkriterien zu erweitern oder dein Budget anzupassen. Unser Support-Team hilft dir gerne bei der Optimierung.'
            : 'If you are not receiving suitable suggestions, this can have various reasons: your budget might be too low for the desired districts, your criteria are too specific or there are currently few available apartments. We recommend expanding your search criteria or adjusting your budget. Our support team is happy to help you optimize.'
        }
      ]
    },
    {
      title: language === 'de' ? 'Kontakt & Kommunikation' : 'Contact & Communication',
      icon: '💬',
      faqs: [
        {
          question: language === 'de'
            ? 'Wie kontaktiere ich Vermieter?'
            : 'How do I contact landlords?',
          answer: language === 'de'
            ? 'MieteNow erleichtert den Kontakt zu Vermietern erheblich. Wenn dir eine Wohnung gefällt, kannst du direkt über unsere Plattform eine Nachricht an den Vermieter senden. Wir stellen sicher, dass deine Nachricht professionell und vollständig ist. Du erhältst Benachrichtigungen über Antworten und kannst den gesamten Kommunikationsverlauf in deinem Dashboard verfolgen.'
            : 'MieteNow makes contacting landlords much easier. If you like an apartment, you can send a message directly to the landlord through our platform. We ensure your message is professional and complete. You receive notifications about responses and can track the entire communication history in your dashboard.'
        },
        {
          question: language === 'de'
            ? 'Wie kann ich den Support kontaktieren?'
            : 'How can I contact support?',
          answer: language === 'de'
            ? 'Unser Support-Team ist für dich da! Du kannst uns über den Live-Chat auf der Website erreichen, eine E-Mail an support@mietenow.de senden oder uns unter +49 30 123 456 78 anrufen. Wir antworten normalerweise innerhalb von 24 Stunden und helfen dir gerne bei allen Fragen rund um deine Wohnungssuche.'
            : 'Our support team is there for you! You can reach us via live chat on the website, send an email to support@mietenow.de or call us at +49 30 123 456 78. We usually respond within 24 hours and are happy to help you with all questions about your apartment search.'
        }
      ]
    },
    {
      title: language === 'de' ? 'Technische Probleme' : 'Technical Issues',
      icon: '⚙️',
      faqs: [
        {
          question: language === 'de'
            ? 'Die App lädt nicht richtig - was kann ich tun?'
            : 'The app is not loading properly - what can I do?',
          answer: language === 'de'
            ? 'Bei technischen Problemen empfehlen wir folgende Schritte: 1) Aktualisiere die Seite (F5), 2) Lösche den Browser-Cache, 3) Versuche es mit einem anderen Browser, 4) Überprüfe deine Internetverbindung. Falls das Problem weiterhin besteht, kontaktiere unseren Support mit einer detaillierten Beschreibung des Problems.'
            : 'For technical issues, we recommend the following steps: 1) Refresh the page (F5), 2) Clear browser cache, 3) Try a different browser, 4) Check your internet connection. If the problem persists, contact our support with a detailed description of the issue.'
        },
        {
          question: language === 'de'
            ? 'Ich kann mich nicht einloggen - was ist das Problem?'
            : 'I cannot log in - what is the problem?',
          answer: language === 'de'
            ? 'Login-Probleme können verschiedene Ursachen haben. Überprüfe zunächst, ob deine E-Mail-Adresse und dein Passwort korrekt sind. Falls du dein Passwort vergessen hast, nutze die "Passwort vergessen"-Funktion. Stelle sicher, dass dein Konto aktiviert ist (überprüfe deine E-Mails). Bei anhaltenden Problemen kontaktiere unseren Support.'
            : 'Login problems can have various causes. First check if your email address and password are correct. If you forgot your password, use the "Forgot password" function. Make sure your account is activated (check your emails). For persistent problems, contact our support.'
        }
      ]
    }
  ]

  const filteredFaqs = faqCategories

  return (
    <div className="min-h-screen">
      <Header />
      
      <main className="min-h-screen">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 py-20">
          <div className="container-custom">
            <div className="text-center max-w-4xl mx-auto">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
                {language === 'de' ? 'Hilfezentrum' : 'Help Center'}
              </h1>
              <p className="text-xl text-gray-300 mb-8">
                {language === 'de' 
                  ? 'Finde Antworten auf deine Fragen und lerne, wie du das Beste aus MieteNow herausholst'
                  : 'Find answers to your questions and learn how to get the most out of MieteNow'
                }
              </p>
            </div>
          </div>
        </section>


        {/* FAQ Categories */}
        <section className="py-20 bg-gray-50">
          <div className="container-custom">
            <div className="max-w-4xl mx-auto">
              {filteredFaqs.map((category, categoryIndex) => (
                <div key={categoryIndex} className="mb-12">
                  <div className="flex items-center gap-3 mb-6">
                    <span className="text-2xl">{category.icon}</span>
                    <h2 className="text-2xl font-bold text-gray-900">{category.title}</h2>
                  </div>
                  
                  <div className="space-y-4">
                    {category.faqs.map((faq, faqIndex) => (
                      <div key={faqIndex} className="bg-white rounded-xl shadow-lg">
                        <button
                          onClick={() => setOpenFaq(openFaq === faqIndex ? null : faqIndex)}
                          className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                        >
                          <span className="font-semibold text-gray-900">{faq.question}</span>
                          {openFaq === faqIndex ? (
                            <ChevronUp className="w-5 h-5 text-gray-500" />
                          ) : (
                            <ChevronDown className="w-5 h-5 text-gray-500" />
                          )}
                        </button>
                        {openFaq === faqIndex && (
                          <div className="px-6 pb-4">
                            <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Contact Support */}
        <section className="py-20 bg-white">
          <div className="container-custom">
            <div className="max-w-2xl mx-auto text-center">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                {language === 'de' ? 'Brauchst du weitere Hilfe?' : 'Need more help?'}
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                {language === 'de' 
                  ? 'Unser Support-Team steht dir gerne zur Verfügung. Kontaktiere uns über den Live-Chat.'
                  : 'Our support team is happy to help you. Contact us via live chat.'
                }
              </p>
              
              <div className="bg-blue-50 rounded-xl p-8">
                <MessageCircle className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {language === 'de' ? 'Live-Chat' : 'Live Chat'}
                </h3>
                <p className="text-gray-600 mb-6">
                  {language === 'de' 
                    ? 'Sofortige Hilfe von unserem Support-Team'
                    : 'Instant help from our support team'
                  }
                </p>
                <button 
                  onClick={() => {
                    // Ouvrir Crisp chat
                    if (typeof window !== 'undefined' && (window as any).$crisp) {
                      (window as any).$crisp.push(['do', 'chat:open'])
                    } else {
                      // Fallback si Crisp n'est pas chargé
                      alert(language === 'de' ? 'Chat wird geöffnet...' : 'Opening chat...')
                    }
                  }}
                  className="bg-blue-600 text-white px-8 py-4 rounded-lg hover:bg-blue-700 transition-colors text-lg font-semibold"
                >
                  {language === 'de' ? 'Chat starten' : 'Start Chat'}
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
