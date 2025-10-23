'use client'

export const dynamic = 'force-dynamic'

import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { useTranslation } from '@/hooks/useTranslation'

export default function CookiesPage() {
  const { t, language } = useTranslation()

  return (
    <div className="min-h-screen">
      <Header />
      
      <main className="min-h-screen">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 py-20">
          <div className="container-custom">
            <div className="text-center max-w-4xl mx-auto">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
                {language === 'de' ? 'Cookie-Richtlinie' : 'Cookie Policy'}
              </h1>
              <p className="text-xl text-gray-300 mb-8">
                {language === 'de' 
                  ? 'Informationen über die Verwendung von Cookies auf MieteNow'
                  : 'Information about the use of cookies on MieteNow'
                }
              </p>
            </div>
          </div>
        </section>

        {/* Content */}
        <section className="py-20 bg-white">
          <div className="container-custom">
            <div className="max-w-4xl mx-auto">
              <div className="bg-white rounded-xl shadow-lg p-8">
                <div className="prose prose-lg max-w-none">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">
                    {language === 'de' ? 'Was sind Cookies?' : 'What are Cookies?'}
                  </h2>
                  
                  <div className="space-y-4 text-gray-700">
                    <p>{language === 'de' 
                      ? 'Cookies sind kleine Textdateien, die auf Ihrem Gerät gespeichert werden, wenn Sie unsere Website besuchen. Sie helfen uns dabei, Ihre Präferenzen zu speichern und Ihre Erfahrung auf unserer Website zu verbessern.'
                      : 'Cookies are small text files that are stored on your device when you visit our website. They help us save your preferences and improve your experience on our website.'
                    }</p>
                  </div>

                  <h2 className="text-2xl font-bold text-gray-900 mb-6 mt-8">
                    {language === 'de' ? 'Welche Cookies verwenden wir?' : 'What cookies do we use?'}
                  </h2>
                  
                  <div className="space-y-4 text-gray-700">
                    <h3 className="text-xl font-semibold text-gray-900">
                      {language === 'de' ? 'Notwendige Cookies' : 'Necessary Cookies'}
                    </h3>
                    <p>{language === 'de' 
                      ? 'Diese Cookies sind für das Funktionieren der Website unerlässlich. Sie ermöglichen grundlegende Funktionen wie Sicherheit, Netzwerkmanagement und Zugänglichkeit.'
                      : 'These cookies are essential for the functioning of the website. They enable basic functions such as security, network management and accessibility.'
                    }</p>
                    
                    <h3 className="text-xl font-semibold text-gray-900">
                      {language === 'de' ? 'Funktionale Cookies' : 'Functional Cookies'}
                    </h3>
                    <p>{language === 'de' 
                      ? 'Diese Cookies ermöglichen es der Website, erweiterte Funktionalität und Personalisierung bereitzustellen. Sie können von uns oder von Drittanbietern gesetzt werden.'
                      : 'These cookies enable the website to provide enhanced functionality and personalization. They may be set by us or by third parties.'
                    }</p>
                    
                    <h3 className="text-xl font-semibold text-gray-900">
                      {language === 'de' ? 'Analytische Cookies' : 'Analytical Cookies'}
                    </h3>
                    <p>{language === 'de' 
                      ? 'Diese Cookies helfen uns zu verstehen, wie Besucher mit der Website interagieren, indem sie Informationen anonym sammeln und melden.'
                      : 'These cookies help us understand how visitors interact with the website by collecting and reporting information anonymously.'
                    }</p>
                  </div>

                  <h2 className="text-2xl font-bold text-gray-900 mb-6 mt-8">
                    {language === 'de' ? 'Cookie-Verwaltung' : 'Cookie Management'}
                  </h2>
                  
                  <div className="space-y-4 text-gray-700">
                    <p>{language === 'de' 
                      ? 'Sie können Ihre Cookie-Einstellungen jederzeit in Ihrem Browser ändern. Die meisten Browser akzeptieren Cookies automatisch, aber Sie können die Einstellungen so ändern, dass Cookies blockiert werden.'
                      : 'You can change your cookie settings at any time in your browser. Most browsers accept cookies automatically, but you can change the settings to block cookies.'
                    }</p>
                    
                    <p>{language === 'de' 
                      ? 'Bitte beachten Sie, dass das Blockieren bestimmter Cookies die Funktionalität unserer Website beeinträchtigen kann.'
                      : 'Please note that blocking certain cookies may affect the functionality of our website.'
                    }</p>
                  </div>

                  <h2 className="text-2xl font-bold text-gray-900 mb-6 mt-8">
                    {language === 'de' ? 'Drittanbieter-Cookies' : 'Third-Party Cookies'}
                  </h2>
                  
                  <div className="space-y-4 text-gray-700">
                    <p>{language === 'de' 
                      ? 'Unsere Website kann Cookies von Drittanbietern verwenden, um Funktionen wie Social Media-Integration, Analytics und Werbung bereitzustellen.'
                      : 'Our website may use third-party cookies to provide features such as social media integration, analytics and advertising.'
                    }</p>
                  </div>

                  <h2 className="text-2xl font-bold text-gray-900 mb-6 mt-8">
                    {language === 'de' ? 'Ihre Rechte' : 'Your Rights'}
                  </h2>
                  
                  <div className="space-y-4 text-gray-700">
                    <p>{language === 'de' 
                      ? 'Sie haben das Recht, der Verwendung von Cookies zu widersprechen. Sie können auch jederzeit bereits gesetzte Cookies löschen. Weitere Informationen finden Sie in unserer Datenschutzerklärung.'
                      : 'You have the right to object to the use of cookies. You can also delete already set cookies at any time. For more information, please see our privacy policy.'
                    }</p>
                  </div>

                  <h2 className="text-2xl font-bold text-gray-900 mb-6 mt-8">
                    {language === 'de' ? 'Kontakt' : 'Contact'}
                  </h2>
                  
                  <div className="space-y-4 text-gray-700">
                    <p>{language === 'de' 
                      ? 'Wenn Sie Fragen zu unserer Cookie-Richtlinie haben, können Sie uns unter der folgenden E-Mail-Adresse kontaktieren:'
                      : 'If you have questions about our cookie policy, you can contact us at the following email address:'
                    }</p>
                    <p><strong>E-Mail:</strong> privacy@mietenow.de</p>
                  </div>

                  <div className="mt-8 p-4 bg-gray-100 rounded-lg">
                    <p className="text-sm text-gray-600">
                      {language === 'de' 
                        ? 'Stand: Januar 2024'
                        : 'Status: January 2024'
                      }
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
